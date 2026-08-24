import { Badge, Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    TableColumnsProps,
    UsersFormValuesProps,
    UsersResult,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconChartInfographic, IconDiscountCheck, IconEdit, IconEye } from '@tabler/icons';
import { useContext } from 'react';

interface UserListTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (id: string) => void;
    handleUserDetail: (id: string) => void;
    handleUserAnalytics: (id: string) => void;
    checked: string[];
    handleFormModal: () => void;
    handleUserVerify: () => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const UserListTable = ({
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    total,
    isAllCheckboxSelected,
    isCheckboxSelect,
    handleSelect,
    onSelectAll,
    onSetPage,
    onHandleSearch,
    handleFormModalEdit,
    handleFormModal,
    handleUserVerify,
    handleUserDetail,
    limitChange,
    handleLimitChange,
    onShowFilterForm,
    handleUserAnalytics,
    isFetching,
    query,
}: UserListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
            content: (object: UsersResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.profile?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    <Text weight={500} component="span">{`${object?.first_name ?? ''} ${object?.middle_name ?? ''} ${object?.last_name ?? ''}`}</Text>
                </Group>
            ),
        },
        {
            path: 'username',
            label: 'Username',
            style: {
                width: 140,
            },
        },
        {
            path: 'email',
            label: 'Email',
            content: (object: UsersResult) => <Text component="span">{object?.email ? object?.email : '-'}</Text>,
            style: {
                width: 140,
            },
        },
        {
            path: 'roles',
            label: 'Roles',
            content: (object: UsersResult) => (
                <Group>{object?.groups && object?.groups.length > 0 ? object?.groups?.map((role) => <Badge name={role?.name} />) : '-'}</Group>
            ),
            style: {
                width: 140,
            },
        },
        {
            path: 'phone',
            label: 'Phone',
            content: (object: UsersResult) => <Text component="span">{object?.phone ? object?.phone : '-'}</Text>,
            style: {
                width: 120,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: UsersResult) => <Text component="span">{converDateFromIsonString(object?.created_at)}</Text>,
            style: {
                width: 120,
            },
        },
        {
            path: 'is_verified',
            label: 'Login Verified',
            content: (object: UsersResult) => <Badge name={object?.is_verified ? 'Yes' : 'No'} color={object?.is_verified ? 'green' : 'red'} />,
            style: {
                width: 120,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: UsersResult) => <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />,
            style: {
                width: 80,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: UsersFormValuesProps) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="Analytics" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            onClick={() => handleUserAnalytics(object?.id)}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <IconChartInfographic size={18} stroke={1.75} />
                        </ActionIcon>
                    </Tooltip>
                    {(is_superuser || user_permissions?.includes('view_user')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleUserDetail(object?.id)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('change_user')) && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleFormModalEdit(object?.id)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 120,
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
                            <TableTopBar checked={checked} onHandleSearch={onHandleSearch} showDelete={false} loading={isFetching} query={query}>
                                <Tooltip label="Verify" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                    <ActionIcon
                                        variant="light"
                                        radius="xl"
                                        size={40}
                                        color="gray"
                                        sx={{
                                            cursor: 'pointer',
                                        }}
                                        onClick={handleUserVerify}>
                                        <IconDiscountCheck size={22} stroke={1.75} />
                                    </ActionIcon>
                                </Tooltip>
                            </TableTopBar>
                        </Group>
                    )}
                    <Group position="right" align="normal">
                        {isSuccess && data.length && (
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
                        )}
                        {(is_superuser || user_permissions?.includes('add_user')) && <Button name="Create" onClick={handleFormModal} />}
                    </Group>
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    columns={columns}
                    page={page}
                    total={total}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect}
                    handleSelect={handleSelect}
                    onSelectAll={onSelectAll}
                    onSetPage={onSetPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isCheckbox={is_superuser || user_permissions?.includes('change_user')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default UserListTable;
