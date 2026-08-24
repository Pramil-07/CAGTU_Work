import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { FormModal, InputField, SelectField } from '@cagtu-cms/ui-shared';
import { TransactionResult, WithdrawFormValueProps, withdrawSchema } from '@cagtu-cms/util-formatter';
import { Alert, Button, Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconArrowRight, IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';

const withdrawInitialData: WithdrawFormValueProps = {
    payment_method: '',
    intent_id: '',
};

type WithdrawProcessProps = {
    data?: TransactionResult;
};
const urlsPath = urls?.cipher?.payment;

const WithdrawProcess = ({ data: withdrawData }: WithdrawProcessProps) => {
    const queryClient = useQueryClient();
    const [withdrawFormModal, setWithdrawFormModal] = useState(false);
    const [withdrawFormData, setWithdrawFormData] = useState<WithdrawFormValueProps>({
        ...withdrawInitialData,
    });
    const [paymentMethodsOptions, setPaymentMethodsOptions] = useState<{ value: string; label: string }[]>([]);

    // Wallet list query
    const paymentMethodsAPI = new CipherAPI(urlsPath?.paymentMethods);
    const { isLoading } = useQuery(['payment-method-list'], () => paymentMethodsAPI.list(), {
        onSuccess: (response) => {
            const { data } = response;
            const options = data?.map((option: { id: string; name: string }) => {
                return {
                    value: option?.id ?? '',
                    label: option?.name ?? '',
                };
            });
            setPaymentMethodsOptions(options);
        },
    });

    useEffect(() => {
        setWithdrawFormData({
            ...withdrawInitialData,
        });
    }, []);

    // Withdraw process mutation query
    const withdrawAPI = new CipherAPI(urlsPath?.withdraw);
    const withdrawMutation = useMutation((data: WithdrawFormValueProps) => withdrawAPI.storeWithIdAndDataPutMethod(data, withdrawData?.id as string));

    const onWithdrawCreate = (formData: WithdrawFormValueProps, actions: FormikHelpers<WithdrawFormValueProps>) => {
        withdrawMutation.mutate(formData, {
            onSuccess: () => {
                actions.resetForm();
                setWithdrawFormModal(false);
                showNotification({
                    title: `Congrats! withdraw process has been completed`,
                    message: '',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['transaction-history-detail', withdrawData?.id]);
                queryClient.invalidateQueries(['withdraw-request-list']);
            },
            onError: (error: any) => {
                const {
                    data: { message, non_field_errors },
                } = error.response;
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: (message || non_field_errors) ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    return (
        <>
            <Button
                onClick={() => {
                    setWithdrawFormModal(true);
                }}
                variant="default"
                color="gray"
                size={'xs'}
                sx={{ fontWeight: 500, fontSize: 12 }}
                rightIcon={<IconArrowRight size={20} />}>
                Proceed to withdraw
            </Button>
            <Formik
                enableReinitialize
                initialValues={withdrawFormData}
                validationSchema={withdrawSchema}
                onSubmit={(values, actions) => {
                    onWithdrawCreate(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => {
                    return (
                        <FormModal
                            opened={withdrawFormModal}
                            onClose={() => {
                                handleReset();
                                setWithdrawFormModal(false);
                            }}
                            title={`Withdraw Process`}
                            onConfirm={handleSubmit}
                            confirmButtonText={`Proceed`}
                            loading={withdrawMutation?.isLoading}
                            size="md">
                            <Form>
                                <Alert icon={<IconAlertCircle size="1rem" />} title="Note!" color="red" mb={20}>
                                    This is a just a representation of withdraw used within our system for status and history tracking. This has
                                    nothing to do with automated transaction and related transactions have to be managed manually.
                                </Alert>
                                <SelectField
                                    name="payment_method"
                                    labelName="Payment Method"
                                    placeHolder="Select Payment Method"
                                    error={errors.payment_method}
                                    touch={touched.payment_method}
                                    options={paymentMethodsOptions}
                                    handleChange={(value) => {
                                        setFieldValue('payment_method', value);
                                    }}
                                    disabled={isLoading}
                                    rightSection={isLoading && <Loader size={20} />}
                                    withAsterisk
                                />
                                <InputField
                                    name="intent_id"
                                    error={errors.intent_id}
                                    touch={touched.intent_id}
                                    labelName="Transaction Id"
                                    placeHolder="Enter transaction id"
                                    textMuted="Note: Here we have to use transaction id of related transaction which was done manually"
                                    withAsterisk
                                />
                            </Form>
                        </FormModal>
                    );
                }}
            </Formik>
        </>
    );
};

export default WithdrawProcess;
