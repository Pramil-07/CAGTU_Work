import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { BrandResult, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';

interface BrandListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: BrandResult) => void;
    checked: string[];
}

const BrandListTable = ({
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
}: BrandListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'image',
            label: 'Brand',
            content: (object: BrandResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object.image ?? ''}`} alt="brand-image" radius="xl" />
                    <Text weight={500}>{object?.name}</Text>
                </Group>
            ),
        },
        {
            path: 'actions',
            label: '',
            content: (object: BrandResult) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            sx={{
                                cursor: 'pointer',
                            }}
                            onClick={() => handleFormModalEdit(object)}>
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
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess &&
                (data.length < 1 ? (
                    <NoDataMessage />
                ) : (
                    <>
                        <TableTopBar checked={checked} deleteModal={onClickDeleteAll} onHandleSearch={onHandleSearch} />
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
                            handleLimitChange={handleLimitChange}
                            limitChange={limitChange}
                        />
                    </>
                ))}
        </>
    );
};

export default BrandListTable;
