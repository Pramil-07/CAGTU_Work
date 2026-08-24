import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CandidatesSchema, CipherUserContext, DataTableProps, getFileName, TableColumnsProps } from '@cagtu-cms/util-formatter';
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
    checked,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    isMultiDeleteModalOpened,
    isMultiDeleteMutationLoading,
    isAllCheckboxSelected,
    isCheckboxSelect,
    handleSelect,
    onClickDeleteAll,
    onSelectAll,
    onConfirmMultiDelete,
    handleMultiDeleteCloseModal,
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
        },
        {
            path: 'apply_for',
            label: 'Apply For',
            content: (object: CandidatesSchema) =>
                `${object?.vacancy?.title ?? ''} ${object?.vacancy?.designation ? '(' + object?.vacancy?.designation + ')' : ''}`,
            style: {
                width: 350,
            },
        },
        {
            path: 'cv',
            label: 'Resume/CV',
            content: (object: CandidatesSchema) => (
                <Text
                    component="a"
                    href={object?.cv}
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
                            {getFileName(object?.cv)}
                        </Text>
                    </Group>
                </Text>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: CandidatesSchema) => (
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
                width: 80,
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
                            checked={checked}
                            deleteModal={onClickDeleteAll}
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_candidate')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default CandidatesTable;
