import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import { BreadcrumbItems, HelpTopicResult, getPageLimit, stringValidate, useDataLimit } from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import HelpTopicTable from './HelpTopicTable';
import * as Yup from 'yup';
import { IconCheck, IconX } from '@tabler/icons';

const urlsPath = urls?.cipher?.support?.help?.topic;

const initialFormData: HelpTopicResult = {
    id: null,
    topic: '',
    is_active: false,
};

const HelpTopic = () => {
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [helpTopicFormData, setHelpTopicFormData] = useState<HelpTopicResult>({
        ...initialFormData,
    });

    const helpTopicAPI = new CipherAPI(urlsPath?.path);
    const helpTopicMultipleDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);

    const { isLoading, isError, isSuccess, data } = useQuery(['help-topic', page, limitChange], () =>
        helpTopicAPI.list({ page, page_size: limitChange })
    );

    const helpTopicMutation = useMutation((data: HelpTopicResult) => helpTopicAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const helpTopicMultiDeleteMutation = useMutation((checkedIds: string[]) => helpTopicMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['help-topic', pageToSet, limitChange]);
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

    const helpTopicDeleteMutation = useMutation((id: string) => helpTopicAPI.delete(id), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['help-topic', pageToSet, limitChange]);
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

    const onCreateHelpTopic = (data: HelpTopicResult, actions: FormikHelpers<HelpTopicResult>) => {
        helpTopicMutation.mutate(data, {
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
                        title: `Congrats! Help Topic ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Help topic updated successfully'
                            : data.data.message ?? 'Help topic created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['help-topic', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['help-topic', page, limitChange], () => helpTopicAPI.list({ search: query, page_size: limitChange }));
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((helpTopic: HelpTopicResult) => String(helpTopic.id));
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
        const checkedRowId = data?.data?.result.map((helpTopic: HelpTopicResult) => String(helpTopic.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!helpTopicDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!helpTopicMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!helpTopicMutation.isLoading) {
            setHelpTopicFormData({
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

    const handleFormModalEdit = (object: HelpTopicResult) => {
        setHelpTopicFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: HelpTopicResult) => {
        return {
            id: value?.id,
            topic: value?.topic,
            is_active: value?.is_active,
        };
    };

    const breadcrumbItems: BreadcrumbItems[] = [{ name: 'Help', href: '/support/help' }];

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <PageHeader pageTitle="Help Topic" breadCrumbItems={breadcrumbItems}>
                <Button onClick={handleFormModal} name="Create" />
            </PageHeader>
            <PaperBox>
                <HelpTopicTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={helpTopicDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={helpTopicMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => helpTopicDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => helpTopicMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={helpTopicFormData}
                validationSchema={Yup.object().shape({
                    topic: stringValidate,
                })}
                onSubmit={(values, actions) => {
                    onCreateHelpTopic(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur, setFieldError }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!helpTopicMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Help Topic' : 'Add Help Topic'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={helpTopicMutation.isLoading}>
                        <Form>
                            <InputField
                                name="topic"
                                error={errors.topic}
                                touch={touched.topic}
                                labelName="Topic"
                                placeHolder="Enter topic name"
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

export default HelpTopic;
