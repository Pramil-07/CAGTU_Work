import { ActionIcon, Flex, Text, useMantineTheme } from "@mantine/core";
import { IconSend, IconStar } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Form } from "formik";
import { Formik } from "formik";
import Image from "next/image";
import { useState } from "react";

import urls from "@/constants/urls";
import type { ReviewProps } from "@/types/ReviewProps";
import { axiosClient } from "@/utils/axiosClient";

import InputField from "../common/form/InputField";
import { toast } from "../common/Toast";
import router from "next/router";
import { useUser } from "@/hooks/useUser";

export function CommentCard({
    reviewData,
    replyerName,
    replyImage,
    is_user,
    disabled,
}: {
    reviewData: ReviewProps["result"][0];
    replyerName: string;
    replyImage: string;
    is_user: boolean;
    disabled?: boolean;
}) {
    const theme = useMantineTheme();

    const { created_at, rated_by, rating, reply, review, replied_date, id } =
        reviewData ?? ({} as ReviewProps["result"][0]);

    const { mutate, isLoading } = useMutation<any, Error, string>(
        async (payload) => {
            await axiosClient.patch<string>(`${urls.rating.initial}${id}/`, {
                reply: payload,
            });
        }
    );
    // console.log("from comment",reviewData)
    const user= useUser()
    // const isMerchantRoute = () => {
    //     if (typeof window === "undefined") return { isMerchant: false, id: null };
    //
    //     const isMerchant = router.pathname.startsWith('/merchant/');
    //     // const [id] = router.query.slug || []; // First segment after /merchant/
    //
    //     return { isMerchant, id: id || null };
    //   };
    const queryClient = useQueryClient();

    const [replay, setReplay] = useState(false);
    return (
        <Flex
            justify={"flex-start"}
            align={"flex-start"}
            gap={24}
            mb={16}
            mt={20}
        >
          {/*{!isMerchantRoute()&& (*/}
              <Image
                src={
                    rated_by?.profile_image
                        ? rated_by?.profile_image
                        : "/images/placeholder/profilePlaceholder.png"
                }
                alt={`profile-${rated_by?.full_name}`}
                blurDataURL="/images/placeholder/profilePlaceholder.png"
                width={40}
                height={40}
                style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                }}
            />
            {/*)}*/}
            <Flex direction={"column"} align={"flex-start"} w={"100%"}>
               {/*{ !isMerchantRoute()&&(*/}
                <div>
                <Flex gap={4}>
                <Text
                    component="p"
                    mr={10}
                    color={
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[3]
                            : theme.colors.gray[7]
                    }
                    fw={500}
                >
                    {rated_by?.full_name}
                </Text>
                <IconStar
                    fill={theme.colors.brand[2]}
                    color={theme.colors.brand[2]}
                    size={16}
                />
                {rating}
            </Flex>
            <Text
                component="p"
                py={4}
                color={
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[8]
                }
            >
                <span
                dangerouslySetInnerHTML={{ __html: review || "" }}
                />
            </Text>
            <Text
                component="span"
                color={
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[6]
                        : theme.colors.gray[7]
                }
            >
                {created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : ""}

            </Text>
            </div>
               {/*)*/}


               {/*}*/}


                {!reply && is_user && !disabled && (
                    <Text
                        component="span"
                        ml={"auto"}
                        mr={10}
                        color={
                            replay
                                ? theme.colors.brand[3]
                                : theme.colors.homaaleSlate[7]
                        }
                        onClick={() =>
                        {
                            setReplay(!replay)} }
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

                {replay && is_user && !reply && (
                    <Flex
                        justify={"flex-start"}
                        align={"flex-start"}
                        gap={24}
                        mb={16}
                        mt={12}
                        w={"100%"}
                    >
                        <Image
                            src={
                                replyImage
                                    ? replyImage
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            alt={`profile-${replyerName}`}
                            blurDataURL="/images/placeholder/profilePlaceholder.png"
                            width={40}
                            height={40}
                            style={{
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                        <Formik
                            initialValues={{
                                reply: "",
                            }}
                            onSubmit={(values) => {
                                mutate(values.reply, {
                                    onSuccess: () => {
                                        queryClient.invalidateQueries([
                                            "review",
                                        ]);
                                        toast.success("Reply Added");
                                    },
                                    onError: () => {
                                        toast.error("Post Reply Failed");
                                    },
                                });
                            }}
                        >
                            {() => {
                                return (
                                    <Form
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            width: "100%",
                                        }}
                                    >
                                        <InputField
                                            name="reply"
                                            marginIgnore
                                            placeholder="Write a reply..."
                                            w={"100%"}
                                        />
                                        <ActionIcon
                                            type="submit"
                                            right={40}
                                            size={"lg"}
                                            loading={isLoading}
                                        >
                                            <IconSend />
                                        </ActionIcon>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </Flex>
                )}
                {reply && (
                    <Flex
                        justify={"flex-start"}
                        align={"flex-start"}
                        gap={24}
                        mb={16}
                        mt={20}
                    >
                        <Image
                            src={
                                replyImage
                                    ? replyImage
                                    : "/images/placeholder/profilePlaceholder.png"
                            }
                            alt={`profile-${replyerName}`}
                            blurDataURL="/images/placeholder/profilePlaceholder.png"
                            width={40}
                            height={40}
                            style={{
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                        <Flex direction={"column"} align={"flex-start"}>
                            <Flex gap={4}>
                                <Text
                                    component="p"
                                    mr={10}
                                    color={theme.colors.gray[7]}
                                    fw={500}
                                >
                                    {replyerName}
                                </Text>
                            </Flex>
                            <Text
                                component="p"
                                py={4}
                                color={theme.colors.gray[8]}
                            >
                                {reply}
                            </Text>
                            <Text component="span" color={theme.colors.gray[7]}>
                                {/* {formatDistanceToNow(new Date(replied_date), {
                                    addSuffix: true,
                                })} */}
                                {replied_date ? formatDistanceToNow(new Date(replied_date), { addSuffix: true }) : ""}

                            </Text>
                        </Flex>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
}
