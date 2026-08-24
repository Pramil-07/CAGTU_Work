import { API, urls } from '@cagtu-cms/data-access';
import { Breadcrumb, CreatableInputField, FormModal, InputField, PaperBox } from '@cagtu-cms/ui-shared';
import { AttributesResult, CategoryResult, getDeleteUrl, SubCategoriesFormValueProps, subCategorySchema, useDark } from '@cagtu-cms/util-formatter';
import { Alert, Box, Button, Group, Title, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ServiceCategoriesListTable from './ServiceCategoriesListTable';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons';

const categoryAPI = new API(urls?.buzz?.cms?.serviceCategory?.path);

const ServicesCategoriesList = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();

    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState('');
    const [page, setPage] = useState(1);

    const [productAttrOptions, setProductAttrOptions] = useState([]);
    const [stockAttrOptions, setStockAttrOptions] = useState([]);

    const [categoryFormData, setCategoryFormData] = useState<SubCategoriesFormValueProps>({
        id: null,
        name: '',
        parent: null,
        product_attribute: [],
        stock_attribute: [],
    });

    const categoryMultipleDeleteAPI = new API(urls?.buzz?.cms?.serviceCategory?.multipleDelete);
    const createCategoryAPI = new API(!rowId ? urls?.buzz?.cms?.serviceCategory?.create : urls?.buzz?.cms?.serviceCategory?.path);
    const productAttrAPI = new API(urls?.buzz?.cms?.attributes?.product?.select);
    const stockAttrAPI = new API(urls?.buzz?.cms?.attributes?.stock?.select);

    const { isLoading, isError, isSuccess, data } = useQuery(['service-categories', page], () => categoryAPI.list({ page }));
    const categoryMutation = useMutation((data: CategoryResult) => createCategoryAPI.store(data, Number(rowId)));

    useQuery(['product-attributes-select'], () => productAttrAPI.list(), {
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

    useQuery(['stock-attributes-select'], () => stockAttrAPI.list(), {
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
                        title: 'Congrats! Service Category Deleted',
                        message: data.data?.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['service-categories', pageToSet]);
                    else setPage(pageToSet);
                }
            },
            onError: () => {
                setMultiDeleteModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        }
    );

    const categoryDeleteMutation = useMutation((id: number) => categoryAPI.delete(id), {
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
                    title: 'Congrats! Category Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['service-categories', pageToSet]);
                else setPage(pageToSet);
            }
        },
        onError: () => {
            setDeleteModal(false);
            setRowId('');
            showNotification({
                title: 'Uh oh! something went wrong',
                message: 'Sorry! There was a problem with your request.',
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
                        title: 'Congrats! Service Category Created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['service-categories', pageToSet]);
                    else setPage(pageToSet);
                }
            },
            onError: () => {
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['service-categories', page], () => categoryAPI.list({ search: query }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((category: CategoryResult) => String(category.id));
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
        const checkedRowId = data?.data?.result.map((category: CategoryResult) => String(category.id));
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
                product_attribute: [],
                stock_attribute: [],
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
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
                        Service Categories
                    </Title>
                    <Breadcrumb currentTitle="Services Categories" />
                </Box>
                <Button onClick={handleFormModal} px={15} sx={{ height: 38, fontWeight: 500, minWidth: 120 }}>
                    Add Category
                </Button>
            </Group>
            <PaperBox>
                <ServiceCategoriesListTable
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
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={categoryFormData}
                validationSchema={subCategorySchema}
                onSubmit={(values, actions) => {
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
                            <InputField name="name" error={errors.name} touch={touched.name} labelName="Category Name" />
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
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default ServicesCategoriesList;
