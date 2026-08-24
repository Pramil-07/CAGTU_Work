import { Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, RoleResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';

interface RoleListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: RoleResult) => void;
    checked: string[];
    handleFormModal: () => void;
}

const RoleListTable = ({
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
}: RoleListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
        },
        {
            path: 'actions',
            label: '',
            content: (object: RoleResult) => (
                <Group position="right" spacing={5}>
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
                <Group position={isSuccess && data.length ? 'apart' : 'right'} spacing={10} align="normal">
                    {isSuccess && data.length && (
                        <Group position="left" spacing={10} align="normal">
                            <TableTopBar checked={checked} onHandleSearch={onHandleSearch} deleteModal={onClickDeleteAll} />
                        </Group>
                    )}
                    <Button name="Create" onClick={handleFormModal} />
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
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default RoleListTable;
