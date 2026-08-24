import { AspectRatio, Grid, Pagination } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import Empty from "@/components/common/Empty";
import { Filters } from "@/components/common/Filters";
import { TaskerCard } from "@/components/common/TaskerCard";
import Layout from "@/components/Layout/Layout";
import { SkeletonServiceCard } from "@/components/skeletons/SkeletonServiceCard";
import urls from "@/constants/urls";
import { reset } from "@/features/utils/filterSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useGetAds } from "@/hooks/useGetAds";
import type { TaskerProps } from "@/types/TaskerProps";
import { axiosClient } from "@/utils/axiosClient";
import { advancedFilter } from "@/utils/helpers";

const TaskerList: NextPage<{
    taskerData: TaskerProps;
}> = ({ taskerData }) => {
    const [page, setPage] = useState(1);
    const { query } = useAppSelector((state) => state.filterReducer);
    const dispatch = useAppDispatch();

    const router = useRouter();

    const [extendedQuery, setExtendedQuery] = useState("");

    useEffect(() => {
        if (!router.query.search) {
            dispatch(reset());
        }
    }, [dispatch, router.query.search]);

    const moreFilter = advancedFilter((router.query.options as string) ?? "");

    useEffect(() => {
        setExtendedQuery(query + moreFilter);
        setPage(1);
    }, [query, moreFilter]);

    const { data = taskerData, isLoading } = useQuery(
        ["tasker-listing", page, extendedQuery],
        async () => {
            try {
                const { data } = await axiosClient.get<TaskerProps>(
                    `${urls.tasker.list}?page_size=9&page=${page}${extendedQuery}`
                );
                return data;
            } catch (error) {
                console.log("🚀 ~ file: index.tsx:18 ~ error", error);
            }
        }
    );

    const { data: ads } = useGetAds("/tasker");
    const [taskerDataState, setTaskerDataState] = useState<TaskerProps  | null>(null);
    // const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {

                const { data } = await axiosClient.get<TaskerProps>(
                    `${urls.tasker.list}?page_size=9&page=1`
                );
                setTaskerDataState(data);
            } catch (err: any) {
                setTaskerDataState(null);
            }
        };

        fetchData();
    }, []);

    return (
        <Layout currentTitle={"Tasker"} heading="Tasker" breadCrumbsItems={[{name: "Tasks & Bookings", href: ""}]}>
            <Filters search location services sortTasker />
            {ads?.result &&
                ads?.result?.length > 0 &&
                ads?.result
                    .filter(
                        (val) =>
                            val?.is_active &&
                            val?.priority === 1 &&
                            val?.web_shape === "lg_thin"
                    )
                    .map((item) => (
                        <section
                            className={"ads-section-tasker"}
                            id={"ads-section-tasker"}
                            key={item.id}
                            style={{ margin: "16px 0 -24px" }}
                        >
                            <AspectRatio ratio={16 / 1.25} mx="auto">
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

            <Grid mb={60} mt={30}>
                {!isLoading || page === 1
                    ? data?.result?.map((item, index) => (
                          <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                              <TaskerCard tasker={item} />
                          </Grid.Col>
                      ))
                    : Array.from({ length: 9 }).map((_, index) => (
                          <Grid.Col span={12} md={6} lg={4} key={index}>
                              <SkeletonServiceCard />
                          </Grid.Col>
                      ))}

                {!isLoading && data && data?.result?.length <= 0 && (
                    <Empty
                        title="No data"
                        description="No taskers matching your search found."
                    />
                )}
            </Grid>
            {data && data?.result?.length > 0 && (
                <Pagination
                    sx={{ justifyContent: "center" }}
                    radius={"lg"}
                    mt={28}
                    total={data?.total_pages}
                    value={page}
                    onChange={setPage}
                />
            )}
        </Layout>
    );
};

export default TaskerList;


//
// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const { data: taskerData } = await axiosClient.get<TaskerProps>(
//             `${urls.tasker.list}?page_size=9&page=${1}`
//         );
//
//         return {
//             props: {
//                 taskerData,
//             },
//             revalidate: 10,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 taskerData: [],
//             },
//             revalidate: 10,
//         };
//     }
// };
