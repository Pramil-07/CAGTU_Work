import { Badge, Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, FaqTopicResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { useContext } from 'react';

interface FaqTopicTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: FaqTopicResult) => void;
    checked: string[];
    handleFormModal: () => void;
    isFetching: boolean;
    query: string;
}

const FaqTopicTable = ({
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
    isFetching,
    query,
}: FaqTopicTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'topic',
            label: 'Topic',
        },
        {
            path: 'faq_count',
            label: 'Faq Count',
            content: (object: FaqTopicResult) => <Badge name={object?.faq_count} radius="xl" />,
            style: {
                width: 120,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: FaqTopicResult) => converDateFromIsonString(object?.created_at),
            style: {
                width: 120,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: FaqTopicResult) => dayjs(object?.updated_at).fromNow(),
            style: {
                width: 150,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: FaqTopicResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_faqtopic')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_faqtopic')) && (
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
                    {(is_superuser || user_permissions?.includes('add_faqtopic')) && <Button name="Create" onClick={handleFormModal} />}
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_faqtopic')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default FaqTopicTable;
