import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router";

import toast from "react-hot-toast";


import {
    getPtPackageTypes,
    purchasePtPackage,
    getCustomerPackages,
    getAvailableTrainers
}
    from "./ptPackagesApi";


import styles from "./PTPackages.module.css";



export default function PTPackages() {


    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [myPackages, setMyPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);



    useEffect(() => {

        loadData();

    }, []);




    async function loadData() {

        try {

            const available =
                await getPtPackageTypes();

            setPackages(available);


            const availableTrainers =
                await getAvailableTrainers();

            setTrainers(
                Array.isArray(availableTrainers)
                    ? availableTrainers
                    : []
            );


            const customerPackages =
                await getCustomerPackages();

            setMyPackages(customerPackages);

        }
        catch (error) {

            console.error(
                "PT PACKAGES LOAD ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load PT packages"
            );

        }
        finally {

            setLoading(false);

        }

    }




    async function purchase(type) {

        if (!selectedTrainer) {

            toast.error(
                "Please select a trainer first"
            );

            return;

        }

        try {

            await purchasePtPackage(
                selectedTrainer.id,
                type
            );

            toast.success(
                "PT Package purchased successfully"
            );

            setSelectedTrainer(null);

            loadData();

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Purchase failed"
            );

        }

    }





    if (loading)

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

                                myPackages.map(pkg => (


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
                                            onClick={() =>
                                                navigate(`/chat/${pkg.trainerId}`)
                                            }
                                        >
                                            Chat with Trainer
                                        </button>


                                        <button
                                            onClick={() =>
                                                navigate("/booking", {
                                                    state: {
                                                        selectedSourceType: "package",
                                                        selectedSourceId: pkg.id
                                                    }
                                                })
                                            }
                                        >
                                            Book Session
                                        </button>



                                    </div>


                                ))

                            }


                        </div>


                }


            </section>







            {/* AVAILABLE PACKAGES */}



            <section>

                <h2>
                    {selectedTrainer
                        ? "Choose Your Package"
                        : "Choose Your Trainer"
                    }
                </h2>


                {/* ==========================================
                     STEP 1: SHOW TRAINERS
                    ========================================== */}

                {!selectedTrainer && (

                    <div className={styles.grid}>

                        {
                            trainers.map(trainer => (

                                <div
                                    key={trainer.id}
                                    className={styles.card}
                                >

                                    {/* Trainer photo */}

                                    {
                                        trainer.photoUrl && (

                                            <img
                                                src={trainer.photoUrl}
                                                alt={trainer.fullName}
                                                className={styles.trainerPhoto}
                                            />

                                        )
                                    }


                                    {/* Trainer name */}

                                    <h3>
                                        {trainer.fullName}
                                    </h3>


                                    {/* Trainer bio */}

                                    {
                                        trainer.bio && (

                                            <p>
                                                {trainer.bio}
                                            </p>

                                        )
                                    }


                                    {/* Trainer gender */}

                                    {
                                        trainer.gender && (

                                            <p>
                                                Gender: {trainer.gender}
                                            </p>

                                        )
                                    }


                                    {/* Select trainer */}

                                    <button
                                        onClick={() =>
                                            setSelectedTrainer(trainer)
                                        }
                                    >
                                        Choose Trainer
                                    </button>

                                </div>

                            ))
                        }

                    </div>

                )}


                {/* ==========================================
                    STEP 2: TRAINER SELECTED
                    SHOW PACKAGE TYPES
                    ========================================== */}

                {
                    selectedTrainer && (

                        <div>

                            {/* Back to trainers */}

                            <button
                                className={styles.backButton}
                                onClick={() =>
                                    setSelectedTrainer(null)
                                }
                            >
                                ← Choose another trainer
                            </button>


                            {/* Selected trainer */}

                            <div className={styles.card}>

                                {
                                    selectedTrainer.photoUrl && (

                                        <img
                                            src={selectedTrainer.photoUrl}
                                            alt={selectedTrainer.fullName}
                                            className={styles.trainerPhoto}
                                        />

                                    )
                                }


                                <h3>
                                    {selectedTrainer.fullName}
                                </h3>


                                {
                                    selectedTrainer.bio && (

                                        <p>
                                            {selectedTrainer.bio}
                                        </p>

                                    )
                                }

                            </div>


                            {/* Package types */}

                            <div className={styles.grid}>

                                {
                                    packages.map(pkg => (

                                        <div
                                            key={pkg.type}
                                            className={styles.card}
                                        >

                                            <div className={styles.sessions}>

                                                {pkg.sessions}

                                                <span>
                                                    Sessions
                                                </span>

                                            </div>


                                            <p>
                                                Personal training sessions
                                                with {selectedTrainer.fullName}.
                                            </p>


                                            <button
                                                onClick={() =>
                                                    purchase(pkg.type)
                                                }
                                            >
                                                Purchase
                                            </button>

                                        </div>

                                    ))
                                }

                            </div>

                        </div>

                    )
                }

            </section>







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