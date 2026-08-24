import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, CurrencyResult, currencySchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import CurrencyTable from './CurrencyTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.locale?.currency;

const initialFormData: CurrencyResult = {
    code: '',
    name: '',
    current_value: '',
    minor: '',
    symbol: '',
    is_active: false,
    is_default: false,
    enable_currency_configuration: false,
};

const CurrencyList = () => {
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

    const [currencyFormData, setCurrencyFormData] = useState<CurrencyResult>({
        ...initialFormData,
    });

    const currencyAPI = new CipherAPI(urlsPath?.path);
    const currencyMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['currency', page, limitChange], () =>
        currencyAPI.list({ search: query, page, page_size: limitChange })
    );

    const currencyMutation = useMutation((data: CurrencyResult) => currencyAPI.store(data, String(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const currencyMultiDeleteMutation = useMutation((checkedIds: string[]) => currencyMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Currency Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['currency', pageToSet, limitChange]);
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

    const currencyDeleteMutation = useMutation((id: string) => currencyAPI.delete(id), {
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
                    title: 'Congrats! Currency Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['currency', pageToSet, limitChange]);
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

    const onCreateCurrency = (data: CurrencyResult, actions: FormikHelpers<CurrencyResult>) => {
        currencyMutation.mutate(data, {
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
                        title: `Congrats! Currency ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Currency updated successfully' : data.data.message ?? 'Currency created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['currency', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, name, code },
                } = error.response;
                actions.setFieldError('name', name && name[0]);
                actions.setFieldError('code', code && code[0]);
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
        queryClient.prefetchQuery(['currency', page, limitChange], () => currencyAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((curr: CurrencyResult) => curr.code);
            setChecked(checkedRowId);
        }
    };

    const isCheckboxSelect = (id: string) => checked.includes(id);

    const handleSelect = (id: string) => {
        const isChecked = isCheckboxSelect(id);
        if (isChecked) {
            const filterCheckedList = checked.filter((val) => val !== id);
            setChecked(filterCheckedList);
        } else {
            setChecked((prevValue) => [...prevValue, String(id)]);
        }
    };

    const isAllCheckboxSelected = () => {
        const checkedRowId = data?.data?.result.map((curr: CurrencyResult) => curr.code);
        const isAllSelected = checkedRowId.every((id: string) => checked.includes(id));
        return isAllSelected;
    };

    const handleSingleDelete = (id: string) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!currencyDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!currencyMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!currencyMutation.isLoading) {
            setFormModal(false);
            setRowId('');
            setCurrencyFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
    };

    const handleFormModalEdit = (object: CurrencyResult) => {
        setCurrencyFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.code);
    };

    const mapToViewModal = (value: CurrencyResult) => {
        return {
            code: value?.code,
            name: value?.name,
            current_value: Number(value?.current_value),
            minor: value?.minor,
            symbol: value?.symbol,
            is_active: value?.is_active,
            is_default: value?.is_default,
            enable_currency_configuration: value?.enable_currency_configuration,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_currency')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Currency">
                {(is_superuser || user_permissions?.includes('add_currency')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <CurrencyTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={currencyDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={currencyMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => currencyDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => currencyMultiDeleteMutation.mutate(checked)}
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
                initialValues={currencyFormData}
                validationSchema={currencySchema}
                onSubmit={(values, actions) => {
                    onCreateCurrency(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!currencyMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Currency' : 'Add Currency'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={currencyMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Currency Name"
                                placeHolder="e.g. Rupees/Dollor/Pound Sterling"
                                withAsterisk
                            />
                            <InputField
                                name="code"
                                error={errors.code}
                                touch={touched.code}
                                labelName="Currency Code"
                                placeHolder="e.g. USD/NPR/GBP"
                                withAsterisk
                            />
                            <InputField
                                name="current_value"
                                error={errors.current_value}
                                touch={touched.current_value}
                                labelName="Current Value"
                                placeHolder="e.g. 126.25"
                                withAsterisk
                            />
                            <InputField
                                name="minor"
                                error={errors.minor}
                                touch={touched.minor}
                                labelName="Minor"
                                placeHolder="e.g. 1/100"
                                withAsterisk
                            />
                            <InputField name="symbol" error={errors.symbol} touch={touched.symbol} labelName="Symbol" placeHolder="e.g. $/£/€" />
                            <SwitchCheckbox
                                name="enable_currency_configuration"
                                checked={values.enable_currency_configuration}
                                onChange={(e) => setFieldValue('enable_currency_configuration', e.currentTarget.checked)}
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

export default CurrencyList;
