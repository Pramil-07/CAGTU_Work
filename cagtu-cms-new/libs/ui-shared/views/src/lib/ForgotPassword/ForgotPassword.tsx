import { auth, http, urls } from '@cagtu-cms/data-access';
import { InputField, LoginSignupForm } from '@cagtu-cms/ui-shared';
import { useDark } from '@cagtu-cms/util-formatter';
import { Anchor, Button, Group, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconMail, IconX } from '@tabler/icons';
import { Form, Formik } from 'formik';
import { Link, Navigate } from 'react-router-dom';
import * as Yup from 'yup';

interface ForgotPasswordProps {
    email: string;
}

const ForgotPassword = () => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    const formData: ForgotPasswordProps = {
        email: '',
    };

    const forgotPasswordSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required field'),
    });

    if (auth.getCurrentUser()) return <Navigate to="/" replace />;

    return (
        <LoginSignupForm title="Forgot your password?">
            <Text mb={30} sx={{ fontSize: 13, color: dark ? theme.colors.dark[2] : theme.colors.dark[3] }}>
                Enter the email address you signed up with and wait for your recovery details to be sent.
            </Text>
            <Formik
                initialValues={formData}
                validationSchema={forgotPasswordSchema}
                onSubmit={async (values, actions) => {
                    actions.setSubmitting(true);
                    try {
                        const response = await http.post(urls.forgot_password, values);
                        showNotification({
                            title: 'Yay! Password reset request sent',
                            message: response.data.message,
                            color: 'green',
                            icon: <IconCheck size={18} />,
                        });
                        actions.setSubmitting(false);
                        actions.resetForm();
                    } catch (err: any) {
                        if (err.response && err.response.status === 400) {
                            const {
                                data: { email },
                            } = err.response;
                            showNotification({
                                title: 'Uh oh! something went wrong',
                                message: email && email[0],
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
                            name="email"
                            error={errors.email}
                            touch={touched.email}
                            placeHolder="your@email.com"
                            labelName="Email Address"
                            size="md"
                            icon={<IconMail size={18} />}
                        />

                        <Button fullWidth type="submit" size="lg" sx={{ fontSize: 15, fontWeight: 500 }} radius="sm" mb={20} disabled={isSubmitting}>
                            {isSubmitting ? <Loader size="xs" /> : <span>Send</span>}
                        </Button>
                    </Form>
                )}
            </Formik>
            <Group position="left">
                <Text
                    size="xs"
                    sx={{
                        fontSize: 13,
                        color: dark ? theme.colors.dark[2] : theme.colors.dark[3],
                        a: { '&:hover': { textDecoration: 'none', color: dark ? theme.colors.gray[2] : theme.colors.dark[7] } },
                    }}>
                    Did you remember your password?{' '}
                    <Anchor component={Link} to="/" size="xs">
                        Sign In
                    </Anchor>
                </Text>
            </Group>
        </LoginSignupForm>
    );
};

export default ForgotPassword;
