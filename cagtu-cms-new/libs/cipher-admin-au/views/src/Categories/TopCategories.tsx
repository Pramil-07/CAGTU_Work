import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import {
    TopCategoryFormValuesProps,
    TopCategoriesResult,
    useDataLimit,
    topCategoriesSchema,
    CipherUserContext,
    getPageLimit,
} from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import TopCategoriesTable from './TopCategoriesListTable';
import { Input, Stack } from '@mantine/core';
import CategorySelectMenu from '../Service/ServiceList/CategorySelectMenu';
import BlockedPageMessage from '../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.topCategories;
const urlsCatPath = urls?.cipher?.category;

const initialFormData: TopCategoryFormValuesProps = {
    category: '',
    priority : 2
};

const TopCategories = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [topCategoriesFormData, setTopCategoriesFormData] = useState<TopCategoryFormValuesProps>({
        ...initialFormData,
    });

    const topCategoriesAPI = new CipherAPI(urlsPath?.path);
    const categoryNestedSelectOptionsAPI = new CipherAPI(urlsCatPath?.list);
    const topCategoriesMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isFetching, isError, isSuccess, data } = useQuery(['top-categories', page, limitChange], () =>
        topCategoriesAPI.list({ search: query, page, page_size: limitChange, ordering: 'priority' })
    );

    const topCategoriesMutation = useMutation((data: TopCategoryFormValuesProps) => topCategoriesAPI.store(data));

    // Fetch the nested category list from the API for filter
    const { data: nestedCategoryList } = useQuery(['nested-category-options'], () => categoryNestedSelectOptionsAPI.list({ page: '-1' }));

    const pageToFecth = data?.data?.result?.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result?.length <= checked.length ? page - 1 : page;

    const topCategoriesMultiDeleteMutation = useMutation((checkedIds: string[]) => topCategoriesMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Top Categories Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['top-categories', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setMultiDeleteModal(false);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const topCategoriesDeleteMutation = useMutation((id: number) => topCategoriesAPI.delete(id), {
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
                    title: 'Congrats! Top Category Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['top-categories', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setDeleteModal(false);
            setRowId(null);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onCreateTopCategories = (data: TopCategoryFormValuesProps, actions: FormikHelpers<TopCategoryFormValuesProps>) => {
        topCategoriesMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    actions.resetForm();
                    setFormModal(false);
                    showNotification({
                        title: `Congrats! Top Categories Created`,
                        message: data.data.message ?? 'Top categories created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['top-categories', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { category, message },
                } = error.response;
                actions.setFieldError('category', category && category[0]);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['top-categories', page, limitChange], () => topCategoriesAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result?.map((topCategory: TopCategoriesResult) => String(topCategory.id));
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
        const checkedRowId = data?.data?.result?.map((topCategory: TopCategoriesResult) => String(topCategory.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!topCategoriesDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!topCategoriesMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!topCategoriesMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setTopCategoriesFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_topcategory')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Top Categories">
                {(is_superuser || user_permissions?.includes('add_topcategory')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <TopCategoriesTable
                    data={data?.data?.result}
                    page={page}
                    isFetching={isFetching}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={topCategoriesDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={topCategoriesMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => topCategoriesDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => topCategoriesMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={topCategoriesFormData}
                validationSchema={topCategoriesSchema}
                onSubmit={(values, actions) => {
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                    };
                    onCreateTopCategories(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!topCategoriesMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={'Add Top Category'}
                        onConfirm={handleSubmit}
                        confirmButtonText={'Add'}
                        loading={topCategoriesMutation.isLoading}>
                        <Form>
                            <Stack spacing={0} my={40}>
                                <Input.Wrapper label={'Category | Sub category'} required>
                                    <CategorySelectMenu
                                        data={nestedCategoryList?.data}
                                        setFieldValue={setFieldValue}
                                        error={errors.category}
                                        touch={touched.category}
                                    />
                                </Input.Wrapper>
                            </Stack>
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default TopCategories;
