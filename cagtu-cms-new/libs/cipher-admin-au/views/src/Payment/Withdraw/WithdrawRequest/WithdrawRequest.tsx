import { Button, DateRangeField, InputField, PaperBox, SelectField, SelectInputField } from '@cagtu-cms/ui-shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import {
    CipherUserContext,
    WithdrawRequestFilterFormValuesProps,
    WithdrawRequestResult,
    getFormatedDate,
    getPageLimit,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Box, CloseButton, Divider, Grid, Loader, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';
import BlockedPageMessage from '../../../components/common/BlockedPageMessage';
import WithdrawRequestTable from './WithdrawRequestTable';
import { IconCalendar, IconUser } from '@tabler/icons';
import WithdrawRequestDetail from './WithdrawRequestDetail';

const filterFormInitialData: WithdrawRequestFilterFormValuesProps = {
    amount_max: '',
    amount_min: '',
    currency: '',
    date_after: '',
    date_before: '',
    ordering: '',
    payment_method: '',
    receiver: '',
    sender: '',
    status: '',
    transaction_type: '',
};

const urlsPath = urls?.cipher?.payment;
const urlsUserPath = urls?.cipher?.user;

const WithdrawRequest = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [withdrawRequestDetailModal, setWithdrawRequestDetailModal] = useState(false);
    const [withdrawRequestDetail, setWithdrawRequestDetail] = useState<WithdrawRequestResult>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [withdrawRequestFilterFormData, setWithdrawRequestFilterFormData] = useState<WithdrawRequestFilterFormValuesProps>({
        ...filterFormInitialData,
    });
    const [paymentMethodsOptions, setPaymentMethodsOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchSender, setSearchSender] = useState<string>('');
    const [senderOptions, setSenderOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchReceiver, setSearchReceiver] = useState<string>('');
    const [receiverOptions, setReceiverOptions] = useState<{ value: string; label: string }[]>([]);

    // WithdrawRequest list get api
    const withdrawRequestListAPI = new CipherAPI(urlsPath?.withdrawRequest);
    const {
        isLoading,
        isFetching,
        isSuccess,
        data: withdrawRequestData,
    } = useQuery(['withdraw-request-list', page, limitChange, ...[withdrawRequestFilterFormData]], () =>
        withdrawRequestListAPI.list({ search: query, page, page_size: limitChange, ...withdrawRequestFilterFormData })
    );

    // Wallet list query
    const paymentMethodsAPI = new CipherAPI(urlsPath?.paymentMethods);
    const { isLoading: paymentMethodsLoading } = useQuery(['payment-method-list'], () => paymentMethodsAPI.list(), {
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

    //WithdrawRequest list search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['withdraw-request-list', page, limitChange, ...[withdrawRequestFilterFormData]], () =>
            withdrawRequestListAPI.list({ search: query, page_size: limitChange, ...withdrawRequestFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    //WithdrawRequest detail handle function
    const handleDetailModalOpen = (object: WithdrawRequestResult) => {
        setWithdrawRequestDetail(object);
        setWithdrawRequestDetailModal(true);
    };
    //WithdrawRequest detail handle function
    const handleDetailModalClose = () => {
        setWithdrawRequestDetail(undefined);
        setWithdrawRequestDetailModal(false);
    };

    //WithdrawRequest filter form open function
    const onShowFilterForm = () => setShowFilter(true);

    //WithdrawRequest filter clear function
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setWithdrawRequestFilterFormData({ ...filterFormInitialData });
    };

    const onFilterFormClear = async () => {
        setWithdrawRequestFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['withdraw-request-list', page, limitChange, ...[filterFormInitialData]], () =>
            withdrawRequestListAPI.list({ search: query, page: 1, page_size: '10', ...filterFormInitialData })
        );
    };

    // Fetch the senders list from the API as the per user keywords request
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);
    const { isFetching: isSenderFetching } = useQuery(['senders-options'], () => userOptionsAPI.list({ page: -1, search: searchSender }), {
        enabled: !!searchSender,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setSenderOptions(options);
        },
    });

    // Fetch the senders list from the API as the per user keywords request
    const { isFetching: isReceiverFetching } = useQuery(['receivers-options'], () => userOptionsAPI.list({ page: -1, search: searchReceiver }), {
        enabled: !!searchReceiver,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setReceiverOptions(options);
        },
    });

    if (!is_superuser && !user_permissions?.includes('view_withdraw')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                {showFilter && (
                    <>
                        <Box
                            sx={{
                                background: dark ? theme.colors.dark['4'] : theme.colors.gray['0'],
                                borderRadius: theme.radius.sm,
                                position: 'relative',
                            }}
                            p={20}>
                            <CloseButton
                                radius="xl"
                                color="dark"
                                variant="light"
                                size="sm"
                                sx={{ position: 'absolute', top: -8, right: -8 }}
                                onClick={onShowFilterFormClose}
                            />
                            <Formik
                                initialValues={withdrawRequestFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend: WithdrawRequestFilterFormValuesProps = {
                                        ...values,
                                        date_after: values?.date_after ? getFormatedDate(new Date(values?.date_after)) : '',
                                        date_before: values?.date_before ? getFormatedDate(new Date(values?.date_before)) : '',
                                    };
                                    setIsFiltering(true);
                                    setWithdrawRequestFilterFormData({
                                        ...dataToSend,
                                    });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['withdraw-request-list', page, limitChange, ...[dataToSend]], () =>
                                        withdrawRequestListAPI.list({ search: query, page: 1, page_size: limitChange, ...dataToSend })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty, values }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <DateRangeField
                                                    name="created_range"
                                                    placeHolder="Select created range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    value={[
                                                        values.date_after ? new Date(values.date_after) : null,
                                                        values.date_before ? new Date(values.date_before) : null,
                                                    ]}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('date_after', value[0]);
                                                        setFieldValue('date_before', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <InputField
                                                    name="amount_max"
                                                    placeHolder="Enter maximum amount"
                                                    value={values?.amount_max}
                                                    onChange={(e) => {
                                                        setFieldValue('amount_max', e.target.value);
                                                    }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <InputField
                                                    name="amount_min"
                                                    placeHolder="Enter minimum amount"
                                                    value={values?.amount_min}
                                                    onChange={(e) => {
                                                        setFieldValue('amount_min', e.target.value);
                                                    }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="payment_method"
                                                    placeHolder="Select Payment Method"
                                                    options={paymentMethodsOptions}
                                                    value={values?.payment_method ?? ''}
                                                    handleChange={(value) => {
                                                        setFieldValue('payment_method', value);
                                                    }}
                                                    disabled={paymentMethodsLoading}
                                                    rightSection={paymentMethodsLoading && <Loader size={20} />}
                                                    withAsterisk
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="sender"
                                                    placeHolder="Search sender"
                                                    options={senderOptions}
                                                    value={values?.sender ?? ''}
                                                    handleChange={(value) => setFieldValue('sender', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchSender(value);
                                                        } else {
                                                            setSearchSender('');
                                                        }
                                                    }}
                                                    rightSection={isSenderFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="receiver"
                                                    placeHolder="Search receiver"
                                                    options={receiverOptions}
                                                    value={values?.receiver ?? ''}
                                                    handleChange={(value) => setFieldValue('receiver', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchReceiver(value);
                                                        } else {
                                                            setSearchReceiver('');
                                                        }
                                                    }}
                                                    rightSection={isReceiverFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="status"
                                                    placeHolder="Select status"
                                                    options={[
                                                        {
                                                            value: 'initiated',
                                                            label: 'Initiated',
                                                        },
                                                        {
                                                            value: 'pending',
                                                            label: 'Pending',
                                                        },
                                                        {
                                                            value: 'completed',
                                                            label: 'Completed',
                                                        },
                                                        {
                                                            value: 'dispute',
                                                            label: 'Dispute',
                                                        },
                                                        {
                                                            value: 'reverted',
                                                            label: 'Reverted',
                                                        },
                                                        {
                                                            value: 'settled',
                                                            label: 'Settled',
                                                        },
                                                        {
                                                            value: 'penalty',
                                                            label: 'Penalty',
                                                        },
                                                    ]}
                                                    value={values?.status ?? ''}
                                                    handleChange={(value) => setFieldValue('status', value)}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="transaction_type"
                                                    placeHolder="Select transaction type"
                                                    options={[
                                                        {
                                                            value: 'payment',
                                                            label: 'Payment',
                                                        },
                                                        {
                                                            value: 'deposit',
                                                            label: 'Deposit',
                                                        },
                                                        {
                                                            value: 'receipt',
                                                            label: 'Receipt',
                                                        },
                                                        {
                                                            value: 'transfer',
                                                            label: 'Transfer',
                                                        },
                                                        {
                                                            value: 'withdraw',
                                                            label: 'Withdraw',
                                                        },
                                                        {
                                                            value: 'walllet_load',
                                                            label: 'Wallet Load',
                                                        },
                                                    ]}
                                                    value={values?.transaction_type ?? ''}
                                                    handleChange={(value) => setFieldValue('transaction_type', value)}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Button type="submit" name="Filter" loading={isFiltering} disabled={!dirty} />
                                        <Button
                                            type="button"
                                            name="Clear Filter"
                                            onClick={() => {
                                                handleReset();
                                                onFilterFormClear();
                                            }}
                                            variant="light"
                                            ml={10}
                                            disabled={!dirty}
                                        />
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                        <Divider my={20} variant="dashed" />
                    </>
                )}
                <WithdrawRequestTable
                    data={withdrawRequestData?.data?.result}
                    page={page}
                    onSetPage={setPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isSuccess={isSuccess}
                    onHandleSearch={onHandleSearch}
                    total={withdrawRequestData?.data?.total_pages}
                    handleDetailModalOpen={handleDetailModalOpen}
                    onShowFilterForm={onShowFilterForm}
                />
            </PaperBox>
            <WithdrawRequestDetail
                open={withdrawRequestDetailModal}
                setOpen={handleDetailModalClose}
                title="Withdraw Request Details"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                size="50%"
                transactionId={withdrawRequestDetail?.id as string}
            />
        </>
    );
};

export default WithdrawRequest;
