import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    getFormatedTimeAmPm,
    ServiceOfferResult,
    TableColumnsProps,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEdit, IconEye, IconTrash } from '@tabler/icons';
import * as _ from 'lodash';
import { useContext } from 'react';

interface ServiceOfferTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: ServiceOfferResult) => void;
    checked: string[];
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
    handleDetailModalOpen: (object: ServiceOfferResult) => void;
}

const ServiceOfferTable = ({
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
    onShowFilterForm,
    isFetching,
    query,
    handleDetailModalOpen,
}: ServiceOfferTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Name',
        },
        {
            path: 'offer_rule',
            label: 'Offer Rule',
            content: (object: ServiceOfferResult) => <Text>{object?.offer_rule?.title}</Text>,
            style: {
                width: 250,
            },
        },
        {
            path: 'redeem_points',
            label: 'Redeem Points',
            content: (object: ServiceOfferResult) => <Text>{object?.redeem_points ?? '-'}</Text>,
            style: {
                width: 250,
            },
        },
        {
            path: 'created_by',
            label: 'Created By',
            content: (object: ServiceOfferResult) => (
                <Group position="left" spacing={5}>
                    <Avatar src={`${object?.created_by?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    {object?.created_by?.username === 'admin' ? (
                        <Text weight={500} component="span">
                            Admin
                        </Text>
                    ) : (
                        <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.created_by?.first_name ?? ''} ${
                            object?.created_by?.middle_name ?? ''
                        } ${object?.created_by?.last_name ?? ''}`}</Text>
                    )}
                </Group>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'start_date',
            label: 'Offer starts on',
            content: (object: ServiceOfferResult) =>
                !_.isNull(object?.start_date) ? `${converDateFromIsonString(object?.start_date)} ${getFormatedTimeAmPm(object?.start_date)}` : '-',
            style: {
                width: 120,
            },
        },
        {
            path: 'end_date',
            label: 'Offer ends on',
            content: (object: ServiceOfferResult) =>
                !_.isNull(object?.end_date) ? `${converDateFromIsonString(object?.end_date)} ${getFormatedTimeAmPm(object?.end_date)}` : '-',
            style: {
                width: 120,
            },
        },
        {
            path: 'is_consumable',
            label: 'Consumable',
            content: (object: ServiceOfferResult) => (
                <Badge name={object?.is_consumable ? 'Yes' : 'No'} color={object?.is_consumable ? 'green' : 'red'} />
            ),
            style: {
                width: 110,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: ServiceOfferResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 80,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ServiceOfferResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_offer')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => {
                                    handleDetailModalOpen(object);
                                }}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('change_offer')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_offer')) && (
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
                width: 150,
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
                        <>
                            <Group position="left" spacing={10} align="normal">
                                <TableTopBar
                                    checked={checked}
                                    deleteModal={onClickDeleteAll}
                                    onHandleSearch={onHandleSearch}
                                    loading={isFetching}
                                    query={query}
                                />
                            </Group>
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
                                        <IconAdjustmentsHorizontal size={22} stroke={1.75} />
                                    </ActionIcon>
                                </Group>
                            </UnstyledButton>
                        </>
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_offer')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default ServiceOfferTable;
