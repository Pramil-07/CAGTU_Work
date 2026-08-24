import {
    ActionIcon,
    Box,
    Flex,
    Group,
    Indicator,
    Select,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import {
    IconBoxSeam,
    IconBrandHipchat,
    IconCalendar,
    IconDeviceDesktopAnalytics,
} from "@tabler/icons-react";
import type { DocumentData } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

import { db } from "@/firebase";
import { useGetCookieUser } from "@/hooks/useGetCookieUser";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useDark } from "@/utils/helpers";

import type { SenderContentProps } from "../chat/ChatCard";
import { NotificationDrop } from "../notifications/NotificationDrop";
import { QuickNav } from "../QuickNav";
import UserMenu from "../UserMenu";
import {IoChatboxOutline} from "react-icons/io5";
import { useBrand } from "@/hooks/useBrand";
import {axiosClient} from "@/utils/axiosClient";
import eventEmitter from "@/components/eventEmitter";

import { useBrandData } from "@/brand/BrandContext";
import { useCurrencyOption } from "@/hooks/useCurrencyOptions";
import { useCurrency } from "@/currency/CurrencyContext";
import { toast } from "./Toast";


interface CartResponse {
    count: number;
}

const ActionNavigation = () => {
    const router = useRouter();

    const dark = useDark();
    const {brandData} = useBrandData()

    const theme = useMantineTheme();
    const brand = useBrand();
    const user_id = useGetCookieUser();
    const [error, setError] = useState<string | number | null>(null);
    const [cartItems, setCartItems] = useState<number>(0);
         const {data: currencyOption = []} = useCurrencyOption();
         const {globalCurrency,setGlobalCurrency}= useCurrency();

    const iconColorMode = dark
        ? theme.colors.homaaleSlate[5]
        : theme.colors.homaaleSlate[5];
    const iconBackgroundColorMode = dark
        ? theme.colors.gray[8]
        : theme.colors.white[0];

    const [chatRoom, setChatRoom] = useState<DocumentData>();
    const is_checkout = typeof window !== "undefined" && router.pathname === "/checkout";

    const getUserChatData =
        chatRoom &&
        Object?.entries(chatRoom)?.map((chat) => {
            return chat[1];
        });

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

    useEffect(() => {
        getMessages();
    }, [getMessages]);

    const { checkStatus } = useUserStatus();

    return (
        <>
            <Box
                sx={{
                    display: "none",
                    [theme.fn.smallerThan("md")]: {
                        display: "block",
                    },
                }}
            >
                <Link href={"/"}>
                    <Image
                        src={(
                            dark
                            ? brandData.logoWhite
                            : brandData.logoDark
                        ) }
                        alt={"homaale-logo"}
                        width={120}
                        height={120}
                        priority
                    />
                </Link>
            </Box>
            <Flex
                sx={{
                    display: "flex",
                    [theme.fn.smallerThan("md")]: {
                        display: "none",
                    },
                }}
                gap={15}
            >

                <Group
                    sx={{
                        gap: "8px",
                    }}
                >
                <Box
                 onClick={() => {is_checkout && toast.error("Cannot change currency during checkout")}}>
                 <Select

                                variant="filled"

                                size="sm"
                                title=" Currency"
                                placeholder="Select Currency"
                                name={"currency"}

                                data={currencyOption.map((item) => ({
                                    value: item.value,
                                    label: item.label,
                                }))}
                                value={globalCurrency}
                                // rightSection={null}
                                onClick={()=>is_checkout &&  toast.error("Cannot change currency during checkout")}
                                disabled={is_checkout}
                                onChange={(value) => {
                                   !is_checkout&& value && setGlobalCurrency(value)


                                }}
                                styles={{

                                    input: {
                                        width: '155px',
                                        justifyItems: 'center',
                                        '::placeholder': {
                                            fontSize: '10px',
                                        },
                                    },
                                }}
                                // onDoubleClick={() => {
                                //     const currentIndex = currencyOption.findIndex(
                                //         (item) => item.value === currency
                                //     );
                                //     const nextIndex = (currentIndex + 1) % currencyOption.length;
                                //     setCurrency(currencyOption[nextIndex].value); // Update the currency state
                                // }}
                            />
                            </Box>


                    {router?.pathname === "/" && (
                        <Tooltip
                            withArrow
                            label="Dashboard"
                            position="bottom-start"
                        >
                            <ActionIcon
                                variant="light"
                                radius={"xs"}
                                size={30}
                                onClick={() => router.push("/explore")}
                                bg={iconBackgroundColorMode}
                                sx={{
                                    "&:hover": {
                                        background: theme.colors.brand[0],
                                        transition: "0.35s all ease",
                                    },
                                    "& svg": {
                                        color: iconColorMode,
                                    },
                                    cursor: "pointer",
                                }}
                            >
                                <IconDeviceDesktopAnalytics size={18} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    <Tooltip withArrow label="Calendar" position="bottom-start">
                        <ActionIcon
                            variant="light"
                            radius={"xs"}
                            size={30}
                            onClick={() => router.push("/calendar")}
                            bg={
                                router.pathname === "/calendar"
                                    ? theme.colors.brand[0]
                                    : iconBackgroundColorMode
                            }
                            sx={{
                                "&:hover": {
                                    background: theme.colors.brand[0],
                                    transition: "0.35s all ease",
                                },
                                "& svg": {
                                    color:
                                        router.pathname === "/calendar"
                                            ? theme.colors.brand[5]
                                            : theme.colors.homaaleSlate[5],
                                },
                                cursor: "pointer",
                            }}
                        >
                            <IconCalendar size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <QuickNav />


                    <Tooltip withArrow label="Box" position="bottom-start">

                        { cartItems > 0 ? (
                            <Indicator
                            size={15}
                            offset={2}
                            label={cartItems}>
                            <ActionIcon
                                // variant="light"
                                radius={"xs"}
                                size={30}
                                onClick={() => router.push("/box")}
                                bg={
                                    router.pathname === "/box"
                                        ? theme.colors.brand[0]
                                        : iconBackgroundColorMode
                                }
                                sx={{
                                    "&:hover": {
                                        background: theme.colors.brand[0],
                                        transition: "0.35s all ease",
                                    },
                                    "& svg": {
                                        color:
                                            router.pathname === "/box"
                                                ? theme.colors.brand[5]
                                                : theme.colors.homaaleSlate[5],
                                    },
                                    cursor: "pointer",
                                }}
                            >
                                {router.pathname === "/box"
                                    ?
                                    <svg width="22" height="20" viewBox="0 0 26 19" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.16406 4.41992L2.80469 1.13867C2.9349 0.904297 3.14323 0.787109 3.42969 0.787109L13 1.95898L9.75781 7.38867C9.39323 7.93555 8.91146 8.13086 8.3125 7.97461L1.94531 6.17773C1.55469 6.04753 1.29427 5.81315 1.16406 5.47461C1.00781 5.13607 1.00781 4.78451 1.16406 4.41992ZM13 1.95898L22.5703 0.787109C22.8568 0.787109 23.0651 0.904297 23.1953 1.13867L24.8359 4.41992C24.9922 4.78451 24.9922 5.13607 24.8359 5.47461C24.7057 5.81315 24.4453 6.04753 24.0547 6.17773L17.6875 7.97461C17.0885 8.13086 16.6068 7.93555 16.2422 7.38867L13 1.95898ZM23 7.7793V14.3027C23 14.7194 22.8698 15.097 22.6094 15.4355C22.349 15.7741 22.0104 15.9954 21.5938 16.0996L13.625 18.0918C13.2083 18.196 12.8047 18.196 12.4141 18.0918L4.40625 16.0996C3.98958 15.9954 3.65104 15.7741 3.39062 15.4355C3.13021 15.097 3 14.7194 3 14.3027V7.7793L4.875 8.28711V14.3027L12.0625 16.0996V6.68555C12.1146 6.11263 12.4271 5.80013 13 5.74805C13.5729 5.80013 13.8854 6.11263 13.9375 6.68555V16.0996L21.125 14.3027V8.28711L23 7.7793ZM12.9609 4.49805H13.0391H12.9609Z"
                                            fill={theme.colors.brand[4]}/>
                                    </svg>
                                    :

                                    <svg width="22" height="20" viewBox="0 0 26 19" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.16406 4.42188L2.80469 1.14062C2.9349 0.90625 3.14323 0.789062 3.42969 0.789062L13 1.96094L9.75781 7.39062C9.39323 7.9375 8.91146 8.13281 8.3125 7.97656L1.94531 6.17969C1.55469 6.04948 1.29427 5.8151 1.16406 5.47656C1.00781 5.13802 1.00781 4.78646 1.16406 4.42188ZM13 1.96094L22.5703 0.789062C22.8568 0.789062 23.0651 0.90625 23.1953 1.14062L24.8359 4.42188C24.9922 4.78646 24.9922 5.13802 24.8359 5.47656C24.7057 5.8151 24.4453 6.04948 24.0547 6.17969L17.6875 7.97656C17.0885 8.13281 16.6068 7.9375 16.2422 7.39062L13 1.96094ZM23 7.78125V14.3047C23 14.7214 22.8698 15.099 22.6094 15.4375C22.349 15.776 22.0104 15.9974 21.5938 16.1016L13.625 18.0938C13.2083 18.1979 12.8047 18.1979 12.4141 18.0938L4.40625 16.1016C3.98958 15.9974 3.65104 15.776 3.39062 15.4375C3.13021 15.099 3 14.7214 3 14.3047V7.78125L4.875 8.28906V14.3047L12.0625 16.1016V6.6875C12.1146 6.11458 12.4271 5.80208 13 5.75C13.5729 5.80208 13.8854 6.11458 13.9375 6.6875V16.1016L21.125 14.3047V8.28906L23 7.78125ZM12.9609 4.5H13.0391H12.9609Z"
                                            fill="#868E96"/>
                                    </svg>
                                }
                            </ActionIcon>
                        </Indicator>
                            ) : (
                            <ActionIcon
                                // variant="light"
                                radius={"xs"}
                                size={30}
                                onClick={() => router.push("/box")}
                                bg={
                                    router.pathname === "/box"
                                        ? theme.colors.brand[0]
                                        : iconBackgroundColorMode
                                }
                                sx={{
                                    "&:hover": {
                                        background: theme.colors.brand[0],
                                        transition: "0.35s all ease",
                                    },
                                    "& svg": {
                                        color:
                                            router.pathname === "/box"
                                                ? theme.colors.brand[5]
                                                : theme.colors.homaaleSlate[5],
                                    },
                                    cursor: "pointer",
                                }}
                            >
                                {router.pathname === "/box"
                                    ?
                                    <svg width="22" height="20" viewBox="0 0 26 19" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.16406 4.41992L2.80469 1.13867C2.9349 0.904297 3.14323 0.787109 3.42969 0.787109L13 1.95898L9.75781 7.38867C9.39323 7.93555 8.91146 8.13086 8.3125 7.97461L1.94531 6.17773C1.55469 6.04753 1.29427 5.81315 1.16406 5.47461C1.00781 5.13607 1.00781 4.78451 1.16406 4.41992ZM13 1.95898L22.5703 0.787109C22.8568 0.787109 23.0651 0.904297 23.1953 1.13867L24.8359 4.41992C24.9922 4.78451 24.9922 5.13607 24.8359 5.47461C24.7057 5.81315 24.4453 6.04753 24.0547 6.17773L17.6875 7.97461C17.0885 8.13086 16.6068 7.93555 16.2422 7.38867L13 1.95898ZM23 7.7793V14.3027C23 14.7194 22.8698 15.097 22.6094 15.4355C22.349 15.7741 22.0104 15.9954 21.5938 16.0996L13.625 18.0918C13.2083 18.196 12.8047 18.196 12.4141 18.0918L4.40625 16.0996C3.98958 15.9954 3.65104 15.7741 3.39062 15.4355C3.13021 15.097 3 14.7194 3 14.3027V7.7793L4.875 8.28711V14.3027L12.0625 16.0996V6.68555C12.1146 6.11263 12.4271 5.80013 13 5.74805C13.5729 5.80013 13.8854 6.11263 13.9375 6.68555V16.0996L21.125 14.3027V8.28711L23 7.7793ZM12.9609 4.49805H13.0391H12.9609Z"
                                            fill={theme.colors.brand[4]}/>
                                    </svg>
                                    :

                                    <svg width="22" height="20" viewBox="0 0 26 19" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.16406 4.42188L2.80469 1.14062C2.9349 0.90625 3.14323 0.789062 3.42969 0.789062L13 1.96094L9.75781 7.39062C9.39323 7.9375 8.91146 8.13281 8.3125 7.97656L1.94531 6.17969C1.55469 6.04948 1.29427 5.8151 1.16406 5.47656C1.00781 5.13802 1.00781 4.78646 1.16406 4.42188ZM13 1.96094L22.5703 0.789062C22.8568 0.789062 23.0651 0.90625 23.1953 1.14062L24.8359 4.42188C24.9922 4.78646 24.9922 5.13802 24.8359 5.47656C24.7057 5.8151 24.4453 6.04948 24.0547 6.17969L17.6875 7.97656C17.0885 8.13281 16.6068 7.9375 16.2422 7.39062L13 1.96094ZM23 7.78125V14.3047C23 14.7214 22.8698 15.099 22.6094 15.4375C22.349 15.776 22.0104 15.9974 21.5938 16.1016L13.625 18.0938C13.2083 18.1979 12.8047 18.1979 12.4141 18.0938L4.40625 16.1016C3.98958 15.9974 3.65104 15.776 3.39062 15.4375C3.13021 15.099 3 14.7214 3 14.3047V7.78125L4.875 8.28906V14.3047L12.0625 16.1016V6.6875C12.1146 6.11458 12.4271 5.80208 13 5.75C13.5729 5.80208 13.8854 6.11458 13.9375 6.6875V16.1016L21.125 14.3047V8.28906L23 7.78125ZM12.9609 4.5H13.0391H12.9609Z"
                                            fill="#868E96"/>
                                    </svg>
                                }
                            </ActionIcon>
                            )}
                                </Tooltip>

                            {totalUnread && totalUnread > 0 ? (
                                <Tooltip withArrow label="Chat" position="bottom-start">
                                <Indicator label={totalUnread} inline size={15}>
                            <ActionIcon
                                variant="light"
                                radius={"xs"}
                                size={30}
                                onClick={() => {
                                    if (checkStatus("kyc")) {
                                        router.push("/chat");
                                    }
                                }}
                                bg={
                                    router.pathname === "/chat"
                                        ? theme.colors.brand[0]
                                        : iconBackgroundColorMode
                                }
                                sx={{
                                    "&:hover": {
                                        background: theme.colors.brand[0],
                                        transition: "0.35s all ease",
                                    },
                                    "& svg": {
                                        color:
                                                router.pathname === "/chat"
                                                    ? theme.colors.brand[5]
                                                    : theme.colors.homaaleSlate[5],
                                        },
                                        cursor: "pointer",
                                    }}
                                >
                                    <IoChatboxOutline size={19} />
                                </ActionIcon>
                            </Indicator>
                        </Tooltip>
                    ) : (
                        // </Indicator>
                        <Tooltip withArrow label="Chat" position="bottom">
                            <ActionIcon
                                variant="light"
                                radius={"xs"}
                                size={30}
                                onClick={() => router.push("/chat")}
                                bg={
                                    router.pathname === "/chat"
                                        ? theme.colors.brand[0]
                                        : iconBackgroundColorMode
                                }
                                sx={{
                                    "&:hover": {
                                        background: theme.colors.brand[0],
                                        transition: "0.35s all ease",
                                    },
                                    "& svg": {
                                        color:
                                            router.pathname === "/chat"
                                                ? theme.colors.brand[5]
                                                : theme.colors.homaaleSlate[5],
                                    },
                                    cursor: "pointer",
                                }}
                            >
                                <IoChatboxOutline size={19} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    <NotificationDrop />
                </Group>
                <UserMenu />
            </Flex>
        </>
    );
};

export default ActionNavigation;
