import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SelectField, SwitchCheckbox, TextAreaField } from '@cagtu-cms/ui-shared';
import { CipherUserContext, EmailTemplateFormvaluesProps, EmailTemplateResult, getPageLimit, stringValidate, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import * as Yup from 'yup';
import * as _ from 'lodash';
import EmailTemplateTable from './EmailTemplateTable';
import { IconCheck, IconSend, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.email?.template;
const urlsSenderEmailPath = urls?.cipher?.email;

const initialFormData: EmailTemplateFormvaluesProps = {
    id: null,
    name: '',
    content: '',
    subject: '',
    sender: '',
    is_active: false,
};

const EmailTemplate = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [senderOptions, setSenderOptions] = useState<{ value: string; label: string }[]>([]);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [emailTempFormData, setEmailTempFormData] = useState<EmailTemplateFormvaluesProps>({ ...initialFormData });

    const emailTempAPI = new CipherAPI(urlsPath?.path);
    const senderEmailOptionsAPI = new CipherAPI(`${urlsSenderEmailPath?.path}options/`);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['email-template', page, limitChange], () =>
        emailTempAPI.list({ search: query, page, page_size: limitChange })
    );

    // Sender Email Options
    useQuery(['sender-options'], () => senderEmailOptionsAPI.list(), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, email }: { id: number; email: string }) => {
                return {
                    value: String(id),
                    label: `${email}`,
                };
            });
            setSenderOptions(options);
        },
    });

    const emailTempMutation = useMutation((data: EmailTemplateFormvaluesProps) => emailTempAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const emailTempDeleteMutation = useMutation((id: number) => emailTempAPI.delete(id), {
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
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['email-template', pageToSet, limitChange]);
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

    const onCreateEmailTemplate = (data: EmailTemplateFormvaluesProps, actions: FormikHelpers<EmailTemplateFormvaluesProps>) => {
        emailTempMutation.mutate(data, {
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
                        title: `Congrats! Email Template ${rowId ? 'Updated' : 'Created'}`,
                        message: !rowId
                            ? data.data.message ?? 'Email template created successfully'
                            : data.data.message ?? 'Email template updated successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['email-template', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['email-template', page, limitChange], () => emailTempAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!emailTempDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!emailTempMutation.isLoading) {
            setEmailTempFormData({ ...initialFormData });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: EmailTemplateResult) => {
        setEmailTempFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: EmailTemplateResult) => {
        return {
            id: value?.id,
            name: value?.name,
            content: value?.content,
            subject: value?.subject,
            sender: _.isNull(value?.sender) ? undefined : String(value?.sender?.id),
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_emailtemplate')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Email Template">
                {(is_superuser || user_permissions?.includes('add_emailtemplate')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <EmailTemplateTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={emailTempDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => emailTempDeleteMutation.mutate(Number(rowId))}
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
                initialValues={emailTempFormData}
                validationSchema={Yup.object().shape({
                    name: stringValidate,
                    content: stringValidate,
                    subject: stringValidate,
                })}
                onSubmit={(values, actions) => {
                    const dataToSend: EmailTemplateFormvaluesProps = {
                        ...values,
                    };
                    if (!values?.sender) delete dataToSend.sender;
                    onCreateEmailTemplate(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!emailTempMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Email Template' : 'Add Email Template'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={emailTempMutation.isLoading}
                        size="xl">
                        <Form>
                            <SelectField
                                name="sender"
                                labelName="Sender"
                                placeHolder="Select sender"
                                options={senderOptions}
                                handleChange={(value) => setFieldValue('sender', value)}
                                icon={<IconSend size={18} stroke={1.75} />}
                                searchable
                                clearable
                            />
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Name"
                                placeHolder="Enter template name"
                                withAsterisk
                            />
                            <InputField
                                name="subject"
                                labelName="Subject"
                                error={errors.subject}
                                touch={touched.subject}
                                placeHolder="Enter subject"
                                withAsterisk
                            />
                            <TextAreaField
                                name="content"
                                error={errors.content}
                                touch={touched.content}
                                labelName="Content"
                                withAsterisk
                                autoComplete="off"
                                height={400}
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
        </>
    );
};

export default EmailTemplate;
