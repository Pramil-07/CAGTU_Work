import { Box, Button, createStyles, Flex, Text } from "@mantine/core";
import Image from "next/image";
import React, { useState } from "react";

import GoogleLogo from "@/public/svgs/GoogleIcon";

import Facebook from "../auth/Facebook";
import Google from "../auth/Google";
import UnlinkConfirmPasswordModal from "./UnlinkConfirmPasswordModal";

interface AccountInfo {
    name?: string;
    uid?: string;
    connected?: boolean;
    id?: number;
    facebookName?: string;
}

const ConnectAccount = ({
    name,
    uid,
    connected,
    id,
    facebookName,
}: AccountInfo) => {
    const [show, setShow] = useState(false);

    const { classes } = useStyles();
    return (
        <>
            <Flex className={classes.wrapper}>
                <Image
                    src={
                        name === "google"
                            ? "/svgs/google-logo.svg"
                            : "/svgs/facebook-logo2.svg"
                    }
                    height={40}
                    width={40}
                    alt="google-logo"
                />
                <Text
                    component="h4"
                    mt={16}
                    className="text-center"
                    sx={{ textTransform: "capitalize" }}
                >
                    {name}
                </Text>
                <Text mb={16} mt={8} color="gray.6">
                    {connected
                        ? name === "google"
                            ? uid
                            : facebookName
                        : `You are not signed in through ${name}.`}
                </Text>
                {connected ? (
                    <Button
                        onClick={() => {
                            setShow(true);
                        }}
                    >
                        Disconnect
                    </Button>
                ) : name === "google" ? (
                    <Box pos={"relative"}>
                        <Google />
                        <Button
                            variant="outline"
                            leftIcon={<GoogleLogo />}
                            sx={(theme) => ({
                                height: 40,
                                width: 220,
                                border: `1px solid ${theme.colors.homaaleSlate[3]}`,
                                color:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[0]
                                        : theme.colors.homaaleSlate[7],
                                fontSize: 14,
                                fontFamily: "Inter",
                                "&:not([data-disabled]):hover": {
                                    background: "none",
                                },
                            })}
                        >
                            Login with Google
                        </Button>
                    </Box>
                ) : (
                    <Facebook />
                )}
            </Flex>
            <UnlinkConfirmPasswordModal
                show={show}
                handleClose={() => setShow(false)}
                id={id}
                setShowForm={setShow}
            />
        </>
    );
};

export default ConnectAccount;

const useStyles = createStyles((theme) => ({
    wrapper: {
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.dark[6]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        padding: "24px 48px",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        borderRadius: 4,
        width: "100%",
        [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
            width: "auto",
        },
    },
}));
