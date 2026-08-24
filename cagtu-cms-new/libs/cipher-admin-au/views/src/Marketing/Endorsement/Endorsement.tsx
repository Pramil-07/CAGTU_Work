import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    CreatableInputField,
    ErrorAlert,
    FormModal,
    InputField,
    PageHeader,
    PaperBox,
    ProfileImageField,
    // TextAreaField,
} from '@cagtu-cms/ui-shared';
import { CipherUserContext, EndorsementFormValuesProps, EndorsementResult, endorsementSchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCategory, IconCheck, IconTool, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import EndorsementTable from './EndorsementTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.marketing?.endorsement;
const urlsCatPath = urls?.cipher?.category;
const urlsServicePath = urls?.cipher?.services;

const initialFormData: EndorsementFormValuesProps = {
    id: null,
    title: '',
    categories: [],
    services: [],
    url: '',
    image: [],
    profilePreviewUrl: [],
};

const Endorsement = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [searchCategory, setSearchCategory] = useState<string>(''); // Read the value from category select field after values enter i.e; more than 3 letter
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchService, setSearchService] = useState<string>(''); // Read the value from category select field after values enter i.e; more than 3 letter
    const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);

    const [endorsementFormData, setEndorsementFormData] = useState<EndorsementFormValuesProps>({
        ...initialFormData,
    });

    const formData: FormData = new FormData();

    const endorsementAPI = new CipherAPI(urlsPath?.path);
    const categorySelectOptionsAPI = new CipherAPI(urlsCatPath?.selectOptions);
    const serviceOptionsAPI = new CipherAPI(urlsServicePath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['endorsement', page, limitChange], () =>
        endorsementAPI.list({ search: query, page, page_size: limitChange })
    );

    const endorsementMutation = useMutation((data: FormData) => endorsementAPI.store(data, Number(rowId)));

    // Fetch the category list from the API as the per user keywords request
    const { isFetching: isCategoryFetching } = useQuery(['category-options'], () => categorySelectOptionsAPI.list({ search: searchCategory }), {
        enabled: !!searchCategory,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: String(name),
                };
            });
            setCategoryOptions((prev) => (prev.length > 0 ? [...prev, ...options] : options));
        },
    });

    // Fetch the service list from the API as the per user keywords request
    const { isFetching: isServiceFetching } = useQuery(['service-options'], () => serviceOptionsAPI.list({ page: -1, search: searchService }), {
        enabled: !!searchService,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, title }: { id: string; title: string }) => {
                return {
                    value: String(id),
                    label: String(title),
                };
            });
            setServiceOptions((prev) => (prev.length > 0 ? [...prev, ...options] : options));
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const endorsementDeleteMutation = useMutation((id: number) => endorsementAPI.delete(id), {
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
                    title: 'Congrats! Advertisement Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['endorsement', pageToSet, limitChange]);
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

    const onCreateEndorsement = (formData: FormData, actions: FormikHelpers<EndorsementFormValuesProps>, values: EndorsementFormValuesProps) => {
        endorsementMutation.mutate(formData, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    delete values.profilePreviewUrl;
                    actions.resetForm();
                    setEndorsementFormData({ ...initialFormData });
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Advertisement ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Advertisement updated successfully'
                            : data.data.message ?? 'Advertisement created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['endorsement', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, image },
                } = error.response;
                actions.setFieldError('image', image && image[0]);
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
        queryClient.prefetchQuery(['endorsement', page, limitChange], () => endorsementAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!endorsementDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!endorsementMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setEndorsementFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: EndorsementResult) => {
        setEndorsementFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: EndorsementFormValuesProps) => {
        formData.append('title', values.title);
        formData.append('url', values.url);

        values?.services?.forEach((val) => formData.append('services', val ?? ''));

        values?.categories?.forEach((val) => formData.append('categories', String(val) ?? ''));

        if (values.image[0]?.name) {
            values.image.forEach((file) => formData.append('image', file));
        }
    };

    const mapToViewModal = (value: EndorsementResult) => {
        const categoriesOptions = value.categories && value.categories.map((val: any) => String(val?.id));
        const servicesOptions = value.services && value.services.map((val: any) => val?.id);

        const findCurrentCategories = [...value.categories];
        const findCurrentService = [...value.services];

        const formatCurrentCategories =
            findCurrentCategories &&
            findCurrentCategories.map(({ id, name }) => {
                return {
                    value: String(id),
                    label: name,
                };
            });

        const formatCurrentService =
            findCurrentService &&
            findCurrentService.map(({ id, title }) => {
                return {
                    value: String(id),
                    label: title,
                };
            });

        if (!searchCategory) {
            setCategoryOptions(formatCurrentCategories);
        }
        if (!searchService) {
            setServiceOptions(formatCurrentService);
        }

        return {
            id: value?.id,
            title: value?.title,
            url: value?.url,
            services: servicesOptions,
            categories: categoriesOptions,
            image: value?.image,
            profilePreviewUrl: [{ src: value.image }],
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_advertisement')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Advertisement">
                {(is_superuser || user_permissions?.includes('add_advertisement')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <EndorsementTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={endorsementDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => endorsementDeleteMutation.mutate(Number(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={endorsementFormData}
                validationSchema={endorsementSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateEndorsement(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!endorsementMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Advertisement' : 'Add Advertisement'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={endorsementMutation.isLoading}>
                        <Form>
                            <ProfileImageField
                                labelName="Image"
                                name="image"
                                profileImageData={values.profilePreviewUrl}
                                error={errors.image as string}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                withAsterisk
                            />
                            <InputField
                                name="title"
                                error={errors.title}
                                touch={touched.title}
                                labelName="Title"
                                placeHolder="Enter the title"
                                withAsterisk
                            />
                            <CreatableInputField
                                name="categories"
                                options={categoryOptions}
                                labelName="Categories"
                                placeHolder="e.g. Search categories"
                                error={errors.categories as string}
                                touch={touched.categories}
                                value={values.categories as unknown as string[]}
                                onChange={(value) => setFieldValue('categories', value)}
                                onSearchChange={(value) => {
                                    if (value && value.length >= 3) {
                                        setSearchCategory(value);
                                    } else {
                                        setSearchCategory('');
                                    }
                                }}
                                rightSection={isCategoryFetching && <Loader size="xs" />}
                                icon={<IconCategory size={18} stroke={1.75} />}
                                withAsterisk={values.services && values.services.length < 1}
                                searchable
                                clearable
                            />
                            <CreatableInputField
                                name="services"
                                options={serviceOptions}
                                labelName="Services"
                                placeHolder="e.g. Search services"
                                error={errors.services as string}
                                touch={touched.services}
                                value={values.services}
                                onChange={(value) => setFieldValue('services', value)}
                                onSearchChange={(value) => {
                                    if (value && value.length >= 3) {
                                        setSearchService(value);
                                    } else {
                                        setSearchService('');
                                    }
                                }}
                                rightSection={isServiceFetching && <Loader size="xs" />}
                                icon={<IconTool size={18} stroke={1.75} />}
                                withAsterisk={values.categories && values.categories.length < 1}
                                searchable
                                clearable
                            />
                            <InputField
                                name="url"
                                error={errors.url}
                                touch={touched.url}
                                labelName="Page URL"
                                placeHolder="Enter the page URL"
                                withAsterisk
                            />
                            {/* <TextAreaField
                                name="description"
                                labelName="Description"
                                placeHolder="Enter the description"
                                error={errors.description}
                                touch={touched.description}
                            /> */}
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default Endorsement;
