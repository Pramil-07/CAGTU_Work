import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, RewardsRuleResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';

interface RewardsRuleTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: RewardsRuleResult) => void;
    isFetching: boolean;
    query: string;
}

const RewardsRuleTable = ({
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
}: RewardsRuleTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'type',
            label: 'Type',
            content: (object: RewardsRuleResult) => _.upperFirst(object?.type),
        },
        {
            path: 'action',
            label: 'Action',
            content: (object: RewardsRuleResult) => _.upperFirst(object?.action),
            style: {
                width: 110,
            },
        },
        {
            path: 'reward_points',
            label: 'Points',
            content: (object: RewardsRuleResult) => <Badge name={object?.reward_points ?? 0} color="gray" radius="xl" />,
            style: {
                width: 100,
            },
        },
        // {
        //     path: 'reward_percentage',
        //     label: 'Perecent (%)',
        //     content: (object: RewardsRuleResult) => <Badge name={`${object?.reward_percentage ?? 0}%`} color="gray" radius="xl" />,
        //     style: {
        //         width: 120,
        //     },
        // },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: RewardsRuleResult) => converDateFromIsonString(new Date(String(object?.created_at))),
            style: {
                width: 120,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: RewardsRuleResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 80,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: RewardsRuleResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_rewardrule')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_rewardrule')) && (
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
                            <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
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
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                    onSetPage={onSetPage}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isCheckbox={false}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default RewardsRuleTable;
