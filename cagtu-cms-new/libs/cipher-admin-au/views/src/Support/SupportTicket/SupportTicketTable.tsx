import { Badge, DataTable, NoDataMessage, PriorityBadge, SkeletonTableList, StatusBadge, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, SupportTicketResult, TableColumnsProps, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEdit, IconEye, IconTrash } from '@tabler/icons';
import * as _ from 'lodash';
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SupportTicketTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: SupportTicketResult) => void;
    handleSupportDetail: (object: SupportTicketResult) => void;
    checked: string[];
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const SupportTicketTable = ({
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isMultiDeleteModalOpened,
    isSingleDeleteMutationLoading,
    isMultiDeleteMutationLoading,
    isAllCheckboxSelected,
    isCheckboxSelect,
    handleSelect,
    handleSingleDelete,
    onSelectAll,
    onSetPage,
    onClickDeleteAll,
    onConfirmSingleDelete,
    onConfirmMultiDelete,
    handleSingleDeleteCloseModal,
    handleMultiDeleteCloseModal,
    onHandleSearch,
    handleFormModalEdit,
    limitChange,
    handleLimitChange,
    handleSupportDetail,
    onShowFilterForm,
    isFetching,
    query,
}: SupportTicketTableProps) => {
    const { pathname } = useLocation();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const URL = process.env['NX_CIPHER_API_URL'];

    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Report Title',
            content: (object: SupportTicketResult) => <Text component="span">{object?.type?.name}</Text>,
            style: {
                width: 250,
            },
        },
        {
            path: 'object_type',
            label: 'Report Type',
            content: (object: SupportTicketResult) => <Text>{object?.object_type ?? 'Other'}</Text>,
            style: {
                width: 110,
            },
        },
        {
            path: 'created_by',
            label: 'Created By',
            content: (object: SupportTicketResult) => (
                <Group position="left" spacing={5}>
                    <Avatar src={`${object?.created_by?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    {object?.created_by?.username === 'admin' ? (
                        <Text weight={500} component="span">
                            Admin
                        </Text>
                    ) : (
                        <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.created_by?.first_name ?? ''} ${
                            object?.created_by?.middle_name ?? ''
                        } ${object?.created_by?.last_name ?? ''}`}</Text>
                    )}
                </Group>
            ),
            style: {
                width: 250,
            },
        },
        {
            path: 'user',
            label: 'Reported By',
            content: (object: SupportTicketResult) => (
                <Group position="left" spacing={5}>
                    <Avatar src={`${object?.user?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    {object?.user?.username === 'admin' ? (
                        <Text weight={500} component="span">
                            Admin
                        </Text>
                    ) : (
                        <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.user?.first_name ?? ''} ${
                            object?.user?.middle_name ?? ''
                        } ${object?.user?.last_name ?? ''}`}</Text>
                    )}
                </Group>
            ),
            style: {
                width: 250,
            },
        },
        {
            path: 'object',
            label: 'Reported To',
            content: (object: SupportTicketResult) => {
                if (object?.object_type) {
                    return (
                        <Tooltip label="Click to view detail" withArrow>
                            <Link
                                to={
                                    object?.object_type === 'user'
                                        ? `https://${URL === 'https://sandbox.homaale.api.cagtu.io/api/v1' ? 'sandbox.' : ''}homaale.com/tasker/${
                                              object?.object_id
                                          }`
                                        : object?.object_type === 'entityservice'
                                        ? `https://${URL === 'https://sandbox.homaale.api.cagtu.io/api/v1' ? 'sandbox.' : ''}homaale.com/services/${
                                              object?.object_id
                                          }`
                                        : object?.object_type === 'task'
                                        ? `https://${URL === 'https://sandbox.homaale.api.cagtu.io/api/v1' ? 'sandbox.' : ''}homaale.com/tasks/${
                                              object?.object_id
                                          }`
                                        : ''
                                }
                                target="_blank"
                                rel="noopener noreferrer">
                                <Badge
                                    name={object?.object}
                                    styles={(theme) => ({
                                        root: {
                                            '&:hover': {
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                            },
                                        },
                                    })}
                                />
                            </Link>
                        </Tooltip>
                    );
                } else {
                    return <Badge name={object?.object} />;
                }
            },
            style: {
                width: 110,
            },
        },
        {
            path: 'created_at',
            label: 'Reported Date',
            content: (object: SupportTicketResult) => <Text component="span">{converDateFromIsonString(object?.created_at)}</Text>,
            style: {
                width: 220,
            },
        },
        {
            path: 'assigned_to',
            label: 'Assigned To',
            content: (object: SupportTicketResult) => (
                <Group position="left" spacing={10}>
                    {_.isNull(object?.assigned_to) ? (
                        <Badge name="None" color="gray" />
                    ) : (
                        <>
                            <Avatar src={`${object?.assigned_to?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                            <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.assigned_to?.first_name ?? ''} ${
                                object?.assigned_to?.middle_name ?? ''
                            } ${object?.assigned_to?.last_name ?? ''}`}</Text>
                        </>
                    )}
                </Group>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'priority',
            label: 'Priority',
            content: (object: SupportTicketResult) => {
                return _.isNull(object?.priority) ? <Badge name="Not Set" color="gray" /> : <PriorityBadge name={object?.priority?.label} />;
            },
            style: {
                width: 140,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: SupportTicketResult) => <Badge name={object?.is_active ? 'Yes' : 'No'} color={object?.is_active ? 'green' : 'red'} />,
            style: {
                width: 80,
            },
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: SupportTicketResult) => {
                if (object?.is_resolved) {
                    return <Badge name={'Resolved'} color={'green'} />;
                } else {
                    return <StatusBadge name={_.toLower(object?.status) ?? ''} />;
                }
            },
            style: {
                width: 80,
            },
        },
        // {
        //     path: 'is_resolved',
        //     label: 'Is Resolved',
        //     content: (object: SupportTicketResult) => (
        //         <Badge name={object?.is_resolved ? 'Yes' : 'No'} color={object?.is_resolved ? 'green' : 'red'} />
        //     ),
        //     style: {
        //         width: 100,
        //     },
        // },
        {
            path: 'actions',
            label: '',
            content: (object: SupportTicketResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_supportticket')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSupportDetail(object)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('change_supportticket')) && pathname === '/support/reports' && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleFormModalEdit(object)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('delete_supportticket')) && pathname === '/support/reports' && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(object.id)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconTrash size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 180,
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
                            <Group position="left" spacing={10} align="normal">
                                <TableTopBar
                                    checked={checked}
                                    deleteModal={onClickDeleteAll}
                                    onHandleSearch={onHandleSearch}
                                    loading={isFetching}
                                    query={query}
                                />
                            </Group>
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
                                        <IconAdjustmentsHorizontal size={22} stroke={1.75} />
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
                    isDeleteModalOpened={isDeleteModalOpened}
                    isMultiDeleteModalOpened={isMultiDeleteModalOpened}
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                    isMultiDeleteMutationLoading={isMultiDeleteMutationLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect}
                    handleSelect={handleSelect}
                    onSelectAll={onSelectAll}
                    onSetPage={onSetPage}
                    onClickDeleteAll={onClickDeleteAll}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    onConfirmMultiDelete={onConfirmMultiDelete}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isCheckbox={is_superuser || user_permissions?.includes('delete_supportticket')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default SupportTicketTable;
