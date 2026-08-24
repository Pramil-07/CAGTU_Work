import {
    ActionIcon,
    Box,
    Button,
    Container,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconArrowNarrowRight,
    IconExclamationCircle,
    IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { axiosClient } from "utils/axiosClient";

import { useUser } from "@/hooks/useUser";
import { useTopHeaderNotificationStyles } from "@/styles/components/TopHeaderNotification";

export const TopHeaderNotification = () => {
    const { classes } = useTopHeaderNotificationStyles();
    const theme = useMantineTheme();
    const [show, setshow] = useState(true);
    const handlecross = () => {
        setshow(false);
        localStorage.setItem("presentTime", new Date() as unknown as string);
    };
    const getNotice = async () => {
        const res = await axiosClient.get("/landingpage/notice/");
        return res;
    };
    const { data } = useQuery(["notice"], getNotice);
    useEffect(() => {
        const timeElapsed =
            new Date().getTime() -
            new Date(localStorage.getItem("presentTime") as string).getTime();
        if (timeElapsed > 43200000) {
            setshow(true);
            localStorage.removeItem("presentTime");
        } else {
            setshow(false);
        }
    }, []);

    const { data: userStatus } = useUser();

    const router = useRouter();
    return (
        <>
            {data?.data?.result[0] && show && (
                <Box className={classes.mainwrapper}>
                    <Container style={{ maxWidth: 1500 }}>
                        <Box className={classes.topheadernotification}>
                            {/* <Text
                                style={{
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : "",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {data?.data?.result[0]?.name}
                            </Text> */}
                            {/* <IconPointFilled
                                size={7}
                                style={{
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : "",
                                }}
                            /> */}
                            <Text
                                sx={{
                                    textAlign: "center",
                                    "& p": {
                                        color:
                                            theme.colorScheme === "dark"
                                                ? theme.colors.gray[0]
                                                : theme.colors.gray[7],
                                    },
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: data?.data?.result[0]?.message,
                                }}
                            />
                            {/* <Box className={classes.registerwrapper}>
                                <h3 style={{ fontSize: 12, fontWeight: 500 }}>
                                    Register now
                                </h3>
                                <IconArrowNarrowRight size={20} />
                            </Box> */}
                        </Box>
                    </Container>
                    <ActionIcon onClick={handlecross}>
                        <IconX
                            style={{ margin: 0 }}
                            className={classes.action}
                            size={18}
                        />
                    </ActionIcon>
                </Box>
            )}

            {userStatus?.is_suspended && (
                <Box className={classes.suspended}>
                    <Container style={{ maxWidth: 1500 }}>
                        <Box className={classes.topheadernotification}>
                            <Text
                                sx={{
                                    display: "flex",
                                    textAlign: "center",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        theme.colorScheme === "dark"
                                            ? "white"
                                            : "#FE5050",
                                }}
                            >
                                <IconExclamationCircle /> Your account has been
                                suspended. If you have any query, please contact
                                Homaale Support Team.
                                <Button
                                    size={"xs"}
                                    color={"dark"}
                                    ml={24}
                                    onClick={() => router.push("/support")}
                                >
                                    Go To Support{" "}
                                    <IconArrowNarrowRight size={20} />
                                </Button>
                            </Text>
                        </Box>
                    </Container>
                </Box>
            )}
            {userStatus && !userStatus?.has_profile && (
                <Box className={classes.incomplete}>
                    <Container style={{ maxWidth: 1500 }}>
                        <Box className={classes.topheadernotification}>
                            <Text
                                sx={{
                                    display: "flex",
                                    textAlign: "center",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        theme.colorScheme === "dark"
                                            ? "white"
                                            : theme.colors.status[0],
                                }}
                            >
                                <IconExclamationCircle /> You haven&apos;t
                                completed your profile. Please complete your
                                profile
                                <Button
                                    size={"xs"}
                                    color={"dark"}
                                    ml={24}
                                    onClick={() =>
                                        router.push("/settings/account")
                                    }
                                >
                                    Go To Account{" "}
                                    <IconArrowNarrowRight size={20} />
                                </Button>
                            </Text>
                        </Box>
                    </Container>
                </Box>
            )}
        </>
    );
};
