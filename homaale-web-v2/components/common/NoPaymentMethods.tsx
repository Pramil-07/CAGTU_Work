import { Flex, Text } from "@mantine/core";
import Image from "next/image";
import React from "react";

const NoPaymentMethods = () => {
    return (
        <Flex align={"center"} justify={"center"} direction={"column"} p={24}>
            <Image
                src={"/svgs/wallet.svg"}
                height={248}
                width={248}
                alt="wallet-img"
            />
            <Text
                sx={{
                    fontSize: 20,
                    fontWeight: 500,
                    textAlign: "center",
                }}
            >
                Seems like you do not have to pay for this service.
            </Text>
            <Text
                color={"gray.6"}
                sx={{
                    fontSize: 14,
                }}
            >
                Continue without paying.
            </Text>
        </Flex>
    );
};

export default NoPaymentMethods;
