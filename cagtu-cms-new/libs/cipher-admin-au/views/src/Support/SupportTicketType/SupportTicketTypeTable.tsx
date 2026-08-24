import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, SupportTicketTypeResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface SupportTicketTypeTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: SupportTicketTypeResult) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const SupportTicketTypeTable = ({
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
    isFetching,
    query,
}: SupportTicketTypeTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Ticket Type',
        },
        {
            path: 'notify_to',
            label: 'Notify to',
            content: (object: SupportTicketTypeResult) => (
                <Group spacing={5}>
                    {object?.notify_to.map((val) => (
                        <Badge name={val?.name} radius="xl" />
                    ))}
                </Group>
            ),
            style: {
                width: 200,
            },
        },
        {
            path: 'target',
            label: 'Target',
            content: (object: SupportTicketTypeResult) => {
                if (object?.target) {
                    return <Badge name={object?.target} radius="xl" />;
                } else {
                    return;
                }
            },
            style: {
                width: 200,
            },
        },
        {
            path: 'used_by',
            label: 'Ticket Count',
            content: (object: SupportTicketTypeResult) => <Badge name={object?.used_by} radius="xl" />,
            style: {
                width: 120,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: SupportTicketTypeResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: SupportTicketTypeResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_supporttickettype')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_supporttickettype')) && (
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
                    {isSuccess && data.length && (
                        <Group position="left" spacing={10} align="normal">
                            <TableTopBar
                                checked={checked}
                                deleteModal={onClickDeleteAll}
                                onHandleSearch={onHandleSearch}
                                loading={isFetching}
                                query={query}
                            />
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_supporttickettype')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default SupportTicketTypeTable;
