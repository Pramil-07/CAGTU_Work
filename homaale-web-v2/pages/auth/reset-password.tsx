import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";

import FormButton from "@/components/common/form/FormButton";
import PasswordField from "@/components/common/form/PasswordField";
import NotFound from "@/components/common/NotFound";
import { toast } from "@/components/common/Toast";
import AuthLayout from "@/components/Layout/AuthLayout";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { useLoginSignupRadioStyles } from "@/styles/components/LoginSignupRadioStyles";
import type { ResetPasswordPayload } from "@/types/ResetPasswordPayload";
import { axiosClient } from "@/utils/axiosClient";
import { ResetPasswordValidationSchema } from "@/utils/validation/ResetPasswordValidation";

const ResetPassword = () => {
    const { theme } = useLoginSignupRadioStyles();
    const [errorAlertMsg, setErrorAlertMsg] = useState("");

    const router = useRouter();
    const { u, t } = router.query;
    const uid = u;
    const token = t;

    const { mutate, isLoading } = useMutation<any, Error, ResetPasswordPayload>(
        (data) => {
            return axiosClient.post(urls.auth.resetPassword, data);
        }
    );

    return (
        <>
            {(!uid || !token) && (
                <Layout>
                    <NotFound />
                </Layout>
            )}
            {uid && token && (
                <AuthLayout
                    heading="Reset password?"
                    subHeading="No worries, we'll send you reset instructions."
                    rightImageText="The simplest way to manage your task and services."
                    bottomRedirectionQuestion="Already a member?"
                    bottomRedirectionText="Log in"
                    bottomRedirectionUrl="/auth/login"
                >
                    <>
                        <Formik
                            initialValues={{
                                password: "",
                                confirm_password: "",
                            }}
                            validationSchema={ResetPasswordValidationSchema}
                            onSubmit={(values, actions) => {
                                const payload: ResetPasswordPayload = {
                                    uid,
                                    token,
                                    ...values,
                                };
                                mutate(payload, {
                                    onSuccess: async () => {
                                        toast.success(
                                            "Password changed successfully."
                                        );
                                        actions.resetForm();
                                        router.push("/auth/login");
                                    },
                                    onError: (error: any) => {
                                        const { password, token } =
                                            error.response.data;
                                        actions.setFieldError(
                                            "password",
                                            password
                                        );
                                        token && setErrorAlertMsg(token);
                                    },
                                });
                            }}
                        >
                            {({ errors, touched }) => (
                                <>
                                    <Form className="login-form">
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
                                        {errorAlertMsg !== "" && (
                                            <Alert
                                                icon={<IconAlertCircle />}
                                                title="Oops!"
                                                color="red"
                                                withCloseButton={true}
                                                mb={16}
                                                onClose={() =>
                                                    setErrorAlertMsg("")
                                                }
                                            >
                                                {errorAlertMsg}
                                            </Alert>
                                        )}

                                        <FormButton
                                            type="submit"
                                            id="login-button"
                                            isSubmitting={isLoading}
                                            className="login-btn"
                                            name={"Submit"}
                                            fullWidth
                                            background={
                                                theme.colors.homaaleSlate[8]
                                            }
                                            radius="md"
                                            size="md"
                                        />
                                    </Form>
                                </>
                            )}
                        </Formik>
                    </>
                </AuthLayout>
            )}
        </>
    );
};

export default ResetPassword;
