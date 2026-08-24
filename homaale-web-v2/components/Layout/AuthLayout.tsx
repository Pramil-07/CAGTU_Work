import { Box, Button, Flex, Text, useMantineTheme } from "@mantine/core";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { reset } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks";
import GoogleLogo from "@/public/svgs/GoogleIcon";
import { useAuthLayoutStyles } from "@/styles/components/AuthLayoutStyles";
import type { AuthLayoutProps } from "@/types/AuthLayoutProps";
import { useDark } from "@/utils/helpers";

import meta from "../../staticData/siteMetaData.json";
import Facebook from "../auth/Facebook";
import Google from "../auth/Google";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";

const AuthLayout = ({
    title,
    description,
    ogUrl,
    keywords,
    children,
    rightImageText,
    heading,
    subHeading,
    bottomRedirectionQuestion,
    bottomRedirectionText,
    bottomRedirectionUrl,
}: AuthLayoutProps) => {
    const { classes } = useAuthLayoutStyles();
    const theme = useMantineTheme();

    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        dispatch(reset());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dark = useDark();
    const brand = useBrand()
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
                content={brandData.metaData.ogImage}
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
            </Head>
            {/* <ActionIcon
                bg={dark ? "gray.0" : "dark"}
                color={!dark ? "gray.0" : "dark.9"}
                size={"xl"}
                pos={"sticky"}
                top={"1%"}
                left={"96%"}
                onClick={() => toggleColorScheme()}
                sx={{
                    "& svg": {
                        margin: "0 !important",
                    },
                }}
            >
                {!dark ? <IconMoon size={14} /> : <IconSun />}
            </ActionIcon> */}
            <div className={classes.wrapper}>
                <Flex justify="">
                    <div className="left-container">
                        <Link href="/">
                            <Image
                                src={
                                   ( dark
                                        ? brandData.logoWhite
                                        : brandData.logoDark
     ) }
                                alt={"homaale-logo"}
                                width={117}
                                priority
                                height={32}
                            />
                        </Link>
                        <h1>{heading}</h1>
                        <p>{subHeading}</p>
                        {(router.pathname.includes("/login") ||
                            router.pathname.includes("/signup")) && (
                            <>
                                <Flex
                                    justify={"space-between"}
                                    sx={{
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box mb={8} pos={"relative"}>
                                        <Google />
                                        <Button
                                            variant="outline"
                                            leftIcon={<GoogleLogo />}
                                            sx={{
                                                height: 40,
                                                width: 220,
                                                border: `1px solid ${theme.colors.homaaleSlate[3]}`,
                                                color:
                                                    theme.colorScheme === "dark"
                                                        ? theme.colors.dark[0]
                                                        : theme.colors
                                                              .homaaleSlate[7],
                                                fontSize: 14,
                                                fontFamily: "Inter",
                                                "&:not([data-disabled]):hover":
                                                    {
                                                        background: "none",
                                                    },
                                            }}
                                        >
                                            Login with Google
                                        </Button>
                                    </Box>
                                    <Box mb={8}>
                                        <Facebook />
                                    </Box>
                                </Flex>
                                <div className="horizontal-line">
                                    <span className="or"> OR</span>
                                </div>
                            </>
                        )}
                        {children}

                        <Flex justify={"center"} mt={20}>
                            <Text
                                sx={{
                                    color: theme.colors.homaaleSlate[5],
                                }}
                            >
                                {bottomRedirectionQuestion}
                                <Link href={bottomRedirectionUrl}>
                                    <Text
                                        component="span"
                                        sx={(theme) => ({
                                            paddingTop: 2,
                                            color: theme.colors[
                                                theme.primaryColor
                                            ][4],
                                            fontWeight: 500,
                                            fontSize: 14,
                                        })}
                                    >
                                        {" "}
                                        {bottomRedirectionText}
                                    </Text>
                                </Link>
                            </Text>
                        </Flex>
                    </div>
                    <div className="right-container">
                        <p>{rightImageText}</p>
                    </div>
                </Flex>
            </div>
        </>
    );
};

export default AuthLayout;
