import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { ContactResult, converDateFromIsonString, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, UnstyledButton, Tooltip } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye } from '@tabler/icons';
import * as _ from 'lodash';

interface ContactListTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    onShowFilterForm: () => void;
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
    onShowFilterForm,
    handleDetail,
    isFetching,
    query,
}: ContactListTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'full_name',
            label: 'Name',
            content: (object: ContactResult) => <Text>{object?.full_name ?? '-'}</Text>,
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
            path: 'category',
            label: 'Category',
            content: (object: ContactResult) => (!_.isNull(object?.contact_us_category) ? object?.contact_us_category?.name : '-'),
            style: {
                width: 250,
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

export default ContactListTable;
