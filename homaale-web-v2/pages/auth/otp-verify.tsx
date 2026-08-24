import { useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";

import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import NumberField from "@/components/common/form/NumberField";
import PasswordField from "@/components/common/form/PasswordField";
import { toast } from "@/components/common/Toast";
import AuthLayout from "@/components/Layout/AuthLayout";
import urls from "@/constants/urls";
import { axiosClient } from "@/utils/axiosClient";
import { OtpVerifyValidationSchema } from "@/utils/validation/OtpVerifyValidation";

const OtpVerify = () => {
    const theme = useMantineTheme();
    const router = useRouter();

    const { mutate, isLoading } = useMutation(
        (data: {
            otp: string;
            password: string;
            confirm_password: string;
            scope: string;
        }) => {
            return axiosClient.post(urls.auth.verifyOtp, data);
        }
    );

    return (
        <AuthLayout
            heading="Reset your password"
            subHeading="Enter the OTP received and add new Password"
            rightImageText="The simplest way to manage your task and services."
            bottomRedirectionQuestion="Not a member?"
            bottomRedirectionText="Create Account"
            bottomRedirectionUrl="/auth/signup"
        >
            <Formik
                validationSchema={OtpVerifyValidationSchema}
                initialValues={{
                    otp: "",
                    password: "",
                    confirm_password: "",
                    scope: "reset",
                    phone: router.query.phone ?? "",
                }}
                onSubmit={async (values, actions) => {
                    mutate(values, {
                        onSuccess: async () => {
                            actions.resetForm();
                            toast.success(
                                "Successfully Changed your password. Please login with the changed password"
                            );
                            router.push({
                                pathname: "/auth/login",
                            });
                        },
                        onError: (error: any) => {
                            const { otp, password } = error.response.data;
                            actions.setFieldError("otp", otp && otp[0]);
                            actions.setFieldError(
                                "password",
                                password && password[0]
                            );
                        },
                    });
                }}
            >
                {({ errors, touched }) => (
                    <Form className="login-form">
                        <InputField
                            id="otp"
                            name={"otp"}
                            label={"OTP Code"}
                            placeholder="One Time Password"
                            touch={touched.otp}
                            error={errors.otp}
                            data-autofocus
                            withAsterisk
                        />
                        {/* <NumberField
                            id="otp"
                            name={"otp"}
                            placeholder="One Time Password"
                            touch={touched.otp}
                            error={errors.otp}
                            label={"OTP Code"}
                            hideControls
                            withAsterisk
                        /> */}
                        <PasswordField
                            name={"password"}
                            label="Password"
                            placeholder={"Enter new password"}
                            error={errors.password}
                            touch={touched.password}
                            withAsterisk
                        />
                        <PasswordField
                            name="confirm_password"
                            label="Confirm Password"
                            touch={touched.confirm_password}
                            error={errors.confirm_password}
                            placeholder="Confirm Password"
                            withAsterisk
                        />

                        <FormButton
                            tabIndex={3}
                            type="submit"
                            id="login-button"
                            isSubmitting={isLoading}
                            className="reset-btn"
                            name={"Reset"}
                            fullWidth
                            background={theme.colors.homaaleSlate[8]}
                            radius="md"
                            size="md"
                        />
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
};

export default OtpVerify;
