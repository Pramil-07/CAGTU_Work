import { DataTable, NoDataMessage, SkeletonTableList, StatusBadge, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, RefundResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Badge, Box, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';

interface RefundListTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    handleDetailModalOpen: (value: RefundResult) => void;
    onShowFilterForm: () => void;
    query: string;
}

const RefundTable = ({
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
}: RefundListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'cancelled_by',
            label: 'Cancelled By',
            content: (object: RefundResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.cancelled_by?.profile_image ?? ''}`} alt="cancelled_by?-profile" radius="xl" size={30} />
                    <Box>
                        <Text fw={500}>{object?.cancelled_by?.full_name ?? ''}</Text>
                        <Text color="dimmed">
                            {!_.isEmpty(object?.cancelled_by?.email) ? object?.cancelled_by?.email : '@' + object?.cancelled_by?.username}
                        </Text>
                    </Box>
                </Group>
            ),
        },
        {
            path: 'cancelling_party',
            label: 'Cancelling Party',
            content: (object: RefundResult) => <Badge radius={'xs'}>{object?.cancelling_party ? _.capitalize(object?.cancelling_party) : ''}</Badge>,
        },
        {
            path: 'price',
            label: 'Price',
            content: (object: RefundResult) => (
                <Text weight={500}>
                    {object?.entity_service?.currency?.symbol ?? ''} {object?.price ? _.ceil(Number(object?.price), 2) : '-'}
                </Text>
            ),
        },
        {
            path: 'earning',
            label: 'Earning',
            content: (object: RefundResult) => (
                <Text weight={500}>
                    {object?.entity_service?.currency?.symbol ?? ''} {object?.earning ? _.ceil(Number(object?.earning), 2) : '-'}
                </Text>
            ),
        },
        {
            path: 'entity_servce',
            label: 'Entity Service',
            content: (object: RefundResult) => <Text>{object?.entity_service?.title ?? ''}</Text>,
        },
        {
            path: 'cancellation_description',
            label: 'Cancellation Description',
            content: (object: RefundResult) => <Text>{object?.cancellation_description ?? ''}</Text>,
        },
        {
            path: 'cancellation_reason',
            label: 'Cancellation Reason',
            content: (object: RefundResult) => <Text>{object?.cancellation_reason ?? ''}</Text>,
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: RefundResult) =>
                object?.is_compensated || object?.is_penalized || object?.is_refunded ? (
                    <Badge radius={'sm'} size="lg" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                        {object?.is_compensated ? 'Compensated' : object?.is_penalized ? 'Penalized' : object?.is_refunded ? 'Refunded' : ''}
                    </Badge>
                ) : (
                    <StatusBadge name={_.toLower(object?.status) ?? ''} />
                ),
        },
        {
            path: 'actions',
            label: '',
            content: (object: RefundResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_booking')) && (
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

export default RefundTable;
