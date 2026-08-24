import { Box, Button, Flex, Modal, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useSupportTypesOptions } from "@/hooks/useSupportTypesoptions";
import { useReportModalStyles } from "@/styles/components/ReportModalStyles";
import type { ReportPayload } from "@/types/SupportPayload";
import { axiosClient } from "@/utils/axiosClient";
import { OtherSupportFormValidation } from "@/utils/validation/SupportFormValidation";

import DescriptionField from "./common/form/DescriptionField";
import InputField from "./common/form/InputField";
import SelectField from "./common/form/SelectField";
import { toast } from "./common/Toast";

interface Props {
    opened: boolean;
    setOpenReportModal: Dispatch<SetStateAction<boolean>>;
    reportHeading?: string;
    reportSubHeading?: string;
    reportedServiceUser?: string;
    entityServiceId?: string;
    images?: Array<any>;
    reportedUserId?: string;
    reportedUserImage?: string;
    reportedUserName?: string;
    reportedDesignation?: string;
}

const ReportModal = ({
    opened,
    setOpenReportModal,
    reportHeading,
    reportSubHeading,
    entityServiceId,
    images,
    reportedUserId,
    reportedUserImage,
    reportedUserName,
    reportedDesignation,
}: Props) => {
    const { data: supportTypeOptions = [] } = useSupportTypesOptions(
        reportedUserId ? "user" : "entityservice"
    );
    const { classes } = useReportModalStyles();

    const { mutate } = useMutation<any, Error, ReportPayload>(
        async (payload) => {
            const { data } = await axiosClient.post<ReportPayload>(
                urls.report.support_ticket,
                payload
            );
            return data;
        }
    );
    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpenReportModal(false)}
            centered
            closeOnClickOutside={false}
            closeOnEscape={false}
            size={"lg"}
            padding={32}
            className={classes.wrapper}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                }}
            />
            <Modal.Content>
                <Modal.Header
                    sx={{
                        padding: "24px 32px",
                        justifyContent: "flex-end",
                    }}
                >
                    <Modal.CloseButton
                        sx={{
                            padding: 0,
                        }}
                    />
                </Modal.Header>
                <Modal.Body>
                    <Flex justify={"flex-start"} align={"center"}>
                        <Image
                            src={
                                (images && images[0]?.media) ??
                                reportedUserImage ??
                                "/images/placeholder/taskPlaceholder.png"
                            }
                            placeholder="blur"
                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                            alt={`img-`}
                            height={76}
                            width={76}
                            style={{
                                objectFit: "cover",
                                borderRadius: 8,
                                padding: 4,
                                marginBottom: 8,
                            }}
                        />
                        <Box ml={8} className="content-wrapper">
                            <h4>{reportHeading ?? reportedUserName} </h4>
                            <Text component="p">
                                {/* {entityServiceId && (
                                    <Image
                                        src={
                                            "/images/placeholder/personPlaceholder.jpg"
                                        }
                                        placeholder="blur"
                                        blurDataURL="/images/placeholder/personPlaceholder.jpg"
                                        alt={`user-profile-img`}
                                        height={24}
                                        width={24}
                                        style={{
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                        }}
                                    />
                                )}{" "} */}
                                {reportSubHeading ?? reportedDesignation}{" "}
                            </Text>
                        </Box>
                    </Flex>

                    <Formik
                        initialValues={{
                            type: "",
                            reason: "",
                            description: "",
                            model: reportedUserId ? "user" : "entityservice",
                            object_id: reportedUserId ?? entityServiceId,
                        }}
                        onSubmit={async (values, actions) => {
                            mutate(values, {
                                onSuccess: () => {
                                    toast.success("Reported successfully.");
                                    actions.resetForm();
                                    setOpenReportModal(false);
                                },
                                onError: (err: any) => {
                                    toast.error(err.response.message);
                                },
                            });
                        }}
                        validationSchema={OtherSupportFormValidation}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <Box className="form-wrapper">
                                    <SelectField
                                        label="Issue type"
                                        id="type"
                                        withAsterisk
                                        name={"type"}
                                        searchable
                                        placeholder="Select issue type"
                                        data={supportTypeOptions}
                                        touch={touched.type}
                                        error={errors.type}

                                        // disabled={isInputDisabled}
                                    />
                                    <InputField
                                        name="reason"
                                        label="Please Specify"
                                        placeholder="Specify your reson here"
                                        error={errors.reason}
                                        touch={touched.reason}
                                        withAsterisk
                                        // disabled={isInputDisabled}
                                    />
                                    <DescriptionField
                                        id="description"
                                        name={"description"}
                                        label={"Problem detail"}
                                        placeholder="Please explain your problem briefly"
                                        touch={touched.description}
                                        error={errors.description}
                                        withAsterisk
                                    />
                                    <Button type="submit">Submit</Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default ReportModal;
