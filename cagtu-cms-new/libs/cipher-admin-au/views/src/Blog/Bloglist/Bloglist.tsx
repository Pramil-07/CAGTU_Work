import { API, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { BlogResult, CipherUserContext, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import BlogListTable from './BlogLIstTable';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.blog;

const BlogList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const navigate = useNavigate();
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const blogListAPI = new API(urlsPath?.list);
    const blogSingleDelete = new API(urlsPath?.singleDelete);
    const blogMultiDelete = new API(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['blog', page, limitChange], () =>
        blogListAPI.list({ search: query, page, page_size: limitChange })
    );

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const blogMultiDeleteMutation = useMutation((checkedIds: string[]) => blogMultiDelete.store({ pk: checkedIds }), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setMultiDeleteModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setMultiDeleteModal(false);
                setChecked([]);
                showNotification({
                    title: 'Congrats! Blog Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['blog', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: () => {
            setMultiDeleteModal(false);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const blogDeleteMutation = useMutation((id: number) => blogSingleDelete.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Congrats! Blog Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['blog', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: () => {
            setDeleteModal(false);
            setRowId(null);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['blog', page, limitChange], () => blogListAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((blog: BlogResult) => String(blog.id));
            setChecked(checkedRowId);
        }
    };

    const isCheckboxSelect = (id: number) => checked.includes(String(id));

    const handleSelect = (id: number) => {
        const isChecked = isCheckboxSelect(id);
        if (isChecked) {
            const filterCheckedList = checked.filter((val) => val !== String(id));
            setChecked(filterCheckedList);
        } else {
            setChecked((prevValue) => [...prevValue, String(id)]);
        }
    };

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.result.map((blog: BlogResult) => String(blog.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!blogDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!blogMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_blog')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Blog">
                {(is_superuser || user_permissions?.includes('add_blog')) && <Button onClick={() => navigate('/cms/blog/create')} name="Create" />}
            </PageHeader>
            <PaperBox>
                <BlogListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={blogDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={blogMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => blogDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => blogMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
        </>
    );
};

export default BlogList;
