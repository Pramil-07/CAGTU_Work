import {Button, Loader, Text} from "@mantine/core";
import {
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import React from "react";

export default function StripeCheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage(
                        "Your payment was not successful, please try again."
                    );
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // payment completion page
                return_url: `${
                    window != "undefined"
                        ? window.location.origin
                        : "http://localhost:3005/"
                }/payment-success`,
            },
        });


        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element"/>
            <Button
                mt={24}
                type="submit"
                fullWidth
                disabled={isLoading || !stripe || !elements}
                id="submit"
            >
                {isLoading ? <Loader color="gray" size="sm"/> : "Pay now"}
            </Button>
            {/* Show any error or success messages */}
            {message && <Text id="payment-message" color={"red.6"}>{message}</Text>}
        </form>
    );
}
