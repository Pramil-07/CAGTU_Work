import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SelectInputField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, CountryFormValueProps, CountryResult, countrySchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import CountryTable from './CountryTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.locale?.country;

const initialFormData: CountryFormValueProps = {
    code: '',
    name: '',
    local_name: '',
    phone_code: '',
    currency: '',
    language: '',
    is_active: true,
};

const CountryList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);
    const [languageOptions, setLanguageOptions] = useState<{ value: string; label: string }[]>([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [countryFormData, setCountryFormData] = useState<CountryFormValueProps>({
        ...initialFormData,
    });

    const countryAPI = new CipherAPI(urlsPath?.path);
    const currencyOptionsAPI = new CipherAPI(urls?.cipher?.locale?.currency?.options);
    const languageOptionsAPI = new CipherAPI(urls?.cipher?.locale?.language?.options);
    const countryMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['countries', page, limitChange], () =>
        countryAPI.list({ search: query, page, page_size: limitChange })
    );

    const countryMutation = useMutation((data: CountryFormValueProps) => countryAPI.store(data, String(rowId)));

    // Fetch the cuurency list from the API
    useQuery(['currency-options'], () => currencyOptionsAPI.list(), {
        onSuccess: (data) => {
            const currencyOptions = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setCurrencyOptions(currencyOptions);
        },
    });

    // Fetch the language list from the API
    useQuery(['language-options'], () => languageOptionsAPI.list(), {
        onSuccess: (data) => {
            const languageOptions = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setLanguageOptions(languageOptions);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const countryMultiDeleteMutation = useMutation((checkedIds: string[]) => countryMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Country Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['countries', pageToSet, limitChange]);
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

    const countryDeleteMutation = useMutation((id: number) => countryAPI.delete(id), {
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
                    title: 'Congrats! Country Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['countries', pageToSet, limitChange]);
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

    const onCreateCountry = (data: CountryFormValueProps, actions: FormikHelpers<CountryFormValueProps>) => {
        countryMutation.mutate(data, {
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
                        title: `Congrats! Country ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Country updated successfully' : data.data.message ?? 'Country created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['countries', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, name, iso_code, phone_code },
                } = error.response;
                actions.setFieldError('name', name && name[0]);
                actions.setFieldError('iso_code', iso_code && iso_code[0]);
                actions.setFieldError('phone_code', phone_code && phone_code[0]);
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
        queryClient.prefetchQuery(['countries', page, limitChange], () => countryAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((coun: CountryResult) => coun.code);
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
        const checkedRowId = data?.data?.result.map((coun: CountryResult) => coun.code);
        const isAllSelected = checkedRowId.every((code: string) => checked.includes(code));
        return isAllSelected;
    };

    const handleSingleDelete = (code: string) => {
        setDeleteModal(true);
        setRowId(code);
    };

    const handleCloseModal = () => {
        if (!countryDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!countryMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!countryMutation.isLoading) {
            setFormModal(false);
            setRowId('');
            setCountryFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
    };

    const handleFormModalEdit = (object: CountryResult) => {
        setCountryFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.code);
    };

    const mapToViewModal = (value: CountryResult) => {
        return {
            code: value.code,
            name: value.name,
            local_name: value.local_name,
            phone_code: value.phone_code,
            currency: value.currency.code,
            language: value.language.code,
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_country')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Country">
                {(is_superuser || user_permissions?.includes('add_country')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <CountryTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={countryDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={countryMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => countryDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => countryMultiDeleteMutation.mutate(checked)}
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
                initialValues={countryFormData}
                validationSchema={countrySchema}
                onSubmit={(values, actions) => {
                    onCreateCountry(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!countryMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Country' : 'Add Country'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={countryMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Country Name"
                                placeHolder="e.g. Nepal/Australia/China/"
                                withAsterisk
                            />
                            <InputField
                                name="local_name"
                                error={errors.local_name}
                                touch={touched.local_name}
                                labelName="Country Local Name"
                                placeHolder="e.g. Albania/Algeria/Andora"
                                withAsterisk
                            />
                            <InputField
                                name="code"
                                error={errors.code}
                                touch={touched.code}
                                labelName="Country ISO Code"
                                placeHolder="e.g. AS/DZ/AD"
                                withAsterisk
                            />
                            <InputField
                                name="phone_code"
                                error={errors.phone_code}
                                touch={touched.phone_code}
                                labelName="Country Phone Code"
                                placeHolder="e.g. 1684/213/376"
                                withAsterisk
                            />
                            <SelectInputField
                                name="currency"
                                labelName="Currency"
                                placeHolder="e.g. Australian Dollars/US Dollars/Pound Strelling"
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
                            <SelectInputField
                                name="language"
                                labelName="Language"
                                placeHolder="e.g. English/French/Japanese"
                                error={errors.language}
                                touch={touched.language}
                                options={languageOptions}
                                handleChange={(value) => {
                                    setFieldValue('language', value);
                                }}
                                searchable
                                clearable
                                withAsterisk
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

export default CountryList;
