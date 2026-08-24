import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar, Badge } from '@cagtu-cms/ui-shared';
import { AttributesResult, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import * as _ from 'lodash';

interface ProductAttributesListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: AttributesResult) => void;
    checked: string[];
}

const ProductAttributesListTable = ({
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
}: ProductAttributesListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
            content: (object: AttributesResult) => _.upperFirst(object.name),
        },
        {
            path: 'unit',
            label: 'Unit',
            content: (object: AttributesResult) => (object?.unit ? <Badge name={object?.unit} /> : <Badge name="None" color="gray" />),
            style: {
                width: 120,
            },
        },
        {
            path: 'type',
            label: 'Type',
            content: (object: AttributesResult) => <Badge name={object?.type} />,
            style: {
                width: 120,
            },
        },
        {
            path: 'info',
            label: 'Info',
            content: (object: AttributesResult) => (object?.info ? object?.info : '-'),
            style: {
                width: 300,
            },
        },
        {
            path: 'category_count',
            label: 'Categories Used',
            content: (object: AttributesResult) => <Badge color="dark" size="sm" radius="xl" name={object?.category_count} />,
            style: {
                width: 150,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: AttributesResult) => (
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
                            <IconEdit fontSize={15} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip
                        label="Delete"
                        position="bottom"
                        disabled={!!object?.category_count}
                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            onClick={() => handleSingleDelete(Number(object?.id))}
                            disabled={!!object?.category_count}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <IconTrash fontSize={15} />
                        </ActionIcon>
                    </Tooltip>
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
            {isSuccess &&
                (data && data.length < 1 ? (
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
                            limitChange={limitChange}
                            handleLimitChange={handleLimitChange}
                        />
                    </>
                ))}
        </>
    );
};

export default ProductAttributesListTable;
