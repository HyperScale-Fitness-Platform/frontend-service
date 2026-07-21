import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import {
    getCurrentMembership,
    freezeMembership,
    unfreezeMembership,
} from "./membershipApi";

import styles from "./ManageMembership.module.css";


export default function ManageMembership() {

    const navigate = useNavigate();

    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);


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
                error.response?.data?.message ||
                "Unable to load membership"
            );

        }
        finally {

            setLoading(false);

        }

    }



    async function handleFreeze() {

        try {

            await freezeMembership(
                membership.id,
                5
            );

            toast.success(
                "Membership frozen successfully"
            );

            await loadMembership();

        }

        catch (error) {

            console.error(
                "Freeze error:",
                error.response?.data
            );


            toast.error(
                error.response?.data?.message ||
                "Unable to freeze membership"
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
                error.response?.data?.message ||
                "Unable to unfreeze membership"
            );

        }
    }




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
                                Freezes Used
                            </label>

                            <p>
                                {membership.freezesUsed}
                                /
                                {membership.plan.maxFreezes}
                            </p>

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





                    <div className={styles.actions}>


                        {
                            membership.status === "ACTIVE"

                                ?

                                <button
                                    className={styles.button}
                                    onClick={handleFreeze}
                                    disabled={
                                        membership.freezesUsed >= membership.plan.maxFreezes
                                    }
                                >
                                    {
                                        membership.freezesUsed >= membership.plan.maxFreezes
                                            ?
                                            "No Freezes Remaining"
                                            :
                                            "Freeze Membership"
                                    }
                                </button>


                                :


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