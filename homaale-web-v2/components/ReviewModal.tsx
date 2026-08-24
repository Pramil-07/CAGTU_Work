import type { MantineNumberSize } from "@mantine/core";
import { LoadingOverlay } from "@mantine/core";
import { Flex } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Modal, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import type { RatingPayload } from "@/types/RatingPayload";
import { axiosClient } from "@/utils/axiosClient";

import DescriptionField from "./common/form/DescriptionField";
import FormButton from "./common/form/FormButton";
import RatingField from "./common/form/RatingField";
import HomaaleLoader from "./common/HomaaleLoader";
import { toast } from "./common/Toast";

export const ReviewModal = ({
    opened,
    setOpened,

    status,
    setTaskArchiveModal,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    setTaskArchiveModal: Dispatch<SetStateAction<boolean>>;

    status: string;
}) => {
    const theme = useMantineTheme();

    const router = useRouter();

    const { mutate, isLoading } = useMutation<any, Error, RatingPayload>(
        async (payload) => {
            const { data } = await axiosClient.post<RatingPayload>(
                urls.rating.initial,
                payload
            );
            return data;
        }
    );

    const queryClient = useQueryClient();

    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            size={"xl"}
            scrollAreaComponent={Modal.NativeScrollArea}
            closeOnClickOutside={false}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : theme.colors.gray[4],
                }}
            />
            <Modal.Content
                p={
                    {
                        base: "5px",
                        sm: "10px ",
                        lg: "20px",
                    } as unknown as MantineNumberSize
                }
                sx={{
                    "& h3": {
                        marginBottom: 0,
                    },
                }}
            >
                <Modal.Header sx={{ position: "relative" }}>
                    <Modal.Title>
                        <Title order={3} size={20} weight={500} mb={32}>
                            {"Review and Rating "}
                        </Title>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    sx={{
                        "& p": {
                            color: theme.colors.gray[7],
                            fontWeight: 400,
                            marginBottom: 16,
                            "& span": { color: theme.colors.gray[8] },
                        },
                    }}
                >
                    <LoadingOverlay
                        loader={<HomaaleLoader />}
                        visible={isLoading}
                        sx={{ position: "fixed", inset: 0 }}
                    />
                    <Formik
                        initialValues={{
                            rating: null,
                            review: "",
                            task: router.query.id as string,
                        }}
                        onSubmit={async (value) =>
                            mutate(value, {
                                onSuccess: async (data) => {
                                    if (status === "Closed") {
                                        setTaskArchiveModal(true);
                                    }

                                    toast.success(data.message);
                                    queryClient.invalidateQueries([
                                        "booking-detail",
                                        router.query.id,
                                    ]);
                                    setOpened(false);
                                },
                                onError: (e: any) => {
                                    console.log(
                                        "🚀 ~ file: ReviewModal.tsx:122 ~ e:",
                                        e
                                    );
                                },
                            })
                        }
                    >
                        {({ errors, touched, values }) => (
                            <Form>
                                <Title order={6} fw={500} mb={8}>
                                    Rating
                                </Title>
                                <RatingField name={"rating"} />
                                <Title order={6} fw={500} mb={8}>
                                    Write your review
                                </Title>
                                <DescriptionField
                                    id="review"
                                    name={"review"}
                                    placeholder={"Review here..."}
                                    touch={touched.review}
                                    error={errors.review}
                                    minRows={8}
                                />
                                <Flex gap={30} mt={40} justify={"flex-end"}>
                                    <FormButton
                                        name={"Submit"}
                                        disabled={!values.rating}
                                        id={"review-submit-btn"}
                                        type="submit"
                                    />
                                </Flex>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
