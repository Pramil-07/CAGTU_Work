import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, TableColumnsProps, TopSkillsResult } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface TopSkillsTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: TopSkillsResult) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const TopSkillsTable = ({
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
}: TopSkillsTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'skills',
            label: 'Name',
            content: (object: TopSkillsResult) => (
                <Group spacing={5}>
                    {JSON.parse(object?.skills).map((val: string, index: number) => (
                        <Badge key={index} name={val} color={'dark'} radius="xl" variant='dot' />
                    ))}
                </Group>
            ),
        },
        {
            path: 'country.name',
            label: 'Country',
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: TopSkillsResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_topskill')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_topskill')) && (
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
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar
                        checked={checked}
                        deleteModal={onClickDeleteAll}
                        onHandleSearch={onHandleSearch}
                        loading={isFetching}
                        query={query}
                    />
                    {data.length > 0 && (
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
                            isCheckbox={is_superuser || user_permissions?.includes('delete_topskill')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default TopSkillsTable;
