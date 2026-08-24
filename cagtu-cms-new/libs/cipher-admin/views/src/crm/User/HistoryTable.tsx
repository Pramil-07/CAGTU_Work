import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, TableColumnsProps, UserHistoryResult } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';

interface HistoryTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleDetail: (object: UserHistoryResult) => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const HistoryTable = ({
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
    isFetching,
    query,
}: HistoryTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'user',
            label: 'User',
            content: (object: UserHistoryResult) => (
                <Group position="left" spacing={5}>
                    <Avatar src={`${object?.user?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.user?.first_name ?? ''} ${
                        object?.user?.middle_name ?? ''
                    } ${object?.user?.last_name ?? ''}`}</Text>
                </Group>
            ),
        },
        {
            path: 'from_date',
            label: ' Deactivated On',
            content: (object: UserHistoryResult) => (!_.isNull(object?.from_date) ? converDateFromIsonString(object?.from_date) : '-'),
            style: {
                width: 140,
            },
        },
        {
            path: 'to_date',
            label: 'Reactivated on',
            content: (object: UserHistoryResult) => (!_.isNull(object?.to_date) ? converDateFromIsonString(object?.to_date) : '-'),
            style: {
                width: 140,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: UserHistoryResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_deactivatehistory')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleDetail(object)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 40,
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
                                <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
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
                    isCheckbox={false}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default HistoryTable;
