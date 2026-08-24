import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, CreatableInputField, ErrorAlert, FormModal, InputField, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import { CipherUserContext, TaskRecommendFormValuesProps, TaskRecommendResult, getPageLimit, taskRecommendSchema, useDataLimit } from '@cagtu-cms/util-formatter';
import { Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import TaskRecommendTable from './TaskRecommendTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.task;

const TaskRecommendList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const [searchEntityService, setSearchEntityService] = useState<string>(''); // Read the value from entity service select field after values enter i.e; more than 3 letter
    const [entityServiceOptions, setEntityServiceOptions] = useState<{ value: string; label: string }[]>([]);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');

    const [taskRecommendFormData, setTaskRecommendFormData] = useState<TaskRecommendFormValuesProps>({
        id: null,
        title: '',
        entity_services: [],
    });

    const taskRecommendAPI = new CipherAPI(urlsPath?.recommend);
    const taskRecommendMultiDeleteAPI = new CipherAPI(urlsPath?.recommendMultipleDelete);
    const entityServiceOptionsAPI = new CipherAPI(urlsPath?.entityPath);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['task-recommend', page, limitChange], () =>
        taskRecommendAPI.list({ search: query, page, page_size: limitChange })
    );

    const taskRecommendMutation = useMutation((data: TaskRecommendFormValuesProps) => taskRecommendAPI.store(data, Number(rowId)));

    // Fetch the entity service list from the API
    const { isFetching: isEntityServiceFetching } = useQuery(
        ['entityService-options'],
        () => entityServiceOptionsAPI.list({ page: -1, is_requested: false, search: searchEntityService }),
        {
            enabled: !!searchEntityService,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, title }: { id: string; title: string }) => {
                    return {
                        value: String(id),
                        label: String(title),
                    };
                });
                setEntityServiceOptions((prev) => (prev.length > 0 ? [...prev, ...options] : options));
            },
        }
    );

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const taskRecommendMultiDeleteMutation = useMutation((checkedIds: string[]) => taskRecommendMultiDeleteAPI.store({ id: checkedIds }), {
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
                    title: 'Congrats! Task Recommend Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['task-recommend', pageToSet, limitChange]);
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

    const taskRecommendDeleteMutation = useMutation((id: number) => taskRecommendAPI.delete(id), {
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
                    title: 'Congrats! Task Recommend Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['task-recommend', pageToSet, limitChange]);
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

    const onCreateTaskRecommend = (data: TaskRecommendFormValuesProps, actions: FormikHelpers<TaskRecommendFormValuesProps>) => {
        taskRecommendMutation.mutate(data, {
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
                        title: `Congrats! Task Recommend ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId
                            ? data.data.message ?? 'Task recommend updated successfully'
                            : data.data.message ?? 'Task recommend created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['task-recommend', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
                actions.setFieldError('title', message);
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
        queryClient.prefetchQuery(['task-recommend', page, limitChange], () => taskRecommendAPI.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((taskRecommend: TaskRecommendResult) => String(taskRecommend.id));
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
        const checkedRowId = data?.data?.result.map((taskRecommend: TaskRecommendResult) => String(taskRecommend.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!taskRecommendDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!taskRecommendMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!taskRecommendMutation.isLoading) {
            setFormModal(false);
            setRowId(null);
            setTaskRecommendFormData({
                id: null,
                title: '',
                entity_services: [],
            });
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: TaskRecommendResult) => {
        setTaskRecommendFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: TaskRecommendResult) => {
        const findEntityService = [...value.entity_services];
        const formatEntityService = findEntityService.map((val) => {
            return {
                value: String(val?.id),
                label: String(val?.title),
            };
        });
        if (!searchEntityService) {
            setEntityServiceOptions(formatEntityService);
        }

        const entityServiceOptions = value.entity_services && value.entity_services.map((val) => String(val?.id));
        return {
            id: null,
            title: value?.title,
            entity_services: entityServiceOptions,
        };
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_task')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Task Recommend">
                {(is_superuser || user_permissions?.includes('add_recommendation')) && <Button onClick={handleFormModal} name="Create" />}
            </PageHeader>
            <PaperBox>
                <TaskRecommendTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={taskRecommendDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={taskRecommendMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => taskRecommendDeleteMutation.mutate(Number(rowId))}
                    onConfirmMultiDelete={() => taskRecommendMultiDeleteMutation.mutate(checked)}
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
                initialValues={taskRecommendFormData}
                validationSchema={taskRecommendSchema}
                onSubmit={(values, actions) => {
                    onCreateTaskRecommend(values, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!taskRecommendMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Task Recommend' : 'Add Task Recommend'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={taskRecommendMutation.isLoading}>
                        <Form>
                            <InputField
                                name="title"
                                error={errors.title}
                                touch={touched.title}
                                labelName="Title"
                                placeHolder="Enter title"
                                withAsterisk
                            />
                            <CreatableInputField
                                name="entity_services"
                                labelName="Entity Service"
                                placeHolder="Select entity services"
                                textMuted="Write at least 3 letter to get the entity service"
                                options={entityServiceOptions}
                                error={errors.entity_services as string}
                                touch={touched.entity_services}
                                value={values.entity_services}
                                onChange={(value) => setFieldValue('entity_services', value)}
                                onSearchChange={(value) => {
                                    if (value && value.length >= 3) {
                                        setSearchEntityService(value);
                                    } else {
                                        setSearchEntityService('');
                                    }
                                }}
                                rightSection={isEntityServiceFetching && <Loader size="xs" />}
                                searchable
                                clearable
                                withAsterisk
                            />
                        </Form>
                    </FormModal>
                )}
            </Formik>
        </>
    );
};

export default TaskRecommendList;
