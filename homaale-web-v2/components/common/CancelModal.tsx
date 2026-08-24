import type {MantineNumberSize} from "@mantine/core";
import {LoadingOverlay} from "@mantine/core";
import {useMantineTheme} from "@mantine/core";
import {Button} from "@mantine/core";
import {Flex} from "@mantine/core";
import {Alert} from "@mantine/core";
import {Box, Checkbox, Modal, Radio, Title} from "@mantine/core";
import {IconAlertCircle} from "@tabler/icons-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Form, Formik} from "formik";
import Link from "next/link";
import type {Dispatch, SetStateAction} from "react";
import React from "react";

import {CANCELATION_LEVEL} from "@/constants/CANCELATION_LEVEL";
import {
    CLIENT_REASON_CANCELLATION,
    CLIENT_REASON_CANCELLATION_AFTER_APPROVAL,
    TASKER_REASON_CANCELLATION,
    TASKER_REASON_CANCELLATION_AFTER_APPROVAL,
} from "@/constants/REASON_CANCELLATION";
import urls from "@/constants/urls";
import type {CancelPayload} from "@/types/CancelPayload";
import {axiosClient} from "@/utils/axiosClient";
import {cancelSchema} from "@/utils/validation/CancelationValidation";

import DescriptionField from "./form/DescriptionField";
import FormButton from "./form/FormButton";
import HomaaleLoader from "./HomaaleLoader";
import {toast} from "./Toast";

export const CancelModal = ({
                                id,
                                is_client,
                                opened,
                                setOpened,
                                state,
                            }: {
    id?: number | string;
    is_client: boolean;
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    state: "beforeApprove" | "afterApprove";
}) => {
    const theme = useMantineTheme();

    const {mutate, isLoading} = useMutation<any, Error, CancelPayload>(
        async (payload) => {
            const {data} = await axiosClient.post<CancelPayload>(
                `${urls.booking.cancel}${id}/`,
                payload
            );
            return data;
        }
    );
    console.log('id from box', id)
    const queryClient = useQueryClient();

    const map_reasons = is_client
        ? state === "afterApprove"
            ? CLIENT_REASON_CANCELLATION_AFTER_APPROVAL
            : CLIENT_REASON_CANCELLATION
        : state === "afterApprove"
            ? TASKER_REASON_CANCELLATION_AFTER_APPROVAL
            : TASKER_REASON_CANCELLATION;

    const renderCancelMessage = () => {
        switch (state) {
            case "beforeApprove":
                return is_client ? (
                    <span>{CANCELATION_LEVEL.beforeApprove.client}</span>
                ) : (
                    <span>{CANCELATION_LEVEL.beforeApprove.tasker}</span>
                );
            case "afterApprove":
                return is_client ? (
                    <span>{CANCELATION_LEVEL.afterApprove.client}</span>
                ) : (
                    <span>{CANCELATION_LEVEL.afterApprove.tasker}</span>
                );
            default:
                return "";
        }
    };
    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            size="xl"
            scrollAreaComponent={Modal.NativeScrollArea}
        >
            <Modal.Overlay/>
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
                <Modal.Header>
                    <Title order={2} size={20} weight={500}>
                        {"Reason for Cancellation"}
                    </Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body>
                    <LoadingOverlay
                        loader={<HomaaleLoader/>}
                        visible={isLoading}
                        sx={{position: "fixed", inset: 0}}
                    />
                    <Box sx={{borderTop: `1px solid #CED4DA`}}>
                        <Alert color="orange.3" my={24}>
                            <Flex
                                align={"center"}
                                justify={"flex-start"}
                                gap={5}
                                sx={{
                                    color: theme.colors.status[2],
                                }}
                            >
                                <IconAlertCircle size="1rem"/>{" "}
                                {renderCancelMessage()}
                            </Flex>
                        </Alert>
                        <Formik
                            initialValues={{
                                cancellation_reason: "",
                                cancellation_description: "",
                                is_terms_condition: false,
                            }}
                            validationSchema={cancelSchema}
                            onSubmit={async (value: CancelPayload) => {
                                delete value.is_terms_condition;
                                mutate(value, {
                                    onSuccess: async (data) => {
                                        toast.success(data.message);
                                        queryClient.invalidateQueries([
                                            "unapproved-booking-list",
                                        ]);
                                        queryClient.invalidateQueries([
                                            "order-list",
                                        ]);
                                        queryClient.invalidateQueries([
                                            "booking-detail",
                                        ]);
                                        setOpened(false);
                                    },
                                    onError: (e: any) => {
                                        console.log(
                                            "🚀 ~ file: ReviewModal.tsx:122 ~ e:",
                                            e
                                        );
                                    },
                                });
                            }}
                        >
                            {({values, errors, touched, setFieldValue}) => (
                                <Form>
                                    <Radio.Group
                                        name="cancellation_reason"
                                        error={
                                            touched.cancellation_reason &&
                                            errors.cancellation_reason &&
                                            errors.cancellation_reason
                                        }
                                        onChange={(event) => {
                                            // console.log(event);
                                            setFieldValue(
                                                "cancellation_reason",
                                                event
                                            );
                                        }}
                                        withAsterisk
                                    >
                                        {map_reasons.map((item, index) => (
                                            <Radio
                                                key={index}
                                                value={item.value}
                                                label={item.value}
                                                mb={20}
                                            />
                                        ))}
                                    </Radio.Group>
                                    <DescriptionField
                                        mt={32}
                                        id="cancellation_description"
                                        name={"cancellation_description"}
                                        label={"Please explain further:"}
                                        placeholder={"Describe reason..."}
                                        touch={touched.cancellation_description}
                                        error={errors.cancellation_description}
                                        withAsterisk
                                    />
                                    <Checkbox
                                        label={
                                            <>
                                                I agree to the{" "}
                                                <Link
                                                    href={
                                                        "/homaale-terms-conditions"
                                                    }
                                                >
                                                    Terms & Conditions{" "}
                                                </Link>
                                                and Privacy policy.
                                            </>
                                        }
                                        mb={10}
                                        checked={values.is_terms_condition}
                                        onChange={(event) =>
                                            setFieldValue(
                                                "is_terms_condition",
                                                event.target.checked
                                            )
                                        }
                                        error={
                                            touched.is_terms_condition &&
                                            errors.is_terms_condition
                                                ? errors?.is_terms_condition
                                                : null
                                        }
                                    />
                                    {state === "afterApprove" && is_client && (
                                        <Alert color="blue" my={24}>
                                            <Flex
                                                align={"center"}
                                                justify={"flex-start"}
                                                gap={5}
                                                sx={{
                                                    "& span": {
                                                        color: theme.colors
                                                            .status[0],
                                                    },
                                                }}
                                            >
                                                <IconAlertCircle
                                                    size="1rem"
                                                    color={
                                                        theme.colors.status[0]
                                                    }
                                                />{" "}
                                                <span>
                                                    Refund will be initiated
                                                    within Two Working Days.
                                                </span>
                                            </Flex>
                                        </Alert>
                                    )}

                                    <Flex justify={"center"} gap={30} mt={30}>
                                        <Button
                                            variant="outline"
                                            w={"20%"}
                                            onClick={() => setOpened(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <FormButton
                                            name={"Proceed to Cancel"}
                                            id={"proceed-to-cancel-btn"}
                                            isLoading={isLoading}
                                            type="submit"
                                        />
                                    </Flex>
                                </Form>
                            )}
                        </Formik>
                    </Box>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
