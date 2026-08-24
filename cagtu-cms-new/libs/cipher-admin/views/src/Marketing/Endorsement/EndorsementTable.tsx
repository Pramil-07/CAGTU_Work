import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, EndorsementResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Anchor, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useContext } from 'react';

interface EndorsementTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: EndorsementResult) => void;
    isFetching: boolean;
    query: string;
}

const EndorsementTable = ({
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
}: EndorsementTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'image',
            label: 'Name',
            content: (object: EndorsementResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object.image ?? ''}`} alt="badge-image" radius="xl" />
                    <Text weight={500}>{object?.title}</Text>
                </Group>
            ),
        },
        {
            path: 'created_by',
            label: 'Created By',
            content: (object: EndorsementResult) => <Text component="span">{_.upperFirst(object?.created_by)}</Text>,
            style: {
                width: 150,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: EndorsementResult) => <span>{converDateFromIsonString(object?.created_at)}</span>,
            style: {
                width: 150,
            },
        },
        {
            path: 'updated_by',
            label: 'Updated By',
            content: (object: EndorsementResult) => <Text component="span">{_.upperFirst(object?.updated_by)}</Text>,
            style: {
                width: 150,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: EndorsementResult) => <Text component="span">{dayjs(object?.updated_at).fromNow()}</Text>,
            style: {
                width: 150,
            },
        },
        {
            path: 'url',
            label: 'Page URL',
            content: (object: EndorsementResult) => (
                <Anchor href={object.url} target="_blank">
                    {object.url}
                </Anchor>
            ),
            style: {
                width: 150,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: EndorsementResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_advertisement')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_advertisement')) && (
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
                width: 80,
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

export default EndorsementTable;
