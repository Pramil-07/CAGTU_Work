import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox, TextEditor } from '@cagtu-cms/ui-shared';
import { CipherUserContext, editorValidate, getPageLimit, NoticeFormValuesProps, NoticeResult, stringValidate, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons';
import NoticeListTable from './NoticeListTable';
import * as Yup from 'yup';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.notice;

const initialFormData: NoticeFormValuesProps = {
    id: null,
    name: '',
    message: '',
    is_active: false,
};

const NoticeList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [noticeFormData, setNoticeFormData] = useState<NoticeFormValuesProps>({
        ...initialFormData,
    });

    const noticeAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['notice', page, limitChange], () =>
        noticeAPI.list({ search: query, page, page_size: limitChange })
    );

    const noticeMutation = useMutation((data: NoticeFormValuesProps) => noticeAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const noticeDeleteMutation = useMutation((id: number) => noticeAPI.delete(id), {
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
                    title: 'Congrats! Notice Deleted',
                    message: data.data?.message ?? 'Notice deleted successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['notice', pageToSet, limitChange]);
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

    const onCreateNotice = (data: NoticeFormValuesProps, actions: FormikHelpers<NoticeFormValuesProps>) => {
        noticeMutation.mutate(data, {
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
                    actions.resetForm();
                    setNoticeFormData({ ...initialFormData });
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Notice ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Notice updated successfully' : data.data.message ?? 'Notice created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['notice', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, name },
                } = error.response;
                actions.setFieldError('name', name && name[0]);
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
        queryClient.prefetchQuery(['notice', page, limitChange], () => noticeAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!noticeDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!noticeMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setNoticeFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: NoticeResult) => {
        setNoticeFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: NoticeResult) => {
        return {
            id: value?.id,
            name: value?.name,
            message: value?.message,
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_notice')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Notice">
                {(is_superuser || user_permissions?.includes('add_notice')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <NoticeListTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={noticeDeleteMutation.isLoading}
                    onConfirmSingleDelete={() => noticeDeleteMutation.mutate(Number(rowId))}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
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
                initialValues={noticeFormData}
                validationSchema={Yup.object().shape({
                    name: stringValidate,
                    message: editorValidate,
                })}
                onSubmit={(values, actions) => {
                    onCreateNotice(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!noticeMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Notice' : 'Add Notice'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={noticeMutation.isLoading}
                        size="lg">
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Notice Name"
                                placeHolder="Enter the notice name"
                                textMuted="The notice name should be unique and cannot be the same if already exist in the table."
                                withAsterisk
                            />
                            <TextEditor
                                name="message"
                                labelName="Message"
                                value={values.message}
                                onChange={(value: string) => {
                                    setFieldValue('message', value);
                                }}
                                error={errors.message}
                                touch={touched.message}
                                height={350}
                                sticky={false}
                                withAsterisk
                                controls={[
                                    ['bold', 'italic', 'underline', 'link'],
                                    ['h1', 'h2', 'h3'],
                                ]}
                            />
                            <SwitchCheckbox
                                name="is_active"
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                labelName="Is Active?"
                                mt="md"
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default NoticeList;
