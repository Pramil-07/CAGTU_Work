import { DataTable, SkeletonTableList, TableTopBar, Badge, NoDataMessage } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, SkillsResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface SkillsTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    query: string;
}

const SkillsTable = ({
    isFetching,
    data,
    isSuccess,
    isLoading,
    onHandleSearch,
    query,
    page,
    total,
    limitChange,
    handleLimitChange,
    onSetPage,
    handleSingleDelete,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDeleteCloseModal,
    onConfirmSingleDelete,
}: SkillsTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Skills',
            content: (object: SkillsResult) => (
                <Group spacing={5}>
                    <Badge name={object?.name ?? ''} color={'dark'} variant="dot" radius="xl" />
                </Group>
            ),
        },
        {
            path: 'actions',
            label: '',
            content: (object: SkillsResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('delete_skill')) && (
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
                    <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    {data.length > 0 && (
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
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default SkillsTable;
