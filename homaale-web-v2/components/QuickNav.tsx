import {
    ActionIcon,
    Box,
    Grid,
    Group,
    Menu,
    Text,
    Title,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconLayoutGrid,
    IconMathSymbols,
    IconMoonStars,
    IconCalculator,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React from "react";

import { useDark } from "@/utils/helpers";

interface Props {
    title: string;
    icon: React.ReactNode;
    link: string;
}

export const QuickCard = ({ title, icon, link }: Props) => {
    const router = useRouter();
    return (
        <Box
            sx={{
                textAlign: "center",
                cursor: "pointer",
            }}
            onClick={() => router.push(link)}
        >
            <Box
                p={25}
                sx={{
                    border: `1px solid #E9ECEF`,
                    borderRadius: 4,
                }}
                mb={8}
            >
                {icon}
            </Box>

            <Text component="p">{title}</Text>
        </Box>
    );
};

export const QuickNav = () => {
    const router = useRouter();
    const theme = useMantineTheme();
    const dark = useDark();
    const smallScreen = useMediaQuery("(max-width: 991px)"); //hard coded pixel due to responsive issue for ipads
    const iconColorMode = dark
        ? theme.colors.homaaleSlate[5]
        : theme.colors.homaaleSlate[5];
    const iconBackgroundColorMode = dark
        ? theme.colors.gray[8]
        : theme.colors.white[0];

    return (
        <Group position="center">
            <Menu
                withArrow
                width={smallScreen ? 260 : 500}
                position={smallScreen ? "top" : "bottom-end"}
                offset={4}
                transitionProps={{ transition: "pop" }}
                id="profile-menu"
            >
                <Menu.Target>
                    <Tooltip withArrow label="Quick Links">
                        <ActionIcon
                            variant="light"
                            radius={"xs"}
                            bg={
                                !smallScreen
                                    ? iconBackgroundColorMode
                                    : dark
                                    ? theme.colors.dark[6]
                                    : "#fff"
                            }
                            sx={{
                                ":active": {
                                    background: theme.colors.brand[0],
                                    // transform: "scale(0.96)",
                                    color: theme.colors.brand[5],
                                },
                                "&:hover": {
                                    background: smallScreen
                                        ? "transparent"
                                        : theme.colors.brand[0],
                                    transition: "0.35s all ease",
                                },
                                "& svg": {
                                    width: 18,
                                    height: 18,
                                    color:
                                        router.pathname === "/box"
                                            ? theme.colors.homaaleSlate[1]
                                            : iconColorMode,
                                },
                                width: 30,
                                height: 30,

                                [theme.fn.smallerThan("md")]: {
                                    width: 35,
                                    height: 35,
                                    "& svg": {
                                        width: 25,
                                        height: 25,
                                    },
                                },
                                cursor: "pointer",
                            }}
                        >
                            <IconLayoutGrid
                                color={
                                    !smallScreen
                                        ? iconColorMode
                                        : dark
                                        ? theme.colors.gray[1]
                                        : theme.colors.gray[9]
                                }
                                stroke={smallScreen ? 1.5 : 2}
                            />
                        </ActionIcon>
                    </Tooltip>
                </Menu.Target>
                <Menu.Dropdown p={24}>
                    <Title order={4} mb={24} size={20} fw={500}>
                        Quick Links
                    </Title>
                    <Grid gutter={16}>
                        <Grid.Col md={4}>
                            <QuickCard
                                title="Horoscope"
                                link="/horoscope/nepali"
                                icon={<IconMoonStars size={30} stroke={1.25} />}
                            />
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <QuickCard
                                title="Calculator"
                                link="/calculator"
                                icon={
                                    <IconCalculator  size={30} stroke={1.25} />
                                }
                            />
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <QuickCard
                                title="Tax Calculator"
                                link="/tax-calculator"
                                icon={
                                    <IconMathSymbols size={30} stroke={1.25} />
                                }
                            />
                        </Grid.Col>
                    </Grid>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
