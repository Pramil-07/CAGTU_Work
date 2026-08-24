import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { ContactResult, converDateFromIsonString, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { IconEye } from '@tabler/icons';
import * as _ from 'lodash';

interface ContactListTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleDetail: (object: ContactResult) => void;
    isFetching: boolean;
    query: string;
}

const ContactListTable = ({
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
    isFetching,
    query,
}: ContactListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'full_name',
            label: 'Name',
            content: (object: ContactResult) => <Text>{object?.first_name + ' ' + object?.last_name ?? '-'}</Text>,
        },
        {
            path: 'email',
            label: 'Email',
            content: (object: ContactResult) => object?.email ?? '-',
            style: {
                width: 240,
            },
        },
        {
            path: 'phone',
            label: 'Phone',
            content: (object: ContactResult) => (object?.phone !== '' ? object?.phone ?? '-' : '-'),
            style: {
                width: 140,
            },
        },
        {
            path: 'message',
            label: 'Message',
            content: (object: ContactResult) => (object?.message !== '' ? object?.message ?? '-' : '-'),
            style: {
                width: 400,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: ContactResult) => converDateFromIsonString(object?.created_at),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ContactResult) => (
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

export default ContactListTable;
