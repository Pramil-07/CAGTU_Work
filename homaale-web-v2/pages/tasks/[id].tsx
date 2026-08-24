import {AspectRatio, Badge, Button, useMantineTheme} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

import EntityServiceDetail from "@/components/EntityServiceDetail";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import {useGetAds} from "@/hooks/useGetAds";
import type {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
import type {RecommendedProps} from "@/types/RecommendedProps";
import {axiosClient} from "@/utils/axiosClient";
import {useUser} from "@/hooks/useUser";
import {useMediaQuery} from "@mantine/hooks";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa";
import { IoAlertOutline } from "react-icons/io5";
import {notifications} from "@mantine/notifications";
import {isLoggedIn} from "@/utils/helpers";

const TaskDetail = ({
                        taskData,
                        recommendedTaskData,
                    }: {
    taskData: EntityServiceDetailProps;
    recommendedTaskData: RecommendedProps;
}) => {
    const router = useRouter();
    const {id} = router.query;

    const [taskDetail, setTaskDetail] = useState<EntityServiceDetailProps>(
        taskData
    );
    const [recommendedTaskDetail, setRecommendedTaskDetail] = useState<RecommendedProps>(
        recommendedTaskData
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [viewMode, setViewMode] = useState<boolean>(false);
    const [isUser, setIsUser] = useState<boolean>(false);
    const theme = useMantineTheme();
    useEffect(() => {
        const fetchTaskDetail = async () => {
            setIsLoading(true);
            try {
                const {data} = await axiosClient.get<EntityServiceDetailProps>(
                    `${urls.entity.list}${id}/`
                );
                console.log("Fetched taskData from API:", data);
                if (data) {
                    setTaskDetail(data);

                }

                const {data: recommendedTaskData} =
                    await axiosClient.get<RecommendedProps>(
                        `${urls.entity.recommended_similar}${id}/`
                    );

                setRecommendedTaskDetail(recommendedTaskData)

            } catch (err) {
                console.error("Error fetching task detail:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTaskDetail().then(r => console.log(r));
    }, [id]);
    const showErrorNotification = (message: string) => {
        notifications.show({
            title: "Something went wrong",
            message,
            color: "red",
            icon: <IoAlertOutline  className="w-4 h-4"/>,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "21px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };
    const handleActive = async () => {
        if (!is_user) return;
        try {
            const response = await axiosClient.put(`task/entity/active/${id}/`, {
                is_active: true,
            });
            setTaskDetail((prev) => ({ ...prev, is_active: true }));
        } catch (error) {
            showErrorNotification("Something went wrong, try again later!!!");
        }
    };
    const handleInactive = async () => {
        if (!is_user) return;
        try {
            const response = await axiosClient.put(`task/entity/active/${id}/`, {
                is_active: false,
            });
            setTaskDetail((prev) => ({ ...prev, is_active: false }));
        } catch (error) {

            showErrorNotification("Something went wrong, try again later!!!");
        }
    };
    if (error) {
        console.log(error);
    }
    const handleViewModeChange = (isUserView: boolean, isUserFromChild: boolean) => {
        setViewMode(isUserView);
        setIsUser(isUserFromChild);
    };
    const {data: ads} = useGetAds(router.asPath);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const {data: userData} = useUser();
    const is_user: boolean = userData?.id === taskDetail?.created_by.id;
    const active = taskDetail?.is_active;
    console.log ("active",taskDetail?.is_active);
    console.log ("id",is_user);
    console.log ("user id",userData?.id);
    console.log ("owner id ",taskDetail?.created_by.id);
    return (
        <Layout
            title={taskData?.title}
            ogImage={taskData?.images[0]?.media ?? ""}
            heading={
            <div className="flex justify-between">
                <span>Task Details</span>

                {viewMode && (
                    <Badge size={isMobile ? "xs" : "md"} color="red">
                        Viewing page as User
                    </Badge>
                )}
                {isLoggedIn() && !isLoading && is_user && (
                <>
                {active ? (
                    <Button
                        disabled={isLoading}
                        onClick={handleInactive}
                        variant="outline"
                        size="xs"
                        mr={isMobile ? "-10%" : "7%"}>
                        <FaEye
                            size={20}
                            style={{marginRight:4, color: theme.colors.gray[6]}}
                        /> Active
                    </Button>
                ) : (
                    <Button
                        disabled={isLoading}
                        onClick={handleActive}
                        variant="outline"
                        size="xs"
                        mr={isMobile ? "-10%" : "7%"}>
                        <FaEyeSlash
                            size={20}
                            style={{marginRight:4, color: theme.colors.gray[6]}}
                        />   Inactive
                    </Button>
                )}
                    </>
                    )}
            </div>
        }

            breadCrumbsItems={[{
                name: "Task & Bookings",
                href: ""
            },{name: "Explore", href: "/explore"}, {name: "Tasks", href: "/explore?type=task"}]}
            currentTitle={taskDetail?.title}
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
                            className={"ads-section-task-detail"}
                            id={"ads-section-task-detail"}
                            key={item.id}
                            style={{margin: "16px 0 0"}}
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
            <EntityServiceDetail
                entityDetail={taskDetail}
                onViewModeChange={handleViewModeChange}
                recommendedTaskData={recommendedTaskDetail}
            />
        </Layout>
    );
};

export default TaskDetail;
