import {
    ActionIcon,
    AspectRatio,
    Avatar,
    Box,
    Button,
    Flex,
    Grid,
    Progress,
    Rating,
    Text,
    Title,
    useMantineTheme,
    Badge,
    Tooltip,
    Container,
    Skeleton,
} from "@mantine/core";
import {useScrollIntoView} from "@mantine/hooks";
import {OverlayViewF} from "@react-google-maps/api";
import {
    IconCalendar,
    IconCalendarPlus,
    IconCheck,
    IconClock,
    IconMessage,
    IconUsers,
} from "@tabler/icons-react";
import {useQuery} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {format} from "date-fns";
import parse from "html-react-parser";
import Image from "next/image";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import Slider from "react-slick";
import {FaLocationDot} from "react-icons/fa6";

import EntityServiceProfileCard from "@/components/cards/EntityServiceProfileCard";
import Ellipsis from "@/components/common/Ellipsis";
import Map from "@/components/common/Map";
import SaveIcon from "@/components/common/SaveIcon";
import {ShareButton} from "@/components/common/ShareButton";
import urls from "@/constants/urls";
import {useUser} from "@/hooks/useUser";
import {useEntityServiceDetailStyles} from "@/styles/pages/EntityServiceDetailStyles";
import type {ApplicantsProps} from "@/types/booking/ApplicantsProps";
import type {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
import type {RecommendedProps} from "@/types/RecommendedProps";
import {axiosClient} from "@/utils/axiosClient";
import {isImage} from "@/utils/fileTypes/isImage";
import {isVideo} from "@/utils/fileTypes/isVideo";
import {convertTo12HourFormat} from "@/utils/formatTime";
import {getPageUrl, isLoggedIn, useDark} from "@/utils/helpers";

import {ServiceCard} from "./cards/ServiceCard";
import {ApplicantsCard} from "./common/ApplicantsCard";
import CalendarForIds from "@/components/common/form/CalendarForIds";
import NoDataAlert from "./common/NoDataAlert";
import {EventAddModal} from "./event/EventAddModal";
import {ScheduleModal} from "./event/ScheduleModel";
import RatingSection from "./rating/RatingSection";
import {IoLocationOutline} from "react-icons/io5";
import {FaArrowRight, FaRegEye} from "react-icons/fa6";
import {TiLocationArrowOutline} from "react-icons/ti";
import {BiSolidHappyBeaming} from "react-icons/bi";
import {FaAward} from "react-icons/fa";
import SimilarProducts from "@/components/ProductCard/SimilarProductCard";
import AvailableSlots from "./merchant/ProfilePage/AvailableSlots";
import {useProfile} from "@/hooks/useProfile";
import {Profile} from "@/components/merchant/ProfilePage/ProfilePage";
import {useMediaQuery} from "@mantine/hooks";
import {GiCommercialAirplane} from "react-icons/gi";
import {PiAirplaneTiltFill} from "react-icons/pi";
import EntitySimilarProducts from "@/components/ProductCard/EntitySimilarProduct";
import {TrustCard} from "./common/TrustCard";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {useBrandData} from "@/brand/BrandContext";

export interface Product {
    id: number;
    name: string;
    rating: number;
    price: number;
    image_details:{
        id:number,
        image:string,
    }[]
    images: string[];
    product_status: boolean;
    discount_per: number;
    local_currency_details: {
        symbol: string;
        code: string;
    };
    shop: {
        name: string;
        location: string | any;
    };
    user: {
        id: number | string;
        username: string;
    };
}


export const EntityServiceDetail = ({
                                        entityDetail,
                                        recommendedTaskData,
                                        onViewModeChange,
                                    }: {
    entityDetail: EntityServiceDetailProps;
    recommendedTaskData: RecommendedProps;
    onViewModeChange?: (isUserView: boolean, isUser: boolean) => void;
}) => {
    const {classes} = useEntityServiceDetailStyles();
    const theme = useMantineTheme();
    const router = useRouter();
    const entity_user = entityDetail?.owner.id ?? null;
// const service_id = entityDetail.service.id??null;

    const [eventModel, setEventModel] = useState(false);
    const [scheduleModel, setScheduleModel] = useState(false);
    const [selectedStartTime, setSelectedStartTime] = useState<string>("");
    const [selectedEndTime, setSelectedEndTime] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [bookingModel, setBookingModel] = useState<boolean>(false);
    const [isPremium, setIsPremium] = useState(false)
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState<string | null>(null)
    const [distance, setDistance] = useState<number | null>(null)
    const [isUserView, setIsUserView] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isMid = useMediaQuery('(max-width: 1200px)');
    const isMobile1 = useMediaQuery('(max-width: 1200px)');
    const isMediumRange = isMobile1 && !isMobile;
    const handleTimeSlotSelect = (start_time: string, end_time: string, end_date: string | null) => {
        setSelectedStartTime(start_time);
        setSelectedEndTime(end_time);
        setSelectedDate(end_date);
        // setBookingModel(true); // Ensure this sets the modal to open
        // console.log("Selected Start Time:", start_time);
        // console.log("Selected End Time:", end_time);
        // console.log("Selected Date:", end_date);
        // console.log("service detail", entityDetail)
    };
    const dark = useDark()
    const {brandData} = useBrandData();
    const {
        images,
        videos,
        title,
        created_at,
        created_by,
        location,
        event,
        booking_count,
        booked_count,
        avatar,
        start_date,
        end_date,
        start_time,
        end_time,
        count,
        description,
        highlights,
        is_requested,
        happy_clients,
        success_rate,
        id,
        is_bookmarked,
        rating_stats,
        is_booked,
        service,
        city,
        is_range,
        views_count,
        is_online,
        extra_data,
    } = entityDetail ?? ({} as EntityServiceDetailProps);
    // console.log('entity', entityDetail)
    console.log("extra data", extra_data)

    const toDataURL = (svgString: string) => {
        // Remove the surrounding <div> if present
        const svgContent = svgString.replace(/<div[^>]*>([\s\S]*?)<\/div>/i, "$1").trim();
        // Encode the SVG string to handle special characters
        const encodedSvg = encodeURIComponent(svgContent)
            .replace(/'/g, "%27")
            .replace(/"/g, "%22");
        return `data:image/svg+xml,${encodedSvg}`;
    };

    // Use the cleaned SVG or fallback to default image
    const iconSrc = service?.category.icon ? toDataURL(service.category.icon) : brandData.favicon;
    // console.log("iconSrc", iconSrc);

    const taskVideosAndImages = [
        ...(images?.length
            ? images
            // : service?.images?.length
            //     ? service.images
                : []),
        ...(videos ?? []),
    ];

    // const hasMultipleMediaTypes = taskMedias.length > 1;
    // console.log("location from service details", location)
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        arrows: false,
        adaptiveHeight: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // const eventAvailable = event?.active_dates?.map((item) => ({
    //     date: item,
    // }));
    // console.log("id by me", entityDetail?.id)
    const {data: userData} = useUser();
    // console.log("entity city ", city)
    // console.log(`entity service event happy client${happy_clients} : success Rate ${success_rate}`, entityDetail,)
    // console.log("even rating stats", rating_stats?.average_rating)
    //Checks IF the user owns the entity service or not
    const userLocation = userData?.created_at

    async function distanceCalculate(serviceLat: number, serviceLon: number) {
        // Input validation
        if (typeof serviceLat !== 'number' || typeof serviceLon !== 'number' ||
            isNaN(serviceLat) || isNaN(serviceLon)) {
            throw new Error('Service coordinates must be valid numbers.');
        }

        // Get current location coordinates
        let currentCoords: any;
        try {
            currentCoords = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        reject(new Error(`Geolocation error: ${error.message}`));
                    }
                );
            });
        } catch (error) {
            throw new Error(`Failed to get current location: ${error}`);
        }

        // Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const radLat1 = (currentCoords.latitude * Math.PI) / 180;
        const radLat2 = (serviceLat * Math.PI) / 180;
        const deltaLat = ((serviceLat - currentCoords.latitude) * Math.PI) / 180;
        const deltaLon = ((serviceLon - currentCoords.longitude) * Math.PI) / 180;

        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Number(distance.toFixed(2));
    }


    // Modified useEffect
    useEffect(() => {
        async function fetchDistance() {
            if (is_online) {
                setDistance(null); // No distance for online services
                setError(null);
                return;
            }

            try {
                // Assuming city object now has latitude and longitude properties
                if (!city?.latitude || !city?.longitude) {
                    throw new Error('City coordinates not available');
                }
                const calculatedDistance = await distanceCalculate(extra_data[0]?.latitude, extra_data[0]?.longitude);
                console.log("first",extra_data[0]?.latitude ,extra_data[0]?.longitude)
                setDistance(calculatedDistance);
                // console.log("location", calculatedDistance);
                setError(null);
            } catch (error) {
                console.error(`Error calculating distance:`, error);
                setError('Unable to calculate distance. Please check location permissions.');
            }
        }

        fetchDistance();
    }, [service,location]);
    // console.log("coordinates", city?.latitude, city?.longitude);


    const is_user: boolean = userData?.id === created_by?.id;
    useEffect(() => {
        const fetchApiData = async () => {
            setLoading(true);
            try {
                // Fetch premium merchant data
                const response = await axiosClient.get(`/merchant/${userData?.id}`);
                if (response.data) {
                    // setData(response.data);
                    setIsPremium(response.data?.merchant_data?.is_premium || false);
                }
            } catch (error: any) {
                console.error("Error fetching data:", error);

            } finally {
                setLoading(false);
            }
        };

        fetchApiData()
    }, [userData?.id])

    useEffect(() => {
        onViewModeChange?.(isUserView, is_user);
    }, [isUserView, is_user, onViewModeChange]);

    const {data: applicantsData} = useQuery<ApplicantsProps>(
        ["get-applicants", id],
        async () => {
            try {
                const {data} = await axiosClient.get<ApplicantsProps>(
                    `${urls.booking.applicants}${id}/`
                );
                return data;
            } catch (error) {
                if (error instanceof AxiosError) {
                    const errors = Object.values(error.response?.data).join(
                        "\n"
                    );
                    throw new Error(errors);
                }
                throw new Error("Something went wrong");
            }
        },
        {
            enabled: !!id && count > 0 && is_user,
        }
    );


    const {scrollIntoView, targetRef} = useScrollIntoView<HTMLDivElement>({
        offset: 60,
    });

    const rating_progress = (num: number) => {
        return (num / rating_stats?.total_counts) * 100;
    };


    interface MediaItem {
        media_type: string;
        media: string;
        name: string;
        id: string | number;
    }

    const SliderContent: React.FC<{ item: MediaItem }> = ({item}) => {
        if (isImage(item?.media_type)) {
            return (
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
            );
        }

        if (isVideo(item?.media_type)) {
            return (
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
            );
        }

        return null;
    };

    const [showFullText, setShowFullText] = useState(false);

    // Split the description into words
    const words = description?.split(' ') || [];
    const wordLimit = 30;

    // Truncated and full description
    const truncatedDescription = words.slice(0, wordLimit).join(' ');
    // const remainingDescription = words.slice(wordLimit).join(' ');

    const handleToggle = () => {
        setShowFullText((prev) => !prev);
    };


    const {latitude, longitude} = extra_data?.[0] || {};
    // console.log("extra data ", latitude, latitude)
    // Create a wrapper component for the Slider
    const CustomSlider: React.FC<{
        settings: any;
        items: MediaItem[];
    }> = ({settings, items}) => {
        return (
            <Slider {...settings}>
                {items?.map((item, index) => (
                    <div key={index}>
                        <AspectRatio
                            ratio={16 / 9}
                            sx={{
                                maxWidth: 570,
                                minHeight: 327,
                            }}
                            mx="auto"
                        >
                            <SliderContent item={item}/>
                        </AspectRatio>
                    </div>
                ))}
            </Slider>
        );
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
                    <Flex
                        direction={{ base: is_user ? 'column' : 'row', md: is_user ? 'row' : 'row' }}
                        align={{ base: is_user ? 'flex-start' : 'center', md: is_user ? 'center' : 'center'}}
                        justify={{ base: is_user ? 'flex-start' : 'space-between', md: is_user ? 'space-between' : 'space-between'}}
                        sx={{width: '100%'}}
                    >
                        <div>
                            <Title
                                size={16}
                                color={
                                    theme.colorScheme === 'dark'
                                        ? theme.colors.dark[0]
                                        : theme.colors.homaaleSlate[8]
                                }
                                sx={{fontWeight: 500}}
                            >
                                {title}
                            </Title>
                            <Text
                                color={
                                    theme.colorScheme === 'dark'
                                        ? theme.colors.dark[0]
                                        : theme.colors.gray[7]
                                }
                                sx={{
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    marginTop: '4px',
                                }}
                            >
                                Posted on{' '}
                                {created_at && format(new Date(created_at), 'PP - p')}
                            </Text>
                        </div>

                        <Flex
                            justify={{base: 'center', md: 'flex-end'}}
                            mt={{base: '8px', md: 0}}
                            sx={{width: "auto"}}
                        >
                            <div className={classes.topActionArea}>
                                {is_user && isLoggedIn() && !loading && (
                                    <Tooltip
                                        label={isUserView ? 'Viewing page as User' : 'Viewing page as Owner'}
                                        withArrow
                                        position='top'
                                    >
                                        <span style={{marginLeft: 'auto'}}>
                                            <Button
                                                disabled={loading}
                                                variant={isUserView ? 'outline' : 'filled'}
                                                size='xs'
                                                onClick={() => setIsUserView((prev) => !prev)}
                                            >
                                                {!isUserView ? 'Switch to user View' : 'Switch to owner View'}
                                            </Button>
                                        </span>
                                    </Tooltip>
                                )}
                                {isLoggedIn() && (
                                    <SaveIcon
                                        object_id={id}
                                        model='entityservice'
                                        filled={is_bookmarked}
                                        showText
                                        disabled={is_user && isUserView}
                                    />
                                )}
                                <ShareButton url={getPageUrl()} showText/>
                                {is_booked && (
                                    <ActionIcon
                                        sx={{
                                            display: 'none',
                                            [theme.fn.smallerThan('md')]: {
                                                display: 'block',
                                            },
                                        }}
                                        color='orange.3'
                                    >
                                        <IconMessage/>
                                    </ActionIcon>
                                )}
                                <Ellipsis
                                    size={16}
                                    type='entity'
                                    id={id}
                                    is_requested={is_requested}
                                    is_user={is_user}
                                    reportHeading={title}
                                    entityServiceId={id}
                                    images={images}
                                    reportSubHeading={created_by?.full_name}
                                    disabled={is_user && isUserView}
                                />
                            </div>
                        </Flex>
                    </Flex>

                    <Grid
                        sx={{
                            marginTop: "24px",
                        }}
                    >
                        <Grid.Col lg={7}>
                            <div className={classes.slider}>
                                <CustomSlider
                                    settings={settings}
                                    items={taskVideosAndImages}
                                />
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
                                        fill
                                        style={{objectFit: "contain"}}
                                        alt="servicecard-image"
                                    />
                                </AspectRatio>
                            )}
                            {isMid && (
                                <Flex
                                    justify="flex-start"
                                    align="center"
                                    wrap="wrap"
                                    gap="md"
                                    mt={10}
                                    sx={(theme) => ({
                                        width: "100%",
                                        [theme.fn.smallerThan("sm")]: {
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            gap: theme.spacing.xs,
                                        },
                                    })}
                                >


                                    <Box className={classes.stats}>
                                        <FaLocationDot
                                            size={15}
                                            color="green"
                                            className="icon"
                                        />
                                        <Text span m="0 16px 0 8px ">
                                            {location?.trim().replace(/\s*,\s*/g, ",").split(",").slice(0, 3).join(", ") || city?.name || "Unknown Location" }
                                        </Text>
                                        <TiLocationArrowOutline
                                            size={19}
                                            // color={`${theme.colors.secondary[2]}`}
                                            className="icon"
                                            color="red"
                                            style={{transform: "translateY(-2px)"}}
                                        />
                                        <Text span m="0 16px 0 5px" size={12}>
                                            {is_online ? "remote" : distance && distance > 1 ? `${distance || 0} Km away` : `${distance && distance * 1000 || 0} m away`}
                                            {}
                                        </Text>
                                        <FaRegEye
                                            size={18}
                                            // color={`${theme.colors.secondary[2]}`}
                                            className="icon"
                                            color="#332D56"
                                        />
                                        <Text span m="0 16px 0 8px" size={12}>
                                            {views_count}
                                        </Text>
                                        {/*</Box>*/}

                                        {/*<Box className={classes.stats}>*/}
                                        <BiSolidHappyBeaming
                                            size={16}
                                            className="icon"
                                            color="#F98900"
                                        />
                                        <Text span m="0 16px 0 8px" size={12}>
                                            {avatar || `${happy_clients ? happy_clients : 0} Happy Clients`}
                                        </Text>

                                        <FaAward
                                            size={16}
                                            className="icon"
                                            color="#0693E3"
                                        />
                                        <Text span m="0 16px 0 8px" size={12}>
                                            {avatar || `${success_rate ? success_rate : 0}% Success Rate`}
                                        </Text>


                                    </Box>


                                </Flex>
                            )}
                        </Grid.Col>
                        <Grid.Col lg={5}>
                            <EntityServiceProfileCard
                                scrollIntoView={scrollIntoView}
                                entityDetail={entityDetail}
                                is_user={is_user}
                                FirstModal={{
                                    start_time: selectedStartTime,
                                    end_time: selectedEndTime,
                                    end_date: selectedDate
                                }}
                                isModelOpen={bookingModel}
                                setIsModelOpen={setBookingModel}
                                disabled={is_user && isUserView}
                                bookingCount={booking_count}
                            />
                        </Grid.Col>
                    </Grid>
                    {!isMid && (
                        <Flex
                            justify="flex-start"
                            align="center"
                            wrap="wrap"
                            gap="md"
                            mt={5}
                            mb={10}
                            sx={(theme) => ({
                                width: "100%",
                                [theme.fn.smallerThan("sm")]: {
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: theme.spacing.xs,
                                },
                            })}
                        >
                            {loading || !city || typeof views_count === "undefined" || typeof distance === "undefined" ? (
                                <Box className={classes.stats}>
                                    <Skeleton height={16} width={120} mb="xs" />
                                    <Skeleton height={16} width={180} mb="xs" />
                                    <Skeleton height={16} width={140} />
                                </Box>
                            ) : (
                                <Box className={classes.stats}>
                                    <FaLocationDot
                                        size={15}
                                        color="green"
                                        className="icon"
                                    />
                                    <Text span m="0 16px 0 8px ">
                                        {location?.trim().replace(/\s*,\s*/g, ",").split(",").slice(0, 3).join(", ") || city?.name || "Unknown Location" }                                   </Text>
                                    <TiLocationArrowOutline
                                        size={19}
                                        // color={`${theme.colors.secondary[2]}`}
                                        className="icon"
                                        color="red"
                                        style={{transform: "translateY(-2px)"}}
                                    />
                                    <Text span m="0 16px 0 5px" size={12}>
                                        {is_online ? "remote" : distance && distance > 1 ? `${distance || 0} Km away` : `${distance && distance * 1000 || 0} m away`}
                                    </Text>
                                    <FaRegEye
                                        size={18}
                                        // color={`${theme.colors.secondary[2]}`}
                                        className="icon"
                                        color="#332D56"
                                    />
                                    <Text span m="0 16px 0 8px" size={12}>
                                        {views_count || 0}
                                    </Text>
                                    {/*</Box>*/}

                                    {/*<Box className={classes.stats}>*/}
                                    <BiSolidHappyBeaming
                                        size={16}
                                        className="icon"
                                        color="#F98900"
                                    />
                                    <Text span m="0 16px 0 8px" size={12}>
                                        {avatar || `${happy_clients ? happy_clients : 0} Happy Clients`}
                                    </Text>

                                    <FaAward
                                        size={16}
                                        className="icon"
                                        color="#0693E3"
                                    />
                                    <Text span m="0 16px 0 8px" size={12}>
                                        {avatar || `${success_rate ? success_rate : 0}% Success Rate`}
                                    </Text>


                                </Box>
                            )}

                        </Flex>
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
                        {start_time && (
                            <p>
                                Start Time:{" "}
                                <span>{convertTo12HourFormat(start_time)}</span>
                            </p>
                        )}
                        {end_time && (
                            <p>
                                End Time:{" "}
                                <span>{convertTo12HourFormat(end_time)}</span>
                            </p>
                        )}
                    </Box>

                    {/*Description*/}
                    <Box
                        component="div"
                        mb="20px"
                        className={classes.description}
                    >
                        <h4>
                            {is_requested ? "Problem Description" : "Description"}
                        </h4>
                        <p dangerouslySetInnerHTML={{ __html: description }} />
                    </Box>


                    <Box
                        component="div"
                        mb="20px"
                        className={classes.requirements}
                    >
                        {highlights?.length > 0 ? (
                            <>
                                <h4>
                                    {is_requested
                                        ? "Requirements for the Task"
                                        : "Highlights"}
                                </h4>
                                {highlights?.map((highlights, index) => (
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
                                        <p>{highlights}</p>
                                    </Flex>
                                ))}
                            </>
                        ) : (
                            ""
                        )}
                    </Box>

                    {count &&
                    applicantsData &&
                    applicantsData?.result?.length > 0 ? (
                        <Box ref={targetRef} mb={20}>
                            {!isUserView && (
                                <>
                                    <h4>Applicants</h4>
                                    <Grid>
                                        {applicantsData?.result?.map(
                                            (applicants, index) => (
                                                <Grid.Col
                                                    md={4}
                                                    lg={6}
                                                    xl={4}
                                                    key={index}
                                                >
                                                    <ApplicantsCard
                                                        enitity_id={id}
                                                        applicants={applicants}
                                                        is_requested={is_requested}
                                                        disabled={is_user && isUserView}
                                                    />
                                                </Grid.Col>
                                            )
                                        )}
                                    </Grid>
                                </>
                            )}
                        </Box>
                    ) : null}

                    {/*Similar Product section*/}

                    {!isMobile1 &&


                        <div>
                            {/*<h4 style={{marginLeft: 15, marginTop: 20}}>*/}

                            {/*</h4>*/}

                            <div>
                                <EntitySimilarProducts productId={id}/>
                            </div>

                            <Box className={classes.rating}>
                                <h4>Ratings</h4>
                                <Flex
                                    justify={"flex-start"}
                                    direction={{base: "column", md: "row"}}
                                    align={{base: "flex-start", md: "center"}}
                                    gap={{base: 30, md: 80}}
                                >
                                    <Box>
                                        <p>
                                            {rating_stats?.average_rating ? +rating_stats?.average_rating : 0}
                                            <span>/5</span>
                                        </p>
                                        <Rating
                                            value={
                                                +rating_stats?.average_rating}
                                            readOnly
                                            size={"md"}
                                            mb={8}
                                        />
                                        <span>
                                    {rating_stats?.total_counts} Rating(s)
                                </span>
                                    </Box>
                                    <ul>
                                        <li>
                                            <Rating defaultValue={5} readOnly/>{" "}
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.five
                                                )}
                                            />
                                            <span>{rating_stats?.five}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={4} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.four
                                                )}
                                            />
                                            <span>{rating_stats?.four}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={3} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.three
                                                )}
                                            />
                                            <span>{rating_stats?.three}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={2} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.two
                                                )}
                                            />
                                            <span>{rating_stats?.two}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={1} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.one
                                                )}
                                            />
                                            <span>{rating_stats?.one}</span>
                                        </li>
                                    </ul>
                                </Flex>
                            </Box>

                            <RatingSection
                                id={id}
                                total={rating_stats?.total_counts}
                                created_by={created_by}
                                is_service={true}
                                disabled={is_user && isUserView} // Disable in user view for owner
                            />
                        </div>}

                </Grid.Col>

                <Grid.Col lg={4}>
                    {/*<Box*/}
                    {/*    sx={{*/}
                    {/*        height: "",*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <div style={{width: "100%", margin: '0 auto', padding: '16px'}}>*/}


                    {/*    </div>*/}

                    {/*</Box>*/}
                    {is_user && !isUserView && !is_requested ? (
                        <>
                            {!userData?.id || loading ? (
                                <div  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '30%',
                                    minHeight: '300px',
                                    width: '100%',
                                }}>
                                    <HomaaleLoader />
                                </div>
                            ) : (
                                <> {isPremium ?
                                    <AvailableSlots serviceId={entityDetail?.id} merchantId={userData?.id} hasPermission={true}
                                                    is_service={true}/>
                                    :

                                    <section style={{border: "1px solid gray", borderRadius: "20px"}} id="trust-section">
                                        <Container size="xl" className="my-4">
                                            <Box maw={1200} mx="auto" px="md" py="xl">
                                                <Title order={1} className="text-center text-orange-400" size="h2" mb="md">
                                                    Unlock Exclusive Benefits with <br className="hidden sm:block"/>
                                                    Premium Merchant!
                                                </Title>

                                                <Flex
                                                    direction={{base: "column", sm: "row"}}
                                                    align={{base: "center", sm: "center"}}
                                                    justify="space-between"
                                                    gap="xl"
                                                >
                                                    <Box maw={535}>
                                                        <Text size="lg" color={dark ? "gray.3" : "gray.7"}>
                                                            Take your business to the next level with our{" "}
                                                            <Text span fw={700} color={dark ? "gray.1" : "gray.9"}>
                                                                Premium Merchant
                                                            </Text>{" "}
                                                            plan and gain access to powerful tools designed to{" "}
                                                            <Text span fw={700} color={dark ? "gray.1" : "gray.9"}>
                                                                boost your success.
                                                            </Text>
                                                        </Text>
                                                    </Box>

                                                    <Flex direction="column" gap={50} align="center">
                                                        <Image
                                                            src="/merchant/merchant4.png"
                                                            alt="Premium Merchant"
                                                            width={150}
                                                            height={200}


                                                            //  radius="100%"
                                                            className="rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-sm cursor-pointer"
                                                            onClick={() => router.push("/merchant/profile")}
                                                        />

                                                        <Button
                                                            variant="subtle"
                                                            mt="md"
                                                            color={dark ? "orange.6" : "orange.4"}
                                                            className="transition-all duration-300 ease-in-out hover:scale-105"
                                                            onClick={() => router.push(`/merchant/profile`)}
                                                        >
                                                            Go to Merchant page<FaArrowRight/>
                                                        </Button>
                                                    </Flex>
                                                </Flex>
                                            </Box>

                                            <Grid mb={80}>
                                                <Grid.Col md={6} sm={12} display="flex">
                                                    <TrustCard
                                                        title="Special Offers & Packages"
                                                        image="/svgs/trustCard/trustCard1.svg"
                                                        description="Create exclusive deals and attract more customers with personalized promotions."
                                                        color="#FAF5FF"
                                                    />
                                                </Grid.Col>
                                                <Grid.Col md={6} sm={12} display="flex">
                                                    <TrustCard
                                                        title="Manage Members & Staff"
                                                        image="/svgs/trustCard/trustCard3.svg"
                                                        description="Easily add and manage team members to streamline service delivery."
                                                        color="#FEF2F2"
                                                    />
                                                </Grid.Col>
                                                <Grid.Col md={0} sm={12} display="flex">
                                                    <TrustCard
                                                        title="Service Slot Management"
                                                        image="/svgs/trustCard/trustCard2.svg"
                                                        description="Assign staff to specific time slots, ensuring seamless scheduling and optimized workflow."
                                                        color="#ECFDF5"
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        </Container>
                                    </section>
                                }


                                    <Flex>
                                        {/* <h4>Event</h4> */}
                                        {event && (
                                            <p
                                                className={classes.pressable}
                                                onClick={() =>
                                                    router.push(
                                                        `/services/${id}/${event?.id}`
                                                    )
                                                }
                                            >
                                                {" "}
                                                View Details
                                            </p>
                                        )}
                                    </Flex>
                                    {event ? (
                                        <>
                                            <Box className={classes.event}>
                                                <Text component="p" mb={10}>
                                                    <Text
                                                        component="span"
                                                        fw={500}
                                                        size={14}
                                                    >
                                                        Title :
                                                    </Text>{" "}
                                                    {event?.title}
                                                </Text>

                                                <Flex
                                                    justify={"flex-start"}
                                                    gap={8}
                                                    pb={14}
                                                >
                                                    <IconCalendar
                                                        size={18}
                                                        color={theme.colors.gray[6]}
                                                    />{" "}
                                                    <p>
                                                        {event?.start &&
                                                            format(
                                                                new Date(event.start),
                                                                "PP"
                                                            )}{" "}
                                                        -{" "}
                                                        {event?.end &&
                                                            format(
                                                                new Date(event.end),
                                                                "PP"
                                                            )}
                                                    </p>
                                                </Flex>
                                                <Flex
                                                    justify={"flex-start"}
                                                    gap={8}
                                                    pb={14}
                                                >
                                                    <IconUsers
                                                        size={18}
                                                        color={theme.colors.gray[6]}
                                                    />{" "}
                                                    <p>{event?.guest_limit} guests</p>
                                                </Flex>
                                                {event?.is_flexible && (
                                                    <Flex
                                                        justify={"flex-start"}
                                                        gap={8}
                                                        pb={14}
                                                    >
                                                        <IconClock
                                                            size={18}
                                                            color={theme.colors.gray[6]}
                                                        />{" "}
                                                        <p>Is Flexible</p>
                                                    </Flex>
                                                )}
                                            </Box>
                                            <h4>Schedule</h4>
                                            {event?.schedules &&
                                            event?.schedules?.length <= 0 ? (
                                                    <Box className={classes.schedule}>
                                                        <Flex
                                                            justify={"flex-start"}
                                                            gap={24}
                                                        >
                                                            <IconCalendarPlus
                                                                size={32}
                                                                color={theme.colors.gray[6]}
                                                            />
                                                            <Box>
                                                                <h4>No Schedule Found</h4>
                                                                <p>Add New Schedule</p>
                                                            </Box>
                                                        </Flex>
                                                        <Flex justify={"flex-end"} mt={8}>
                                                            <Button
                                                                onClick={() =>
                                                                    setScheduleModel(true)
                                                                }
                                                            >
                                                                {" "}
                                                                + Create New
                                                            </Button>
                                                        </Flex>
                                                    </Box>
                                                )
                                                : (
                                                    <CalendarForIds onTimeSlotSelect={handleTimeSlotSelect} id={id}
                                                                    entity_user={entity_user} is_requested={is_requested}
                                                                    disabled={is_user && isUserView} // Disable in user view for owner
                                                    />
                                                )
                                            }

                                        </>
                                    ) : (
                                        // <Box
                                        //     px={21}
                                        //     py={16}
                                        //     bg={
                                        //         theme.colorScheme === "dark"
                                        //             ? theme.colors.gray[7]
                                        //             : theme.colors.homaaleSlate[0]
                                        //     }
                                        //     sx={{borderRadius: 4}}
                                        // >
                                        //     <Flex
                                        //         justify={"flex-start"}
                                        //         gap={8}
                                        //         mb={16}
                                        //     >
                                        //         <IconCalendarPlus
                                        //             size={28}
                                        //             color={
                                        //                 theme.colorScheme === "dark"
                                        //                     ? theme.colors.gray[0]
                                        //                     : theme.colors.gray[6]
                                        //             }
                                        //         />
                                        //         <Box>
                                        //             <h4>No event created yet.</h4>
                                        //             <Text>
                                        //                 Let&apos;s create your first
                                        //                 event
                                        //             </Text>
                                        //         </Box>
                                        //     </Flex>
                                        //     <p
                                        //         className={classes.pressable}
                                        //         onClick={() => setEventModel(true)}
                                        //     >
                                        //         {" "}
                                        //         + Attach an event
                                        //     </p>
                                        // </Box>
                                        ""
                                    )}
                                </>

                            )}
                        </>
                    ) : !entityDetail?.is_requested &&
                        <Box>

                            <CalendarForIds onTimeSlotSelect={handleTimeSlotSelect} id={id}
                                            entity_user={entity_user}
                                            is_requested={entityDetail?.is_requested ?? false}/>

                        </Box>

                    }


                    <h4>Map</h4>
                    {extra_data?.length > 0 && (
                        <Text className="bg-blue-400 text-white text-xs font-thin p-1 w-full flex gap-2 flex-wrap">
                            <span className='font-bold flex gap-1 align-center justify-center'>
                                LOCATION <PiAirplaneTiltFill/>
                            </span>
                            {is_online ? city.name : location || "Unknown Location"}
                        </Text>
                    )}
                    <Map
                        style={{width: "200px", height: "200px"}}
                        location={{
                            id: "1",
                            lat: latitude,
                            lng: longitude,
                        }}
                    >
                        <OverlayViewF
                            position={{
                                lat: is_online ? city.latitude : latitude,
                                lng: is_online ? city.longitude : longitude,
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
                                sx={{ cursor: "pointer", background: theme.colors.brand[4] }}
                            />
                        </OverlayViewF>
                    </Map>

                    <Grid mt={0}>

                        <Box
                            sx={{}}
                        >{isMobile1 &&
                            //         <h4 style={{marginLeft: 15, marginTop: 20}}>

                            //    </h4>

                            <div style={{marginLeft: 15, marginTop: 20}}>
                                <EntitySimilarProducts productId={id}/>
                            </div>
                        }


                            <h4 style={{marginLeft: 15}}>
                                Recommended {is_requested ? "Tasks" : "Services"}
                            </h4>
                            {recommendedTaskData?.recommend &&
                            recommendedTaskData?.recommend.length > 0 ? (
                                recommendedTaskData?.recommend?.map(
                                    (item, index) => (
                                        <Grid.Col xs={12} key={index}>
                                            <ServiceCard service={item}/>
                                        </Grid.Col>
                                    )
                                )
                            ) : (
                                <NoDataAlert/>
                            )}
                            <h4 style={{marginLeft: 15, marginTop: 20}}>
                                Similar {is_requested ? "Tasks" : "Services"}
                            </h4>
                            {recommendedTaskData?.similar &&
                            recommendedTaskData?.similar.length > 0 ? (
                                recommendedTaskData?.similar?.map((item, index) => (
                                    <Grid.Col xs={12} key={index}>
                                        <ServiceCard service={item}/>
                                    </Grid.Col>
                                ))
                            ) : (
                                <NoDataAlert/>
                            )}
                        </Box>
                    </Grid>
                    {isMobile1 &&

                        <div style={{
                            marginTop: isMobile1 ? "200px" : ""


                        }}>

                            <Box className={classes.rating}>
                                <h4>Ratings</h4>
                                <Flex
                                    justify={"flex-start"}
                                    direction={{base: "column", md: "row"}}
                                    align={{base: "flex-start", md: "center"}}
                                    gap={{base: 30, md: 80}}
                                >
                                    <Box>
                                        <p>
                                            {rating_stats?.average_rating ? +rating_stats?.average_rating : 0}
                                            <span>/5</span>
                                        </p>
                                        <Rating
                                            value={
                                                +rating_stats?.average_rating}
                                            readOnly
                                            size={"md"}
                                            mb={8}
                                        />
                                        <span>
                                    {rating_stats?.total_counts} Rating(s)
                                </span>
                                    </Box>
                                    <ul>
                                        <li>
                                            <Rating defaultValue={5} readOnly/>{" "}
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.five
                                                )}
                                            />
                                            <span>{rating_stats?.five}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={4} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.four
                                                )}
                                            />
                                            <span>{rating_stats?.four}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={3} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.three
                                                )}
                                            />
                                            <span>{rating_stats?.three}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={2} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.two
                                                )}
                                            />
                                            <span>{rating_stats?.two}</span>
                                        </li>
                                        <li>
                                            <Rating defaultValue={1} readOnly/>
                                            <Progress
                                                value={rating_progress(
                                                    rating_stats?.one
                                                )}
                                            />
                                            <span>{rating_stats?.one}</span>
                                        </li>
                                    </ul>
                                </Flex>
                            </Box>

                            <RatingSection
                                id={id}
                                total={rating_stats?.total_counts}
                                created_by={created_by}
                                is_service={true}
                                disabled={is_user && isUserView} // Disable in user view for owner
                            />

                        </div>
                    }
                </Grid.Col>
            </Grid>
            <EventAddModal
                service_id={id}
                opened={eventModel}
                setOpened={setEventModel}
            />
            <ScheduleModal
                event_id={event?.id}
                opened={scheduleModel}
                setOpened={setScheduleModel}
            />

        </>
    );
};

export default EntityServiceDetail;
