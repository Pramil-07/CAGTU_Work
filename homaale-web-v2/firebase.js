/* eslint-disable no-unused-vars */
// Import the functions you need from the SDKs you need
import { showNotification } from "@mantine/notifications";
import {
    IconBriefcase,
    IconBrowserCheck,
    IconCash,
    IconCheckbox,
    IconChecks,
    IconCircleX,
    IconInfoCircle,
    IconScriptPlus,
    IconSquareX,
    IconUserCheck,
} from "@tabler/icons-react";
import { TITLE_TYPES } from "constants/NotificationTitleTypes";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Cookies from "js-cookie";
import Link from "next/link";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGE_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firebaseCloudMessaging = {
    tokenInCookies: async () => {
        const token = Cookies.get("fcm_token");
        return token;
    },
    onMessage: async () => {
        const messaging = getMessaging();

        onMessage(messaging, (payload) => {
            const content = payload?.data?.content
                ? JSON.parse(payload?.data?.content)
                : null;

            const renderBodyWRTTitle = () => {
                switch (content.action) {
                    case TITLE_TYPES.approval:
                        return {
                            icon: <IconBrowserCheck />,
                            color: "blue",
                        };
                    case TITLE_TYPES.approved:
                        return {
                            icon: <IconChecks />,
                            color: "green",
                        };
                    case TITLE_TYPES.booking:
                        return {
                            icon: <IconBriefcase />,
                            color: "blue",
                        };
                    case TITLE_TYPES.created:
                        return {
                            icon: <IconScriptPlus />,
                            color: "blue",
                        };
                    case TITLE_TYPES.status_closed:
                        return {
                            icon: <IconCircleX />,
                            color: "green",
                        };
                    case TITLE_TYPES.status_completed:
                        return {
                            icon: <IconCheckbox />,
                            color: "green",
                        };
                    case TITLE_TYPES.rejected:
                        return {
                            icon: <IconSquareX />,
                            color: "red",
                        };
                    case TITLE_TYPES.followed:
                        return {
                            icon: <IconUserCheck />,
                            color: "blue",
                        };
                    case TITLE_TYPES.payment_completed:
                        return {
                            icon: <IconCash />,
                            color: "blue",
                        };
                    case TITLE_TYPES.cancelled:
                        return {
                            icon: <IconSquareX />,
                            color: "red",
                        };
                    case TITLE_TYPES.reward_earned:
                        return {
                            icon: <IconCash />,
                            color: "blue",
                        };
                    case TITLE_TYPES.accepted:
                        return {
                            icon: <IconUserCheck />,
                            color: "blue",
                        };
                    case TITLE_TYPES.negotiated:
                        return {
                            icon: <IconCash />,
                            color: "orange",
                        };
                    default:
                        return {
                            icon: <IconInfoCircle />,
                            color: "yellow",
                        };
                }
            };

            const handleRedirect = () => {
                switch (content?.action) {
                    case TITLE_TYPES.followed:
                        return `/tasker/${content?.content_object?.id}`;

                    case TITLE_TYPES.created:
                        if (content) {
                            return `/tasks/${content?.content_object?.id}`;
                        } else {
                            return `/services/${content?.content_object?.slug}`;
                        }
                    case TITLE_TYPES.reward_earned:
                        return `/profile`;

                    case TITLE_TYPES.approved:
                        return `/booking/${content?.content_object?.task}`;
                    case TITLE_TYPES.booking:
                        return `/box`;

                    default:
                        if (content?.content_object?.is_requested) {
                            return `/tasks/${content?.content_object?.id}`;
                        } else {
                            return `/services/${content?.content_object?.slug}`;
                        }
                }
            };

            showNotification({
                id: content?.content_object?.id,
                disallowClose: false,
                autoClose: 6000,
                title: (
                    <Link href={handleRedirect()} color={"blue"}>
                        <div role={"button"}>{payload?.data?.title}</div>
                    </Link>
                ),
                color: renderBodyWRTTitle()?.color,
                icon: renderBodyWRTTitle()?.icon,
            });
        });
    },

    init: async function () {
        try {
            //
            const messaging = getMessaging(app);
            await Notification.requestPermission();
            getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
            })
                .then((currentToken) => {
                    //
                    if (currentToken) {
                        Cookies.set("fcm_token", currentToken);
                    }
                })
                .catch((err) => {
                    console.log("🚀 ~ file: firebase.js:85 ~ err", err);
                });
        } catch (error) {
            console.error(error);
        }
    },
};

export { firebaseCloudMessaging };
export const db = getFirestore();
