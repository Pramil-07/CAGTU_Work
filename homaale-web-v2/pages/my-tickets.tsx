import { Badge, Box, Flex, Pagination, Select, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";

import Empty from "@/components/common/Empty";
import Layout from "@/components/Layout/Layout";
import SkeletonMyTickets from "@/components/skeletons/SkeletonMyTickets";
import urls from "@/constants/urls";
import { useSupportStyles } from "@/styles/pages/SupportStyles";
import type { MyTicketsProps } from "@/types/MyTicketsProps";
import { axiosClient } from "@/utils/axiosClient";

const MyTickets = () => {
    const { classes, theme } = useSupportStyles();
    const smallScreen = useMediaQuery("(max-width: 36em)");

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState<string>("");
    const queryClient = new QueryClient();

    const { data, isLoading } = useQuery(
        ["my-tickets", pageNumber, pageSize],
        async () => {
            try {
                const { data } = await axiosClient.get<MyTicketsProps>(
                    `${urls.report.support_ticket}?page=${pageNumber}&page_size=${pageSize}`
                );
                queryClient.invalidateQueries(["my-tickets"]);
                return data;
            } catch (error) {
                console.log("🚀 ~ file: index.tsx:18 ~ error", error);
            }
        }
    );
    return (
        <Layout heading="My Tickets" currentTitle="my-tickets">
            {data?.result && data?.result?.length <= 0 && (
                <Empty
                    title="No tickets found."
                    description="You have not created any tickets yet."
                    btnTitle="Test"
                    link=""
                />
            )}
            {isLoading ? (
                <SkeletonMyTickets />
            ) : (
                data?.result &&
                data.result.map((item) => {
                    return (
                        <Flex
                            className={classes.myTickets}
                            // justify={"flex-start"}
                            align={"flex-start"}
                            direction={smallScreen ? "column" : "row"}
                            mb={24}
                            key={item?.id}
                        >
                            <Flex justify={"start"}>
                                {!smallScreen && (
                                    <Image
                                        src={
                                            theme.colorScheme === "dark"
                                                ? "/images/logo/homaale-logo-white_svg.svg"
                                                : "/images/logo/homaale-logo-dark_svg.svg"
                                        }
                                        placeholder="blur"
                                        blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                        alt={`img-`}
                                        height={94}
                                        width={120}
                                        style={{
                                            objectFit: "contain",
                                            borderRadius: 4,
                                            padding: 4,
                                            marginBottom: 8,
                                            background:
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[7]
                                                    : `inherit`,
                                            border:
                                                theme.colorScheme === "dark"
                                                    ? `1px solid ${theme.colors.dark[7]}`
                                                    : `1px solid rgba(0, 0, 0, 0.08)`,
                                        }}
                                    />
                                )}
                                <Box ml={smallScreen ? 0 : 24} maw={"100%"}>
                                    <h4>{item?.type?.name}</h4>

                                    <Text
                                        component="p"
                                        color={
                                            theme.colorScheme === "dark"
                                                ? theme.colors.dark[0]
                                                : theme.colors.homaaleSlate[5]
                                        }
                                    >
                                        {item?.description}{" "}
                                    </Text>
                                    <Text
                                        mt={8}
                                        color={
                                            theme.colorScheme === "dark"
                                                ? theme.colors.dark[0]
                                                : theme.colors.homaaleSlate[6]
                                        }
                                    >
                                        {formatDistanceToNow(
                                            new Date(item?.created_at),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </Text>
                                </Box>
                            </Flex>
                            <Badge
                                mt={smallScreen ? 8 : 0}
                                color={
                                    item?.status === "open"
                                        ? "green"
                                        : item?.status === "assigned"
                                        ? "blue"
                                        : "red"
                                }
                            >
                                {item?.status}
                            </Badge>
                        </Flex>
                    );
                })
            )}

            {data?.result && data?.result?.length > 0 && (
                <Flex mt={16}>
                    <Select
                        data={["10", "20", "30", "40"]}
                        placeholder="10"
                        onChange={(value) => {
                            if (value) setPageSize(value);
                        }}
                    />
                    <Pagination
                        total={data ? data?.total_pages : 0}
                        color="orange"
                        size={"md"}
                        value={pageNumber}
                        onChange={(value) => {
                            setPageNumber(value);
                        }}
                    />
                </Flex>
            )}
        </Layout>
    );
};

export default MyTickets;
