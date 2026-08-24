import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { useThemeIconStyles } from '@cagtu-cms/ui-styles';
import { CategoryResult, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, ThemeIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconList, IconTrash } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';

interface CategoriesListTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: CategoryResult) => void;
    checked: string[];
}

const CategoriesListTable = ({
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
}: CategoriesListTableProps) => {
    const { classes } = useThemeIconStyles();
    const navigate = useNavigate();

    const columns: TableColumnsProps[] = [
        {
            path: 'icon',
            label: 'Icon',
            content: (object: CategoryResult) => (
                <ThemeIcon variant="light" size={'xl'} color="gray">
                    <div className={classes.ct_theme_icon} dangerouslySetInnerHTML={{ __html: String(object.icon) }} />
                </ThemeIcon>
            ),
            style: {
                width: 80,
            },
        },
        {
            path: 'name',
            label: 'Name',
        },
        {
            path: 'actions',
            label: '',
            content: (object: CategoryResult) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="Sub Categories" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            onClick={() => navigate(`/categories/${object.id}`)}
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
                            onClick={() => handleSingleDelete(String(object.id))}
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

export default CategoriesListTable;
