import { Grid, Pagination } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import type { BookMarkApiResponse } from "@/types/bookmarks";
import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import { axiosClient } from "@/utils/axiosClient";

import { ServiceCard } from "./cards/ServiceCard";
import Empty from "./common/Empty";
import { SkeletonServiceCard } from "./skeletons/SkeletonServiceCard";

const EntityListView = ({
    activeId,
    page,
    setPage,
    ownerFilter,
    query,
    entityData,
    is_requested,
    badgeStatus,
    globalCurrency
}: {
    activeId: number;
    page: number;
    ownerFilter: string;
    query: string;
    setPage: Dispatch<SetStateAction<number>>;
    entityData: EntityServiceLisitngProps;
    is_requested: boolean|any;
    badgeStatus?: boolean | string | null;
    globalCurrency?: string ;
}) => {
    const { data = entityData, isFetching } = useQuery(
        ["entity-listing", page, query, activeId, ownerFilter, is_requested],
        async () => {
            try {
                const { data } =
                    await axiosClient.get<EntityServiceLisitngProps>(
                        `${urls.entity.list}?status_choice=published&is_requested=${is_requested}${ownerFilter}&page_size=9&page=${page}${query}`
                    );
                // console.log(data)
                return data;
            } catch (error) {
                console.log("🚀 ~ file: index.tsx:18 ~ error", error);
            }
        },
        { enabled: activeId !== 3 }
    );


    const { data: bookmarkData, isLoading: isBookmarkLoading } = useQuery(
        ["bookmarks-listing", page, is_requested, query],
        async () => {
            try {
                const { data } = await axiosClient.get<BookMarkApiResponse>(
                    `${urls.bookmark}?is_requested=${is_requested}&page=${page}&page_size=9${query}`
                );
                console.log("data of bookings",data)
                return data;
            } catch (error) {
                console.log("🚀 ~ file: index.tsx:18 ~ error", error);
            }
        },
        { enabled: activeId === 3 }
    );

    return (
        <>
            <Grid gutter={30} mt={34}>
                {activeId === 3
                    ? !isBookmarkLoading
                        ? bookmarkData?.result.map((task, index) => (
                              <Grid.Col
                                  span={12}
                                  md={6}
                                  lg={6}
                                  xl={4}
                                  key={index}
                              >
                                  <ServiceCard service={task?.data}/>
                              </Grid.Col>
                          ))
                        : Array.from({ length: 9 }).map((_, index) => (
                              <Grid.Col
                                  span={12}
                                  md={6}
                                  lg={6}
                                  xl={4}
                                  key={index}
                              >
                                  <SkeletonServiceCard />
                              </Grid.Col>
                          ))
                    : !isFetching
                    ? data?.result?.map((task, index) => (
                          <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                              <ServiceCard service={task} badgeStatus={badgeStatus} query={query} globalCurrency={globalCurrency} />
                          </Grid.Col>
                      ))
                    : Array.from({ length: 9 }).map((_, index) => (
                          <Grid.Col span={12} md={6} lg={6} xl={4} key={index}>
                              <SkeletonServiceCard />
                          </Grid.Col>
                      ))}

                {/* No data display for task listing */}
                {/*{activeId !== 3 &&
                    !isFetching &&
                    data &&
                    data?.result?.length <= 0 && (
                        <Empty
                            title="No data found."
                            description="You have not posted any tasks yet."
                            btnTitle="Test"
                            link=""
                        />
                    )}*/}

                {/* No data display for task bookmark listing */}
                {activeId === 3 &&
                    !isBookmarkLoading &&
                    bookmarkData &&
                    bookmarkData?.result?.length <= 0 && (
                        <Empty
                            title="No data found."
                            description="You have not bookmarked any services yet."
                        />
                    )}
            </Grid>
            {activeId !== 3 &&
                !isFetching &&
                data &&
                data?.result?.length > 0 && (
                    <Pagination
                        sx={{ justifyContent: "center" }}
                        radius={"lg"}
                        mt={28}
                        total={data?.total_pages}
                        value={page}
                        onChange={setPage}
                    />
                )}
            {activeId === 3 &&
                !isBookmarkLoading &&
                bookmarkData &&
                bookmarkData?.result?.length > 0 && (
                    <Pagination
                        sx={{ justifyContent: "center" }}
                        radius={"lg"}
                        mt={28}
                        total={bookmarkData?.total_pages}
                        value={page}
                        onChange={setPage}
                    />
                )}
        </>
    );
};

export default EntityListView;
