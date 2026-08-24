import { http, urls } from '@cagtu-cms/data-access';
import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { converDateFromIsonString, DataTableProps, TableColumnsProps, TransactionResult } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Badge, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye, IconFileSpreadsheet } from '@tabler/icons';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';

/* eslint-disable-next-line */
export interface TransactionHistoryTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    onShowFilterForm: () => void;
    onHandleTransactionDetailModal: (val: boolean) => void;
    setTransactionId: (val: string) => void;
    isFetching: boolean;
    query: string;
}

const paymentUrlsPath = urls?.cipher?.payment;
const TransactionHistoryTable = (props: TransactionHistoryTableProps) => {
    const {
        data,
        total,
        isSuccess,
        isLoading,
        page,
        onSetPage,
        limitChange,
        handleLimitChange,
        onHandleSearch,
        onShowFilterForm,
        isFetching,
        query,
        onHandleTransactionDetailModal,
        setTransactionId,
    } = props;
    const navigate = useNavigate();

    //function to fetch and export excel data from server by defining response type to blob
    const exportTransactionHistory = async () => {
        await http
            .get(paymentUrlsPath?.transactionHistoryExport, {
                responseType: 'blob',
            })
            .then((res) => {
                const file = new File([res.data], `transaction_history_${new Date().toLocaleDateString()}.xlsx`);
                const url = window.URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transaction_history_${new Date().toLocaleDateString()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    };

    const columns: TableColumnsProps[] = [
        {
            path: 'order',
            label: 'Order Id',
            content: (object: TransactionResult) => (
                <Tooltip label="Click to see related order" withArrow>
                    <Text
                        onClick={() => {
                            navigate('/task/orders', {
                                state: {
                                    orderId: object?.order,
                                },
                            });
                        }}
                        weight={500}
                        component="span"
                        sx={{
                            '&:hover': {
                                textDecoration: 'underline',
                                cursor: 'pointer',
                            },
                        }}>
                        {object?.order}
                    </Text>
                </Tooltip>
            ),
        },
        {
            path: 'sender',
            label: 'Sender',
            content: (object: TransactionResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.sender?.profile_image ?? ''}`} alt="sender-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.sender?.full_name}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'receiver',
            label: 'Receiver',
            content: (object: TransactionResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.receiver?.profile_image ?? ''}`} alt="receiver-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.receiver?.full_name}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'payment_method',
            label: 'Payment method',
            content: (object: TransactionResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.payment_method?.logo ?? ''}`} alt="payment_method-profile" size={30} radius={'xl'} />
                    <Text component="span">{object?.payment_method?.name}</Text>
                </Group>
            ),
        },
        {
            path: 'amount',
            label: 'Amount',
            content: (object: TransactionResult) => (
                <Group position="left" spacing={5}>
                    <Text weight={600} component="span">
                        {object?.currency.symbol}
                    </Text>
                    <Text weight={600} component="span">
                        {_.ceil(Number(object?.amount), 2)}
                    </Text>
                </Group>
            ),
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: TransactionResult) => (
                <Badge
                    size="lg"
                    radius="sm"
                    color={object?.status.toUpperCase() === 'INITIATED' ? '' : object?.status.toUpperCase() === 'PENDING' ? 'yellow' : 'green'}
                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.status}
                </Badge>
            ),
        },
        {
            path: 'transaction_type',
            label: 'Transaction Type',
            content: (object: TransactionResult) => (
                <Badge variant="dot" size="lg" radius="sm" color="gray.8" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.transaction_type.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: TransactionResult) => <Text component="span">{converDateFromIsonString(object?.created_at)}</Text>,
        },
        {
            path: 'actions',
            label: '',
            content: (object: TransactionResult) => (
                <Group position="right" spacing={5}>
                    <Tooltip
                        withArrow
                        label="View Detail"
                        position="bottom"
                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            onClick={() => {
                                setTransactionId(object?.id);
                                onHandleTransactionDetailModal(true);
                            }}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <IconEye size={18} stroke={1.75} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
        },
    ];
    return (
        <>
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={'apart'} spacing={10} align="normal">
                    {isSuccess && (
                        <Group position="left" spacing={10} align="normal">
                            <TableTopBar onHandleSearch={onHandleSearch} showDelete={false} loading={isFetching} query={query} />
                            <Tooltip label="Export CSV" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                <ActionIcon
                                    variant="light"
                                    radius="xl"
                                    size={40}
                                    color="gray"
                                    onClick={() => {
                                        exportTransactionHistory();
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                    }}>
                                    <IconFileSpreadsheet size={22} stroke={1.75} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    )}
                    {isSuccess && (
                        <Group position="right" align="normal">
                            <UnstyledButton component="div" onClick={onShowFilterForm}>
                                <Group position="right" spacing={10}>
                                    <Text weight={500} component="span">
                                        Filter
                                    </Text>
                                    <ActionIcon
                                        variant="light"
                                        radius="xl"
                                        size={40}
                                        color="blue"
                                        sx={{
                                            cursor: 'pointer',
                                        }}>
                                        <IconAdjustmentsHorizontal size={24} stroke={1.75} />
                                    </ActionIcon>
                                </Group>
                            </UnstyledButton>
                        </Group>
                    )}
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    total={total}
                    columns={columns}
                    page={page}
                    onSetPage={onSetPage}
                    isCheckbox={false}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default TransactionHistoryTable;
