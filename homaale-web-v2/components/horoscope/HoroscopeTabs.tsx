import { Box, Button, Flex, Tabs } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";

import HoroscopeType from "./HoroscopeType";

const HoroscopeTabs = ({ is_nepali }: { is_nepali: boolean }) => {
    const router = useRouter();

    return (
        <Box>
            <Tabs
                defaultValue="daily"
                unstyled
                styles={(theme) => ({
                    tab: {
                        ...theme.fn.focusStyles(),
                        backgroundColor:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[6]
                                : theme.colors.gray[3],
                        color:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[0]
                                : theme.colors.gray[6],
                        border: `none`,
                        borderRadius: 4,
                        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                        marginRight: 24,
                        [theme.fn.smallerThan("md")]: {
                            margin: "16px 24px 8px 0",
                        },
                        cursor: "pointer",
                        fontSize: theme.fontSizes.sm,
                        display: "flex",
                        alignItems: "center",

                        "&:disabled": {
                            opacity: 0.5,
                            cursor: "not-allowed",
                        },

                        "&[data-active]": {
                            backgroundColor: theme.colors.blue[5],
                            borderColor: theme.colors.blue[5],
                            color: theme.white,
                        },
                    },

                    tabIcon: {
                        marginRight: theme.spacing.xs,
                        display: "flex",
                        alignItems: "center",
                    },

                    tabsList: {
                        display: "flex",
                        flexWrap: "wrap",
                    },
                })}
            >
                <Flex
                    sx={(theme) => ({
                        flexDirection: "row",
                        [theme.fn.smallerThan("md")]: {
                            flexDirection: "column",
                            alignItems: "flex-start",
                        },
                    })}
                >
                    <Tabs.List>
                        <Tabs.Tab value="daily">Daily</Tabs.Tab>
                        <Tabs.Tab value="weekly">Weekly</Tabs.Tab>
                        <Tabs.Tab value="monthly">Monthly</Tabs.Tab>
                        <Tabs.Tab value="yearly">Yearly</Tabs.Tab>
                    </Tabs.List>
                    <Box>
                        {/* <Button
                            ml={16}
                            onClick={() => router.push("/horoscope/english")}
                            variant={
                                router.pathname.includes("english")
                                    ? "filled"
                                    : "outline"
                            }
                            sx={(theme) => ({
                                [theme.fn.smallerThan("md")]: {
                                    margin: "16px 24px 8px 0",
                                },
                                ".mantine-Button-label": {
                                    fontWeight: 400,
                                },
                            })}
                        >
                            English
                        </Button> */}
                        {/* <Button
                            ml={16}
                            onClick={() => router.push("/horoscope/nepali")}
                            variant={
                                router.pathname.includes("nepali")
                                    ? "filled"
                                    : "outline"
                            }
                            sx={(theme) => ({
                                [theme.fn.smallerThan("md")]: {
                                    margin: "16px 24px 8px 0",
                                },
                                ".mantine-Button-label": {
                                    fontWeight: 400,
                                },
                            })}
                        >
                            Nepali
                        </Button> */}
                    </Box>
                </Flex>

                <Tabs.Panel value="daily" pt="xs">
                    <HoroscopeType type={1} is_nepali={is_nepali} />
                </Tabs.Panel>

                <Tabs.Panel value="weekly" pt="xs">
                    <HoroscopeType type={2} is_nepali={is_nepali} />
                </Tabs.Panel>

                <Tabs.Panel value="monthly" pt="xs">
                    <HoroscopeType type={3} is_nepali={is_nepali} />
                </Tabs.Panel>
                <Tabs.Panel value="yearly" pt="xs">
                    <HoroscopeType type={4} is_nepali={is_nepali} />
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};

export default HoroscopeTabs;
