import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {Dialog, Text} from "@mantine/core";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {
    Hydrate,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import type {AppProps} from "next/app";
import NextNProgress from "nextjs-progressbar";
import React, {useEffect, useState} from "react";
import {Provider} from "react-redux";

import {PopUpModal} from "@/components/common/PopUpModal";
import {store} from "@/store";
import BaseThemeProvider from "@/theme/BaseThemeProvider";
import {useRef} from 'react';
import TawkMessengerReact from '@/components/TawkMessenger';
import {firebaseCloudMessaging} from "../firebase";
import "../styles/globals.css";
import {modals, ModalsProvider} from '@mantine/modals';
import 'primereact/resources/themes/saga-blue/theme.css'; // Or your theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Script from "next/script";
import {getGoogleMapsApiKey} from "@/utils/getApiKey";
import {isLoggedIn} from "@/utils/helpers";
import { useBrand } from "@/hooks/useBrand";
import { BrandProvider } from "@/brand/BrandContext";
import { CurrencyProvider } from "@/currency/CurrencyContext";
import FloatingAiButton from "@/components/FloatingAiButton";


export default function App({Component, pageProps}: AppProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: false,
                    },
                },
            })
    );

    const [mounted, setMounted] = useState(false);
    const [opened, setOpened] = useState(false);
    const [token, setToken] = useState("");

    if (mounted) {
        firebaseCloudMessaging.onMessage();
    }

    const getFire = () =>
        firebaseCloudMessaging
            .tokenInCookies()
            .then((data) => {
                setToken(data ?? "");
            })
            .catch((err) => {
                console.log(err);
            });

    useEffect(() => {
        firebaseCloudMessaging.init();
        const setToken = async () => {
            const token = await firebaseCloudMessaging.tokenInCookies();
            if (token) {
                setMounted(true);
            }
        };
        setToken();
        getFire();
    }, [token]);

    useEffect(() => {
        if (!token && typeof window !== "undefined" && mounted) {
            navigator.serviceWorker.getRegistrations().then((r) => {
                return Promise.all(r.map((reg) => reg.unregister()));
            });
        }
    }, [token, mounted]);
    const brand= useBrand()

    // useEffect(() => {
    //     if (typeof window !== "undefined") {
    //         const script = document.createElement("script");
    //         script.src =
    //             "https://embed.tawk.to/6780e310af5bfec1dbe9a0dc/1ih7ndu7g";
    //         script.async = true;
    //         script.charset = "UTF-8";
    //         script.setAttribute("crossorigin", "*");
    //         document.body.appendChild(script);

    //         return () => {
    //             document.body.removeChild(script); // Clean up when component is unmounted
    //         };
    //     }
    // }, []);

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}&libraries=places`}
                strategy="beforeInteractive"
            />
            <GoogleOAuthProvider
                clientId={
                    "245846975950-vucoc2e1cmeielq5f5neoca7880n0u2i.apps.googleusercontent.com"
                }
            >
                <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools/>
                    <Hydrate state={pageProps.dehydratedState}>
                        <Provider store={store}>
                        <CurrencyProvider>
                            <BrandProvider>
                            <BaseThemeProvider>
                                <ModalsProvider>
                                    <NextNProgress
                                        height={4}
                                        options={{showSpinner: false}}
                                        color={brand==="cagtu"?"#1aa9ff":"#f9971f"}
                                    />
                                    <Component {...pageProps} />
                                    <PopUpModal/>
                                </ModalsProvider>
                            </BaseThemeProvider>
                            </BrandProvider>
                            </CurrencyProvider>
                        </Provider>
                    </Hydrate>
                </QueryClientProvider>
            </GoogleOAuthProvider>
            <Dialog
                opened={opened}
                onClose={() => setOpened(false)}
                size="lg"
                radius="md"
                className="d-flex gap-3 notification-dialog"
            >
                <Text
                    size="sm"
                    className="m-0"
                    style={{marginBottom: 10}}
                    weight={400}
                >
                    Allow notification for Web notifications.
                </Text>
                <Text
                    color="green"
                    size="sm"
                    className="m-0"
                    style={{marginBottom: 10, cursor: "pointer"}}
                    weight={500}
                    onClick={() => {
                        Notification.requestPermission();
                        setOpened(false);
                    }}
                >
                    Ok.
                </Text>
                <Text
                    color="red"
                    size="sm"
                    className="m-0"
                    style={{marginBottom: 10, cursor: "pointer"}}
                    weight={500}
                    onClick={() => {
                        setOpened(false);
                    }}
                >
                    No Thanks
                </Text>
            </Dialog>

            {/*{!isLoggedIn () && (*/}
            <div className="App absolute right-1 ">
                {/*{typeof window !== 'undefined' && (
                    <FloatingAiButton />
                )}*/}
                {typeof window !== 'undefined' && (
                    <TawkMessengerReact
                        propertyId="67f608a70bd26b190e7e63d4"
                        widgetId="1ioch3jsu"
                    />
                )}
            </div>
            {/*)}*/}
        </>
    );
}
