import { FormModal, PaperBox, TextAreaField } from '@cagtu-cms/ui-shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import {
    CipherUserContext,
    UserWalletFormValueProps,
    UserWalletResult,
    getPageLimit,
    useDataLimit,
    userWalletWithdrawSchema,
} from '@cagtu-cms/util-formatter';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import UserWalletTable from './UserWalletsTable';
import { Form, Formik, FormikHelpers } from 'formik';
import { Alert } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../../components/common/BlockedPageMessage';

const userWalletInitialData: UserWalletFormValueProps = {
    description: '',
    receiver: '',
};

const urlsPath = urls?.cipher?.payment;

const UserWallets = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [userWalletDetailModal, setUserWalletDetailModal] = useState(false);
    const [userWalletFormData, setUserWalletFormData] = useState<UserWalletFormValueProps>({
        ...userWalletInitialData,
    });

    // UserWallets list get api
    const userWalletListAPI = new CipherAPI(urlsPath?.userWallet);
    const {
        isLoading,
        isFetching,
        isSuccess,
        data: userWalletsData,
    } = useQuery(['user-wallet-list', page, limitChange], () => userWalletListAPI.list({ search: query, page, page_size: limitChange }));

    // User wallet withdraw process mutation query
    const withdrawAPI = new CipherAPI(urlsPath?.userWalletWithdraw);
    const withdrawMutation = useMutation((data: UserWalletFormValueProps) => withdrawAPI.store(data));

    const onWithdrawCreate = (formData: UserWalletFormValueProps, actions: FormikHelpers<UserWalletFormValueProps>) => {
        withdrawMutation.mutate(formData, {
            onSuccess: () => {
                actions.resetForm();
                handleDetailModalClose();
                showNotification({
                    title: `Congrats! withdraw process has been completed.Please Check transaction history for status`,
                    message: '',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['user-wallet-list']);
            },
            onError: (error: any) => {
                const {
                    data: { non_field_error, message },
                } = error.response;
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: (non_field_error || message) ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    //UserWallets list search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['user-wallet-list', page, limitChange], () => userWalletListAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    //UserWallets detail handle function
    const handleDetailModalOpen = (object: UserWalletResult) => {
        setUserWalletFormData({
            ...userWalletFormData,
            receiver: object?.user?.id ?? '',
        });
        setUserWalletDetailModal(true);
    };
    //UserWallets detail handle function
    const handleDetailModalClose = () => {
        setUserWalletFormData(userWalletInitialData);
        setUserWalletDetailModal(false);
    };

    if (!is_superuser && !user_permissions?.includes('view_withdraw')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                <UserWalletTable
                    data={userWalletsData?.data?.result}
                    page={page}
                    onSetPage={setPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isSuccess={isSuccess}
                    onHandleSearch={onHandleSearch}
                    total={userWalletsData?.data?.total_pages}
                    handleDetailModalOpen={handleDetailModalOpen}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={userWalletFormData}
                validationSchema={userWalletWithdrawSchema}
                onSubmit={(values, actions) => {
                    onWithdrawCreate(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset }) => {
                    return (
                        <FormModal
                            opened={userWalletDetailModal}
                            onClose={() => {
                                handleReset();
                                handleDetailModalClose();
                            }}
                            title={`Create Withdraw Request`}
                            onConfirm={handleSubmit}
                            confirmButtonText={`Confirm`}
                            loading={withdrawMutation?.isLoading}
                            size="md">
                            <Form>
                                <Alert icon={<IconAlertCircle size="1rem" />} title="Withdraw Request Create Confirmation!" mb={20}>
                                    Are you sure you want to create withdraw request for this user's wallet? This will create a withdraw request for
                                    all the amount shown in this particular wallet.
                                </Alert>
                                <TextAreaField
                                    name="description"
                                    error={errors.description}
                                    touch={touched.description}
                                    labelName="Description"
                                    placeHolder="Enter some description"
                                    minRows={4}
                                    autosize
                                />
                            </Form>
                        </FormModal>
                    );
                }}
            </Formik>
        </>
    );
};

export default UserWallets;
