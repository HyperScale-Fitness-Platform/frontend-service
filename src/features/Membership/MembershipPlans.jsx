import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../utils/stripe";
import CheckoutForm from "../Payment/CheckoutForm";
import styles from "./MembershipPlans.module.css";

import {
    getPlans,
    subscribeToPlan,
    getCurrentMembership,
} from "./membershipApi";

import {
    waitFor
} from "../../utils/waitFor";


// Friendly labels for each membership benefit type. Functions receive the
// benefit value so count-based benefits render like "3 PT Sessions".
const BENEFIT_LABELS = {

    PT_SESSIONS: value =>
        `${value} PT Session${value === 1 ? "" : "s"}`,

    FULL_GYM_ACCESS: () =>
        "Full Gym Access",

    GROUP_CLASSES: value =>
        `${value} Group Class${value === 1 ? "" : "es"}`,

    LOCKER_ACCESS: () =>
        "Locker Access",

    SAUNA_ACCESS: () =>
        "Sauna Access",

    WELCOME_GIFT: () =>
        "Welcome Gift",

};

export default function MembershipPlans() {

    const navigate = useNavigate();

    const [plans, setPlans] = useState([]);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState(null);
    const [pendingMembershipId, setPendingMembershipId] = useState(null);

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

            const result = await subscribeToPlan(planId);

            if (result.clientSecret) {
                setPendingMembershipId(result.membershipId ?? null);
                setClientSecret(result.clientSecret);
            }

        }

        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Subscription failed"
            );

        }

    }

    function handlePaymentSuccess() {

        setClientSecret(null);

        toast.success(
            "Payment succeeded! Membership activated."
        );

        // The webhook → operations consumer activates the membership a
        // moment after the card is confirmed. Poll until it flips to
        // ACTIVE, then refresh in place — no page reload needed.
        waitFor(async () => {

            if (!pendingMembershipId) return true;

            const current =
                await getCurrentMembership();

            return (
                current &&
                current.id === pendingMembershipId &&
                current.status === "ACTIVE"
            );

        }).then(() => {

            setPendingMembershipId(null);

            loadData();

        });

    }
    if (loading)
        return <h2 className={styles.loading}>Loading...</h2>;

    return (

        <div className={styles.page}>

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

                                <li>
                                    ✓ Full Gym Access
                                </li>

                                {
                                    plan.benefits?.length > 0
                                    &&
                                    plan.benefits.map(benefit => {

                                        const label =
                                            BENEFIT_LABELS[benefit.benefitName]
                                                ?
                                                BENEFIT_LABELS[benefit.benefitName](benefit.benefitValue)
                                                :
                                                benefit.benefitName;

                                        return (

                                            <li key={benefit.id}>
                                                ✓ {label}
                                            </li>

                                        );

                                    })
                                }

                                <li>
                                    ✓ Freeze Up to {plan.freezeDays} Days
                                </li>

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

            {
                clientSecret && (

                    <div className={styles.formCard}>

                        <h3>Complete Payment</h3>

                        <p>
                            Enter your card details to activate
                            your membership.
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

            <button
                className={styles.backButton}
                onClick={() => navigate("/customerHomePage")}
            >

                ← Back to Dashboard

            </button>

        </div>

    );

}