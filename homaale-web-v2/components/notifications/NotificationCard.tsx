import { Box, useMantineTheme } from "@mantine/core";
import {
    IconBriefcase,
    IconFileDescription,
    IconGift,
    IconUserCheck,
    IconUserX,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import { TITLE_TYPES } from "@/constants/NotificationTitleTypes";
import { useNotificationStyles } from "@/styles/components/NotificationStyles";
import type { NotificationProps } from "@/types/NotificationProps";
import { axiosClient } from "@/utils/axiosClient";

export const NotificationCard = ({
    notification,
}: {
    notification: NotificationProps["result"][0];
}) => {
    const { classes } = useNotificationStyles();
    const { title, created_date, created_for, content_object, id, read_date } =
        notification ?? ({} as NotificationProps["result"][0]);

    const theme = useMantineTheme();
    const router = useRouter();

    const renderBodyWRTTitle = () => {
        switch (title) {
            case TITLE_TYPES.approval:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name}{" "}
                            <span> is interested for </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.booked:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name}{" "}
                            <span> has booked for </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.approved:
                return {
                    body: (
                        <h4>
                            Congratulations!{" "}
                            <span>Your booking has been approved for </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.booking:
                return {
                    body: (
                        <h4>
                            Outstanding! <span>You have booked </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.created:
                return {
                    body: (
                        <h4>
                            <span>Created</span> {content_object?.title}.
                        </h4>
                    ),
                    image: <IconBriefcase />,
                };
            case TITLE_TYPES.status_closed:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name} <span>has closed </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.staff_assigned:
                return {
                    body: (
                        <h4>
                            Congratulations!{" "}
                            <span>Your staff account has been assigned to </span>{" "}
                            {created_for?.full_name}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.staff_removed:
                return {
                    body: (
                        <h4>
                            ohh!{" "}
                            <span>Your staff account has been removed by </span>{" "}
                            {created_for?.full_name}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.shop_verified:
                return {
                    body: (
                        <h4>
                            Booyah!{" "}
                            <span>Your shop account has been verifyed to </span>{" "}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.shop_rejected:
                return {
                    body: (
                        <h4>
                            oh ohh!{" "}
                            <span>Your shop account has been rejected </span>{" "}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.status_completed:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name}{" "}
                            <span> has completed </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.rejected:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name}{" "}
                            <span>has rejected your request for </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.followed:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name} <span>has followed </span>{" "}
                            you.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.payment_completed:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name} <span>has paid for </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.cancelled:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name} <span>has cancelled </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.reward_earned:
                return {
                    body: <h4>You have earned reward.</h4>,
                    image: <IconGift className={classes.icon} />,
                };
            case TITLE_TYPES.kyc_document_submitted:
                return {
                    body: (
                        <h4>Your KYC has been submitted for verification.</h4>
                    ),
                    image: (
                        <IconFileDescription
                            className={classes.kyc_submit_icon}
                        />
                    ),
                };
            case TITLE_TYPES.kyc_document_verified:
                return {
                    body: <h4>Your KYC document has been verified.</h4>,
                    image: (
                        <IconUserCheck className={classes.kyc_verified_icon} />
                    ),
                };
            case TITLE_TYPES.kyc_document_rejected:
                return {
                    body: <h4>Your KYC document has been rejected.</h4>,
                    image: <IconUserX className={classes.kyc_rejected_icon} />,
                };
            case TITLE_TYPES.accepted:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name}{" "}
                            <span>would like to negotiate the price for</span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            case TITLE_TYPES.negotiated:
                return {
                    body: (
                        <h4>
                            {created_for?.full_name}{" "}
                            <span>has updated the price for your </span>{" "}
                            {content_object?.entity_service?.title}.
                        </h4>
                    ),
                    image: (
                        <Image
                            src={
                                created_for.profile_image
                                    ? created_for.profile_image
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            width={45}
                            height={45}
                            alt={`image`}
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{
                                objectFit: "contain",
                                borderRadius: "50%",
                            }}
                            className="img"
                        />
                    ),
                };
            default:
                return null;
        }
    };

    const queryClient = useQueryClient();

    const readSingleNotification = async (id: number) => {
        await axiosClient.post(`/notification/read/?pk=${id}`);
        queryClient.invalidateQueries(["notifications"]);
    };

    const handleRedirect = (
        type: boolean,
        taskID?: string,
        content_object_id?: string,
        content_object_type?: boolean,
        bookingId?: string
    ) => {
        switch (title) {
            case TITLE_TYPES.followed:
                router?.push(`/tasker/${content_object_id}`);
                break;
            case TITLE_TYPES.created:
                router?.push(`/tasker/${content_object_id}`);
                if (content_object_type) {
                    router.push(`/tasks/${content_object_id}`);
                } else {
                    router.push(`/services/${content_object_id}`);
                }
                break;
            case TITLE_TYPES.reward_earned:
                router?.push("/profile?active_tab=rewards");
                break;
            case TITLE_TYPES.kyc_document_submitted:
                router?.push("/profile?active_tab=kyc-details");
                break;
            case TITLE_TYPES.kyc_document_verified:
                router?.push("/profile?active_tab=kyc-details");
                break;
            case TITLE_TYPES.kyc_document_rejected:
                router?.push("/profile?active_tab=kyc-details");
                break;
            case TITLE_TYPES.approved:
                router?.push(`/bookings/${bookingId}`);
                break;
            case TITLE_TYPES.booking:
                router?.push(`/box`);
                break;
            case TITLE_TYPES.accepted:
                router?.push(`/box/${content_object_id}`);
                break;
            case TITLE_TYPES.status_closed:
                router?.push(`/bookings/${content_object_id}`);
                break;
            case TITLE_TYPES.staff_assigned:
                router?.push(`/merchant/`);
                break;
            case TITLE_TYPES.staff_removed:
                router?.push(`/merchant/`);
                break;
            case TITLE_TYPES.shop_verified:
                router?.push(`/shops/`);
                break;
            case TITLE_TYPES.shop_rejected:
                router?.push(`/shops/`);
                break;
            case TITLE_TYPES.status_completed:
                router?.push(`/bookings/${content_object_id}`);
                break;
            case TITLE_TYPES.payment_completed:
                router?.push(`/bookings/${content_object_id}`);
                break;

            default:
                if (type) {
                    router.push(`/tasks/${taskID}`);
                } else {
                    router.push(`/services/${taskID}`);
                }
                break;
        }
    };

    return (
        <Box
            className={classes.card}
            onClick={() => {
                if (!read_date) {
                    readSingleNotification(id);
                }
                handleRedirect(
                    content_object?.entity_service?.is_requested,
                    content_object?.entity_service?.id,
                    content_object?.id,
                    content_object?.is_requested,
                    content_object?.task
                );
            }}
            sx={{
                backgroundColor:
                    read_date === null
                        ? theme.colorScheme === "dark"
                            ? theme.colors[theme.primaryColor][6]
                            : theme.colors[theme.primaryColor][0]
                        : "inherit",
            }}
        >
            {renderBodyWRTTitle()?.image}
            <Box className="content">
                {renderBodyWRTTitle()?.body}
                <span className="content__date">
                    {format(new Date(created_date), "PPp")}
                </span>
            </Box>
        </Box>
    );
};
