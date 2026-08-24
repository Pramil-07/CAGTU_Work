import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, KycDocumentResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface KYCDocumentListTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: KycDocumentResult) => void;
    query: string;
    isFetching: boolean;
}

const KYCDocumentListTable = ({
    query,
    data,
    page,
    isLoading,
    isSuccess,
    isFetching,
    total,
    handleSingleDelete,
    onSetPage,
    onHandleSearch,
    limitChange,
    handleLimitChange,
    isDeleteModalOpened,
    handleFormModalEdit,
    handleSingleDeleteCloseModal,
    onConfirmSingleDelete,
    isSingleDeleteMutationLoading,
}: KYCDocumentListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Document Type',
            content: (object: KycDocumentResult) => <Text component="span">{object?.name}</Text>,
        },
        {
            path: 'required_for_merchant',
            label: 'Required For Merchant',
            content: (object: KycDocumentResult) => (
                <Badge name={object?.required_for_merchant ? 'Yes' : 'No'} color={object?.required_for_merchant ? 'green' : 'red'} />
            ),
        },
        {
            path: 'required_for_user',
            label: 'Required For User',
            content: (object: KycDocumentResult) => (
                <Badge name={object?.required_for_user ? 'Yes' : 'No'} color={object?.required_for_user ? 'green' : 'red'} />
            ),
        },
        {
            path: 'actions',
            label: '',
            content: (object: KycDocumentResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_documenttype')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_documenttype')) && (
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
                width: 80,
            },
        },
    ];

    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <Group position={'apart'} spacing={10} align="normal">
                    <Group position="left" spacing={10} align="normal">
                        <TableTopBar onHandleSearch={onHandleSearch} query={query} loading={isFetching} />
                    </Group>
                </Group>
            )}
            {data && data.length >= 1 && (
                <DataTable
                    data={data}
                    columns={columns}
                    page={page}
                    total={total}
                    onSetPage={onSetPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isCheckbox={false}
                    isDeleteModalOpened={isDeleteModalOpened}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default KYCDocumentListTable;
