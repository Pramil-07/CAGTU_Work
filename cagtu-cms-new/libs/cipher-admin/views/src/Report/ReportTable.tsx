import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { converDateFromIsonString, DataTableProps, ReportResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye, IconTrash } from '@tabler/icons';
import * as _ from 'lodash';

interface ReportProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleDetail: (object: ReportResult, id: number) => void;
    onShowFilterForm: () => void;
}

const ReportTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    limitChange,
    handleLimitChange,
    handleDetail,
    onShowFilterForm,
    handleSingleDelete,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
}: ReportProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'model',
            label: 'Report About',
            content: (object: ReportResult) => _.upperFirst(object?.model),
        },
        {
            path: 'reported_by',
            label: 'Reported By',
            content: (object: ReportResult) => (
                <Group position="left" spacing={5}>
                    <Avatar src={`${object?.reported_by?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.reported_by?.first_name ?? ''} ${
                        object?.reported_by?.middle_name ?? ''
                    } ${object?.reported_by?.last_name ?? ''}`}</Text>
                </Group>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'action_performed_by',
            label: 'Resolved By',
            content: (object: ReportResult) =>
                !_.isNull(object?.action_performed_by?.id) ? (
                    <Group position="left" spacing={5}>
                        <Avatar src={`${object?.action_performed_by?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                        {object?.action_performed_by?.username === 'admin' ? (
                            <Text weight={500} component="span">
                                {_.upperFirst(object?.action_performed_by?.username)}
                            </Text>
                        ) : (
                            <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.action_performed_by?.first_name ?? ''} ${
                                object?.action_performed_by?.middle_name ?? ''
                            } ${object?.action_performed_by?.last_name ?? ''}`}</Text>
                        )}
                    </Group>
                ) : (
                    <Badge name="None" color="gray" />
                ),
            style: {
                width: 220,
            },
        },
        {
            path: 'reported_date',
            label: 'Reported On',
            content: (object: ReportResult) => converDateFromIsonString(object?.reported_date),
            style: {
                width: 140,
            },
        },
        {
            path: 'action_performed_date',
            label: 'Resolved On',
            content: (object: ReportResult) =>
                !_.isNull(object?.action_performed_date) ? converDateFromIsonString(object?.action_performed_date) : '-',
            style: {
                width: 140,
            },
        },
        {
            path: 'action',
            label: 'Action',
            content: (object: ReportResult) => (!_.isNull(object?.action) ? <Badge name={object?.action} color="red" /> : '-'),
            style: {
                width: 90,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ReportResult) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            onClick={() => handleDetail(object, object?.id)}
                            sx={{
                                cursor: 'pointer',
                            }}>
                            <IconEye size={18} stroke={1.75} />
                        </ActionIcon>
                    </Tooltip>
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
                </Group>
            ),
            style: {
                width: 80,
            },
        },
    ];
    return (
        <>
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={isSuccess && data.length ? 'apart' : 'right'} spacing={10} align="normal">
                    {isSuccess && data.length && (
                        <>
                            <Group position="left" spacing={10} align="normal">
                                <TableTopBar onHandleSearch={onHandleSearch} />
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
                    onSetPage={onSetPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isDeleteModalOpened={isDeleteModalOpened}
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    isCheckbox={false}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default ReportTable;
