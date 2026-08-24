import type { MantineNumberSize } from "@mantine/core";
import { LoadingOverlay } from "@mantine/core";
import { Button } from "@mantine/core";
import { Flex } from "@mantine/core";
import { Divider } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Modal, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import parse from "html-react-parser";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import type { BookingDataProps } from "@/types/booking/BookingDataProps";
import type { ApplyPayload } from "@/types/booking/BookingPayload";
import type { BookingProps } from "@/types/booking/BookingProps";
import { axiosClient } from "@/utils/axiosClient";
import { applyTaskVariableFormSchema } from "@/utils/validation/ApplyFormValidation";

import DescriptionField from "../common/form/DescriptionField";
import FormButton from "../common/form/FormButton";
import NumberField from "../common/form/NumberField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

export const ApplyModal = ({
    opened,
    setOpened,
    bookingData,
    description,
    id,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    bookingData?: BookingDataProps;
    description?: string;
    id?: number;
}) => {
    const theme = useMantineTheme();

    const router = useRouter();

    const { data } = useQuery(
        ["booking-detail", id],
        async () => {
            try {
                const { data } = await axiosClient.get<
                    BookingProps["result"][0]
                >(`${urls.booking.initial}${id}/`);
                return data;
            } catch (error) {
                console.log(
                    "🚀 ~ file: AppliedModal.tsx:50 ~ const{data}=useQuery ~ error:",
                    error
                );
            }
        },
        { enabled: !!id }
    );

    const { budget_from, budget_to, is_negotiable, is_range, title, currency } =
        bookingData ?? data?.entity_service ?? ({} as BookingDataProps);

    const { mutate, isLoading } = useMutation<any, Error, ApplyPayload>(
        async (payload) => {
            if (id) {
                const { data } = await axiosClient.patch<ApplyPayload>(
                    `${urls.entity.booking}${id}/`,
                    payload
                );
                return data;
            } else {
                const { data } = await axiosClient.post<ApplyPayload>(
                    urls.entity.booking,
                    payload
                );
                return data;
            }
        }
    );

    const queryclient = useQueryClient();
    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Modal.Root
                opened={opened}
                onClose={() => setOpened(false)}
                size={"xl"}
                scrollAreaComponent={Modal.NativeScrollArea}
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
                                {"Apply Task"}
                            </Title>
                        </Modal.Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body
                        sx={{
                            "& p": {
                                color:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[6]
                                        : theme.colors.gray[7],
                                fontWeight: 400,
                                marginBottom: 16,
                                "& span": {
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.gray[5]
                                            : theme.colors.gray[8],
                                },
                            },
                        }}
                    >
                        <p>
                            <span>Title : </span>
                            {title}
                        </p>
                        <p>
                            <span>Budget : </span>
                            {currency?.symbol}{" "}
                            {is_range &&
                                budget_from &&
                                `${parseInt(budget_from)?.toFixed(2)} - `}
                            {parseInt(budget_to).toFixed(2)}{" "}
                            {is_negotiable
                                ? `(negotiable)`
                                : `(Non negotiable)`}
                        </p>
                        {description ? (
                            <div>{parse(description)}</div>
                        ) : (
                            <div>{data?.entity_service?.description}</div>
                        )}
                        <Divider my={32} />

                        <Formik
                            initialValues={{
                                price: data?.earning
                                    ? parseFloat(data?.earning)
                                    : parseFloat(budget_to),
                                description: data?.description ?? "",
                                entity_service: router.query.id as string,
                            }}
                            validationSchema={applyTaskVariableFormSchema(
                                parseInt(budget_from),
                                parseInt(budget_to),
                                is_range
                            )}
                            enableReinitialize
                            onSubmit={async (value, actions) =>
                                mutate(value, {
                                    onSuccess: async () => {
                                        queryclient.invalidateQueries([
                                            "booking-detail",
                                        ]);
                                        toast.success("Task Applied");
                                        setOpened(false);
                                    },
                                    onError: (e: any) => {
                                        const {
                                            budget_to,
                                            description,
                                            end_date,
                                            non_field_errors,
                                        } = e.response.data;
                                        actions.setFieldError(
                                            "budget_to",
                                            budget_to && budget_to[0]
                                        );
                                        actions.setFieldError(
                                            "description",
                                            description && description[0]
                                        );
                                        end_date && toast.error(end_date);
                                        non_field_errors &&
                                            toast.error(non_field_errors);
                                    },
                                })
                            }
                        >
                            {({ errors, touched }) => (
                                <Form>
                                    <NumberField
                                        id="price"
                                        name={"price"}
                                        placeholder="Enter Price"
                                        label={`Your Budget ${
                                            is_negotiable
                                                ? `(negotiable)`
                                                : `(Non negotiable)`
                                        } `}
                                        w={"40%"}
                                        touch={touched.price}
                                        error={errors.price}
                                        disabled={!is_negotiable && !is_range}
                                        withAsterisk
                                    />
                                    <DescriptionField
                                        id="description"
                                        name={"description"}
                                        label={"Reason to apply "}
                                        placeholder={"Service Description Here"}
                                        touch={touched.description}
                                        error={errors.description}
                                        minRows={8}
                                        withAsterisk
                                    />
                                    <Flex justify={"center"} gap={30} mt={80}>
                                        <Button
                                            variant="outline"
                                            sx={{
                                                color: theme.colors
                                                    .secondary[2],
                                                border: `1px solid ${theme.colors.secondary[2]}`,
                                            }}
                                            onClick={() => setOpened(false)}
                                        >
                                            Back
                                        </Button>
                                        <FormButton
                                            name={"Apply"}
                                            id={"post-task-btn"}
                                            type="submit"
                                            isLoading={isLoading}
                                        />
                                    </Flex>
                                </Form>
                            )}
                        </Formik>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};
