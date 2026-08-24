import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, CreatableInputField, ErrorAlert, FormModal, InputField, PageHeader, PaperBox, SwitchCheckbox } from '@cagtu-cms/ui-shared';
import {
    BreadcrumbItems,
    CipherUserContext,
    GroupResult,
    SupportTicketTypeFormValuesProps,
    SupportTicketTypeResult,
    getPageLimit,
    supportTypeSchema,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import SupportTicketTypeTable from './SupportTicketTypeTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { Select } from '@mantine/core';

const urlsPath = urls?.cipher?.support.ticketType;
const groupUrlsPath = urls?.cipher?.user?.group?.options;

const initialFormData: SupportTicketTypeFormValuesProps = {
    id: null,
    name: '',
    target: '',
    notify_to: [],
    is_active: false,
};

const SupportTicketType = () => {
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
    const [groupsOptions, setGroupsOptions] = useState([]);

    const [supportTypeFormData, setSupportTypeFormData] = useState<SupportTicketTypeFormValuesProps>({
        ...initialFormData,
    });

    const supportTypeAPI = new CipherAPI(urlsPath?.path);
    const supportTypeMultipleDeleteAPI = new CipherAPI(urlsPath?.mulipleDelete);
    const groupOptionAPI = new CipherAPI(groupUrlsPath);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['support-ticket-type', page, limitChange], () =>
        supportTypeAPI.list({ search: query, page, page_size: limitChange })
    );

    useQuery(['groups-options'], () => groupOptionAPI.list(), {
        onSuccess: ({ data }) => {
            const options = data.map((val: GroupResult) => {
                return {
                    value: String(val?.id),
                    label: val?.name,
                };
            });
            setGroupsOptions(options);
        },
    });

    const supportTypeMutation = useMutation((data: SupportTicketTypeFormValuesProps) => supportTypeAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const supportTypeMultiDeleteMutation = useMutation((checkedIds: string[]) => supportTypeMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['support-ticket-type', pageToSet, limitChange]);
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

    const supportTypeDeleteMutation = useMutation((id: string) => supportTypeAPI.delete(id), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['support-ticket-type', pageToSet, limitChange]);
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

    const onCreateSupportType = (data: any, actions: FormikHelpers<SupportTicketTypeFormValuesProps>) => {
        supportTypeMutation.mutate(data, {
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
                        title: 'Congrats!',
                        message: data.data.message,
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['support-ticket-type', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['support-ticket-type', page, limitChange], () => supportTypeAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((supportType: SupportTicketTypeResult) => String(supportType.id));
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
        const checkedRowId = data?.data?.result.map((supportType: SupportTicketTypeResult) => String(supportType.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!supportTypeDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!supportTypeMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!supportTypeMutation.isLoading) {
            setSupportTypeFormData({
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

    const handleFormModalEdit = (object: SupportTicketTypeResult) => {
        setSupportTypeFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: SupportTicketTypeResult) => {
        const notifyOptions = value.notify_to && value.notify_to.map((val: any) => String(val?.id));
        return {
            id: value?.id,
            name: value?.name,
            target: value?.target,
            notify_to: notifyOptions,
            is_active: value?.is_active,
        };
    };

    const breadcrumbItems: BreadcrumbItems[] = [{ name: 'Ticket', href: '/support/ticket' }];

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_supporttickettype')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Ticket Type" breadCrumbItems={breadcrumbItems}>
                {(is_superuser || user_permissions?.includes('add_supporttickettype')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <SupportTicketTypeTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={supportTypeDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={supportTypeMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => supportTypeDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => supportTypeMultiDeleteMutation.mutate(checked)}
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
                initialValues={supportTypeFormData}
                validationSchema={supportTypeSchema}
                onSubmit={(values, actions) => {
                    onCreateSupportType(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur, setFieldError }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!supportTypeMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Ticket Type' : 'Add Ticket Type'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={supportTypeMutation.isLoading}>
                        <Form>
                            <InputField
                                name="name"
                                error={errors.name}
                                touch={touched.name}
                                labelName="Name"
                                placeHolder="Enter ticket type"
                                withAsterisk
                            />
                            <Select
                                name="target"
                                data={[
                                    { label: 'User', value: 'user' },
                                    { label: 'Entity Service', value: 'entityservice' },
                                    { label: 'Task', value: 'task' },
                                ]}
                                label="Target"
                                placeholder="e.g. user, entity service, task"
                                error={errors.target && touched.target}
                                value={values.target}
                                onChange={(value) => setFieldValue('target', value)}
                                searchable
                                clearable
                                styles={{
                                    input: { minHeight: 42, padding: `${2}px ${30}px ${2}px ${12}px` },
                                    error: { fontSize: 13, fontWeight: 500 },
                                }}
                                mb={20}
                            />
                            <CreatableInputField
                                name="notify_to"
                                options={groupsOptions}
                                labelName="Notify To"
                                placeHolder="e.g. Superadmin/Admin/Support"
                                error={errors.notify_to as string}
                                touch={touched.notify_to}
                                value={values.notify_to}
                                onChange={(value) => setFieldValue('notify_to', value)}
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

export default SupportTicketType;
