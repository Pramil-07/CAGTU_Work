import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { FormModal, InputField, SelectField } from '@cagtu-cms/ui-shared';
import { PenalizedUserOptionsProps, RefundFormValueProps, RefundResult, refundSchema } from '@cagtu-cms/util-formatter';
import { Avatar, Button, Group, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconArrowRight, IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { forwardRef, useEffect, useState } from 'react';

const refundInitialData: RefundFormValueProps = {
    booking: '',
    charge: '',
    penalized_user: '',
    type: '',
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    profile_image: string;
    label: string;
    username: string;
}

type RefundProcessProps = {
    data?: RefundResult;
    page?: number;
    limitChange?: string;
    handleDetailModalClose: () => void;
};
const urlsPath = urls?.cipher?.payment;

const RefundProcess = ({ data, page, limitChange, handleDetailModalClose }: RefundProcessProps) => {
    const queryClient = useQueryClient();
    const [refundFormModal, setRefundFormModal] = useState(false);
    const [penalizedUserOptions, setPenalizedUserOptions] = useState<PenalizedUserOptionsProps[]>([]);
    const [refundFormData, setServiceOfferFormData] = useState<RefundFormValueProps>({
        ...refundInitialData,
    });

    useEffect(() => {
        setPenalizedUserOptions([
            {
                value: data?.approved_by?.id ?? '',
                label: data?.approved_by?.full_name ?? '',
                profile_image: data?.approved_by?.profile_image ?? '',
                username: data?.approved_by?.username ?? '',
            },
            {
                value: data?.created_by?.user?.id ?? '',
                label: data?.created_by?.user?.full_name ?? '',
                profile_image: data?.created_by?.profile_image ?? '',
                username: data?.created_by?.user?.username ?? '',
            },
        ]);
        setServiceOfferFormData({
            ...refundInitialData,
            booking: data?.id ?? '',
        });
    }, [
        data?.approved_by?.full_name,
        data?.approved_by?.id,
        data?.approved_by?.profile_image,
        data?.approved_by?.username,
        data?.created_by?.profile_image,
        data?.created_by?.user?.full_name,
        data?.created_by?.user?.id,
        data?.created_by?.user?.username,
        data?.id,
    ]);

    // Refund process mutation query
    const refundListAPI = new CipherAPI(urlsPath?.refund);
    const refundMutation = useMutation((data: RefundFormValueProps) => refundListAPI.store(data));

    const onRefundCreate = (formData: RefundFormValueProps, actions: FormikHelpers<RefundFormValueProps>) => {
        refundMutation.mutate(formData, {
            onSuccess: (data) => {
                actions.resetForm();
                setRefundFormModal(false);
                handleDetailModalClose();
                showNotification({
                    title: `Congrats! refund process has been completed`,
                    message: '',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['refund-list', page, limitChange]);
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const UserSelectItem = forwardRef<HTMLDivElement, ItemProps>(({ profile_image, label, username, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group noWrap>
                <Avatar src={profile_image} />
                <div>
                    <Text size="sm">{label}</Text>
                    <Text size="xs" opacity={0.65}>
                        @{username}
                    </Text>
                </div>
            </Group>
        </div>
    ));

    return (
        <>
            <Button
                onClick={() => {
                    setRefundFormModal(true);
                }}
                variant="default"
                color="gray"
                size="xs"
                sx={{ fontWeight: 500, fontSize: 12 }}
                rightIcon={<IconArrowRight size={20} />}>
                Proceed to refund
            </Button>
            <Formik
                enableReinitialize
                initialValues={refundFormData}
                validationSchema={refundSchema}
                onSubmit={(values, actions) => {
                    onRefundCreate(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => {
                    return (
                        <FormModal
                            opened={refundFormModal}
                            onClose={() => {
                                handleReset();
                                setRefundFormModal(false);
                            }}
                            title={`Refund Process`}
                            onConfirm={handleSubmit}
                            confirmButtonText={`Proceed`}
                            loading={refundMutation?.isLoading}
                            size="md">
                            <Form>
                                <SelectField
                                    name="type"
                                    labelName="Refund Type"
                                    placeHolder="Select Refund Type"
                                    error={errors.type}
                                    touch={touched.type}
                                    options={
                                        data?.is_paid
                                            ? [
                                                  {
                                                      value: 'refund',
                                                      label: 'Refund',
                                                  },
                                                  {
                                                      value: 'penalty',
                                                      label: 'Penalty',
                                                  },
                                                  {
                                                      value: 'compensate',
                                                      label: 'Compensate',
                                                  },
                                              ]
                                            : [
                                                  {
                                                      value: 'penalty',
                                                      label: 'Penalty',
                                                  },
                                              ]
                                    }
                                    handleChange={(value) => {
                                        setFieldValue('penalized_user', '');
                                        setFieldValue('type', value);
                                    }}
                                    withAsterisk
                                />
                                {values?.type === 'penalty' && (
                                    <SelectField
                                        name="penalized_user"
                                        labelName="Penalize User"
                                        placeHolder="Select User to penalize"
                                        error={errors.penalized_user}
                                        touch={touched.penalized_user}
                                        itemComponent={UserSelectItem}
                                        options={penalizedUserOptions}
                                        handleChange={(value) => {
                                            setFieldValue('penalized_user', value);
                                        }}
                                        withAsterisk
                                    />
                                )}
                                <InputField
                                    name="charge"
                                    error={errors.charge}
                                    touch={touched.charge}
                                    labelName="Charge"
                                    placeHolder="Enter charge"
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

export default RefundProcess;
