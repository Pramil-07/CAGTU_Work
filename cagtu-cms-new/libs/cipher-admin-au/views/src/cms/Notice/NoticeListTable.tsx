import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, NoticeResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface NoticeListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: NoticeResult) => void;
    isFetching: boolean;
    query: string;
}

const NoticeListTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    onSetPage,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
    onHandleSearch,
    handleFormModalEdit,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: NoticeListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Notice Name',
        },
        {
            path: 'actions',
            label: '',
            content: (object: NoticeResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_notice')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_notice')) && (
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
                width: 120,
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

export default NoticeListTable;
