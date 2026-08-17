import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import CreatePlan from "./components/CreatePlan";
import AddBenefit from "./components/AddBenefit";

import { getAdminPlans, deletePlan } from "./membershipAdminApi";
import styles from "../AdminBooking/Booking.module.css";


const OPTIONS = [
    {
        key: "plans",
        title: "Create Plan",
        description: "Create membership plans",
        icon: "📋"
    },

    {
        key: "benefits",
        title: "Add Benefits",
        description: "Assign benefits to plans",
        icon: "🎁"
    }
];


export default function AdminMembership() {

    const [activePanel, setActivePanel] = useState(null);

    const [plans, setPlans] = useState([]);

    const [deletingId, setDeletingId] = useState(null);



    async function loadPlans() {

        try {

            const data = await getAdminPlans();

            setPlans(data);

        }
        catch (error) {

            console.log(error);

        }

    }



    async function handleDeletePlan(plan) {

        const confirmed =
            window.confirm(
                `Delete "${plan.name}"? This removes the plan and cancels the membership of every customer subscribed to it.`
            );

        if (!confirmed) {

            return;

        }

        setDeletingId(plan.id);

        try {

            await deletePlan(plan.id);

            toast.success(
                "Plan deleted"
            );

            setPlans(prev =>
                prev.filter(p =>
                    p.id !== plan.id
                )
            );

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to delete plan"
            );

        }
        finally {

            setDeletingId(null);

        }

    }



    useEffect(() => {

        loadPlans();

    }, []);



    return (

        <div className={styles.page}>

            <div className={styles.container}>


                <h1 className={styles.pageTitle}>
                    Membership Administration
                </h1>



                <div className={styles.optionGrid}>


                    {
                        OPTIONS.map(option => (

                            <button

                                key={option.key}

                                className={`${styles.optionCard}
                            ${activePanel === option.key
                                        ?
                                        styles.optionCardActive
                                        :
                                        ""
                                    }`}

                                onClick={() =>
                                    setActivePanel(
                                        activePanel === option.key
                                            ?
                                            null
                                            :
                                            option.key
                                    )
                                }

                            >

                                <span className={styles.optionIcon}>
                                    {option.icon}
                                </span>


                                <span className={styles.optionTitle}>
                                    {option.title}
                                </span>


                                <span className={styles.optionDesc}>
                                    {option.description}
                                </span>


                            </button>

                        ))
                    }


                </div>



                {
                    activePanel === "plans" &&

                    <CreatePlan
                        onCreated={loadPlans}
                    />

                }



                {
                    activePanel === "benefits" &&

                    <AddBenefit
                        plans={plans}
                        onAdded={loadPlans}
                    />

                }





                <div className={styles.card}>


                    <h2>
                        Existing Membership Plans
                    </h2>



                    {
                        plans.length === 0

                            ?

                            <p>
                                No plans created yet.
                            </p>

                            :

                            <div className={styles.grid}>

                                {

                                    plans.map(plan => (

                                        <div
                                            key={plan.id}
                                            className={styles.card}
                                        >

                                            <h3 className={styles.cardTitle}>
                                                {plan.name}
                                            </h3>


                                            <p className={styles.cardMeta}>
                                                {plan.price} EGP
                                            </p>


                                            <p className={styles.cardMeta}>
                                                Duration:
                                                {" "}
                                                {plan.durationInDays} days
                                            </p>


                                            <p className={styles.cardMeta}>
                                                Freezes:
                                                {" "}
                                                {plan.freezeDays} days
                                            </p>


                                            <div className={styles.fieldLabel}>
                                                Benefits
                                            </div>


                                            {
                                                plan.benefits?.length > 0

                                                    ?

                                                    <ul>

                                                        {
                                                            plan.benefits.map(benefit => (

                                                                <li key={benefit.id}>

                                                                    {benefit.benefitName}
                                                                    :
                                                                    {" "}
                                                                    {benefit.benefitValue}

                                                                </li>

                                                            ))
                                                        }

                                                    </ul>

                                                    :

                                                    <p>
                                                        No benefits added.
                                                    </p>

                                            }


                                            <div className={styles.cardActions}>

                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={() =>
                                                        handleDeletePlan(plan)
                                                    }
                                                    disabled={
                                                        deletingId === plan.id
                                                    }
                                                >

                                                    {
                                                        deletingId === plan.id
                                                            ?
                                                            "Deleting..."
                                                            :
                                                            "Delete Plan"
                                                    }

                                                </button>

                                            </div>


                                        </div>

                                    ))

                                }

                            </div>

                    }


                </div>



            </div>

        </div>

    );

}