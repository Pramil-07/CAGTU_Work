import { Flex, Text, useMantineTheme } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import PasswordField from "@/components/common/form/PasswordField";
import AuthLayout from "@/components/Layout/AuthLayout";
import { login } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { getFCMTOKEN } from "@/utils/helpers";
import { LoginValidationSchema } from "@/utils/validation/LoginFormValidation";

const Login = () => {
    const dispatch = useAppDispatch();
    const theme = useMantineTheme();

    const router = useRouter();

    const { isLoading = false } = useAppSelector((state) => state?.authReducer);
    const queryClient = useQueryClient();
    console.log("router path ",router.query)
    const [nextUrl, setNextUrl] = useState<string | null>(null);

    useEffect(() => {
        if (router.isReady) {
            const next = router.query.next as string | undefined;
            const urlParams = new URLSearchParams(window.location.search);
            const nextFromUrl = urlParams.get("next");
            setNextUrl(nextFromUrl && nextFromUrl.startsWith("/") ? nextFromUrl : null);
        }
      }, [router.isReady, router.query]);
    return (
        <AuthLayout
            heading="Get started now"
            subHeading="Enter your credentials to access your account"
            rightImageText="The simplest way to manage your task and services."
            bottomRedirectionQuestion="Not a member?"
            bottomRedirectionText="Create Account"
            bottomRedirectionUrl="/auth/signup"

        >
            <Formik
                validationSchema={LoginValidationSchema}
                initialValues={{
                    username: "",
                    password: "",
                    fcm_token: "",
                }}
                onSubmit={async (values, action) => {
                    const token = await getFCMTOKEN();
                    const newValues = {
                        ...values,
                        fcm_token: token ?? null,
                    };
                    dispatch(login(newValues))
                        .unwrap()
                        .then(() => {
                            queryClient.invalidateQueries(["profile-data"]);
                            const referrer = document.referrer;
                            const isFromSameDomain = referrer &&   (
                                referrer.includes("localhost:3005") ||
                                referrer.includes("homaale.com") ||
                                referrer.includes("test-develop.d2y8k8uakte57r.amplifyapp.com")
                            );
                            if (nextUrl) {
                                router.replace(nextUrl);
                            } else if (window.history.length > 1 && isFromSameDomain) {
                                router.back();
                            } else {
                                router.replace("/#");
                            }
                        })
                        .catch((error) => {
                            const { username, password } = error;
                            action.setFieldError(
                                "username",
                                username && username[0]
                            );
                            action.setFieldError(
                                "password",
                                password && password[0]
                            );
                        });
                }}
            >
                {({ errors, touched }) => (
                    <Form className="login-form">
                        <InputField
                            tabIndex={1}
                            name={"username"}
                            label={"Username"}
                            placeholder={"Username, email or phone number"}
                            error={errors.username}
                            touch={touched.username}
                            withAsterisk
                        />
                        <PasswordField
                            name={"password"}
                            tabIndex={2}
                            placeholder={"Enter your password"}
                            error={errors.password}
                            touch={touched.password}
                            hasForgot
                            withAsterisk
                        />
                        <Flex mb={8} mt={-8}>
                            <Link href={"/auth/resend-verification"}>
                                <Text component="span" size={13} weight={500}>
                                    Didn&apos;t get verification email?
                                </Text>
                            </Link>

                            <Link href={"/auth/resend-otp"}>
                                <Text component="span" size={13} weight={500}>
                                    Didn&apos;t get OTP?
                                </Text>
                            </Link>
                        </Flex>
                        <FormButton

                            tabIndex={3}

                            type="submit"
                            id="login-button"
                            isSubmitting={isLoading}
                            className="login-btn"
                            name={"Login"}
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

export default Login;
