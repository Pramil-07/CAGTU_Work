import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox, TextAreaField } from '@cagtu-cms/ui-shared';
import { CipherUserContext, OfferRuleResult, getPageLimit, offerRuleSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import OfferRuleTable from './OfferRuleTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.offer?.rule;

const initialFormData: OfferRuleResult = {
    id: null,
    title: '',
    description: '',
    has_discount: false,
    has_free_items: false,
    has_quantity: false,
    is_active: false,
};

const OfferRule = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [offerRuleFormData, setOfferRuleFormData] = useState<OfferRuleResult>({
        ...initialFormData,
    });

    const offerRuleAPI = new CipherAPI(urlsPath?.path);
    const offerRuleMultipleDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['offer-rule', page, limitChange], () =>
        offerRuleAPI.list({ search: query, page, page_size: limitChange })
    );

    const offerRuleMutation = useMutation((data: OfferRuleResult) => offerRuleAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const offerRuleMultiDeleteMutation = useMutation((checkedIds: string[]) => offerRuleMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats!',
                    message: data.data?.message ?? 'Offer rule deleted succefully.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['offer-rule', pageToSet, limitChange]);
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

    const offerRuleDeleteMutation = useMutation((id: string) => offerRuleAPI.delete(id), {
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
                    message: data.data?.message ?? 'Offer rule deleted succefully.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['offer-rule', pageToSet, limitChange]);
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

    const onCreateOfferRule = (data: any, actions: FormikHelpers<OfferRuleResult>) => {
        offerRuleMutation.mutate(data, {
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
                        title: `Congrats! Offer Rule ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? 'Offer rule updated successfully.' : data.data.message ?? 'Offer rule created successfully.',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['offer-rule', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['offer-rule', page, limitChange], () => offerRuleAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((offerRule: OfferRuleResult) => String(offerRule.id));
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
        const checkedRowId = data?.data?.result.map((offerRule: OfferRuleResult) => String(offerRule.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!offerRuleDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!offerRuleMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!offerRuleMutation.isLoading) {
            setOfferRuleFormData({
                ...initialFormData,
            });
            setRowId(null);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: OfferRuleResult) => {
        setOfferRuleFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: OfferRuleResult) => {
        return {
            id: value?.id,
            title: value?.title,
            description: value?.description,
            has_discount: value?.has_discount,
            has_free_items: value?.has_free_items,
            has_quantity: value?.has_quantity,
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_offerrule')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Offer Rule">
                {(is_superuser || user_permissions?.includes('add_offerrule')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <OfferRuleTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={offerRuleDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={offerRuleMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => offerRuleDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => offerRuleMultiDeleteMutation.mutate(checked)}
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
                initialValues={offerRuleFormData}
                validationSchema={offerRuleSchema}
                onSubmit={(values, actions) => {
                    onCreateOfferRule(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!offerRuleMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Offer Rule' : 'Add Offer Rule'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={offerRuleMutation.isLoading}>
                        <Form>
                            <InputField
                                name="title"
                                error={errors.title}
                                touch={touched.title}
                                labelName="Title"
                                placeHolder="Enter title"
                                withAsterisk
                            />
                            <TextAreaField
                                name="description"
                                labelName="Description"
                                placeHolder="Enter the description"
                                error={errors.description}
                                touch={touched.description}
                                withAsterisk
                            />
                            <SwitchCheckbox
                                name="has_discount"
                                checked={values.has_discount}
                                onChange={(e) => setFieldValue('has_discount', e.currentTarget.checked)}
                                labelName="Has Discount"
                                mb={15}
                            />
                            <SwitchCheckbox
                                name="has_free_items"
                                checked={values.has_free_items}
                                onChange={(e) => setFieldValue('has_free_items', e.currentTarget.checked)}
                                labelName="Has Free Items"
                                mb={15}
                            />
                            <SwitchCheckbox
                                name="has_quantity"
                                checked={values.has_quantity}
                                onChange={(e) => setFieldValue('has_quantity', e.currentTarget.checked)}
                                labelName="Has Quantity"
                                mb={15}
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

export default OfferRule;
