import {
    ActionIcon,
    Button,
    Flex,
    Group,
    Indicator,
    useMantineTheme,
} from "@mantine/core";
import { IconBoxSeam, IconBrandHipchat } from "@tabler/icons-react";
import type { DocumentData } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

import { db } from "@/firebase";
import { useGetCookieUser } from "@/hooks/useGetCookieUser";
import { useUser } from "@/hooks/useUser";
import { useDark } from "@/utils/helpers";

import type { SenderContentProps } from "../chat/ChatCard";
import { NotificationDrop } from "../notifications/NotificationDrop";
import { QuickNav } from "../QuickNav";
import UserMenu from "../UserMenu";
import {IoChatboxOutline} from "react-icons/io5";
import {axiosClient} from "@/utils/axiosClient";
import eventEmitter from "@/components/eventEmitter";


interface CartResponse {
    count: number;
}
const MobileNav = () => {
    const router = useRouter();

    const dark = useDark();

    const theme = useMantineTheme();

    const user_id = useGetCookieUser();
    const { data: user_data } = useUser();

    const iconColorMode = dark
        ? theme.colors.yellow[6]
        : theme.colors.homaaleSlate[5];

    const [chatRoom, setChatRoom] = useState<DocumentData>();
    const [error, setError] = useState<string | number | null>(null);
    const [cartItems, setCartItems] = useState<number>(0);
    const getUserChatData =
        chatRoom &&
        Object?.entries(chatRoom)?.map((chat) => {
            return chat[1];
        });
    const fetchCartItems = async () => {
        setError(null);
        try {
            const response = await axiosClient.get<CartResponse>("/product/cart/?is_requested=true");
            setCartItems(response.data.count);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to fetch cart items");
        }
    };

    useEffect(() => {
        fetchCartItems();
        eventEmitter.on("cartUpdated", fetchCartItems);
        return () => {
            eventEmitter.off("cartUpdated", fetchCartItems);
        };
    }, []);

    const totalUnread =
        getUserChatData &&
        getUserChatData.filter(
            (item: SenderContentProps["contents"]) => item.read === false
        ).length;

    const getMessages = useCallback(() => {
        if (user_id) {
            const unsub = onSnapshot(doc(db, "userChats", user_id), (doc) => {
                setChatRoom(doc.data());
            });
            return () => {
                unsub;
            };
        }
    }, [user_id]);

    useEffect(() => {
        getMessages();
    }, [getMessages]);

    return (
        <Flex
            sx={{
                borderRadius: "lg",
                gap: "10px",
            }}
            pos={"relative"}
            h={40}
        >
            {!user_data ? (
                <Group
                    position="center"
                    grow
                    pb="xl"
                    px="md"
                    pos={"relative"}
                    mt={20}
                    w={"100%"}
                    display={"flex"}
                    sx={{
                        flexDirection: "row-reverse",
                    }}
                >
                    <Button
                        size={"sm"}
                        onClick={() => router.push("/auth/login")}
                    >
                        Log in
                    </Button>
                    <Button
                        size={"sm"}
                        color={"dark"}
                        onClick={() => router.push("/auth/signup")}
                    >
                        Sign up
                    </Button>
                </Group>
            ) : (
                <>
                    {cartItems > 0 ? (
                <Indicator
                    size={15}
                    offset={2}
                    label={cartItems}>
                    <ActionIcon
                        variant="light"
                        radius={"md"}
                        bg={
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[6]
                                : "#fff"
                        }
                        size={40}
                        onClick={() => router.push("/box")}
                        sx={{
                            "& svg": {
                                color:
                                    router.pathname === "/box"
                                        ? theme.colors.homaaleSlate[1]
                                        : iconColorMode,
                            },
                            cursor: "pointer",
                            "&:not([data-disabled]):hover": {
                                background: "transparent",
                            },
                            borderBottom:
                                router.pathname === "/box"
                                    ? `2px solid ${
                                        theme.colorScheme === "dark"
                                            ? theme.colors.gray[1]
                                            : theme.colors.gray[9]
                                    }`
                                    : "none",
                            borderRadius: "0px",
                        }}
                    >
                        <button
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[1]
                                    : theme.colors.gray[9]
                            }
                            // stroke={1.5}
                            // size={25}
                        >
                            <svg width="25" height="25" viewBox="0 0 26 16" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M1.16406 4.42188L2.80469 1.14062C2.9349 0.90625 3.14323 0.789062 3.42969 0.789062L13 1.96094L9.75781 7.39062C9.39323 7.9375 8.91146 8.13281 8.3125 7.97656L1.94531 6.17969C1.55469 6.04948 1.29427 5.8151 1.16406 5.47656C1.00781 5.13802 1.00781 4.78646 1.16406 4.42188ZM13 1.96094L22.5703 0.789062C22.8568 0.789062 23.0651 0.90625 23.1953 1.14062L24.8359 4.42188C24.9922 4.78646 24.9922 5.13802 24.8359 5.47656C24.7057 5.8151 24.4453 6.04948 24.0547 6.17969L17.6875 7.97656C17.0885 8.13281 16.6068 7.9375 16.2422 7.39062L13 1.96094ZM23 7.78125V14.3047C23 14.7214 22.8698 15.099 22.6094 15.4375C22.349 15.776 22.0104 15.9974 21.5938 16.1016L13.625 18.0938C13.2083 18.1979 12.8047 18.1979 12.4141 18.0938L4.40625 16.1016C3.98958 15.9974 3.65104 15.776 3.39062 15.4375C3.13021 15.099 3 14.7214 3 14.3047V7.78125L4.875 8.28906V14.3047L12.0625 16.1016V6.6875C12.1146 6.11458 12.4271 5.80208 13 5.75C13.5729 5.80208 13.8854 6.11458 13.9375 6.6875V16.1016L21.125 14.3047V8.28906L23 7.78125ZM12.9609 4.5H13.0391H12.9609Z"
                                    fill="#000000"/>
                            </svg></button>
                    </ActionIcon>
                </Indicator>
                    ):(
                        <ActionIcon
                            variant="light"
                            radius={"md"}
                            bg={
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[6]
                                    : "#fff"
                            }
                            size={40}
                            onClick={() => router.push("/box")}
                            sx={{
                                "& svg": {
                                    color:
                                        router.pathname === "/box"
                                            ? theme.colors.homaaleSlate[1]
                                            : iconColorMode,
                                },
                                cursor: "pointer",
                                "&:not([data-disabled]):hover": {
                                    background: "transparent",
                                },
                                borderBottom:
                                    router.pathname === "/box"
                                        ? `2px solid ${
                                            theme.colorScheme === "dark"
                                                ? theme.colors.gray[1]
                                                : theme.colors.gray[9]
                                        }`
                                        : "none",
                                borderRadius: "0px",
                            }}
                        >
                            <button
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[1]
                                        : theme.colors.gray[9]
                                }
                                // stroke={1.5}
                                // size={25}
                            >
                                <svg width="25" height="25" viewBox="0 0 26 16" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.16406 4.42188L2.80469 1.14062C2.9349 0.90625 3.14323 0.789062 3.42969 0.789062L13 1.96094L9.75781 7.39062C9.39323 7.9375 8.91146 8.13281 8.3125 7.97656L1.94531 6.17969C1.55469 6.04948 1.29427 5.8151 1.16406 5.47656C1.00781 5.13802 1.00781 4.78646 1.16406 4.42188ZM13 1.96094L22.5703 0.789062C22.8568 0.789062 23.0651 0.90625 23.1953 1.14062L24.8359 4.42188C24.9922 4.78646 24.9922 5.13802 24.8359 5.47656C24.7057 5.8151 24.4453 6.04948 24.0547 6.17969L17.6875 7.97656C17.0885 8.13281 16.6068 7.9375 16.2422 7.39062L13 1.96094ZM23 7.78125V14.3047C23 14.7214 22.8698 15.099 22.6094 15.4375C22.349 15.776 22.0104 15.9974 21.5938 16.1016L13.625 18.0938C13.2083 18.1979 12.8047 18.1979 12.4141 18.0938L4.40625 16.1016C3.98958 15.9974 3.65104 15.776 3.39062 15.4375C3.13021 15.099 3 14.7214 3 14.3047V7.78125L4.875 8.28906V14.3047L12.0625 16.1016V6.6875C12.1146 6.11458 12.4271 5.80208 13 5.75C13.5729 5.80208 13.8854 6.11458 13.9375 6.6875V16.1016L21.125 14.3047V8.28906L23 7.78125ZM12.9609 4.5H13.0391H12.9609Z"
                                        fill="#000000"/>
                                </svg></button>
                        </ActionIcon>
                    )}
                    <Indicator
                        label={totalUnread}
                        inline
                        size={15}
                        disabled={totalUnread && totalUnread > 0 ? false : true}
                    >
                        <ActionIcon
                            variant="light"
                            radius={"md"}
                            size={40}
                            bg={
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[6]
                                    : "#fff"
                            }
                            onClick={() => router.push("/chat")}
                            sx={{
                                "&:hover": {
                                    background: theme.colors.brand[2],
                                    transition: "0.35s all ease",
                                },
                                "& svg": {
                                    color:
                                        router.pathname === "/chat"
                                            ? theme.colors.homaaleSlate[1]
                                            : iconColorMode,
                                },
                                cursor: "pointer",
                                "&:not([data-disabled]):hover": {
                                    background: "transparent",
                                },
                                borderRadius: "0px",
                                borderBottom:
                                    router.pathname === "/chat"
                                        ? `2px solid ${theme.colors.gray[9]}`
                                        : "none",
                            }}
                        >
                            <IoChatboxOutline
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[1]
                                        : theme.colors.gray[9]
                                }
                                size={22}
                                // stroke={1.5}
                            />
                        </ActionIcon>
                    </Indicator>

                    <QuickNav />
                    <NotificationDrop />

                    <UserMenu />
                </>
            )}
        </Flex>
    );
};

export default MobileNav;
