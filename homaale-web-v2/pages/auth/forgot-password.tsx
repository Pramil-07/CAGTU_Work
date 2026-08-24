import { Box, Flex, Group, Radio, useMantineTheme } from "@mantine/core";
import { IconDeviceMobile, IconMail } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";

import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import PhoneNumberField from "@/components/common/form/PhoneNumberField";
import { toast } from "@/components/common/Toast";
import AuthLayout from "@/components/Layout/AuthLayout";
import urls from "@/constants/urls";
import { useLoginSignupRadioStyles } from "@/styles/components/LoginSignupRadioStyles";
import { axiosClient } from "@/utils/axiosClient";
import {
    emailValidationSchema,
    phoneNumberValidationSchema,
} from "@/utils/validation/GlobalValidations";

const ForgotPassword = () => {
    const [choosedValue, setChoosedValue] = useState("email");
    const [successAlertMsg, setSuccessAlertMsg] = useState("");
    const [errorAlertMsg, setErrorAlertMsg] = useState("");
    const theme = useMantineTheme();
    const { classes } = useLoginSignupRadioStyles();

    const { mutate } = useMutation(
        (data: { email?: string; phone?: string }) => {
            return axiosClient.post(urls.auth.forgotPassword, data);
        }
    );

    const router = useRouter();

    return (
        <AuthLayout
            heading="Forgot password?"
            subHeading="No worries, we'll send you reset instructions."
            rightImageText="The simplest way to manage your task and services."
            bottomRedirectionQuestion="Already a member?"
            bottomRedirectionText="Log in"
            bottomRedirectionUrl="/auth/login"
        >
            <>
                <Formik
                    initialValues={{
                        email: "",
                        phone: "",
                    }}
                    validationSchema={
                        choosedValue === "email"
                            ? emailValidationSchema
                            : phoneNumberValidationSchema
                    }
                    onSubmit={(values, actions) => {
                        const formData = values.email
                            ? { email: values?.email }
                            : { phone: values?.phone };
                        mutate(formData, {
                            onSuccess: async (data: any) => {
                                toast.success(data?.data?.message);
                                actions.setSubmitting(false);
                                actions.resetForm();
                                setErrorAlertMsg("");
                                setSuccessAlertMsg(data?.message);
                                if (choosedValue === "phone") {
                                    router.push({
                                        pathname: "/auth/otp-verify",
                                        query: { phone: values.phone },
                                    });
                                }
                            },
                            onError: (error: any) => {
                                actions.setSubmitting(false);
                                const {
                                    data: { email, phone },
                                } = error.response;
                                actions.setFieldError("email", email);
                                actions.setFieldError("phone", phone);
                                setSuccessAlertMsg("");
                            },
                        });
                    }}
                >
                    {({ isSubmitting, errors, touched, setFieldValue }) => (
                        <>
                            <div className={classes.radioWrapper}>
                                <Radio.Group
                                    label="Reset your account using."
                                    onChange={(value) => {
                                        setChoosedValue(value);
                                        setFieldValue("email", "");
                                        setFieldValue("phone", "");
                                    }}
                                    size="md"
                                    defaultValue="email"
                                >
                                    <Group>
                                        <Box className="box">
                                            <Radio
                                                value="email"
                                                label={
                                                    <Flex>
                                                        <IconMail className="icon" />{" "}
                                                        <span>Email</span>
                                                    </Flex>
                                                }
                                                labelPosition="left"
                                                // onClick={() => {
                                                //     setSuccessAlertMsg("");
                                                //     setErrorAlertMsg("");
                                                // }}
                                            />
                                        </Box>

                                        <Box className="box">
                                            <Radio
                                                value="phone"
                                                label={
                                                    <Flex>
                                                        <IconDeviceMobile className="icon" />{" "}
                                                        <span>Phone</span>
                                                    </Flex>
                                                }
                                                labelPosition="left"
                                                // onClick={() => {
                                                //     setSuccessAlertMsg("");
                                                //     setErrorAlertMsg("");
                                                // }}
                                            />
                                        </Box>
                                    </Group>
                                </Radio.Group>
                            </div>
                            <Form className="login-form">
                                {choosedValue === "email" ? (
                                    <InputField
                                        name="email"
                                        label={"Email"}
                                        placeholder={
                                            "Enter your phone or email"
                                        }
                                        error={errors.email}
                                        touch={touched.email}
                                        withAsterisk
                                    />
                                ) : (
                                    <PhoneNumberField
                                        name="phone"
                                        labelName="Phone Number"
                                        touch={touched.phone}
                                        error={errors.phone}
                                        fieldRequired
                                    />
                                )}
                                {/* {successAlertMsg !== "" && (
                                <Alert
                                    icon={<CheckCircle />}
                                    title="Success"
                                    color="teal"
                                    className="mb-5"
                                >
                                    {successAlertMsg}
                                </Alert>
                            )}
                            {errorAlertMsg !== "" && (
                                <Alert
                                    icon={<ErrorOutlineOutlined />}
                                    title="Oops!"
                                    color="red"
                                    className="mb-5"
                                    withCloseButton={true}
                                    onClose={() => setErrorAlertMsg("")}
                                >
                                    {errorAlertMsg}
                                </Alert>
                            )}
                            {!sendOnce ? (
                                <FormButton
                                    type="submit"
                                    variant="primary"
                                    name="Send"
                                    className="login-btn"
                                    isSubmitting={isSubmitting}
                                    isSubmittingClass={isSubmittingClass(
                                        isSubmitting
                                    )}
                                />
                            ) : (
                                <FormButton
                                    type="submit"
                                    variant="primary"
                                    name="Resend"
                                    className="login-btn"
                                    isSubmitting={isSubmitting}
                                    isSubmittingClass={isSubmittingClass(
                                        isSubmitting
                                    )}
                                />
                            )} */}
                                <FormButton
                                    type="submit"
                                    id="login-button"
                                    isSubmitting={isSubmitting}
                                    className="login-btn"
                                    name={"Send"}
                                    fullWidth
                                    background={theme.colors.homaaleSlate[8]}
                                    radius="md"
                                    size="md"
                                />
                            </Form>
                        </>
                    )}
                </Formik>
            </>
        </AuthLayout>
    );
};

export default ForgotPassword;
