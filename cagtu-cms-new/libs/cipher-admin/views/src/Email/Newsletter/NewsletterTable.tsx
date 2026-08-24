import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, NewsletterResult, TableColumnsProps, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { Group } from '@mantine/core';

interface NewsletterTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    isFetching: boolean;
    query: string;
}

const NewsletterTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: NewsletterTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'email',
            label: 'Email',
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: NewsletterResult) => converDateFromIsonString(object?.created_at),
            style: {
                width: 150,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: NewsletterResult) => converDateFromIsonString(object?.updated_at),
            style: {
                width: 150,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: NewsletterResult) => (
                <Badge name={object?.is_active ? 'Subscribed' : 'Unsubscribed'} color={object?.is_active ? 'green' : 'red'} />
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

export default NewsletterTable;
