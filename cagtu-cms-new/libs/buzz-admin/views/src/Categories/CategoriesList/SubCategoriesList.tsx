import { API, urls } from '@cagtu-cms/data-access';
import { Breadcrumb, CreatableInputField, FormModal, InputField, PaperBox } from '@cagtu-cms/ui-shared';
import {
    AttributesResult,
    BreadcrumbItems,
    getDeleteUrl,
    getPageLimit,
    SubCategoriesFormValueProps,
    SubCategoryResult,
    subCategorySchema,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { Alert, Box, Button, Group, Title, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import SubCategoriesListTable from './SubCategoriesListTable';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons';

const SubCategoriesList = () => {
    const theme = useMantineTheme();
    const [dark] = useDark();
    const { categoryId } = useParams();

    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [productAttrOptions, setProductAttrOptions] = useState([]);
    const [stockAttrOptions, setStockAttrOptions] = useState([]);

    const [categoryFormData, setCategoryFormData] = useState<SubCategoriesFormValueProps>({
        id: null,
        name: '',
        parent: null,
        product_attribute: [],
        stock_attribute: [],
    });

    const categoryAPI = new API(urls?.buzz?.cms?.category?.childList);
    const categoryDeleteAPI = new API(urls?.buzz?.cms?.category?.path);
    const categoryMultipleDeleteAPI = new API(urls?.buzz?.cms?.category?.multipleDelete);
    const createCategoryAPI = new API(urls?.buzz?.cms?.category?.parent);
    const productAttrAPI = new API(urls?.buzz?.cms?.attributes?.product?.select);
    const stockAttrAPI = new API(urls?.buzz?.cms?.attributes?.stock?.select);

    const { isLoading, isError, isSuccess, data } = useQuery(['sub-categories', page], () => categoryAPI.listWithId(Number(categoryId), { page }));
    const categoryMutation = useMutation((data: SubCategoryResult) => createCategoryAPI.store(data, Number(rowId)));

    const {
        isLoading: proAttrLoading,
        isError: proAttrIsError,
        isSuccess: proAttrSuccess,
    } = useQuery(['product-attributes-select'], () => productAttrAPI.list(), {
        onSuccess: ({ data }) => {
            const options = data.map((val: AttributesResult) => {
                return {
                    value: val?.id,
                    label: val?.name,
                };
            });
            setProductAttrOptions(options);
        },
    });

    const {
        isLoading: stockAttrLoading,
        isError: stockAttrIsError,
        isSuccess: stockAttrSuccess,
    } = useQuery(['stock-attributes-select'], () => stockAttrAPI.list(), {
        onSuccess: ({ data }) => {
            const options = data.map((val: AttributesResult) => {
                return {
                    value: val?.id,
                    label: val?.name,
                };
            });
            setStockAttrOptions(options);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const categoryMultipleDeleteMutation = useMutation(
        (checkedIds: string[]) =>
            categoryMultipleDeleteAPI.multipleDeleteWithUrl(getDeleteUrl(checkedIds, urls?.buzz?.cms?.category?.multipleDelete)),
        {
            onSuccess: (data) => {
                if (data.data?.status === 'failure') {
                    setMultiDeleteModal(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data?.message,
                        color: 'red',
                        icon: <IconX />,
                    });
                } else {
                    setMultiDeleteModal(false);
                    setChecked([]);
                    showNotification({
                        title: 'Congrats! Sub Category Deleted',
                        message: data.data?.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['sub-categories', pageToSet]);
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
                    icon: <IconX />,
                });
            },
        }
    );

    const categoryDeleteMutation = useMutation((id: number) => categoryDeleteAPI.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX />,
                });
            } else {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Congrats! Sub Category Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['sub-categories', pageToSet]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setDeleteModal(false);
            setRowId('');
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX />,
            });
        },
    });

    const onCreateCategory = (data: any, actions: any) => {
        categoryMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX />,
                    });
                } else {
                    actions.resetForm();
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: 'Congrats! Sub Category Created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['sub-categories', pageToSet]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { name },
                } = error.response;

                actions.setFieldError('name', name && name[0]);

                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX/>,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['sub-categories', page], () => categoryAPI.list({ keyword: query }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((category: SubCategoryResult) => String(category.id));
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
        const checkedRowId = data?.data?.result.map((category: SubCategoryResult) => String(category.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));

        return isAllSelected;
    };

    const handleSingleDelete = (id: string) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!categoryDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!categoryMultipleDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!categoryMutation.isLoading) {
            setFormModal(false);
            setRowId('');
            setCategoryFormData({
                id: null,
                name: '',
                parent: null,
                product_attribute: [],
                stock_attribute: [],
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
        setCategoryFormData({
            id: null,
            name: '',
            product_attribute: [],
            stock_attribute: [],
        });
    };

    const handleFormModalEdit = (object: SubCategoriesFormValueProps) => {
        setCategoryFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(String(object?.id));
    };

    const mapToViewModal = (value: SubCategoriesFormValueProps) => {
        const proAttroptions = value.product_attribute && value.product_attribute.map((val: any) => val?.id);
        const stockAttroptions = value.stock_attribute && value.stock_attribute.map((val: any) => val?.id);

        return {
            id: value.id,
            name: value.name,
            product_attribute: proAttroptions,
            stock_attribute: stockAttroptions,
        };
    };

    const categoryData = data?.data;

    const breadCrumbItems: BreadcrumbItems[] = [{ name: 'Categories', href: '/categories' }];

    if (isError) {
        return (
            <Alert icon={<IconAlertCircle size={22} />} title="Bummer!" color="red">
                Something terrible happened!
            </Alert>
        );
    }

    return (
        <>
            <Group position="apart" mb={30}>
                <Box>
                    <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors.gray[2] : theme.colors.dark[9] }}>
                        Categories
                    </Title>
                    <Breadcrumb currentTitle={categoryData?.parent?.name} items={breadCrumbItems} />
                </Box>
                <Button onClick={handleFormModal} px={15} sx={{ height: 38, fontWeight: 500, minWidth: 120 }}>
                    Add Category
                </Button>
            </Group>
            <PaperBox>
                <SubCategoriesListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={categoryDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={categoryMultipleDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => categoryDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => categoryMultipleDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    categoryParentId={Number(categoryId)}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={categoryFormData}
                validationSchema={subCategorySchema}
                onSubmit={(values, actions) => {
                    values.parent = Number(categoryId);
                    onCreateCategory(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, setFieldValue, values }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            handleReset();
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Category' : 'Add Category'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={categoryMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Category Name"
                                placeHolder="Enter the category name"
                                withAsterisk
                            />
                            <CreatableInputField
                                name="product_attribute"
                                options={productAttrOptions}
                                labelName="Product Attributes"
                                placeHolder="Select"
                                error={errors.product_attribute}
                                touch={touched.product_attribute}
                                value={values.product_attribute}
                                onChange={(value) => setFieldValue('product_attribute', value)}
                                nothingFound="No result"
                                withAsterisk
                            />
                            <CreatableInputField
                                name="stock_attribute"
                                options={stockAttrOptions}
                                labelName="Stock Attributes"
                                placeHolder="Select"
                                error={errors.stock_attribute}
                                touch={touched.stock_attribute}
                                value={values.stock_attribute}
                                onChange={(value) => setFieldValue('stock_attribute', value)}
                                nothingFound="No result"
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default SubCategoriesList;
