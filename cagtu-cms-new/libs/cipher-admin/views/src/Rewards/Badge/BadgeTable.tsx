import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { BadgeResult, CipherUserContext, converDateFromIsonString, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { useContext } from 'react';

interface BadgeTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: BadgeResult) => void;
    isFetching: boolean;
    query: string;
}

const BadgeTable = ({
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
}: BadgeTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'image',
            label: 'Name',
            content: (object: BadgeResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object.image ?? ''}`} alt="badge-image" radius="xl" />
                    <Text weight={500}>{object?.title}</Text>
                </Group>
            ),
        },
        {
            path: 'active_user',
            label: 'Active User',
            content: (object: BadgeResult) => <Badge name={object?.active_user ?? 0} radius="xl" />,
            style: {
                width: 100,
            },
        },
        {
            path: 'progress_level_start',
            label: 'Level Start',
            content: (object: BadgeResult) => <Badge name={object?.progress_level_start ?? 0} color="gray" radius="xl" />,
            style: {
                width: 100,
            },
        },
        {
            path: 'progress_level_end',
            label: 'Level End',
            content: (object: BadgeResult) => <Badge name={object?.progress_level_end ?? 0} color="gray" radius="xl" />,
            style: {
                width: 100,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: BadgeResult) => <span>{converDateFromIsonString(object?.created_at)}</span>,
            style: {
                width: 120,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: BadgeResult) => <span>{dayjs(object?.updated_at).fromNow()}</span>,
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: BadgeResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_badge')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_badge')) && (
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
                    {data?.length > 0 && (
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

export default BadgeTable;
