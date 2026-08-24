import {
    AspectRatio,
    Box,
    Button,
    Container,
    Flex,
    Grid,
    keyframes,
    MediaQuery,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {IconArrowRight, IconChevronRight, IconSearch} from "@tabler/icons-react";
import {useQuery} from "@tanstack/react-query";
import type {GetStaticProps, NextPage} from "next";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";
import type {Settings} from "react-slick";
import Slider from "react-slick";

import {ServiceCard} from "@/components/cards/ServiceCard";
import {BlogCard} from "@/components/common/BlogCard";
import {CategoryCard} from "@/components/common/CategoryCard";
import {CategoryCardMobile} from "@/components/common/form/CategoryCardMobile";
import {HoverTag} from "@/components/common/HoverCard";
import {InfoBanner} from "@/components/common/InfoBanner";
import NoDataAlert from "@/components/common/NoDataAlert";
import {SearchBar} from "@/components/common/SearchBar";
import {TaskerCard} from "@/components/common/TaskerCard";
import {TrustCard} from "@/components/common/TrustCard";
import LandingLayout from "@/components/Layout/LandingLayout";
import urls from "@/constants/urls";
import {getLocation} from "@/features/utils/locationSlice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useGetAds} from "@/hooks/useGetAds";
import {useGetCookieUser} from "@/hooks/useGetCookieUser";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useWeather} from "@/hooks/useWeather";
import {useLandingStyles} from "@/styles/pages/LandingStyles";
import {poppins} from "@/theme/GlobalTheme";
import type {BlogProps} from "@/types/BlogsProps";
import type {EntityServiceLisitngProps} from "@/types/EntityServiceLisitngProps";
import type {TaskerProps} from "@/types/TaskerProps";
import type {TopCategoryProps} from "@/types/TopCategoryProps";
import type {TrustedPartnersProps} from "@/types/TrustedPartnersProps";
import {axiosClient} from "@/utils/axiosClient";
import * as https from "node:https";
import {useMediaQuery} from "@mantine/hooks";
import ProductCard, {Product} from "@/components/ProductCard/ProductCard";
import ThreeCardsServicesBlock from "@/components/ThreeCardsServicesBlock";
import type {ExploreServicesProps} from "@/types/ExploreServicesProps";
import {CardSkeletonGrid} from "@/pages/explore/services";
import Autoplay from 'embla-carousel-autoplay';
import {Carousel} from "@mantine/carousel";
import {useBrand} from "@/hooks/useBrand";
import CustomSlickCarousel from "@/components/carousel/CustomSlickCarousel";
import {useBrandData} from "@/brand/BrandContext";
import {colors} from "@react-spring/shared";


// import '@mantine/carousel/styles.css';

export const floatSide = keyframes({
    "0%": {left: -55, top: 0, opacity: 1},
    "100%": {left: 800, top: 0, opacity: 1},
});

const Home: NextPage<{
    topCategoryData: TopCategoryProps;
    trustedPartnerData: TrustedPartnersProps;
    blogData: BlogProps;
    topTaskerData: TaskerProps;
    servicesData: EntityServiceLisitngProps;
    recommendedTasksData: EntityServiceLisitngProps;
}> = ({
          topCategoryData,
          trustedPartnerData,
          blogData,
          topTaskerData,
          servicesData,
          recommendedTasksData,
      }) => {
    const settings: Settings = {
        dots: false,
        speed: 500,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        adaptiveHeight: true,
        centerMode: true,
        slidesToShow: 6,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    centerMode: true,
                },
            },
        ],
    };
    const theme = useMantineTheme();
    const {classes} = useLandingStyles();
    const {brandData} = useBrandData()
    const isSm = useMediaQuery("(max-width: 768px)");
    const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const isLg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userJson = localStorage.getItem("location");
            if (!userJson) {
                dispatch(getLocation());
            }
        }
    }, [dispatch]);
    const autoplay = useRef(Autoplay({delay: 2000}));

    const {data: location, radius} = useAppSelector((state) => state.locationReducer);

    const {data: weather} = useWeather();
    const {data = servicesData} = useQuery(["service-landing"], async () => {
        try {
            const {data} = await axiosClient.get<EntityServiceLisitngProps>(
                `${urls.entity.service}&status_choice=published&page_size=3`
            );
            return data;
        } catch (error) {
            console.log("🚀 ~ file: index.tsx:18 ~ error", error);
        }
    });

    const router = useRouter();

    //useEffects to maintain scrollPosition upon redirecting back to homepage
    //changes the scrollRestoration property in the browser's history to manual when the page is loaded."auto" is default.

    useEffect(() => {
        if (
            "scrollRestoration" in history &&
            history.scrollRestoration !== "manual"
        ) {
            history.scrollRestoration = "manual";
        }
    }, []);

    // handle and store scroll position in the browser's session storage as `scrollPosition`
    useEffect(() => {
        const handleRouteChange = () => {
            sessionStorage.setItem("scrollPosition", window.scrollY.toString());
        };
        router.events.on("routeChangeStart", handleRouteChange);
        return () => {
            router.events.off("routeChangeStart", handleRouteChange);
        };
    }, [router.events]);

    // restore scroll position
    useEffect(() => {
        if ("scrollPosition" in sessionStorage) {
            window.scrollTo(
                0,
                Number(sessionStorage.getItem("scrollPosition"))
            );
            sessionStorage.removeItem("scrollPosition");
        }
    }, []);

    const {checkStatus} = useUserStatus();

    const loggedInUser = useGetCookieUser();
    const {data: ads} = useGetAds("/");

    const [topCategoryDataState, setTopCategoryDataState] =
        useState<TopCategoryProps | null>(null);
    const [trustedPartnerDataState, setTrustedPartnerDataState] =
        useState<TrustedPartnersProps | null>([]);
    const [blogDataState, setBlogDataState] = useState<BlogProps | null>(null);
    const [topTaskerDataState, setTopTaskerDataState] = useState<TaskerProps>();
    const [servicesDataState, setServicesDataState] =
        useState<EntityServiceLisitngProps | null>(null);
    const [recommendedTasksDataState, setRecommendedTasksDataState] =
        useState<ExploreServicesProps | null>();
    const [TopProducts, setTopProducts] = useState<Product[]>()
    const [featureProducts, setFeatureProducts] = useState<Product[]>([])
    const [isSticky, setIsSticky] = useState(false)
    const mobileview = useMediaQuery("(max-width: 768px)")
    const brand = useBrand()

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsSticky(scrollY > 400); // Adjust threshold as needed
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const {data: fetchedTopCategoryData} = await axiosClient.get(
    //                 `${urls.category.top}?page_size=12&ordering=priority`
    //             );
    //             setTopCategoryDataState(fetchedTopCategoryData);
    //
    //             const response = await axiosClient.get('/product/top-product/')
    //             setTopProducts(response.data.data)
    //             console.log("product", response.data)
    //             const response2 = await axiosClient.get('/product/featured-product/')
    //             setFeatureProducts(response2.data.results)
    //
    //
    //             const {data: fetchedTrustedPartnerData} =
    //                 await axiosClient.get(urls.trusted_partners);
    //             setTrustedPartnerDataState(fetchedTrustedPartnerData);
    //
    //             const {data: fetchedBlogData} = await axiosClient.get(
    //                 `${urls.blog.list}?page_size=3`
    //             );
    //             setBlogDataState(fetchedBlogData);
    //
    //             const {data: fetchedTopTaskerData} = await axiosClient.get(
    //                 `${urls.tasker.top_tasker}?page_size=3`
    //                 //  " https://api.homaale.com/api/v1/task/explore/page/?is_requested=false&latitude=26.6661&longitude=87.2878&radius=25000"
    //             );
    //             setTopTaskerDataState(fetchedTopTaskerData);
    //             console.log(fetchedTopTaskerData);
    //             // console.log(topTaskerDataState)
    //
    //             const {data: fetchedServicesData} = await axiosClient.get(
    //                 `${urls.entity.service}&page_size=3`
    //             );
    //             setServicesDataState(fetchedServicesData);
    //             // console.log(fetchedServicesData)
    //
    //             const {data: fetchedRecommendedTasksData} =
    //                 await axiosClient.get<ExploreServicesProps>(
    //                     `${urls.explore.tasks}&latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`
    //                 )
    //
    //
    //             setRecommendedTasksDataState(fetchedRecommendedTasksData);
    //             // console.log(fetchedRecommendedTasksData)
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //         }
    //     };
    //
    //     (async () => await fetchData())();
    // }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    { data: fetchedTopCategoryData },
                    { data: fetchedTrustedPartnerData },
                    { data: fetchedBlogData },
                    { data: fetchedTopTaskerData },
                    { data: fetchedServicesData },
                    { data: fetchedRecommendedTasksData },
                    { data: fetchedTopProducts },
                    { data: fetchedFeatureProducts }
                ] = await Promise.all([
                    axiosClient.get(`${urls.category.top}?page_size=12&ordering=priority`),
                    axiosClient.get(urls.trusted_partners),
                    axiosClient.get(`${urls.blog.list}?page_size=3`),
                    axiosClient.get(`${urls.tasker.top_tasker}?page_size=3`),
                    axiosClient.get(`${urls.entity.service}&status_choice=published&page_size=3`),
                    axiosClient.get(`${urls.explore.tasks}&latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`),                    
                    axiosClient.get('/product/top-product/'),
                    axiosClient.get('/product/featured-product/')
                ]);
                setTopCategoryDataState(fetchedTopCategoryData);
                setTrustedPartnerDataState(fetchedTrustedPartnerData);
                setBlogDataState(fetchedBlogData);
                setTopTaskerDataState(fetchedTopTaskerData);
                setServicesDataState(fetchedServicesData);
                setRecommendedTasksDataState(fetchedRecommendedTasksData); 
                setTopProducts(fetchedTopProducts.data);
                setFeatureProducts(fetchedFeatureProducts.results);
            } catch (error) {
                console.error("Error fetching data:", error);
                setTopCategoryDataState(null);
                setTrustedPartnerDataState(null);
                setBlogDataState(null);
                setTopTaskerDataState(undefined);
                setServicesDataState(null);
                setRecommendedTasksDataState(null);
                setTopProducts([]);
                setFeatureProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location.latitude, location.longitude, radius]);

    return (
        <LandingLayout>
            <MediaQuery
                smallerThan="sm"
                styles={{
                    display: "none",
                }}
            >
                <Box>
                    <Flex
                        direction={"column"}
                        top={"35%"}
                        left={-90}
                        gap={15}
                        pos={"fixed"}
                        sx={(theme) => ({
                            background:
                                theme.colorScheme === "dark"
                                    ? theme.colors.dark[6]
                                    : "#fff",
                            boxShadow: "0px 4px 14px rgba(33, 29, 79, 0.1)",
                            borderRadius: "0px 8px 8px 0px",
                            padding: 20,
                            zIndex: 999,
                            transition: "all 0.25s ease-in-out",
                            "&:not([data-disabled]):hover": {
                                left: 0,
                                ".icon-svg": {
                                    transform: "rotate(180deg)",
                                    transition: "transform 0.25s ease-in-out",
                                },
                            },
                        })}
                    >
                        <Link
                            href="https://www.tiktok.com/@homaaleservices"
                            target={"_blank"}
                        >
                            <Image
                                src={"/svgs/social/tiktok.svg"}
                                alt={"alt-linkedin"}
                                width={50}
                                height={50}
                                priority
                            />
                        </Link>
                        <Link
                            href="https://www.facebook.com/profile.php?id=100086263383456"
                            target={"_blank"}
                        >
                            <Image
                                src={"/svgs/social/facebook.svg"}
                                alt={"alt-facebook"}
                                width={50}
                                height={50}
                                priority
                            />
                        </Link>
                        <Link
                            href="https://www.instagram.com/homaaleservices/"
                            target={"_blank"}
                        >
                            <Image
                                src={"/svgs/social/instagram.svg"}
                                alt={"alt-instagram"}
                                width={50}
                                height={50}
                                priority
                            />
                        </Link>
                        <Link
                            href="https://www.youtube.com/@Homaale"
                            target={"_blank"}
                        >
                            <Image
                                src={"/svgs/social/youtube.svg"}
                                alt={"alt-youtube"}
                                width={50}
                                height={50}
                                priority
                            />
                        </Link>
                        <Link
                            href="https://twitter.com/homaaleservices"
                            target={"_blank"}
                        >
                            <Image
                                src={"/svgs/social/twitter.svg"}
                                alt={"alt-twitter"}
                                width={50}
                                height={50}
                                priority
                            />
                        </Link>
                        <Box
                            pos={"absolute"}
                            top={"37%"}
                            left={75}
                            sx={(theme) => ({
                                background:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[6]
                                        : "#fff",
                                boxShadow:
                                    "14px 7px 20px rgba(33, 29, 79, 0.1)",
                                borderRadius: "0px 8px 8px 0px",
                                padding: "32px 10px",
                                zIndex: -2,
                            })}
                        >
                            <IconChevronRight
                                className="icon-svg"
                                style={{
                                    marginLeft: 8,
                                }}
                            />
                        </Box>
                    </Flex>
                </Box>
            </MediaQuery>

            <div className={`${poppins.className} ${classes.root}`}>
                {ads?.result &&
                    ads?.result?.length > 0 &&
                    ads?.result
                        .filter(
                            (val) =>
                                val?.is_active &&
                                val?.priority === 1 &&
                                val?.web_shape === "md_thin"
                        )
                        .map((item) => (
                            <section
                                key={item?.id}
                                className={"ads-1-section"}
                                id={"ads-1-section"}
                            >
                                <Container size={"xl"}>
                                    <AspectRatio ratio={16 / 2.5} mx="auto">
                                        <Link
                                            href={item?.redirect_url}
                                            target={"_blank"}
                                        >
                                            <Image
                                                src={item?.image}
                                                style={{
                                                    objectFit: "contain",
                                                }}
                                                fill
                                                alt="servicecard-image"
                                                priority
                                            />
                                        </Link>
                                    </AspectRatio>
                                </Container>
                            </section>
                        ))}
                <section className={classes.main} id={"main-section"}>

                    <Container size={"xl"}>
                        <Flex mb={80} justify={isSm ? "justify-center item-center" : "flex-start"}>
                            <Box maw={535}>
                                <h5>Simplify your life</h5>
                                <h2>
                                    Get Things Done, Hassle-Free with{' '}
                                    <span style={{display: 'inline-flex'}}>
            {brand === "cagtu" ?
                <svg width="55" height="32" viewBox="10 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_8118_97060)">
                        <path
                            d="M72.5444 36.6308C72.3432 30.8088 63.5672 24.6933 58.9243 21.8581C58.1318 21.3727 57.2031 21.1559 56.2769 21.2401C55.3507 21.3243 54.4767 21.705 53.7851 22.3253L45.7189 26.8109L50.217 18.6798C50.8252 17.9997 51.2007 17.1441 51.289 16.2369C51.3773 15.3298 51.1739 14.4181 50.7082 13.634C47.8994 8.90908 41.7092 -0.197425 35.8198 0.00326288C29.984 0.204966 23.8533 8.95904 21.0099 13.5911C20.5238 14.3815 20.3068 15.3074 20.3912 16.2308C20.4756 17.1542 20.8569 18.0257 21.4783 18.7153L25.5665 26.0299L18.7243 22.2645C18.0425 21.658 17.1848 21.2837 16.2755 21.1957C15.3662 21.1077 14.4524 21.3106 13.6664 21.775C8.9316 24.5761 -0.199893 30.7507 0.00333637 36.6247C0.203715 42.4456 8.98048 48.5611 13.6234 51.3973C15.2525 52.3927 17.1844 51.8759 18.7606 50.9302L20.7576 49.8199C21.7527 49.2724 22.5725 48.4556 23.1225 47.4636C24.4144 45.1043 26.3204 43.1362 28.6396 41.7666C30.9588 40.397 33.6054 39.6767 36.3005 39.6815C38.9957 39.6863 41.6396 40.416 43.9539 41.7938C46.2682 43.1716 48.1671 45.1464 49.4507 47.5103C50.0058 48.5228 50.8403 49.3552 51.8553 49.9088L53.821 50.9905C55.5765 51.9551 57.2667 52.4349 58.8813 51.4814C63.6163 48.6793 72.7486 42.5047 72.5444 36.6308ZM36.274 37.3663C34.8804 37.3663 33.5182 36.9541 32.3595 36.1818C31.2008 35.4096 30.2977 34.3119 29.7644 33.0277C29.2312 31.7435 29.0916 30.3304 29.3635 28.967C29.6354 27.6037 30.3064 26.3514 31.2918 25.3685C32.2772 24.3856 33.5326 23.7163 34.8994 23.4451C36.2661 23.1739 37.6828 23.3131 38.9703 23.845C40.2577 24.377 41.3582 25.2778 42.1324 26.4335C42.9066 27.5893 43.3198 28.9481 43.3198 30.3382C43.3198 32.2021 42.5775 33.9898 41.2561 35.3078C39.9348 36.6258 38.1426 37.3663 36.274 37.3663Z"
                            fill="#0074ED"/>

                    </g>
                    <defs>
                        {/* <clipPath id="clip0_8118_97060">
<rect width="227" height="52" fill=""/>
</clipPath> */}
                    </defs>
                </svg> : <svg
                    width="35"
                    height="35"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{marginRight: '8px'}}
                >
                    <path
                        d="M0.554688 7.54297L3.41983 30.9751L6.00617 32.9847L14.3465 24.5607L13.522 23.7023L10.034 14.4456L6.00617 13.613L0.554688 7.54297Z"
                        fill="#FCA500"/>
                    <path
                        d="M11.8984 38.0394C11.8984 38.0394 17.2669 41.483 27.6182 42.9067C38.5211 44.4075 48.0064 48.0002 48.0064 48.0002C48.0064 48.0002 41.2202 40.5784 33.473 36.2199C25.7259 31.8614 21.7277 30.0471 21.7277 30.0471L20.7015 28.9883L11.8984 38.0394Z"
                        fill="#FCA500"/>
                    <path
                        d="M41.8382 2.71379L41.8026 0L31.9437 9.76038L15.9214 25.3287L7.44463 34.0046L0 44.8494L10.7547 36.6978L19.3442 27.8728L34.3936 11.8471C34.441 11.8009 34.4648 11.7392 34.4707 11.6775L34.5182 11.7135L34.4529 11.549L33.8004 9.88373L35.1291 10.0636L35.4851 10.1099L35.9952 10.1767L35.8469 9.59591L35.5147 8.28527L37.2231 8.90718V8.44974V7.58626C37.2231 7.41151 37.3774 7.2933 37.5435 7.28302L38.4748 7.98716L38.7595 6.10602C38.7714 6.07004 38.7892 6.02892 38.8188 6.00322"
                        fill="#FCA500"/>
                </svg>}
          </span>
                                    {brandData.name}
                                </h2>
                                <p>
                                    The ultimate solution for all your service
                                    and task needs, in one app.
                                </p>
                                <Flex
                                    id="search"
                                    justify={"flex-start"}
                                    align={{
                                        base: "flex-start",
                                        sm: "center",
                                    }}
                                    direction={{base: "column", sm: "row"}}
                                    gap={40}
                                    mb={64}
                                >
                                    <Button
                                        color={"dark"}
                                        size={"md"}
                                        onClick={() => {
                                            if (checkStatus("kyc")) {
                                                router.push({
                                                    pathname: "/post/entity",
                                                    query: {
                                                        is_requested: true,
                                                    },
                                                });
                                            }
                                        }}
                                    >
                                        Post a Task
                                        <IconArrowRight/>
                                    </Button>
                                    <span
                                        className="secondary__link"
                                        onClick={() => {
                                            if (checkStatus("kyc")) {
                                                router.push({
                                                    pathname: "/post/entity",
                                                    query: {
                                                        is_requested: false,
                                                    },
                                                });
                                            }
                                        }}
                                    >
                                        Earn as a Professional{" "}
                                        <IconArrowRight/>
                                    </span>
                                </Flex>
                                <h4>What are you looking for?</h4>
                                {isSticky && mobileview ? (
                                    <Button
                                        className="fixed top-1 left-1/2 transform -translate-x-1/2  shadow-md z-50"
                                        type="button"
                                        style={{
                                            marginTop: "5px",
                                            background: theme.colors.brand[5],
                                            borderRadius: "40px",
                                            border: "none",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            zIndex: 9999,
                                            width: "50px",
                                            height: "40px",
                                            padding: 0,
                                        }}
                                        onClick={() => {
                                            document.getElementById("search")?.scrollIntoView({behavior: "smooth"});
                                        }}
                                    >
                                        <IconSearch className="icon" style={{margin: 0}}/>
                                    </Button>
                                ) : null}

                                <Flex>

                                    <SearchBar inLayout={false}/>
                                </Flex>
                            </Box>
                            <MediaQuery
                                smallerThan="md"
                                styles={{
                                    display: "none",
                                }}
                            >
                                <Box ml={"auto"} pos={"relative"}>
                                    {weather && (
                                        <Box>
                                            <HoverTag
                                                header={weather?.main?.temp
                                                    .toFixed(1)
                                                    .toString()}
                                                image={weather.weather[0].icon}
                                                top={"15%"}
                                                left={"2%"}
                                            />
                                        </Box>
                                    )}

                                    {location && (
                                        <HoverTag
                                            header={location?.city ?? ""}
                                            secondary={location?.country}
                                            bottom={"15%"}
                                            right={"2%"}

                                        />
                                    )}

                                    {brand === "cagtu" ?
                                        //   <Carousel
                                        //          height={400}
                                        //          slideSize="20%"
                                        //          slideGap="md"
                                        //          loop
                                        //          align="start"
                                        //          slidesToScroll={1}
                                        //         plugins={[autoplay.current]}
                                        //         onMouseEnter={autoplay.current.stop}
                                        //         onMouseLeave={autoplay.current.reset}
                                        //         >
                                        //         <Carousel.Slide><Image src={"/images/LandingCagtuImages/landing-1.avif"} alt={""} height={200} width={100}/></Carousel.Slide>
                                        //         <Carousel.Slide>2</Carousel.Slide>
                                        //         <Carousel.Slide>3</Carousel.Slide>
                                        //         {/* ...other slides */}
                                        //
                                        //         </Carousel>
                                        <div className="mx-auto"
                                             style={{width: '500px', height: '580px', zIndex: -100}}>
                                            <CustomSlickCarousel/>
                                        </div>
                                        :
                                        <Image
                                            src={"/svgs/landingMain.svg"}
                                            height={580}
                                            width={550}
                                            alt="Langing-main-img"
                                        />}
                                </Box>
                            </MediaQuery>
                        </Flex>
                    </Container>
                </section>
                {/*---------------------------Top Category start------------------------------*/}
                <section className={classes.category} id={"category-section"}>
                    <Container size={"xl"}>
                        <Flex mb={ isSm ? 10 :50}>
                            <h3>Top Categories</h3>
                            <Link href={"/category"} className="more__link">
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>
                        {isSm ? (
                            <Grid mb={10} gutter={"xs"}>
                                {topCategoryDataState?.result?.slice(0, 6).map((item, index) => (
                                        <Grid.Col
                                            md={2}
                                            sm={3}
                                            xs={4}
                                            span={4}
                                            key={index}
                                            display={"flex"}
                                        >
                                            <CategoryCardMobile data={item}/>
                                        </Grid.Col>
                                    )
                                )}
                            </Grid>
                        ) : (
                        <Grid mb={20}>
                            {topCategoryDataState?.result?.map(
                                (item, index) => (
                                    <Grid.Col
                                        md={2}
                                        sm={4}
                                        xs={6}
                                        span={6}
                                        key={index}
                                        display={"flex"}
                                    >
                                        <CategoryCard data={item}/>
                                    </Grid.Col>
                                )
                            )}
                        </Grid>
                        )}
                    </Container>
                </section>

                {/*---------------------------Top Category end------------------------------*/}

                {/*---------------------------Trend start------------------------------*/}

                <section className={"trend-section"} id={"trend-section"}>
                    <Container size={"xl"}>
                        <h5>Trend on {brandData.smallName}</h5>
                        <Flex
                            mb={20}
                            align={{base: "flex-start", sm: "center"}}
                            direction={{base: "column", sm: "row"}}
                        >
                            <Text component="h2">Trending Service</Text>
                            <Link
                                href={"/explore?type=services"}
                                className="more__link"
                            >
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>
                        <Grid mb={60}>
                            {loading ? (
                                <Grid.Col span={12}>
                                    <CardSkeletonGrid title="Near You" href="/tasks?options=near_by"/>
                                </Grid.Col>
                            ) : data?.result && data?.result.length > 0 ? (
                                data.result.map((item, index) => (
                                    <Grid.Col
                                        span={12}
                                        md={6}
                                        lg={6}
                                        xl={4}
                                        key={index}
                                    >
                                        <ServiceCard service={item}/>
                                    </Grid.Col>
                                ))
                            ) : (
                                <NoDataAlert/>
                            )}
                        </Grid>
                    </Container>
                </section>
                {/*---------------------------Trend end------------------------------*/}
                {ads?.result &&
                    ads?.result?.length > 0 &&
                    ads?.result
                        .filter(
                            (val) =>
                                val?.is_active &&
                                val?.priority === 2 &&
                                val?.web_shape === "md_thin"
                        )
                        .map((item) => (
                            <section
                                key={item.id}
                                className={"ads-2-section"}
                                id={"ads-2-section"}
                                style={{marginTop: "-64px"}}
                            >
                                <Container size={"xl"}>
                                    <AspectRatio
                                        ratio={16 / 3}
                                        mx="auto"
                                        my={"auto"}
                                    >
                                        <Link
                                            href={item?.redirect_url}
                                            target={"_blank"}
                                        >
                                            <Image
                                                src={item?.image}
                                                style={{
                                                    objectFit: "contain",
                                                }}
                                                fill
                                                alt="servicecard-image"
                                                priority
                                            />
                                        </Link>
                                    </AspectRatio>
                                </Container>
                            </section>
                        ))}
                {/*---------------------------Trend end------------------------------*/}
                {/*---------------------------Task near me------------------------------*/}
                <section
                    className={"task-near-section"}
                    id={"task-near-section"}
                >
                    <Container size={"xl"}>
                        <h5>Task on {brandData.smallName}</h5>
                        <Flex
                            mb={20}
                            align={{base: "flex-start", sm: "center"}}
                            direction={{base: "column", sm: "row"}}
                        >
                            <h2>Task near me</h2>
                            <Link
                                href={"/explore?type=task"}
                                className="more__link"
                            >
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>
                        <Grid mb={60}>
                            {recommendedTasksDataState?.nearby &&
                            recommendedTasksDataState?.nearby.length > 0 ? (
                                recommendedTasksDataState?.nearby?.map(
                                    (item, index) => (
                                        <Grid.Col
                                            span={12}
                                            md={6}
                                            lg={6}
                                            xl={4}
                                            key={index}
                                        >
                                            <ServiceCard service={item}/>
                                            {/*<TaskerCard tasker={item}/>*/}

                                            {/*<ThreeCardsServicesBlock*/}
                                            {/*    data={data?.nearby}*/}
                                            {/*    sectionTitle="Near You"*/}
                                            {/*    href="/tasks?options=near_by"*/}
                                            {/*/>*/}
                                        </Grid.Col>
                                    )
                                )
                            ) : (
                                <NoDataAlert/>
                            )}
                        </Grid>
                    </Container>
                </section>
                {ads?.result &&
                    ads?.result?.length > 0 &&
                    ads?.result
                        .filter(
                            (val) =>
                                val?.is_active &&
                                val?.priority === 1 &&
                                val?.web_shape === "md_card"
                        )
                        .map((item) => (
                            <section
                                className={"ads-3-section"}
                                id={"ads-3-section"}
                                key={item?.id}
                                style={{margin: "-42px 0 42px"}}
                            >
                                <Container size={"xl"} mb={8}>
                                    <AspectRatio ratio={16 / 3} mx="auto">
                                        <Link
                                            href={item?.redirect_url}
                                            target={"_blank"}
                                        >
                                            <Image
                                                src={item?.image}
                                                style={{
                                                    objectFit: "contain",
                                                }}
                                                fill
                                                alt="servicecard-image"
                                                priority
                                            />
                                        </Link>
                                    </AspectRatio>
                                </Container>
                            </section>
                        ))}


                <section style={{paddingBottom: "20px"}}>
                    <Container size="xl">
                        <h5>Featured Products on {brandData.smallName}</h5>
                        <Flex
                            mb={20}
                            align={{base: 'flex-start', sm: 'center'}}
                            direction={{base: 'column', xs: 'row'}}
                        >
                            <h2>Featured Products</h2>
                            <Link href="/products" className="more__link">
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>

                        <Carousel
                            withIndicators={featureProducts.length > 0 ? false : true}
                            height={400}
                            slideSize="20%"
                            slideGap="md"
                            loop
                            align="start"
                            slidesToScroll={1}
                            breakpoints={[
                                {maxWidth: 'md', slideSize: '33.33%'},
                                {maxWidth: 'sm', slideSize: '50%'},
                                {maxWidth: 'xs', slideSize: '100%', slideGap: 0},
                            ]}
                            plugins={[autoplay.current]}
                            onMouseEnter={() => autoplay.current.stop()}
                            onMouseLeave={() => autoplay.current.play()}
                        >
                            {featureProducts.length > 0 && Array.isArray(featureProducts) ? (
                                featureProducts.map((item) => (
                                    <Carousel.Slide key={item.id}>
                                        <ProductCard products={item}/>
                                    </Carousel.Slide>
                                ))
                            ) : (
                                <div style={{width: "98%"}}>

                                    < NoDataAlert/>
                                </div>
                            )}

                        </Carousel>


                    </Container>
                </section>

                <section
                    className={"top-product-section"}
                    id={"top-product-section"}
                >
                    <Container size={"xl"}>
                        <h5>Products on {brandData.smallName}</h5>
                        <Flex
                            mb={20}
                            align={{base: "flex-start", sm: "center"}}
                            direction={{base: "column", xs: "row"}}
                        >
                            <h2>Top Products</h2>
                            <Link href={"/products"} className="more__link">
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 mb-10">
                            {TopProducts && Array.isArray(TopProducts) ? (
                                TopProducts.slice(0, 5).map((item) => (
                                    <div key={item.id}>
                                        <ProductCard products={item}/>
                                    </div>
                                ))
                            ) : (
                                <div style={{width: "100%"}}>

                                    <NoDataAlert/>
                                </div>
                            )}

                        </div>
                    </Container>
                </section>


                {/*----------------------Top Tasker start----------------------------*/}
                <section
                    className={"top-tasker-section"}
                    id={"top-tasker-section"}
                >
                    <Container size={"xl"}>
                        <h5>Tasker on {brandData.smallName}</h5>
                        <Flex
                            mb={20}
                            align={{base: "flex-start", sm: "center"}}
                            direction={{base: "column", xs: "row"}}
                        >
                            <h2>Top tasker</h2>
                            <Link href={"/tasker"} className="more__link">
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>
                        <Grid mb={60}>
                            {topTaskerDataState?.result &&
                            topTaskerDataState?.result.length > 0 ? (
                                topTaskerDataState?.result?.map(
                                    (item, index) => (
                                        <Grid.Col
                                            span={12}
                                            md={6}
                                            lg={6}
                                            xl={4}
                                            key={index}
                                        >
                                            <TaskerCard tasker={item}/>
                                        </Grid.Col>
                                    )
                                )
                            ) : (
                                <NoDataAlert/>
                            )}
                        </Grid>
                    </Container>
                </section>
                {/*---------------------top tasker end-----------------------------*/}
                <section
                    className="post-process-section"
                    id="post-process-section"
                >
                    <Container size={1568}>
                        <InfoBanner
                            SubHeader={"Tailored To Each Individual"}
                            Header={
                                "Post and make the process of discovering abilities simpler."
                            }
                            description={
                                "We streamline the job search and application procedure for you. Anyone in the world can post a task or a service and locate the finest candidate to complete it."
                            }
                            ImageSrc={brandData.assets.postTaskSection}
                            list={[
                                "Describe what you need to get done or what service you provide",
                                "Set your price and location",
                                "Receive quotes or negotiate your price",
                                "Earn reward points",
                            ]}
                            bottomComp={
                                <>
                                    <Button
                                        size={"md"}
                                        color={"dark"}
                                        onClick={() => {
                                            if (checkStatus("kyc")) {
                                                router.push(
                                                    {
                                                        pathname:
                                                            "/post/entity",
                                                        query: {
                                                            is_requested: true,
                                                        },
                                                    },
                                                    "/post/entity"
                                                );
                                            }
                                        }}
                                    >
                                        Post your task{" "}
                                        <IconArrowRight size={20}/>
                                    </Button>
                                    <span
                                        className="secondary__link"
                                        onClick={() => {
                                            if (checkStatus("kyc")) {
                                                router.push(
                                                    {
                                                        pathname:
                                                            "/post/entity",
                                                        query: {
                                                            is_requested: false,
                                                        },
                                                    },
                                                    "/post/entity"
                                                );
                                            }
                                        }}
                                    >
                                        Earn money as tasker{" "}
                                        <IconArrowRight size={20}/>
                                    </span>
                                </>
                            }
                            has_background
                        />
                    </Container>
                </section>

                <section className={classes.trust} id="trust-section">
                    <Container size={"xl"}>
                        <h5>Trust & Security</h5>
                        <Flex
                            mb={80}
                            justify={"flex-start"}
                            align={{base: "flex-start", sm: "center"}}
                            direction={{base: "column", sm: "row"}}
                        >
                            <Box maw={535}>
                                <Text component="h2">
                                    Offering Services With Security And Trust.
                                </Text>
                            </Box>

                            <Text
                                component="p"
                                maw={535}
                                style={{
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : "",
                                }}
                            >
                                {`${brandData.name} service providers must take measures to
                            ensure the safety and protection of their customers'
                            information and assets.`}
                            </Text>
                        </Flex>
                        <Grid mb={80}>
                            <Grid.Col md={4} sm={12} display={"flex"}>
                                <TrustCard
                                    title={"Verified Users"}
                                    image={"/svgs/trustCard/trustCard1.svg"}
                                    description={
                                        "Any user can only post task or service after the KYC is verified."
                                    }
                                    color={"#FAF5FF"}
                                />
                            </Grid.Col>
                            <Grid.Col md={4} sm={12} display={"flex"}>
                                <TrustCard
                                    title={"Trusted Ratings And Reviews"}
                                    image={"/svgs/trustCard/trustCard3.svg"}
                                    description={
                                        "The ratings and reviews can only be given by the related users of the task after the task is completed."
                                    }
                                    color={"#FEF2F2"}
                                />
                            </Grid.Col>
                            <Grid.Col md={4} sm={12} display={"flex"}>
                                <TrustCard
                                    title={"Secure Payment"}
                                    image={"/svgs/trustCard/trustCard2.svg"}
                                    description={
                                        "Prepayment is taken and released only after the task is completed to satisfaction."
                                    }
                                    color={"#ECFDF5"}
                                />
                            </Grid.Col>
                        </Grid>
                    </Container>
                </section>

                {ads?.result &&
                    ads?.result?.length > 0 &&
                    ads?.result
                        .filter(
                            (val) =>
                                val?.is_active &&
                                val?.priority === 3 &&
                                val?.web_shape === "md_thin"
                        )
                        .map((item) => (
                            <section
                                className={"ads-4-section"}
                                id={"ads-4-section"}
                                key={item?.id}
                                style={{marginTop: "-80px"}}
                            >
                                <Container size={"xl"}>
                                    <AspectRatio ratio={16 / 2.5} mx="auto">
                                        <Link
                                            href={item?.redirect_url}
                                            target={"_blank"}
                                        >
                                            <Image
                                                src={item.image}
                                                style={{
                                                    objectFit: "contain",
                                                }}
                                                fill
                                                alt="servicecard-image"
                                                priority
                                            />
                                        </Link>
                                    </AspectRatio>
                                </Container>
                            </section>
                        ))}
                <section
                    className={"download-app-section"}
                    id="download-app-section"
                >
                    <Container size={1568}>
                        <InfoBanner

                            SubHeader={"Download Our App"}
                            Header={
                                `Fast and Easy Way To Stay Connect With ${brandData.smallName}`
                            }
                            description={
                                "The ultimate solution for all your service and task needs, in one app."
                            }
                            ImageSrc={brandData.assets.downloadSection}
                            list={[
                                `Create an account and login to ${brandData.smallName}`,
                                "Find your referral code",
                                "Share the referral code with your friends and family",
                                "Receive 25 reward points on your friend’s first booking",
                            ]}
                            bottomComp={
                                <>
                                    <Image
                                        src={
                                            "/images/mobileicons/google_play.svg"
                                        }
                                        height={60}
                                        width={195}
                                        alt="blog-image"
                                    />
                                    <Image
                                        src={
                                            "/images/mobileicons/app_store.svg"
                                        }
                                        height={60}
                                        width={195}
                                        alt="blog-image"
                                    />
                                </>
                            }
                            has_background
                        />
                    </Container>
                </section>
                {ads?.result &&
                    ads?.result?.length > 0 &&
                    ads?.result
                        .filter(
                            (val) =>
                                val?.is_active &&
                                val?.priority === 1 &&
                                val?.web_shape === "lg_card"
                        )
                        .map((item) => (
                            <section
                                className={"ads-5-section"}
                                id={"ads-5-section"}
                                key={item.id}
                                style={{marginTop: "-24px"}}
                            >
                                <Container size={"xl"} mb={8}>
                                    <AspectRatio ratio={221 / 60} mx="auto">
                                        <Link
                                            href={item?.redirect_url}
                                            target={"_blank"}
                                        >
                                            <Image
                                                src={item?.image}
                                                style={{
                                                    objectFit: "contain",
                                                }}
                                                fill
                                                alt="servicecard-image"
                                                priority
                                            />
                                        </Link>
                                    </AspectRatio>
                                </Container>
                            </section>
                        ))}

                <section
                    className={"join-homaale-section"}
                    id="join-homaale-section"
                >
                    <Container size={1568}>
                        <InfoBanner
                            bottomComp={
                                !loggedInUser ? (
                                    <Button
                                        size={"md"}
                                        color={"dark"}
                                        onClick={() =>
                                            router.push("/auth/signup")
                                        }
                                    >
                                        Join {brand === "cagtu" ? "Cagtu" : "Homaale"}{" "}
                                        <IconArrowRight size={20}/>
                                    </Button>
                                ) : (
                                    ""
                                )
                            }
                            SubHeader={"The More You Use, The More You Earn"}
                            Header={
                                `Join ${brandData.name}, Earn Rewards, and Enjoy the Benefits!`
                            }
                            description={
                                `Get points for each step you take on ${brandData.name}. Use your reward points for deals and discounts on our collaborative services.`
                            }
                            ImageSrc={brandData.assets.rewardPointSection}
                            list={[
                                "Get rewards for KYC verification",
                                "Get rewards for each booking milestone",
                                "Get rewards for reviewing our app",
                                "Refer and earn",
                            ]}
                        />
                    </Container>
                </section>
                {ads?.result &&
                    ads?.result?.length > 0 &&
                    ads?.result
                        .filter(
                            (val) =>
                                val?.is_active &&
                                val?.priority === 2 &&
                                val?.web_shape === "lg_card"
                        )
                        .map((item) => (
                            <section
                                className={"ads-6-section"}
                                id={"ads-6-section"}
                                key={item.id}
                                style={{margin: "-80px 0 24px"}}
                            >
                                <Container size={"xl"} mb={8}>
                                    <AspectRatio ratio={221 / 60} mx="auto">
                                        <Link
                                            href={item?.redirect_url}
                                            target={"_blank"}
                                        >
                                            <Image
                                                src={item?.image}
                                                style={{
                                                    objectFit: "contain",
                                                }}
                                                fill
                                                alt="servicecard-image"
                                                priority
                                            />
                                        </Link>
                                    </AspectRatio>
                                </Container>
                            </section>
                        ))}

                <section
                    className={"task-near-section"}
                    id={"task-near-section"}
                >
                    <Container size={"xl"}>
                        <h5>Service on {brandData.name}</h5>
                        <Flex
                            mb={20}
                            align={{base: "flex-start", sm: "center"}}
                            direction={{base: "column", sm: "row"}}
                        >
                            <h2>You may like</h2>
                            <Link
                                href={"/tasks?options=interested"}
                                className="more__link"
                            >
                                View More <IconArrowRight/>
                            </Link>
                        </Flex>
                        <Grid mb={60}>
                            {servicesDataState?.result &&
                            servicesDataState?.result.length > 0 ? (
                                servicesDataState?.result?.map(
                                    (item, index) => (
                                        <Grid.Col
                                            span={12}
                                            md={6}
                                            lg={6}
                                            xl={4}
                                            key={index}
                                        >
                                            <ServiceCard service={item}/>
                                        </Grid.Col>
                                    )
                                )
                            ) : (
                                <NoDataAlert/>
                            )}
                        </Grid>
                    </Container>
                </section>

                <section
                    className={"refer-homaale-section"}
                    id="refer-homaale-section"
                >
                    <Container size={1568}>
                        <InfoBanner
                            SubHeader={"Refer & Earn"}
                            Header={`${brandData.name} Unlimited Refer and Earn Program.`}
                            description={
                                `Refer ${brandData.name} to your friends and family, and earn 25 ${brandData.name}  Reward Points for both of you. *T & C applied. See below how to refer and earn:`
                            }
                            ImageSrc={brandData.assets.rewardSection}
                            list={[
                                `Create an account and login to ${brandData.name} `,
                                "Find your referral code",
                                "Share the referral code with your friends and family",
                                "Receive 25 reward points on your friend’s first booking",
                            ]}
                            has_background
                            bottomComp={
                                <Button
                                    size={"md"}
                                    color={"dark"}
                                    onClick={() => router.push("/category")}
                                >
                                    Explore Program <IconArrowRight size={20}/>
                                </Button>
                            }
                        />
                    </Container>
                </section>

                <section className={classes.brand} id="blogs-section">
                    <Container size={"xl"}>
                        <h4>
                            Building Trust Through {brandData.name}: Our Trusted Partners
                        </h4>

                        <Slider {...settings}>
                            {trustedPartnerDataState?.map((item, index) => (
                                <a
                                    href={item?.redirect_url}
                                    key={index}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Image
                                        src={item?.logo}
                                        height={80}
                                        style={{objectFit: "contain"}}
                                        width={80}
                                        alt={item?.alt_text}
                                    />
                                </a>
                            ))}
                        </Slider>
                    </Container>
                </section>
                {blogDataState && blogDataState?.result?.length > 0 && (
                    <section className="blogs-section" id="blogs-section">
                        <Container size={"xl"}>
                            <Flex mb={24}>
                                <h3>Blogs</h3>
                                <Link href={"/blogs"} className="more__link">
                                    View More <IconArrowRight/>
                                </Link>
                            </Flex>
                            <Grid>
                                {blogDataState?.result?.map((item, index) => (
                                    <Grid.Col md={4} key={index}>
                                        <BlogCard blogs={item} key={index}/>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </Container>
                    </section>
                )}
            </div>
        </LandingLayout>
    );
};
export default Home;

// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const {data: topCategoryData} = await axiosClient.get(
//             `${urls.category.top}?page_size=12&ordering=priority`
//         );
//         const {data: trustedPartnerData} = await axiosClient.get(
//             urls.trusted_partners
//         );
//         const {data: blogData} = await axiosClient.get(
//             `${urls.blog.list}?page_size=3`
//         );
//         const {data: topTaskerData} = await axiosClient.get(
//             `${urls.tasker.top_tasker}?page_size=3`
//         );
//         const {data: servicesData} = await axiosClient.get(
//             `${urls.entity.service}&page_size=3`
//         );
//         const {data: recommendedTasksData} = await axiosClient.get(
//             `${urls.entity.task}&recommendation=Task You May Like&page_size=3`
//         );
//         return {
//             props: {
//                 topCategoryData,
//                 trustedPartnerData,
//                 blogData,
//                 topTaskerData,
//                 servicesData,
//                 recommendedTasksData,
//             },
//             revalidate: 20,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 topCategoryData: [],
//                 trustedPartnerData: [],
//                 blogData: [],
//                 topTaskerData: [],
//                 servicesData: [],
//                 recommendedTasksData: [],
//             },
//             revalidate: 20,
//         };
//     }
// };

