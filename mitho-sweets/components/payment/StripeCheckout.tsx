'use client';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { Button, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';

const StripeCheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!stripe || !clientSecret) {
            setError('Stripe or client secret not initialized.');
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error: retrieveError }) => {
            if (retrieveError) {
                setError(retrieveError.message || 'Invalid client secret. Please try again.');
                return;
            }
            switch (paymentIntent?.status) {
                case 'succeeded':
                    setError('Payment already succeeded!');
                    router.push('/payment-success');
                    break;
                case 'processing':
                    setError('Your payment is processing.');
                    break;
                case 'requires_payment_method':
                    setError(null); // Clear error for new attempt
                    break;
                default:
                    setError('Unexpected payment status.');
                    break;
            }
        });
    }, [stripe, clientSecret, router]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) {
            setError('Stripe or client secret not initialized.');
            return;
        }

        setProcessing(true);
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || 'Failed to submit payment details.');
            setProcessing(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setError(error.message || 'Payment failed. Please try again.');
            setProcessing(false);
        } else if (paymentIntent?.status === 'succeeded') {
            router.push('/payment-success');
        } else if (paymentIntent?.status === 'requires_action') {
            const { error: actionError } = await stripe.handleNextAction({ clientSecret });
            if (actionError) {
                setError(actionError.message || 'Additional action failed.');
                setProcessing(false);
            } else {
                const { paymentIntent: updatedIntent, error: fetchError } = await stripe.retrievePaymentIntent(clientSecret);
                if (fetchError) {
                    setError(fetchError.message || 'Failed to verify payment.');
                    setProcessing(false);
                } else if (updatedIntent?.status === 'succeeded') {
                    router.push('/payment-success');
                } else {
                    setError('Payment could not be completed.');
                    setProcessing(false);
                }
            }
        } else {
            setError('Unexpected payment status.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && <Text color="red.5" mt="sm">{error}</Text>}
            <Button
                type="submit"
                disabled={!stripe || !elements || processing || !!error}
                fullWidth
                mt="lg"
                loading={processing}
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </Button>
        </form>
    );
};

export default StripeCheckoutForm;