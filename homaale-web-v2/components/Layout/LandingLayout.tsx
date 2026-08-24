import { ActionIcon, MediaQuery, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import Head from "next/head";
import type { FC } from "react";
import React from "react";

import { useGetCookieUser } from "@/hooks/useGetCookieUser";
import { useLandingStyles } from "@/styles/pages/LandingStyles";
import type { MetaDataProps } from "@/types/MetaDataProps";
import { useDark } from "@/utils/helpers";

import meta from "../../staticData/siteMetaData.json";
import LandingHeader from "../LandingHeader";
import { Footer } from "./Footer";
import MobileNav from "./MobileNav";
import { useBrandData } from "@/brand/BrandContext";

const LandingLayout: FC<MetaDataProps> = ({
    title,
    description,
    ogUrl,
    ogImage,
    keywords,
    children,
}) => {
    const dark = useDark();

    const { toggleColorScheme } = useMantineColorScheme();
    const homaaleOgImage =
        "https://cipher-media-files.s3.amazonaws.com/media/cipher/user/media/homaale-light.jpg";
    const user_id = useGetCookieUser();

    const { classes } = useLandingStyles();
    const {brandData}= useBrandData()

    return (
        <>
            <Head>

            {/* Primary Meta Tags */}
            <title>{!title ? brandData.metaData.title : title}</title>
            <meta name="title" content={!title ? brandData.metaData.title : title}></meta>
            <meta
                name="description"
                content={!description ? brandData.metaData.description : description}
            />


            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta
                property="og:url"
                content={!ogUrl ? brandData.metaData.ogUrl : ogUrl}
            />
            <meta
                property="og:title"
                content={!title ? brandData.metaData.title : title}
            />
            <meta
                property="og:description"
                content={!description ? brandData.metaData.description : description}
            />
            <meta  
                property="og:image"
                content={!ogImage ? brandData.metaData.ogImage: ogImage}
            />

            {/* Twitter */}
            <meta name="twitter:url" content={"https://www.homaale.com/"} />
            <meta
                name="twitter:title"
                content={!title ? brandData.metaData.title: title}
            />
            <meta
                name="twitter:description"
                content={!description ? brandData.metaData.description : description}
            />
          
            <meta
                name="keywords"
                content={!keywords ? brandData.metaData.keywords : keywords}
            />
            <meta name="robots" content="index, follow" />
            <link
                        rel="shortcut icon"
                        href={brandData.favicon}
                        type="image/x-icon"
                    />
                    <link
                        rel="apple-touch-icon"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="57x57"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="72x72"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="76x76"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="114x114"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="120x120"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="144x144"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="152x152"
                        href={brandData.favicon}
                    />
                    <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href={brandData.favicon}
                    />
                    <link rel="apple-touch-icon" href="/icon.png" />
            </Head>
            <main>
                <LandingHeader />
                {/* {!user_id && (
                    <MediaQuery
                        largerThan={"md"}
                        styles={{
                            display: "none",
                        }}
                    >
                        <ActionIcon
                            bg={dark ? "gray.0" : "dark"}
                            color={!dark ? "gray.0" : "dark.9"}
                            size={"xl"}
                            pos={"fixed"}
                            top={{ base: "84%", sm: "90%", lg: "93%" }}
                            right={{ base: "89%", sm: "95%", lg: "97%" }}
                            onClick={() => toggleColorScheme()}
                            sx={{
                                zIndex: 1001,
                                "&:hover": {
                                    color: dark ? "white" : "black",
                                },
                                "& svg": {
                                    margin: "0 !important",
                                },
                            }}
                        >
                            {!dark ? <IconMoon /> : <IconSun />}
                        </ActionIcon>

                    </MediaQuery>
                )} */}

                {children}
                <Footer />

                <section className={classes.mobileNavigation}>
                    <MobileNav />
                </section>
            </main>
        </>
    );
};

export default LandingLayout;
