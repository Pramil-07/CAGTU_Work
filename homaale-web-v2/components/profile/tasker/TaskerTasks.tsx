import { Grid, Pagination } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { ServiceCard } from "@/components/cards/ServiceCard";
import Empty from "@/components/common/Empty";
import { SkeletonServiceCard } from "@/components/skeletons/SkeletonServiceCard";
import urls from "@/constants/urls";
import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";
import { axiosClient } from "@/utils/axiosClient";

const TaskerTasks = ({
                         TaskerTasks,
                         TaskerId,
                     }: {
    TaskerTasks: EntityServiceLisitngProps;
    TaskerId: string;
}) => {
    const [paginationNumber, setPaginationNumber] = useState(1);

    const router = useRouter();
    const isTaskerTasksTab = router?.query?.active_tab === "tasks";
    const { data = TaskerTasks, isLoading } = useQuery(
        ["tasker-tasks-listing", paginationNumber, TaskerId],
        async () => {
            try {
                const { data } =
                    await axiosClient.get<EntityServiceLisitngProps>(
                        `${urls.tasker.tasks}&created_by=${router.query.id}&page=${paginationNumber}`
                    );
                return data;
            } catch (error) {
                console.log("🚀 ~ file: index.tsx:18 ~ error", error);
            }
        },
        { enabled: !!isTaskerTasksTab }
    );

    return (
        <>
            <Grid gutter={30} mt={16}>
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Grid.Col md={12} xl={6} key={index}>
                            <SkeletonServiceCard />
                        </Grid.Col>
                    ))
                ) : data && data?.result?.length > 0 ? (
                    data?.result?.map((task, index) => (
                        <Grid.Col md={12} xl={6} key={index}>
                            <ServiceCard service={task} />
                        </Grid.Col>
                    ))
                ) : (
                    <Empty
                        title="No data found."
                        description="This user has no active tasks."
                        btnTitle="Test"
                        link=""
                    />
                )}
            </Grid>

            {!isLoading && data && data?.result?.length > 0 && (
                <Pagination
                    sx={{ justifyContent: "center" }}
                    radius={"lg"}
                    mt={28}
                    total={data?.total_pages}
                    value={paginationNumber}
                    onChange={(value) => {
                        setPaginationNumber(value);
                    }}
                />
            )}
        </>
    );
};

export default TaskerTasks;
