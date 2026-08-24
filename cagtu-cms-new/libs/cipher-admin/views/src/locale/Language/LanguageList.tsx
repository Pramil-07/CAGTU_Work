import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, LanguageResult, getPageLimit, languageSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import LanguageTable from './LanguageTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.locale?.language;

const initialFormData: LanguageResult = {
    code: '',
    name: '',
    is_active: false,
    is_default: false,
    enable_language_configuration: false,
};

const LanguageList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [languageFormData, setLanguageFormData] = useState<LanguageResult>({
        ...initialFormData,
    });

    const languageAPI = new CipherAPI(urlsPath?.path);
    const languageMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['language', page, limitChange], () =>
        languageAPI.list({ search: query, page, page_size: limitChange })
    );

    const languageMutation = useMutation((data: LanguageResult) => languageAPI.store(data, String(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const languageMultiDeleteMutation = useMutation((checkedIds: string[]) => languageMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Language Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['language', pageToSet, limitChange]);
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

    const languageDeleteMutation = useMutation((code: string) => languageAPI.delete(code), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setDeleteModal(false);
                setRowId('');
                showNotification({
                    title: 'Congrats! Language Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['language', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setDeleteModal(false);
            setRowId('');
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onCreateCurrency = (data: LanguageResult, actions: FormikHelpers<LanguageResult>) => {
        languageMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    actions.resetForm();
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: `Congrats! Language ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Language updated successfully' : data.data.message ?? 'Language created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['language', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, code, name },
                } = error.response;
                actions.setFieldError('code', code && code[0]);
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
        queryClient.prefetchQuery(['language', page, limitChange], () => languageAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((lan: LanguageResult) => String(lan.code));
            setChecked(checkedRowId);
        }
    };

    const isCheckboxSelect = (code: string) => checked.includes(code);

    const handleSelect = (code: string) => {
        const isChecked = isCheckboxSelect(code);
        if (isChecked) {
            const filterCheckedList = checked.filter((val) => val !== code);
            setChecked(filterCheckedList);
        } else {
            setChecked((prevValue) => [...prevValue, code]);
        }
    };

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.result.map((lan: LanguageResult) => String(lan.code));
        const isAllSelected = checkedRowId.every((code: string) => checked.includes(String(code)));
        return isAllSelected;
    };

    const handleSingleDelete = (code: string) => {
        setDeleteModal(true);
        setRowId(code);
    };

    const handleCloseModal = () => {
        if (!languageDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!languageMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!languageMutation.isLoading) {
            setFormModal(false);
            setRowId('');
            setLanguageFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
    };

    const handleFormModalEdit = (object: LanguageResult) => {
        setLanguageFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.code);
    };

    const mapToViewModal = (value: LanguageResult) => {
        return {
            code: value?.code,
            name: value?.name,
            is_active: value?.is_active,
            is_default: value?.is_default,
            enable_language_configuration: value?.enable_language_configuration,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_language')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Language">
                {(is_superuser || user_permissions?.includes('add_language')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <LanguageTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={languageDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={languageMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => languageDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => languageMultiDeleteMutation.mutate(checked)}
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
                initialValues={languageFormData}
                validationSchema={languageSchema}
                onSubmit={(values, actions) => {
                    onCreateCurrency(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!languageMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Language' : 'Add Language'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={languageMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Language Name"
                                placeHolder="e.g. English/Japanese/Nepali"
                                withAsterisk
                            />
                            <InputField
                                name="code"
                                error={errors.code}
                                touch={touched.code}
                                labelName="Language Code"
                                placeHolder="e.g. EN/DE/JA"
                                withAsterisk
                            />
                            <SwitchCheckbox
                                name="enable_language_configuration"
                                checked={values.enable_language_configuration}
                                onChange={(e) => setFieldValue('enable_language_configuration', e.currentTarget.checked)}
                                labelName="Enable Configuration"
                                mb={15}
                            />
                            <SwitchCheckbox
                                name="is_default"
                                checked={values.is_default}
                                onChange={(e) => setFieldValue('is_default', e.currentTarget.checked)}
                                labelName="Is Default?"
                                mb={15}
                            />
                            <SwitchCheckbox
                                name="is_active"
                                checked={values.is_active}
                                onChange={(e) => setFieldValue('is_active', e.currentTarget.checked)}
                                labelName="Is Active?"
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default LanguageList;
