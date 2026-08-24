import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, RatingListResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Rating, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import { useContext } from 'react';

interface RatingListTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    query: string;
    onShowFilterForm: () => void;
    handleDetailModalOpen: (value: RatingListResult) => void;
}

const RatingListTable = ({
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
    handleDetailModalOpen,
}: RatingListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const columns: TableColumnsProps[] = [
        {
            path: 'entity_service',
            label: 'Service',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Text>{object?.entity_service ?? ''}</Text>
                </Group>
            ),
        },
        {
            path: 'service_type',
            label: 'Service Type',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Text>{object?.service_type ?? ''}</Text>
                </Group>
            ),
        },
        {
            path: 'rated_by',
            label: 'Rated By',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.rated_by?.profile_image ?? ''}`} alt="rated-by-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.rated_by?.full_name ?? ''}
                            </Text>
                        </Group>
                        <Group position="left" spacing={5}>
                            <Text color="dimmed" size={'xs'}>
                                {object?.rated_by?.email ? `${object?.rated_by?.email}` : `@${object?.rated_by.username}`}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'rated_to',
            label: 'Rated To',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.rated_to?.profile_image ?? ''}`} alt="rated-to-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.rated_to?.full_name ?? ''}
                            </Text>
                        </Group>
                        <Group position="left" spacing={5}>
                            <Text color="dimmed" size={'xs'}>
                                {object?.rated_to?.email ? `${object?.rated_to?.email}` : `@${object?.rated_to.username}`}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'rating',
            label: 'Rating',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Rating value={object?.rating ?? 0} fractions={2} readOnly />
                </Group>
            ),
        },
        {
            path: 'review',
            label: 'Review',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Text>{object?.review ?? '-'}</Text>
                </Group>
            ),
        },
        {
            path: 'reply',
            label: 'Reply',
            content: (object: RatingListResult) => (
                <Group position="left" spacing={10}>
                    <Text>{object?.reply ?? '-'}</Text>
                </Group>
            ),
        },
        {
            path: 'actions',
            label: '',
            content: (object: RatingListResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_rating')) && (
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

export default RatingListTable;
