import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, SubCategoriesFormValueProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconList, IconTrash } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';

interface SubCategoriesListTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: SubCategoriesFormValueProps) => void;
    categoryParentId: number;
    checked: string[];
}

const SubCategoriesListTable = ({
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
    categoryParentId,
    limitChange,
    handleLimitChange,
}: SubCategoriesListTableProps) => {
    const navigate = useNavigate();

    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
        },
        {
            path: 'actions',
            label: '',
            content: (object: SubCategoriesFormValueProps) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="Sub Categories" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            onClick={() => navigate(`/categories/${categoryParentId}/${object?.id}`)}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <IconList size={15} />
                        </ActionIcon>
                    </Tooltip>
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
                            onClick={() => handleSingleDelete(String(object?.id))}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <IconTrash size={15} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
            style: {
                width: 120,
            },
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
                            limitChange={limitChange}
                            handleLimitChange={handleLimitChange}
                        />
                    </>
                ))}
        </>
    );
};

export default SubCategoriesListTable;
