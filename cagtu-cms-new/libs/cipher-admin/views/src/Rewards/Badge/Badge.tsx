import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, ProfileImageField } from '@cagtu-cms/ui-shared';
import { BadgeFormValuesProps, BadgeResult, CipherUserContext, badgeSchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconHourglassHigh, IconHourglassLow, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import BadgeTable from './BadgeTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.rewards?.badge;

const initialFormData: BadgeFormValuesProps = {
    id: null,
    title: '',
    progress_level_start: '',
    progress_level_end: '',
    image: [],
    profilePreviewUrl: [],
};

const Badge = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [badgeFormData, setBadgeFormData] = useState<BadgeFormValuesProps>({
        ...initialFormData,
    });

    const formData: FormData = new FormData();

    const badgeAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['badges', page, limitChange], () =>
        badgeAPI.list({ search: query, page, page_size: limitChange })
    );

    const badgeMutation = useMutation((data: FormData) => badgeAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const badgeDeleteMutation = useMutation((id: number) => badgeAPI.delete(id), {
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
                    title: 'Congrats! Badge Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['badges', pageToSet, limitChange]);
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

    const onCreateBadge = (formData: FormData, actions: FormikHelpers<BadgeFormValuesProps>, values: BadgeFormValuesProps) => {
        badgeMutation.mutate(formData, {
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
                        title: `Congrats! Badge ${rowId ? 'Created' : 'Updated'}`,
                        message: rowId ? data.data.message ?? 'Badge updated successfully' : data.data.message ?? 'Badge created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    actions.resetForm();
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['badges', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['badges', page, limitChange], () => badgeAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!badgeDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!badgeMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setBadgeFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: BadgeResult) => {
        setBadgeFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const formDataValues = (values: BadgeFormValuesProps) => {
        formData.append('title', values.title);
        formData.append('progress_level_start', values.progress_level_start as unknown as string);
        formData.append('progress_level_end', values.progress_level_end as unknown as string);

        if (values.image[0]?.name) {
            values.image.forEach((file) => formData.append('image', file));
        }
    };

    const mapToViewModal = (value: BadgeResult) => {
        return {
            id: value?.id,
            title: value?.title,
            progress_level_start: value?.progress_level_start,
            progress_level_end: value?.progress_level_end,
            image: value?.image,
            profilePreviewUrl: [{ src: value.image }],
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_badge')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Badge">{(is_superuser || user_permissions?.includes('add_badge')) && <Button onClick={handleFormModal} name="Create" />}</PageHeader>
            <PaperBox>
                <BadgeTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={badgeDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => badgeDeleteMutation.mutate(Number(rowId))}
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
                initialValues={badgeFormData}
                validationSchema={badgeSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateBadge(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!badgeMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Badge' : 'Add Badge'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={badgeMutation.isLoading}>
                        <Form>
                            <ProfileImageField
                                labelName="Badge Image"
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
                            <InputField
                                name="progress_level_start"
                                error={errors.progress_level_start}
                                touch={touched.progress_level_start}
                                labelName="Progress Level Start"
                                placeHolder="e.g. 120"
                                icon={<IconHourglassHigh size={18} stroke={1.75} />}
                                withAsterisk
                            />
                            <InputField
                                name="progress_level_end"
                                error={errors.progress_level_end}
                                touch={touched.progress_level_end}
                                labelName="Progress Level End"
                                placeHolder="e.g. 2500"
                                icon={<IconHourglassLow size={18} stroke={1.75} />}
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default Badge;
