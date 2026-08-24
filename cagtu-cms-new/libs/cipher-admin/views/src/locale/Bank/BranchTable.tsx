import { Badge, Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { BranchResult, CipherUserContext, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface BranchTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: BranchResult) => void;
    checked: string[];
    handleFormModal: () => void;
    isFetching: boolean;
    query: string;
}

const BranchTable = ({
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
    handleFormModal,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: BranchTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Branch Name',
        },
        {
            path: 'bank',
            label: 'Bank Name',
            content: (object: BranchResult) => object?.bank?.name,
            style: {
                width: 300,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: BranchResult) => <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />,
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: BranchResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_bankbranch')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_bankbranch')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(Number(object.id))}
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
                            <TableTopBar
                                checked={checked}
                                deleteModal={onClickDeleteAll}
                                onHandleSearch={onHandleSearch}
                                loading={isFetching}
                                query={query}
                            />
                        </Group>
                    )}
                    {(is_superuser || user_permissions?.includes('add_bankbranch')) && <Button name="Create" onClick={handleFormModal} />}
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_bankbranch')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default BranchTable;
