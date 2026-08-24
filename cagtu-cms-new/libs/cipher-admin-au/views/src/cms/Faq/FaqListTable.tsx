import { Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, FaqResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEdit, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { useContext } from 'react';

interface FaqListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: FaqResult) => void;
    checked: string[];
    handleFormModal: () => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const FaqListTable = ({
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
    handleFormModal,
    onShowFilterForm,
    isFetching,
    query,
}: FaqListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'topic',
            label: 'Topic',
            content: (object: FaqResult) => object?.topic?.topic,
        },
        {
            path: 'title',
            label: 'Title',
            style: {
                width: '50%',
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: FaqResult) => converDateFromIsonString(object?.created_at),
            style: {
                width: 120,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: FaqResult) => dayjs(object?.updated_at).fromNow(),
            style: {
                width: 150,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: FaqResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_faq')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_faq')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(object.id)}
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
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={'apart'} spacing={10} align="normal">
                    <Group position="left" spacing={10} align="normal">
                        <TableTopBar
                            checked={checked}
                            deleteModal={onClickDeleteAll}
                            onHandleSearch={onHandleSearch}
                            loading={isFetching}
                            query={query}
                        />
                    </Group>
                    <Group position="right" align="normal">
                        <UnstyledButton component="div" onClick={onShowFilterForm}>
                            <Group position="right" spacing={10}>
                                <Text weight={500} component="span">
                                    Filter
                                </Text>
                                <ActionIcon
                                    variant="light"
                                    radius="xl"
                                    size={40}
                                    color="blue"
                                    sx={{
                                        cursor: 'pointer',
                                    }}>
                                    <IconAdjustmentsHorizontal size={24} stroke={1.75} />
                                </ActionIcon>
                            </Group>
                        </UnstyledButton>
                        {(is_superuser || user_permissions?.includes('add_faq')) && <Button name="Create" onClick={handleFormModal} />}
                    </Group>
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_faq')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default FaqListTable;
