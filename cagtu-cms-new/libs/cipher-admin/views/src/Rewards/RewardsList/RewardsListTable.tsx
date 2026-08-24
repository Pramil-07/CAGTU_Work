import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, RewardsListResult, TableColumnsProps, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Badge, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal } from '@tabler/icons';
import _ from 'lodash';

interface RewardsListTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    query: string;
    onShowFilterForm: () => void;
}

const RewardsListTable = ({
    isLoading,
    isSuccess,
    isFetching,
    onHandleSearch,
    query,
    data,
    total,
    page,
    onSetPage,
    limitChange,
    handleLimitChange,
    onShowFilterForm,
}: RewardsListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'user',
            label: 'User',
            content: (object: RewardsListResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.user?.profile_image ?? ''}`} alt="receiver-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.user?.full_name ?? ''}
                            </Text>
                        </Group>
                        <Group position="left" spacing={5}>
                            <Text color="dimmed" size={'xs'}>
                                {object?.user?.email ? `${object?.user?.email}` : `@${object?.user.username}`}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'object_repr',
            label: 'Description',
            content: (object: RewardsListResult) => <Text component="span">{object?.object_repr}</Text>,
        },
        {
            path: 'points',
            label: 'Reward Points',
            content: (object: RewardsListResult) => (
                <Group position="left" spacing={5}>
                    <Text weight={600} component="span">
                        {Number(object?.points)}
                    </Text>
                </Group>
            ),
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: RewardsListResult) => (
                <Badge
                    size="lg"
                    radius="sm"
                    color={_.toLower(object?.status) === 'earned' ? 'green' : _.toLower(object?.status) === 'spent' ? 'red' : ''}
                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.status}
                </Badge>
            ),
        },
        {
            path: 'created_at',
            label: 'Created At',
            content: (object: RewardsListResult) => <Text component="span">{converDateFromIsonString(object?.created_at)}</Text>,
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
                            <TableTopBar onHandleSearch={onHandleSearch} showDelete={false} loading={isFetching} query={query} />
                        </Group>
                    )}
                    {isSuccess && (
                        <Group position="right" align="normal">
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
                        </Group>
                    )}
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    total={total}
                    columns={columns}
                    page={page}
                    onSetPage={onSetPage}
                    isCheckbox={false}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default RewardsListTable;
