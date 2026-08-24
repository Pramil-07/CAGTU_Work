import { Alert, AspectRatio, Box, Flex } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import Layout from "@/components/Layout/Layout";
import ThreeCardsServicesBlock from "@/components/ThreeCardsServicesBlock";
import urls from "@/constants/urls";
import { useAppSelector } from "@/hooks";
import { useGetAds } from "@/hooks/useGetAds";
import type { ExploreServicesProps } from "@/types/ExploreServicesProps";
import { axiosClient } from "@/utils/axiosClient";
import {CardSkeletonGrid} from "@/pages/explore/services";

const ExploreTasks = ({
    exploreServicesData,
}: {
    exploreServicesData: ExploreServicesProps;
}) => {
    const { data: location, radius } = useAppSelector(
        (state) => state.locationReducer
    );
    const { data = exploreServicesData , isLoading } = useQuery(
        ["explore-tasks"],
        async () => {
            const { data } = await axiosClient.get<ExploreServicesProps>(
                `${urls.explore.tasks}&latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`
            );
            return data;
        }
    );

    const { data: ads } = useGetAds("/explore/tasks");

    return (
        <Layout currentTitle={"explore-tasks"}>
            {isLoading ? (
                <CardSkeletonGrid title="Trending Tasks" href="/tasks?options=trending"/>
            ) : (
                data && data?.trending_services?.length > 0 && (
                <ThreeCardsServicesBlock
                    data={data?.trending_services}
                    sectionTitle="Trending Tasks"
                    href="/tasks?options=trending"
                />
            ))}
            {isLoading ? (
                <CardSkeletonGrid title="Mostly Booked" href="/tasks?options=mostly_booked"/>
            ) : (data && data?.mostly_booked?.length > 0 && (
                <ThreeCardsServicesBlock
                    data={data?.mostly_booked}
                    sectionTitle="Mostly Booked"
                    href="/tasks?options=mostly_booked"
                />
            ))}
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
                            className={"ads-section-tasks"}
                            id={"ads-section-tasks"}
                            key={item.id}
                            style={{ marginBottom: "24px" }}
                        >
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
                                        alt="ad-image"
                                        priority
                                    />
                                </Link>
                            </AspectRatio>
                        </section>
                    ))}
            {isLoading ? (
                <CardSkeletonGrid title="You May Like" href="/tasks?options=interested"/>
            ) : (
                data && data?.you_may_like?.length > 0 && (
                <ThreeCardsServicesBlock
                    data={data?.you_may_like}
                    sectionTitle="You May Like"
                    href="/tasks?options=interested"
                />
            ))}

            {isLoading ? (
                <CardSkeletonGrid title="Top Rated" href="/tasks?options=rating"/>
            ) : (
                data && data?.top_rated?.length > 0 && (
                <ThreeCardsServicesBlock
                    data={data?.top_rated}
                    sectionTitle="Top Rated"
                    href="/tasks?options=rating"
                />
            ))}
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
                            className={"ads-section-tasks"}
                            id={"ads-section-tasks"}
                            key={item.id}
                            style={{ marginBottom: "24px" }}
                        >
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
                                        alt="ad-image"
                                        priority
                                    />
                                </Link>
                            </AspectRatio>
                        </section>
                    ))}
            {isLoading ? (
                <CardSkeletonGrid title="Near You" href="/tasks?options=near_by"/>
            ) : (
                data && data?.nearby?.length > 0 ? (
                <ThreeCardsServicesBlock
                    data={data?.nearby}
                    sectionTitle="Near You"
                    href="/tasks?options=near_by"
                />
            ) : (
                <Box mb={15}>
                    <h4>Near You</h4>
                    <Alert color="blue">
                        <Flex gap={10} justify={"flex-start"}>
                            <IconAlertCircle size="1.2rem" />
                            {`Tasks in "${location?.city}, ${location?.country}" not found`}
                        </Flex>
                    </Alert>
                </Box>
            ))}
        </Layout>
    );
};

export default ExploreTasks;

export const getStaticProps: GetStaticProps = async () => {
    try {
        const { data: exploreServicesData } =
            await axiosClient.get<ExploreServicesProps>(urls.explore.tasks);

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
