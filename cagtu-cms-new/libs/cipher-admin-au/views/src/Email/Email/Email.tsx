import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, PasswordInputField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, EmailFormValuesProps, emailPasswordSchema, EmailResult, emailSchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import EmailTable from './EmailTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.email;

const initialFormData: EmailFormValuesProps = {
    id: null,
    type: '',
    username: '',
    email: '',
    password: '',
    is_active: false,
};

const Email = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [emailFormData, setEmailFormData] = useState<EmailFormValuesProps>({ ...initialFormData });

    const emailAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['email', page, limitChange], () =>
        emailAPI.list({ search: query, page, page_size: limitChange })
    );

    const emailMutation = useMutation((data: EmailFormValuesProps) => emailAPI.store({ ...data, status: 'Active' }, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const emailDeleteMutation = useMutation((id: number) => emailAPI.delete(id), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['email', pageToSet, limitChange]);
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

    const onCreateEmail = (data: EmailFormValuesProps, actions: FormikHelpers<EmailFormValuesProps>) => {
        emailMutation.mutate(data, {
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
                        title: `Congrats! Sender Email ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Sender email updated sucessfully!'
                            : data.data.message ?? 'Sender email created sucessfully!',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['email', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['email', page, limitChange], () => emailAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!emailDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!emailMutation.isLoading) {
            setEmailFormData({ ...initialFormData });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: EmailResult) => {
        setEmailFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: EmailResult) => {
        return {
            id: value?.id,
            type: value?.type,
            username: value?.username,
            email: value?.email,
            password: '',
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_senderemail')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Email">
                {(is_superuser || user_permissions?.includes('add_senderemail')) && <Button onClick={handleFormModal} name="New" />}
            </PageHeader>
            <PaperBox>
                <EmailTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={emailDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => emailDeleteMutation.mutate(Number(rowId))}
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
                initialValues={emailFormData}
                validationSchema={!rowId ? emailPasswordSchema : emailSchema}
                onSubmit={(values, actions) => {
                    const dataToSend: EmailFormValuesProps = {
                        ...JSON.parse(JSON.stringify(values)),
                    };
                    if (!values.password) delete dataToSend?.password;
                    onCreateEmail(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!emailMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Email' : 'Add Email'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={emailMutation.isLoading}>
                        <Form>
                            <InputField
                                name="type"
                                error={errors.type}
                                touch={touched.type}
                                labelName="Email Type"
                                placeHolder="e.g. Marketing/Support"
                                withAsterisk
                            />
                            <InputField
                                name="username"
                                error={errors.username}
                                touch={touched.username}
                                labelName="Username"
                                placeHolder="e.g. vishalhapa"
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
                            {!rowId && (
                                <PasswordInputField
                                    name="password"
                                    error={errors.password}
                                    touch={touched.password}
                                    labelName="Password"
                                    placeHolder="XXXXXXXXXXXX"
                                    withAsterisk
                                />
                            )}
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

export default Email;
