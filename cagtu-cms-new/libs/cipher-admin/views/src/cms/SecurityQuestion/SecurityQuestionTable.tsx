import { DataTable, NoDataMessage, SkeletonTableList } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, SecurityQuestionResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface SecurityQuestionTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    handleFormModalEdit: (object: SecurityQuestionResult) => void;
}

const SecurityQuestionTable = ({
    data,
    isLoading,
    isSuccess,
    total,
    handleSingleDelete,
    handleFormModalEdit,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
}: SecurityQuestionTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'question',
            label: 'Question',
            content: (object: SecurityQuestionResult) => object?.question,
        },
        {
            path: 'actions',
            label: '',
            content: (object: SecurityQuestionResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_securityquestion')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_securityquestion')) && (
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
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    columns={columns}
                    total={total}
                    isDeleteModalOpened={isDeleteModalOpened}
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    isCheckbox={false}
                    withPaginaton={false}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default SecurityQuestionTable;
