import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, FormModal, InputField, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, FaqTopicFormValuesProps, FaqTopicResult, getPageLimit, stringValidate, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import FaqTopicTable from './FaqTopicTable';
import * as Yup from 'yup';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.faq?.topic;

const initialFormData: FaqTopicFormValuesProps = {
    id: null,
    topic: '',
};

const FaqTopic = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [checked, setChecked] = useState<string[]>([]);
    const [query, setQuery] = useState<string>('');
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [faqTopicFormData, setFaqTopicFormData] = useState<FaqTopicFormValuesProps>({ ...initialFormData });

    const faqTopicAPI = new CipherAPI(urlsPath?.path);
    const faqTopicMultipleDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['faq-topic', page, limitChange], () =>
        faqTopicAPI.list({ search: query, page, page_size: limitChange })
    );

    const faqTopicMutation = useMutation((data: FaqTopicFormValuesProps) => faqTopicAPI.store({ ...data, status: 'Active' }, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const faqTopicMultiDeleteMutation = useMutation((checkedIds: string[]) => faqTopicMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats!',
                    message: data.data?.message ?? 'Faq topic deleted successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['faq-topic', pageToSet, limitChange]);
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

    const faqTopicDeleteMutation = useMutation((id: string) => faqTopicAPI.delete(id), {
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
                    title: 'Congrats!',
                    message: data.data?.message ?? 'Faq topic deleted successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['faq-topic', pageToSet, limitChange]);
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

    const onCreateFaqTopic = (data: FaqTopicFormValuesProps, actions: FormikHelpers<FaqTopicFormValuesProps>) => {
        faqTopicMutation.mutate(data, {
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
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Faq Topic ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Faq topic updated successfully'
                            : data.data.message ?? 'Faq topic created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['faq-topic', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['faq-topic', page, limitChange], () => faqTopicAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((faqTopic: FaqTopicResult) => String(faqTopic.id));
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
        const checkedRowId = data?.data?.result.map((faqTopic: FaqTopicResult) => String(faqTopic.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!faqTopicDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!faqTopicMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!faqTopicMutation.isLoading) {
            setFaqTopicFormData({ ...initialFormData });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: FaqTopicResult) => {
        setFaqTopicFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: FaqTopicResult) => {
        return {
            id: value?.id,
            topic: value?.topic,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_faqtopic')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                <FaqTopicTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={faqTopicDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={faqTopicMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => faqTopicDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => faqTopicMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    handleFormModal={handleFormModal}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={faqTopicFormData}
                validationSchema={Yup.object().shape({
                    topic: stringValidate,
                })}
                onSubmit={(values, actions) => {
                    onCreateFaqTopic(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!faqTopicMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Topic' : 'Add Topic'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={faqTopicMutation.isLoading}>
                        <Form>
                            <InputField
                                name="topic"
                                error={errors.topic}
                                touch={touched.topic}
                                labelName="Topic"
                                placeHolder="Enter topic"
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default FaqTopic;
