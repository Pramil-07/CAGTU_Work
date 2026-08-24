import {
    AspectRatio, Avatar,
    Box,
    Flex,
    Grid,
    RingProgress,
    Text,
    Timeline,
    Title,
    useMantineTheme,
} from "@mantine/core";
import {IconCheck, IconLocation} from "@tabler/icons-react";
import {format} from "date-fns";
import parse from "html-react-parser";
import Image from "next/image";
import Slider from "react-slick";

import EntityServiceProfileCard from "@/components/cards/EntityServiceProfileCard";
import Ellipsis from "@/components/common/Ellipsis";
import Map from "@/components/common/Map";
import {ShareButton} from "@/components/common/ShareButton";
import {TASK_STATUS} from "@/constants/TASK_STATUS";
import {useUser} from "@/hooks/useUser";
import {useEntityServiceDetailStyles} from "@/styles/pages/EntityServiceDetailStyles";
import type {BookingProps} from "@/types/booking/BookingProps";
import type {TaskBookDetailProps} from "@/types/booking/TaskBookDetailProps";
import {isImage} from "@/utils/fileTypes/isImage";
import {isVideo} from "@/utils/fileTypes/isVideo";
import {getPageUrl} from "@/utils/helpers";

import ChatBody from "../chat/ChatBody";
import {SetStateAction} from "react";
import {MarkerF, OverlayViewF} from "@react-google-maps/api";
import {PiAirplaneTiltFill} from "react-icons/pi";
import {useBrandData} from "@/brand/BrandContext";

export const BookingDetail = ({
                                  bookingDetail,
                                  boxDetail,
                              }: {
    bookingDetail?: TaskBookDetailProps;
    boxDetail?: BookingProps["result"][0];
}) => {
    console.log("🚀 ~ file: BookingDetail.tsx:40 ~ boxDetail:", boxDetail);
    const {data: userData} = useUser();
    const {classes} = useEntityServiceDetailStyles();
    const theme = useMantineTheme();
    const {brandData} = useBrandData();
    const {created_at, start_date, end_date, description, title} =
    bookingDetail ?? boxDetail?.entity_service ?? {};

    const {images, videos, created_by, location} =
    bookingDetail?.entity_service ?? boxDetail?.entity_service ?? {};

    const {
        cancellation_description,
        cancellation_reason,
        entity_service,
        status,
    } = bookingDetail ?? ({} as TaskBookDetailProps);

    const latitude = bookingDetail?.extra_data?.location?.latitude;
    const longitude = bookingDetail?.extra_data?.location?.longitude;
    const customer_location = bookingDetail?.extra_data?.location?.customer_location;

    const toDataURL = (svgString: string) => {
        const svgContent = svgString.replace(/<div[^>]*>([\s\S]*?)<\/div>/i, "$1").trim();
        const encodedSvg = encodeURIComponent(svgContent)
            .replace(/'/g, "%27")
            .replace(/"/g, "%22");
        return `data:image/svg+xml,${encodedSvg}`;
    };

    const iconSrc = boxDetail?.entity_service?.service?.category.icon ? toDataURL(boxDetail?.entity_service?.service?.category.icon) : brandData.favicon;
    // fb8d9d46-09b9-4eb8-ad77-32061e0d133b

    const {
        description: boxDescription,
        id: booking_id,
        requirements,
    } = boxDetail ?? ({} as BookingProps["result"][0]);

    const taskVideosAndImages = [...(images ?? []), ...(videos ?? [])];

    let color, progress, active;

    switch (status) {
        case TASK_STATUS.Initiated:
            color = "gray";
            progress = 0;
            active = 0;
            break;
        case TASK_STATUS.Open:
            color = "blue";
            progress = 30;
            active = 1;
            break;
        case TASK_STATUS.On_Progress:
            color = "orange";
            progress = 60;
            active = 2;
            break;
        case TASK_STATUS.Completed:
            color = "green";
            progress = 90;
            active = 3;
            break;

        case TASK_STATUS.Closed:
            color = "teal";
            progress = 100;
            active = 4;
            break;
        case TASK_STATUS.Cancelled:
            color = "red";
            progress = 0;
            active = -1;
            break;

        default:
            color = "gray";
            progress = 0;
            active = 0;
            break;
    }
    // const hasMultipleMediaTypes = taskMedias.length > 1;

    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        adaptiveHeight: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <>
            <Grid
                sx={{
                    gap: 30,
                    marginTop: 16,
                }}
                className={classes.wrapper}
            >
                <Grid.Col lg={7}>
                    <Flex>
                        <div>
                            <Title
                                size={16}
                                color={`${
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[0]
                                        : theme.colors.homaaleSlate[8]
                                }`}
                                sx={{fontWeight: 500}}
                            >
                                {title}
                            </Title>
                            <Text
                                color={`${
                                    theme.colorScheme === "dark"
                                        ? theme.colors.dark[1]
                                        : theme.colors.gray[7]
                                }`}
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    marginTop: "4px",
                                }}
                            >
                                Posted on{" "}
                                {created_at &&
                                    format(new Date(created_at), "PP - p")}
                            </Text>
                        </div>
                        <div className={classes.topActionArea}>
                            {/* <SaveIcon object_id="123" showText /> */}
                            <ShareButton url={getPageUrl()} showText/>
                            {boxDetail && boxDetail?.status === "pending" && (
                                <Ellipsis
                                    type={"box"}
                                    size={16}
                                    id={booking_id.toString()}
                                />
                            )}
                        </div>
                    </Flex>

                    <Grid
                        sx={{
                            marginTop: "24px",
                        }}
                    >
                        <Grid.Col lg={7}>
                            <div className={classes.slider}>
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
                                                    Your browser does not
                                                    support video format.
                                                </video>
                                            ) : null}
                                        </AspectRatio>
                                    ))}
                                </Slider>
                            </div>
                            {(taskVideosAndImages ?? []).length <= 0 && (
                                <AspectRatio
                                    ratio={16 / 9}
                                    sx={{
                                        maxWidth: 570,
                                        minHeight: 327,
                                    }}
                                    mx="auto"
                                >
                                    <Image
                                        src={
                                            "/images/placeholder/taskPlaceholder.png"
                                        }
                                        height={327}
                                        width={570}
                                        style={{objectFit: "contain"}}
                                        alt="servicecard-image"
                                    />
                                </AspectRatio>
                            )}

                            <Flex justify="flex-start" mt={10}>
                                {location && (
                                    <Box className={classes.stats}>
                                        <IconLocation
                                            size={14}
                                            color={`${theme.colors.secondary[2]}`}
                                            className="icon"
                                        />
                                        <Text span m="0 16px 0 8px" size={12}>
                                            {location}
                                        </Text>
                                    </Box>
                                )}
                            </Flex>
                        </Grid.Col>
                        <Grid.Col lg={5}>
                            <EntityServiceProfileCard
                                bookingDetail={bookingDetail}
                                boxDetail={boxDetail} isModelOpen={false}
                                setIsModelOpen={function (value: SetStateAction<boolean>): void {
                                    throw new Error("Function not implemented.");
                                }}/>
                        </Grid.Col>
                    </Grid>

                    {cancellation_reason && (
                        <Box className={classes.cancel}>
                            <h4>Reason for Cancellation</h4>
                            <Flex
                                align={"flex-start"}
                                justify={"flex-start"}
                                gap={37}
                                mb={10}
                            >
                                <span>Reason:</span>
                                <p>{cancellation_reason}</p>
                            </Flex>
                            <Flex
                                align={"flex-start"}
                                justify={"flex-start"}
                                gap={10}
                            >
                                <span> Description:</span>
                                <p>{cancellation_description}</p>
                            </Flex>
                        </Box>
                    )}

                    <Box
                        component="div"
                        mb="20px"
                        mt="22px"
                        className={classes.dateTime}
                    >
                        {end_date && <h4>Date & Time</h4>}

                        {start_date && (
                            <p>
                                Start Date:{" "}
                                <span>
                                    {format(new Date(start_date), "PP")}
                                </span>
                            </p>
                        )}
                        {end_date && (
                            <p>
                                End Date:{" "}
                                <span>{format(new Date(end_date), "PP")}</span>
                            </p>
                        )}
                    </Box>

                    <Box
                        component="div"
                        mb="20px"
                        className={classes.description}
                    >
                        <h4>Problem Description</h4>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: boxDetail ? boxDescription ?? '' : description ?? '',
                            }}
                        />
                    </Box>

                    <Box
                        component="div"
                        mb="20px"
                        className={classes.requirements}
                    >
                        {boxDetail && requirements?.length > 0 ? (
                            <>
                                <h4>Requirements for the Task</h4>
                                {requirements?.map((requirements, index) => (
                                    <Flex
                                        justify="flex-start"
                                        className="requirement-list"
                                        key={index}
                                    >
                                        <IconCheck
                                            size={18}
                                            color={`${theme.colors.blue[5]}`}
                                            style={{
                                                marginRight: "8px",
                                            }}
                                        />
                                        <p>{requirements}</p>
                                    </Flex>
                                ))}
                            </>
                        ) : (
                            ""
                        )}
                        {bookingDetail &&
                        entity_service?.highlights?.length > 0 ? (
                            <>
                                <h4>Requirements for the Task</h4>
                                {entity_service?.highlights?.map(
                                    (requirements, index) => (
                                        <Flex
                                            justify="flex-start"
                                            className="requirement-list"
                                            key={index}
                                        >
                                            <IconCheck
                                                size={18}
                                                color={`${theme.colors.blue[5]}`}
                                                style={{
                                                    marginRight: "8px",
                                                }}
                                            />
                                            <p>{requirements}</p>
                                        </Flex>
                                    )
                                )}
                            </>
                        ) : (
                            ""
                        )}
                    </Box>
                    {boxDetail && userData && created_by && (
                        <>
                            <h4>Chat</h4>
                            <ChatBody
                                is_fragmented
                                senderId={created_by?.id}
                                userId={userData?.id}
                                profile={userData}
                            />
                        </>
                    )}
                </Grid.Col>

                <Grid.Col lg={4}>
                    <Box
                        sx={{
                            height: "528px",
                        }}
                    >
                        <h4>Map</h4>
                        {customer_location && (
                            <Text
                                className="bg-blue-400 text-white text-xs font-thin  p-1 w-full flex gap-2 flex-wrap ">
                                 <span className='font-bold flex gap-1 align-center justify-center'>
                                  LOCATION <PiAirplaneTiltFill/>
                                   </span>
                                {customer_location}
                            </Text>
                        )}
                        <Map
                            style={{width: "200px", height: "200px"}}
                            location={{
                                id: "1",
                                lat: latitude ?? 27.7103,
                                lng: longitude ?? 85.3222,
                            }}
                        >
                            <OverlayViewF
                                position={{
                                    lat: latitude ?? 27.7103,
                                    lng: longitude ?? 85.3222,
                                }}
                                mapPaneName="overlayMouseTarget"
                                getPixelPositionOffset={(width, height) => ({
                                    x: -(width / 2),
                                    y: -height / 2,
                                })}
                                key={1}
                            >
                                <Avatar
                                    src={iconSrc}
                                    radius="xl"
                                    size={30}
                                    p={5}
                                    sx={{ cursor: "pointer", background: theme.colors.brand[4]}}
                                />
                            </OverlayViewF>
                        </Map>
                    </Box>
                    {status && (
                        <Box className={classes.progress}>
                            <h4>Task Progress</h4>
                            <Flex>
                                <Timeline
                                    active={active}
                                    bulletSize={26}
                                    lineWidth={0}
                                    sx={{
                                        ".mantine-Timeline-item": {
                                            marginTop: 15,
                                        },
                                    }}
                                >
                                    <Timeline.Item
                                        bullet={<IconCheck size={16}/>}
                                    >
                                        <Text color="dimmed" size="sm">
                                            Task Approved
                                        </Text>
                                    </Timeline.Item>
                                    <Timeline.Item
                                        bullet={<IconCheck size={16}/>}
                                    >
                                        <Text color="dimmed" size="sm">
                                            Payment Completed
                                        </Text>
                                    </Timeline.Item>
                                    <Timeline.Item
                                        bullet={<IconCheck size={16}/>}
                                    >
                                        <Text color="dimmed" size="sm">
                                            Task in progress
                                        </Text>
                                    </Timeline.Item>
                                    <Timeline.Item
                                        bullet={<IconCheck size={16}/>}
                                    >
                                        <Text color="dimmed" size="sm">
                                            Task completed
                                        </Text>
                                    </Timeline.Item>
                                    <Timeline.Item
                                        bullet={<IconCheck size={16}/>}
                                    >
                                        <Text color="dimmed" size="sm">
                                            Task closed
                                        </Text>
                                    </Timeline.Item>
                                </Timeline>

                                <RingProgress
                                    sections={[
                                        {value: progress, color: color},
                                    ]}
                                    size={160}
                                    thickness={12}
                                    roundCaps
                                    label={
                                        <Text
                                            color={color}
                                            weight={600}
                                            align="center"
                                            size="xl"
                                        >
                                            {progress}%
                                        </Text>
                                    }
                                />
                            </Flex>
                        </Box>
                    )}
                </Grid.Col>
            </Grid>
        </>
    );
};
