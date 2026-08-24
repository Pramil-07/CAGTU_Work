import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SelectField, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { actionOptions, CipherUserContext, getPageLimit, rewardsModelOptions, RewardsRuleResult, rewardsRuleSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import RewardsRuleTable from './RewardsRuleTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.rewards?.rule;

const initialFormData: RewardsRuleResult = {
    id: null,
    model: '',
    action: '',
    reward_points: '',
    // reward_percentage: '',
    is_active: false,
};

const RewardsRule = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [rewardsRuleFormData, setRewardsRuleFormData] = useState<RewardsRuleResult>({
        ...initialFormData,
    });

    const rewardsRuleAPI = new CipherAPI(urlsPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['rewards-rule', page, limitChange], () =>
        rewardsRuleAPI.list({ search: query, page, page_size: limitChange })
    );

    const rewardsRuleMutation = useMutation((data: RewardsRuleResult) => rewardsRuleAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const rewardsRuleDeleteMutation = useMutation((id: string) => rewardsRuleAPI.delete(id), {
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
                    message: data.data?.message ?? 'Rewards rule deleted succefully.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['rewards-rule', pageToSet, limitChange]);
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

    const onCreateRewardsRule = (data: any, actions: FormikHelpers<RewardsRuleResult>) => {
        rewardsRuleMutation.mutate(data, {
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
                        title: `Congrats! Rewards Rule ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? 'Rewards rule updated successfully.' : data.data.message ?? 'Rewards rule created successfully.',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['rewards-rule', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['rewards-rule', page, limitChange], () => rewardsRuleAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!rewardsRuleDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleFormClose = () => {
        if (!rewardsRuleMutation.isLoading) {
            setRewardsRuleFormData({
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

    const handleFormModalEdit = (object: RewardsRuleResult) => {
        setRewardsRuleFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: RewardsRuleResult) => {
        return {
            id: value?.id,
            model: value?.type as unknown as string,
            action: value?.action,
            reward_points: value?.reward_points ?? null,
            // reward_percentage: value?.reward_percentage ?? null,
            is_active: value?.is_active,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_rewardrule')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Rewards Rule">
                {(is_superuser || user_permissions?.includes('add_rewardrule')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <RewardsRuleTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isSingleDeleteMutationLoading={rewardsRuleDeleteMutation.isLoading}
                    handleSingleDelete={handleSingleDelete}
                    onSetPage={setPage}
                    onConfirmSingleDelete={() => rewardsRuleDeleteMutation.mutate(String(rowId))}
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
                initialValues={rewardsRuleFormData}
                validationSchema={rewardsRuleSchema}
                onSubmit={(values, actions) => {
                    const datasend: RewardsRuleResult = {
                        ...values,
                        reward_points: values?.reward_points ? Number(values?.reward_points) : null,
                        // reward_percentage: values?.reward_percentage ? Number(values?.reward_percentage) : null,
                    };
                    onCreateRewardsRule(datasend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!rewardsRuleMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Rule' : 'Add Rule'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={rewardsRuleMutation.isLoading}>
                        <Form>
                            <SelectField
                                name="model"
                                labelName="Model"
                                placeHolder="Select model"
                                error={errors.model}
                                touch={touched.model}
                                options={rewardsModelOptions}
                                handleChange={(value) => {
                                    setFieldValue('model', value);
                                }}
                                clearable
                                withAsterisk
                            />
                            <SelectField
                                name="action"
                                labelName="Action"
                                placeHolder="Select action"
                                error={errors.action}
                                touch={touched.action}
                                options={actionOptions}
                                handleChange={(value) => {
                                    setFieldValue('action', value);
                                }}
                                clearable
                                withAsterisk
                            />
                            {/* {!values?.reward_percentage && ( */}
                            <InputField
                                name="reward_points"
                                error={errors.reward_points}
                                touch={touched.reward_points}
                                labelName="Reward Points"
                                placeHolder="e.g: 215468"
                                withAsterisk
                            />
                            {/* )} */}
                            {/* {!values?.reward_points && (
                                <InputField
                                    name="reward_percentage"
                                    labelName="Reward Percent"
                                    value={undefined}
                                    error={errors.reward_percentage}
                                    touch={touched.reward_percentage}
                                    placeHolder="Enter rewards percent"
                                    withAsterisk
                                />
                            )} */}
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

export default RewardsRule;
