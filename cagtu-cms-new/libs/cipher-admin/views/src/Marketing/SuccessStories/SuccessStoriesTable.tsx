import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    SuccessStoriesFormValuesProps,
    SuccessStoriesResult,
    TableColumnsProps,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface SuccessStoriesTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: SuccessStoriesFormValuesProps) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const SuccessStoriesTable = ({
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
}: SuccessStoriesTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'profile_image',
            label: 'Profile',
            content: (object: SuccessStoriesResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object.profile_image ?? ''}`} alt="user-profile" radius="xl" />
                    <Text weight={500}>{object?.full_name}</Text>
                </Group>
            ),
            style: {
                width: 200,
            },
        },
        {
            path: 'content',
            label: 'Content',
        },
        {
            path: 'email',
            label: 'Email Address',
            style: {
                width: 250,
            },
        },
        {
            path: 'specialities',
            label: 'Speciality',
            style: {
                width: 220,
            },
        },
        {
            path: 'created_by',
            label: 'Created By',
            style: {
                width: 200,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: SuccessStoriesResult) => <span>{converDateFromIsonString(object?.created_at)}</span>,
            style: {
                width: 160,
            },
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: SuccessStoriesResult) => (
                <Badge name={object?.status ? 'Active' : 'Inactive'} color={object?.status ? 'green' : 'red'} />
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: SuccessStoriesFormValuesProps) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_successstory')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_successstory')) && (
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
                    {data?.length > 0 && (
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
                            isCheckbox={is_superuser || user_permissions?.includes('delete_successstory')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default SuccessStoriesTable;
