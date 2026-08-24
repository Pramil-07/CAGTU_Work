import { Alert, AspectRatio, Box, Flex } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import Layout from "@/components/Layout/Layout";
import ThreeCardsTaskersBlock from "@/components/ThreeCardsTaskers";
import urls from "@/constants/urls";
import { useAppSelector } from "@/hooks";
import { useGetAds } from "@/hooks/useGetAds";
import type { ExploreServicesProps } from "@/types/ExploreServicesProps";
import type { ExploreTaskersProps } from "@/types/ExploreTaskersProps";
import { axiosClient } from "@/utils/axiosClient";

const ExploreTaskers = ({
    exploreTaskersData,
}: {
    exploreTaskersData: ExploreTaskersProps;
}) => {
    const { data = exploreTaskersData } = useQuery(
        ["explore-taskers"],
        async () => {
            const { data } = await axiosClient.get<ExploreTaskersProps>(
                `${urls.explore.taskers}?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`
            );
            return data;
        }
    );

    const { data: location, radius } = useAppSelector(
        (state) => state.locationReducer
    );

    const { data: ads } = useGetAds("/explore/taskers");

    return (
        <Layout currentTitle={"explore-taskers"} >
            {data && data?.top_tasker?.length > 0 && (
                <ThreeCardsTaskersBlock
                    data={data?.top_tasker}
                    sectionTitle="Trending Taskers"
                    href="/tasker?options=trending"
                />
            )}
            {data && data?.top_rated?.length > 0 && (
                <ThreeCardsTaskersBlock
                    data={data?.top_rated}
                    sectionTitle="Mostly Booked"
                    href="/tasker?options=top"
                />
            )}
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
            {data && data?.you_may_like?.length > 0 && (
                <ThreeCardsTaskersBlock
                    data={data?.you_may_like}
                    sectionTitle="You May Like"
                    href="/tasker?options=interested"
                />
            )}
            {data && data?.top_rated?.length > 0 && (
                <ThreeCardsTaskersBlock
                    data={data?.top_rated}
                    sectionTitle="Top Rated"
                    href="/tasker?options=rating"
                />
            )}
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

            {data && data?.nearby?.length > 0 ? (
                <ThreeCardsTaskersBlock
                    data={data?.nearby}
                    sectionTitle="Near You"
                    href="/tasker?options=near_by"
                />
            ) : (
                <Box mb={15}>
                    <h4>Near You</h4>
                    <Alert color="blue">
                        <Flex gap={10} justify={"flex-start"}>
                            <IconAlertCircle size="1.2rem" />
                            {`Taskers in "${location?.city}, ${location?.country}" not found`}
                        </Flex>
                    </Alert>
                </Box>
            )}
        </Layout>
    );
};

export default ExploreTaskers;

export const getStaticProps: GetStaticProps = async () => {
    try {
        const { data: exploreTaskersData } =
            await axiosClient.get<ExploreServicesProps>(urls.explore.taskers);

        return {
            props: {
                exploreTaskersData,
            },
            revalidate: 10,
        };
    } catch (err: any) {
        return {
            props: {
                exploreTaskersData: [],
            },
            revalidate: 10,
        };
    }
};
