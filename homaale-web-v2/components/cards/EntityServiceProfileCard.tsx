import {Avatar, Box, Button, Flex, Text, Title, useMantineTheme} from "@mantine/core";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {AxiosError} from "axios";
import {Form, Formik} from "formik";
import Image from "next/image";
import {useRouter} from "next/router";
import {Dispatch, SetStateAction, useEffect, useState} from "react";

import {TASK_STATUS} from "@/constants/TASK_STATUS";
import urls from "@/constants/urls";
import {useUser} from "@/hooks/useUser";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useEntityServiceProfileStyles} from "@/styles/components/EntityServiceProfileCardStyles";
import type {BookingPayload} from "@/types/booking/BookingPayload";
import type {BookingProps} from "@/types/booking/BookingProps";
import type {TaskBookDetailProps} from "@/types/booking/TaskBookDetailProps";
import type {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
import {axiosClient} from "@/utils/axiosClient";

import {ApplyModal} from "../booking/ApplyModal";
import {BookingModal} from "../booking/BookingModal";
import {CancelModal} from "../common/CancelModal";
import FormButton from "../common/form/FormButton";
import NumberField from "../common/form/NumberField";
import TaskArchiveModal from "../common/TaskArchiveModal";
import {toast} from "../common/Toast";
import {ReviewModal} from "../ReviewModal";
import CurrencyFormatter from "@/components/CurrencyNumberFormatter/NumberFormatter";
import NumberFormatter from "@/components/CurrencyNumberFormatter/NumberFormatter";
import {boolean, string} from "yup";
import {isLoggedIn} from "@/utils/helpers";
import { useCurrency } from "@/currency/CurrencyContext";
import ConvertAndFormat from "../CurrencyNumberFormatter/ConvertAndFormat";

const EntityServiceProfileCard = ({
                                      scrollIntoView,
                                      entityDetail,
                                      bookingDetail,
                                      boxDetail,
                                      is_user,
                                      FirstModal,
                                      isModelOpen,
                                      setIsModelOpen,
                                      onClick,
                                      disabled,
                                      bookingCount,
                                  }: {
    scrollIntoView?: () => void,
    bookingDetail?: TaskBookDetailProps,
    entityDetail?: EntityServiceDetailProps | null,
    boxDetail?: BookingProps["result"][0],
    is_user?: boolean,
    FirstModal?: {
        start_time: string;
        end_time: string;
        end_date: string | null;
    },
    isModelOpen: boolean,
    setIsModelOpen: Dispatch<SetStateAction<boolean>>,
    onClick?: () => void,
    disabled?: boolean,
    bookingCount?: number
}) => {
    const {classes} = useEntityServiceProfileStyles();
    const theme = useMantineTheme();
    const queryClient = useQueryClient();

    const [negotiate, setNegotiate] = useState(false);
    const {
        created_by: {
            full_name,
            badge,
            designation,
            profile_image,
            id: userId,
        } = {},
        budget_from,
        budget_to,
        budget_type,
    } = entityDetail ??
    bookingDetail?.entity_service ??
    boxDetail?.entity_service ??
    ({} as EntityServiceDetailProps & TaskBookDetailProps);

    // console.log('paya budget_to', budget_to)
    // console.log("paya budget_from", budget_from)

    const {description, id, currency, title} =
    entityDetail ??
    bookingDetail ??
    boxDetail?.entity_service ??
    ({} as EntityServiceDetailProps);

    const {status, price, earning} =
    bookingDetail ?? boxDetail ?? ({} as TaskBookDetailProps);
    // console.log('price ', price)
    // console.log('earning', earning)

    const {

        is_requested,
        service,
        is_negotiable,
        event,
        count,
        created_by,
        is_range,
        payable_from,
        payable_to,
        is_bookable,
        location,
        is_online,
        city,
    } = entityDetail ?? ({} as EntityServiceDetailProps);
    // console.log("from the entity service card", FirstModal)
    // console.log('payable_from', payable_from)
    // console.log('payable_to', payable_to)
    const {is_requested: box_requested} = boxDetail?.entity_service ?? {};

    const {assignee, assigner, is_rated, booking} =
    bookingDetail ?? ({} as TaskBookDetailProps);
    const {is_accepted, id: booking_id} =
    boxDetail ?? ({} as BookingProps["result"][0]);

    const {mutate: negotiatePrice, isLoading} = useMutation<
        any,
        Error,
        Pick<BookingPayload, "price">
    >(async (payload) => {
        await axiosClient.put<BookingPayload>(
            `${urls.booking.negotiate}${booking_id}/`,
            payload
        );
    });

    const [bookingModel, setBookingModel] = useState(false);
    const [applyModel, setApplyModel] = useState(false);
    const [reviewModal, setReviewModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [taskArchiveModal, setTaskArchiveModal] = useState(false);
     const [exchangeInfo, setExchangeInfo] = useState<number>(89.0);
    const {globalCurrency} = useCurrency();

    const {data: userData} = useUser();

    const {checkStatus} = useUserStatus();

    const is_not_owner = userData?.id
        ? assignee?.id === userData?.id
            ? true
            : false
        : false;

    const is_myBooking = userData?.id
        ? assignee?.id === userData?.id
            ? false
            : true
        : false;

    const {mutate} = useMutation<
        any,
        AxiosError<{ message: string }>,
        {
            task: string;
            status: string;
        }
    >(async (payload) => {
        const {data} = await axiosClient.post(urls.entity.status, payload);
        return data;
    });

    const router = useRouter();

    const handleStatusChange = (status: string) => {
        if (checkStatus("kyc")) {
            mutate(
                {task: id ? id : "", status: status},
                {
                    onSuccess: (data) => {
                        toast.success(data.message);
                        queryClient.invalidateQueries(["booking-detail", id]);
                        if (
                            status === TASK_STATUS.Closed ||
                            status === TASK_STATUS.Completed
                        ) {
                            setReviewModal(true);
                        }
                    },
                    onError: (error) => {
                        toast.error(error.response?.data.message);
                    },
                }
            );
        }
    };
    useEffect(() => {
            const fetchExchangeRate = async () => {
                const exchangeData= await axiosClient.get(`locale/cms/exchangerate`);
                const { result } = exchangeData.data;
                // Extract value and currency code
                const rate = parseFloat(result[0]?.value); // Save only the exchange rate (e.g., 89.0)

                setExchangeInfo(rate);
                console.log('Extracted Exchange Info:', exchangeInfo);

            }
            fetchExchangeRate();
        }),[]


    const handleBookNow = () => {
        if (FirstModal && FirstModal.start_time) {
            // console.log("Selected Slot Data:", FirstModal);

            // Prepare booking data
            const bookingData = {
                budget_from,
                budget_to,
                currency,
                title,
                created_by,
                city: city,
                description: "",
                highlights: [],
                images: [],
                videos: [],
                entity_service: id,
                id: "",
                is_negotiable,
                budget_type,
                service,
                location,
                event,
                payable_from,
                payable_to,
                is_range,
                is_requested,
                is_online,
            };

            const bookingId = id || "Booking"; // Fallback ID
            const pathname = `/bookingform/${bookingId}/details`;

            // Navigate directly to the booking form
            router.push({
                pathname,
                query: {
                    date: FirstModal.end_date || "",
                    start: FirstModal.start_time || "",
                    end: FirstModal.end_time || "",
                    bookingData: JSON.stringify(bookingData),
                },
            });
        } else {
            console.error("No slot data selected.");
            toast.error("You need to select a slot from the calendar.");
        }
    };
    // console.log("from the service card", FirstModal)


    const renderButton = () => {
        if (status) {
            switch (status) {
                case TASK_STATUS.Open:
                    return (
                        <>
                            {is_not_owner ? (
                                <>
                                    <Button
                                        onClick={() =>
                                            handleStatusChange(
                                                TASK_STATUS.On_Progress
                                            )
                                        }
                                        fullWidth
                                    >
                                        Start Task
                                    </Button>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        mt={10}
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Leave Task
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                            background: "#ECF7FF",
                                            padding: "16px",
                                            borderRadius: 4,
                                            fontWeight: 400,
                                            fontSize: 10,
                                            color: theme.colors.gray[7],
                                        }}
                                    >
                                        Waiting for the tasker to start the
                                        task.
                                    </p>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        mt={10}
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Cancel Task
                                    </Button>
                                </>
                            )}
                        </>
                    );
                case TASK_STATUS.Cancelled:
                    return (
                        <Button color="red" fullWidth>
                            Cancelled
                        </Button>
                    );
                case TASK_STATUS.Closed:
                    return (
                        <>
                            {is_not_owner ? (
                                <>
                                    <p
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                            background: "#ECF7FF",
                                            padding: "16px",
                                            borderRadius: 4,
                                            fontWeight: 400,
                                            fontSize: 10,
                                            color: theme.colors.gray[7],
                                        }}
                                    >
                                        You have successfully completed your
                                        task.
                                    </p>
                                    {!is_rated && (
                                        <p
                                            onClick={() =>
                                                checkStatus("kyc")
                                                    ? setReviewModal(true)
                                                    : setReviewModal(false)
                                            }
                                            className={classes.review}
                                        >
                                            Review Task.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                            background: "#ECF7FF",
                                            padding: "16px",
                                            borderRadius: 4,
                                            fontWeight: 400,
                                            fontSize: 10,
                                            color: theme.colors.gray[7],
                                        }}
                                    >
                                        Your task is completed.
                                    </p>
                                    {!is_rated && (
                                        <p
                                            onClick={() =>
                                                checkStatus("kyc")
                                                    ? setReviewModal(true)
                                                    : setReviewModal(false)
                                            }
                                            className={classes.review}
                                        >
                                            Review Task.
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    );
                case TASK_STATUS.Pending:
                    return (
                        <>
                            {!is_accepted ? (
                                <>
                                    <p
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                            background: "#ECF7FF",
                                            padding: "16px",
                                            borderRadius: 4,
                                            fontWeight: 400,
                                            fontSize: 10,
                                            color: theme.colors.gray[7],
                                        }}
                                    >
                                        Waiting for the client approval.
                                    </p>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        mt={10}
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Cancel Booking
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {!negotiate && (
                                        <Button
                                            fullWidth
                                            onClick={() => setNegotiate(true)}
                                        >
                                            Negotiate
                                        </Button>
                                    )}

                                    {negotiate && (
                                        <Formik
                                            initialValues={{
                                                price: parseInt(
                                                    box_requested
                                                        ? earning
                                                        : price
                                                ),
                                            }}
                                            onSubmit={(
                                                value: Pick<
                                                    BookingPayload,
                                                    "price"
                                                >
                                            ) =>
                                                negotiatePrice(value, {
                                                    onSuccess: () => {
                                                        queryClient.invalidateQueries(
                                                            ["booking-detail"]
                                                        );
                                                        toast.success(
                                                            "Price updated"
                                                        );
                                                        setNegotiate(false);
                                                    },
                                                    onError: () => {
                                                        toast.error(
                                                            "cannot update price"
                                                        );
                                                    },
                                                })
                                            }
                                        >
                                            {({values}) => (
                                                <Form>
                                                    <NumberField
                                                        id="price"
                                                        name={"price"}
                                                        placeholder="Enter Price"
                                                        withAsterisk
                                                    />
                                                    <FormButton
                                                        isSubmitting={isLoading}
                                                        disabled={!values.price}
                                                        type="submit"
                                                        fullWidth
                                                        name={"Update price"}
                                                        id={"negotiaite"}
                                                    />
                                                </Form>
                                            )}
                                        </Formik>
                                    )}
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        mt={10}
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Cancel Booking
                                    </Button>
                                </>
                            )}
                        </>
                    );
                case TASK_STATUS.Completed:
                    return (
                        <>
                            {is_not_owner ? (
                                <>
                                    <p
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                            background: "#ECF7FF",
                                            padding: "16px",
                                            borderRadius: 4,
                                            fontWeight: 400,
                                            fontSize: 10,
                                            color: theme.colors.gray[7],
                                        }}
                                    >
                                        Wait for the client to approve.
                                    </p>
                                    {!is_rated && (
                                        <p
                                            onClick={() =>
                                                checkStatus("kyc")
                                                    ? setReviewModal(true)
                                                    : setReviewModal(false)
                                            }
                                            className={classes.review}
                                        >
                                            Review Task.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <Button
                                    color="teal"
                                    onClick={() =>
                                        handleStatusChange(TASK_STATUS.Closed)
                                    }
                                    fullWidth
                                >
                                    Close Task
                                </Button>
                            )}
                        </>
                    );
                case TASK_STATUS.Initiated:
                    return (
                        <>
                            {is_not_owner ? (
                                <>
                                    <Button
                                        color="teal"
                                        disabled
                                        fullWidth
                                        mb={10}
                                    >
                                        Payment Pending
                                    </Button>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Leave Task
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="blue"
                                        onClick={() => router.push("/box")}
                                        fullWidth
                                        mb={10}
                                    >
                                        Proceed To Orders
                                    </Button>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Cancel Booking
                                    </Button>
                                </>
                            )}
                        </>
                    );
                case TASK_STATUS.On_Progress:
                    return (
                        <>
                            {is_not_owner ? (
                                <>
                                    <Button
                                        color="green"
                                        onClick={() =>
                                            handleStatusChange(
                                                TASK_STATUS.Completed
                                            )
                                        }
                                        fullWidth
                                    >
                                        Mark as Complete
                                    </Button>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        mt={10}
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Leave Task
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-around",
                                            background: "#ECF7FF",
                                            padding: "16px",
                                            borderRadius: 4,
                                            fontWeight: 400,
                                            fontSize: 12,
                                            color: theme.colors.gray[7],
                                        }}
                                    >
                                        Your task is in progress.
                                    </p>
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        mt={10}
                                        onClick={() => setCancelModal(true)}
                                        fullWidth
                                    >
                                        Cancel Task
                                    </Button>
                                </>
                            )}
                        </>
                    );
                default:
                    return (
                        <Button color="teal" fullWidth>
                            Awaiting Approval
                        </Button>
                    );
            }
        } else if (is_user && !disabled && scrollIntoView) {
            return (
                <Box
                    sx={{
                        textAlign: "center",
                        background: count ? "none" : "#ECF7FF",
                        padding: "16px",
                        borderRadius: 4,
                        fontWeight: 400,
                        fontSize: 12,
                        color: theme.colors.status[0],
                    }}
                >
                    {count ? (
                        <>
                            <Button
                                fullWidth
                                color="blue"
                                onClick={() => scrollIntoView()}
                            >
                                View Applicants
                            </Button>
                        </>
                    ) : (
                        <p
                            style={{
                                fontSize: 12,
                                fontWeight: 400,
                                color: theme.colors.gray[7],
                                marginBottom: 8,
                            }}
                        >
                            No Applicants
                        </p>
                    )}
                    {}
                </Box>
            );
        } else {
            return (
                <>
                    {is_bookable ? (
                        <>
                        <Button
                            color="teal"
                            onClick={() => {
                                if (disabled) return;
                                if (checkStatus("kyc")) {
                                    if (is_requested) {
                                        setApplyModel(true);
                                    } else if (FirstModal && FirstModal.start_time) {
                                        // setIsModelOpen(true); // Open the BookingModal using parent state
                                        handleBookNow()
                                    } else {
                                        toast.error("you need to select slot from calendar")
                                        console.error("No time slot selected.");
                                    }
                                }
                            }}
                            fullWidth
                            className={`${disabled && 'cursor-not-allowed'}`}
                        >
                            {is_requested ? "Apply Now" : "Book Now"}
                        </Button>
                            {isLoggedIn() && Number(bookingCount) > 0 && (
                                <span className="text-xs text-red-400 mt-2 items-center">
            You have already booked this {bookingCount} times.
          </span>
                            )}
                        </>
                    ) : (
                        <Box
                            sx={{
                                textAlign: "center",
                                background: "#ECF7FF",
                                padding: "16px",
                                borderRadius: 4,
                                fontWeight: 400,
                                fontSize: 12,
                                color: theme.colors.status[0],
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 12,
                                    fontWeight: 400,
                                    color: theme.colors.gray[7],
                                    marginBottom: 8,
                                }}
                            >
                                You cannot {is_requested ? "apply" : "book"}{" "}
                                this {is_requested ? "task" : "service"} more
                                than 3 times
                            </p>
                        </Box>
                    )}
                </>
            );
        }
    };

    return (
        <div className={classes.wrapper}>
            {/*<Flex className={classes.userDetails}>*/}
            {/*    <Flex*/}
            {/*        gap="sm"*/}
            {/*        justify="space-between"*/}
            {/*        align="flex-start"*/}
            {/*        direction="row"*/}
            {/*        className="userDetail__name"*/}
            {/*        onClick={() =>*/}
            {/*            router.push(*/}
            {/*                is_user*/}
            {/*                    ? `/profile`*/}
            {/*                    : `/tasker/${*/}
            {/*                        is_not_owner ? assigner?.id : userId*/}
            {/*                    }`*/}
            {/*            )*/}
            {/*        }*/}
            {/*    >*/}
            {/*        {is_not_owner ? (*/}
            {/*            <Image*/}
            {/*                src={*/}
            {/*                    assigner?.profile_image ??*/}
            {/*                    "/images/logo/homaale-favicon.png"*/}
            {/*                }*/}
            {/*                height={48}*/}
            {/*                width={48}*/}
            {/*                style={{borderRadius: "50%"}}*/}
            {/*                alt="serviceprovider-image"*/}
            {/*            />*/}
            {/*        ) : (*/}
            {/*            <Image*/}
            {/*                src={*/}
            {/*                    profile_image ??*/}
            {/*                    "/images/logo/homaale-favicon.png"*/}
            {/*                }*/}
            {/*                height={48}*/}
            {/*                width={48}*/}
            {/*                style={{borderRadius: "50%"}}*/}
            {/*                alt="serviceprovider-image"*/}
            {/*            />*/}
            {/*        )}*/}
            {/*        <div className="flex flex-row justify-between">*/}
            {/*            <div>*/}
            {/*                <Title className="username" size={16}>*/}
            {/*                    {is_not_owner ? assigner?.full_name : full_name}*/}
            {/*                </Title>*/}
            {/*                <Text*/}
            {/*                    size={14}*/}
            {/*                    color={*/}
            {/*                        theme.colorScheme === "dark"*/}
            {/*                            ? "dark.0"*/}
            {/*                            : "gray.7"*/}
            {/*                    }*/}
            {/*                >*/}
            {/*                    {is_not_owner ? assigner?.designation : designation}*/}
            {/*                </Text>*/}
            {/*            </div>*/}

            {/*        </div>*/}
            {/*        <div className="flex items-center"*/}
            {/*        // style={{*/}
            {/*        //     height:"100px",*/}
            {/*        //     position:"relative",*/}
            {/*        //     left:"80px",*/}
            {/*        //     top:"-20px"*/}
            {/*        //*/}
            {/*        // }}*/}
            {/*        >*/}
            {/*            <img*/}
            {/*                src={badge?.image ?? "/images/logo/homaaleBadge.svg"}*/}
            {/*                alt="serviceprovider-image"*/}
            {/*                // style={{ objectFit:"cover", background:""}}*/}
            {/*                // className="w-[300px] h-[300px] object-cover"*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    </Flex>*/}
            {/*    <div>*/}

            {/*    </div>*/}
            {/*</Flex>*/}

            <Flex className={classes.userDetails}>
                <Flex
                    gap="sm"
                    justify="space-between"
                    align="center"
                    direction="row"
                    className="userDetail__name"
                    onClick={() =>
                        router.push(
                            is_user
                                ? `/profile`
                                : `/tasker/${is_not_owner ? assigner?.id : userId}`
                        )
                    }
                    style={{width: "100%"}} // Ensures the Flex stretches horizontally
                >
                    {/* Left Section: Profile Image + Name */}
                    <div className="flex flex-row items-center gap-3">
                        {is_not_owner ? (
                            <Image
                                src={assigner?.profile_image ?? "/images/logo/homaale-favicon.png"}
                                height={48}
                                width={48}
                                style={{borderRadius: "50%"}}
                                alt="serviceprovider-image"
                            />
                        ) : (
                            <Avatar
                                src={profile_image ?? "/images/logo/homaale-favicon.png"}

                                size={40}
                                style={{borderRadius: "50%"}}
                                alt="serviceprovider-image"
                            />
                        )}
                        <div>
                            <Title className="username" size={16}>
                                {is_not_owner ? assigner?.full_name : full_name}
                            </Title>
                            <Text
                                size={14}
                                color={theme.colorScheme === "dark" ? "dark.0" : "gray.7"}
                            >
                                {is_not_owner ? assigner?.designation : designation}
                            </Text>
                        </div>
                    </div>

                    {/* Right Section: Badge Image */}
                    <div className="flex items-center">

                        <img
                            src={badge?.image ?? "/images/logo/png-batch-homaale.png"}
                            alt="serviceprovider-image"
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                </Flex>
            </Flex>


            <Flex align="center" className={classes.budget} m="24px 0" p="8px">
                <Text
                    component="p"
                    color={
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[3]
                            : theme.colors.homaaleSlate[8]
                    }
                    size={12}
                >
                    Budget <br/>
                    <Text
                        component="span"
                        color={theme.colors.homaaleSlate[5]}
                        size={10}
                        mt={6}
                    >
                        {is_negotiable ? "(Negotiable)" : "(Fixed)"}
                    </Text>

                </Text>


                {/*<div className="price-wrapper">*/}
                {/*    {!booking ? (*/}
                {/*        is_user ? (*/}
                {/*            <p className="price">*/}

                {/*                {is_range && (*/}
                {/*                    <>*/}
                {/*                        {currency?.symbol}{" "}*/}
                {/*                        <NumberFormatter*/}
                {/*                            number={parseFloat(is_requested ? payable_from : budget_from)}*/}
                {/*                            symbol={currency?.symbol}*/}
                {/*                        />*/}
                {/*                        {" - " }*/}
                {/*                    </>*/}
                {/*                )}*/}
                {/*                {currency?.symbol}{" "}*/}
                {/*                <NumberFormatter*/}
                {/*                    number={parseFloat(is_requested ? payable_to : budget_to)}*/}
                {/*                    symbol={currency?.symbol}*/}
                {/*                />*/}
                {/*            </p>*/}
                {/*        ) : (*/}
                {/*            <p className="price">*/}
                {/*                {is_range && (*/}
                {/*                    <>*/}
                {/*                        {currency?.symbol}{" "}*/}
                {/*                        <NumberFormatter*/}
                {/*                            number={parseFloat(is_requested ? budget_from : payable_from)}*/}
                {/*                            symbol={currency?.symbol}*/}
                {/*                        />*/}
                {/*                        {" - "}*/}
                {/*                    </>*/}
                {/*                )}*/}
                {/*                {currency?.symbol}{" "}*/}
                {/*                <NumberFormatter*/}
                {/*                    number={*/}
                {/*                        box_requested*/}
                {/*                            ? parseFloat(earning)*/}
                {/*                            : parseFloat(price || "0") || parseFloat(budget_to || "0") || parseFloat(payable_to || "0")*/}
                {/*                    }*/}
                {/*                    symbol={currency?.symbol}*/}
                {/*                />*/}

                {/*            </p>*/}
                {/*        )*/}
                {/*    ) : (*/}
                {/*        <p className="price">*/}
                {/*            {currency?.symbol}{" "}*/}

                {/*            <NumberFormatter*/}
                {/*                number={parseFloat(is_myBooking ? price : earning)}*/}
                {/*                symbol={currency?.symbol}*/}
                {/*            />*/}

                {/*        </p>*/}
                {/*    )}*/}
                {/*    <p className="project-type">per {budget_type}</p>*/}
                {/*</div>*/}


                <div className="price-wrapper">
                    {!booking ? (
                        is_user ? (
                            <p className="price">
                                {is_range ? (
                                    <>
                                        {/*{currency?.symbol}{" "}*/}
                                        {!disabled ?
                                            (<>
                                                <ConvertAndFormat

                                                    number={parseFloat(is_requested ? payable_from : budget_from)}
                                                    currency={currency?.code}
                                                    exchangeRate={exchangeInfo}
                                                    globalCurrency={globalCurrency}
                                                />
                                                {" - "}
                                            </>) :

                                            (
                                                <>
                                                    <ConvertAndFormat

                                                        number={parseFloat(is_requested ? budget_from : payable_from)}
                                                        currency={currency?.code}
                                                        exchangeRate={exchangeInfo}
                                                        globalCurrency={globalCurrency}
                                                    />
                                                    {" - "}

                                                </>)
                                        }

                                    </>
                                ) : (
                                    ""
                                )}
                                {/* {" "}{currency?.symbol}{" "} */}
                                {!disabled ?
                                    <ConvertAndFormat

                                        number={parseFloat(is_requested ? payable_to : budget_to)}

                                       currency={currency?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                    />
                                    : <>
                                        <ConvertAndFormat

                                            number={parseFloat(is_requested ? budget_to : payable_to)}

                                            currency={currency?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                        />

                                    </>
                                }
                            </p>
                        ) : (
                            <p className="price">
                                {is_range ? (
                                    <>
                                        {/* {currency?.symbol}{" "} */}
                                        <ConvertAndFormat
                                                number={is_requested
                                                    ? budget_from
                                                    : payable_from}
                                                currency={currency?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                        />{" "}
                                        -
                                    </>
                                ) : (
                                    ""
                                )}

                                {/* {currency?.symbol}{" "} */}

                                {is_requested ?  <ConvertAndFormat
                                        number={box_requested
                                            ? parseFloat(earning)
                                            : parseFloat(price || "0") || parseFloat(budget_to || "0") || parseFloat(payable_to || "0")}
                                        currency={currency.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                />
                                        :
                                         <ConvertAndFormat
                                            number={box_requested
                                                ? parseFloat(earning)
                                                : parseFloat(price || "0") || parseFloat(payable_to || "0") || parseFloat(budget_to || "0")}
                                            currency={currency?.code??"NPR"} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                />}

                            </p>
                        )
                    ) : (
                        <p className="price">
                            <ConvertAndFormat
                                    number={is_myBooking
                                        ? price
                                        : earning}
                                    currency={currency.code??"NPR"} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                            />
                        </p>
                    )}
                    <p className="project-type">per {budget_type}</p>


                </div>


            </Flex>

            <div style={{display: "flex", justifySelf: "flex-end"}}>
                {is_user && !disabled &&
                    <Flex gap={30}>
                        <div className="text-xs mb-0.5">
                            (Price will be posted at approximately)
                        </div>
                        {"  "}

                        <p className="price">
                            {is_range ? (
                                <>
                                    {/* {currency?.symbol}{" "} */}
                                    {

                                        (
                                            <>
                                                <ConvertAndFormat

                                                    number={parseFloat(is_requested ? budget_from : payable_from)}
                                                    currency={currency?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                                />
                                                {" - "}

                                            </>)
                                    }

                                </>
                            ) : (
                                ""
                            )}
                            {/* {" "}{currency?.symbol}{" "} */}
                            {<>
                                <ConvertAndFormat

                                    number={parseFloat(is_requested ? budget_to : payable_to)}

                                    currency={currency?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}                                />

                            </>
                            }
                        </p>
                    </Flex>}

            </div>
            <hr/>

            <div className={classes.buttonArea}>{renderButton()}</div>
            {(
                <Box
                    style={{
                        visibility: "hidden"
                    }}>


                    <BookingModal

                        FirstModal={{
                            start_time: FirstModal?.start_time ?? "",
                            end_date: FirstModal?.end_date ?? "",
                            end_time: FirstModal?.end_time ?? ""
                        }}
                        opened={isModelOpen}
                        setOpened={setIsModelOpen}
                        bookingData={{
                            budget_from,
                            budget_to,
                            currency,
                            title,
                            created_by,
                            city: city,
                            description: "",
                            highlights: [],
                            images: [],
                            videos: [],
                            entity_service: id,
                            id: "",
                            is_negotiable,
                            budget_type,
                            service,
                            location,
                            event,
                            payable_from,
                            payable_to,
                            is_range,
                            is_requested,
                            is_online,

                        }}
                    />
                </Box>
            )}
            {applyModel && (

                <ApplyModal
                    opened={applyModel}
                    setOpened={setApplyModel}
                    bookingData={{
                        budget_from,
                        budget_to,
                        currency,
                        created_by,
                        city: city,
                        title,
                        description: "",
                        highlights: [],
                        images: [],
                        videos: [],
                        entity_service: "",
                        id: "",
                        is_negotiable,
                        budget_type,
                        service,
                        location,
                        event,
                        payable_from,
                        payable_to,
                        is_range,
                        is_requested,
                        is_online,
                    }}
                    description={description}
                />
            )}
            {reviewModal && status && (
                <ReviewModal
                    opened={reviewModal}
                    setOpened={setReviewModal}
                    status={status}
                    setTaskArchiveModal={setTaskArchiveModal}
                />
            )}

            {cancelModal && (
                <CancelModal
                    is_client={boxDetail ? is_not_owner : !is_not_owner}
                    state={
                        status === TASK_STATUS.Pending
                            ? "beforeApprove"
                            : "afterApprove"
                    }
                    id={booking ?? booking_id}
                    opened={cancelModal}
                    setOpened={setCancelModal}
                />
            )}

            {taskArchiveModal && (
                <TaskArchiveModal
                    opened={taskArchiveModal}
                    setOpened={setTaskArchiveModal}
                    serviceId={bookingDetail?.entity_service?.id ?? ""}
                />
            )}
        </div>
    );
};

export default EntityServiceProfileCard;
