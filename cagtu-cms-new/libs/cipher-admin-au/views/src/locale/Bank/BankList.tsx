import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, FormModal, InputField, PaperBox, ProfileImageField, SelectInputField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { BankFormValuesProps, BankResult, CipherUserContext, bankSchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import BankTable from './BankTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.locale?.bank;

const initialFormData: BankFormValuesProps = {
    id: null,
    name: '',
    swift_code: '',
    country: '',
    is_active: false,
    logo: [],
    profilePreviewUrl: [],
};

const BankList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [bankFormData, setBankFormData] = useState<BankFormValuesProps>({
        ...initialFormData,
    });

    const formData: FormData = new FormData();

    const bankAPI = new CipherAPI(urlsPath?.path);
    const countryOptionsAPI = new CipherAPI(urls?.cipher?.locale?.country?.options);
    const bankMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['banks', page, limitChange], () =>
        bankAPI.list({ search: query, page, page_size: limitChange })
    );
    const bankMutation = useMutation((data: FormData) => bankAPI.store(data, Number(rowId)));

    // Fetch the country list from the API
    useQuery(['country-options'], () => countryOptionsAPI.list(), {
        onSuccess: (data) => {
            const countryOptions = data?.data.map(({ code, name }: { code: string; name: string }) => {
                return {
                    value: code,
                    label: name,
                };
            });
            setCountryOptions(countryOptions);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const bankMultiDeleteMutation = useMutation((checkedIds: string[]) => bankMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Bank Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['banks', pageToSet, limitChange]);
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

    const bankDeleteMutation = useMutation((id: number) => bankAPI.delete(id), {
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
                    title: 'Congrats! Bank Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['banks', pageToSet, limitChange]);
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

    const onCreateBank = (formData: FormData, actions: FormikHelpers<BankFormValuesProps>, values: BankFormValuesProps) => {
        bankMutation.mutate(formData, {
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
                    delete values?.profilePreviewUrl;
                    actions.resetForm();
                    setFormModal(false);
                    setRowId(null);
                    showNotification({
                        title: `Congrats! Bank ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Bank updated successfully' : data.data.message ?? 'Bank created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['banks', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['banks', page, limitChange], () => bankAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((bank: BankResult) => String(bank.id));
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
        const checkedRowId = data?.data?.result.map((bank: BankResult) => String(bank.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!bankDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!bankMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!bankMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setBankFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const formDataValues = (values: BankFormValuesProps) => {
        formData.append('name', values?.name);
        formData.append('swift_code', values?.swift_code);
        formData.append('country', values?.country);
        formData.append('is_active', String(values?.is_active));

        if (values.logo[0]?.name) {
            values.logo.forEach((file) => formData.append('logo', file));
        }
    };

    const handleFormModalEdit = (object: BankResult) => {
        setBankFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: BankResult) => {
        return {
            id: value?.id,
            name: value?.name,
            swift_code: value?.swift_code,
            country: value.country.code,
            logo: value?.logo,
            profilePreviewUrl: [{ src: value.logo }],
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_bank')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                <BankTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={bankDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={bankMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => bankDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => bankMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    handleFormModal={handleFormModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={bankFormData}
                validationSchema={bankSchema}
                onSubmit={(values, actions) => {
                    formDataValues(values);
                    onCreateBank(formData, actions, values);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!bankMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Bank' : 'Add Bank'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={bankMutation.isLoading}>
                        <Form>
                            <ProfileImageField
                                labelName="Bank Logo"
                                name="logo"
                                profileImageData={values.profilePreviewUrl}
                                error={errors.logo as string}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                                withAsterisk
                            />
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Bank Name"
                                placeHolder="e.g. Nabil Bank"
                                withAsterisk
                            />
                            <InputField
                                name="swift_code"
                                error={errors.swift_code}
                                touch={touched.swift_code}
                                labelName="Swift Code"
                                placeHolder="e.g. NRBANPKA"
                                withAsterisk
                            />
                            <SelectInputField
                                name="country"
                                labelName="Country"
                                placeHolder="e.g. Nepal/USA/Australia"
                                error={errors.country}
                                touch={touched.country}
                                options={countryOptions}
                                handleChange={(value) => {
                                    setFieldValue('country', value);
                                }}
                                searchable
                                clearable
                                withAsterisk
                            />
                            <SwitchCheckbox name="is_active" checked={values.is_active} labelName="Is Active?" mb={15} />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default BankList;
