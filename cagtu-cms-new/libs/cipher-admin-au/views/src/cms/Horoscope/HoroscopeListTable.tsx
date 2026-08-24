import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    DataTableProps,
    HoroscopeResult,
    TableColumnsProps,
    getEnglishHoroscopeName,
    getHoroscopeFormat,
    getNepaliHoroscopeName,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip, Text, Badge } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface HoroscopeListTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    handleSingleDelete: (id: number) => void;
    handleFormModalEdit: (object: HoroscopeResult) => void;
    query: string;
}

const HoroscopeListTable = ({
    data,
    isLoading,
    isSuccess,
    isFetching,
    query,
    onHandleSearch,
    page,
    total,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
    handleFormModalEdit,
    limitChange,
    handleLimitChange,
    onSetPage,
}: HoroscopeListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);

    const columns: TableColumnsProps[] = [
        {
            path: 'sign',
            label: 'Sign',
            content: (object: HoroscopeResult) => (
                <Text>{object?.is_nepali ? getNepaliHoroscopeName(object?.sign) : getEnglishHoroscopeName(object?.sign)}</Text>
            ),
            style: {
                width: 200,
            },
        },
        {
            path: 'description',
            label: 'Description',
            content: (object: HoroscopeResult) => <Text>{object?.description}</Text>,
        },
        {
            path: 'is_nepali',
            label: 'Language',
            content: (object: HoroscopeResult) => <Text>{object?.is_nepali ? 'Nepali' : 'English'}</Text>,
            style: {
                width: 150,
            },
        },
        {
            path: 'start_date',
            label: 'Starts On',
            content: (object: HoroscopeResult) => <Text>{object?.start_date}</Text>,
            style: {
                width: 150,
            },
        },
        {
            path: 'end_date',
            label: 'Ends On ',
            content: (object: HoroscopeResult) => <Text>{object?.end_date}</Text>,
            style: {
                width: 150,
            },
        },
        {
            path: 'type',
            label: 'Display Format',
            content: (object: HoroscopeResult) => <Badge>{getHoroscopeFormat(object?.type as number)}</Badge>,
            style: {
                width: 150,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: HoroscopeResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_blog')) && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                sx={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    handleFormModalEdit(object);
                                }}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('delete_blog')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(object.id as number)}
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
                width: 80,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    {data.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            isLoading={isLoading}
                            isSuccess={isSuccess}
                            total={total}
                            isDeleteModalOpened={isDeleteModalOpened}
                            isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                            onSetPage={onSetPage}
                            onConfirmSingleDelete={onConfirmSingleDelete}
                            handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
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

export default HoroscopeListTable;
