import { CagtuAuLogo, InputField, LoginSignupForm, PasswordInputField } from '@cagtu-cms/ui-shared';
import { Anchor, Button, Group, Loader, useMantineTheme } from '@mantine/core';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { loginFormData, loginSchema, useDark } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import auth from '../../auth/authService';
import { IconMail, IconLock, IconX } from '@tabler/icons';

interface CustomizedState {
    state: {
        from: {
            pathname: string;
        };
    };
}

const accessTokenKey = 'access';
const refreshTokenKey = 'refresh';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();
    const [dark] = useDark();
    const locationState = location as CustomizedState;
    const from = locationState?.state?.from?.pathname || '/';

    if (auth.getJwt()) return <Navigate to="dashboard" replace />;

    return (
        <LoginSignupForm title="Sign in to your account" logo={<CagtuAuLogo width={130} />}>
            <Formik
                initialValues={loginFormData}
                validationSchema={loginSchema}
                onSubmit={async (values, actions) => {
                    actions.setSubmitting(true);
                    try {
                        const response = await auth.login(values);
                        const {
                            data: { access, refresh, is_staff },
                        } = response;

                        if (is_staff) {
                            localStorage.setItem(accessTokenKey, access);
                            localStorage.setItem(refreshTokenKey, refresh);
                            navigate(from, { replace: true });
                        } else {
                            showNotification({
                                title: '⚠️ Permission Denied',
                                message: "You don't have permission to login. Please verify your role to get access",
                                color: 'red',
                                icon: <IconX size={18} />,
                            });
                        }
                        actions.setSubmitting(false);
                    } catch (err: any) {
                        const {
                            data: { password, email },
                        } = err.response;
                        if (err.response && err.response.status === 400) {
                            showNotification({
                                title: 'Uh oh! something went wrong',
                                message: password || email || err.message,
                                color: 'red',
                                icon: <IconX size={18} />,
                            });
                        } else {
                            showNotification({
                                title: 'Uh oh! something went wrong',
                                message: err.message,
                                color: 'red',
                                icon: <IconX size={18} />,
                            });
                        }
                        actions.setSubmitting(false);
                    }
                }}>
                {({ isSubmitting, errors, touched }) => (
                    <Form>
                        <InputField
                            name="username"
                            error={errors.username}
                            touch={touched.username}
                            placeHolder="Enter the username"
                            labelName="Username"
                            size="md"
                            icon={<IconMail size={18} stroke={1.75} />}
                        />
                        <PasswordInputField
                            name="password"
                            error={errors.password}
                            touch={touched.password}
                            labelName="Password"
                            placeHolder="xxxxxxxxxx"
                            size="md"
                            icon={<IconLock size={18} stroke={1.75} />}
                        />
                        <Group position="right">
                            <Anchor
                                component={Link}
                                to="forgot-password"
                                mb={20}
                                size="xs"
                                sx={{
                                    fontWeight: 500,
                                    '&:hover': { textDecoration: 'none', color: dark ? theme.colors['gray'][2] : theme.colors['dark'][7] },
                                }}>
                                Forgot Password?
                            </Anchor>
                        </Group>

                        <Button fullWidth type="submit" size="lg" sx={{ fontSize: 15, fontWeight: 500 }} radius="sm" disabled={isSubmitting}>
                            {isSubmitting ? <Loader size="xs" /> : <span>Sign In</span>}
                        </Button>
                    </Form>
                )}
            </Formik>
        </LoginSignupForm>
    );
};

export default Login;
