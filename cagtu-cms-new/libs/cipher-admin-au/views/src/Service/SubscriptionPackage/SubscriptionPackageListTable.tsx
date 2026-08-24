import { Badge, Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, ServicesPackageResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';

interface SubscriptionPackageListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: ServicesPackageResult) => void;
    checked: string[];
    handleFormModal: () => void;
}

const SubscriptionPackageListTable = ({
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
}: SubscriptionPackageListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Package',
        },
        {
            path: 'service.title',
            label: 'Service',
            style: {
                width: 250,
            },
        },
        {
            path: 'budget',
            label: 'Budget',
            style: {
                width: 130,
            },
        },
        {
            path: 'no_of_revision',
            label: 'No.of Revision',
            content: (object: ServicesPackageResult) => <Badge name={object?.no_of_revision ?? 0} radius="xl" />,
            style: {
                width: 150,
            },
        },
        {
            path: 'is_recommended',
            label: 'Is Recommend?',
            content: (object: ServicesPackageResult) => (
                <Badge name={object?.is_recommended ? 'Yes' : 'No'} color={object?.is_recommended ? 'green' : 'red'} />
            ),
            style: {
                width: 140,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: ServicesPackageResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ServicesPackageResult) => (
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
                            <IconEdit size={15} />
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
                            <IconTrash size={15} />
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
                            <TableTopBar checked={checked} deleteModal={onClickDeleteAll} onHandleSearch={onHandleSearch} />
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
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
            {isLoading && <SkeletonTableList />}
        </>
    );
};

export default SubscriptionPackageListTable;
