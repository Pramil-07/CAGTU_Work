import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CagtuSiteCandidatesSchema,
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    getFileName,
    TableColumnsProps,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Tooltip, Text, useMantineTheme } from '@mantine/core';
import { IconFileDescription, IconId, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface CandidatesTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleCandidatesDetail: (id: number) => void;
    isFetching: boolean;
    query: string;
}

const CandidatesTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    onSetPage,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
    onHandleSearch,
    handleCandidatesDetail,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: CandidatesTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const theme = useMantineTheme();
    const columns: TableColumnsProps[] = [
        {
            path: 'full_name',
            label: 'Name',
            style: {
                width: 300,
            },
        },
        {
            path: 'email',
            label: 'Email',
            style: {
                width: 250,
            },
        },
        {
            path: 'phone',
            label: 'Phone',
            style: {
                width: 180,
            },
            content: (object: CagtuSiteCandidatesSchema) => `${object?.phone ?? 'N/A'}`,
        },
        {
            path: 'interested_position',
            label: 'Applied for / Interested position',
            content: (object: CagtuSiteCandidatesSchema) => `${object?.interested_position}`,
            style: {
                width: 350,
            },
        },
        {
            path: 'department',
            label: 'Department',
            content: (object: CagtuSiteCandidatesSchema) => `${object?.department}`,
            style: {
                width: 350,
            },
        },
        {
            path: 'experience',
            label: 'Experience',
            content: (object: CagtuSiteCandidatesSchema) => `${object?.experience ?? 'N/A'}`,
            style: {
                width: 150,
            },
        },
        {
            path: 'expected_salary',
            label: 'Expected Salary',
            content: (object: CagtuSiteCandidatesSchema) => `${object?.expected_salary ?? 'N/A'}`,
            style: {
                width: 200,
            },
        },
        {
            path: 'resume',
            label: 'Resume/CV',
            content: (object: CagtuSiteCandidatesSchema) => (
                <Text
                    component="a"
                    href={object?.resume}
                    target="_blank"
                    sx={{
                        '&:hover': {
                            color: theme.colors.blue['6'],
                        },
                    }}>
                    <Group spacing={8} align="center">
                        <ActionIcon component="span" variant="light" radius="xl" color="blue">
                            <IconFileDescription size={18} stroke={1.75} />
                        </ActionIcon>
                        <Text weight={500} size="xs" component="span" sx={{ maxWidth: '80%' }}>
                            {getFileName(object?.resume)}
                        </Text>
                    </Group>
                </Text>
            ),
            style: {
                width: 250,
            },
        },
        {
            path: 'created_at',
            label: 'Applied date',
            content: (object: CagtuSiteCandidatesSchema) => converDateFromIsonString(object?.created_at),
            style: {
                width: 200,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: CagtuSiteCandidatesSchema) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_candidate')) && (
                        <Tooltip label="Detail Preview" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleCandidatesDetail(object?.id)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconId size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('delete_candidate')) && (
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
                    )}
                </Group>
            ),
            style: {
                width: 150,
            },
        },
    ];
    return (
        <>
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                isSuccess && (
                    <Group position="left" spacing={10} align="normal">
                        <TableTopBar
                            onHandleSearch={onHandleSearch}
                            loading={isFetching}
                            query={query}
                        />
                    </Group>
                )
            )}
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    columns={columns}
                    page={page}
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
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default CandidatesTable;
