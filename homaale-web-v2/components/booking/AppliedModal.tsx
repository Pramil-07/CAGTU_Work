import type { MantineNumberSize } from "@mantine/core";
import { Button, AspectRatio, Box, Flex, Grid, Modal, Title } from "@mantine/core";
import {
    IconBriefcase,
    IconCertificate2,
    IconCheck,
    IconHome,
    IconMoodSmile,
    IconStar,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import Slider from "react-slick"; // Ensure correct import
import { Settings } from "react-slick"; // Import Settings type
import "slick-carousel/slick/slick.css"; // Required CSS
import "slick-carousel/slick/slick-theme.css"; // Optional theme CSS

import urls from "@/constants/urls";
import { useAppliedModalStyles } from "@/styles/components/AppliedModalStyles";
import type { BookingProps } from "@/types/booking/BookingProps";
import { axiosClient } from "@/utils/axiosClient";
import { isImage } from "@/utils/fileTypes/isImage";
import { isVideo } from "@/utils/fileTypes/isVideo";
import { convertTo12HourFormat } from "@/utils/formatTime";
import { RenderStatusButtons } from "@/utils/RenderStatusButtons";
import { toast } from "../common/Toast";

// Define settings with explicit Settings type
const settings: Settings = {
    dots: true,
    infinite: false,
    speed: 500,
    arrows: false,
    adaptiveHeight: true,
    slidesToShow: 1,
    slidesToScroll: 1,
};

export const AppliedModal = ({
                                 opened,
                                 setOpened,
                                 id,
                             }: {
    id: number;
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
}) => {
    const { classes } = useAppliedModalStyles();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(["booking-detail", id], () =>
        axiosClient.get<BookingProps["result"][0]>(`${urls.booking.initial}${id}/`)
    );

    const {
        images,
        videos,
        created_by,
        entity_service,
        price,
        earning,
        start_time,
        end_date,
        end_time,
        location,
        description,
        requirements,
        is_accepted,
        status,
    } = data?.data ?? ({} as BookingProps["result"][0]);

    const taskVideosAndImages = [...(images ?? []), ...(videos ?? [])];

    const sendBookReject = useMutation<any, Error, number>((id) =>
        axiosClient.post(urls.booking.decline, { booking: id })
    );

    const handleRejectClick = () => {
        sendBookReject.mutate(id, {
            onSuccess: () => {
                queryClient.invalidateQueries(["get-applicants", id]);
                queryClient.invalidateQueries(["booking-detail", id]);
                toast.success("Booking rejected");
            },
            onError: (e: any) => {
                toast.error(e.response.data.message);
            },
        });
    };

    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            size="xl"
            scrollAreaComponent={Modal.NativeScrollArea}
        >
            <Modal.Overlay />
            <Modal.Content
                p={
                    {
                        base: "5px",
                        sm: "10px",
                        lg: "20px",
                    }
                }
                sx={{
                    "& h3": {
                        marginBottom: 0,
                    },
                }}
            >
                <Modal.Header mb={32}>
                    <Title order={2} size={20} weight={500}>
                        {entity_service?.is_requested ? "Applied Detail" : "Booking Details"}
                    </Title>
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <Box className={classes.root}>
                            <Box className="tasker">
                                <Flex justify={"flex-start"} gap={16}>
                                    <Image
                                        src={
                                            created_by?.profile_image ??
                                            "/images/placeholder/taskPlaceholder.png"
                                        }
                                        height={92}
                                        width={92}
                                        style={{
                                            objectFit: "contain",
                                            borderRadius: "50%",
                                        }}
                                        alt="servicecard-image"
                                    />
                                    <Box>
                                        <h3>{created_by?.user?.full_name}</h3>
                                        <Flex className="tasker__status">
                                            <p>
                                                <IconCertificate2 size={14} />{" "}
                                                {+created_by?.stats?.success_rate.toFixed(1)}%
                                            </p>
                                            <p>
                                                <IconMoodSmile size={14} />{" "}
                                                {+created_by?.stats?.success_rate.toFixed(1)}
                                            </p>
                                            <p>
                                                <IconStar size={14} />{" "}
                                                {created_by?.rating?.avg_rating
                                                    ? +created_by?.rating?.avg_rating.toFixed(1)
                                                    : 0}
                                            </p>
                                        </Flex>
                                    </Box>
                                </Flex>
                                <Box className="tasker__info">
                                    <p>
                                        <IconHome size={16} /> {created_by?.address_line1}
                                    </p>
                                    {created_by?.active_hour_start && (
                                        <p>
                                            <IconBriefcase size={16} /> Available Hours{" "}
                                            {convertTo12HourFormat(created_by?.active_hour_start)} to{" "}
                                            {convertTo12HourFormat(created_by?.active_hour_end)}
                                        </p>
                                    )}
                                </Box>
                            </Box>

                            <Box className="content">
                                <Grid>
                                    {!entity_service?.is_requested && (
                                        <Grid.Col md={6}>
                                            <div>
                                                <Slider {...settings}>
                                                    {taskVideosAndImages?.map((item, index) => (
                                                        <AspectRatio
                                                            ratio={16 / 9}
                                                            sx={{
                                                                maxWidth: 570,
                                                                minHeight: 327,
                                                            }}
                                                            mx="auto"
                                                            key={index}
                                                        >
                                                            {isImage(item?.media_type) ? (
                                                                <Image
                                                                    src={item?.media}
                                                                    fill
                                                                    alt={`image-${item?.name}`}
                                                                    placeholder="blur"
                                                                    blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                                                    style={{
                                                                        objectFit: "contain",
                                                                    }}
                                                                    className="img"
                                                                />
                                                            ) : isVideo(item?.media_type) ? (
                                                                <video
                                                                    className="thumbnail-img"
                                                                    width="100%"
                                                                    height="100%"
                                                                    controls
                                                                >
                                                                    <source
                                                                        id={`task-video-${item.id}`}
                                                                        src={item?.media}
                                                                    />
                                                                    Your browser does not support video format.
                                                                </video>
                                                            ) : null}
                                                        </AspectRatio>
                                                    ))}
                                                </Slider>
                                            </div>
                                            {(taskVideosAndImages ?? []).length <= 0 && (
                                                <Image
                                                    src="/images/placeholder/taskPlaceholder.png"
                                                    height={203}
                                                    width={400}
                                                    style={{
                                                        objectFit: "contain",
                                                    }}
                                                    alt="servicecard-image"
                                                />
                                            )}
                                        </Grid.Col>
                                    )}

                                    <Grid.Col md={6}>
                                        <ul>
                                            <li>
                                                Category: <span>{entity_service?.service?.title}</span>
                                            </li>
                                            <li>
                                                Title: <span>{entity_service?.title}</span>
                                            </li>
                                            <li>
                                                Pricing :{" "}
                                                <span>
                          {entity_service?.currency?.symbol}{" "}
                                                    {entity_service?.is_requested
                                                        ? +parseFloat(price).toFixed(2)
                                                        : +parseFloat(earning).toFixed(2)}
                        </span>
                                            </li>
                                            {end_date && (
                                                <li>
                                                    Date : <span>{format(new Date(end_date), "PP")}</span>
                                                </li>
                                            )}
                                            {end_time && (
                                                <li>
                                                    Time :{" "}
                                                    <span>
                            {start_time && convertTo12HourFormat(start_time)} to{" "}
                                                        {end_time && convertTo12HourFormat(end_time)}
                          </span>
                                                </li>
                                            )}
                                            {location && (
                                                <li>
                                                    Address : <span>{location}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </Grid.Col>
                                </Grid>
                                <div
                                    className={classes.description}
                                    style={{ alignItems: "flex-start", flexDirection: "column" }}
                                >
                                    {entity_service?.is_requested
                                        ? "Reasons to apply: "
                                        : "Description:"}
                                    <p dangerouslySetInnerHTML={{ __html: description }} />
                                </div>
                                {!entity_service?.is_requested && requirements && (
                                    <Box className="content__requirement">
                                        Requirement for the services
                                        {requirements?.map((item, index) => (
                                            <li key={index} className="flex">
                                                <IconCheck size={16} color="#3EAEFF" />{" "}
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                            <Flex justify={"space-between"} mt={20}>
                                {status === "pending" && (
                                    <Button
                                        variant={"outline"}
                                        onClick={() => handleRejectClick()}
                                        color={"red"}
                                    >
                                        Reject
                                    </Button>
                                )}
                                <RenderStatusButtons
                                    enitity_id={entity_service?.id}
                                    is_negotiable={entity_service?.is_negotiable}
                                    status={status}
                                    id={id}
                                    serviceCreator={entity_service?.created_by?.id}
                                    bookingCreator={created_by?.user?.id}
                                    is_accepted={is_accepted}
                                    is_range={entity_service?.is_range}
                                />
                            </Flex>
                        </Box>
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
