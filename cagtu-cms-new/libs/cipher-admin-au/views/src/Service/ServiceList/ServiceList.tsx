import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    ErrorAlert,
    FormModal,
    InputField,
    MultiFileDropzone,
    PageHeader,
    PaperBox,
    SelectField,
    SuccessModal,
    SwitchCheckbox,
    TextAreaField,
    TextEditor,
} from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    getPageLimit,
    serviceSchema,
    ServicesFormValuesProps,
    ServicesResult,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { Box, Code, Loader, useMantineTheme, CloseButton, Grid, Divider, Group, Text, Stack, Input } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCategory, IconCheck, IconChevronRight, IconSelector, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import * as _ from 'lodash';
import { forwardRef, useContext, useEffect, useState } from 'react';
import ServiceListTable from './ServiceListTable';
import CategorySelectMenu from './CategorySelectMenu';
import { useLocation } from 'react-router-dom';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.services;
const urlsCatPath = urls?.cipher?.category;
const urlsFileStorePath = urls?.cipher?.task?.filestore;

const filterFormInitialData: { category: string } = {
    category: '',
};

const initialFormData: ServicesFormValuesProps = {
    id: '',
    title: '',
    description: '',
    category: '',
    meta_title: '',
    meta_description: '',
    meta_keyword: '',
    is_active: false,
    videos: [],
    videosPreviewUrl: [],
    images: [],
    imagePreviewUrl: [],
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    label?: string;
    child?: any;
    isNested?: boolean;
}

const ServiceList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [ordering, setOrdering] = useState<string>('title');
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>();
    const [page, setPage] = useState(1);
    const [isServiceSubmitting, setIsServiceSubmitting] = useState<boolean>(false);
    const [searchCategory, setSearchCategory] = useState<string>(''); // Read the value from category select field after values enter i.e; more than 3 letter
    const [searchNestedCategory, setSearchNestedCategory] = useState<string>('');
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [nestedCategoryOptions, setNestedCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [selectedSubChildCategory, setSelectedSubChildCategory] = useState<string>('');
    const [subCategoryOptions, setSubCategoryOptions] = useState<{ value: string; label: string; category: string; child: any }[]>([]);
    const [childSubCategoryOptions, setChildSubCategoryOptions] = useState<{ value: string; label: string; category: string; child: any }[]>([]);
    const [successModal, setSuccessModal] = useState(false);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [serviceFormData, setServiceFormData] = useState<ServicesFormValuesProps>({
        ...initialFormData,
    });

    const [serviceFilterFormData, setServiceFilterFormData] = useState<{ category: string }>({
        ...filterFormInitialData,
    });

    const { state } = useLocation();
    const queryCategory = state?.queryCategory ?? '';
    const queryNestedCategory = state?.queryNestedCategory ?? [];

    //logic for fetching services when directed from category
    useEffect(() => {
        setServiceFilterFormData((prevVal): { category: string } => {
            return {
                ...prevVal,
                category: queryCategory?.slug as string,
            };
        });
        if (queryCategory?.level === 0) {
            setSelectedCategory(queryCategory?.slug);
            const mappedSubCategory = queryNestedCategory[0].child.map((val: { name: string; slug: string; child: any }) => {
                return {
                    label: val.name,
                    value: val?.slug ?? val.name,
                    category: queryCategory?.slug,
                    child: val?.child ?? [],
                    isNested: val?.child?.length > 0 ? true : false,
                };
            });
            setSubCategoryOptions(mappedSubCategory ?? []);
        }
        if (queryCategory?.level === 1) {
            setSelectedCategory(queryNestedCategory[0]?.slug);
            setSelectedSubCategory(queryCategory?.slug);

            const mappedSubCategory = queryNestedCategory[0]?.child?.map((val: { name: string; slug: string; child: any }) => {
                return {
                    label: val.name,
                    value: val?.slug ?? val.name,
                    category: queryNestedCategory[0]?.slug,
                    child: val?.child ?? [],
                    isNested: val?.child?.length > 0 ? true : false,
                };
            });
            setSubCategoryOptions(mappedSubCategory ?? []);

            const mappedChildSubCategory = queryCategory?.child?.map((val: { name: string; slug: string; child: any }) => {
                return {
                    label: val.name,
                    value: val?.slug ?? val.name,
                    category: queryCategory?.slug,
                    child: val?.child ?? [],
                };
            });
            setChildSubCategoryOptions(mappedChildSubCategory ?? []);
        }
        if (queryCategory?.level === 2) {
            setSelectedCategory(queryNestedCategory[0]?.slug);
            const subCategory = queryNestedCategory[0]?.child?.filter((fVal: any) =>
                fVal?.child?.filter((f1Val: any) => f1Val.id === queryCategory.id)?.length > 0 ? true : false
            );
            setSelectedSubCategory(subCategory[0]?.slug);
            setSelectedSubChildCategory(queryCategory?.slug);
            const mappedSubCategory = queryNestedCategory[0].child.map((val: { name: string; slug: string; child: any }) => {
                return {
                    label: val.name,
                    value: val?.slug ?? val.name,
                    category: queryNestedCategory[0]?.slug,
                    child: val?.child ?? [],
                    isNested: val?.child?.length > 0 ? true : false,
                };
            });
            setSubCategoryOptions(mappedSubCategory ?? []);

            const mappedChildSubCategory = subCategory[0]?.child?.map((val: { name: string; slug: string; child: any }) => {
                return {
                    label: val.name,
                    value: val?.slug ?? val.name,
                    category: subCategory[0]?.slug,
                    child: val?.child ?? [],
                };
            });
            setChildSubCategoryOptions(mappedChildSubCategory ?? []);
        }
    }, [queryCategory?.slug]);

    const serviceAPI = new CipherAPI(urlsPath?.path);
    const categorySelectOptionsAPI = new CipherAPI(urlsCatPath?.selectOptions);
    const categoryNestedSelectOptionsAPI = new CipherAPI(urlsCatPath?.list);
    const fileStoreAPI = new CipherAPI(urlsFileStorePath);
    const serviceMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);
    const multiVerifyAPI = new CipherAPI(urlsPath?.verify);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(
        ['services', page, limitChange, query, serviceFilterFormData, queryCategory?.slug, ordering],
        () => serviceAPI.list({ page, page_size: limitChange, search: query, ...serviceFilterFormData, ordering: ordering })
    );

    // Fetch the categories and sub-categories list from the API as the per user keywords request for add and edit
    useQuery(['category-options'], () => categorySelectOptionsAPI.list({ search: searchCategory }), {
        enabled: !!searchCategory,
        onSuccess: (data) => {
            const categoryOptions = data?.data.map(({ name, id }: { id: number; name: string }) => {
                return {
                    value: id,
                    label: name,
                };
            });
            setCategoryOptions(categoryOptions);
        },
    });

    // Fetch the nested category list from the API for filter
    const { isFetching: isNestedCategoryFetching, data: nestedCategoryList } = useQuery(
        ['nested-category-options'],
        () => categoryNestedSelectOptionsAPI.list({ search: searchNestedCategory, page: '-1' }),
        {
            onSuccess: (data) => {
                const nestedOptions = data?.data?.map(({ name, slug, child }: { id: number; name: string; slug: string; child: any }) => {
                    return {
                        value: slug,
                        label: name,
                        child: child,
                        isNested: child?.length > 0 ? true : false,
                    };
                });
                setNestedCategoryOptions(nestedOptions);
            },
        }
    );

    const filestoreMutation = useMutation((data: FormData) => fileStoreAPI.store(data));
    const serviceMutation = useMutation((data: ServicesFormValuesProps) => serviceAPI.store(data, String(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const serviceMultiDeleteMutation = useMutation((checkedIds: string[]) => serviceMultiDeleteAPI.store({ id: checkedIds }), {
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
                    title: 'Congrats! Service Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['services', pageToSet, limitChange]);
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

    const serviceDeleteMutation = useMutation((id: string) => serviceAPI.delete(id), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Congrats! Service Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['services', pageToSet, limitChange]);
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
                icon: <IconX size={18} />,
            });
        },
    });

    const serviceMultiVerifyMutation = useMutation((checkedIds: string[]) => multiVerifyAPI.store({ services: checkedIds, is_verified: true }), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setSuccessModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setSuccessModal(false);
                setChecked([]);
                showNotification({
                    title: 'Congrats! Service Verified',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['services', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setSuccessModal(false);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onCreateThumbnail = (
        formData: FormData,
        formDataVideos: FormData,
        values: ServicesFormValuesProps,
        actions: FormikHelpers<ServicesFormValuesProps>
    ) => {
        if (values.images.some((val) => val?.path) && values.videos && !values.videos.some((val) => val?.path)) {
            filestoreMutation.mutate(formData, {
                onSuccess: (data) => {
                    const getImagesId = values?.images.filter((val) => !val.path).map((val) => val?.id);
                    const getVideosId = values?.videos && values?.videos.filter((val) => !val.path).map((val) => val?.id);
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        images: [...getImagesId, ...(data?.data?.data ?? [])],
                        videos: [...(getVideosId || [])],
                    };
                    delete dataToSend.imagePreviewUrl;
                    delete dataToSend.videosPreviewUrl;

                    onCreateService(dataToSend, actions);
                },
                onError: () => {
                    setIsServiceSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        } else if (!values.images.some((val) => val?.path) && values.videos && values.videos.some((val) => val?.path)) {
            filestoreMutation.mutate(formDataVideos, {
                onSuccess: (data) => {
                    const getImagesId = values?.images.filter((val) => !val.path).map((val) => val?.id);
                    const getVideosId = values?.videos && values?.videos.filter((val) => !val.path).map((val) => val?.id);
                    const dataToSend = {
                        ...JSON.parse(JSON.stringify(values)),
                        images: [...getImagesId],
                        videos: [...(getVideosId || []), ...(data?.data?.data ?? [])],
                    };
                    delete dataToSend.videosPreviewUrl;
                    delete dataToSend.imagePreviewUrl;

                    onCreateService(dataToSend, actions);
                },
                onError: () => {
                    setIsServiceSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        } else if (values.images.some((val) => val?.path) && values.videos && values.videos.some((val) => val?.path)) {
            filestoreMutation.mutate(formData, {
                onSuccess: ({ data: imagesData }) => {
                    const getImagesId = values?.images.filter((val) => !val.path).map((val) => val?.id);

                    filestoreMutation.mutate(formDataVideos, {
                        onSuccess: (data) => {
                            const getVideosId = values?.videos && values?.videos.filter((val) => !val.path).map((val) => val?.id);
                            const dataToSend = {
                                ...JSON.parse(JSON.stringify(values)),
                                images: [...getImagesId, ...(imagesData?.data ?? [])],
                                videos: [...(getVideosId || []), ...(data?.data?.data ?? [])],
                            };
                            delete dataToSend.videosPreviewUrl;
                            delete dataToSend.imagePreviewUrl;

                            onCreateService(dataToSend, actions);
                        },
                        onError: () => {
                            setIsServiceSubmitting(false);
                            showNotification({
                                title: 'Uh oh! something went wrong',
                                message: 'Sorry! There was a problem with your request.',
                                color: 'red',
                                icon: <IconX size={18} />,
                            });
                        },
                    });
                },
                onError: () => {
                    setIsServiceSubmitting(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: 'Sorry! There was a problem with your request.',
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                },
            });
        }
    };

    const onCreateService = (data: any, actions: FormikHelpers<ServicesFormValuesProps>) => {
        serviceMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setIsServiceSubmitting(false);
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    actions.resetForm();
                    setIsServiceSubmitting(false);
                    setFormModal(false);
                    setRowId('');
                    setCategoryOptions([]);
                    showNotification({
                        title: `Congrats! Service ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Service updated successfully' : data.data.message ?? 'Service created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['services', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
                setIsServiceSubmitting(false);
                const errorKeys = Object.keys(error.response.data);
                const errorMessage = `${errorKeys?.map((key) => `${key.toUpperCase()} - ${error.response.data[key]}\n`)}`;
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: (message || errorMessage) ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const onHandleSearch = (query: string) => {
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((service: ServicesResult) => String(service.id));
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
        const checkedRowId = data?.data?.result.map((service: ServicesResult) => String(service.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: string) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!serviceDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!serviceMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!isServiceSubmitting) {
            setServiceFormData({
                ...initialFormData,
            });
            setRowId('');
            setFormModal(false);
            // setHighlights([]);
            // setCategoryOptions([]);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
    };

    const handleFormModalEdit = (object: ServicesResult) => {
        setServiceFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: ServicesResult) => {
        const getServiceImages =
            value?.images &&
            value?.images.map((val) => {
                const fileName = _.split(val?.name, '/');
                return {
                    id: val?.id,
                    src: val?.media,
                    file: {
                        name: _.last(fileName),
                        size: val?.size,
                        type: val?.media_type,
                    },
                };
            });

        const getServiceVideos =
            value?.videos &&
            value?.videos.map((val) => {
                const fileName = _.split(val?.name, '/');
                return {
                    id: val?.id,
                    src: val?.media,
                    file: {
                        name: _.last(fileName),
                        size: val?.size,
                        type: val?.media_type,
                    },
                };
            });

        const findCurrentCategory = [{ ...value.category }];
        const formatCurrentCategory =
            findCurrentCategory &&
            findCurrentCategory.map(({ id, name }) => {
                return {
                    value: String(id),
                    label: String(name),
                };
            });
        if (!searchCategory) {
            setCategoryOptions(formatCurrentCategory);
        }

        return {
            id: value?.id,
            title: value?.title,
            description: value?.description,
            category: String(value?.category?.id),
            meta_title: value?.meta_title ?? value?.title,
            meta_description: value?.meta_description ?? '',
            meta_keyword: value?.meta_keyword ?? '',
            is_active: value?.is_active,
            videos: value?.videos as any[],
            videosPreviewUrl: getServiceVideos as any[],
            images: value?.images as any[],
            imagePreviewUrl: getServiceImages as any[],
        };
    };

    // const onHandleCategorySearch = (query: string) => {
    //     setSearchCategory(query);
    //     setOnSearchCategory(query);
    // };

    const handleSuccessCloseModal = () => {
        if (!serviceMultiVerifyMutation.isLoading) {
            setSuccessModal(false);
        }
    };

    const onFilterFormClear = async () => {
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSubCategoryOptions([]);
        setChildSubCategoryOptions([]);
        setServiceFilterFormData({ ...filterFormInitialData });
        setPage(1);
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setPage(1);
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSubCategoryOptions([]);
        setChildSubCategoryOptions([]);
        setShowFilter(false);
        setServiceFilterFormData({ ...filterFormInitialData });
    };

    const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ label, child, isNested, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <Group position="apart">
                <Text>{label}</Text>
                {isNested && <IconChevronRight size={20} />}
            </Group>
        </div>
    ));

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_service')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Services">
                {(is_superuser || user_permissions?.includes('add_service')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                {showFilter && (
                    <>
                        <Box
                            sx={{
                                background: dark ? theme.colors.dark['4'] : theme.colors.gray['0'],
                                borderRadius: theme.radius.sm,
                                position: 'relative',
                            }}
                            p={20}>
                            <CloseButton
                                radius="xl"
                                color="dark"
                                variant="light"
                                size="sm"
                                sx={{ position: 'absolute', top: -8, right: -8 }}
                                onClick={onShowFilterFormClose}
                            />
                            <Formik
                                initialValues={serviceFilterFormData}
                                onSubmit={(values) => {
                                    setPage(1);
                                    setServiceFilterFormData({ ...values });
                                }}>
                                {({ handleReset, setFieldValue, dirty, values }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col lg={2.5} md={4}>
                                                <SelectField
                                                    maxDropdownHeight={400}
                                                    itemComponent={SelectItem}
                                                    name="category"
                                                    placeHolder="Search category"
                                                    value={selectedCategory}
                                                    options={nestedCategoryOptions}
                                                    handleChange={(value) => {
                                                        if (value) {
                                                            setFieldValue('category', value);
                                                            setSelectedCategory(value);
                                                            const filteredCategory = nestedCategoryList?.data?.filter(
                                                                (val: { slug: string }) => val.slug === value
                                                            );
                                                            if (filteredCategory?.length > 0) {
                                                                const mappedSubCategory = filteredCategory[0].child.map(
                                                                    (val: { name: string; slug: string; child: any }) => {
                                                                        return {
                                                                            label: val.name,
                                                                            value: val?.slug ?? val.name,
                                                                            category: value,
                                                                            child: val?.child ?? [],
                                                                            isNested: val?.child?.length > 0 ? true : false,
                                                                        };
                                                                    }
                                                                );
                                                                setSubCategoryOptions(mappedSubCategory);
                                                            } else {
                                                                setSubCategoryOptions([]);
                                                            }
                                                            setChildSubCategoryOptions([]);
                                                            setSelectedSubCategory('');
                                                        } else {
                                                            setFieldValue('category', value);
                                                            setSelectedCategory(value);
                                                            setSelectedSubCategory(value);
                                                            setSubCategoryOptions([]);
                                                            setChildSubCategoryOptions([]);
                                                        }
                                                    }}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchNestedCategory(value);
                                                        } else {
                                                            setSearchNestedCategory('');
                                                        }
                                                    }}
                                                    rightSection={isNestedCategoryFetching && <Loader size="xs" />}
                                                    icon={<IconCategory size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            {subCategoryOptions.length > 0 && (
                                                <Grid.Col lg={2.5} md={4}>
                                                    <SelectField
                                                        maxDropdownHeight={400}
                                                        itemComponent={SelectItem}
                                                        name="sub-category"
                                                        placeHolder="Select sub-category"
                                                        value={selectedSubCategory}
                                                        options={subCategoryOptions}
                                                        handleChange={(value) => {
                                                            if (value) {
                                                                setFieldValue('category', value);
                                                                const category = subCategoryOptions.filter((fVal) => fVal.value === value)[0]
                                                                    ?.category;
                                                                setSelectedCategory(category);
                                                                setSelectedSubCategory(value);
                                                                const filteredSubCategory = subCategoryOptions.filter(
                                                                    (val: { value: string }) => val.value === value
                                                                );
                                                                if (filteredSubCategory?.length > 0) {
                                                                    const mappedSubCategory = filteredSubCategory[0].child.map(
                                                                        (val: { name: string; slug: string; child: any }) => {
                                                                            return {
                                                                                label: val.name,
                                                                                value: val?.slug ?? val.name,
                                                                                category: value,
                                                                                child: val?.child ?? [],
                                                                            };
                                                                        }
                                                                    );
                                                                    setChildSubCategoryOptions(mappedSubCategory);
                                                                } else {
                                                                    setChildSubCategoryOptions([]);
                                                                }
                                                            } else {
                                                                setFieldValue('category', selectedCategory);
                                                                setSelectedSubCategory(value);
                                                                setChildSubCategoryOptions([]);
                                                            }
                                                        }}
                                                        onSearchChange={(value) => {
                                                            if (value && value.length >= 3) {
                                                                setSearchNestedCategory(value);
                                                            } else {
                                                                setSearchNestedCategory('');
                                                            }
                                                        }}
                                                        rightSection={isNestedCategoryFetching && <Loader size="xs" />}
                                                        icon={<IconCategory size={18} stroke={1.75} />}
                                                        searchable
                                                        clearable
                                                        style={{ marginBottom: 0 }}
                                                    />
                                                </Grid.Col>
                                            )}

                                            {childSubCategoryOptions.length > 0 && (
                                                <Grid.Col lg={2.5} md={4}>
                                                    <SelectField
                                                        maxDropdownHeight={400}
                                                        name="sub-category"
                                                        placeHolder="Select sub-category"
                                                        value={selectedSubChildCategory}
                                                        options={childSubCategoryOptions}
                                                        handleChange={(value) => {
                                                            if (value) {
                                                                setFieldValue('category', value);
                                                                const category = childSubCategoryOptions.filter((fVal) => fVal.value === value)[0]
                                                                    ?.category;
                                                                setSelectedSubCategory(category);
                                                                setSelectedSubChildCategory(value);
                                                            } else {
                                                                setFieldValue('category', selectedSubCategory);
                                                                setSelectedSubChildCategory(value);
                                                            }
                                                        }}
                                                        onSearchChange={(value) => {
                                                            if (value && value.length >= 3) {
                                                                setSearchNestedCategory(value);
                                                            } else {
                                                                setSearchNestedCategory('');
                                                            }
                                                        }}
                                                        rightSection={isNestedCategoryFetching && <Loader size="xs" />}
                                                        icon={<IconCategory size={18} stroke={1.75} />}
                                                        searchable
                                                        clearable
                                                        style={{ marginBottom: 0 }}
                                                    />
                                                </Grid.Col>
                                            )}
                                            {/* <Grid.Col lg={2.5} md={4}>
                                                <SelectField
                                                    name="ordering"
                                                    placeHolder="Order by"
                                                    options={[
                                                        { value: 'created_at', label: 'Last to Latest' },
                                                        { value: '-created_at', label: 'Latest to Last' },
                                                        { value: 'title', label: 'Ascending' },
                                                        { value: '-title', label: 'Descending' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('ordering', value);
                                                    }}
                                                    icon={<IconSelector size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col> */}
                                        </Grid>
                                        <Button type="submit" name="Filter" loading={isFetching} disabled={!dirty} />
                                        <Button
                                            type="button"
                                            name="Clear Filter"
                                            onClick={() => {
                                                handleReset();
                                                onFilterFormClear();
                                            }}
                                            variant="light"
                                            ml={10}
                                            disabled={!dirty}
                                        />
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                        <Divider my={20} variant="dashed" />
                    </>
                )}
                <ServiceListTable
                    data={data?.data?.result}
                    page={page}
                    query={query}
                    isFetching={isFetching}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={serviceDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={serviceMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => serviceDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => serviceMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    handleUserVerify={() => setSuccessModal(true)}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    onShowFilterFormClose={onShowFilterFormClose}
                    ordering={ordering}
                    setOrdering={setOrdering}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={serviceFormData}
                validationSchema={serviceSchema}
                onSubmit={(values, actions) => {
                    const formData = new FormData();
                    const formDataVideos = new FormData();
                    setIsServiceSubmitting(true);

                    if (values.images.some((val) => val?.path) || (values.videos && values.videos.some((val) => val?.path))) {
                        values.images.forEach((file) => {
                            if (file?.path) formData.append('medias', file);
                        });
                        values.videos &&
                            values.videos.forEach((file) => {
                                if (file?.path) formDataVideos.append('medias', file);
                            });
                        onCreateThumbnail(formData, formDataVideos, values, actions);
                    } else {
                        const getImagesId = values?.images.map((val) => val?.id);
                        const getVideosId = values?.videos && values?.videos.map((val) => val?.id);
                        const dataToSend = {
                            ...JSON.parse(JSON.stringify(values)),
                            images: getImagesId,
                            videos: getVideosId,
                        };
                        delete dataToSend.videosPreviewUrl;
                        delete dataToSend.imagePreviewUrl;

                        onCreateService(dataToSend, actions);
                    }
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!isServiceSubmitting) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Service' : 'Add Service'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={isServiceSubmitting}
                        size="xl">
                        <Form>
                            <InputField
                                name="title"
                                error={errors.title}
                                touch={touched.title}
                                labelName="Title"
                                placeHolder="Enter service title"
                                onChange={(e) => {
                                    setFieldValue('title', e.target.value);
                                    setFieldValue('meta_title', e.target.value);
                                }}
                                withAsterisk
                            />
                            <TextEditor
                                name="description"
                                labelName="Description"
                                value={values.description}
                                onChange={(value: string) => {
                                    setFieldValue('description', value);
                                }}
                                error={errors.description}
                                touch={touched.description}
                                height={250}
                                sticky={false}
                            />
                            <Stack spacing={0} my={15}>
                                <Input.Wrapper label={'Category | Sub category'} required>
                                    <CategorySelectMenu
                                        data={nestedCategoryList?.data}
                                        setFieldValue={setFieldValue}
                                        rowId={rowId}
                                        category={rowId ? categoryOptions : []}
                                        error={errors.category}
                                        touch={touched.category}
                                    />
                                </Input.Wrapper>
                            </Stack>
                            <MultiFileDropzone
                                name="images"
                                labelName="Upload your images"
                                textMuted="More than 5 images are not allowed to upload. File supported: .jpeg, .jpg, .png. Maximum size 1MB."
                                error={errors.images as string}
                                touch={touched.images as boolean}
                                imagePreview="imagePreviewUrl"
                                maxFiles={5}
                                multiple
                                showFileDetail
                            />
                            <MultiFileDropzone
                                name="videos"
                                labelName="Upload your videos"
                                textMuted="More than 2 videos are not allowed to upload. File supported: .mp4. Maximum size 50MB."
                                error={errors.videos}
                                touch={touched.videos}
                                imagePreview="videosPreviewUrl"
                                accept={['video/mp4']}
                                maxFiles={2}
                                maxSize={50}
                                multiple
                                showFileDetail
                            />
                            <InputField
                                name="meta_title"
                                error={errors.meta_title}
                                touch={touched.meta_title}
                                labelName="Meta Title"
                                textMuted="Set a meta tag title. Recommended to be simple and precise keywords."
                                placeHolder="Enter meta title"
                                readOnly
                            />
                            <TextAreaField
                                name="meta_description"
                                error={errors.meta_description}
                                touch={touched.meta_description}
                                labelName="Meta Description"
                                autoComplete="off"
                                textMuted="Set a meta tag description to the task for increased SEO ranking."
                                placeHolder="Type your meta description here..."
                            />
                            <InputField
                                name="meta_keyword"
                                error={errors.meta_keyword}
                                touch={touched.meta_keyword}
                                labelName="Meta Keyword"
                                textMuted={
                                    <>
                                        <span>Set a list of keywords that the task is related to. Separate the keywords by adding a comma</span>
                                        <Code style={{ margin: '0 5px' }}>,</Code>
                                        <span>between each keyword.</span>
                                    </>
                                }
                                placeHolder="e.g. chair, modern, black"
                            />
                            <SwitchCheckbox
                                name="is_active"
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                labelName="Is Active"
                                mb={15}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
            <SuccessModal
                opened={successModal}
                onClose={handleSuccessCloseModal}
                title="Are you sure?"
                description="Do you really want to verify selected service?"
                loading={serviceMultiVerifyMutation.isLoading}
                onConfirm={() => serviceMultiVerifyMutation.mutate(checked)}
                confirmButtonText="Yes! Verify it"
            />
        </>
    );
};

export default ServiceList;
