import { Badge, DataTable, NoDataMessage, SkeletonTableList, StatusBadge, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    TableColumnsProps,
    TaskResult,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconArrowBadgeUp, IconEdit, IconFileSpreadsheet, IconMapPin, IconMedal, IconTrash } from '@tabler/icons';
import * as _ from 'lodash';
import { useContext } from 'react';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
interface TaskListTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    checked: string[];
    onShowFilterForm: () => void;
    handleEndorse: () => void;
    isFetching: boolean;
    query: string;
}

const TaskListTable = ({
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
    limitChange,
    handleLimitChange,
    onShowFilterForm,
    handleEndorse,
    isFetching,
    query,
}: TaskListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const navigate = useNavigate();
    const [iconColorMode] = useIconColorMode();

    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Task',
            content: (object: TaskResult) => (
                <Group position="left" spacing={5}>
                    <Text>{object?.title}</Text>
                    {object?.is_endorsed && (
                        <Tooltip
                            label="Endorsed"
                            position="right-start"
                            styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}
                            withArrow>
                            <ThemeIcon variant="light" radius="xl" size={22} color="green">
                                <IconArrowBadgeUp size={20} stroke={1.75} />
                            </ThemeIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 200,
            },
        },
        {
            path: 'service',
            label: 'Related Service',
            content: (object: TaskResult) => <Badge name={String(object?.service?.title)} />,
        },
        {
            path: 'category',
            label: 'Related Category',
            content: (object: TaskResult) => <Badge name={String(object?.service?.category?.name)} />,
        },
        {
            path: 'location',
            label: 'Location',
            content: (object: TaskResult) => (
                <Group spacing={4}>
                    <IconMapPin size={16} stroke={1.75} color={iconColorMode} />
                    <Text weight={500} size={13}>
                        {object?.location ? _.capitalize(object?.location) : '-'}
                    </Text>
                </Group>
            ),
            style: {
                width: 200,
            },
        },
        {
            path: 'budget',
            label: 'Budget',
            content: (object: TaskResult) => (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                    {object?.is_range ? (
                        <>
                            {!_.isNull(object?.budget_from) ? (
                                <span>
                                    {object?.budget_from ? `${object?.currency?.symbol ?? ''} ${_.ceil(Number(object?.budget_from), 2)}` : '-'}
                                </span>
                            ) : null}
                            {' - '}
                            {!_.isNull(object?.budget_to) ? (
                                <span>{object?.budget_to ? `${object?.currency?.symbol ?? ''} ${_.ceil(Number(object?.budget_to), 2)}` : '-'}</span>
                            ) : null}
                        </>
                    ) : !_.isNull(object?.budget_from) ? (
                        <span>{object?.budget_from ? `${object?.currency?.symbol ?? ''} ${_.ceil(Number(object?.budget_from), 2)}` : '-'}</span>
                    ) : null}
                </>
            ),
            style: {
                width: 150,
            },
        },
        {
            path: 'budget_type',
            label: 'Budget Type',
            content: (object: TaskResult) => <StatusBadge name={String(_.toLower(object?.budget_type)) ?? ''} />,
            style: {
                width: 120,
            },
        },
        {
            path: 'payable_amount',
            label: 'Payable Amount',
            content: (object: TaskResult) => (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                    {object?.is_range ? (
                        <>
                            {!_.isNull(object?.payable_from) ? (
                                <span>
                                    {object?.payable_from ? `${object?.currency?.symbol ?? ''} ${_.ceil(Number(object?.payable_from), 2)}` : '-'}
                                </span>
                            ) : null}
                            {' - '}
                            {!_.isNull(object?.payable_to) ? (
                                <span>{object?.payable_to ? `${object?.currency?.symbol ?? ''} ${_.ceil(Number(object?.payable_to), 2)}` : '-'}</span>
                            ) : null}
                        </>
                    ) : !_.isNull(object?.payable_from) ? (
                        <span>{object?.payable_from ? `${object?.currency?.symbol ?? ''} ${_.ceil(Number(object?.payable_from), 2)}` : '-'}</span>
                    ) : null}
                </>
            ),
            style: {
                width: 150,
            },
        },
        {
            path: 'is_requested',
            label: 'Service Type',
            content: (object: TaskResult) => (
                <Badge name={object?.is_requested ? 'Requested' : 'Provided'} color={object?.is_requested ? 'orange' : 'green'} />
            ),
            style: {
                width: 110,
            },
        },
        {
            path: 'created_by',
            label: 'Created By',
            content: (object: TaskResult) => (
                <Group position="left" spacing={8}>
                    <Avatar src={`${object?.created_by?.profile_image ?? ''}`} alt="user-profile" size={28} radius={'xl'} />
                    {object?.created_by?.username !== 'admin' ? (
                        <Text weight={500} size={13} component="span" sx={{ maxWidth: '80%' }}>{`${object?.created_by?.first_name ?? ''} ${
                            object?.created_by?.middle_name ?? ''
                        } ${object?.created_by?.last_name ?? ''}`}</Text>
                    ) : (
                        <Text weight={500} size={13} component="span">
                            {_.upperFirst(object?.created_by?.username)}
                        </Text>
                    )}
                </Group>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: TaskResult) => (object?.created_at ? converDateFromIsonString(object?.created_at as Date) : '_'),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: TaskResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_entityservice')) && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                sx={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => navigate(`/task/entity-service/${object.id}/edit`)}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('delete_entityservice')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(String(object.id))}
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
                        <>
                            <Group position="left" spacing={10} align="normal">
                                <TableTopBar
                                    checked={checked}
                                    deleteModal={onClickDeleteAll}
                                    onHandleSearch={onHandleSearch}
                                    loading={isFetching}
                                    query={query}>
                                    <Tooltip
                                        label="Endorse"
                                        position="bottom"
                                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                        <ActionIcon
                                            variant="light"
                                            radius="xl"
                                            size={40}
                                            color="gray"
                                            sx={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={handleEndorse}>
                                            <IconMedal size={22} stroke={1.75} />
                                        </ActionIcon>
                                    </Tooltip>
                                </TableTopBar>
                                <CSVLink data={data} filename="entity_service_list.csv" target="_blank">
                                    <Tooltip
                                        label="Export CSV"
                                        position="bottom"
                                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                        <ActionIcon
                                            variant="light"
                                            radius="xl"
                                            size={40}
                                            color="gray"
                                            sx={{
                                                cursor: 'pointer',
                                            }}>
                                            <IconFileSpreadsheet size={22} stroke={1.75} />
                                        </ActionIcon>
                                    </Tooltip>
                                </CSVLink>
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
                                        <IconAdjustmentsHorizontal size={24} stroke={1.75} />
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_entityservice')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default TaskListTable;
