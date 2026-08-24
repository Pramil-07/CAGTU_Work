import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { converDateFromIsonString, DataTableProps, HelpResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import _ from 'lodash';

interface HelpTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleDetail: (object: HelpResult) => void;
    onShowFilterForm: () => void;
}

const HelpTable = ({
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
}: HelpTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'user',
            label: 'User',
            content: (object: HelpResult) => (
                <Group position="left" spacing={5}>
                    <Avatar src={`${object?.user?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>{`${object?.user?.first_name ?? ''} ${
                        object?.user?.middle_name ?? ''
                    } ${object?.user?.last_name ?? ''}`}</Text>
                </Group>
            ),
        },
        {
            path: 'topic',
            label: 'Topic',
            content: (object: HelpResult) => _.upperFirst(object?.topic?.topic),
            style: {
                width: 200,
            },
        },
        {
            path: 'reason',
            label: 'Reason',
            content: (object: HelpResult) => object?.reason ?? '-',
            style: {
                width: 300,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: HelpResult) => converDateFromIsonString(object?.created_at),
            style: {
                width: 140,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: HelpResult) => (
                <Group position="right" spacing={5}>
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
                    isCheckbox={false}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default HelpTable;
