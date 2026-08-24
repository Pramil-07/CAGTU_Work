import { DataTable, NoDataMessage, SkeletonTableList, StatusBadge, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, AssignedTaskResult, TableColumnsProps, convertDateStringToISO } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal } from '@tabler/icons';
import _ from 'lodash';
interface AssignedTaskTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const AssignedTaskTable = ({
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
}: AssignedTaskTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Name',
            content: (object: AssignedTaskResult) => object?.title ?? ' -',
        },
        {
            path: 'assignee',
            label: 'Assignee',
            content: (object: AssignedTaskResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.assignee?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>
                        {`${object?.assignee?.first_name ?? ''} ${object?.assignee?.middle_name ?? ''} ${object?.assignee?.last_name ?? ''}`}
                    </Text>
                </Group>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'assigner',
            label: 'Assigner',
            content: (object: AssignedTaskResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.assigner?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>
                        {`${object?.assigner?.first_name ?? ''} ${object?.assigner?.middle_name ?? ''} ${object?.assigner?.last_name ?? ''}`}
                    </Text>
                </Group>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'price',
            label: 'Price',
            content: (object: AssignedTaskResult) => (object?.price ? _.ceil(Number(object?.price), 2) : '-'),
        },
        {
            path: 'earning',
            label: 'Earning',
            content: (object: AssignedTaskResult) => (object?.earning ? _.ceil(Number(object?.earning), 2) : '-'),
        },
        {
            path: 'created_at',
            label: 'Created on',
            content: (object: AssignedTaskResult) => {
                return object?.created_at ? convertDateStringToISO(String(object?.created_at)) : '-';
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'start_date',
            label: 'Task Start',
            content: (object: AssignedTaskResult) => {
                return object?.start_date ? convertDateStringToISO(String(object?.start_date)) : '-';
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'end_date',
            label: 'Task End',
            content: (object: AssignedTaskResult) => {
                return object?.end_date ? convertDateStringToISO(String(object?.end_date)) : '-';
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: AssignedTaskResult) => <StatusBadge name={_.toLower(object?.status) ?? ''} />,
            style: {
                width: 110,
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
                        <>
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
                        </>
                    )}
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
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
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default AssignedTaskTable;
