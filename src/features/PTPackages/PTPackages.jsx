import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router";

import toast from "react-hot-toast";

import { stripePromise } from "../../utils/stripe";

import {
    Elements
} from "@stripe/react-stripe-js";

import CheckoutForm
    from "../Payment/CheckoutForm";


import {
    getPtPackageTypes,
    getTrainers,
    getAvailableTrainers,
    purchasePtPackage,
    getCustomerPackages,
    deletePendingPackage
}
from "./ptPackagesApi";


import {
    getMyPayments,
    continuePayment,
    deletePayment
}
from "../Payment/paymentApi";


import {
    waitFor
}
from "../../utils/waitFor";


import styles from "./PTPackages.module.css";






function formatPrice(item){

    return new Intl.NumberFormat(
        "en-EG",
        {
            style: "currency",
            currency: item.currency || "egp"
        }
    ).format(
        (item.priceCents || 0) / 100
    );

}



function TrainerPhoto({ trainer }){

    const [imgFailed,setImgFailed] = useState(false);

    return (

        <div className={styles.trainerPhoto}>

            {

                trainer.photo_url && !imgFailed

                ? (

                    <img

                        src={trainer.photo_url}

                        alt={trainer.full_name}

                        onError={() =>
                            setImgFailed(true)
                        }

                    />

                )

                : (

                    <i
                        className="fa-regular fa-user"
                        style={{ color: "rgb(255, 212, 59)" }}
                    ></i>

                )

            }

        </div>

    );

}



export default function PTPackages(){


    const navigate = useNavigate();


    const [packages,setPackages] = useState([]);

    const [trainers,setTrainers] = useState([]);

    const [selectedTrainer,setSelectedTrainer] = useState(null);

    const [myPackages,setMyPackages] = useState([]);

    const [loading,setLoading] = useState(true);

    const [clientSecret,setClientSecret] = useState(null);

    const [pendingPkgId,setPendingPkgId] = useState(null);

    const [purchasing,setPurchasing] = useState(null);

    const [availableTrainerIds,setAvailableTrainerIds] = useState(null);



    useEffect(()=>{

        loadData();

    },[]);




    async function loadData(){

        try{


            const available =
                await getPtPackageTypes();


            setPackages(available);



            const availableTrainers =
                await getTrainers();


            setTrainers(availableTrainers);


            try {

                const trainersWithSlots =
                    await getAvailableTrainers();


                setAvailableTrainerIds(
                    (
                        Array.isArray(trainersWithSlots)
                            ? trainersWithSlots
                            : []
                    )
                        .map(t => t?.id)
                        .filter(Boolean)
                );

            }
            catch {

                // Leave availableTrainerIds as null — no warnings shown.

            }



            const customerPackages =
                await getCustomerPackages();


            setMyPackages(customerPackages);



        }
        catch(error){


            toast.error(
                "Unable to load PT packages"
            );


        }
        finally{


            setLoading(false);


        }

    }




    async function purchase(session){

        try{


            const result =
                await purchasePtPackage(
                    session.id,
                    selectedTrainer.id
                );


            if(
                result.clientSecret
            ){

                setPendingPkgId(
                    result.packageId ||
                    null
                );

                setPurchasing({
                    name: session.name,
                    sessions: session.sessions,
                    priceCents: session.priceCents,
                    currency: session.currency || "egp",
                    trainerName: selectedTrainer.full_name
                });

                setClientSecret(
                    result.clientSecret
                );

            }


        }
        catch(error){


            toast.error(
                error.response?.data?.message ||
                "Purchase failed"
            );


        }

    }




    function handlePaymentSuccess(){

        setClientSecret(null);

        toast.success(
            "Payment succeeded! Package activated."
        );

        // The webhook → operations consumer activates the package a moment
        // after the card is confirmed. Poll until our package actually flips
        // to ACTIVE, then refresh in place — no page reload needed.
        waitFor(async () => {

            if(!pendingPkgId) return true;

            const myPackages =
                await getCustomerPackages();

            const updated =
                myPackages.find(
                    pkg =>
                        pkg.id === pendingPkgId
                );

            return (
                updated &&
                updated.status === "ACTIVE"
            );

        }).then((activated) => {

            // If the webhook never arrived (e.g. the local forwarder was
            // down), reconcile through the resume endpoint: it sees the
            // Stripe intent already succeeded, marks the payment paid and
            // re-publishes the status so operations activates the package.
            if(
                !activated &&
                pendingPkgId
            ){

                return reconcilePendingPayment(
                    pendingPkgId
                ).then(() =>
                    waitFor(async () => {

                        const myPackages =
                            await getCustomerPackages();

                        const updated =
                            myPackages.find(
                                pkg =>
                                    pkg.id === pendingPkgId
                            );

                        return (
                            updated &&
                            updated.status === "ACTIVE"
                        );

                    })
                );

            }

            return true;

        }).then(() => {

            setPendingPkgId(null);

            loadData();

        });

    }


    async function reconcilePendingPayment(pkgId){

        try{

            const payments =
                await getMyPayments();


            const payment =
                payments.find(
                    p =>
                        p.reference_type === "pt_package" &&
                        p.reference_id === pkgId
                );


            if(
                !payment
            ){

                return;

            }


            await continuePayment(
                payment.id
            );


        }
        catch{

            // Best-effort — the next poll / reload will show the truth.

        }

    }


    async function handleCompletePayment(pkg){


        try{


            const payments =
                await getMyPayments();


            const pendingPayment =
                payments.find(
                    payment =>
                        payment.reference_type === "pt_package" &&
                        payment.reference_id === pkg.id &&
                        (
                            payment.status === "processing" ||
                            payment.status === "pending" ||
                            payment.status === "failed"
                        )
                );


            if(
                !pendingPayment
            ){

                toast.error(
                    "No pending payment found for this package"
                );

                return;

            }


            const result =
                await continuePayment(
                    pendingPayment.id
                );


            if(
                result.alreadyPaid
            ){

                toast.success(
                    "This package was already paid"
                );

                loadData();

                return;

            }


            setClientSecret(
                result.clientSecret
            );

            setPendingPkgId(
                pkg.id
            );

            setPurchasing({
                name: `${pkg.packageType} Sessions`,
                sessions: pkg.packageType,
                priceCents: pendingPayment.amount_cents,
                currency: pendingPayment.currency || "egp"
            });


        }
        catch(error){


            toast.error(
                error.response?.data?.message ||
                "Unable to resume payment"
            );


        }

    }


    async function handleDeletePayment(pkg){


        try{


            const payments =
                await getMyPayments();


            const payment =
                payments.find(
                    p =>
                        p.reference_type === "pt_package" &&
                        p.reference_id === pkg.id
                );


            if(
                payment
            ){

                await deletePayment(
                    payment.id
                );

            }
            else{

                // Orphaned pending package — no payment row behind it.
                await deletePendingPackage(
                    pkg.id
                );

            }


            toast.success(
                "Payment deleted"
            );


            loadData();


        }
        catch(error){


            toast.error(
                error.response?.data?.message ||
                "Unable to delete payment"
            );


        }

    }




    if(loading)

        return (

            <div className={styles.loading}>

                Loading PT Packages...

            </div>

        );




    return (

        <div className={styles.page}>


            <div className={styles.header}>


                <p className={styles.eyebrow}>
                    HyperScale Fitness Platform
                </p>


                <h1>
                    Personal Training
                </h1>



                <p className={styles.subtitle}>
                    Manage your PT sessions and packages.
                </p>


            </div>




            {/* MY PACKAGES */}


            <section>


                <h2>
                    My PT Packages
                </h2>



                {

                    myPackages.length === 0


                    ?


                    <div className={styles.emptyCard}>


                        <h3>
                            No PT Package
                        </h3>


                        <p>
                            Purchase a package to start
                            your personal training sessions.
                        </p>


                    </div>


                    :



                    <div className={styles.grid}>


                        {

                            myPackages.map(pkg=>(


                                <div
                                    key={pkg.id}
                                    className={styles.card}
                                >



                                    <div className={styles.sessions}>

                                        {pkg.packageType}

                                        <span>
                                            Sessions
                                        </span>


                                    </div>



                                    <p className={styles.trainerLabel}>

                                        with{" "}

                                        {

                                            trainers.find(
                                                t =>
                                                    t.id === pkg.trainerId
                                            )?.full_name ||

                                            "your trainer"

                                        }

                                    </p>




                                    <p>

                                        Remaining:

                                        {

                                            pkg.sessionsTotal -
                                            pkg.sessionsUsed

                                        }

                                    </p>




                                    <p>

                                        Used:

                                        {pkg.sessionsUsed}

                                        /

                                        {pkg.sessionsTotal}


                                    </p>




                                    <span className={styles.status}>

                                        {pkg.status}

                                    </span>



                                    <button
                                        className={styles.chatButton}
                                        onClick={() =>
                                            navigate(`/chat/${pkg.trainerId}`)
                                        }
                                    >

                                        Chat with Trainer

                                    </button>



                                    {
                                        pkg.status === "PENDING_PAYMENT" && (

                                            <div className={styles.cardActions}>

                                                <button
                                                    className={styles.resumeButton}
                                                    onClick={() =>
                                                        handleCompletePayment(pkg)
                                                    }
                                                >

                                                    Complete Payment

                                                </button>

                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() =>
                                                        handleDeletePayment(pkg)
                                                    }
                                                >

                                                    Delete

                                                </button>

                                            </div>

                                        )
                                    }

{
                                            pkg.status === "ACTIVE" ? (

                                            <button
                                                className={styles.bookButton}
                                                onClick={() =>
                                                    navigate(
                                                        "/booking",
                                                        {
                                                            state: {
                                                                ptPackageId:
                                                                    pkg.id
                                                            }
                                                        }
                                                    )
                                                }
                                            >

                                                Book Session

                                            </button>

                                        ) : (

                                            <button disabled>

                                                Book Session
                                                <br/>
                                                (Coming Soon)

                                            </button>

                                        )
                                    }

                                </div>


                            ))

                        }


                    </div>


                }


            </section>




            {/* CHOOSE YOUR TRAINER */}


            {
                !selectedTrainer ? (


                    <section>


                        <h2>
                            Choose Your Trainer
                        </h2>


                        <p className={styles.sectionHint}>
                            Pick the trainer you want to train
                            with, then choose a package.
                        </p>


                        <div className={styles.grid}>


                            {

                                trainers.map(trainer=>(


                                    <div

                                        key={trainer.id}

                                        className={styles.trainerCard}

                                    >


                                        <TrainerPhoto trainer={trainer} />


                                        <h4 className={styles.trainerName}>

                                            {trainer.full_name}

                                        </h4>


                                        <p className={styles.trainerBio}>

                                            {trainer.bio}

                                        </p>


                                        {
                                            availableTrainerIds !== null

                                            &&

                                            !availableTrainerIds.includes(trainer.id)

                                            &&

                                            <p className={styles.noSlotsWarning}>

                                                This trainer has no available slots for now

                                            </p>
                                        }


                                        <button

                                            className={styles.chooseButton}

                                            onClick={() =>
                                                setSelectedTrainer(trainer)
                                            }

                                        >

                                            Choose

                                        </button>


                                    </div>


                                ))

                            }


                        </div>


                    </section>


                ) : (


                    <section>


                        <div className={styles.selectedBanner}>

                            <TrainerPhoto trainer={selectedTrainer} />

                            <div>

                                <h4 className={styles.trainerName}>

                                    {selectedTrainer.full_name}

                                </h4>

                                <p className={styles.trainerBio}>

                                    {selectedTrainer.bio}

                                </p>

                            </div>

                            <button

                                className={styles.changeButton}

                                onClick={() =>
                                    setSelectedTrainer(null)
                                }

                            >

                                Change Trainer

                            </button>

                        </div>


                    </section>


                )
            }


            {/* AVAILABLE PACKAGES */}


            {
                selectedTrainer && (


                    <section>


                        <h2>
                            Available Packages
                        </h2>


                        <p className={styles.sectionHint}>
                            Packages for training with
                            {selectedTrainer.full_name}.
                        </p>


                        <div className={styles.grid}>


                            {

                                packages.map(pkg=>(



                                    <div

                                        key={pkg.id}

                                        className={styles.card}

                                    >



                                        <div className={styles.sessions}>

                                            {pkg.sessions}

                                            <span>
                                                Sessions
                                            </span>


                                        </div>




                                        <h4 className={styles.sessionName}>

                                            {pkg.name}

                                        </h4>

                                        <p className={styles.sessionPrice}>

                                            {formatPrice(pkg)}

                                        </p>

                                        <p>

                                            Personal training sessions
                                            with {selectedTrainer.full_name}.

                                        </p>




                                        <button

                                            onClick={() =>
                                                purchase(pkg)
                                            }

                                        >

                                            Purchase

                                        </button>




                                    </div>



                                ))


                            }


                        </div>


                    </section>


                )
            }




            {
                clientSecret && (


                    <div className={styles.formCard}>


                        <h3>
                            Complete Payment
                        </h3>


                        {
                            purchasing && (

                                <div className={styles.totalRow}>

                                    <div>

                                        <span>
                                            {purchasing.name}
                                        </span>

                                        {
                                            purchasing.trainerName && (

                                                <small>
                                                    with {purchasing.trainerName}
                                                </small>

                                            )
                                        }

                                    </div>

                                    <strong>
                                        {formatPrice(purchasing)}
                                    </strong>

                                </div>

                            )
                        }


                        <p>
                            Enter your card details to activate
                            your PT package.
                        </p>


                        <Elements stripe={stripePromise} options={{ clientSecret }}>

                            <CheckoutForm
                                clientSecret={clientSecret}
                                onSuccess={handlePaymentSuccess}
                            />

                        </Elements>


                    </div>


                )
            }




            {/* NAVIGATION */}


            <div className={styles.navigation}>


                <button

                    className={styles.backButton}

                    onClick={() =>
                        navigate("/customerHomePage")
                    }

                >

                    ← Back to Dashboard


                </button>



            </div>



        </div>


    );

}