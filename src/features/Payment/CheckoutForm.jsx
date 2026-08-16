import { useState } from "react";

import {
    useStripe,
    useElements,
    PaymentElement
} from "@stripe/react-stripe-js";

import toast from "react-hot-toast";

import styles from "./Payment.module.css";



export default function CheckoutForm({ clientSecret, onSuccess }){

    const stripe = useStripe();

    const elements = useElements();

    const [processing,setProcessing] = useState(false);


    async function handleSubmit(event){

        event.preventDefault();

        if(!stripe || !elements) return;

        setProcessing(true);


        try{

            const {
                error,
                paymentIntent
            } =
            await elements.submit()
                .then(() =>
                    stripe.confirmPayment({

                        elements,

                        clientSecret,

                        confirmParams: {

                            return_url: window.location.href,

                        },

                        redirect: "if_required",

                    })
                );


            if(error){


                toast.error(

                    error.message ||

                    "Payment failed"

                );

                return;

            }


            if(
                paymentIntent &&
                paymentIntent.status === "succeeded"
            ){

                onSuccess();

            }


        }
        catch(err){


            toast.error(
                err.message ||
                "Payment failed"
            );


        }
        finally{


            setProcessing(false);


        }

    }


    return (

        <form onSubmit={handleSubmit}>

            <PaymentElement />

            <button

                type="submit"

                className={styles.primaryButton}

                disabled={!stripe || processing}

            >

                {

                    processing

                    ? "Processing..."

                    : "Pay Now"

                }

            </button>

        </form>

    );

}