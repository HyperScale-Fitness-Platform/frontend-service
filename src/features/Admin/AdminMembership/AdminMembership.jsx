import { useState, useEffect } from "react";

import CreatePlan from "./components/CreatePlan";
import AddBenefit from "./components/AddBenefit";

import { getAdminPlans } from "./membershipAdminApi";
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



    async function loadPlans() {

        try {

            const data = await getAdminPlans();

            setPlans(data);

        }
        catch (error) {

            console.log(error);

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

                            plans.map(plan => (

                                <div key={plan.id}>

                                    <h3>
                                        {plan.name}
                                    </h3>


                                    <p>
                                        {plan.price} EGP
                                    </p>


                                    <p>
                                        Duration:
                                        {" "}
                                        {plan.durationInDays} days
                                    </p>


                                    <p>
                                        Max Freezes:
                                        {" "}
                                        {plan.maxFreezes}
                                    </p>


                                    <h4>
                                        Benefits
                                    </h4>


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


                                </div>

                            ))

                    }


                </div>



            </div>

        </div>

    );

}