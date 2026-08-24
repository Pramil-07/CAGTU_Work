import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, VacancySchema } from '@cagtu-cms/util-formatter';
import { ActionIcon, Badge, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface CareerListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const CareerListTable = ({
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isMultiDeleteModalOpened,
    isSingleDeleteMutationLoading,
    isMultiDeleteMutationLoading,
    isAllCheckboxSelected,
    isCheckboxSelect,
    handleSelect,
    handleSingleDelete,
    onSelectAll,
    onSetPage,
    onClickDeleteAll,
    onConfirmSingleDelete,
    onConfirmMultiDelete,
    handleSingleDeleteCloseModal,
    handleMultiDeleteCloseModal,
    onHandleSearch,
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
        },
        {
            path: 'designation',
            label: 'Designation',
            style: {
                width: 300,
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
            path: 'candidates',
            label: 'Candidates',
            content: (object: VacancySchema) => (
                <Badge size="lg" sx={{ fontWeight: 600, fontSize: 12 }}>
                    {object?.candidates}
                </Badge>
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'deadline',
            label: 'Deadline',
            style: {
                width: 120,
            },
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: VacancySchema) => (
                <Badge
                    size="lg"
                    color={`${object?.status ? 'green' : 'red'}`}
                    radius="xs"
                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.status ? 'Active' : 'Inactive'}
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
                                onClick={() => navigate(`/cms/career/${object.id}/edit`)}>
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
                width: 80,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar
                        checked={checked}
                        deleteModal={onClickDeleteAll}
                        onHandleSearch={onHandleSearch}
                        loading={isFetching}
                        query={query}
                    />
                    {data?.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            total={total}
                            isDeleteModalOpened={isDeleteModalOpened}
                            isMultiDeleteModalOpened={isMultiDeleteModalOpened}
                            isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                            isMultiDeleteMutationLoading={isMultiDeleteMutationLoading}
                            isAllCheckboxSelected={isAllCheckboxSelected}
                            isCheckboxSelect={isCheckboxSelect}
                            handleSelect={handleSelect}
                            onSelectAll={onSelectAll}
                            onSetPage={onSetPage}
                            onClickDeleteAll={onClickDeleteAll}
                            onConfirmSingleDelete={onConfirmSingleDelete}
                            onConfirmMultiDelete={onConfirmMultiDelete}
                            handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                            handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                            limitChange={limitChange}
                            handleLimitChange={handleLimitChange}
                            isCheckbox={is_superuser || user_permissions?.includes('delete_vacancy')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default CareerListTable;
