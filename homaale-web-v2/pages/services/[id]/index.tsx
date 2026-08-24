import {AspectRatio, Badge, Button, useMantineTheme} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

import EntityServiceDetail from "@/components/EntityServiceDetail";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import {useGetAds} from "@/hooks/useGetAds";
import {useServiceDiscountStyles} from "@/styles/components/serviceDiscountStyles";
import type {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
import type {RecommendedProps} from "@/types/RecommendedProps";
import {axiosClient} from "@/utils/axiosClient";
import {IconAlertCircle} from "@tabler/icons-react";
import {useUser} from "@/hooks/useUser";
import {useMediaQuery} from "@mantine/hooks";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa";
import { IoAlertOutline } from "react-icons/io5";
import {notifications} from "@mantine/notifications";
import {isLoggedIn} from "@/utils/helpers";

const ServiceDetail = ({
                           serviceData,
                           recommendedTaskData,
                       }: {
    serviceData: EntityServiceDetailProps;
    recommendedTaskData: RecommendedProps;
}) => {
    const router = useRouter();
    const {id} = router.query;

    const {classes} = useServiceDiscountStyles();
    const [serviceDetail, setServiceDetail] = useState<EntityServiceDetailProps>(
        serviceData
    );
    const [recommendedTaskDetail, setRecommendedTaskDetail] = useState<RecommendedProps>(recommendedTaskData);


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [viewMode, setViewMode] = useState<boolean>(false);
    const [isUser, setIsUser] = useState<boolean>(false);
    const theme = useMantineTheme();

    const {data: userData} = useUser();
    const is_user: boolean = userData?.id === serviceDetail?.created_by.id;
    const active = serviceDetail?.is_active;
    const is_draft= serviceDetail?.status_choice==="draft"
    console.log ("active",serviceDetail?.is_active);
    console.log ("id",is_user);
    console.log ("user id",serviceDetail?.id);
    console.log ("owner id ",serviceDetail?.created_by.id);
    useEffect(() => {
        const fetchServiceDetail = async () => {
            setIsLoading(true);
            try {
                const {data} = await axiosClient.get<EntityServiceDetailProps>(
                    `${urls.entity.list}${id}/`
                );
                console.log("Fetched serviceData from API:", data);
                setServiceDetail(data);

                const {data: recommendedTaskData} =
                    await axiosClient.get<RecommendedProps>(
                        `${urls.entity.recommended_similar}${id}/`
                    );

                setRecommendedTaskDetail(recommendedTaskData)

            } catch (err) {
                console.error("Error fetching service detail:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceDetail().then(r => console.log(r));
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
                right: "20px",
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
            setServiceDetail((prev) => ({ ...prev, is_active: true }));
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
            setServiceDetail((prev) => ({ ...prev, is_active: false }));
        } catch (error) {

            showErrorNotification("Something went wrong, try again later!!!");
        }
    };
    const { data: ads } = useGetAds(router.asPath);
    const handleViewModeChange = (isUserView: boolean, isUserFromChild: boolean) => {
        setViewMode(isUserView);
        setIsUser(isUserFromChild);
    };
    if (error) {
        console.log(error);
    }
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <Layout

            title={serviceData?.title}
            ogImage={serviceData?.images[0]?.media ?? ""}
            heading={
                <div className="flex justify-between">
                    <span>Service Details</span>

                    {viewMode && (
                        <Badge size={isMobile ? "xs" : "md"} color="red">
                            Viewing page as User
                        </Badge>
                    )}
                    {isLoggedIn() && !isLoading && is_user && !is_draft &&(
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
            breadCrumbsItems={[{name:"Task & Bookings", href:""},{name: "Explore", href: "/explore"}, {
                name: " Services",
                href: "/explore?type=services"
            }]}
            currentTitle={serviceDetail?.title}
        >

            {serviceDetail && serviceDetail.discount_value > 0 && serviceDetail.discount_type && (
                <div className={classes.ribbonContainer}>
                    <div className={classes.cornerRibbon}>
                        {serviceDetail.discount_type.toLowerCase() === "percentage" ? (
                            `${Math.floor(serviceDetail.discount_value)} % OFF`
                        ) : (
                            `${serviceDetail.currency.symbol} ${Math.floor(serviceDetail.discount_value)} OFF`
                        )}
                    </div>
                </div>
            )}

            {
                ads?.result &&
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
                            className={"ads-section-service-detail"}
                            id={"ads-section-service-detail"}
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
                entityDetail={serviceDetail}
                onViewModeChange={handleViewModeChange}
                recommendedTaskData={recommendedTaskDetail}


            />
        </Layout>
    );
};

export default ServiceDetail;
