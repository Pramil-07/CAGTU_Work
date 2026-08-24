import {
    ActionIcon,
    Flex,
    Group,
    Indicator,
    Menu,
    ScrollArea,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useIntersection, useMediaQuery } from "@mantine/hooks";
import { IconChecks, IconNotification } from "@tabler/icons-react";
import React, { useEffect, useMemo, useRef } from "react";

import urls from "@/constants/urls";
import { useGetNotification } from "@/hooks/useNotification";
import { useNotificationStyles } from "@/styles/components/NotificationStyles";
import type { NotificationProps } from "@/types/NotificationProps";
import { axiosClient } from "@/utils/axiosClient";
import { useDark } from "@/utils/helpers";

import { NotificationCard } from "./NotificationCard";
import {MdNotificationsNone} from "react-icons/md";

export const NotificationDrop = () => {
    const theme = useMantineTheme();
    const dark = useDark();
    const iconColorMode = dark
        ? theme.colors.homaaleSlate[5]
        : theme.colors.homaaleSlate[5];

    const smallScreen = useMediaQuery("(max-width:991px)");
    const iconBackgroundColorMode = dark
        ? theme.colors.gray[8]
        : theme.colors.white[0];

    const { classes } = useNotificationStyles();

    const containerRef = useRef<HTMLDivElement>(null);

    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });

    const { refetch, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
        useGetNotification();

    const notifications: NotificationProps["result"] = useMemo(
        () => data?.pages.map((page) => page.result).flat() ?? [],
        [data?.pages]
    );
    console.log("notifications", notifications)
    const isLastTaskerOnPage = (index: number) =>
        index === notifications?.length - 1;

    const todayNotifications = notifications
        ?.filter((date) => {
            return (
                new Date(date.created_date).getFullYear() ===
                    new Date().getFullYear() &&
                new Date(date.created_date).getMonth() ===
                    new Date().getMonth() &&
                new Date(date.created_date).getDate() === new Date().getDate()
            );
        })
        .map((notification, index) => {
            return (
                <div ref={isLastTaskerOnPage(index) ? ref : null} key={index}>
                    <NotificationCard notification={notification} />
                </div>
            );
        });
console.log("todays notfications", todayNotifications)
    const otherNotifications = notifications
        ?.filter((date) => {
            return (
                new Date(date.created_date).getDate() !== new Date().getDate()
            );
        })
        .map((notification, index) => {
            return (
                <div ref={ref} key={index}>
                    <NotificationCard notification={notification} />
                </div>
            );
        });

    useEffect(() => {
        if (entry?.isIntersecting) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry]);

    return (
        <Group position="center">
            <Menu
                withArrow
                width={smallScreen ? "100%" : 500}
                position={smallScreen ? "top-end" : "bottom"}
                arrowPosition={"center"}
                offset={4}
                transitionProps={{ transition: "pop" }}
                id="profile-menu"
            >
                <Menu.Target>
                    <Tooltip
                        withArrow
                        label="Notifications"
                        position="bottom-end"
                    >
                        <Indicator
                            inline
                            label={data?.pages[0]?.unread_count}
                            processing
                            disabled={
                                data && data?.pages[0]?.unread_count > 0
                                    ? false
                                    : true
                            }
                            size={15}
                            offset={2}
                        >
                            <ActionIcon
                                variant="light"
                                radius={"xs"}
                                size={30}
                                sx={{
                                    "& svg": {
                                        width: 18,
                                        height: 18,
                                    },
                                    width: 30,
                                    height: 30,

                                    "&:not([data-disabled])": {
                                        backgroundColor:
                                            iconBackgroundColorMode,
                                        "& svg": {
                                            color: iconColorMode,
                                        },
                                    },

                                    [theme.fn.smallerThan("md")]: {
                                        "&:not([data-disabled])": {
                                            backgroundColor:
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[6]
                                                    : "#fff",
                                            "& svg": {
                                                width: 25,
                                                height: 25,
                                                stroke: "1.5",
                                                color:
                                                    theme.colorScheme === "dark"
                                                        ? theme.colors.gray[3]
                                                        : theme.colors.gray[9],
                                            },
                                            "&:not([data-disabled]):hover": {
                                                background: "transparent",
                                                "& svg": {
                                                    color:
                                                        theme.colorScheme ===
                                                        "dark"
                                                            ? theme.colors
                                                                  .gray[1]
                                                            : theme.colors
                                                                  .gray[9],
                                                },
                                            },
                                        },
                                        width: 35,
                                        height: 35,
                                    },
                                    cursor: "pointer",
                                    "&:not([data-disabled]):hover": {
                                        background: theme.colors.brand[0],
                                        // "& svg": {
                                        //     color: "#ffffff",
                                        // },
                                    },
                                }}
                            >
                                <MdNotificationsNone/>
                            </ActionIcon>
                        </Indicator>
                    </Tooltip>
                </Menu.Target>
                <Menu.Dropdown className={classes.root}>
                    <Flex p={14}>
                        <h3>Notifications</h3>
                        <p
                            onClick={async () => {
                                const response = await axiosClient.post(
                                    urls.notification
                                );

                                if (response.status === 200) {
                                    refetch();
                                }
                            }}
                        >
                            <IconChecks size={18} /> Mark all as read{" "}
                        </p>
                    </Flex>
                    <ScrollArea.Autosize
                        h={500}
                        offsetScrollbars
                        scrollbarSize={5}
                        className={"scroll"}
                        ref={containerRef}
                    >
                        <Text
                            component="p"
                            className="header"
                            color={theme.colors[theme.primaryColor][4]}
                            mb={8}
                        >
                            Today
                        </Text>
                        {todayNotifications?.length > 0 ? (
                            todayNotifications
                        ) : (
                            <Text component="p">
                                No new notifications for today.
                            </Text>
                        )}
                        <Text
                            component="p"
                            color={theme.colors[theme.primaryColor][4]}
                            className="header"
                            mb={8}
                        >
                            Earlier
                        </Text>
                        {otherNotifications?.length > 0 ? (
                            otherNotifications
                        ) : (
                            <Text component="p">No notifications to show.</Text>
                        )}
                    </ScrollArea.Autosize>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};
