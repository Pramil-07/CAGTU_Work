"use client";
import React, {useContext, useEffect, useState} from "react";
import { Box, Button, Center, Container, Flex, Text } from "@mantine/core";
import Image from "next/image";
import apiClient from "@/axiosConfig";
import {useRouter, useSearchParams} from 'next/navigation';
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import CartContext from "@/context/CartContext";
import {useAuth} from "@/lib/AuthContext";

const Success = () => {
    const [loading, setLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const searchParams = useSearchParams();
    const verificationId = searchParams.get('token') || 'N/A';
    const router = useRouter();
    const { isLoggedIn, logout } = useAuth();
    const { setCartItems, selectedPaymentMethod } = useContext(CartContext);
    // const method= the selected payment method here
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.post(`/payment/verify/${selectedPaymentMethod}/`, {
                    // verification_id: verificationId,
                });
                if (response && response.status === 200) {
                    setCartItems([]);
                    localStorage.removeItem("cartItems");
                    localStorage.removeItem("selectedPaymentMethod");
                    setLoading(false);
                    setIsSuccess(true);
                } else {
                    // setIsSuccess(false);
                    setLoading(false);
                }
            } catch (error) {
                // setIsSuccess(false);
                setLoading(false);
            }
        };
        fetchData();
    }, [setCartItems, verificationId, selectedPaymentMethod]);

    if (loading) {
        return (
            <Box
                style={{
                    minHeight: "100vh",
                }}
            >
                <Container size="xl" py="xl" className="flex justify-center items-center min-h-[80lvh]">
                    <Center>
                        <MithoSweetsLoader />
                    </Center>
                </Container>
            </Box>
        );
    }

    return (
        <div>
            <Flex
                align="center"
                justify="center"
                direction="column"
                mt={20}
                className="min-h-[80lvh]"
                gap={20}
            >
                {isSuccess ? (
                    selectedPaymentMethod === "cod" ? (
                            <>
                                <Image
                                    src="/svgs/payment-success1.svg"
                                    height={200}
                                    width={200}
                                    alt="img"
                                />
                                <Text>Your order has been successfully saved.</Text>
                                <Text>Thank you for ordering from our platform.</Text>
                                <Text ta="center">
                                    The items you ordered will be sent your way after we
                                    verify your order. <br />
                                    An automated order receipt will be sent to your
                                    registered email address. <br /> We’ll see you
                                    shortly, thank you.
                                </Text>
                                {isLoggedIn ? (
                                    <Button onClick={() => router.push("/Profile")}>
                                        Go to Your Order List
                                    </Button>
                                ) : (
                                    <Button onClick={() => router.push("/")}>
                                        Go to Home
                                    </Button>
                                )}
                            </>
                    ) : (
                    <>
                        <Image
                            src="/svgs/payment-success1.svg"
                            height={200}
                            width={200}
                            alt="img"
                        />
                        <Text>Payment Successful.</Text>
                        <Text>Thank you for your payment.</Text>
                        <Text>
                            An automated payment receipt will be sent to your registered email address.
                        </Text>
                        <Button onClick={() => router.push("/")}> Go to Home</Button>
                    </> )
                ) : (
                    <>
                        <Image
                            src="/svgs/payment-failed.svg"
                            height={200}
                            width={200}
                            alt="img"
                        />
                        <Text>Payment Failed.</Text>
                        <Text>Sorry, your payment could not be processed.</Text>
                        <Text>Please try again or contact support.</Text>
                        <Button onClick={() => router.push("/cart")}>Try Again</Button>
                    </>
                )}
            </Flex>
        </div>
    );
};

export default Success;