import {Grid} from "@mantine/core";
// import { useQuery } from "@tanstack/react-query";
// import type { GetStaticPaths, GetStaticProps } from "next";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

import Layout from "@/components/Layout/Layout";
import TaskerProfileTab from "@/components/profile/tasker/TaskerProfileTab";
import UserDetailsCard from "@/components/profile/UserDetailsCard";
import urls from "@/constants/urls";
import {useUser} from "@/hooks/useUser";
import type {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
import type {EntityServiceLisitngProps} from "@/types/EntityServiceLisitngProps";
import type {ProfileResponseProps} from "@/types/ProfileResponseProps";
import type {RecommendedProps} from "@/types/RecommendedProps";
import type {TaskerProps} from "@/types/TaskerProps";
import {axiosClient} from "@/utils/axiosClient";

const TaskerDetail = ({
                          taskerData,
                          taskerServices,
                          taskerTasks,
                      }: {
    taskerData: ProfileResponseProps;
    // taskerData: EntityServiceDetailProps;
    taskerServices: EntityServiceLisitngProps;
    taskerTasks: EntityServiceLisitngProps;
}) => {
    const {data: userData} = useUser();
    const router = useRouter();


    const {id} = router.query;
    const [taskerDetail, setTaskerDetail] = useState<ProfileResponseProps>(
        taskerData
    );
    // const [recommendedTaskerDetail, setRecommendedTaskerDetail] = useState<RecommendedProps | null>(
    //     null
    // );
    // const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    useEffect(() => {
        const fetchTaskerDetail = async () => {

            try {

                const {data} = await axiosClient.get<ProfileResponseProps>(
                    `${urls.tasker.profile}${id}/`
                );
                // console.log("Fetched taskerData from API:", data);
                setTaskerDetail(data);

            } catch (err) {
                console.error("Error fetching tasker detail:", err);
                setError(err);
            }
        };
        fetchTaskerDetail().then(r => console.log(r));
    }, [id]);
    if (error) {
        console.log(error);
    }
    return (
        <Layout
            heading="Tasker Details"
            breadCrumbsItems={[{name: "tasker", href: "/tasker"}]}
            currentTitle={taskerDetail?.full_name.charAt(0).toUpperCase() + taskerDetail?.full_name.slice(1)}
        >
            <Grid gutter={30}>
                <Grid.Col lg={4}>
                    <UserDetailsCard profile={taskerDetail} isOwn={false}/>
                </Grid.Col>
                <Grid.Col lg={8}>
                    <TaskerProfileTab
                        taskerData={taskerDetail}
                        taskerServices={taskerServices}
                        taskerTasks={taskerTasks}
                    />
                </Grid.Col>
            </Grid>
        </Layout>
    );
};

export default TaskerDetail;


