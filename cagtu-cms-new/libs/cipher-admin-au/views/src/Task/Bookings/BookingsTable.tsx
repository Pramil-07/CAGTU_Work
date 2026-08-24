import { DataTable, NoDataMessage, SkeletonTableList, StatusBadge, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, ServiceBookingResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';
interface BookingsTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleDetailModalOpen: (bookingId: string) => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const BookingsTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    limitChange,
    handleLimitChange,
    onShowFilterForm,
    isFetching,
    query,
    handleDetailModalOpen,
}: BookingsTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Name',
            content: (object: ServiceBookingResult) => object?.entity_service?.title ?? ' -',
            style: {
                width: 400,
            },
        },
        {
            path: 'service',
            label: 'Service',
            content: (object: ServiceBookingResult) => object?.entity_service?.service?.title ?? ' -',
            style: {
                width: 350,
            },
        },
        {
            path: 'requested_by',
            label: 'Requested By',
            content: (object: ServiceBookingResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.entity_service?.created_by?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>
                        {`${object?.entity_service?.created_by?.first_name ?? ''} ${object?.entity_service?.created_by?.middle_name ?? ''} ${
                            object?.entity_service?.created_by?.last_name ?? ''
                        }`}
                    </Text>
                </Group>
            ),
            style: {
                width: 350,
            },
        },
        {
            path: 'booked_by',
            label: 'Booked By',
            content: (object: ServiceBookingResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.created_by?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>
                        {`${object?.created_by?.user?.first_name ?? ''} ${object?.created_by?.user?.middle_name ?? ''} ${
                            object?.created_by?.user?.last_name ?? ''
                        }`}
                    </Text>
                </Group>
            ),
            style: {
                width: 350,
            },
        },
        {
            path: 'price',
            label: 'Price',
            content: (object: ServiceBookingResult) => (object?.price ? _.ceil(Number(object?.price), 2) : ' -'),
            style: {
                width: 230,
            },
        },
        {
            path: 'earning',
            label: 'Earning',
            content: (object: ServiceBookingResult) => (object?.earning ? _.ceil(Number(object?.earning), 2) : ' -'),
            style: {
                width: 230,
            },
        },
        {
            path: 'requested_on',
            label: 'Requested On',
            content: (object: ServiceBookingResult) => {
                return converDateFromIsonString(object?.entity_service?.created_at);
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'created_at',
            label: 'Booked On',
            content: (object: ServiceBookingResult) => {
                return converDateFromIsonString(object?.created_at);
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: ServiceBookingResult) => <StatusBadge name={_.toLower(object?.status) ?? ''} />,
            style: {
                width: 110,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ServiceBookingResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_booking')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => {
                                    handleDetailModalOpen(object?.id);
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
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <Group position={'apart'} spacing={10} align="normal">
                        <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
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
                    {data?.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            total={total}
                            onSetPage={onSetPage}
                            isCheckbox={false}
                            limitChange={limitChange}
                            handleLimitChange={handleLimitChange}
                        />
                    )}
                </>
            )}
            {data?.length < 1 && <NoDataMessage />}
        </>
    );
};

export default BookingsTable;
