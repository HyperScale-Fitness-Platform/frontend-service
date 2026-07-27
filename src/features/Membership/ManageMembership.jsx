import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import {
    getCurrentMembership,
    freezeMembership,
    unfreezeMembership,
    cancelFreeze
} from "./membershipApi";

import styles from "./ManageMembership.module.css";

function getErrorMessage(error, fallback = "Something went wrong") {
    const message = error?.response?.data?.message;

    if (Array.isArray(message)) {
        return message.join(". ");
    }

    if (typeof message === "string") {
        return message;
    }

    return fallback;
}


export default function ManageMembership() {

    const navigate = useNavigate();

    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");


    useEffect(() => {

        loadMembership();

    }, []);



    async function loadMembership() {

        try {

            const data =
                await getCurrentMembership();

            setMembership(data);

        }
        catch (error) {

            toast.error(
                getErrorMessage(error, "Unable to load membership")
            );

        }
        finally {

            setLoading(false);

        }

    }


    async function handleFreeze() {

        if (!startDate || !endDate) {
            toast.error("Please select a start and end date");
            return;
        }

        try {

            await freezeMembership(
                membership.id,
                startDate,
                endDate

            );

            toast.success("Membership frozen successfully");

            setStartDate("");
            setEndDate("");

            await loadMembership();

        } catch (error) {

            toast.error(
                getErrorMessage(error, "Unable to freeze membership")
            );

        }

    }



    async function handleUnfreeze() {

        try {

            await unfreezeMembership(
                membership.id
            );


            toast.success(
                "Membership activated again"
            );


            loadMembership();

        }
        catch (error) {

            console.error(
                "Unfreeze error:",
                error.response?.data
            );


            toast.error(
                getErrorMessage(error, "Unable to unfreeze membership")
            );

        }
    }

    async function handleCancelFreeze(freezeId) {

        try {

            await cancelFreeze(
                membership.id,
                freezeId
            );


            toast.success(
                "Freeze period cancelled successfully"
            );


            await loadMembership();


        } catch (error) {


            toast.error(
                getErrorMessage(
                    error,
                    "Unable to cancel freeze"
                )
            );

        }

    }



    const freezeDaysUsed =
        membership?.freezeDaysUsed ?? 0;


    const freezeDaysRemaining =
        membership?.freezeDaysRemaining ?? 0;


    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const futureFreeze =
        membership?.freezes?.find(freeze => {

            const start =
                new Date(freeze.startDate);

            start.setHours(0, 0, 0, 0);


            return start > today;

        });




    if (loading)
        return (
            <div className={styles.page}>
                <h2>Loading membership...</h2>
            </div>
        );



    if (!membership)

        return (

            <div className={styles.page}>

                <div className={styles.emptyCard}>

                    <h1>
                        No Active Membership
                    </h1>

                    <p>
                        Subscribe to a plan to unlock gym services.
                    </p>


                    <button
                        onClick={() =>
                            navigate("/membership")
                        }
                    >
                        View Plans
                    </button>


                </div>

            </div>

        );




    return (

        <div className={styles.page}>


            <div className={styles.container}>


                <div className={styles.header}>

                    <p className={styles.eyebrow}>
                        HyperScale Fitness Platform
                    </p>


                    <h1>
                        Manage Membership
                    </h1>


                    <p className={styles.subtitle}>
                        Control your membership and benefits.
                    </p>

                </div>





                <div className={styles.card}>


                    <div className={styles.top}>


                        <div>

                            <h2>
                                {membership.plan.name}
                            </h2>


                            <p>
                                {membership.plan.price} EGP
                            </p>

                        </div>



                        <span
                            className={
                                membership.status === "ACTIVE"
                                    ?
                                    styles.active
                                    :
                                    styles.frozen
                            }
                        >

                            {membership.status}

                        </span>


                    </div>




                    <div className={styles.info}>

                        <div>

                            <label>
                                Freeze Days
                            </label>

                            <p>
                                {freezeDaysUsed} / {membership.plan.freezeDays}
                            </p>

                            <div>

                                <label>
                                    Freeze Days Remaining
                                </label>

                                <p>
                                    {freezeDaysRemaining}
                                </p>

                            </div>

                        </div>


                        <div>

                            <label>
                                Started
                            </label>

                            <p>
                                {new Date(
                                    membership.startDate
                                ).toLocaleDateString()}
                            </p>

                        </div>




                        <div>

                            <label>
                                Ends
                            </label>

                            <p>
                                {new Date(
                                    membership.endDate
                                ).toLocaleDateString()}
                            </p>

                        </div>


                    </div>





                    <div className={styles.freezeContainer}>


                        {
                            futureFreeze && (

                                <button
                                    className={styles.secondary}
                                    onClick={() =>
                                        handleCancelFreeze(
                                            futureFreeze.id
                                        )
                                    }
                                >
                                    Cancel Scheduled Freeze
                                </button>

                            )
                        }



                        {
                            membership.status === "ACTIVE"

                            &&

                            !futureFreeze

                            &&

                            (

                                <>

                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={
                                            e => setStartDate(e.target.value)
                                        }
                                        className={styles.input}
                                    />


                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={
                                            e => setEndDate(e.target.value)
                                        }
                                        className={styles.input}
                                    />


                                    <button
                                        className={styles.button}
                                        onClick={handleFreeze}
                                        disabled={
                                            freezeDaysRemaining <= 0
                                        }
                                    >

                                        {
                                            freezeDaysRemaining <= 0
                                                ?
                                                "No Freeze Days Remaining"
                                                :
                                                "Freeze Membership"
                                        }

                                    </button>

                                </>

                            )

                        }




                        {
                            membership.status === "FROZEN"

                            &&

                            <button
                                className={styles.button}
                                onClick={handleUnfreeze}
                            >

                                Unfreeze Membership

                            </button>

                        }


                    </div>

                </div>




                {
                    membership.plan.benefits &&
                    membership.plan.benefits.length > 0 && (

                        <div className={styles.card}>

                            <h2>
                                Membership Benefits
                            </h2>


                            <div className={styles.benefits}>


                                {
                                    membership.plan.benefits.map(
                                        benefit => (

                                            <div
                                                key={benefit.id}
                                                className={styles.benefit}
                                            >

                                                ✓ {benefit.benefitName}

                                                {
                                                    benefit.benefitValue &&
                                                    (
                                                        <span>
                                                            : {benefit.benefitValue}
                                                        </span>
                                                    )
                                                }

                                            </div>

                                        )
                                    )

                                }


                            </div>


                        </div>

                    )
                }



                <div className={styles.navigation}>


                    <button
                        className={styles.button}
                        onClick={() => navigate("/membership")}
                    >
                        View Available Plans
                    </button>



                    <button
                        className={styles.secondary}
                        onClick={() =>
                            navigate("/customerHomePage")
                        }
                    >
                        Back Dashboard
                    </button>


                </div>



            </div>


        </div>

    );

}