import {
    ActionIcon,
    AppShell,
    Box,
    Button,
    Container,
    MantineProvider,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconArrowNarrowRight,
    IconExclamationCircle, IconMoon, IconSun,
} from "@tabler/icons-react";
import Head from "next/head";
import { useRouter } from "next/router";
import {FC, useEffect} from "react";
import React, { useState } from "react";
import { useGetCookieUser } from "@/hooks/useGetCookieUser";
import { useUser } from "@/hooks/useUser";
import { useTopHeaderNotificationStyles } from "@/styles/components/TopHeaderNotification";
import { useLandingStyles } from "@/styles/pages/LandingStyles";
import type { MetaDataProps } from "@/types/MetaDataProps";
import { useDark } from "@/utils/helpers";

import meta from "../../staticData/siteMetaData.json";
import { CollapsedNavbar } from "./CollapsedNavbar";
import { MainHeader } from "./MainHeader";
import MobileNav from "./MobileNav";
import { SideNavbar } from "./SideNavbar";
import {useMediaQuery} from "@mantine/hooks";
import { Notifications, notifications } from "@mantine/notifications";
import { useUserStatus } from "@/hooks/useUserStatus";
import { kyc } from "@/features/utils/modalSlice";
import { useGetNotification } from "@/hooks/useNotification";
import { NotificationsAlert } from "../notifications/NotificationsAlert";
import { SearchBar } from "../common/SearchBar";
import { isUndefined } from "util";
import Breadcrumb from "../common/BreadCrumb";
import { useBrand } from "@/hooks/useBrand";
import HomaaleLoader from "../common/HomaaleLoader";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import {useBrandData} from "@/brand/BrandContext";
import Header from "../hotels/Header";
// import { u } from "framer-motion/dist/types.d-B50aGbjN";

const Layout: FC<MetaDataProps> = ({
    heading,
    title,
    description,
    ogUrl,
    ogImage,
    keywords,
    children,
    currentTitle,
    breadCrumbsItems,
    hideBreadCrumbs=false,

}, toggleColorScheme,) => {
    const homaaleOgImage =
        "https://cipher-media-files.s3.amazonaws.com/media/cipher/user/media/homaale-light.jpg";

    const theme = useMantineTheme();
    const dark = useDark();
    const brand = useBrand()
    const {brandData } =useBrandData()
    const categoryPage = heading === "Stays" ;
    const [opened, setOpened] = useState(false);
    const [currency, setCurrency] = useState<string | null>(null);
    const [navbarCollapsed, setNavbarCollapsed] = useState(
        typeof window != "undefined"
            ? localStorage.getItem("isNavbarCollapsed")
            : "false"
    );
      const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: null as string | null,
    checkOut: null as string | null,
    guests: 1,
  });
   // console.log(hideBreadCrumbs,"from sold products")
console.log("Currency Form Layout ",currency)

    useEffect(() => {
        typeof window != "undefined"
            ? localStorage.setItem(
                  "isNavbarCollapsed",
                  navbarCollapsed ?? "false"
              )
            : "";
    }, [navbarCollapsed]);


    // Load currency from localStorage on mount

    useEffect(() => {
      const stored = localStorage.getItem("currency");
      if (stored) setCurrency(stored);
    }, []);

    useEffect(() => {
        const handleNavbarUpdate = () => {
            const collapsed = localStorage.getItem('isNavbarCollapsed') === 'true';
            setNavbarCollapsed(collapsed ? 'true' : 'false');
        };
        handleNavbarUpdate();
        window.addEventListener('navbar-collapse-update', handleNavbarUpdate);
        return () => {
            window.removeEventListener('navbar-collapse-update', handleNavbarUpdate);
        };
    }, []);

    useEffect(() => {
      if (currency) {
        localStorage.setItem("currency", currency);
      }
    }, [currency]);
    const { data: userStatus } = useUser();

    const { classes } = useTopHeaderNotificationStyles();

    const { classes: landingStyles } = useLandingStyles();

    const router = useRouter();
    const is_accountPage = router.pathname === "/settings/account";

    const user_id = useGetCookieUser();
    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    // img of hotles
    const hotelImages = [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80",
        "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ];
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
            </Head>

            <AppShell
      styles={{
        main: {
          background: dark ? theme.colors.dark[8] : "#fff",
          transition : "400ms all",
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      layout="alt"
      navbar={
        isSmallScreen ? (
          opened ? (
            <SideNavbar
              key="side-navbar"
              opened={opened}
              setOpened={setOpened}
              navbarCollapsed={navbarCollapsed}
              setNavbarCollapsed={setNavbarCollapsed}

              style={{
                marginTop: 55,
                float: "left",
                maxHeight: "5000px",


              }}
            />
          ) : undefined
        ) : navbarCollapsed === "true" && !categoryPage ? (
          <CollapsedNavbar
            key="collapsed-navbar"
             setNavbarCollapsed={setNavbarCollapsed}
          />
        ) : heading !== "Stays" ? (
          <SideNavbar
            key="side-navbar"
            opened={true}
            setOpened={setOpened}
            navbarCollapsed={navbarCollapsed}
            setNavbarCollapsed={setNavbarCollapsed}
            style={{
              float: "left",
              maxHeight: "5000px",

            }}
          />
        ) : undefined
      }
      header={
        router.query.mobile_app ? undefined : (
          <MainHeader
            style={{
              position: "relative",
              top: 0,

            }}
            category={categoryPage}
            setOpened={setOpened}
            opened={opened}
            navbarCollapsed={navbarCollapsed??""}
            setNavbarCollapsed={setNavbarCollapsed}
            currentTitle={currentTitle}
            breadCrumbsItems={breadCrumbsItems}
            onCurrencyChange={setCurrency}
          />
        )
      }
    >




                {userStatus?.is_suspended && (
                    <Box
                        className={classes.suspended}
                        pos={"relative"}
                        w={"100%"}
                        mt={-16}
                        ml={-16}
                    >
                        <Container style={{ maxWidth: 1500 }}>
                            <Box className={classes.topheadernotification}>
                                <Text
                                    sx={{
                                        display: "flex",
                                        textAlign: "center",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color:
                                            theme.colorScheme === "dark"
                                                ? "white"
                                                : "#FE5050",
                                    }}
                                >
                                    <IconExclamationCircle /> Your account has
                                    been suspended. If you have any query,
                                    please contact Homaale Support Team.
                                    <Button
                                        size={"xs"}
                                        color={"dark"}
                                        ml={24}
                                        onClick={() => router.push("/support")}
                                    >
                                        Go To Support{" "}
                                        <IconArrowNarrowRight size={20} />
                                    </Button>
                                </Text>
                            </Box>
                        </Container>
                    </Box>
                )}
                {userStatus && !userStatus?.has_profile && !is_accountPage && (
                    <Box
                        className={classes.incomplete}
                        pos={"relative"}
                        w={"100%"}
                        mt={-16}
                        ml={-16}
                    >


                        <Container style={{ maxWidth: 1500 }}>
                            <Box className={classes.topheadernotification}>
                                <Text
                                    sx={{
                                        display: "flex",
                                        textAlign: "center",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color:
                                            theme.colorScheme === "dark"
                                                ? "white"
                                                : theme.colors.status[0],
                                    }}
                                >
                                    <IconExclamationCircle /> You haven&apos;t
                                    completed your profile. Please complete your
                                    profile
                                    <Button
                                        size={"xs"}
                                        color={"dark"}
                                        ml={24}
                                        onClick={() =>
                                            router.push("/settings/account")
                                        }
                                    >
                                        Go To Profile{" "}
                                        <IconArrowNarrowRight size={20} />
                                    </Button>
                                </Text>
                            </Box>
                        </Container>
                    </Box>
                )}
                <Box component="section" >

                    {heading && (
                        categoryPage ? (
                            <Box
                                sx={{
                                    marginBottom: "10px",
                                    borderRadius: theme.radius.md,
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                {/* <Carousel
                                    // withIndicators
                                    height={500}
                                    slideSize="100%"
                                    slideGap="md"
                                    loop
                                    align="start"
                                    slidesToScroll={undefined}
                                     withControls ={false}
                                    // plugins={[Autoplay({ delay: 5000 })]}
                                    styles={{
                                        indicator: {
                                            backgroundColor: theme.colors.brand[1],
                                            opacity: 0.7,
                                            '&[data-active]': {
                                                opacity: 1,
                                            },
                                        },
                                        control: {
                                            backgroundColor: theme.colors.dark[7],
                                            borderColor: theme.colors.brand[5],
                                            color: theme.colors.brand[5],
                                            opacity: 0.8,
                                        },
                                    }}
                                >
                                    {hotelImages.map((image, index) => (
                                        <Carousel.Slide key={index}>
                                            <img
                                                src={image}
                                                alt={`Hotel image ${index + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Carousel.Slide>
                                    ))}
                                </Carousel>
                                         <Box  style={{         position: "absolute",
                                        top: "75%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        color: theme.white,
                                        width: "70%",
                                        fontWeight: 400,

                                        margin: 0, }}>
                                      <Header onSearch={setSearchParams} />

                                        </Box>
                                <Text
                                    component="h4"
                                    sx={{
                                        position: "absolute",
                                        top: "40%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        color: theme.white,
                                        fontSize: "32px",
                                        fontWeight: 900,
                                        textShadow: "2px 2px 4px rgba(0, 0, 0, 1)",
                                        margin: 0,
                                    }}
                                >Discover Luxury Hotels Worldwide

                                </Text>
                                  <Text
                                    component="h4"
                                    sx={{
                                        position: "absolute",
                                        top: "48%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        color: theme.white,
                                        fontSize: "32px",
                                        fontWeight: 400,
                                        textShadow: "2px 2px 4px rgba(0, 0, 0, 1)",
                                        margin: 0,
                                    }}
                                >find your perfect stay

                                </Text>
                                          */}
                            </Box>
                        ) :
                        (
                            <h4
                                id="page-heading"
                                style={{
                                    borderBottom: "1px solid #00000008",
                                    paddingBottom: 1,
                                    marginBottom: 1,
                                }}
                            >
                                {heading}
                            </h4>
                        )
                    )}
                { !hideBreadCrumbs&&

                    <div style={{paddingTop:"5px",paddingBottom:"10px"

                }}>

                        {!isSmallScreen && (<Breadcrumb
                            currentTitle={currentTitle ?? ""}
                            items={breadCrumbsItems}

                        />)}
                            </div>}


                    {children}

                </Box>



            </AppShell>
            {!user_id || router.query.mobile_app ? (
                ""
            ) : (
                <section className={landingStyles.mobileNavigation}>
                    <MobileNav />

                </section>
            )}
               <MantineProvider>

          <NotificationsAlert />

        </MantineProvider>

        </>
    );
};

export default Layout;
