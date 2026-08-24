import { Alert, Box, Button, Grid, LoadingOverlay } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import React, { useState } from "react";

import DescriptionField from "@/components/common/form/DescriptionField";
import InputField from "@/components/common/form/InputField";
import SelectField from "@/components/common/form/SelectField";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { useSupportTypesOptions } from "@/hooks/useSupportTypesoptions";
import { useSupportStyles } from "@/styles/pages/SupportStyles";
import type { SupportPayload } from "@/types/SupportPayload";
import { axiosClient } from "@/utils/axiosClient";
import {
    OtherSupportFormValidation,
    SupportFormValidation,
} from "@/utils/validation/SupportFormValidation";
import {useUserStatus} from "@/hooks/useUserStatus";

const Support = () => {
    const { classes, theme } = useSupportStyles();
    const { data: supportTypeOptions = [] } = useSupportTypesOptions("");

    const { mutate, isLoading } = useMutation<any, Error, SupportPayload>(
        async (payload) => {
            const { data } = await axiosClient.post<SupportPayload>(
                urls.report.support_ticket,
                payload
            );
            return data;
        }
    );

    const [isOtherChoosed, setIsOtherChoosed] = useState(false);
    const {checkStatus} = useUserStatus();
    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Layout heading="Report a problem" currentTitle="Report-problem" breadCrumbsItems={[{name:"Help & Support",href:""}]}>
                <Formik
                    initialValues={{
                        type: "",
                        reason: "",
                        description: "",
                    }}
                    onSubmit={async (values, actions) => {
                        if (!checkStatus("profile")) {
                            return;
                        }
                        const supportTicketPayload: SupportPayload = {
                            ...values,
                            reason: isOtherChoosed ? values.reason : null,
                        };

                        mutate(supportTicketPayload, {
                            onSuccess: () => {
                                toast.success(
                                    "Support ticket created successfully."
                                );
                                actions.resetForm();
                            },
                            onError: (err: any) => {
                                toast.error(err.response.message);
                            },
                        });
                    }}
                    validationSchema={
                        isOtherChoosed
                            ? OtherSupportFormValidation
                            : SupportFormValidation
                    }
                >
                    {({ errors, touched, setFieldValue }) => (
                        <Form>
                            <Grid className={classes.wrapper}>
                                <Grid.Col md={7}>
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
                                            handleChange={(data) => {
                                                console.log(data);
                                                data === "other"
                                                    ? setIsOtherChoosed(true)
                                                    : setIsOtherChoosed(false);
                                                setFieldValue("type", data);
                                            }}
                                        />
                                        {isOtherChoosed && (
                                            <InputField
                                                name="reason"
                                                label="Please Specify"
                                                placeholder="Specify your reson here"
                                                error={errors.reason}
                                                touch={touched.reason}
                                                withAsterisk
                                            />
                                        )}
                                        <DescriptionField
                                            id="description"
                                            name={"description"}
                                            label={"Problem detail"}
                                            placeholder="Please explain your problem briefly"
                                            touch={touched.description}
                                            error={errors.description}
                                            withAsterisk
                                        />

                                        <Alert
                                            icon={
                                                <IconAlertCircle
                                                    size="3rem"
                                                    color={
                                                        theme.colors.orange[4]
                                                    }
                                                />
                                            }
                                            mb={24}
                                            sx={{
                                                backgroundColor:
                                                    theme.colorScheme === "dark"
                                                        ? theme.colors.dark[7]
                                                        : "#FFF5E5",
                                                ".mantine-Alert-message": {
                                                    color:
                                                        theme.colorScheme ===
                                                        "dark"
                                                            ? theme.colors
                                                                  .orange[4]
                                                            : "orange",
                                                },
                                            }}
                                        >
                                            If you are trying to report a Task,
                                            Service or Tasker, go to respective
                                            detail page and report.
                                        </Alert>
                                        <Button
                                            type="submit"
                                            loading={isLoading}
                                        >
                                            Submit
                                        </Button>
                                    </Box>
                                </Grid.Col>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </Layout>
        </>
    );
};

export default Support;
