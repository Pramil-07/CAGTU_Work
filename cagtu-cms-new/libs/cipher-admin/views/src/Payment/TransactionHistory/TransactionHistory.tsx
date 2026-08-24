import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { DateRangeField, PageHeader, PaperBox, Button, SelectField, InputField, SelectInputField } from '@cagtu-cms/ui-shared';
import { TransactionFilterFormValuesProps, useDark, useDataLimit, getFormatedDate, CipherUserContext, getPageLimit } from '@cagtu-cms/util-formatter';
import { Box, CloseButton, Divider, Grid, Group, Loader, useMantineTheme } from '@mantine/core';
import { IconCalendar, IconUser } from '@tabler/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import TransactionHistoryDetailModal from '../../components/common/TransactionHistoryDetailModal';
import TransactionHistoryTable from './TransactionHistoryTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.transaction;
const paymentUrlsPath = urls?.cipher?.payment;
const urlsUserPath = urls?.cipher?.user;
/* eslint-disable-next-line */
export interface TransactionHistoryProps {}

const filterFormInitialData: TransactionFilterFormValuesProps = {
    date_after: '',
    date_before: '',
    amount_max: '',
    amount_min: '',
    payment_method: '',
    sender: '',
    receiver: '',
    status: '',
    transaction_type: '',
};
const transactionHistoryAPI = new CipherAPI(urlsPath?.path);

export function TransactionHistory(props: TransactionHistoryProps) {
    const queryClient = useQueryClient();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const [transactionId, setTransactionId] = useState('');
    const [transactionHistoryDetailModal, setTransactionHistoryDetailModal] = useState(false);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [query, setQuery] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [transactionFilterFormData, setTransactionFilterFormData] = useState<TransactionFilterFormValuesProps>({
        ...filterFormInitialData,
    });
    const [paymentMethodsOptions, setPaymentMethodsOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchSender, setSearchSender] = useState<string>('');
    const [senderOptions, setSenderOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchReceiver, setSearchReceiver] = useState<string>('');
    const [receiverOptions, setReceiverOptions] = useState<{ value: string; label: string }[]>([]);

    const {
        isLoading,
        isFetching,
        isSuccess,
        data: transactionData,
    } = useQuery(['transaction-history', page, limitChange, transactionFilterFormData], () =>
        transactionHistoryAPI.list({ search: query, ...transactionFilterFormData, page, page_size: limitChange })
    );

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['transaction-history', page, limitChange, transactionFilterFormData], () =>
            transactionHistoryAPI.list({ search: query, page_size: limitChange })
        );
        setQuery(query);
        setPage(1);
    };

    //Payment list query
    const paymentMethodsAPI = new CipherAPI(paymentUrlsPath?.paymentMethods);
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

    const onShowFilterForm = () => setShowFilter(true);

    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setTransactionFilterFormData({ ...filterFormInitialData });
        setPage(1);
    };

    const onFilterFormClear = () => {
        setTransactionFilterFormData({ ...filterFormInitialData });
        setPage(1);
    };

    const onHandleFilter = async (values: { date_after: string; date_before: string }) => {
        const dataToSend = {
            ...JSON.parse(JSON.stringify(values)),
            date_after: values?.date_after ? getFormatedDate(new Date(values?.date_after)) : '',
            date_before: values?.date_before ? getFormatedDate(new Date(values?.date_before)) : '',
        };
        setPage(1);
        setTransactionFilterFormData({ ...dataToSend });
    };

    const onHandleTransactionDetailModal = (value: boolean) => {
        setTransactionHistoryDetailModal(value);
    };

    if (!is_superuser && !user_permissions?.includes('view_transaction')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Transaction History" />
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
                            <Formik initialValues={transactionFilterFormData} onSubmit={onHandleFilter}>
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
                                                    value={values?.payment_method}
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
                                        <Group spacing={10} position="left">
                                            <Button type="submit" name="Filter" loading={isFetching} disabled={!dirty} />
                                            <Button
                                                type="button"
                                                name="Clear Filter"
                                                onClick={() => {
                                                    handleReset();
                                                    onFilterFormClear();
                                                }}
                                                variant="light"
                                                // ml={10}
                                                disabled={!dirty}
                                            />
                                        </Group>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                        <Divider my={20} variant="dashed" />
                    </>
                )}
                <TransactionHistoryTable
                    isFetching={isFetching}
                    data={transactionData?.data?.result}
                    isSuccess={isSuccess}
                    isLoading={isLoading}
                    total={transactionData?.data?.total_pages}
                    page={page}
                    onSetPage={setPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onHandleSearch={onHandleSearch}
                    onShowFilterForm={onShowFilterForm}
                    query={query}
                    onHandleTransactionDetailModal={onHandleTransactionDetailModal}
                    setTransactionId={setTransactionId}
                />
            </PaperBox>
            <TransactionHistoryDetailModal
                open={transactionHistoryDetailModal}
                setOpen={onHandleTransactionDetailModal}
                title="Transaction Details"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                size="50%"
                transactionId={transactionId}
            />
        </>
    );
}

export default TransactionHistory;
