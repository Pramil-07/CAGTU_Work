import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, SecurityQuestionResult, stringValidate } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import * as Yup from 'yup';
import SecurityQuestionTable from './SecurityQuestionTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.support?.securityQuestion;

const initialFormData: SecurityQuestionResult = {
    id: null,
    question: '',
};

const SecurityQuestion = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();

    const [secQuesFormData, setSecQuesFormData] = useState<SecurityQuestionResult>({ ...initialFormData });

    const secQuesAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data } = useQuery(['security-question'], () => secQuesAPI.list());

    const secQuesMutation = useMutation((data: SecurityQuestionResult) => secQuesAPI.store(data, Number(rowId)));

    const secQuesDeleteMutation = useMutation((id: number) => secQuesAPI.delete(id), {
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
                    message: data.data?.message ?? 'Notice deleted successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['security-question']);
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

    const onCreateSecQues = (data: SecurityQuestionResult, actions: FormikHelpers<SecurityQuestionResult>) => {
        secQuesMutation.mutate(data, {
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
                        title: `Congrats! Security Question ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Security question updated successfully'
                            : data.data.message ?? 'Security question created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    queryClient.invalidateQueries(['security-question']);
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

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!secQuesDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!secQuesMutation.isLoading) {
            setSecQuesFormData({ ...initialFormData });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: SecurityQuestionResult) => {
        setSecQuesFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: SecurityQuestionResult) => {
        return {
            id: value?.id,
            question: value?.question,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_securityquestion')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Security Question">
                {(is_superuser || user_permissions?.includes('add_securityquestion')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <SecurityQuestionTable
                    data={data?.data}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={secQuesDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onConfirmSingleDelete={() => secQuesDeleteMutation.mutate(Number(rowId))}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleFormModalEdit={handleFormModalEdit}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={secQuesFormData}
                validationSchema={Yup.object().shape({
                    question: stringValidate,
                })}
                onSubmit={(values, actions) => {
                    onCreateSecQues(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!secQuesMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Question' : 'Add Question'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={secQuesMutation.isLoading}>
                        <Form>
                            <InputField
                                name="question"
                                error={errors.question}
                                touch={touched.question}
                                labelName="Question"
                                placeHolder="Enter question name"
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default SecurityQuestion;
