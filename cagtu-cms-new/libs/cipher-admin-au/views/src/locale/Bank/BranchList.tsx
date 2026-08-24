import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, FormModal, InputField, PaperBox, SelectInputField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { BranchFormValuesProps, BranchResult, CipherUserContext, branchSchema, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import BranchTable from './BranchTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.locale?.bankBranch;

const initialFormData: BranchFormValuesProps = {
    id: null,
    name: '',
    bank: '',
    is_active: false,
};

const BranchList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [bankOptions, setBankOptions] = useState<{ value: string; label: string }[]>([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [branchFormData, setBranchFormData] = useState<BranchFormValuesProps>({
        ...initialFormData,
    });

    const branchAPI = new CipherAPI(urlsPath?.path);
    const bankOptionsAPI = new CipherAPI(urls?.cipher?.locale?.bank?.options);
    const branchMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['branches', page, limitChange], () =>
        branchAPI.list({ search: query, page, page_size: limitChange })
    );
    const branchMutation = useMutation((data: BranchFormValuesProps) => branchAPI.store(data, Number(rowId)));

    // Fetch the cuurency list from the API
    useQuery(['bank-options'], () => bankOptionsAPI.list(), {
        onSuccess: (data) => {
            const bankOptions = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: name,
                };
            });
            setBankOptions(bankOptions);
        },
    });

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const branchMultiDeleteMutation = useMutation((checkedIds: string[]) => branchMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Branch Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['branches', pageToSet, limitChange]);
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

    const branchDeleteMutation = useMutation((id: number) => branchAPI.delete(id), {
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
                    title: 'Congrats! Branch Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['branches', pageToSet, limitChange]);
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

    const onCreateBranch = (data: BranchFormValuesProps, actions: FormikHelpers<BranchFormValuesProps>) => {
        branchMutation.mutate(data, {
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
                        title: `Congrats! Branch ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'Branch updated successfully' : data.data.message ?? 'Branch created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['branches', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['branches', page, limitChange], () => branchAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((branch: BranchResult) => String(branch.id));
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
        const checkedRowId = data?.data?.result.map((branch: BranchResult) => String(branch.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!branchDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!branchMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!branchMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setBranchFormData({
                ...initialFormData,
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: BranchResult) => {
        setBranchFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: BranchResult) => {
        return {
            id: value?.id,
            name: value?.name,
            bank: String(value.bank.id),
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_bankbranch')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PaperBox>
                <BranchTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={branchDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={branchMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => branchDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => branchMultiDeleteMutation.mutate(checked)}
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
                initialValues={branchFormData}
                validationSchema={branchSchema}
                onSubmit={(values, actions) => {
                    onCreateBranch(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!branchMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Branch' : 'Add Branch'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={branchMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Branch Name"
                                placeHolder="e.g. Gwarko/Kamaladi"
                                withAsterisk
                            />
                            <SelectInputField
                                name="bank"
                                labelName="Bank"
                                placeHolder="e.g. Nabil/BOK/NMB"
                                error={errors.bank}
                                touch={touched.bank}
                                options={bankOptions}
                                handleChange={(value) => {
                                    setFieldValue('bank', value);
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

export default BranchList;
