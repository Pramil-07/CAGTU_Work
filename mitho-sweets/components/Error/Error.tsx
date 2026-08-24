import { Box, Text } from "@mantine/core";
import Image from "next/image";
import React from "react";
import logo from "@/images/logo-bg.png";

interface ErrorProps {
    msg?: string;
}

const Error: React.FC<ErrorProps> = ({ msg }) => {
    return (
        <Box
            pos={"relative"}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center",
                padding: "20px",
            }}
        >
            <Image src={logo} alt="Logo" width={150} height={150} />
            <Text size="xl" mt="md">
                Oops! Something Went Wrong
            </Text>
            <Text mt="sm" color="dimmed">
                {msg || "An unexpected error occurred. Please try again later."}
            </Text>
        </Box>
    );
};

export default Error;