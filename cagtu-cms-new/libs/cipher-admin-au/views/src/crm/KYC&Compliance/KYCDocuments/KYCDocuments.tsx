import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import KYCDocumentListTable from './KYCDocumentListTable';
import { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CipherUserContext, KycDocumentFormValuesProps, KycDocumentResult, getPageLimit, kycDocumentSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Form, Formik, FormikHelpers } from 'formik';
import _ from 'lodash';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import BlockedPageMessage from '../../../components/common/BlockedPageMessage';

const kycDocumentPath = urls.cipher.kyc;
const initialFormData: KycDocumentFormValuesProps = {
    name: '',
    required_for_merchant: '',
    required_for_user: '',
};
const KYCDocuments = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>();
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [kycDocumentFormData, setKycDocumentFormData] = useState<KycDocumentFormValuesProps>({
        ...initialFormData,
    });

    //Query for getting kyc document list
    const KYCDocumentAPI = new CipherAPI(kycDocumentPath?.path);
    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['kyc-document', page, limitChange], () =>
        KYCDocumentAPI.list({ search: query, page: page, page_size: limitChange })
    );

    //KYC Add and edit Mutation Query
    const kycMutation = useMutation((data: FormData) => KYCDocumentAPI.store(data, rowId));
    const onKycAdd = (values: FormData, action: FormikHelpers<KycDocumentFormValuesProps>) => {
        kycMutation.mutate(values, {
            onSuccess(data) {
                showNotification({
                    title: `Congrats! Service ${rowId ? 'Updated' : 'Created'}`,
                    message: rowId
                        ? data.data.message ?? 'KYC document updated successfully'
                        : data.data.message ?? 'KYC document created successfully',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.prefetchQuery(['kyc-document', page, limitChange, query]);
                handleFormModalClose();
                action.resetForm();
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
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

    //KYC document Delete Mutation Query
    const kycDeleteMutation = useMutation((id: string) => KYCDocumentAPI.delete(id), {
        onSuccess: (data) => {
            showNotification({
                title: 'Congrats! KYC Document Deleted',
                message: data.data?.message,
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            queryClient.prefetchQuery(['kyc-document', page, limitChange, query]);
            handleDeleteModalClose();
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

    const handleFormModalOpen = () => {
        setFormModal(true);
        setKycDocumentFormData(initialFormData);
        setRowId('');
    };

    const handleFormModalClose = () => {
        setFormModal(false);
        setKycDocumentFormData(initialFormData);
        setRowId('');
    };

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['kyc-document', page, limitChange], () => KYCDocumentAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleFormModalEdit = (object: KycDocumentResult) => {
        setKycDocumentFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const handleDeleteModalOpen = (id: string) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleDeleteModalClose = () => {
        setDeleteModal(false);
        setRowId('');
    };

    const mapToViewModal = (value: KycDocumentResult) => {
        return {
            name: value?.name ?? '',
            required_for_merchant: value?.required_for_merchant ?? '',
            required_for_user: value?.required_for_user ?? '',
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_documenttype')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="KYC Documents">
                {(is_superuser || user_permissions?.includes('add_documenttype')) && <Button onClick={handleFormModalOpen} name="Create" />}
            </PageHeader>
            <PaperBox>
                <KYCDocumentListTable
                    data={data?.data?.result}
                    page={page}
                    query={query}
                    isFetching={isFetching}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    isDeleteModalOpened={deleteModal}
                    handleSingleDelete={handleDeleteModalOpen}
                    isSingleDeleteMutationLoading={kycDeleteMutation.isLoading}
                    onConfirmSingleDelete={() => kycDeleteMutation.mutate(String(rowId))}
                    handleSingleDeleteCloseModal={handleDeleteModalClose}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={kycDocumentFormData}
                validationSchema={kycDocumentSchema}
                onSubmit={(values, actions) => {
                    const formData = new FormData();
                    _.forIn(values, function (value, key) {
                        formData.append(key, value as string);
                    });
                    onKycAdd(formData, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        loading={kycMutation.isLoading}
                        opened={formModal}
                        onClose={() => {
                            handleFormModalClose();
                            handleReset();
                        }}
                        title={`${rowId ? 'Edit KYC Document Type' : 'Add KYC Document Type'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        size="md">
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Document Type"
                                placeHolder="Enter document type"
                                onChange={(e) => {
                                    setFieldValue('name', e.target.value);
                                }}
                                withAsterisk
                            />
                            <SwitchCheckbox
                                name="required_for_merchant"
                                checked={Boolean(values.required_for_merchant)}
                                onChange={(e) => setFieldValue('required_for_merchant', e.currentTarget.checked)}
                                labelName="Required for Merchant ?"
                                mb={15}
                            />
                            <SwitchCheckbox
                                name="required_for_user"
                                checked={Boolean(values.required_for_user)}
                                onChange={(e) => setFieldValue('required_for_user', e.currentTarget.checked)}
                                labelName="Required for User ?"
                                mb={15}
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default KYCDocuments;
