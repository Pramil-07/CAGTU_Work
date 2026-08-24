import { Box, Button, Group, Text, useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import Link from "next/link";
import { useState } from "react";

import urls from "@/constants/urls";
import { useUser } from "@/hooks/useUser";
import { axiosClient } from "@/utils/axiosClient";
import { addPhoneSchema } from "@/utils/validation/AddPhoneValidation";

import FormButton from "../common/form/FormButton";
import PasswordField from "../common/form/PasswordField";
import PhoneNumberField from "../common/form/PhoneNumberField";
import { toast } from "../common/Toast";
import OtpModal from "../OtpModal";

export interface changePhoneValueProps {
    phone: string | null | undefined;
    password: string;
}
const AddPhone = () => {
    const theme = useMantineTheme();
    const { data: userData } = useUser();

    const [phoneNumber, setPhoneNumber] = useState<string>("");

    const [opened, setOpened] = useState(false);
    const onClose = () => setOpened(false);

    const changePhoneNumber = useMutation((values: changePhoneValueProps) => {
        return axiosClient.post(urls.tasker.changephone, values);
    });
    return (
        <>
            <Formik
                initialValues={{
                    phone: userData ? userData?.phone : "",
                    password: "",
                }}
                validationSchema={addPhoneSchema}
                onSubmit={(values, actions) =>
                    changePhoneNumber.mutate(values, {
                        onSuccess: (data) => {
                            actions.setSubmitting(false);
                            toast.success("success");
                            setPhoneNumber(data?.data?.phone);
                            Cookies.set("phone", data?.data?.phone);
                            setOpened(true);
                            actions.resetForm();
                        },
                        onError: (error: any) => {
                            actions.setSubmitting(false);
                            const { phone, password } = error.response.data;

                            actions.setFieldError("phone", phone && phone[0]);
                            actions.setFieldError(
                                "password",
                                password && password[0]
                            );
                        },
                    })
                }
            >
                {({ errors, touched, isSubmitting, resetForm }) => (
                    <Form>
                        <Box sx={{ maxWidth: 600 }}>
                            <PhoneNumberField
                                name="phone"
                                labelName="Phone Number"
                                error={errors.phone as string}
                                touch={touched.phone as boolean}
                                fieldRequired
                            />
                            <PasswordField
                                name="password"
                                label="Password"
                                placeholder="Your Password"
                                withAsterisk
                                error={errors.password}
                                touch={touched.password}
                            />
                            <Text mt={-16} mb={16}>
                                Phone number already added?{" "}
                                <Link href={"/auth/resend-otp"}>
                                    <Text
                                        component="span"
                                        size={14}
                                        weight={500}
                                        color="green.7"
                                    >
                                        Resend OTP
                                    </Text>
                                </Link>
                            </Text>

                            <Group>
                                <Button
                                    id="cancel-add-phone"
                                    variant="outline"
                                    onClick={() => resetForm()}
                                >
                                    Cancel
                                </Button>
                                <FormButton
                                    type="submit"
                                    id="login-button"
                                    isSubmitting={isSubmitting}
                                    className="login-btn"
                                    name={"Update"}
                                    background={theme.colors.brand[4]}
                                />
                            </Group>
                        </Box>
                    </Form>
                )}
            </Formik>
            <OtpModal
                opened={opened}
                onClose={onClose}
                phone={phoneNumber}
                scope="change number"
                setShowForm={setOpened}
            />
        </>
    );
};

export default AddPhone;
