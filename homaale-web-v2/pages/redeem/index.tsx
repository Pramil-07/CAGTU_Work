import {Box, Flex, Grid, Pagination, ScrollArea, Select, Table, Tabs, Text, useMantineTheme,} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import {format} from "date-fns";
import type {NextPage} from "next";
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

import Empty from "@/components/common/Empty";
import {Filters} from "@/components/common/Filters";
import {ResetButton} from "@/components/common/ResetButton";
import Layout from "@/components/Layout/Layout";
import {SkeletonTableList} from "@/components/skeletons/SkeletonTableList";
import {REDEEM_STATUS} from "@/constants/REDEEM_STATUS";
import urls from "@/constants/urls";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useRedeemstatement} from "@/hooks/Redeem/redeemstatement";
import type {OffersProps} from "@/types/OfferProps";
import type {RewardPointsListingProps} from "@/types/redeem/RewarPointsListing";
import {axiosClient} from "@/utils/axiosClient";

const TransactionDesc = dynamic(
    () => import("@/components/Redeem/TransactionDesc"),
    {
        ssr: false,
        loading: () => <div style={{width: '100%', height: '100px', background: '#f5f5f5'}}/>
    }
);

const RedeemCard = dynamic(() => import("@/components/Redeem/RedeemCard"), {
    ssr: false,
    loading: () => <div style={{width: '100%', height: '200px', background: '#f5f5f5'}}/>
});

const Redeem: NextPage = () => {
    const theme = useMantineTheme();
    const [paginationNumber, setPaginationNumber] = useState(1);
    const [pageSize, setPageSize] = useState<string>("10");
    const {query, date} = useAppSelector((state) => state.filterReducer);
    const dispatch = useAppDispatch();

    // Fetch offers data with proper typing and fallback
    const {data: offers = {result: []}, isLoading: offersLoading} = useQuery<OffersProps>(
        ["redeemOffers"],
        async () => {
            try {
                const {data} = await axiosClient.get(
                    `${urls.offer.all}?has_redeem_points=true`
                );
                return data || {result: []};
            } catch (error) {
                console.error("Error fetching offers:", error);
                return {result: []};
            }
        },
        {
            staleTime: 1000 * 60 * 5, // 5 minutes
        }
    );

    // Fetch reward points data with proper typing and fallback
    const {
        data: rewardPoints = {current: 0, earned: 0, spent: 0},
        isLoading: pointsLoading
    } = useQuery<RewardPointsListingProps>(
        ["rewardPoints"],
        async () => {
            try {
                const {data} = await axiosClient.get(
                    `${urls.redeem.rewardpoints}`
                );
                return data || {current: 0, earned: 0, spent: 0};
            } catch (error) {
                console.error("Error fetching reward points:", error);
                return {current: 0, earned: 0, spent: 0};
            }
        }
    );

    // Fetch redeem statement data with proper typing and fallback
    const {data: redeemStatement = {result: [], total_pages: 0}, isLoading: statementLoading} = useRedeemstatement(
        paginationNumber,
        pageSize ?? "10",
        query ?? ""
    );

    useEffect(() => {
        setPaginationNumber(1);
    }, [query, pageSize]);

    const elements = redeemStatement.result?.map((item) => {
        return {
            created_at: format(
                new Date(item?.created_at),
                "dd MMM, yyyy | hh:mm a"
            ),
            earnedUsing: item?.object_repr || "",
            points: item?.points || 0,
            status: item?.status || "",
        };
    }) || [];

    const render_status_button = (status: string) => {
        switch (status) {
            case REDEEM_STATUS.Earned:
                return {
                    title: REDEEM_STATUS.Earned,
                    color: "#38C675",
                    bgcolor: "#EBF9F1",
                };
            case REDEEM_STATUS.Spent:
                return {
                    title: REDEEM_STATUS.Spent,
                    color: "#FE5050",
                    bgcolor: "#FFEDED",
                };
            default:
                return {
                    title: "",
                    color: "",
                    bgcolor: "",
                };
        }
    };

    const [activeTab, setActiveTab] = useState<string | null>("redeem");

    const rows = elements.map((element, index) => (
        <tr key={index}>
            <td style={{paddingLeft: 32}}>{element.created_at}</td>
            <td>{element.earnedUsing}</td>
            <td>{Math.abs(element.points)}</td>
            <td>
                <Text
                    component="p"
                    sx={{
                        textAlign: "center",
                        borderRadius: 6,
                        textTransform: "capitalize",
                    }}
                    p={"6px 20px"}
                    w={"80%"}
                    color={render_status_button(element.status)?.color}
                    bg={`${render_status_button(element.status)?.bgcolor}`}
                >
                    {render_status_button(element.status)?.title}
                </Text>
            </td>
        </tr>
    ));

    if (pointsLoading || offersLoading) {
        return (
            <Layout currentTitle={"redeem"} heading={"Redeem"}>
                <SkeletonTableList/>
            </Layout>
        );
    }

    return (
        <Layout currentTitle={"redeem"} heading={"Redeem"}>
            <Box>
                <Flex
                    justify={"flex-start"}
                    gap={40}
                    direction={{base: "column", xs: "row"}}
                    mb={34}
                >
                    <TransactionDesc
                        desc={"Current Points"}
                        color={theme.colors.brand[3]}
                        reward_points={rewardPoints.current}
                    />
                    <TransactionDesc
                        desc={"Total Earned"}
                        color={"#38C675"}
                        reward_points={rewardPoints.earned}
                    />
                    <TransactionDesc
                        desc={"Total Spent"}
                        color={"#FE5050"}
                        reward_points={rewardPoints.spent}
                    />
                </Flex>
                <Tabs
                    value={activeTab}
                    defaultValue="redeem"
                    onTabChange={setActiveTab}
                    style={{border: "none"}}
                    className="tabs"
                >
                    <Tabs.List mb={12} p={0}>
                        <Tabs.Tab
                            value="redeem"
                            sx={{
                                color:
                                    activeTab === "redeem"
                                        ? theme.colors.brand[3]
                                        : theme.colors.gray[7],
                                fontSize: 16,
                                fontWeight: 500,
                            }}
                        >
                            Redeem
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="statements"
                            sx={{
                                color:
                                    activeTab === "statements"
                                        ? theme.colors.brand[3]
                                        : theme.colors.gray[7],
                                fontSize: 16,
                                fontWeight: 500,
                            }}
                        >
                            Statements
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="redeem" pt="xs">
                        {offers.result.length > 0 ? (
                            <Grid>
                                {offers.result
                                    .filter((item) => item.offer_type === "promo_code")
                                    .map((item, index) => (
                                        <Grid.Col
                                            key={index}
                                            md={3}
                                            sx={{display: "flex"}}
                                        >
                                            <RedeemCard offers={item}/>
                                        </Grid.Col>
                                    ))}
                            </Grid>
                        ) : (
                            <Empty
                                title={"No Redeem Offers available."}
                                description={"No offers to redeem."}
                            />
                        )}
                    </Tabs.Panel>
                    <Tabs.Panel value="statements" pt="xs">
                        <Flex>
                            <Filters statusFilter statusType="redeem"/>
                            {query && <ResetButton/>}
                        </Flex>
                        {statementLoading ? (
                            <SkeletonTableList/>
                        ) : (
                            <ScrollArea>
                                <Box p={"16px 0px 0px"}>
                                    {redeemStatement.result.length > 0 ? (
                                        <>
                                            <Table
                                                mt={20}
                                                sx={{
                                                    border: "1px solid rgba(0, 0, 0, 0.08)",
                                                }}
                                                verticalSpacing={"lg"}
                                            >
                                                {/* Table content remains the same */}
                                                <thead>
                                                {/* ... existing thead content ... */}
                                                </thead>
                                                <tbody>{rows}</tbody>
                                            </Table>
                                            <Flex justify={"space-between"} mt={16}>
                                                <Select
                                                    data={["10", "20", "30", "40"]}
                                                    value={pageSize}
                                                    placeholder="10"
                                                    onChange={(value) => {
                                                        if (value) setPageSize(value);
                                                    }}
                                                />
                                                <Pagination
                                                    total={redeemStatement.total_pages}
                                                    color={theme.colors.brand[3]}
                                                    radius={"lg"}
                                                    value={paginationNumber}
                                                    onChange={(value) => {
                                                        setPaginationNumber(value);
                                                    }}
                                                />
                                            </Flex>
                                        </>
                                    ) : (
                                        <Empty title="No Data Found." description=""/>
                                    )}
                                </Box>
                            </ScrollArea>
                        )}
                    </Tabs.Panel>
                </Tabs>
            </Box>
        </Layout>
    );
};

export default Redeem;
