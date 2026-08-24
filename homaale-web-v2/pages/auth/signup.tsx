import {
    Box,
    Checkbox,
    Flex,
    Group,
    Radio,
    useMantineTheme,
} from "@mantine/core";
import { IconDeviceMobile, IconMail } from "@tabler/icons-react";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import Link from "next/link";
import React, { useState } from "react";

import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import PasswordField from "@/components/common/form/PasswordField";
import PhoneNumberField from "@/components/common/form/PhoneNumberField";
import { toast } from "@/components/common/Toast";
import AuthLayout from "@/components/Layout/AuthLayout";
import OtpModal from "@/components/OtpModal";
import { useSignup } from "@/hooks/useSignup";
import { useLoginSignupRadioStyles } from "@/styles/components/LoginSignupRadioStyles";
import { SignUpFormData } from "@/utils/formData/SignUpFormData";
import {
    emailSignUpSchema,
    phoneSignUpSchema,
} from "@/utils/validation/SignupFormValidation";

const Signup = () => {
    const [choosedValue, setChoosedValue] = useState("email");
    const theme = useMantineTheme();

    const [phoneNumber, setPhoneNumber] = useState<string>("");

    const [opened, setOpened] = useState(false);
    const onClose = () => setOpened(false);

    const { mutate, isLoading } = useSignup();

    const { classes } = useLoginSignupRadioStyles();

    return (
        <AuthLayout
            heading="Create an Account"
            subHeading="Please tell us bit about yourself so that we can enhance your experience."
            rightImageText="The simplest way to manage your task and services."
            bottomRedirectionQuestion="Already a member?"
            bottomRedirectionText="Login"
            bottomRedirectionUrl="/auth/login"
        >
            <Formik
                initialValues={SignUpFormData}
                validationSchema={
                    choosedValue === "email"
                        ? emailSignUpSchema
                        : phoneSignUpSchema
                }
                onSubmit={async (values, actions) => {
                    const { email, password, confirmPassword, phone } = values;

                    const payloadValue = () => {
                        if (!phone) return { email, password, confirmPassword };
                        if (!email) return { phone, password, confirmPassword };
                        return { phone, email, password, confirmPassword };
                    };
                    mutate(
                        {
                            ...payloadValue(),
                        },
                        {
                            onSuccess: async () => {
                                actions.resetForm();
                                if (
                                    choosedValue === "phone" &&
                                    phone !== undefined
                                ) {
                                    Cookies.set("phone", phone);
                                    setPhoneNumber(phone);
                                    setOpened(true);
                                }
                                if (
                                    choosedValue === "email" &&
                                    email !== undefined
                                ) {
                                    Cookies.set("email", email);
                                }
                                choosedValue === "email"
                                    ? toast.success(
                                          "Verification email has been sent to your email address."
                                      )
                                    : toast.success(
                                          "An OTP has been sent to your mobile number.Please enter that otp and new password"
                                      );
                            },
                            onError: (error: any) => {
                                const { email, password, phone } =
                                    error.response.data;

                                actions.setFieldError(
                                    "email",
                                    email && email[0]
                                );
                                actions.setFieldError(
                                    "password",
                                    password && password[0]
                                );
                                actions.setFieldError(
                                    "phone",
                                    phone && phone[0]
                                );
                            },
                        }
                    );
                }}
            >
                {({ errors, touched, setFieldValue, values }) => (
                    <>
                        <div className={classes.radioWrapper}>
                            <Radio.Group
                                label="Create your account using."
                                onChange={(value) => {
                                    setChoosedValue(value);
                                    setFieldValue("email", "");
                                    setFieldValue("phone", "");
                                    setFieldValue("password", "");
                                    setFieldValue("confirmPassword", "");
                                }}
                                size="md"
                                defaultValue="email"
                            >
                                <Group mt={8}>
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
                                    name={"email"}
                                    label={"Email"}
                                    placeholder={"Enter your phone or email"}
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

                            <PasswordField
                                name={"password"}
                                label="Password"
                                placeholder={"Enter your password"}
                                error={errors.password}
                                touch={touched.password}
                                withAsterisk
                            />
                            <PasswordField
                                name="confirmPassword"
                                label="Confirm Password"
                                touch={touched.confirmPassword}
                                error={errors.confirmPassword}
                                placeholder="Confirm Password"
                                withAsterisk
                            />
                            {/* terms and conditions */}

                            <Checkbox
                                label={
                                    <>
                                        I agree to the{" "}
                                        <Link href="/homaale-terms-conditions">
                                            terms & conditions{" "}
                                        </Link>
                                        and{" "}
                                        <Link href="/homaale-privacy-policy">
                                            privacy policy
                                        </Link>
                                        .
                                    </>
                                }
                                mb={10}
                                checked={values.acceptTerms}
                                onChange={(event) =>
                                    setFieldValue(
                                        "acceptTerms",
                                        event.target.checked
                                    )
                                }
                                error={
                                    touched.acceptTerms && errors.acceptTerms
                                        ? errors?.acceptTerms
                                        : null
                                }
                            />
                            <FormButton
                                type="submit"
                                id="login-button"
                                isSubmitting={isLoading}
                                className="login-btn"
                                name={"Sign up"}
                                fullWidth
                                background={theme.colors.homaaleSlate[8]}
                                radius="md"
                                size="md"
                                mt={8}
                            />
                        </Form>
                    </>
                )}
            </Formik>
            <OtpModal
                opened={opened}
                onClose={onClose}
                phone={phoneNumber}
                scope="verify"
                setShowForm={setOpened}
            />
        </AuthLayout>
    );
};

export default Signup;
