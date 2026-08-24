import { auth, http, urls } from '@cagtu-cms/data-access';
import { LoginSignupForm, PasswordInputField } from '@cagtu-cms/ui-shared';
import { passwordValidate, useDark } from '@cagtu-cms/util-formatter';
import { Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { Form, Formik } from 'formik';
import { Navigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';

interface ResetPasswordProps {
    new_password1: string;
    new_password2: string;
}

const ResetPassword = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const [searchParams] = useSearchParams();

    const formData: ResetPasswordProps = {
        new_password1: '',
        new_password2: '',
    };

    const uid = searchParams.get('u');
    const token = searchParams.get('t');

    const resetPasswordSchema = Yup.object().shape({
        new_password1: passwordValidate,
        new_password2: Yup.string()
            .when('new_password1', {
                is: (val: string) => (val && val.length > 0 ? true : false),
                then: Yup.string().oneOf([Yup.ref('new_password1')], 'Password must match'),
            })
            .required('Required field'),
    });

    if ((!uid && !token) || auth.getCurrentUser()) return <Navigate to="/" replace />;

    return (
        <LoginSignupForm title="Create new password">
            <Text mb={30} sx={{ fontSize: 13, color: dark ? theme.colors.dark[2] : theme.colors.dark[3] }}>
                Your new password must be different from previous used passwords.
            </Text>
            <Formik
                initialValues={formData}
                validationSchema={resetPasswordSchema}
                onSubmit={async (values, actions) => {
                    actions.setSubmitting(true);
                    try {
                        const response = await http.post(`${urls.reset_password}/${uid}/${token}`, values);
                        showNotification({
                            title: 'Yay! Password Changed.',
                            message: response.data.message,
                            color: 'green',
                            icon: <IconCheck size={18} />,
                        });
                        actions.setSubmitting(false);
                        actions.resetForm();
                        searchParams.delete('u');
                        searchParams.delete('t');
                    } catch (err: any) {
                        if (err.response && err.response.status === 400) {
                            showNotification({
                                title: 'Uh oh! something went wrong',
                                message: err.message,
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
                        <PasswordInputField
                            name="new_password1"
                            error={errors.new_password1}
                            touch={touched.new_password1}
                            labelName="New Password"
                        />
                        <PasswordInputField
                            name="new_password2"
                            error={errors.new_password2}
                            touch={touched.new_password2}
                            labelName="Confirm New Password"
                        />

                        <Button fullWidth type="submit" size="lg" sx={{ fontSize: 15, fontWeight: 500 }} radius="sm" mb={20} disabled={isSubmitting}>
                            {isSubmitting ? <Loader size="xs" /> : <span>Reset Password</span>}
                        </Button>
                    </Form>
                )}
            </Formik>
        </LoginSignupForm>
    );
};

export default ResetPassword;
