import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, VacancySchema } from '@cagtu-cms/util-formatter';
import { ActionIcon, Badge, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface CareerListTableProps extends DataTableProps {
    handleDetailModalOpen: (data: VacancySchema) => void;
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    isFetching: boolean;
    query: string;
}

const CareerListTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    onSetPage,
    onClickDeleteAll,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
    onHandleSearch,
    handleDetailModalOpen,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: CareerListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const navigate = useNavigate();

    const columns = [
        {
            path: 'title',
            label: 'Title',
            style: {
                width: 250,
            },
        },
        {
            path: 'category',
            label: 'Department/Category',
            style: {
                width: 180,
            },
        },
        {
            path: 'designation',
            label: 'Designation/Position',
            style: {
                width: 180,
            },
        },
        {
            path: 'experience',
            label: 'Experience(In years)',
            style: {
                width: 180,
            },
        },
        {
            path: 'no_of_opening',
            label: 'No. of Openings',
            content: (object: VacancySchema) => (
                <Badge size="lg" sx={{ fontWeight: 600, fontSize: 12 }}>
                    {object?.no_of_opening}
                </Badge>
            ),
            style: {
                width: 150,
            },
        },
        {
            path: 'job_type',
            label: 'Job Type',
            style: {
                width: 180,
            },
        },
        {
            path: 'salary_range',
            label: 'Salary Range',
            style: {
                width: 180,
            },
        },
        // {
        //     path: 'skills',
        //     label: 'Skills',
        //     content: (object: VacancySchema) => {
        //         return JSON.parse(object?.skills).map((skill: string) => (
        //             <Badge size="lg" sx={{ fontWeight: 600, fontSize: 12 }} m={2}>
        //                 {skill}
        //             </Badge>
        //         ));
        //     },

        //     style: {
        //         width: 300,
        //     },
        // },
        {
            path: 'deadline',
            label: 'Deadline',
            style: {
                width: 120,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: VacancySchema) => (
                <Badge
                    size="lg"
                    color={`${object?.is_active ? 'green' : 'red'}`}
                    radius="xs"
                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: any) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_vacancy')) && (
                        <Tooltip label="View detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleDetailModalOpen(object)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('change_vacancy')) && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                sx={{
                                    cursor: 'pointer',
                                }}
                                onClick={() => navigate(`/careers/${object.id}/edit`)}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('delete_vacancy')) && (
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
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar deleteModal={onClickDeleteAll} onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    {data?.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            total={total}
                            isDeleteModalOpened={isDeleteModalOpened}
                            isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                            onSetPage={onSetPage}
                            onClickDeleteAll={onClickDeleteAll}
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

export default CareerListTable;
