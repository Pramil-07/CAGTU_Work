import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, CurrencyResult, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface CurrencyTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: CurrencyResult) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const CurrencyTable = ({
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
}: CurrencyTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
        },
        {
            path: 'code',
            label: 'Code',
            content: (object: CurrencyResult) => <Text component="span">{`${object?.code} (${object?.symbol})`}</Text>,
            style: {
                width: 110,
            },
        },
        {
            path: 'current_value',
            label: 'Current Value',
            content: (object: CurrencyResult) => <Badge name={Number(object?.current_value) ?? 0} radius="xl" />,
            style: {
                width: 140,
            },
        },
        {
            path: 'minor',
            label: 'Minor',
            content: (object: CurrencyResult) => <Badge name={Number(object?.minor) ?? 0} radius="xl" />,
            style: {
                width: 90,
            },
        },
        {
            path: 'configuration',
            label: 'Configuration',
            content: (object: CurrencyResult) => (
                <Badge
                    name={object?.enable_currency_configuration ? 'Enabled' : 'Disabled'}
                    color={object?.enable_currency_configuration ? 'indigo' : 'gray'}
                />
            ),
            style: {
                width: 130,
            },
        },
        {
            path: 'is_default',
            label: 'Is Default',
            content: (object: CurrencyResult) => <Badge name={object?.is_default ? 'Yes' : 'No'} color={object?.is_default ? 'green' : 'red'} />,
            style: {
                width: 100,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: CurrencyResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 90,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: CurrencyResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_currency')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_currency')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(object.code)}
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
                            isCheckbox={is_superuser || user_permissions?.includes('delete_currency')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default CurrencyTable;
