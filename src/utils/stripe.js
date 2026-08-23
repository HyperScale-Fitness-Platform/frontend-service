import { loadStripe } from "@stripe/stripe-js";

/*
 * Single shared Stripe.js instance for the whole app.
 *
 * developerTools.assistant.enabled = false hides the Stripe
 * "Testing Assistant" popup that Stripe.js otherwise renders
 * in the bottom-right corner of every page using Elements
 * with a test-mode publishable key.
 */
export const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    {
        developerTools: {
            assistant: {
                enabled: false,
            },
        },
    }
);
