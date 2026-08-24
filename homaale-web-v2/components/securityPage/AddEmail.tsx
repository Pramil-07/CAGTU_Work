import { Box, Button, Group, useMantineTheme } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";

import urls from "@/constants/urls";
import { useUser } from "@/hooks/useUser";
import { axiosClient } from "@/utils/axiosClient";
import { addEmailSchema } from "@/utils/validation/AddEmailValidation";

import FormButton from "../common/form/FormButton";
import InputField from "../common/form/InputField";
import PasswordField from "../common/form/PasswordField";
import PopUp from "../common/PopUp";

export interface changeEmailValueProps {
    email: string | null | undefined;
    password: string;
}
const AddEmail = () => {
    const theme = useMantineTheme();
    const { data: userData } = useUser();

    const [popUpOpened, setPopUpOpened] = useState(false);
    const changeEmail = useMutation((values: changeEmailValueProps) => {
        return axiosClient.post(urls.tasker.changeEmail, values);
    });

    return (
        <>
            <Formik
                initialValues={{
                    email: userData ? userData?.email : "",
                    password: "",
                }}
                validationSchema={addEmailSchema}
                onSubmit={(values, actions) =>
                    changeEmail.mutate(values, {
                        onSuccess: () => {
                            actions.setSubmitting(false);
                            setPopUpOpened(true);
                            actions.resetForm();
                        },
                        onError: (error: any) => {
                            actions.setSubmitting(false);
                            const { email, password } = error.response.data;

                            actions.setFieldError("email", email && email[0]);
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
                            <InputField
                                name={"email"}
                                label={"Email"}
                                placeholder={"Enter your phone or email"}
                                error={errors.email}
                                touch={touched.email}
                                withAsterisk
                            />
                            <PasswordField
                                name="password"
                                label="Password"
                                placeholder="Your Password"
                                withAsterisk
                                error={errors.password}
                                touch={touched.password}
                            />

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
            <PopUp
                opened={popUpOpened}
                setPopUpOpened={setPopUpOpened}
                heading={"Verification email sent."}
                subHeading={
                    "Verification email has been sent to the specified email address."
                }
            />
        </>
    );
};

export default AddEmail;
