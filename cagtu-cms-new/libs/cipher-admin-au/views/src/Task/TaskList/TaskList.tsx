import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    ErrorAlert,
    FormModal,
    InputField,
    PageHeader,
    PaperBox,
    SelectField,
    SelectInputField,
    ViewAnalyticsButton,
} from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    getPageLimit,
    stringReqOnly,
    TaskFilterFormValuesProps,
    taskFilterSchema,
    TaskResult,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { Box, CloseButton, Divider, Grid, Loader, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskListTable from './TaskListTable';
import * as Yup from 'yup';
import {
    IconBuildingSkyscraper,
    IconCategory,
    IconCheck,
    IconCornerUpRightDouble,
    IconCurrencyDollar,
    IconSelector,
    IconTool,
    IconUser,
    IconWorld,
    IconX,
} from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.task;
const urlsCatPath = urls?.cipher?.category;
const urlsCityPath = urls?.cipher?.locale?.city;
const urlsServicePath = urls?.cipher?.services;
const urlsUserPath = urls?.cipher?.user;

const filterFormInitialData: TaskFilterFormValuesProps = {
    budget_from: '',
    budget_to: '',
    city: '',
    category: '',
    is_online: '',
    is_requested: '',
    service: '',
    created_by: '',
    ordering: '',
};

const TaskList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [endorseModal, setEndorseModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();
    const navigate = useNavigate();

    const [searchCategory, setSearchCategory] = useState<string>(''); // Read the value from category select field after values enter i.e; more than 3 letter
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchCity, setSearchCity] = useState<string>(''); // Read the value from city select field after values enter i.e; more than 3 letter
    const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchService, setSearchService] = useState<string>(''); // Read the value from service select field after values enter i.e; more than 3 letter
    const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchUser, setSearchUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);

    const [taskFilterFormData, setTaskFilterFormData] = useState<TaskFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const taskAPI = new CipherAPI(urlsPath?.entityPath);
    const endorseAPI = new CipherAPI(urlsPath?.endorse);
    const taskSingleDeleteAPI = new CipherAPI(urlsPath?.path);
    const taskMultiDeleteAPI = new CipherAPI(urlsPath?.multipleDelete);
    const categorySelectOptionsAPI = new CipherAPI(urlsCatPath?.selectOptions);
    const cityOptionsAPI = new CipherAPI(urlsCityPath?.options);
    const serviceOptionsAPI = new CipherAPI(urlsServicePath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['tasks', page, limitChange, ...[filterFormInitialData]], () =>
        taskAPI.list({
            search: query,
            page,
            page_size: limitChange,
            ...taskFilterFormData,
        })
    );

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    // Fetch the category list from the API as the per user keywords request
    const { isFetching: isCategoryFetching } = useQuery(['category-options'], () => categorySelectOptionsAPI.list({ search: searchCategory }), {
        enabled: !!searchCategory,
        onSuccess: (data) => {
            const categoryOptions = data?.data.map(({ id, name, slug }: { id: number; name: string; slug: string }) => {
                return {
                    value: String(slug),
                    label: name,
                };
            });
            setCategoryOptions(categoryOptions);
        },
    });

    // Fetch the city list from the API as the per user keywords request
    const { isFetching: isCityFetching } = useQuery(['city-options'], () => cityOptionsAPI.list({ search: searchCity }), {
        enabled: !!searchCity,
        onSuccess: (data) => {
            const cityOptions = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(name),
                    label: name,
                };
            });
            setCityOptions(cityOptions);
        },
    });

    // Fetch the service list from the API as the per user keywords request
    const { isFetching: isServiceFetching } = useQuery(['service-options'], () => serviceOptionsAPI.list({ page: -1, search: searchService }), {
        enabled: !!searchService,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, title }: { id: number; title: string }) => {
                return {
                    value: String(id),
                    label: title,
                };
            });
            setServiceOptions(options);
        },
    });

    // Fetch the service list from the API as the per user keywords request
    const { isFetching: isUserFetching } = useQuery(['users-options'], () => userOptionsAPI.list({ page: -1, search: searchUser }), {
        enabled: !!searchUser,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setUserOptions(options);
        },
    });

    const taskMultiDeleteMutation = useMutation((checkedIds: string[]) => taskMultiDeleteAPI.store({ pk: checkedIds }), {
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
                    title: 'Congrats! Task Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['tasks', pageToSet, limitChange]);
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

    const taskDeleteMutation = useMutation((id: string) => taskSingleDeleteAPI.delete(id), {
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
                    title: 'Congrats! Task Deleted',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['tasks', pageToSet, limitChange]);
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

    const onEndorseMutation = useMutation(
        ({ entity_services, value }: { entity_services: string[]; value: string }) => endorseAPI.store({ entity_services, value }),
        {
            onSuccess: (data) => {
                if (data.data?.status === 'failure') {
                    setEndorseModal(false);
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data?.message,
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    setEndorseModal(false);
                    setChecked([]);
                    showNotification({
                        title: 'Congrats! Service Endorsed',
                        message: data.data?.message ?? 'Service has been successfully endorsed',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                    if (pageToSet === page) queryClient.invalidateQueries(['tasks', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message },
                } = error.response;
                setEndorseModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        }
    );

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['tasks', page, limitChange, ...[filterFormInitialData]], () =>
            taskAPI.list({
                search: query,
                page_size: limitChange,
                ...taskFilterFormData,
            })
        );
        setQuery(query);
        setPage(1);
    };

    const onFilterFormClear = async () => {
        setTaskFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['tasks', page, limitChange, ...[filterFormInitialData]], () =>
            taskAPI.list({
                page: 1,
                page_size: '10',
            })
        );
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((task: TaskResult) => task.id);
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
        const checkedRowId = data?.data?.result.map((task: TaskResult) => task.id);
        const isAllSelected = checkedRowId.every((id: string) => checked.includes(id));
        return isAllSelected;
    };

    const handleSingleDelete = (id: string) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!taskDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId('');
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!taskMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setTaskFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_entityservice')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Entity Service">
                <ViewAnalyticsButton navigateTo="/analytics/entity-service" />
                {(is_superuser || user_permissions?.includes('add_entityservice')) && <Button name="Create" onClick={() => navigate('/task/entity-service/create')} />}
            </PageHeader>
            <PaperBox>
                {showFilter && (
                    <>
                        <Box
                            sx={{
                                background: dark ? theme.colors.dark['4'] : theme.colors.gray['0'],
                                borderRadius: theme.radius.sm,
                                position: 'relative',
                            }}
                            p={20}>
                            <CloseButton
                                radius="xl"
                                color="dark"
                                variant="light"
                                size="sm"
                                sx={{ position: 'absolute', top: -8, right: -8 }}
                                onClick={onShowFilterFormClose}
                            />
                            <Formik
                                initialValues={taskFilterFormData}
                                validationSchema={taskFilterSchema}
                                onSubmit={async (values) => {
                                    setIsFiltering(true);
                                    setTaskFilterFormData({ ...values });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['tasks', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            taskAPI.list({
                                                page: 1,
                                                page_size: limitChange,
                                                ...values,
                                            }),
                                        {}
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ errors, touched, handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <InputField
                                                    name="budget_from"
                                                    error={errors.budget_from}
                                                    touch={touched.budget_from}
                                                    placeHolder="Budget From"
                                                    icon={<IconCurrencyDollar size={18} stroke={1.75} />}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <InputField
                                                    name="budget_to"
                                                    error={errors.budget_to}
                                                    touch={touched.budget_to}
                                                    placeHolder="Budget To"
                                                    icon={<IconCurrencyDollar size={18} stroke={1.75} />}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="category"
                                                    placeHolder="Search category"
                                                    options={categoryOptions}
                                                    handleChange={(value) => {
                                                        setFieldValue('category', value);
                                                    }}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchCategory(value);
                                                        } else {
                                                            setSearchCategory('');
                                                        }
                                                    }}
                                                    rightSection={isCategoryFetching && <Loader size="xs" />}
                                                    icon={<IconCategory size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="city"
                                                    placeHolder="Search city"
                                                    options={cityOptions}
                                                    handleChange={(value) => setFieldValue('city', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchCity(value);
                                                        } else {
                                                            setSearchCity('');
                                                        }
                                                    }}
                                                    rightSection={isCityFetching && <Loader size="xs" />}
                                                    icon={<IconBuildingSkyscraper size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="service"
                                                    placeHolder="Search service"
                                                    options={serviceOptions}
                                                    handleChange={(value) => {
                                                        setFieldValue('service', value);
                                                    }}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchService(value);
                                                        } else {
                                                            setSearchService('');
                                                        }
                                                    }}
                                                    rightSection={isServiceFetching && <Loader size="xs" />}
                                                    icon={<IconTool size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="created_by"
                                                    placeHolder="Search username"
                                                    options={userOptions}
                                                    handleChange={(value) => setFieldValue('created_by', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchUser(value);
                                                        } else {
                                                            setSearchUser('');
                                                        }
                                                    }}
                                                    rightSection={isUserFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_online"
                                                    placeHolder="Select work type"
                                                    options={[
                                                        { value: 'true', label: 'Online' },
                                                        { value: 'false', label: 'On-site' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_online', value);
                                                    }}
                                                    icon={<IconWorld size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_requested"
                                                    placeHolder="Select service type"
                                                    options={[
                                                        { value: 'true', label: 'Requested' },
                                                        { value: 'false', label: 'Provided' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_requested', value);
                                                    }}
                                                    icon={<IconCornerUpRightDouble size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="ordering"
                                                    placeHolder="Sort by"
                                                    options={[
                                                        { value: 'created_at', label: 'Last to Latest' },
                                                        { value: '-created_at', label: 'Latest to Last' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('ordering', value);
                                                    }}
                                                    icon={<IconSelector size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Button type="submit" name="Filter" loading={isFiltering} disabled={!dirty} />
                                        <Button
                                            type="button"
                                            name="Clear Filter"
                                            onClick={() => {
                                                handleReset();
                                                onFilterFormClear();
                                            }}
                                            variant="light"
                                            ml={10}
                                            disabled={!dirty}
                                        />
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                        <Divider my={20} variant="dashed" />
                    </>
                )}
                <TaskListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={taskDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={taskMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => taskDeleteMutation.mutate(rowId)}
                    onConfirmMultiDelete={() => taskMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    handleEndorse={() => setEndorseModal(true)}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={{ value: '' }}
                validationSchema={Yup.object().shape({
                    value: stringReqOnly,
                })}
                onSubmit={async (values, actions) => {
                    await onEndorseMutation.mutate(
                        { entity_services: checked, value: values?.value },
                        {
                            onSuccess: () => {
                                actions.resetForm();
                            },
                        }
                    );
                }}>
                {({ errors, touched, handleSubmit, handleReset, setFieldValue }) => (
                    <FormModal
                        opened={endorseModal}
                        onClose={() => {
                            if (!onEndorseMutation.isLoading) {
                                handleReset();
                            }
                            setEndorseModal(false);
                        }}
                        title="Endorse Service"
                        onConfirm={onEndorseMutation ? handleSubmit : () => undefined}
                        confirmButtonText="Confirm"
                        loading={onEndorseMutation.isLoading}
                        size="xs">
                        <Form>
                            <SelectField
                                labelName="Is Endorsed?"
                                name="value"
                                placeHolder="Select"
                                error={errors.value}
                                touch={touched.value}
                                options={[
                                    { value: 'true', label: 'Yes' },
                                    { value: 'false', label: 'No' },
                                ]}
                                handleChange={(value) => {
                                    setFieldValue('value', value);
                                }}
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

export default TaskList;
