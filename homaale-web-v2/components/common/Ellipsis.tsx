import { ActionIcon, LoadingOverlay, Menu } from "@mantine/core";
import {
    IconDotsVertical,
    IconExclamationCircle,
    IconPencil,
    IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

import urls from "@/constants/urls";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useActionIconStyles } from "@/styles/components/ActionIconStyles";
import type { BookingProps } from "@/types/booking/BookingProps";
import { axiosClient } from "@/utils/axiosClient";

import { ApplyModal } from "../booking/ApplyModal";
import { BookingModal } from "../booking/BookingModal";
import { ScheduleModal } from "../event/ScheduleModel";
import ReportModal from "../ReportModal";
import HomaaleLoader from "./HomaaleLoader";
import { toast } from "./Toast";
import {boolean, number, string} from "yup";

const Ellipsis = ({
    type,
    size,
    is_requested,
    id,
    is_user,
    reportHeading,
    reportSubHeading,
    reportedServiceUser,
    entityServiceId,
    images,
    reportedUserId,
    reportedUserImage,
    reportedUserName,
    reportedDesignation,
    style,
    disabled,
}: {
    type: "schedule" | "entity" | "booking" | "chat" | "bankWallet" | "box" | "merchant" | "product" | "shop";
    size?: number;
    is_requested?: boolean;
    id?: string;
    is_user?: boolean;
    reportHeading?: string;
    reportSubHeading?: string;
    reportedServiceUser?: string;
    entityServiceId?: string;
    images?: Array<any>;
    reportedUserId?: string;
    reportedUserImage?: string | any;
    reportedUserName?: string;
    reportedDesignation?: string;
    style?:any;
    disabled?:boolean;
}) => {
    const { classes } = useActionIconStyles();

    const [schedule, setSchedule] = useState(false);
    const [openReportModal, setOpenReportModal] = useState(false);

    const { data } = useQuery(
        ["booking-detail", id],
        () => {
            return axiosClient.get<BookingProps["result"][0]>(
                `${urls.booking.initial}${id}/`
            );
        },
        { enabled: !!id }
    );

    const {
        images: bookingImage,
        videos,
        entity_service,
        location,
        price,
        start_time,
        end_date,
        end_time,
        description,
        budget_from,
        city,
    } = data?.data ?? ({} as BookingProps["result"][0]);

    const router = useRouter();

    const queryClient = useQueryClient();

    const [editBooking, setEditBooking] = useState(false);
    const [applyModal, setApplyModal] = useState(false);

    const { mutate: scheduleDeleteMutation, isLoading: scheduleDeleteLoading } =
        useMutation<string, AxiosError, string>((id) =>
            axiosClient
                .delete<{ message: string }>(`${urls.event.schedule}${id}/`)
                .then((response) => response.data.message)
        );

    const { mutate: entityDeleteMutation, isLoading: entityDeleteLoading } =
        useMutation<string, AxiosError, string>((id) =>
            axiosClient
                .delete<{ message: string }>(`${urls.entity.list}${id}/`)
                .then((response) => response.data.message)
        );

    const {
        mutate: bankwalletDeleteMutation,
        isLoading: bankwalletDeleteLoading,
    } = useMutation<string, AxiosError, string>((id) =>
        axiosClient
            .delete<{ message: string }>(`${urls.profile.bank_account}${id}/`)
            .then((response) => response.data.message)
    );

    const { checkSuspention } = useUserStatus();

    const ellipsisRender = () => {
        switch (type) {
            case "schedule":
                return (
                    <>
                        <Menu.Dropdown>
                            <Menu.Item
                                icon={<IconPencil size={14} />}
                                onClick={() => setSchedule(true)}
                            >
                                Edit Schedule
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                onClick={() => {
                                    id &&
                                        scheduleDeleteMutation(id, {
                                            onSuccess: () => {
                                                queryClient.invalidateQueries([
                                                    "event-schedule-listing",
                                                ]);
                                                toast.success(
                                                    "Schedule Deleted"
                                                );
                                            },
                                            onError: (e: any) => {
                                                toast.error(
                                                    e.response?.data.message
                                                );
                                            },
                                        });
                                }}
                                icon={<IconTrash size={14} />}
                            >
                                Delete Schedule
                            </Menu.Item>
                        </Menu.Dropdown>
                        <ScheduleModal
                            schedule_id={id}
                            event_id={router.query.event_id as string}
                            opened={schedule}
                            setOpened={setSchedule}
                        />
                    </>
                );

            case "entity":
                return (
                    <>
                        {is_user && !disabled ? (
                            <Menu.Dropdown>
                                <Menu.Item
                                    className={`${disabled && 'cursor-not-allowed'}`}
                                    icon={<IconPencil size={14} />}
                                    onClick={() => {
                                        if (disabled) return;
                                        router.push(
                                            {
                                                pathname: `/post/entity/`,
                                                query: {
                                                    is_requested: is_requested,
                                                    id: id,
                                                },
                                            },
                                            `/post/entity/?id=${id}`
                                        )}
                                    }
                                >
                                    Edit
                                </Menu.Item>
                                <Menu.Item
                                    color="red"
                                    onClick={() => {
                                        id &&
                                            entityDeleteMutation(id, {
                                                onSuccess: () => {
                                                    if (is_requested) {
                                                        router.push(
                                                            "/tasks?active_tab=2"
                                                        );
                                                    } else {
                                                        router.push(
                                                            "/services?active_tab=2"
                                                        );
                                                    }
                                                    toast.success(
                                                        `${
                                                            is_requested
                                                                ? "Task"
                                                                : "Service"
                                                        } Deleted`
                                                    );
                                                },
                                                onError: (e: any) => {
                                                    toast.error(
                                                        e.response?.data.message
                                                    );
                                                },
                                            });
                                    }}
                                    icon={<IconTrash size={14} />}
                                >
                                    Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                        ) : (
                            <Menu.Dropdown>
                                <Menu.Item
                                    className={`${disabled && 'cursor-not-allowed'}`}
                                    color="red"
                                    icon={<IconExclamationCircle size={14} />}
                                    onClick={() => {
                                        if (disabled) return;
                                        if (checkSuspention()) {
                                            setOpenReportModal(true);
                                        } else setOpenReportModal(false);
                                    }}
                                >
                                    Report
                                </Menu.Item>
                            </Menu.Dropdown>
                        )}
                        {openReportModal && (
                            <ReportModal
                                opened={openReportModal}
                                setOpenReportModal={setOpenReportModal}
                                reportHeading={reportHeading}
                                reportSubHeading={reportSubHeading}
                                reportedServiceUser={reportedServiceUser}
                                entityServiceId={entityServiceId}
                                images={images}
                                reportedUserId={reportedUserId}
                                reportedUserImage={reportedUserImage}
                                reportedUserName={reportedUserName}
                                reportedDesignation={reportedDesignation}
                            />
                        )}
                    </>
                );

            case "box":
                return (
                    <>
                        <Menu.Dropdown>
                            <Menu.Item
                                icon={<IconPencil size={14} />}
                                onClick={() => {
                                    entity_service?.is_requested
                                        ? setApplyModal(true)
                                        : setEditBooking(true);
                                }}
                            >
                                Edit
                            </Menu.Item>
                        </Menu.Dropdown>
                        {editBooking && (
                            <BookingModal
                                opened={editBooking}
                                setOpened={setEditBooking}
                                is_editing={true}
                                bookingData={{
                                    budget_from,
                                    budget_to: price.toLocaleString(),
                                    description,
                                    images: bookingImage,
                                    city: city,
                                    videos,
                                    created_by:
                                        entity_service?.created_by ?? {},
                                    entity_service: entity_service?.id,
                                    highlights: entity_service?.highlights,
                                    currency: entity_service?.currency,
                                    title: entity_service?.title,
                                    is_negotiable:
                                        entity_service?.is_negotiable,
                                    budget_type: entity_service?.budget_type,
                                    service: entity_service?.service,
                                    location: location,
                                    event: entity_service?.event ?? "",
                                    id: id ? id.toString() : "",
                                    is_range: false,
                                    is_requested:
                                        entity_service?.is_requested ?? "",
                                    payable_from: "",
                                    payable_to: price.toLocaleString(),

                                    is_online: entity_service?.is_online,
                                }}
                                FirstModal={{
                                    end_time: end_time ?? "",
                                    start_time: start_time ?? "",
                                    end_date,
                                }}
                            />

                        )}


                        {applyModal && id && (
                            <ApplyModal
                                opened={applyModal}
                                setOpened={setApplyModal}
                                id={parseInt(id)}
                            />
                        )}


                    </>
                );
            case "chat":
                return (
                    <>
                        <Menu.Dropdown>
                            <Menu.Item
                                color="red"
                                icon={<IconExclamationCircle size={14} />}
                                onClick={() => {
                                    if (checkSuspention()) {
                                        setOpenReportModal(true);
                                    } else setOpenReportModal(false);
                                }}
                            >
                                Report
                            </Menu.Item>
                        </Menu.Dropdown>

                        {openReportModal && (
                            <ReportModal
                                opened={openReportModal}
                                setOpenReportModal={setOpenReportModal}
                                reportHeading={reportHeading}
                                reportSubHeading={reportSubHeading}
                                reportedServiceUser={reportedServiceUser}
                                entityServiceId={entityServiceId}
                                images={images}
                                reportedUserId={reportedUserId}
                                reportedUserImage={reportedUserImage}
                                reportedUserName={reportedUserName}
                                reportedDesignation={reportedDesignation}
                            />
                        )}
                    </>
                );
            case "bankWallet":
                return (
                    <>
                        <Menu.Dropdown>
                            {/* <Menu.Item
                                icon={<IconPencil size={14} />}
                                onClick={() => setEditEntityService(true)}
                            >
                                Edit
                            </Menu.Item> */}
                            <Menu.Item
                                color="red"
                                onClick={() => {
                                    id &&
                                        bankwalletDeleteMutation(id, {
                                            onSuccess: () => {
                                                queryClient.invalidateQueries([
                                                    "bank-wallet-listing",
                                                ]);
                                                toast.success(
                                                    "Account removed"
                                                );
                                            },
                                            onError: (e: any) => {
                                                toast.error(
                                                    e.response?.data.message
                                                );
                                            },
                                        });
                                }}
                                icon={<IconTrash size={14} />}
                            >
                                Remove
                            </Menu.Item>
                        </Menu.Dropdown>

                        {openReportModal && (
                            <ReportModal
                                opened={openReportModal}
                                setOpenReportModal={setOpenReportModal}
                                reportHeading={reportHeading}
                                reportSubHeading={reportSubHeading}
                                reportedServiceUser={reportedServiceUser}
                                entityServiceId={entityServiceId}
                                images={images}
                                reportedUserId={reportedUserId}
                                reportedUserImage={reportedUserImage}
                                reportedUserName={reportedUserName}
                                reportedDesignation={reportedDesignation}
                            />
                        )}
                    </>
                );

            case "merchant":
                return (
                    <>
                        <Menu.Dropdown>
                            <Menu.Item
                                color="red"
                                icon={<IconExclamationCircle size={14} />}
                                onClick={() => {
                                    if (checkSuspention()) {
                                        setOpenReportModal(true);
                                    } else setOpenReportModal(false);
                                }}
                            >
                                Report
                            </Menu.Item>
                        </Menu.Dropdown>
                        {openReportModal && (
                            <ReportModal
                                opened={openReportModal}
                                setOpenReportModal={setOpenReportModal}
                                reportHeading={reportHeading}
                                reportSubHeading={reportSubHeading}
                                reportedServiceUser={reportedServiceUser}
                                entityServiceId={entityServiceId}
                                images={images}
                                reportedUserId={reportedUserId}
                                reportedUserImage={reportedUserImage}
                                reportedUserName={reportedUserName}
                                reportedDesignation={reportedDesignation}
                            />
                        )}
                    </>
                );

            case "product":
                return (
                    <>
                        <Menu.Dropdown>
                            <Menu.Item
                                color="red"
                                icon={<IconExclamationCircle size={14} />}
                                onClick={() => {
                                    if (checkSuspention()) {
                                        setOpenReportModal(true);
                                    } else setOpenReportModal(false);
                                }}
                            >
                                Report
                            </Menu.Item>
                        </Menu.Dropdown>
                        {openReportModal && (
                            <ReportModal
                                opened={openReportModal}
                                setOpenReportModal={setOpenReportModal}
                                reportHeading={reportHeading}
                                reportSubHeading={reportSubHeading}
                                reportedServiceUser={reportedServiceUser}
                                entityServiceId={entityServiceId}
                                images={images}
                                reportedUserId={reportedUserId}
                                reportedUserImage={reportedUserImage}
                                reportedUserName={reportedUserName}
                                reportedDesignation={reportedDesignation}
                            />
                        )}
                    </>
                );

            case "shop":
                return (
                    <>
                        <Menu.Dropdown>
                            <Menu.Item
                                color="red"
                                icon={<IconExclamationCircle size={14} />}
                                onClick={() => {
                                    if (checkSuspention()) {
                                        setOpenReportModal(true);
                                    } else setOpenReportModal(false);
                                }}
                            >
                                Report
                            </Menu.Item>
                        </Menu.Dropdown>
                        {openReportModal && (
                            <ReportModal
                                opened={openReportModal}
                                setOpenReportModal={setOpenReportModal}
                                reportHeading={reportHeading}
                                reportSubHeading={reportSubHeading}
                                reportedServiceUser={reportedServiceUser}
                                entityServiceId={entityServiceId}
                                images={images}
                                reportedUserId={reportedUserId}
                                reportedUserImage={reportedUserImage}
                                reportedUserName={reportedUserName}
                                reportedDesignation={reportedDesignation}
                            />
                        )}
                    </>
                );
            default:
                break;
        }
    };

    return (
        <Menu shadow="md" width={120}>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={
                    scheduleDeleteLoading ||
                    entityDeleteLoading ||
                    bankwalletDeleteLoading
                }
                sx={{ position: "fixed", inset: 0 }}
            />
            <Menu.Target>
                <ActionIcon
                    color={"gray.6"}
                    variant="subtle"
                    className={classes.saveIcon}
                >
                    <IconDotsVertical size={size ? size : 16} />
                </ActionIcon>
            </Menu.Target>
            {ellipsisRender()}
        </Menu>
    );
};
export default Ellipsis;
