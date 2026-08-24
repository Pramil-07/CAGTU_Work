import { Button, Flex, Loader, Text, useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import Script from "next/script";
import React, { useEffect, useState } from "react";

import NotFound from "@/components/common/NotFound";
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import { getApiEndpoint } from "@/utils/helpers";

const ORDER_ALREADY_PROCESSED_MESSAGE =
    "Transaction with this intent id is already completed.";

export interface SuccessPageQuery {
    pidx?: string;
    payment_intent?: string;
    token?: string;
    TXNID?: string;
    refId?: string;
    oid?: string;
}

export enum PaymentMethods {
    connect_ips = "connect_ips",
    khalti = "khalti",
    stripe = "stripe",
    paypal = "paypal",
    esewa = "esewa",
}

export type PaymentPayload = {
    verification_id: string;
    intent_id?: string;
};

const PaymentSuccess = () => {
    const theme = useMantineTheme();

    const router = useRouter();
    const query =
        router.query.pidx ||
        router.query.payment_intent ||
        router.query.token ||
        router.query.refId ||
        router.query.oid ||
        router.query.TXNID;

    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [orderAlreadyProcessed, setOrderAlreadyProcessed] =
        useState<boolean>(false);

    const { pidx, payment_intent, token, refId, oid, TXNID } =
        router.query as SuccessPageQuery;

    let provider: string;

    if (pidx) {
        provider = PaymentMethods.khalti;
    } else if (payment_intent) {
        provider = PaymentMethods.stripe;
    } else if (token) {
        provider = PaymentMethods.paypal;
    } else if (TXNID) {
        provider = PaymentMethods.connect_ips;
    } else if (refId) {
        provider = PaymentMethods.esewa;
    }

    const { mutate: completeOrderMutation, isLoading } = useMutation<
        string,
        AxiosError<{ order: string[] }>,
        PaymentPayload
    >(async (payload) => {
        const { data } = await axios.post<{ message: string }>(
            `${getApiEndpoint()}/payment/verify/${provider}/`,
            payload
        );
        return data.message;
    });
    useEffect(() => {
        let payload;
        if (pidx) {
            payload = { verification_id: pidx } as PaymentPayload;
        } else if (payment_intent) {
            payload = { verification_id: payment_intent } as PaymentPayload;
        } else if (token) {
            payload = { verification_id: token } as PaymentPayload;
        } else if (TXNID) {
            payload = { verification_id: TXNID } as PaymentPayload;
        } else if (refId) {
            payload = {
                verification_id: refId,
                intent_id: oid,
            } as PaymentPayload;
        }

        if (!payload) return;

        completeOrderMutation(payload, {
            onSuccess: (data: any) => {
                toast.success(data);
                setShowSuccess(true);
            },
            onError: (error: any) => {
                const errorArray = error?.response?.data?.intent_id;
                if (errorArray && errorArray.length > 0) {
                    const firstError = errorArray[0];
                    if (firstError === ORDER_ALREADY_PROCESSED_MESSAGE) {
                        setOrderAlreadyProcessed(true);
                        setShowSuccess(false);
                    }
                }
            },
        });
    }, [completeOrderMutation, payment_intent, pidx, token, refId, oid, TXNID]);

    return (
        <>
            <Script id="show-banner" strategy="beforeInteractive">
                {`
                window.addEventListener("flutterInAppWebViewPlatformReady", function (event) {
                     window.flutter_inappwebview.callHandler('handlerFoo')
                        .then(function (result) {
                            window.flutter_inappwebview.callHandler(
                                'handlerFooWithArgs', 1, true, ['bar', 5], {
                                    intent: 'abc',
                                    status: 'success'
                                }, result);
                        });
                });
                `}
            </Script>
            <Layout
                title="Payment Verification | Homaale"
                currentTitle="payment-completed"
                breadCrumbsItems={[{ name: "checkout", href: "/box" }]}
            >
                {!query && <NotFound />}
                {/* {orderAlreadyProcessed && <h1>Order already processed</h1>} */}

                {isLoading ? (
                    <Loader />
                ) : showSuccess ? (
                    <Flex
                        align={"center"}
                        justify={"center"}
                        direction="column"
                        sx={{
                            minHeight: "70vh",
                        }}
                    >
                        <Image
                            src={"/svgs/payment-success.svg"}
                            height={200}
                            width={200}
                            alt="img"
                        />
                        <Text
                            component="h1"
                            size={32}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[0]
                                    : theme.colors.homaaleSlate[8]
                            }
                            mt={24}
                            weight={500}
                            align={"center"}
                        >
                            Payment Successful.
                        </Text>
                        <Text
                            component="p"
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[1]
                                    : theme.colors.homaaleSlate[5]
                            }
                            mt={8}
                            mb={24}
                            align="center"
                        >
                            Thank you for your payment.
                            <br /> An automated payment receipt will be sent to
                            your registered email address.
                        </Text>
                        <Button
                            onClick={() =>
                                router.push("/bookings?active_tab=2")
                            }
                        >
                            Go to Bookings
                        </Button>
                    </Flex>
                ) : (
                    orderAlreadyProcessed && (
                        <Flex
                            align={"center"}
                            justify={"center"}
                            direction="column"
                            sx={{
                                minHeight: "70vh",
                            }}
                        >
                            <Image
                                src={"/svgs/order-processed.svg"}
                                height={200}
                                width={200}
                                alt="img"
                            />
                            <Text
                                component="h1"
                                size={32}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[0]
                                        : theme.colors.homaaleSlate[8]
                                }
                                mt={24}
                                weight={500}
                                align={"center"}
                            >
                                Order already processed.
                            </Text>
                            <Text
                                component="p"
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[1]
                                        : theme.colors.homaaleSlate[5]
                                }
                                mt={8}
                                mb={24}
                                align="center"
                            >
                                {" "}
                                We have already sent an automated payment
                                receipt to your registered email address.
                            </Text>
                            <Button
                                onClick={() => router.push("/payment/history")}
                            >
                                Payment History
                            </Button>
                        </Flex>
                    )
                )}
            </Layout>
        </>
    );
};

export default PaymentSuccess;
