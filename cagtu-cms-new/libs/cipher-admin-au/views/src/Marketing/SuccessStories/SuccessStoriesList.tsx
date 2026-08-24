import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, ProfileImageField, SwitchCheckbox, TextEditor } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    SuccessStoriesFormValuesProps,
    SuccessStoriesResult,
    getPageLimit,
    successStoriesSchema,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import SuccessStoriesTable from './SuccessStoriesTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.marketing?.successStory;

const initialFormData: SuccessStoriesFormValuesProps = {
    id: null,
    full_name: '',
    email: '',
    specialities: '',
    content: '',
    profile_image: [],
    profilePreviewUrl: [],
    status: false,
};

const SuccessStoriesList = () => {
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

    const [successStoryFormData, setSuccessStoryFormData] = useState<SuccessStoriesFormValuesProps>({
        ...initialFormData,
    });

    const formData: FormData = new FormData();

    const successStoryAPI = new CipherAPI(urlsPath?.path);
    const successStoryMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['success-stories', page, limitChange], () =>
        successStoryAPI.list({ search: query, page, page_size: limitChange })
    );

    const successStoryMutation = useMutation((data: FormData) => successStoryAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const successStoryMultiDeleteMutation = useMutation((checkedIds: string[]) => successStoryMultiDeleteAPI.store({ id: checkedIds }), {
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
                    title: 'Congrats! Success Stories Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['success-stories', pageToSet, limitChange]);
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

    const successStoryDeleteMutation = useMutation((id: number) => successStoryAPI.delete(id), {
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
                    title: 'Congrats! Success Stories Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['success-stories', pageToSet, limitChange]);
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

    const onCreateSuccessStory = (
        formData: FormData,
        actions: FormikHelpers<SuccessStoriesFormValuesProps>,
        values: SuccessStoriesFormValuesProps
    ) => {
        successStoryMutation.mutate(formData, {
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
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Success Stories ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Success stories updated successfully'
                            : data.data.message ?? 'Success stories created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    actions.resetForm();
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['success-stories', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
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
        queryClient.prefetchQuery(['success-stories', page, limitChange], () => successStoryAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((user: SuccessStoriesResult) => String(user.id));
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
        const checkedRowId = data?.data?.result.map((user: SuccessStoriesResult) => String(user.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!successStoryDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!successStoryMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!successStoryMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setSuccessStoryFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: SuccessStoriesFormValuesProps) => {
        setSuccessStoryFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: SuccessStoriesFormValuesProps) => {
        formData.append('full_name', values.full_name);
        formData.append('email', values.email);
        formData.append('content', values.content);
        formData.append('specialities', values.specialities);
        formData.append('status', String(values.status));

        if (values.profile_image[0]?.name) {
            values.profile_image.forEach((file) => formData.append('profile_image', file));
        }
    };

    const mapToViewModal = (value: SuccessStoriesFormValuesProps) => {
        return {
            id: null,
            full_name: value.full_name,
            email: value.email,
            specialities: value.specialities,
            content: value.content,
            profile_image: value.profile_image,
            profilePreviewUrl: [{ src: value.profile_image }],
            status: value.status,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_successstory')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Success Stories">
                {(is_superuser || user_permissions?.includes('add_successstory')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <SuccessStoriesTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={successStoryDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={successStoryMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => successStoryDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => successStoryMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
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
                initialValues={successStoryFormData}
                validationSchema={successStoriesSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateSuccessStory(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!successStoryMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Story' : 'Add Story'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={successStoryMutation.isLoading}
                        size="xl">
                        <Form>
                            <ProfileImageField
                                labelName="Profile Image"
                                name="profile_image"
                                profileImageData={values.profilePreviewUrl}
                                error={errors.profile_image as string}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                withAsterisk
                            />
                            <InputField
                                name="full_name"
                                error={errors.full_name}
                                touch={touched.full_name}
                                labelName="Full Name"
                                placeHolder="e.g. Sharad Sharma"
                                withAsterisk
                            />
                            <InputField
                                name="email"
                                error={errors.email}
                                touch={touched.email}
                                labelName="Email Address"
                                placeHolder="e.g. example@example.com"
                                withAsterisk
                            />
                            <InputField
                                name="specialities"
                                error={errors.specialities}
                                touch={touched.specialities}
                                labelName="Speciality"
                                placeHolder="e.g. Engineer/Lawyer/Software Developer"
                                withAsterisk
                            />
                            <TextEditor
                                name="content"
                                labelName="Description"
                                value={values.content}
                                onChange={(value: string) => {
                                    setFieldValue('content', value);
                                }}
                                error={errors.content}
                                touch={touched.content}
                                onBlur={handleBlur}
                                height={250}
                                withAsterisk
                            />
                            <SwitchCheckbox
                                name="status"
                                checked={values.status}
                                onChange={(e) => setFieldValue('status', e.currentTarget.checked)}
                                labelName="Is it Active?"
                                mt={20}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default SuccessStoriesList;
