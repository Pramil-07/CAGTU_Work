import {Alert, AspectRatio, Box, Flex, Grid} from "@mantine/core";
import {IconAlertCircle} from "@tabler/icons-react";
import {useQuery} from "@tanstack/react-query";
import type {GetStaticProps} from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Layout from "@/components/Layout/Layout";
import ThreeCardsServicesBlock from "@/components/ThreeCardsServicesBlock";
import urls from "@/constants/urls";
import {useAppSelector} from "@/hooks";
import {useGetAds} from "@/hooks/useGetAds";
import type {ExploreServicesProps} from "@/types/ExploreServicesProps";
import {axiosClient} from "@/utils/axiosClient";
import HomaaleLoader from "@/components/common/HomaaleLoader";

// Card skeleton component
export const CardSkeletonGrid = ({title, href}: { title: string; href?: string }) => {
    return (
        <Box mb={24}>
            <Flex justify="space-between" align="center" mb={16}>
                <h4>{title}</h4>
                {href && (
                    <Link href={href}>
                        <Box sx={{color: "#FF6B00", fontSize: "14px"}}>View More →</Box>
                    </Link>
                )}
            </Flex>

            <Grid gutter={16}>
                {Array(3).fill(0).map((_, index) => (
                    <Grid.Col key={index} span={12} sm={6} md={4}>
                        <Box sx={{border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden"}}>
                            {/* Image skeleton */}
                            <Box h={160} sx={{backgroundColor: "#f0f0f0"}}/>

                            {/* Content skeletons */}
                            <Box p={16}>
                                {/* Title */}
                                <Box h={20} w="75%" mb={10} sx={{backgroundColor: "#f0f0f0", borderRadius: 4}}/>

                                {/* Description lines */}
                                <Box h={16} w="90%" mb={8} sx={{backgroundColor: "#f0f0f0", borderRadius: 4}}/>
                                <Box h={16} w="60%" mb={16} sx={{backgroundColor: "#f0f0f0", borderRadius: 4}}/>

                                {/* Footer elements */}
                                <Flex justify="space-between">
                                    <Box h={16} w="40%" sx={{backgroundColor: "#f0f0f0", borderRadius: 4}}/>
                                    <Box h={16} w="20%" sx={{backgroundColor: "#f0f0f0", borderRadius: 4}}/>
                                </Flex>
                            </Box>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>
        </Box>
    );
};

const ExploreServices = ({exploreServicesData}: { exploreServicesData: ExploreServicesProps }) => {
    const {data: location, radius} = useAppSelector((state) => state.locationReducer);
    const {data = exploreServicesData, isLoading} = useQuery(["explore-services"], async () => {
        const {data} = await axiosClient.get<ExploreServicesProps>(
            `${urls.explore.services}&latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`
        );
        return data;
    });
    console.log("city ", location.city)

    const {data: ads, isLoading: adsLoading} = useGetAds("/explore/services");

    if (adsLoading) {
        return (
            <Layout currentTitle={"explore-services"}>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100vw",
                }}>
                    <HomaaleLoader/>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentTitle={"explore-services"}>
            {/* Trending Services */}
            {isLoading ? (
                <CardSkeletonGrid title="Trending Services" href="/services?options=trending"/>
            ) : (
                data?.trending_services?.length > 0 && (
                    <ThreeCardsServicesBlock
                        data={data?.trending_services}
                        sectionTitle="Trending Services"
                        href="/services?options=trending"
                    />
                )
            )}

            {/* Mostly Booked */}
            {isLoading ? (
                <CardSkeletonGrid title="Mostly Booked" href="/services?options=mostly_booked"/>
            ) : (
                data?.mostly_booked?.length > 0 && (
                    <ThreeCardsServicesBlock
                        data={data?.mostly_booked}
                        sectionTitle="Mostly Booked"
                        href="/services?options=mostly_booked"
                    />
                )
            )}

            {/* Ads - large card */}
            {!isLoading && ads?.result?.filter((val) => val?.is_active && val?.priority === 1 && val?.web_shape === "lg_card").map((item) => (
                <section className={"ads-section-tasks"} key={item.id} style={{marginBottom: "24px"}}>
                    <AspectRatio ratio={221 / 60} mx="auto">
                        <Link href={item?.redirect_url} target={"_blank"}>
                            <Image src={item?.image} style={{objectFit: "contain"}} fill alt="ad-image" priority/>
                        </Link>
                    </AspectRatio>
                </section>
            ))}

            {/* You May Like */}
            {isLoading ? (
                <CardSkeletonGrid title="You May Like" href="/services?options=interested"/>
            ) : (
                data?.you_may_like?.length > 0 && (
                    <ThreeCardsServicesBlock
                        data={data?.you_may_like}
                        sectionTitle="You May Like"
                        href="/services?options=interested"
                    />
                )
            )}

            {/* Top Rated */}
            {isLoading ? (
                <CardSkeletonGrid title="Top Rated" href="/services?options=rating"/>
            ) : (
                data?.top_rated?.length > 0 && (
                    <ThreeCardsServicesBlock
                        data={data?.top_rated}
                        sectionTitle="Top Rated"
                        href="/services?options=rating"
                    />
                )
            )}

            {/* Ads - medium card */}
            {!isLoading && ads?.result?.filter((val) => val?.is_active && val?.priority === 1 && val?.web_shape === "md_card").map((item) => (
                <section className={"ads-section-tasks"} key={item.id} style={{marginBottom: "24px"}}>
                    <AspectRatio ratio={16 / 3} mx="auto">
                        <Link href={item?.redirect_url} target={"_blank"}>
                            <Image src={item?.image} style={{objectFit: "contain"}} fill alt="ad-image" priority/>
                        </Link>
                    </AspectRatio>
                </section>
            ))}

            {/* Near You */}
            {isLoading ? (
                <CardSkeletonGrid title="Near You" href="/services?options=near_by"/>
            ) : data?.nearby?.length > 0 ? (
                <ThreeCardsServicesBlock
                    data={data?.nearby}
                    sectionTitle="Near You"
                    href="/services?options=near_by"
                />
            ) : (
                <Box mb={15}>
                    <h4>Near You</h4>
                    <Alert color="blue">
                        <Flex gap={10} justify={"flex-start"}>
                            <IconAlertCircle size="1.2rem"/>
                            {`Service in "${location?.city} " ${location?.country}" not found`}
                        </Flex>
                    </Alert>
                </Box>
            )}
        </Layout>
    );
};

export default ExploreServices;

export const getStaticProps: GetStaticProps = async () => {
    try {
        const {data: exploreServicesData} =
            await axiosClient.get<ExploreServicesProps>(urls.explore.services);

        return {
            props: {
                exploreServicesData,
            },
            revalidate: 10,
        };
    } catch (err: any) {
        return {
            props: {
                exploreServicesData: [],
            },
            revalidate: 10,
        };
    }
};
