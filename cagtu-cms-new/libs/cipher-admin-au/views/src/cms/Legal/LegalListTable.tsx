import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, LegalResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconHistory, IconPoint } from '@tabler/icons';
import dayjs from 'dayjs';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface LegalListTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: LegalResult) => void;
    isFetching: boolean;
    query: string;
}

const LegalListTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    handleFormModalEdit,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: LegalListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const navigate = useNavigate();
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Name',
        },
        {
            path: 'is_current',
            label: 'Status',
            content: (object: LegalResult) => (
                <Badge
                    name={
                        <>
                            {object.is_current && <IconPoint size={14} stroke={3} style={{ position: 'relative', top: 3 }} />}{' '}
                            {object.is_current ? 'Current' : 'Draft'}
                        </>
                    }
                    color={object.is_current ? 'teal' : 'yellow'}
                />
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: LegalResult) => {
                return converDateFromIsonString(object?.created_at);
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: LegalResult) => dayjs(object?.updated_at).fromNow(),
            style: {
                width: 150,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: LegalResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_content')) && (
                        <Tooltip label="View History" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => navigate(`/cms/legal/${object.slug}`)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconHistory size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('change_content')) && (
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
                </Group>
            ),
            style: {
                width: 90,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    {data?.length > 0 && (
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
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default LegalListTable;
