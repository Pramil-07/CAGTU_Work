import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, TableColumnsProps, WithdrawRequestResult, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Badge, Group, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';

interface WithdrawRequestTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    handleDetailModalOpen: (value: WithdrawRequestResult) => void;
    onShowFilterForm: () => void;
    query: string;
}

const WithdrawRequestTable = ({
    isLoading,
    isSuccess,
    isFetching,
    onHandleSearch,
    query,
    data,
    total,
    page,
    onSetPage,
    limitChange,
    handleLimitChange,
    handleDetailModalOpen,
    onShowFilterForm,
}: WithdrawRequestTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'sender',
            label: 'Sender',
            content: (object: WithdrawRequestResult) => (
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
            content: (object: WithdrawRequestResult) => (
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
            content: (object: WithdrawRequestResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.payment_method?.logo ?? ''}`} alt="payment_method-profile" size={30} radius={'xl'} />
                    <Text component="span">{object?.payment_method?.name}</Text>
                </Group>
            ),
        },
        {
            path: 'amount',
            label: 'Amount',
            content: (object: WithdrawRequestResult) => (
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
            content: (object: WithdrawRequestResult) => (
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
            content: (object: WithdrawRequestResult) => (
                <Badge variant="dot" size="lg" radius="sm" color="gray.8" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.transaction_type.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: WithdrawRequestResult) => <Text component="span">{converDateFromIsonString(object?.created_at)}</Text>,
        },
        {
            path: 'actions',
            label: '',
            content: (object: WithdrawRequestResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_withdraw')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => {
                                    handleDetailModalOpen(object);
                                }}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 80,
            },
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

export default WithdrawRequestTable;
