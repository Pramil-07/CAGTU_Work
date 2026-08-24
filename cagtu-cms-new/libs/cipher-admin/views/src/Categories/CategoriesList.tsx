import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    ErrorAlert,
    FormModal,
    InputField,
    MultiFileDropzone,
    PageHeader,
    PaperBox,
    SwitchCheckbox,
    TextAreaField,
    ViewAnalyticsButton,
} from '@cagtu-cms/ui-shared';
import { useThemeIconStyles } from '@cagtu-cms/ui-styles';
import {
    CipherCategoryFormValueProps,
    CipherCategoryResult,
    cipherCategorySchema,
    CipherUserContext,
    getPageLimit,
    TreeTableContext,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { Box, ThemeIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import CategoriesListTable from './CategoriesListTable';
import * as _ from 'lodash';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.category;
const urlsAvatarPath = urls?.cipher?.avatar;

const initialFormData: CipherCategoryFormValueProps = {
    id: null,
    icon: '',
    name: '',
    parent: null,
    is_active: true,
    avatar_images: [],
    avatarPreviewUrl: [],
    commission: '',
    inherits_commission: false,
};

const CategoriesList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [ordering, setOrdering] = useState<string>('name');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [isParent, setIsParent] = useState<boolean>(false);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [openRows, setOpenRows] = useState<number[]>([]);

    const { classes } = useThemeIconStyles();

    const [categoryFormData, setCategoryFormData] = useState<CipherCategoryFormValueProps>({
        ...initialFormData,
    });
    const categoryAPI = new CipherAPI(urlsPath?.path);
    const categoryListAPI = new CipherAPI(urlsPath?.list);
    const categoryMultipleDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);
    const avatarAPI = new CipherAPI(urlsAvatarPath?.path);

    const formData: FormData = new FormData();
    const avatarFormData: FormData = new FormData();

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['categories', page, limitChange, ordering], () =>
        categoryListAPI.list({ page, page_size: limitChange, ordering: ordering, search: query })
    );
    const categoryMutation = useMutation((data: FormData) => categoryAPI.store(data, Number(rowId)));
    const avatarMutation = useMutation((data: FormData) => avatarAPI.store(data));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const categoryMultipleDeleteMutation = useMutation((checkedIds: string[]) => categoryMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Category Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet, limitChange]);
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

    const categoryDeleteMutation = useMutation((id: number) => categoryAPI.delete(id), {
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
                    title: 'Congrats! Category Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet, limitChange]);
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

    const onCreateCategory = (data: FormData, actions: FormikHelpers<CipherCategoryFormValueProps>, values: CipherCategoryFormValueProps) => {
        categoryMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setIsCategorySubmitting(false);
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    delete values?.avatarPreviewUrl;
                    actions.resetForm();
                    setIsCategorySubmitting(false);
                    setFormModal(false);
                    setRowId(null);
                    setIsParent(false);
                    if (categoryFormData?.parent) setOpenRows((prev) => [...prev, categoryFormData.parent as number]);
                    showNotification({
                        title: `Congrats! Category ${rowId ? 'updated' : 'created'}`,
                        message: !rowId ? data.data.message ?? 'Category created successfully' : data.data.message ?? 'Category updated successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { name, icon, commission, message },
                } = error.response;

                actions.setFieldError('name', name && name[0]);
                actions.setFieldError('icon', icon && icon[0]);
                actions.setFieldError('commission', commission && commission[0]);
                setIsCategorySubmitting(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const onAddAvatar = (avatarFormData: FormData, actions: FormikHelpers<CipherCategoryFormValueProps>, values: CipherCategoryFormValueProps) => {
        avatarMutation.mutate(avatarFormData, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setIsCategorySubmitting(false);
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    delete values?.avatarPreviewUrl;
                    actions.resetForm();
                    setIsCategorySubmitting(false);
                    setFormModal(false);
                    setRowId(null);
                    setIsParent(false);
                    if (categoryFormData?.parent) setOpenRows((prev) => [...prev, categoryFormData.parent as number]);
                    showNotification({
                        title: 'Congrats! Avatar added successfully',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['categories', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
                setIsCategorySubmitting(false);
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
        queryClient.prefetchQuery(['categories', page, limitChange, ordering], () =>
            categoryListAPI.list({ search: query, page_size: limitChange, ordering: ordering })
        );
        setQuery(query);
        setPage(1);
    };

    const extractAllCategoyId = (result: CipherCategoryResult[]) => {
        const ids: string[] = [];
        const extractId = (item: any) => {
            if (item.id) {
                ids.push(String(item.id));
            }
            if (item.child) {
                item?.child?.forEach((value: any) => {
                    extractId(value);
                });
            }
        };
        result?.forEach((value: any) => {
            extractId(value);
        });
        return ids;
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = extractAllCategoyId(data?.data?.result);
            setChecked(checkedRowId);
            setTimeout(() => {
                setOpenRows(checkedRowId.map((id: string) => Number(id)));
            }, 150);
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

    const isInterminate = () => {
        const isAllSelect = isAllCheckboxSelected();
        return !isAllSelect && checked.length > 0;
    };

    const isAllCheckboxSelected = () => {
        const checkedRowId = extractAllCategoyId(data?.data?.result);
        const isAllSelected = checkedRowId.every((id: string) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!categoryDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!categoryMultipleDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!isCategorySubmitting) {
            setCategoryFormData({
                ...initialFormData,
            });
            setRowId(null);
            setIsParent(false);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setRowId(null);
        setFormModal(true);
        setIsParent(true);
        setCategoryFormData({
            ...initialFormData,
        });
    };

    const handleCategoryCreate = (id: number) => {
        setFormModal(true);
        setCategoryFormData({
            ...initialFormData,
            parent: id,
        });
    };

    const handleFormModalEdit = (object: CipherCategoryResult) => {
        setCategoryFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
        if (_.get(object, 'icon') !== undefined) setIsParent(true);
    };

    const formDataValues = (values: CipherCategoryFormValueProps) => {
        formData.append('name', String(values.name));
        formData.append('is_active', String(values.is_active));
        formData.append('inherits_commission', String(values.inherits_commission));

        if (values.icon) formData.append('icon', String(values.icon));

        if (values.parent) formData.append('parent', String(values.parent));

        if (values.commission) formData.append('commission', String(values.commission));

        if (values.avatar_images.some((val) => val?.path)) {
            values.avatar_images.forEach((file) => {
                if (file?.path) formData.append('avatar_images', file);
            });
        }
    };

    const avatarFormDataValues = (values: CipherCategoryFormValueProps) => {
        if (values.avatar_images.some((val) => val?.path)) {
            avatarFormData.append('category', String(categoryFormData?.id));
            values.avatar_images.forEach((file) => {
                if (file?.path) avatarFormData.append('images', file);
            });
        }
    };

    const mapToViewModal = (value: CipherCategoryResult) => {
        const getAvatars =
            value?.avatars &&
            value?.avatars.map((val) => {
                const fileName = _.split(val?.name, '/');
                const fileType = _.split(val?.name, '.');
                return {
                    id: val?.id,
                    src: val?.image,
                    file: {
                        name: _.last(fileName),
                        size: val?.size,
                        type: `image/${_.last(fileType)}`,
                    },
                };
            });
        return {
            id: value.id,
            icon: value.icon ?? '',
            name: value.name,
            parent: value.parent,
            is_active: value.is_active,
            avatar_images: value?.avatars as any[],
            avatarPreviewUrl: getAvatars as any[],
            commission: value?.commission,
            inherits_commission: value?.inherits_commission,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_category')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Categories">
                <ViewAnalyticsButton navigateTo="/analytics/category" />
                {(is_superuser || user_permissions?.includes('add_category')) && <Button onClick={handleFormModal} name="Add Main Category" />}
            </PageHeader>
            <PaperBox>
                <TreeTableContext.Provider value={{ openRows, setOpenRows }}>
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
                        handleCategoryCreate={handleCategoryCreate}
                        limitChange={limitChange}
                        handleLimitChange={handleLimitChange}
                        isInterminate={isInterminate()}
                        ordering={ordering}
                        setOrdering={setOrdering}
                        isFetching={isFetching}
                        query={query}
                    />
                </TreeTableContext.Provider>
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={categoryFormData}
                validationSchema={cipherCategorySchema}
                onSubmit={(values, actions) => {
                    avatarFormDataValues(values);
                    formDataValues(values);
                    setIsCategorySubmitting(true);
                    if (!_.isNull(categoryFormData?.id) && values.avatar_images.some((val) => val?.path)) {
                        onAddAvatar(avatarFormData, actions, values);
                    } else {
                        onCreateCategory(formData, actions, values);
                    }
                }}>
                {({ errors, touched, handleSubmit, handleReset, values }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!isCategorySubmitting) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Category' : 'Add Category'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={isCategorySubmitting}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Category Name"
                                fieldRequired
                                placeHolder="Enter category name"
                            />

                            <InputField
                                name="commission"
                                error={errors.commission}
                                touch={touched.commission}
                                labelName="Commission"
                                placeHolder="Enter commission"
                            />

                            <SwitchCheckbox name="inherits_commission" checked={values.inherits_commission} labelName="Inherit commission" mb={15} />

                            {isParent && (
                                <TextAreaField
                                    name="icon"
                                    error={errors.icon}
                                    touch={touched.icon}
                                    labelName="Category Icon"
                                    autoComplete="off"
                                    placeHolder="We only support SVG code"
                                />
                            )}
                            {values.icon && (
                                <Box>
                                    <ThemeIcon variant="light" size={'xl'} color="gray" mb={15}>
                                        <div className={classes.ct_theme_icon} dangerouslySetInnerHTML={{ __html: values.icon }} />
                                    </ThemeIcon>
                                </Box>
                            )}
                            <MultiFileDropzone
                                name="avatar_images"
                                labelName="Avatar"
                                textMuted="More than 5 avatars are not allowed to upload. File supported: .jpeg, .jpg, .png. Maximum size 1MB."
                                error={errors.avatar_images as string}
                                touch={touched.avatar_images as boolean}
                                imagePreview="avatarPreviewUrl"
                                maxFiles={10}
                                multiple
                                showFileDetail
                                withCloseButton={false}
                            />
                            <SwitchCheckbox name="is_active" checked={values.is_active} labelName="Is Active?" mb={15} />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default CategoriesList;
