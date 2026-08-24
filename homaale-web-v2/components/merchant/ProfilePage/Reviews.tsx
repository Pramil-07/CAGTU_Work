import React, {useEffect, useState} from "react";
import "tailwindcss/tailwind.css";
import {Box, Button, Menu, Select, Textarea, TextInput, useMantineTheme} from "@mantine/core";
import {FaStar} from "react-icons/fa";
import {useMediaQuery} from "@mantine/hooks";
import {useDark} from "@/utils/helpers";
import {FiEdit, FiTrash2} from "react-icons/fi";
import {isLoggedIn} from "@/utils/helpers";
import {useProfile} from "@/hooks/useProfile";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import axios from "axios";
import {notifications} from "@mantine/notifications";
import {Check, X} from 'lucide-react';
import {useUser} from "@/hooks/useUser";
import type {ReviewProps} from "@/types/ReviewProps";
import SkeletonReview from "@/components/skeletons/SkeletonReview";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {formatDistanceToNow} from "date-fns";
import {ActionIcon, Flex, Text} from "@mantine/core";
import {IconArrowsSort, IconSend} from "@tabler/icons-react";
import {Formik, Form} from "formik";
import InputField from "@/components/common/form/InputField";
import {C} from "@fullcalendar/core/internal-common";
import {SORTING_DATA_REVIEW} from "@/constants/SortingData";

interface Review {

    // created_at: string; // ISO date string
    // entity_service: string;
    reviewData?: ReviewProps
    id: number;

    // is_requested: boolean; // changed to boolean instead of string
    // is_verified: boolean;
    rated_by: {
        id: string;
        full_name: string;
        email: string;
        // phone: string | null;
        // profile_image: string | null;
        // username: string;
    };
    product?: string
    rated_to: {
        id: string;
        full_name: string;
        email: string;
        // profile_image?: string;
    };
    created_at: string;
    ratedby_profile: string;
    rating: number;
    review: string;
    reply: string;
    replied_date: number | string;
    rated_by_full_name?: string
    ratedby_image?: string

}

// interface reply{
//     reviewData:ReviewProps
// }
export const StarRating: React.FC<{ rating: number; setRating: (value: number) => void; size: number }> = ({
                                                                                                               rating,
                                                                                                               setRating,
                                                                                                               size,
                                                                                                           }) => {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <button
                    type="button"
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none"
                >
                    <FaStar size={size} color={i < rating ? "#FFCA6A" : "#CED4DA"}/>
                </button>
            ))}
        </div>
    );
};

export const ReviewCard: React.FC<{
    item: Review;
    onEdit: (review: Review) => void;
    currentUserId?: string;
    canModify: any;
    created_date: string;
    fetchReviews: () => void;
    isProduct?: boolean

    isOwner: boolean;
}> = ({item, onEdit, canModify, created_date, fetchReviews, isOwner, isProduct}) => {
    const user = useUser();
    const is_user = user.data?.id === item.rated_by?.id; // Check if current user is the reviewer
    const theme = useMantineTheme();
    const [replay, setReplay] = useState(false); // Toggle reply form
    const queryClient = useQueryClient();

    const {mutate, isLoading} = useMutation<any, Error, string>(
        async (payload) => {
            const response = await axiosClient.patch<string>(
                `${urls.merchantRating.actionReview}${item.id}/`,
                {
                    reply: payload,
                }
            );
            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["reviews"]); // Invalidate reviews query to refresh data
                notifications.show({
                    title: "Success",
                    message: "Reply Added",
                    color: "green",
                    icon: <Check className="w-4 h-4"/>,
                    autoClose: 3000,
                    style: {
                        position: 'fixed',
                        top: '60px',
                        right: "20px",
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                });
                setReplay(false);
                fetchReviews();
            },
            onError: () => {
                notifications.show({
                    title: "Error",
                    message: "Post Reply Failed",
                    color: "red",
                    icon: <X className="w-4 h-4"/>,
                    autoClose: 3000,
                    style: {
                        position: 'fixed',
                        top: '60px',
                        right: "20px",
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                });
            },
        }
    );

    const calculateTimeDifference = (date: string | number) => {
        return formatDistanceToNow(new Date(date), {addSuffix: true});
    };
    // console.log("full name",item.rated_by.full_name)

    return (
        <div className="flex gap-6 items-start mt-4 max-w-full">
            <div className="flex flex-col w-full">
                <div className="flex gap-6 w-full text-sm max-md:max-w-full">
                    <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
                        <img
                            loading="eager"
                            src={isProduct ? item.ratedby_profile : item.ratedby_image || "/images/placeholder/personPlaceholder.jpg"}
                            alt={`${item.rated_by?.full_name}'s avatar`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex gap-5">
                            <div>{isProduct ? item.rated_by_full_name : item.rated_by.full_name}</div>
                            <StarRating
                                size={15}
                                rating={item.rating}
                                setRating={function (): void {
                                    throw new Error("Function not implemented.");
                                }}
                            />
                            <div className="text-xs text-zinc-600">{Math.round(item.rating)}</div>
                        </div>
                        <p className="mt-2 text-neutral-400 break-words max-w-full ">{item.review}</p>
                        <div className="mt-2 text-[#495057]">
                            {created_date && calculateTimeDifference(created_date)}
                        </div>

                        {!item.reply && !is_user && isOwner && (
                            <Text
                                component="span"
                                ml="auto"
                                mr={10}
                                color={replay ? theme.colors.brand[3] : theme.colors.gray[7]}
                                onClick={() => setReplay(!replay)}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                        color: theme.colors.brand[3],
                                        transition: "0.3s all ease",
                                    },
                                }}
                            >
                                Reply
                            </Text>
                        )}

                        {replay && !item.reply && (
                            <Flex
                                justify="flex-start"
                                align="flex-start"
                                gap={24}
                                mb={16}
                                mt={12}
                                w="100%"
                            >
                                <img
                                    src="/images/placeholder/personPlaceholder.jpg"
                                    alt={`${item.rated_to?.full_name}'s avatar`}
                                    className="w-10 h-10 object-cover rounded-full"
                                />
                                <Formik
                                    initialValues={{reply: ""}}
                                    onSubmit={(values) => {
                                        if (values.reply.trim()) {
                                            mutate(values.reply);
                                        }
                                    }}
                                >
                                    {({values, handleChange, submitForm, isSubmitting}) => (
                                        <Form style={{display: "flex", alignItems: "center", width: "100%"}}>
                                            <InputField
                                                name="reply"
                                                marginIgnore
                                                placeholder="Write a reply..."
                                                value={values.reply}
                                                onChange={handleChange}
                                                w="100%"
                                            />
                                            <ActionIcon
                                                type="submit"
                                                right={40}
                                                size="lg"
                                                loading={isLoading || isSubmitting}
                                                onClick={submitForm}
                                                disabled={isLoading || isSubmitting || !values.reply.trim()}
                                            >
                                                <IconSend/>
                                            </ActionIcon>
                                        </Form>
                                    )}
                                </Formik>
                            </Flex>
                        )}

                        {item.reply && (
                            <div className="flex gap-6 items-start mt-4">
                                <div className="w-10 h-10 flex text-zinc-600 rounded-full overflow-hidden">
                                    <img
                                        loading="eager"
                                        src={"/images/placeholder/personPlaceholder.jpg"}
                                        alt={`${item.rated_to?.full_name}'s avatar`}
                                        className="w-10 h-10 object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">
                                        {item.rated_to?.full_name || "Merchant"}
                                    </div>
                                    <p className="mt-1 text-neutral-400">{item.reply}</p>
                                    <div className="mt-1 text-[#495057] text-sm">
                                        {item.replied_date && calculateTimeDifference(item.replied_date)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Reviews = ({merchantId, is_product, productId, is_purchased}: {
    merchantId: any,
    is_product?: boolean,
    productId?: string,
    is_purchased?: boolean
}) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
    const [filterByRating, setFilterByRating] = useState<string | null>(null);
    const [filterByName, setFilterByName] = useState<string>("");
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [newRating, setNewRating] = useState<number>(0);
    const [newFeedback, setNewFeedback] = useState<string>("");
    const [sort, setSort] = useState<string>("");
    const [averageRating, setAverageRating] = useState<number>(0);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [editRating, setEditRating] = useState<number>(0);
    const [editFeedback, setEditFeedback] = useState<string>("");
    const [hasExistingReview, setHasExistingReview] = useState<boolean>(false);
    const isSmallScreen = useMediaQuery("(max-width: 1000px)");
    const theme = useMantineTheme()
    const dark = useDark()
    const {data: profileData} = useProfile(); // Fetch profile data
    const currentUserId = profileData?.user?.id;
    const isOwner = currentUserId === merchantId;

    const canModifyReview = (review: Review) => {


        if (!currentUserId || !review.rated_by) return false;

        // Extract ID: string if rated_by is string, or rated_by.id if object
        const ratedById = typeof review.rated_by === "string" ? review.rated_by : review.rated_by.id;

        return ratedById === currentUserId;
    };
    // console.log("product review ", reviews)
    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: "Success",
            message,
            color: 'green',
            icon: <Check className="w-4 h-4"/>,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };
    console.log("merchant id from review",merchantId)

    const showErrorNotification = (message: string) => {
        notifications.show({
            title: "Error",
            message,
            color: 'red',
            icon: <X className="w-4 h-4"/>,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };
    // console.log("is Purchased",is_purchased)

    useEffect(() => {
        if (profileData?.user?.id && reviews.length > 0) {
            const existingReview = reviews.find(
                review => review.rated_by?.id === profileData.user?.id
            );
            setHasExistingReview(!!existingReview);
        }
    }, [reviews, profileData?.user?.id]);

    // console.log("hasexisting review",hasExistingReview)


    useEffect(() => {
        if (reviews.length > 0) {
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            const average = total / reviews.length;
            setAverageRating(Number(average.toFixed(1)));
        } else {
            setAverageRating(0);
        }
    }, [reviews]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(is_product ? `/task/rating/product/${productId}/` : `${urls.merchantRating.reviewList}${merchantId}/`);
            if (response.data && Array.isArray(response.data.data)) {
                setReviews(response.data.data);
            } else {
                setReviews([]);
            }
        } catch (error) {
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };
    // console.log("from merchant", reviews)

    useEffect(() => {
        fetchReviews();
    }, []);


    const handleAddReview = async () => {
        if (hasExistingReview) {
            notifications.show({
                title: <span className="text-red-500">Review Already Exists</span>,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                message: "You have already submitted a review. You can edit your existing review instead of creating a new one.",
            });
            return;
        }

        setLoading(true);

        try {
            const reviewData = {
                rating: newRating,
                review: newFeedback,
                rated_by: profileData?.user?.id,
                rated_to: merchantId,
            };
            const response = await axiosClient.post(`${urls.merchantRating.createReview}`, reviewData);
            if (response.data) {
                setReviews((prevReviews) => [response.data, ...prevReviews]);
                setNewRating(1);
                setNewFeedback("");
                showSuccessNotification("Review was successfully submitted");
                // handleAddReview();
            }
        } catch (error) {
            showErrorNotification("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
        fetchReviews();

    };
    const handleAddProductReview = async () => {
        if (hasExistingReview) {
            notifications.show({
                title: <span className="text-red-500">Review Already Exists</span>,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                message: "You have already submitted a review. You can edit your existing review instead of creating a new one.",
            });
            return;
        }

        setLoading(true);

        try {
            const reviewData = {
                rating: newRating,
                review: newFeedback,
                rated_by: profileData?.user?.id,
                rated_to: merchantId,
                product: productId
            };
            const response = await axiosClient.post(`task/rating/product/`, reviewData);
            if (response.data) {
                setReviews((prevReviews) => [response.data, ...prevReviews]);
                setNewRating(1);
                setNewFeedback("");
                showSuccessNotification("Review was successfully submitted");
                // handleAddReview();
            }
        } catch (error) {
            showErrorNotification("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
        fetchReviews();

    };

    const handleDelete = (reviewId: number): React.MouseEventHandler<HTMLButtonElement> => async (e) => {
        // console.log("delete clicked")
        try {
            setLoading(true);
            const response = await axiosClient.delete(`${urls.merchantRating.actionReview}${reviewId}/`,);
            setReviews(reviews.filter(review => review?.id !== reviewId));
            showSuccessNotification("Your review has been successfully deleted.")

        } catch (error) {

            if (axios.isAxiosError(error)) {
                showErrorNotification(error.response?.data?.message || "Failed to delete review. Please try again.");
            }
        } finally {
            setLoading(false);
            // console.log(reviewId)
        }
        fetchReviews();

    };
    const handleEdit = (review: Review) => {
        setEditingReview(review);
        setEditRating(review.rating);
        setEditFeedback(review.review);
    };
    const handleUpdate = async () => {
        if (!editingReview) return;
        setLoading(true);
        try {
            const updateData = {
                rating: editRating,
                review: editFeedback,
                rated_by: editingReview.rated_by?.id,
                rated_to: editingReview.rated_to?.id
            };

            const response = await axiosClient.put(
                `${urls.merchantRating.actionReview}${editingReview.id}/`,
                updateData,
            );

            if (response.data) {
                setReviews(prevReviews =>
                    prevReviews.map(review =>
                        review?.id === editingReview?.id ? response.data : review
                    )
                );

                setEditingReview(null);
                setEditRating(0);
                setEditFeedback("");

                showSuccessNotification("Your review has been successfully updated");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Failed to update review. Please try again.";
                // alert(errorMessage);
                // console.error("Review update error:", error.response?.data);
            } else {
                showErrorNotification("An unexpected error occurred. Please try again.");
                // console.error("Unknown error:", error);
            }
        } finally {
            setLoading(false);
        }
        fetchReviews();

    };
    const handleProductUpdate = async () => {
        if (!editingReview) return;
        setLoading(true);
        try {
            const updateData = {
                rating: editRating,
                review: editFeedback,
                rated_by: editingReview.rated_by?.id,
                rated_to: editingReview.rated_to?.id,
                product: editingReview.product
            };

            const response = await axiosClient.put(
                `${urls.merchantRating.actionReview}${editingReview.id}/`,
                updateData,
            );

            if (response.data) {
                setReviews(prevReviews =>
                    prevReviews.map(review =>
                        review?.id === editingReview?.id ? response.data : review
                    )
                );

                setEditingReview(null);
                setEditRating(0);
                setEditFeedback("");

                showSuccessNotification("Your review has been successfully updated");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Failed to update review. Please try again.";
                // alert(errorMessage);
                // console.error("Review update error:", error.response?.data);
            } else {
                showErrorNotification("An unexpected error occurred. Please try again.");
                // console.error("Unknown error:", error);
            }
        } finally {
            setLoading(false);
        }
        fetchReviews();

    };

    const cancelEdit = () => {
        setEditingReview(null);
        setEditRating(0);
        setEditFeedback("");
    };

    const filteredReviews = reviews.filter((review) => {
        const name = review.rated_by?.full_name?.toLowerCase().trim() || "";
        const searchTerm = filterByName.toLowerCase().trim();

        const matchesRating =
            !filterByRating || Math.round(review.rating) === parseInt(filterByRating, 10);

        const matchesName = !filterByName || name.includes(searchTerm);

        return matchesRating && matchesName;
    });

    const sortReviews = (input: Review[]) => {
        return [...input].sort((a, b) => {
            if (!sort) return 0;
            if (sort === "created_at") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sort === "-created_at") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sort === "rating") return (a.rating ?? 0) - (b.rating ?? 0);
            if (sort === "-rating") return (b.rating ?? 0) - (a.rating ?? 0);
            return 0;
        });
    };

    const filteredAndSortedReviews = sortReviews(filteredReviews);


    return (
        <div style={{
            background: dark ? theme.colors.dark[6] : "#fff",
            border: dark ? "1px solid grey" : "1px solid lightgray",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
             className="flex flex-col mt-8 bg-white rounded-3xl shadow-sm">
            {/* Header */}
            <div
                className="flex flex-wrap gap-10 justify-between items-center px-8 py-5 w-full rounded-md text-neutral-800">
                <h2 className="text-2xl font-semibold"
                    style={{
                        color: dark ? "white" : "",
                    }}
                >Reviews</h2>
                <h1>


                </h1>
                <button
                    className="px-4 py-2 bg-[#FFCA6A] rounded text-base"
                    onClick={() => setShowAllReviews((prev) => !prev)}
                >
                    {showAllReviews ? "View Less" : "View All"}
                </button>
            </div>

            {/* Summary Section */}
            <div>
                <Box px="20px" className="flex flex-wrap mb-5">
                    <div>
                        <h1 className="text-6xl font-medium text-[#495057]">
                            {averageRating}<span className="text-3xl text-[#49505780]">/5</span>
                        </h1>

                        <div className="mt-4">
                            <StarRating
                                size={18}
                                rating={Math.round(averageRating)}
                                setRating={function (): void {
                                    throw new Error("Function not implemented.");
                                }}
                            />
                        </div>

                        {/* {reviews.map(item =>
                        <p className=" mt-2">{(item.review.length)}ratings</p>


                    )} */}
                        <p className=" mt-2">{(reviews.length)} Ratings</p>
                    </div>

                    {/* Ratings Breakdown Section */}
                    <div style={{marginTop: isSmallScreen ? "" : "-130px"}}
                         className="flex flex-col gap-2 w-full">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const reviewsWiththisRating = reviews.filter(
                                review => Math.round(review.rating) === rating
                            ).length;
                            const percentage = reviews.length > 0
                                ? (reviewsWiththisRating / reviews.length) * 100
                                : 0;
                            return (
                                <div style={{
                                    marginLeft: isSmallScreen ? "" : "20px",
                                    justifyContent: isSmallScreen ? "" : "center"
                                }}
                                     key={rating} className="flex  items-end gap-4 ">

                                    <StarRating size={18} rating={(rating)} setRating={function (): void {
                                        throw new Error("Function not implemented.");
                                    }}/>
                                    <div style={{marginLeft: isSmallScreen ? "60px" : ""}}
                                         className="rounded-full items-stretch w-52 h-3 bg-gray-200 ">
                                        <div
                                            className=" top-0 left-0 h-full bg-orange-300 rounded-full"
                                            style={{width: `${percentage}%`}}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-zinc-600">
                                {/*{reviewsWiththisRating} ({percentage.toFixed(1)}%)*/}
                                        {reviewsWiththisRating}
                                     </span>
                                </div>
                            );
                        })}
                    </div>
                </Box>
            </div>

            {/* Divider */}

            <div>
                <hr className="my-3 mx-0 " style={{color: "grey"}}/>
                <div style={{display: "flex", justifyContent: "space-between",}}>

                    <div style={{
                        padding: "10px",
                        paddingLeft: "20px",
                        justifyItems: 'center',
                        fontWeight: 500,
                        fontSize: "16px"
                    }}>Reviews
                    </div>
                    <div className='flex flex-wrap mb-5 items-center justify-center gap-3'>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <ActionIcon color={sort ? "orange.4" : "gray.7"}>
                                    <IconArrowsSort/>
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {SORTING_DATA_REVIEW?.map((item, index) => (
                                    <Menu.Item
                                        key={index}
                                        onClick={() => setSort(item?.value)}
                                    >
                                        {item.label}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>


                        <div style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                            padding: "10px",
                            justifyItems: "flex-end"
                        }}>
                            <button style={{display: "flex"}} onClick={() => setShowFilter((prev) => !prev)}>

                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M28.625 13.625H30.875C31.5625 13.5625 31.9375 13.2031 32 12.5469C32 12.2344 31.8906 11.9688 31.6719 11.75C31.4531 11.5 31.1875 11.375 30.875 11.375H28.625C27.9375 11.4375 27.5625 11.7969 27.5 12.4531C27.5 12.7656 27.6094 13.0312 27.8281 13.25C28.0469 13.5 28.3125 13.625 28.625 13.625ZM30.875 18.875H24.125C23.4375 18.9375 23.0625 19.3125 23 20C23.0625 20.6875 23.4375 21.0625 24.125 21.125H30.875C31.5625 21.0625 31.9375 20.6875 32 20C31.9375 19.3125 31.5625 18.9375 30.875 18.875ZM23.4688 11H9.03125C8.59375 11.0312 8.28125 11.2344 8.09375 11.6094C7.9375 11.9531 7.98438 12.3125 8.23438 12.6875L13.25 18.5938V25.25C13.25 25.625 13.4062 25.9375 13.7188 26.1875L17.4219 28.8125C17.6719 28.9375 17.9062 29 18.125 29C18.7812 28.9688 19.1562 28.5781 19.25 27.8281V18.5938L24.2656 12.6875C24.5156 12.3125 24.5625 11.9531 24.4062 11.6094C24.2188 11.2344 23.9062 11.0312 23.4688 11ZM17.5156 17.1406L17 17.75V25.7188L15.5 24.6875V17.75L11.6562 13.25H20.8438L17.5156 17.1406ZM30.875 26.375H24.125C23.4375 26.4375 23.0625 26.8125 23 27.5C23.0625 28.1875 23.4375 28.5625 24.125 28.625H30.875C31.5625 28.5625 31.9375 28.1875 32 27.5C31.9375 26.8125 31.5625 26.4375 30.875 26.375Z"
                                        fill="#495057"/>
                                </svg>
                            </button>
                            {showFilter && (
                                <div className="flex flex-row items-center  gap-4">
                                    <Select
                                        placeholder="Filter by rating"
                                        data={[
                                            {value: "5", label: "5 Stars"},
                                            {value: "4", label: "4 Stars"},
                                            {value: "3", label: "3 Stars"},
                                            {value: "2", label: "2 Stars"},
                                            {value: "1", label: "1 Star"},
                                        ]}
                                        value={filterByRating}
                                        onChange={setFilterByRating}
                                        clearable
                                    />
                                    <TextInput
                                        placeholder="Search by name"
                                        value={filterByName}
                                        onChange={(event) => setFilterByName(event.currentTarget.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                {!editingReview && isLoggedIn() && is_purchased && !hasExistingReview && !isOwner ? (
                    <Box style={{padding: "20px"}} mb="6">
                        <h3 className="text-lg font-medium mb-2">Add a Review</h3>
                        <StarRating rating={newRating} setRating={setNewRating} size={20}/>
                        <Textarea
                            placeholder="Your Feedback"
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            className="mt-2 mb-4"
                        />
                        <Button
                            onClick={is_product ? handleAddProductReview : handleAddReview}
                            disabled={!newFeedback || newRating === 0}
                        >
                            <p className={`${dark ? "text-white" : "text-gray-500"}`}>Submit Review</p>
                        </Button>
                    </Box>
                ) : !editingReview && hasExistingReview && (
                    <div className="p-4 text-center bg-gray-100 rounded-md">
                        {isOwner ? (
                            <p className="text-lg">You cannot review yourself</p>
                        ) : (
                            <p className="text-lg">
                                You need to
                                {!isLoggedIn() && !is_purchased
                                    ? " log in and purchase this product"
                                    : !isLoggedIn()
                                        ? " log in"
                                        : !is_purchased && " purchase this product"}{" "}
                                to add a review.
                            </p>
                        )}
                    </div>
                )}

            </div>

            {/* Edit Review Form */}
            {editingReview && (
                <Box style={{padding: "20px"}} mb="6">
                    <h3 className="text-lg font-medium mb-2">Edit Review</h3>
                    <StarRating rating={editRating} setRating={setEditRating} size={20}/>
                    <Textarea
                        placeholder="Your Feedback"
                        value={editFeedback}
                        onChange={(e) => setEditFeedback(e.target.value)}
                        className="mt-2 mb-4"
                    />
                    <div className="flex gap-4">
                        <Button onClick={is_product ? handleProductUpdate : handleUpdate}
                                disabled={!editFeedback || editRating === 0}>
                            Update Review
                        </Button>
                        <Button onClick={cancelEdit} variant="outline">
                            Cancel
                        </Button>
                    </div>
                </Box>
            )}

            <div className="flex flex-col px-8 pb-8">


                {loading ? (
                    <SkeletonReview/> // Show skeleton only during initial load or reload
                ) : Array.isArray(reviews) && reviews.length > 0 ? (
                    filteredReviews.length > 0 ? (

                        (showAllReviews ? filteredAndSortedReviews : filteredAndSortedReviews.slice(0, 3)).map((item) => (
                            <div key={item.id} className="flex">
                                <ReviewCard
                                    item={item}
                                    onEdit={() => handleEdit(item)}
                                    canModify={canModifyReview(item)}
                                    created_date={item.created_at}
                                    fetchReviews={fetchReviews}
                                    isOwner={isOwner}
                                    isProduct={is_product}/>


                                {canModifyReview(item) && (
                                    <>
                                        <button
                                            className="mr-6"
                                            onClick={() => handleEdit(item)}
                                            disabled={loading}
                                        >
                                            <FiEdit className="text-xl hover:text-blue-500"/>
                                        </button>
                                        <button
                                            onClick={handleDelete(item.id)}
                                            disabled={loading}
                                        >
                                            <FiTrash2 className="text-xl hover:text-red-500"/>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">No reviews were found matching your credentials</div>
                    )
                ) : (
                    <div
                        className="text-center py-4">{is_product ? "No reviews were found on the Product profile" : "No reviews were found on the merchant profile"}</div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
