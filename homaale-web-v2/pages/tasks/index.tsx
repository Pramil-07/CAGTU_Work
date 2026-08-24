import { AspectRatio } from "@mantine/core";
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import EntityListView from "@/components/EntityListView";
import EntityMapView from "@/components/EntityMapView";
import EntityLayout from "@/components/Layout/EntityLayout";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { reset } from "@/features/utils/filterSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useGetAds } from "@/hooks/useGetAds";
import { useUser } from "@/hooks/useUser";
import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import { axiosClient } from "@/utils/axiosClient";
import { advancedFilter } from "@/utils/helpers";

const Tasks: NextPage= () => {
    const dispatch = useAppDispatch();

    const [page, setPage] = useState(1);

    const { data: userData } = useUser();

    const router = useRouter();

    const { query } = useAppSelector((state) => state.filterReducer);

    const [extendedQuery, setExtendedQuery] = useState("");
    const [taskData, setTaskData] = useState<EntityServiceLisitngProps | null>(null);


    useEffect(() => {
        if (!router.query.search) {
            dispatch(reset());
        }
    }, [dispatch, router.query.search]);

    const moreFilter = advancedFilter((router.query.options as string) ?? "");

    useEffect(() => {
        setExtendedQuery(
            query + `&category=${router?.query?.category ?? ""}` + moreFilter
        );
        setPage(1);
    }, [moreFilter, query, router?.query?.category]);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const { data } = await axiosClient.get<EntityServiceLisitngProps>(
                    `${urls.entity.task}&owned=false&page_size=9&page=${1}`
                );
                setTaskData(data);
            } catch (err: any) {
                setTaskData(null);
            }
        };

        fetchTaskData();
    }, []);
    // TO switch filters between explore task and my task
    const [activeId, setActiveId] = useState(1);

    const [isGrid, setIsGrid] = useState(true);

    useEffect(() => {
        setActiveId(
            router.query.active_tab
                ? parseInt(router.query.active_tab as string)
                : 1
        );
        setPage(1);
    }, [router.query.active_tab]);

    let ownerFilter!: string;
    if (activeId === 1) {
        ownerFilter = `&owned=false`;
    } else if (activeId === 2) {
        ownerFilter = `&created_by=${userData?.id}`;
    }

    const { data: ads } = useGetAds("/tasks");

    return (
        <Layout currentTitle={"tasks"}>
            <EntityLayout
                type={"task"}
                activeId={activeId}
                setActiveId={setActiveId}
                isGrid={isGrid}
                setIsGrid={setIsGrid}
                currentTitle="task"
            >
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
                                className={"ads-section-tasks"}
                                id={"ads-section-tasks"}
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
                {isGrid && taskData ? (
                    <EntityListView
                        entityData={taskData}
                        activeId={activeId}
                        page={page}
                        setPage={setPage}
                        is_requested={true}
                        ownerFilter={ownerFilter}
                        query={extendedQuery}
                    />
                ) : (
                    isGrid && <div>Loading...</div> // or some fallback UI
                )}
                <EntityMapView
                    is_bookmark={activeId === 3 ? true : false}
                    is_requested={true}
                    query={extendedQuery}
                    ownerFilter={ownerFilter}
                />
            </EntityLayout>
        </Layout>
    );
};

export default Tasks;

// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const { data: taskData } =
//             await axiosClient.get<EntityServiceLisitngProps>(
//                 `${urls.entity.task}&owned=false&page_size=9&page=${1}`
//             );
//
//         return {
//             props: {
//                 taskData,
//             },
//             revalidate: 10,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 servicesData: [],
//             },
//             revalidate: 10,
//         };
//     }
// };
