import { useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import React, { useState } from "react";

import FormButton from "@/components/common/form/FormButton";
import PhoneNumberField from "@/components/common/form/PhoneNumberField";
import AuthLayout from "@/components/Layout/AuthLayout";
import OtpModal from "@/components/OtpModal";
import { axiosClient } from "@/utils/axiosClient";
import { OTPResendSchema } from "@/utils/validation/LoginFormValidation";

const ResendVerification = () => {
    const theme = useMantineTheme();

    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [opened, setOpened] = useState(false);

    const resendOtpMutation = useMutation((data: { phone: string }) => {
        return axiosClient.post(`/user/resend/otp/activation/`, data);
    });

    return (
        <AuthLayout
            heading="Resend OTP?"
            subHeading="Enter the phone number used while signing up."
            rightImageText="The simplest way to manage your task and services."
            bottomRedirectionQuestion="Already a member?"
            bottomRedirectionText="Log in"
            bottomRedirectionUrl="/auth/login"
        >
            <>
                <Formik
                    initialValues={{
                        phone: "",
                    }}
                    validationSchema={OTPResendSchema}
                    onSubmit={async (values, actions) => {
                        const { phone } = values;
                        resendOtpMutation.mutate(values, {
                            onSuccess: async () => {
                                setPhoneNumber(phone);
                                setOpened(true);
                                actions.resetForm();

                                // router.push({
                                //     pathname: "/login",
                                // });
                            },
                            onError: (error: any) => {
                                const { phone } = error.response.data;
                                actions.setFieldError("phone", phone);
                            },
                        });
                    }}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="login-form">
                            <PhoneNumberField
                                name="phone"
                                labelName="Phone Number"
                                touch={touched.phone}
                                error={errors.phone}
                                fieldRequired
                            />

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
                    )}
                </Formik>
                <OtpModal
                    opened={opened}
                    onClose={() => setOpened(false)}
                    phone={phoneNumber}
                    scope="verify"
                    setShowForm={setOpened}
                />
            </>
        </AuthLayout>
    );
};

export default ResendVerification;
