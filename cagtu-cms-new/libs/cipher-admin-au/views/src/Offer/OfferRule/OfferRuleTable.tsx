import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, OfferRuleResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface OfferRuleTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: OfferRuleResult) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const OfferRuleTable = ({
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
}: OfferRuleTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Name',
        },
        {
            path: 'has_discount',
            label: 'Discount',
            content: (object: OfferRuleResult) => <Badge name={object?.has_discount ? 'Yes' : 'No'} color={object?.has_discount ? 'green' : 'red'} />,
            style: {
                width: 100,
            },
        },
        {
            path: 'has_free_items',
            label: 'Free Items',
            content: (object: OfferRuleResult) => (
                <Badge name={object?.has_free_items ? 'Yes' : 'No'} color={object?.has_free_items ? 'green' : 'red'} />
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'has_quantity',
            label: 'Quantity',
            content: (object: OfferRuleResult) => <Badge name={object?.has_quantity ? 'Yes' : 'No'} color={object?.has_quantity ? 'green' : 'red'} />,
            style: {
                width: 100,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: OfferRuleResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 80,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: OfferRuleResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_offerrule')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_offerrule')) && (
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
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={'apart'} spacing={10} align="normal">
                    {isSuccess && (
                        <Group position="left" spacing={10} align="normal">
                            <TableTopBar
                                checked={checked}
                                deleteModal={onClickDeleteAll}
                                onHandleSearch={onHandleSearch}
                                query={query}
                                loading={isFetching}
                            />
                        </Group>
                    )}
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_offerrule')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default OfferRuleTable;
