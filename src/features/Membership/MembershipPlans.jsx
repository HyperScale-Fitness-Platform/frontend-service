import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import styles from "./MembershipPlans.module.css";

import {
    getPlans,
    subscribeToPlan,
    getCurrentMembership,
} from "./membershipApi";

export default function MembershipPlans() {

    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {

        try {

            const plansData = await getPlans();

            setPlans(plansData);

            const current =
                await getCurrentMembership()
                    .catch(() => null);

            setMembership(current);

        }

        finally {

            setLoading(false);

        }

    }

    async function subscribe(planId) {

        try {

            await subscribeToPlan(planId);

            toast.success(
                "Membership activated successfully!"
            );

            loadData();

        }

        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Subscription failed"
            );

        }

    }
    if (loading)
        return <h2 className={styles.loading}>Loading...</h2>;

    return (

        <div className={styles.page}>
            <Toaster
                position="top-center"
            />

            <div className={styles.header}>

                <p className={styles.eyebrow}>
                    HyperScale Fitness Platform
                </p>

                <h1>
                    Choose Your Membership
                </h1>

                <p className={styles.subtitle}>
                    Find the membership that fits your fitness journey.
                </p>

            </div>

            <div className={styles.grid}>

                {

                    plans.map(plan => (

                        <div
                            key={plan.id}
                            className={styles.card}
                        >

                            <h2>

                                {plan.name}

                            </h2>

                            <div className={styles.price}>

                                {plan.price}

                                <span>

                                    EGP

                                </span>

                            </div>

                            <p className={styles.duration}>

                                {plan.durationInDays} Days

                            </p>

                            <ul>

                                <li>✓ Full Gym Access</li>

                                <li>✓ Membership Benefits</li>

                                <li>✓ Locker Access</li>

                            </ul>

                            <button
                                className={styles.button}
                                onClick={() => subscribe(plan.id)}
                            >
                                Subscribe
                            </button>

                        </div>

                    ))

                }

            </div>

            <button
                className={styles.backButton}
                onClick={() => navigate("/customerHomePage")}
            >

                ← Back to Dashboard

            </button>

        </div>

    );

}