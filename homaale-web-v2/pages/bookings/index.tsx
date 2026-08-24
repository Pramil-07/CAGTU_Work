import {Button, Grid, Pagination, Tabs} from "@mantine/core";
import {useQuery} from "@tanstack/react-query";
import type {NextPage} from "next";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {ServiceCard} from "@/components/cards/ServiceCard";
import Empty from "@/components/common/Empty";
import EntityLayout from "@/components/Layout/EntityLayout";
import Layout from "@/components/Layout/Layout";
import {SkeletonServiceCard} from "@/components/skeletons/SkeletonServiceCard";
import urls from "@/constants/urls";
import {reset} from "@/features/utils/filterSlice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import type {TaskBookingProps} from "@/types/booking/TaskBookingProps";
import {axiosClient} from "@/utils/axiosClient";
import type {MyBookingProps} from "@/types/booking/MyBookingProps";
import WaitingListCard from "@/components/cards/waitingListCard";
import BoxCard from "@/components/box/BoxPayCard";
import SkeletonBoxList from "@/components/skeletons/SkeletonBoxList";


const Bookings: NextPage<{ taskData: TaskBookingProps }> = ({taskData}) => {
    const {query} = useAppSelector((state) => state.filterReducer);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [activeId, setActiveId] = useState(1);
    const [page, setPage] = useState(1);
    const [waiting, setWaiting] = useState<MyBookingProps>();

    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    useEffect(() => {
        setPage(1);
        const activeTab = router.query.active_tab as string;
        if (activeTab === "booking") {
            setActiveId(1);
        } else if (activeTab === "mybookings") {
            setActiveId(2);
        } else if (activeTab === "waiting") {
            setActiveId(3);
        } else {
            setActiveId(1); // Default to "booking" if no valid active_tab
        }
    }, [router.query.active_tab]);


    const isWaitingList = activeId === 3;
    const title = isWaitingList ? "Waiting List" : activeId === 1 ? "Bookings" : "My Bookings";

    const active = activeId === 1 ? true : activeId === 2 ? false : false;


    const fetchWaiting = async () => {
        if (activeId === 3) {
            try {
                const response = await axiosClient.get<MyBookingProps>(
                    `${urls.booking.my_booking}?is_accepted=false`
                );
                console.log("🚀 ~ file: index.tsx:53 ~ > ~ wating data:", data);
                setWaiting(response.data)
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: index.tsx:18 ~ const{data:orderData}=useQuery ~ error:",
                    error
                );
            }
        }
    }
    useEffect(() => {
        fetchWaiting()
    }, [isWaitingList]);

    console.log('waiting', waiting)
    console.log('waiting acitveid', activeId)


    const {data = taskData, isLoading} = useQuery(
        ["bookings-listing", page, query, activeId],
        async () => {
            if (activeId !== 3) {
                const params = activeId === 1 ? true : activeId === 2 ? false : false;
                try {
                    const {data} = await axiosClient.get<TaskBookingProps>(
                        `${urls.booking.new_task}?page_size=9&assigned_to_me=${params}&page=${page}${query}`
                    );
                    console.log("data", data);
                    console.log("query", query);
                    return data;
                } catch (error) {
                    console.log("🚀 ~ file: index.tsx:18 ~ error", error);
                }
            }

        },
        {enabled: !!page}
    );

    const truncateName = (name: string | undefined) => {
        if (!name) return "";
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        const letterCount = capitalized.replace(/\s+/g, '').length;
        if (letterCount > 25) {
            let currentLetters = 0;
            let truncated = '';
            for (const char of capitalized) {
                if (char !== ' ') currentLetters++;
                if (currentLetters > 25) {
                    truncated += '...';
                    20
                    break;
                }
                truncated += char;
            }
            return truncated;
        }
        return capitalized;
    };
    console.log("booking data", data)


    return (
        <Layout currentTitle={title} hideBreadCrumbs={true}>
            <div>
                {/* <Button onClick={() => {
       setActiveId(1);
       router.push({ query: { ...router.query, active_tab: '1' } }, undefined, { shallow: true });
       }} variant={activeId === 1 ? "default" : "outline"}>
          Bookings
        </Button>
        <Button onClick={() => {
       setActiveId(2);
       router.push({ query: { ...router.query, active_tab: "2" } }, undefined, { shallow: true });
       }} >
         My Bookings
        </Button> */}
                <div>
                    <Tabs
                        value={activeId === 1 ? "booking" : isWaitingList ? "waiting" : "mybookings"} // Controlled value based on activeId
                        onTabChange={(value) => {
                            const newActiveId = value === "booking" ? 1 : value === 'waiting' ? 3 : 2;
                            setActiveId(newActiveId);
                            router.push(
                                {
                                    query: {
                                        ...router.query,
                                        active_tab: value, // "booking" or "mybookings"
                                    },
                                },
                                undefined,
                                {shallow: true}
                            );
                        }}
                        className="mt-4"
                    >
                        <Tabs.List>
                            <Tabs.Tab value="booking">Bookings</Tabs.Tab>
                            <Tabs.Tab value="mybookings">My Bookings</Tabs.Tab>
                            <Tabs.Tab value='waiting'>Waiting List</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </div>

            </div>
            <EntityLayout

                type={'booking'}
                activeId={activeId}
                setActiveId={setActiveId}
                currentTitle="Bookings"
                breadCrumbsItems={[{name: "Tasks & Bookings", href: ""}]}

            >


                <Grid gutter={30} mt={34}>
                    {!isWaitingList && (
                        <>
                            {!isLoading && data?.result?.map((booking, index) => (
                                <Grid.Col
                                    span={12}
                                    md={6}
                                    lg={6}
                                    xl={4}
                                    key={index}
                                >
                                    <ServiceCard
                                        booking={booking}
                                        active={active}
                                    />
                                </Grid.Col>
                            ))}
                        </>
                    )}
                    {isWaitingList && (
                        <>
                            {waiting?.result && waiting.result.length > 0 ? (
                                <div style={{ marginTop: -20, padding: '0px 20px 10px 10px', width: '100%' }}>
                                    <BoxCard
                                        bookingData={waiting.result  as any}
                                        truncateName={truncateName}
                                    />
                                </div>
                            ) : ( isLoading && Array.from({ length: 5 }).map((_, index) => (
                                <SkeletonBoxList key={index} />
                            )))}
                        </>
                    )}

                    {!isWaitingList && isLoading && Array.from({length: 9}).map((_, index) => (
                        <Grid.Col
                            span={12}
                            md={6}
                            lg={6}
                            xl={4}
                            key={index}
                        >
                            <SkeletonServiceCard/>
                        </Grid.Col>
                    ))}


                    {!isWaitingList && isLoading &&
                        Array.from({length: 9}).map((_, index) => (
                            <Grid.Col
                                span={12}
                                md={6}
                                lg={6}
                                xl={4}
                                key={index}
                            >
                                <SkeletonServiceCard/>
                            </Grid.Col>
                        ))}
                    {!isLoading && data?.result?.length <= 0 && (
                        <Empty
                            title="No bookings found."
                            description="You have no running bookings at the moment."
                        />
                    )}
                </Grid>
                {!isLoading && data?.result?.length > 0 && (
                    <Pagination
                        sx={{justifyContent: "center"}}
                        radius={"lg"}
                        mt={28}
                        total={data?.total_pages}
                        value={page}
                        onChange={setPage}
                    />
                )}
            </EntityLayout>
        </Layout>
    );
};

export default Bookings;
