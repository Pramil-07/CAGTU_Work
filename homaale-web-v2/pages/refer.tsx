import {
    ActionIcon,
    AspectRatio,
    Box,
    Button,
    CopyButton,
    Flex,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import {
    IconAward,
    IconCalendarStats,
    IconCheck,
    IconCopy,
    IconMail,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import Layout from "@/components/Layout/Layout";
import { useGetReferralCode } from "@/hooks/useGetReferralCode";

const Refer = () => {
    const theme = useMantineTheme();
    const { data } = useGetReferralCode();
    return (
        <Layout heading="Refer & Earn" currentTitle="Refer & Earn">
            <section
                className={"ads-section-refer"}
                id={"ads-section-refer"}
                style={{ marginBottom: "64px" }}
            >
                <AspectRatio ratio={10 / 3} mx="auto">
                    <Link href={""} target={"_blank"}>
                        <Image
                            src={"/images/infoBanner/refer.png"}
                            style={{
                                objectFit: "cover",
                            }}
                            fill
                            alt="ad-image"
                            priority
                        />
                    </Link>
                </AspectRatio>
            </section>

            <section className="referral section">
                <Box
                    className="referral-process"
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 24,
                        marginBottom: 80,
                    }}
                >
                    <Flex direction={"column"} justify={"center"}>
                        <Flex pos={"relative"}>
                            <Flex
                                justify={"center"}
                                align={"center"}
                                sx={{
                                    background:
                                        theme.colors[theme.primaryColor][4],
                                    borderRadius: "100%",
                                    padding: 8,
                                    height: 60,
                                    width: 60,
                                }}
                                mb={16}
                            >
                                <IconMail size={30} color="#fff" />
                            </Flex>
                            <Box
                                component="figure"
                                pos={"absolute"}
                                left={22}
                                top={5}
                                sx={{
                                    [theme.fn.smallerThan("md")]: {
                                        display: "none",
                                    },
                                }}
                            >
                                <Image
                                    src={"/images/empty/careerarrow.png"}
                                    style={{
                                        objectFit: "contain",
                                    }}
                                    height={18}
                                    width={150}
                                    alt="arrow"
                                    priority
                                />
                            </Box>
                        </Flex>

                        <Text
                            component="p"
                            w={240}
                            align="center"
                            size={18}
                            color={
                                theme.colorScheme === "dark"
                                    ? "dark.0"
                                    : "gray.7"
                            }
                        >
                            Invite your friends
                        </Text>
                    </Flex>

                    <Flex direction={"column"} justify={"center"}>
                        <Flex pos={"relative"}>
                            <Flex
                                justify={"center"}
                                align={"center"}
                                sx={{
                                    background:
                                        theme.colors[theme.primaryColor][4],
                                    borderRadius: "100%",
                                    padding: 8,
                                    height: 60,
                                    width: 60,
                                }}
                                mb={16}
                            >
                                <IconCalendarStats size={30} color="#fff" />
                            </Flex>
                            <Box
                                component="figure"
                                pos={"absolute"}
                                left={22}
                                top={5}
                                sx={{
                                    [theme.fn.smallerThan("md")]: {
                                        display: "none",
                                    },
                                }}
                            >
                                <Image
                                    src={"/images/empty/careerarrow.png"}
                                    style={{
                                        objectFit: "contain",
                                    }}
                                    height={18}
                                    width={150}
                                    alt="arrow"
                                    priority
                                />
                            </Box>
                        </Flex>

                        <Text
                            component="p"
                            w={240}
                            align="center"
                            size={18}
                            color={
                                theme.colorScheme === "dark"
                                    ? "dark.0"
                                    : "gray.7"
                            }
                        >
                            Referred friends complete their first booking{" "}
                        </Text>
                    </Flex>
                    <Flex direction={"column"} justify={"center"}>
                        <Flex
                            justify={"center"}
                            align={"center"}
                            sx={{
                                background: theme.colors[theme.primaryColor][4],
                                borderRadius: "100%",
                                padding: 8,
                                height: 60,
                                width: 60,
                            }}
                            mb={16}
                        >
                            <IconAward size={30} color="#fff" />
                        </Flex>
                        <Text
                            component="p"
                            w={240}
                            align="center"
                            size={18}
                            color={
                                theme.colorScheme === "dark"
                                    ? "dark.0"
                                    : "gray.7"
                            }
                        >
                            Both you and your friend get referral rewards
                        </Text>
                    </Flex>
                </Box>

                <Flex
                    className="code-section"
                    justify={"center"}
                    align={"center"}
                    direction={"column"}
                >
                    <Text
                        component="h1"
                        size={48}
                        align="center"
                        sx={{
                            [theme.fn.smallerThan("md")]: {
                                fontSize: "36px",
                            },
                        }}
                        color={
                            theme.colorScheme === "dark" ? "gray.0" : "gray.7"
                        }
                    >
                        Invite your friend and get referral rewards
                    </Text>
                    <Text
                        color={
                            theme.colorScheme === "dark" ? "dark.0" : "gray.7"
                        }
                        style={{
                            fontSize: 16,
                            textAlign: "center",
                        }}
                    >
                        Receive referral rewards for both you and your referred
                        friend after their first booking.
                    </Text>

                    <Box
                        p={{
                            base: "24px",
                            sm: "80px 30px",
                            md: "80px 48px",
                            lg: "80px 120px",
                        }}
                        w={{
                            base: "100%",
                            // md: "80%",
                        }}
                        maw={"1024px"}
                        sx={{
                            background: "#DBEAFE",
                            borderRadius: 8,
                            margin: "40px 0",
                        }}
                    >
                        <Text
                            mb={6}
                            component="p"
                            sx={{
                                color: theme.colors.homaaleSlate[6],
                            }}
                        >
                            Share your refferal code
                        </Text>
                        <Flex wrap={"wrap"}>
                            <Flex
                                w={{
                                    base: "100%",
                                    xs: "60%",
                                    lg: "70%",
                                    xl: "75%",
                                }}
                                sx={{
                                    background: "#F9FAFB",
                                    borderRadius: "8px",
                                    height: "58px",
                                    padding: "0 16px",
                                    boxShadow:
                                        "0px 4px 14px 0px rgba(33, 29, 79, 0.10)",
                                }}
                            >
                                <Text size={"lg"} weight={500} color="dark.7">
                                    {data?.referral_code}
                                </Text>
                            </Flex>
                            <CopyButton
                                value={data?.referral_code ?? ""}
                                timeout={5000}
                            >
                                {({ copied, copy }) => (
                                    <Button
                                        sx={{
                                            background: "#1E293B",
                                            height: "58px",
                                            padding: "14px 30px",
                                            fontSize: 16,
                                            fontWeight: 500,
                                            borderRadius: 8,
                                            transition:
                                                "background .2s ease-in-out",
                                            [theme.fn.smallerThan("xs")]: {
                                                width: "100%",
                                                marginTop: "12px",
                                            },
                                        }}
                                        onClick={copy}
                                    >
                                        {copied ? "Copied" : "Copy Code"}
                                        <ActionIcon
                                            color={copied ? "teal" : "gray"}
                                            sx={{
                                                "&:not([data-disabled]):hover":
                                                    {
                                                        background: "none",
                                                    },
                                            }}
                                        >
                                            {copied ? (
                                                <IconCheck size="24px" />
                                            ) : (
                                                <IconCopy size="24px" />
                                            )}
                                        </ActionIcon>
                                    </Button>
                                )}
                            </CopyButton>
                            {/* <Button
                                sx={{
                                    background: "#1E293B",
                                    height: "58px",
                                    padding: "14px 40px",
                                    fontSize: 20,
                                    fontWeight: 500,
                                    borderRadius: 8,
                                    transition: "background .2s ease-in-out",
                                    [theme.fn.smallerThan("xs")]: {
                                        width: "100%",
                                        marginTop: "12px",
                                    },
                                }}
                            >
                                Copy
                                <CopyButton
                                    value={data?.referral_code ?? ""}
                                    timeout={2000}
                                >
                                    {({ copied, copy }) => (
                                        <Tooltip
                                            label={copied ? "Copied" : "Copy"}
                                            withArrow
                                            position="right"
                                        >
                                            <ActionIcon
                                                color={copied ? "teal" : "gray"}
                                                onClick={copy}
                                                className="svg-icon copy-icon"
                                            >
                                                {copied ? (
                                                    <IconCheck size={30} />
                                                ) : (
                                                    <IconCopy size={30} />
                                                )}
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </Button> */}
                        </Flex>
                    </Box>
                </Flex>
            </section>
        </Layout>
    );
};

export default Refer;
