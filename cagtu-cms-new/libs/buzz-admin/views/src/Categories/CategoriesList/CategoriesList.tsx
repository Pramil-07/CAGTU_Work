import { API, urls } from '@cagtu-cms/data-access';
import { Breadcrumb, FormModal, InputField, PaperBox, TextAreaField } from '@cagtu-cms/ui-shared';
import { useThemeIconStyles } from '@cagtu-cms/ui-styles';
import { CategoryResult, categorySchema, getDeleteUrl, getPageLimit, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { Alert, Box, Button, Group, ThemeIcon, Title, useMantineTheme } from '@mantine/core';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CategoriesListTable from './CategoriesListTable';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons';

const CategoriesList = () => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const { classes } = useThemeIconStyles();

    const [categoryFormData, setCategoryFormData] = useState<CategoryResult>({
        id: '',
        icon: '',
        name: '',
    });
    const categoryAPI = new API(urls?.buzz?.cms?.category?.gParent);
    const categoryDeleteAPI = new API(urls?.buzz?.cms?.category?.path);
    const categoryMultipleDeleteAPI = new API(urls?.buzz?.cms?.category?.multipleDelete);

    const { isLoading, isError, isSuccess, data } = useQuery(['categories', page], () => categoryAPI.list({ page }));
    const categoryMutation = useMutation((data: CategoryResult) => categoryAPI.store(data, Number(rowId)));

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
                        title: 'Congrats! Category Deleted',
                        message: data.data?.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet]);
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
                    title: 'Congrats! Category Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet]);
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
                        title: 'Congrats! Category Created',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet]);
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
                    icon: <IconX />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['categories', page], () => categoryAPI.list({ search: query }));
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
                id: '',
                name: '',
                icon: '',
            });
        }
    };

    const handleFormModal = () => {
        setRowId('');
        setFormModal(true);
        setCategoryFormData({
            id: '',
            icon: '',
            name: '',
        });
    };

    const handleFormModalEdit = (object: CategoryResult) => {
        setCategoryFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(String(object?.id));
    };

    const mapToViewModal = (value: CategoryResult) => {
        return {
            id: value.id,
            icon: value.icon,
            name: value.name,
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
                        Categories
                    </Title>
                    <Breadcrumb currentTitle="Categories" />
                </Box>
                <Button onClick={handleFormModal} px={15} sx={{ height: 38, fontWeight: 500, minWidth: 120 }}>
                    Add Category
                </Button>
            </Group>
            <PaperBox>
                <CategoriesListTable
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
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={categoryFormData}
                validationSchema={categorySchema}
                onSubmit={(values, actions) => {
                    onCreateCategory(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values }) => (
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
                            <TextAreaField
                                name="icon"
                                error={errors.icon}
                                touch={touched.icon}
                                labelName="Category Icon"
                                autoComplete="off"
                                placeHolder="We only support SVG code"
                                withAsterisk
                            />
                            {values.icon && (
                                <ThemeIcon variant="light" size={'xl'} color="gray">
                                    <div className={classes.ct_theme_icon} dangerouslySetInnerHTML={{ __html: values.icon }} />
                                </ThemeIcon>
                            )}
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default CategoriesList;
