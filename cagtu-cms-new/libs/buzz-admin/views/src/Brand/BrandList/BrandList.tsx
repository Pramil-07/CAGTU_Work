import { API, urls } from '@cagtu-cms/data-access';
import { Breadcrumb, Button, ErrorAlert, FileDropzone, FormModal, InputField, PaperBox, ProfileImageField } from '@cagtu-cms/ui-shared';
import { BrandFormValueProps, BrandResult, brandSchema, getDeleteUrl, getPageLimit, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { Box, Group, Title, useMantineTheme, Text } from '@mantine/core';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BrandListTable from './BrandListTable';
import { showNotification } from '@mantine/notifications';
import { Form, Formik, FormikHelpers } from 'formik';
import { IconCheck, IconX } from '@tabler/icons';

const initialFormData: BrandFormValueProps = {
    id: null,
    name: '',
    image: [],
    banner: [],
    profilePreviewUrl: [],
    bannerPreviewUrl: [],
};

const BrandList = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();

    const queryClient = useQueryClient();
    const [checked, setChecked] = useState<string[]>([]);
    const [formModal, setFormModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [page, setPage] = useState(1);

    const formData = new FormData();

    const [brandFormData, setBrandFormData] = useState<BrandFormValueProps>({
        ...initialFormData,
    });

    const brandsAPI = new API(urls?.buzz?.cms?.brand?.path);
    const brandsMultipleDeleteAPI = new API(urls?.buzz?.cms?.brand?.multipleDelete);
    const brandAPI = new API(urls?.buzz?.cms?.brand?.path);

    const { isLoading, isError, isSuccess, data } = useQuery(['brands', page, limitChange], () => brandsAPI.list({ page, page_size: limitChange }));
    const brandMutation = useMutation((data: FormData) => brandAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const brandsMultipleDeleteMutation = useMutation(
        (checkedIds: string[]) => brandsMultipleDeleteAPI.multipleDeleteWithUrl(getDeleteUrl(checkedIds, urls?.buzz?.cms?.brand?.multipleDelete)),
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
                        title: 'Congrats! Brands Deleted',
                        message: data.data?.message,
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['brands', pageToSet, limitChange]);
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

    const brandsDeleteMutation = useMutation((id: number) => brandsAPI.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX />,
                });
            } else {
                setDeleteModal(false);
                setRowId(null);
                showNotification({
                    title: 'Congrats! Brands Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['brands', pageToSet, limitChange]);
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
                icon: <IconX />,
            });
        },
    });

    const onCreateBrand = (data: FormData, actions: FormikHelpers<BrandFormValueProps>, values: BrandFormValueProps) => {
        brandMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX />,
                    });
                } else {
                    delete values.bannerPreviewUrl;
                    delete values.profilePreviewUrl;
                    setBrandFormData({ ...initialFormData });
                    actions.resetForm();
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Brand ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Brand updated successfully' : data.data.message ?? 'Brand created successfully',
                        color: 'green',
                        icon: <IconCheck />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['brands', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
                showNotification({
                    title: 'Uh oh! Something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['brands', page, limitChange], () => brandsAPI.list({ search: query, page, page_size: limitChange }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((brand: BrandResult) => String(brand.id));
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
        const checkedRowId = data?.data?.result.map((brand: BrandResult) => String(brand.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));

        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!brandsDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!brandsMultipleDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!brandMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setBrandFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: BrandResult) => {
        setBrandFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: BrandFormValueProps) => {
        formData.append('name', values.name);
        if (values.image[0]?.name) {
            values.image.forEach((file) => formData.append('image', file));
        }
        if (values.banner[0]?.name) {
            values.banner.forEach((file) => formData.append('banner', file));
        }
    };

    const mapToViewModal = (value: BrandResult) => {
        return {
            id: value.id,
            name: value.name,
            image: value.image,
            banner: [value.image],
            profilePreviewUrl: [{ src: value.image }],
            bannerPreviewUrl: [{ src: value.banner }],
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <Group position="apart" mb={30}>
                <Box>
                    <Title order={4} sx={{ fontWeight: 600, color: dark ? theme.colors.gray[2] : theme.colors.dark[9] }}>
                        Brands
                    </Title>
                    <Breadcrumb currentTitle="Brands" />
                </Box>
                <Button name="Create" onClick={handleFormModal} />
            </Group>
            <PaperBox>
                <BrandListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={brandsDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={brandsMultipleDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => brandsDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => brandsMultipleDeleteMutation.mutate(checked)}
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
                initialValues={brandFormData}
                validationSchema={brandSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateBrand(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, setFieldValue, values, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            handleReset();
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Brand' : 'Add brand'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={brandMutation.isLoading}>
                        <Form>
                            <ProfileImageField
                                labelName="Brand Logo"
                                name="image"
                                profileImageData={values.profilePreviewUrl}
                                error={errors.image as string}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                withAsterisk
                            />
                            <InputField name="name" error={errors.name} touch={touched.name} labelName="Brand Name" withAsterisk />
                            <Text
                                size="sm"
                                component="label"
                                weight={500}
                                mb={4}
                                color={dark ? theme.colors.dark[0] : theme.colors.gray[9]}
                                sx={{ display: 'inline-block' }}>
                                Banner Image{' '}
                                <Text component="span" color="red">
                                    *
                                </Text>
                            </Text>
                            <FileDropzone
                                name="banner"
                                error={errors.banner as string}
                                touch={touched.banner as boolean}
                                accept={['image/png', 'image/jpeg', 'image/jpg']}
                                imagePreview="bannerPreviewUrl"
                                maxSize={1024 * 1024}
                                multiple={false}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default BrandList;
