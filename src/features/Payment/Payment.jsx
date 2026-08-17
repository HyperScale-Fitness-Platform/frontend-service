import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router";

import toast from "react-hot-toast";

import {
    loadStripe
} from "@stripe/stripe-js";

import {
    Elements
} from "@stripe/react-stripe-js";

import CheckoutForm
    from "./CheckoutForm";


import {
    getMyPayments,
    continuePayment,
    deletePayment,
    getPaymentById
}
from "./paymentApi";


import {
    waitFor
}
from "../../utils/waitFor";


import styles from "./Payment.module.css";


const stripePromise =
    loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    );



function formatPrice(item) {

    return new Intl.NumberFormat(
        "en-EG",
        {
            style: "currency",
            currency: item.currency || "egp"
        }
    ).format(
        (item.amount_cents || 0) / 100
    );

}



export default function Payment() {


    const navigate = useNavigate();


    const [loading, setLoading] = useState(true);

    const [payments, setPayments] = useState([]);

    const [clientSecret, setClientSecret] = useState(null);

    const [resumingPaymentId, setResumingPaymentId] = useState(null);

    const [resumingPayment, setResumingPayment] = useState(null);



    useEffect(() => {

        loadData();

    }, []);



    async function loadData() {

        try {

            const data =
                await getMyPayments();

            setPayments(
                Array.isArray(data) ? data : []
            );

        }
        catch (error) {

            toast.error(
                "Unable to load payments"
            );

        }
        finally {

            setLoading(false);

        }

    }



    async function handleContinue(paymentId) {

        try {

            const result =
                await continuePayment(paymentId);

            if (result.alreadyPaid) {

                toast.success(
                    "This payment was already completed"
                );

                loadData();

                return;

            }

            setClientSecret(
                result.clientSecret
            );

            setResumingPaymentId(
                paymentId
            );

            const payment =
                payments.find(
                    p => p.id === paymentId
                );

            setResumingPayment(
                payment || null
            );

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to resume payment"
            );

        }

    }



    async function handleDelete(paymentId) {

        if (!window.confirm("Delete this payment? It cannot be undone.")) {

            return;

        }

        try {

            await deletePayment(paymentId);

            toast.success(
                "Payment deleted"
            );

            loadData();

        }
        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to delete payment"
            );

        }

    }



    function handlePaymentSuccess() {

        setClientSecret(null);

        toast.success(
            "Payment succeeded!"
        );

        // Poll until the payment row actually flips to succeeded, then
        // refresh in place. If it never flips (e.g. the local Stripe
        // forwarder was down), reconcile through the resume endpoint.
        waitFor(async () => {

            if (!resumingPaymentId) return true;

            const updated =
                await getPaymentById(resumingPaymentId);

            return (
                updated &&
                updated.status === "succeeded"
            );

        }).then((done) => {

            if (!done && resumingPaymentId) {

                return continuePayment(
                    resumingPaymentId
                ).then(() =>
                    waitFor(async () => {

                        const updated =
                            await getPaymentById(resumingPaymentId);

                        return (
                            updated &&
                            updated.status === "succeeded"
                        );

                    })
                );

            }

            return true;

        }).then(() => {

            setResumingPaymentId(null);

            setResumingPayment(null);

            loadData();

        });

    }



    if (loading)

        return (

            <div className={styles.loading}>

                Loading payments...

            </div>

        );



    return (

        <div className={styles.page}>

            <div className={styles.header}>


                <p className={styles.eyebrow}>
                    HyperScale Fitness Platform
                </p>


                <h1>
                    Payments
                </h1>



                <p className={styles.subtitle}>
                    View and complete your payments.
                </p>


            </div>




            <section>


                <h2>
                    My Payments
                </h2>



                {

                    payments.length === 0

                    ?

                    <div className={styles.emptyCard}>


                        <h3>
                            No Payments
                        </h3>


                        <p>
                            You have no payments yet.
                        </p>


                    </div>

                    :

                    <div className={styles.list}>


                        {

                            payments.map(payment => (


                                <div
                                    key={payment.id}
                                    className={styles.card}
                                >


                                    <div>

                                        <span className={styles.status}>

                                            {payment.status}

                                        </span>

                                        <p className={styles.muted}>

                                            {payment.reference_type}

                                        </p>

                                        <p className={styles.amount}>

                                            {formatPrice(payment)}

                                        </p>

                                    </div>


                                    {
                                        (
                                            payment.status === "pending" ||
                                            payment.status === "processing"
                                        )

                                        &&

                                        <div className={styles.actions}>

                                            <button
                                                className={styles.primaryButton}
                                                onClick={() =>
                                                    handleContinue(payment.id)
                                                }
                                            >

                                                Continue

                                            </button>

                                            <button
                                                className={styles.deleteButton}
                                                onClick={() =>
                                                    handleDelete(payment.id)
                                                }
                                            >

                                                Delete

                                            </button>

                                        </div>

                                    }


                                </div>


                            ))

                        }


                    </div>

                }


            </section>




            {
                clientSecret && (

                    <section>

                        <h2>
                            Complete Payment
                        </h2>

                        <div className={styles.formCard}>

                            <h3>
                                Enter your card details
                            </h3>

                            <p className={styles.muted}>
                                Finish this payment to activate your purchase.
                            </p>

                            {
                                resumingPayment && (

                                    <div className={styles.totalRow}>

                                        <span>
                                            {resumingPayment.description ||
                                                resumingPayment.reference_type}
                                        </span>

                                        <strong>
                                            {formatPrice(resumingPayment)}
                                        </strong>

                                    </div>

                                )
                            }

                            <Elements stripe={stripePromise} options={{ clientSecret }}>

                                <CheckoutForm
                                    clientSecret={clientSecret}
                                    onSuccess={handlePaymentSuccess}
                                />

                            </Elements>

                        </div>

                    </section>

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