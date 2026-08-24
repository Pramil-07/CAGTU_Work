import { Button, Flex, Text, useMantineTheme } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import Layout from "@/components/Layout/Layout";

const PaymentFailure = () => {
    const theme = useMantineTheme();
    const router = useRouter();
    return (
        <Layout
            title="Payment Verification | Homaale"
            currentTitle="payment-failure"
            breadCrumbsItems={[{ name: "checkout", href: "/box" }]}
        >
            <Flex
                align={"center"}
                justify={"center"}
                direction="column"
                sx={{
                    minHeight: "70vh",
                }}
            >
                <Image
                    src={"/svgs/payment-failed.svg"}
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
                    Payment Failed.
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
                    Am error occured during your payment.
                    <br /> Please try again.
                </Text>
                <Button onClick={() => router.push("/box")}>Try Again</Button>
            </Flex>
        </Layout>
    );
};

export default PaymentFailure;
