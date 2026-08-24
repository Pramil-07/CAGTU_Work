import { Box, Button, Group, useMantineTheme } from "@mantine/core";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

import { logout } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks";
import { useChangePassword } from "@/hooks/usePasswordChange";
import changePasswordSchema, {
    addPasswordSchema,
} from "@/utils/validation/ChangePasswordValidation";

import FormButton from "../common/form/FormButton";
import PasswordField from "../common/form/PasswordField";
import { toast } from "../common/Toast";

const ChangePassword = () => {
    const theme = useMantineTheme();
    const { mutate } = useChangePassword();
    const googleToken = Cookies.get("credentials");

    const dispatch = useAppDispatch();
    const router = useRouter();

    return (
        <Formik
            initialValues={{
                old_password: googleToken ? null : "",
                new_password: "",
                confirm_password: "",
                social_token: googleToken ? googleToken : null,
            }}
            validationSchema={
                googleToken ? addPasswordSchema : changePasswordSchema
            }
            onSubmit={(values, actions) =>
                mutate(values, {
                    onSuccess: () => {
                        actions.setSubmitting(false);
                        actions.resetForm();
                        toast.success("success");
                        dispatch(logout());
                        router.push("/auth/login");
                    },
                    onError: (error: any) => {
                        actions.setSubmitting(false);
                        const { old_password, new_password, confirm_password } =
                            error.response.data;
                        actions.setFieldError(
                            "old_password",
                            old_password && old_password[0]
                        );
                        actions.setFieldError(
                            "new_password",
                            new_password && new_password[0]
                        );
                        actions.setFieldError(
                            "confirm_password",
                            confirm_password && confirm_password[0]
                        );
                    },
                })
            }
        >
            {({ errors, touched, isSubmitting, resetForm }) => (
                <Form>
                    <Group grow style={{ alignItems: "start" }}>
                        <Box
                            sx={{
                                maxWidth: 600,
                                [`@media (max-width: ${theme.breakpoints.md}px)`]:
                                    {
                                        maxWidth: "100%",
                                    },
                            }}
                        >
                            {!googleToken && (
                                <PasswordField
                                    name="old_password"
                                    label="Current Password"
                                    placeholder={"Current Password"}
                                    error={errors.old_password}
                                    touch={touched.old_password}
                                    withAsterisk
                                />
                            )}
                            <PasswordField
                                name="new_password"
                                label="New Password"
                                touch={touched.new_password}
                                error={errors.new_password}
                                placeholder="New Password"
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
                            <Group>
                                <Button
                                    id="cancel-change-password"
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
                        <Box
                            sx={{
                                backgroundColor: "#3EAEFF20",
                                padding: 24,
                                borderRadius: 8,
                                color: theme.colors.gray[7],
                                maxWidth: 380,
                                marginLeft: 32,
                                [`@media (max-width: ${theme.breakpoints.md}px)`]:
                                    {
                                        maxWidth: "100%",
                                        marginLeft: 0,
                                    },
                                "& p, ul>li": {
                                    color:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : theme.colors.homaaleSlate[6],
                                },
                            }}
                        >
                            <div>
                                <h4>Rules for Password</h4>
                                <p>
                                    To create a new password, you have to meet
                                    all of the following requirements.
                                </p>
                                <ul>
                                    <li>Minimum 8 characters</li>
                                    <li>At least one numeric value</li>
                                    <li>At least on uppercase aplhabet</li>
                                    <li>At least one special character</li>
                                </ul>
                            </div>
                        </Box>
                    </Group>
                </Form>
            )}
        </Formik>
    );
};

export default ChangePassword;
