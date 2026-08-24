import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SelectInputField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, ExchangeRateFormValueProps, ExchangeRateResult, exchangeRateSchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import ExchangeRateTable from './ExchangeRateTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.locale?.exchangeRate;

const initialFormData: ExchangeRateFormValueProps = {
    id: null,
    value: '',
    currency: '',
    status: 'Pending',
    is_active: false,
    is_default: false,
    enable_currency_configuration: false,
};

const ExchangeRateList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [exchangeRateFormData, setExchangeRateFormData] = useState<ExchangeRateFormValueProps>({
        ...initialFormData,
    });

    const exchangeRateAPI = new CipherAPI(urlsPath?.path);
    const exchangeRateMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);
    const currencyOptionsAPI = new CipherAPI(urls?.cipher?.locale?.currency?.options);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['exchange-rate', page, limitChange], () =>
        exchangeRateAPI.list({ search: query, page, page_size: limitChange })
    );

    const exchangeRateMutation = useMutation((data: ExchangeRateFormValueProps) => exchangeRateAPI.store(data, Number(rowId)));

    // Fetch the cuurency list from the API
    useQuery(['currency-options'], () => currencyOptionsAPI.list(), {
        onSuccess: (data) => {
            const currencyOptions = data?.data.map(({ name, code }: { name: string; code: string }) => {
                return {
                    value: String(code),
                    label: name,
                };
            });
            setCurrencyOptions(currencyOptions);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const exchangeRateMultiDeleteMutation = useMutation((checkedIds: string[]) => exchangeRateMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Exchange Rate Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['exchange-rate', pageToSet, limitChange]);
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

    const exchangeRateDeleteMutation = useMutation((id: number) => exchangeRateAPI.delete(id), {
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
                    title: 'Congrats! Exchange Rate Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['exchange-rate', pageToSet, limitChange]);
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

    const onCreateExchangeRate = (data: ExchangeRateFormValueProps, actions: FormikHelpers<ExchangeRateFormValueProps>) => {
        exchangeRateMutation.mutate(data, {
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
                        title: `Congrats! Exchange Rate ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Exchange rate updated successfully'
                            : data.data.message ?? 'Exchange rate created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['exchange-rate', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['exchange-rate', page, limitChange], () => exchangeRateAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((exr: ExchangeRateResult) => String(exr.id));
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
        const checkedRowId = data?.data?.result.map((exr: ExchangeRateResult) => String(exr.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!exchangeRateDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!exchangeRateMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!exchangeRateMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setExchangeRateFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: ExchangeRateResult) => {
        setExchangeRateFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: ExchangeRateResult) => {
        return {
            id: null,
            value: Number(value?.value),
            currency: String(value?.currency?.code),
            is_active: value?.is_active,
            is_default: value?.is_default,
            enable_currency_configuration: value?.enable_currency_configuration,
            status: 'Pending',
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_exchangerate')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Exchange Rate">
                {(is_superuser || user_permissions?.includes('add_exchangerate')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <ExchangeRateTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={exchangeRateDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={exchangeRateMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => exchangeRateDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => exchangeRateMultiDeleteMutation.mutate(checked)}
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
                initialValues={exchangeRateFormData}
                validationSchema={exchangeRateSchema}
                onSubmit={(values, actions) => {
                    onCreateExchangeRate(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!exchangeRateMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Exchange Rate' : 'Add Exchange Rate'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={exchangeRateMutation.isLoading}>
                        <Form>
                            <SelectInputField
                                name="currency"
                                labelName="Currency"
                                placeHolder="e.g. Nepal/USA/Australia"
                                error={errors.currency}
                                touch={touched.currency}
                                options={currencyOptions}
                                handleChange={(value) => {
                                    setFieldValue('currency', value);
                                }}
                                searchable
                                clearable
                                withAsterisk
                            />
                            <InputField
                                name="value"
                                error={errors.value}
                                touch={touched.value}
                                labelName="Current Value"
                                placeHolder="e.g. 126.25"
                                withAsterisk
                            />
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

export default ExchangeRateList;
