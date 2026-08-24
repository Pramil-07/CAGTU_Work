import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, ContactCategoryResult, converDateFromIsonString, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { useContext } from 'react';

interface ContactCategoryTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: ContactCategoryResult) => void;
    isFetching: boolean;
    query: string;
}

const ContactCategoryTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    onSetPage,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
    onHandleSearch,
    handleFormModalEdit,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: ContactCategoryTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
        },
        {
            path: 'used_by',
            label: 'Used By',
            content: (object: ContactCategoryResult) => <Badge name={object?.used_by} radius="xl" />,
            style: {
                width: 120,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: ContactCategoryResult) => converDateFromIsonString(object?.created_at),
            style: {
                width: 150,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: ContactCategoryResult) => dayjs(object?.updated_at).fromNow(),
            style: {
                width: 150,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: ContactCategoryResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 80,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ContactCategoryResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_contactuscategory')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_contactuscategory')) && (
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
                width: 90,
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
                            <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                        </Group>
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
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                    onSetPage={onSetPage}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isCheckbox={false}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default ContactCategoryTable;
