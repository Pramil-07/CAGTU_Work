import {Avatar, Badge, Box, Button, Flex, RingProgress, Text, Tooltip, useMantineTheme} from "@mantine/core";
import {
    IconCalendarEvent,
    IconClock,
    IconMapPin,
    IconStar,
    IconUsers,
} from "@tabler/icons-react";
import {format, formatDistanceToNowStrict} from "date-fns";
import {formatDateBasedOnAge, useDark} from "@/utils/helpers";
import Image from "next/image";
import {useRouter} from "next/router";
import React from "react";

import {TASK_STATUS} from "@/constants/TASK_STATUS";
import {useUser} from "@/hooks/useUser";
import {useEntityCardStyles} from "@/styles/components/EntityCardStyles";
import type {TaskBookingProps} from "@/types/booking/TaskBookingProps";
import type {EntityServiceLisitngProps} from "@/types/EntityServiceLisitngProps";
import {convertTo12HourFormat} from "@/utils/formatTime";
import {isLoggedIn} from "@/utils/helpers";

import {EditButton} from "../common/EditButton";
import SaveIcon from "../common/SaveIcon";
import {ShareButton} from "../common/ShareButton";
import {useMediaQuery} from "@mantine/hooks";

import {notifications} from "@mantine/notifications";
import {axiosClient} from "@/utils/axiosClient";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa";
import { IoAlertOutline } from "react-icons/io5";
import { useCurrency } from "@/currency/CurrencyContext";


export const ServiceCard = ({
                                service,
                                booking,
                                active,
                                is_map = false,
                                badgeStatus,
                                query,
                            }: {
    service?: EntityServiceLisitngProps["result"][0];
    booking?: TaskBookingProps["result"][0];
    active?: boolean;
    is_map?: boolean;
    city?: string;
    query?: string;
    badgeStatus?: boolean | string | null ;
    globalCurrency?: string|undefined;
}) => {
    const {classes} = useEntityCardStyles();


    const {
        title,
        currency,
        created_at,
        end_date,
        images,
        id,
        start_time,
        end_time,
        booked_count,
    } = service ?? booking ?? {};

    const {
        budget_from,
        budget_to,
        budget_type,
        created_by,
        rating,
        rating_count,
        count,
        is_requested,
        is_bookmarked,
        is_range,
        payable_from,
        payable_to,
        location,
        city,
        is_new,
        is_open,
    } = service ?? ({} as EntityServiceLisitngProps["result"][0]);




    const {status, assignee, assigner, price, earning, entity_service} =
    booking ?? ({} as TaskBookingProps["result"][0]);

    //Checks IF the user owns the entity service or not
    const {data: userData} = useUser();
    const router = useRouter()
    /*const [exchangeInfo, setExchangeInfo] = useState<number>(89.0);*/
    const colorBadge = service ? "orange" : "blue";
    const label = service ? (is_requested ? "Task" : "Service") : "booking"
    const is_merchant = typeof window !== "undefined" && router.pathname === "/merchant/profile"
    const is_booking = typeof window !== "undefined" && router.pathname === "/bookings"
    const dark = useDark();
    const theme = useMantineTheme();
    const darkGray = theme.colors.gray[6];
    const draftStatus = router.query.status_choice;

    const {globalCurrency, exchangeRate} = useCurrency();

    let is_user: boolean;
    if (created_by?.id) {
        is_user = userData?.id === created_by?.id;
    } else {
        is_user = !!active;
    }
    let is_myBookings;

    if (userData?.id === booking?.assignee?.id) {
        is_myBookings = false;
    } else {
        is_myBookings = true;
    }

    const image = created_by?.profile_image
        ? created_by?.profile_image
        : is_user
            ? assigner?.profile_image
            : assignee?.profile_image;

    const name = created_by?.full_name
        ? created_by?.full_name
        : is_user
            ? `${assigner?.full_name}`
            : `${assignee?.full_name}`;

    const provider = created_by?.full_name
        ? created_by?.full_name
        : is_user
            ? (`Task created by:${assigner?.full_name} --
               Applied by:${assignee?.full_name}`)
            : `Booking created by:${assigner?.full_name}
                Booked by:${assignee?.full_name}  `;

    const task = assignee?.id === userData?.id
    const BookingCreatedBy = task ? booking?.assignee.full_name : booking?.assigner.full_name

    const redirection_link = created_by?.id
        ? created_by?.id
        : is_user
            ? assigner?.id
            : assignee?.id;

    let color: string, progress: number;
    switch (status) {
        case TASK_STATUS.Open:
            color = "blue";
            progress = 30;
            break;
        case TASK_STATUS.Cancelled:
            color = "red";
            progress = 0;
            break;
        case TASK_STATUS.Closed:
            color = "teal";
            progress = 100;
            break;
        case TASK_STATUS.Completed:
            color = "green";
            progress = 90;
            break;
        case TASK_STATUS.Initiated:
            color = "gray";
            progress = 0;
            break;
        case TASK_STATUS.On_Progress:
            color = "orange";
            progress = 60;
            break;

        default:
            color = "blue";
            progress = 0;
            break;
    }
    const isSmallScreen = useMediaQuery("(max-width: 768px)")
    const is150Screen = useMediaQuery("(max-width: 1000px)")
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
            try {
                const response = await axiosClient.put(`task/entity/active/${id}/`, {
                    is_active: true,
                });
                router.push('/myList?status=True');
            } catch (error) {
                showErrorNotification("Something went wrong, try again later!!!");
            }
        };
    const handleInactive = async () => {
        try {
            const response = await axiosClient.put(`task/entity/active/${id}/`, {
                is_active: false,
            });
            router.push('/myList?status=False');
        } catch (error) {

            showErrorNotification("Something went wrong, try again later!!!");
        }
    };

    // FIXED: Now accepts null/undefined with fallback
    function convertCurrency(
        amount: number | string,
        globalCurrency: string,
        currency: string,
        exchangeRate: number | null | undefined = 1
    ): { amount: number; currency: string; symbol: string | undefined } {
        const parsedAmount = parseFloat(amount.toString());
        if (isNaN(parsedAmount)) {
            return { amount: 0, currency, symbol: undefined };
        }

        const rate = exchangeRate ?? 1;

        if (globalCurrency === currency) {
            return {
                amount: parsedAmount,
                currency,
                symbol: currency === "AUD" ? "AU$" : currency === "NPR" ? "रु" : undefined
            };
        }

        if (currency === "AUD" && globalCurrency === "NPR") {
            return { amount: parsedAmount * rate, currency: "NPR", symbol: "रु" };
        }

        if (currency === "NPR" && globalCurrency === "AUD") {
            return { amount: parsedAmount / rate, currency: "AUD", symbol: "AU$" };
        }

        return {
            amount: parsedAmount,
            currency,
            symbol: currency === "AUD" ? "AU$" : currency === "NPR" ? "रु" : undefined
        };
    }

    function formatNumberWithCondition(number: number, symbol: string | undefined){
        if (!symbol) {
            // Handle undefined symbol
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
            });
        }

        if (symbol === "रु") {
            return number.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
        }

        if (symbol === "AU$") {
            return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        return number.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    }


    function convertAndFormatCurrency(
        amount: number | string,
        NoCurrency: boolean,
        globalCurrency: string | undefined,
        currency: string,
        exchangeRate: number | null | undefined
    ) {
        const effectiveGlobalCurrency = globalCurrency ?? "NPR";

        const { amount: convertedAmount, symbol } = convertCurrency(
            amount,
            effectiveGlobalCurrency,
            currency,
            exchangeRate
        );

        const formattedAmount = formatNumberWithCondition(convertedAmount, symbol);
        if (is_range) {
            if (!NoCurrency){
        return `${formattedAmount}`;}
         else{
            return `${symbol || ''}${formattedAmount}`;
        }
    }


       else{
        return `${symbol || ''} ${formattedAmount}`;
       }
    }

    /*useEffect(() => {
        const fetchExchangeRate = async () => {
            const exchangeData= await axiosClient.get(`locale/cms/exchangerate`);
            const { result } = exchangeData.data;
            // Extract value and currency code
            const rate = parseFloat(result[0]?.value); // Save only the exchange rate (e.g., 89.0)

            setExchangeInfo(rate);
            console.log('Extracted Exchange Info:', exchangeInfo);

        }
        fetchExchangeRate();
    }, []);
    console.log("exchangeinfo from service card", exchangeInfo);*/

    return (


        <Box
            style={{}}
            id={`task-card-${id}`}
            className={classes.root}
            onClick={() =>
                !is_map
                    ? router.push(
                        `/${
                            service
                                ? is_requested
                                    ? "tasks"
                                    : "services"
                                : "bookings"
                        }/${id}`
                    )
                    : ""
            }
        > <Box ml={1} w={"97%"} mt={{base: 1, md: 0}}>

        </Box>


            <Flex
                style={{
                    minHeight: "200px"
                }}
                align={"flex-start"}
                direction={{base: "column", md: "row"}}
                px={16}
            >
                <Box
                    ml={1} w={"100%"} mt={{base: 8, md: 1}}
                    style={{
                        position: "relative",
                        top: is150Screen ? "-4px" : ""
                    }}
                    className={classes.image} mx={"auto"}>

                    {images && (

                        <Image
                            src={
                                images[0]?.media ??
                                "/images/placeholder/taskPlaceholder.png"
                            }
                            alt="service-image"
                            fill
                            sizes=""
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{objectFit: "cover"}}
                        />


                    )}


                    {entity_service && (
                        <Image
                            src={
                                entity_service?.images[0]?.media ??
                                "/images/placeholder/taskPlaceholder.png"
                            }
                            alt="service-image"
                            fill
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            style={{objectFit: "contain"}}
                        />

                    )}

                    <Badge
                        sx={{
                            borderRadius: "unset",
                            width: isSmallScreen ? "200px" : is_requested ? "130px" : "130px",
                            position: "relative",
                            top: isSmallScreen ? "210px" : "150px",
                            backgroundColor: service ? (is_requested ? "#ecf0f4" : theme.colors.brand[1]) : "#eceff4",
                            color:service ? (is_requested ? "darkslategray" : theme.colors.brand[4]) : "gray",
                        }}
                    >
                        {label}
                    </Badge>
                </Box>


                <Box ml={1} w={"100%"} mt={{base: 10, md: 0}}>

                    <Flex style={{}}>
                        <Box mr={"xs"}>


                            <Tooltip label={title} withArrow>
                                <Text
                                    truncate
                                    style={{
                                        // top: "5%"
                                        // position: "relative",
                                        // left: is150Screen ? "" : "",


                                    }}

                                    className={classes.title}
                                    lineClamp={2}
                                    maw={"auto"}
                                    // This provides a tooltip on hover but is less customizable
                                >
                                    {title}
                                </Text>
                            </Tooltip>
                        </Box>

                        <Box>

                            {/*------------------------------------------currency format layout start-----------------------------------------------*/}
                            <Box>
                                <h5
                                style={{
                                    display: "flex",
                                    justifyContent: "end",
                                    whiteSpace:is_range?"nowrap":"nowrap"
                                }}
                                className="font-medium text-xs sm:text-sm md:text-base lg:text-sm xl:text-base leading-snug  overflow-hidden text-ellipsis">
                                    {!booking ? (
                                        <>
                                            {/* {currency?.symbol}&nbsp; */}
                                            {is_range ? (
                                                <>
                                                    {/*{currency?.symbol}&nbsp;*/}
                                                    {convertAndFormatCurrency(
                                                       Number(is_requested ? (is_user ? payable_from : budget_from) : (is_user ? budget_from : payable_from)),
                                                       true,
                                                       globalCurrency,
                                                       currency?.code || "AUD", // Use currency code
                                                       exchangeRate

                                                    )}
                                                    {}- {" "}
                                                </>
                                            ) : null}
                                            {/*{currency?.symbol}&nbsp;*/}
                                            {convertAndFormatCurrency(
                                                Number(is_requested ? (is_user ? payable_to : budget_to) : (is_user ? budget_to : payable_to)),
                                                false,
                                                globalCurrency,
                                                currency?.code || "AUD", // Use currency code
                                                exchangeRate

                                            )}
                                        </>
                                    ) : (
                                        <div>
                                            {/* {currency?.symbol}&nbsp; */}
                                            {convertAndFormatCurrency(Number(is_myBookings ? price : earning),false,globalCurrency, currency?.code||"AUD",exchangeRate)}
                                        </div>
                                    )}
                                </h5>


                            </Box>


                            { /*------------------------------------------currency format layout end-----------------------------------------------*/}
                            <Box style={{
                                display: "flex",
                                justifyContent: "end",
                            }}>
                                <Text className="per" size={10}>
                                    per&nbsp;{budget_type || entity_service?.budget_type}
                                </Text>
                            </Box>
                        </Box>
                    </Flex>
                    <Box
                        className={classes.created}

                    >
                        <Avatar
                            src={
                                image ??
                                "/images/placeholder/profilePlaceholder.png"
                            }
                            alt="service-image"

                            radius={"xl"}
                            size={30}
                            style={{
                                objectFit: "cover",
 

                            }}
                        />

                        <Flex
                            ml={8}
                            // gap={12}
                            // justify={"space-between"}
                            className={"created__full"}
                            style={{ alignItems: "center", gap: 8 }}
                        >
                            <Text
                                component="span"
                                // truncate
                                // lineClamp={1}
                                className={classes.createdByTitle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    is_user
                                        ? router.push("/profile")
                                        : router.push(
                                            `/tasker/${redirection_link}`
                                        );
                                }}
                            >

                                {name.charAt(0).toUpperCase()  + name.slice(1)}{" "}


                            </Text>
                            {created_at && (
                                <>
                                    <Text component="span" className={"date__side"}>
                                        ●
                                    </Text>
                                    <Text component="span" >
                                        {formatDateBasedOnAge(new Date(created_at))}
                                    </Text>
                                </>
                            )}
                        </Flex>

                    </Box>
                    <Flex>

                        <Box>

                            {/*<Box*/}
                            {/*    className={classes.created}*/}
                            {/*    onClick={(e) => {*/}
                            {/*        e.stopPropagation();*/}
                            {/*        is_user*/}
                            {/*            ? router.push("/profile")*/}
                            {/*            : router.push(*/}
                            {/*                `/tasker/${redirection_link}`*/}
                            {/*            );*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <Avatar*/}
                            {/*        src={*/}
                            {/*            image ??*/}
                            {/*            "/images/placeholder/profilePlaceholder.png"*/}
                            {/*        }*/}
                            {/*        alt="service-image"*/}

                            {/*       radius={"xl"}*/}
                            {/*       size={30}*/}
                            {/*        style={{*/}
                            {/*            objectFit:"cover",*/}


                            {/*        }}*/}
                            {/*    />*/}

                            {/*    <Flex*/}
                            {/*        ml={8}*/}
                            {/*        gap={12}*/}
                            {/*        justify={"space-between"}*/}
                            {/*        className={"created__full"}*/}
                            {/*        style={{ width:"100%"}}*/}
                            {/*    >*/}
                            {/*        <Text*/}
                            {/*            component="span"*/}
                            {/*            truncate*/}
                            {/*            lineClamp={1}*/}
                            {/*        >*/}
                            {/*            {name}{" "}*/}


                            {/*        </Text>*/}


                            {/*        {created_at && (*/}
                            {/*            <p className="date__time">*/}
                            {/*                <IconClock size={14}/>{" "}*/}
                            {/*                {formatDistanceToNowStrict(new Date(created_at), {*/}
                            {/*                    addSuffix: true,*/}
                            {/*                })}*/}

                            {/*            </p>*/}
                            {/*        )}*/}


                            {/*    </Flex>*/}

                            {/*</Box>*/}

                            <Box className={classes.content}>
                                <Text
                                    component="p"
                                    truncate
                                    lineClamp={1}
                                    sx={{whiteSpace: "break-spaces"}}
                                >
                                    <IconMapPin size={16}/>
                                    <Text
                                        component="span"
                                        ml={8}
                                        mr={8}
                                        truncate
                                        lineClamp={1}
                                        sx={{whiteSpace: "break-spaces"}}
                                    >
                                        {city ? city.name : "remote"}
                                    </Text>
                                    {location === "" && (
                                    <Badge size={"sm"} color={theme.colors.brand[4]}
                                           radius={"lg"}> Remote
                                    </Badge>
                                    )}
                                </Text>

                                {service && (
                                    <p>
                                        <svg width="18" height="15" viewBox="0 0 18 15" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.375 7.75C7.35938 7.73177 8.1888 7.39453 8.86328 6.73828C9.51953 6.0638 9.85677 5.23438 9.875 4.25C9.85677 3.26562 9.51953 2.4362 8.86328 1.76172C8.1888 1.10547 7.35938 0.768229 6.375 0.75C5.39062 0.768229 4.5612 1.10547 3.88672 1.76172C3.23047 2.4362 2.89323 3.26562 2.875 4.25C2.89323 5.23438 3.23047 6.0638 3.88672 6.73828C4.5612 7.39453 5.39062 7.73177 6.375 7.75ZM6.375 2.0625C6.99479 2.08073 7.51432 2.29036 7.93359 2.69141C8.33464 3.11068 8.54427 3.63021 8.5625 4.25C8.54427 4.86979 8.33464 5.38932 7.93359 5.80859C7.51432 6.20964 6.99479 6.41927 6.375 6.4375C5.75521 6.41927 5.23568 6.20964 4.81641 5.80859C4.41536 5.38932 4.20573 4.86979 4.1875 4.25C4.20573 3.63021 4.41536 3.11068 4.81641 2.69141C5.23568 2.29036 5.75521 2.08073 6.375 2.0625ZM7.76953 9.0625H4.98047C3.64974 9.09896 2.53776 9.5638 1.64453 10.457C0.751302 11.3503 0.286458 12.4622 0.25 13.793C0.25 14.0664 0.341146 14.2943 0.523438 14.4766C0.705729 14.6589 0.933594 14.75 1.20703 14.75H11.543C11.8164 14.75 12.0443 14.6589 12.2266 14.4766C12.4089 14.2943 12.5 14.0664 12.5 13.793C12.4635 12.4622 11.9987 11.3503 11.1055 10.457C10.2122 9.5638 9.10026 9.09896 7.76953 9.0625ZM1.58984 13.4375C1.69922 12.5625 2.0638 11.8333 2.68359 11.25C3.32161 10.6849 4.08724 10.3932 4.98047 10.375H7.76953C8.66276 10.3932 9.41927 10.6849 10.0391 11.25C10.6771 11.8333 11.0508 12.5625 11.1602 13.4375H1.58984ZM13.3477 9.5H11.3242C11.9622 10.0286 12.4635 10.6576 12.8281 11.3867C13.1927 12.1341 13.375 12.9362 13.375 13.793C13.375 14.1576 13.2839 14.4766 13.1016 14.75H16.875C17.1302 14.75 17.3398 14.6589 17.5039 14.4766C17.668 14.3125 17.75 14.1029 17.75 13.8477C17.7135 12.6263 17.2852 11.6055 16.4648 10.7852C15.6445 9.96484 14.6055 9.53646 13.3477 9.5ZM12.0625 7.75C12.9375 7.73177 13.6576 7.43099 14.2227 6.84766C14.806 6.28255 15.1068 5.5625 15.125 4.6875C15.1068 3.8125 14.806 3.09245 14.2227 2.52734C13.6576 1.94401 12.9375 1.64323 12.0625 1.625C11.3698 1.64323 10.7591 1.85286 10.2305 2.25391C10.5586 2.85547 10.7318 3.52083 10.75 4.25C10.7318 5.23438 10.4401 6.10026 9.875 6.84766C10.4583 7.43099 11.1875 7.73177 12.0625 7.75Z"
                                                fill="#868E96"/>
                                        </svg>
                                        <Text component="span" ml={6}>
                                            {is_requested
                                                ? `${count} Applied`
                                                : `${booked_count} Booked`}
                                        </Text>
                                    </p>
                                )}
                                {end_date && is_requested && (
                                    <p className="ml-0.5">
                                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M0.125 1.40625C0.161458 1.00521 0.380208 0.786458 0.78125 0.75H9.96875C10.3698 0.786458 10.5885 1.00521 10.625 1.40625C10.5885 1.80729 10.3698 2.02604 9.96875 2.0625H9.75V2.58203C9.71354 3.71224 9.3125 4.69661 8.54688 5.53516L6.30469 7.75L7.50781 8.95312C7.2526 9.51823 7.125 10.138 7.125 10.8125C7.125 11.6328 7.30729 12.3802 7.67188 13.0547C8.03646 13.7474 8.53776 14.3125 9.17578 14.75H0.78125C0.380208 14.7135 0.161458 14.4948 0.125 14.0938C0.161458 13.6927 0.380208 13.474 0.78125 13.4375H1V12.918C1.01823 11.7695 1.42839 10.7943 2.23047 9.99219L4.44531 7.75L2.23047 5.53516C1.42839 4.69661 1.01823 3.71224 1 2.58203V2.03516H0.78125C0.380208 2.01693 0.161458 1.79818 0.125 1.37891V1.40625ZM2.85938 4.25H7.89062C8.23698 3.75781 8.41927 3.20182 8.4375 2.58203V2.0625H2.3125V2.58203C2.3125 3.20182 2.49479 3.75781 2.85938 4.25ZM15.875 10.8125C15.8385 11.9245 15.4557 12.8542 14.7266 13.6016C13.9792 14.3307 13.0495 14.7135 11.9375 14.75C10.8255 14.7135 9.89583 14.3307 9.14844 13.6016C8.41927 12.8542 8.03646 11.9245 8 10.8125C8.03646 9.70052 8.41927 8.77083 9.14844 8.02344C9.89583 7.29427 10.8255 6.91146 11.9375 6.875C13.0495 6.91146 13.9792 7.29427 14.7266 8.02344C15.4557 8.77083 15.8385 9.70052 15.875 10.8125ZM11.4727 9.0625V10.8125C11.5091 11.0859 11.6549 11.2318 11.9102 11.25H13.25C13.5234 11.2318 13.6693 11.0859 13.6875 10.8125C13.6693 10.5391 13.5234 10.3932 13.25 10.375H12.3477V9.0625C12.3294 8.78906 12.1836 8.64323 11.9102 8.625C11.6549 8.64323 11.5091 8.78906 11.4727 9.0625Z"
                                                fill="#868E96"/>
                                        </svg>
                                        <Text
                                            component="span"
                                            ml={6}
                                            truncate
                                            lineClamp={1}
                                            sx={{}}
                                        >    {is_requested ? (
                                            <Flex>
                                                {format(new Date(end_date), "PP")}
                                                {is_merchant ? <br/> : ""}
                                                {start_time ? `| ${convertTo12HourFormat(start_time)}` : ""}
                                                {end_time ? `- ${convertTo12HourFormat(end_time)}` : ""}
                                            </Flex>
                                        ) : (
                                            end_date

                                        )}
                                        </Text>
                                    </p>
                                )}
                                {!is_requested && (
                                    <p className={"gap-2"}>
                                        <IconStar
                                            color={rating > 0 ? "orange" : undefined}
                                            size={16}
                                        />
                                        {rating || "No Rating "}
                                        {rating > 0 && (
                                            <Text component="span">({rating_count} reviewed)
                                            </Text>
                                        )}
                                    </p>
                                )}
                            </Box>
                            {/* {is_booking&&
                           <Box>
                           {provider}
                       </Box>
                           } */}

                            <Box
                                style={{
                                    position: "relative",
                                    bottom: "80px",
                                    left: "30px",

                                }}
                            >
                                {is_booking && is_user ? (
                                        <Box slot="10"
                                             style={{
                                                 padding: "px",

                                             }}>
                                            {}
                                            {/* {provider}<br/> */}
                                            <Badge size={"xs"} color={entity_service.is_requested ? "blue" : ""}
                                                   radius={"lg"}>{entity_service.is_requested ? "Task" : "Service"}{" "}{userData?.id === entity_service.created_by.id ? "Booked by" : "owner"}</Badge>
                                            {/* <Badge radius={"xs"}>Booked by:{BookingCreatedBy}</Badge> */}

                                        </Box>
                                    ) :
                                    is_booking && (
                                        <Box style={{
                                            padding: "px",

                                        }}>
                                            {}
                                            {/* {provider}<br/> */}
                                            <Badge size={"xs"} color={entity_service.is_requested ? "blue" : ""}
                                                   radius={"lg"}>{entity_service.is_requested ? "Task" : "Service"}{" "}{userData?.id === entity_service.created_by.id ? "Applied By" : "owner"}</Badge>
                                            {/* <Badge radius={"xs"}>Booked by:{BookingCreatedBy}</Badge> */}

                                        </Box>
                                    )}
                            </Box>

                        </Box>


                        {status && (
                            <RingProgress
                                style={{
                                    zIndex: 10,
                                    position: isSmallScreen ? "absolute" : "relative",
                                    marginLeft: isSmallScreen ? "" : "auto",
                                    marginTop: isSmallScreen ? "" : "10px",
                                    right: isSmallScreen ? "10px" : "0",
                                }}
                                size={80}
                                sections={[{value: progress, color: color}]}
                                thickness={8}
                                roundCaps
                                label={
                                    <Text
                                        color={color}
                                        weight={600}
                                        align="center"
                                        size="lg"
                                    >
                                        {progress}%
                                    </Text>
                                }
                            />
                        )}
                    </Flex>
                </Box>
            </Flex>


            <Flex
                justify={"space-between"}
                align={{base: "flex-start", xs: "center"}}
                direction={{base: "row", xs: "row"}}
                className={classes.bottomSection}
                // gap={10}
                px={16}
            >
                <Flex className={classes.bottomLeft}>
                    {!service && (
                        <Badge radius="lg" size={"lg"} color={"blue"} style={{ textTransform: "capitalize" }}>
                            <p>{status}</p>
                        </Badge>
                    )}

                    {!is_requested && service && !router.pathname.includes("/myList") ? (
                        <Button radius="lg" size={"xs"} variant={"outline"} styles={{
                            root: {
                              '&:hover': {
                                  background: theme.colors.brand[4], // Change background color on hover
                                 color: 'white', // Change text color on hover
                                // borderColor: '#333', // Change border color on hover
                              },
                            },
                          }}> Add to Box </Button>
                    ) : is_requested && service && !router.pathname.includes("/myList") && is_open && (
                        <Badge radius="lg" size={"lg"} color={"blue"} style={{ textTransform: "none" }}>
                            <p>{"Open"}</p>
                        </Badge>
                    )}

                    {router.pathname.includes("/myList") && draftStatus === "draft" ? (
                        <Badge radius="lg" size={"lg"} color={"blue"} style={{ textTransform: "none" }}>
                            <p>{"Draft"}</p>
                        </Badge>
                    ) : ( badgeStatus !== undefined ? (
                        <Badge size={"lg"} radius="lg" color={"blue"} style={{ textTransform: "none" }}>
                            <p> {badgeStatus === "True" ? "Active" : badgeStatus === "False" ? "Inactive" : badgeStatus === "draft" ? "Draft" : "Active"} </p>
                        </Badge>
                    ) : router.pathname.includes("/myList?status_choice=draft") ? (
                        <Badge size={"lg"} radius="lg" color={"blue"} style={{ textTransform: "none" }}>
                            <p> {"Draft"} </p>
                        </Badge>
                    ) : false)}

                </Flex>
                <Box component="div" className={classes.rightSection}>
                    {service && (
                        <Flex justify={"flex-start"}>
                            {draftStatus !== "draft" && router.pathname.includes("/myList") && badgeStatus === undefined && badgeStatus === "True" ?  (
                                <Tooltip  label={"Hide"} withArrow>
                                    <Button onClick={(e) => {
                                        e.stopPropagation();
                                        handleInactive();
                                    }}
                                        color="gray"
                                            variant="subtle"
                                            compact  sx={(theme) => ({
                                        "&:not([data-disabled]):hover": {
                                            background:
                                                theme.colorScheme === "dark"
                                                    ? `${theme.colors.gray[8]} !important`
                                                    : `${theme.colors.gray[1]} !important`,
                                        },
                                    })}> <FaEye  size={20} style={{color: darkGray}}/> </Button>
                                </Tooltip>
                            ) : badgeStatus === "False" ? (
                                    <Tooltip label={"Show"} withArrow>
                                        <Button onClick={(e) => {
                                            e.stopPropagation();
                                            handleActive();
                                        }}
                                                color="gray"
                                                variant="subtle"
                                                compact sx={(theme) => ({
                                            "&:not([data-disabled]):hover": {
                                                background:
                                                    theme.colorScheme === "dark"
                                                        ? `${theme.colors.gray[8]} !important`
                                                        : `${theme.colors.gray[1]} !important`,
                                            },
                                        })}> <FaEyeSlash   size={20} style={{color: darkGray}}/> </Button>
                                    </Tooltip>
                            ) : router.pathname.includes("/myList") && draftStatus!=="draft"&&
                                <Tooltip label={"Hide"} withArrow>
                                    <Button onClick={(e) => {
                                        e.stopPropagation();
                                        handleInactive();
                                    }}
                                            color="gray"
                                              variant="subtle"
                                              compact sx={(theme) => ({
                                        "&:not([data-disabled]):hover": {
                                            background:
                                                theme.colorScheme === "dark"
                                                    ? `${theme.colors.gray[8]} !important`
                                                    : `${theme.colors.gray[1]} !important`,
                                        },
                                    })}> <FaEye  size={20} style={{color: darkGray}}/> </Button>
                                </Tooltip>}

                            <ShareButton

                                showText={true}
                                url={
                                    typeof window !== "undefined"
                                        ? window.location.origin +
                                        `/${
                                            is_requested
                                                ? "tasks"
                                                : "services"
                                        }/${id}`
                                        : ""
                                }
                                size={"lg"}
                            />
                            {is_user ? (
                                <EditButton


                                    showText={true}
                                    onClick={() => {
                                        router.push({
                                            pathname: "/post/entity",
                                            query: {
                                                is_requested: is_requested,
                                                id: id,
                                            },
                                        });
                                    }}
                                />
                            ) : isLoggedIn() && id ? (
                                <SaveIcon
                                    showText={true}
                                    model="entityservice"
                                    object_id={id}
                                    filled={is_bookmarked}
                                    size={"lg"}
                                />
                            ) : (
                                ""
                            )}
                        </Flex>
                    )}

                </Box>
            </Flex>
        </Box>
    );
};
