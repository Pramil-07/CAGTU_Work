import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { BlogResult, CipherUserContext, DataTableProps, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Badge, Group, Tooltip, useMantineTheme, Text } from '@mantine/core';
import { IconEdit, IconEye, IconHeart, IconTrash } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface BlogListTableProps extends DataTableProps {
    checked: string[];
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    isFetching: boolean;
    query: string;
}

const BlogListTable = ({
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
}: BlogListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const navigate = useNavigate();
    // const theme = useMantineTheme();

    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Title',
            content: (object: BlogResult) => <Text sx={{ maxWidth: '80%' }}>{object?.title}</Text>,
        },
        {
            path: 'author',
            label: 'Author',
            content: (object: BlogResult) => _.upperFirst(object?.author),
            style: {
                width: 200,
            },
        },
        //Commented for now as it was not implemented in backend yet
        // {
        //     path: 'blog_type',
        //     label: 'Type',
        //     style: {
        //         width: 120,
        //     },
        // },
        // {
        //     path: 'views',
        //     label: 'Views',
        //     content: (object: BlogResult) => (
        //         <Group spacing={5}>
        //             <IconEye size={18} color={`${theme.colors['teal'][6]}`} stroke={1.75} />
        //             <Text component="span">{object.views}</Text>
        //         </Group>
        //     ),
        //     style: {
        //         width: 80,
        //     },
        // },
        // {
        //     path: 'likes',
        //     label: 'Likes',
        //     content: (object: BlogResult) => (
        //         <Group spacing={5}>
        //             <IconHeart size={18} color={`${theme.colors['red'][6]}`} stroke={1.75} />
        //             <Text component="span">{object.likes}</Text>
        //         </Group>
        //     ),
        //     style: {
        //         width: 80,
        //     },
        // },
        {
            path: 'created_at',
            label: 'Publsihed On',
            content: (object: BlogResult) => <span>{object?.created_at.split(' ')[0]}</span>,
            style: {
                width: 150,
            },
        },
        {
            path: 'published_status',
            label: 'Status',
            content: (object: BlogResult) => (
                <Badge
                    color={`${object.published_status === 'Unpublished' ? 'red' : 'blue'}`}
                    radius="xs"
                    size="lg"
                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object.published_status}
                </Badge>
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: BlogResult) => (
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
                                onClick={() => navigate(`/cms/blog/${object.id}/edit`)}>
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
                    {data.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            checked={checked}
                            isLoading={isLoading}
                            isSuccess={isSuccess}
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
                            isCheckbox={is_superuser || user_permissions?.includes('delete_blog')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default BlogListTable;
