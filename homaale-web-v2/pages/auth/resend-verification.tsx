import { useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import React from "react";

import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import { toast } from "@/components/common/Toast";
import AuthLayout from "@/components/Layout/AuthLayout";
import { axiosClient } from "@/utils/axiosClient";
import { emailResendSchema } from "@/utils/validation/LoginFormValidation";

const ResendVerification = () => {
    const theme = useMantineTheme();

    const resendEmailVerificationMutation = useMutation(
        (data: { email: string }) => {
            return axiosClient.post(`/user/resend/email/activation/`, data);
        }
    );

    return (
        <AuthLayout
            heading="Resend Verification?"
            subHeading="Enter the email used while signing up."
            rightImageText="The simplest way to manage your task and services."
            bottomRedirectionQuestion="Already a member?"
            bottomRedirectionText="Log in"
            bottomRedirectionUrl="/auth/login"
        >
            <>
                <Formik
                    initialValues={{
                        email: "",
                    }}
                    validationSchema={emailResendSchema}
                    onSubmit={async (values, actions) => {
                        resendEmailVerificationMutation.mutate(values, {
                            onSuccess: async () => {
                                actions.resetForm();
                                toast.success(
                                    "Email Verification link as been sent to your account."
                                );
                                // router.push({
                                //     pathname: "/auth/login",
                                // });
                            },
                            onError: (error: any) => {
                                const { email } = error.response.data;

                                actions.setFieldError("email", email);
                            },
                        });
                    }}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="login-form">
                            <InputField
                                name="email"
                                label={"Email"}
                                placeholder={"Enter your email"}
                                error={errors.email}
                                touch={touched.email}
                                withAsterisk
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
            </>
        </AuthLayout>
    );
};

export default ResendVerification;
