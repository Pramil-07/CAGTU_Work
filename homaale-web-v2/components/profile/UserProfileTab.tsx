import { Box, ScrollArea, Tabs, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { useUserProfileTabStyles } from "@/styles/components/UserProfileTabStyles";

import About from "./tabs/About";
import Activities from "./tabs/Activities";
import Documents from "./tabs/Documents";
import KYC from "./tabs/Kyc";
import Rewards from "./tabs/Rewards";

const UserProfileTab = () => {
    const { classes } = useUserProfileTabStyles();
    const theme = useMantineTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(
        router.query.active_tab ? router.query.active_tab?.toString() : "about"
    );

    useEffect(() => {
        setActiveTab(
            router.query.active_tab
                ? (router.query.active_tab as string)
                : "about"
        );
    }, [router.query.active_tab]);

    return (
        <Box className={classes.wrapper}>
            <Tabs
                color="dark"
                defaultValue={"about"}
                value={activeTab}
                onTabChange={(value) => {
                    setActiveTab(`${value}`);
                    router.push(`${router.pathname}?active_tab=${value}`);
                }}
            >
                <ScrollArea scrollbarSize={2}>
                    <Tabs.List
                        sx={{
                            width: 650,
                            [`@media (min-width: ${theme.breakpoints.md}px)`]: {
                                width: "100%",
                            },
                        }}
                    >
                        <Tabs.Tab value="about">About</Tabs.Tab>
                        <Tabs.Tab value="document">Documents</Tabs.Tab>
                        <Tabs.Tab value="activities">Activities</Tabs.Tab>
                        <Tabs.Tab value="rewards">Rewards</Tabs.Tab>
                        <Tabs.Tab value="kyc-details">KYC Details</Tabs.Tab>
                    </Tabs.List>
                </ScrollArea>

                <Tabs.Panel value="about" pt="xs">
                    <About />
                </Tabs.Panel>

                <Tabs.Panel value="document" pt="xs">
                    <Documents />
                </Tabs.Panel>
                <Tabs.Panel value="activities" pt="xs">
                    <Activities />
                </Tabs.Panel>
                <Tabs.Panel value="rewards" pt="xs">
                    <Rewards />
                </Tabs.Panel>
                <Tabs.Panel value="kyc-details" pt="xs">
                    <KYC />
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
};

export default UserProfileTab;
