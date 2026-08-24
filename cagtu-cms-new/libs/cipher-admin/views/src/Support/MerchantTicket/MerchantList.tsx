import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Badge,
    Button,
    DateRangeField,
    ErrorAlert,
    FormModal,
    PageHeader,
    PaperBox,
    PriorityBadge,
    SelectField,
    SelectInputField,
    StatusBadge,
    SwitchCheckbox,
    TextAreaField,
} from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    getFormatedDate,
    getPageLimit,
    SupportFilterFormValuesProps,
    supportSchema,
    SupportTicketFormValuesProps,
    SupportTicketResult,
    SupportTicketTypeFormValuesProps,
    useDark,
    useDataLimit,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import {
    Alert,
    Avatar,
    Box,
    CloseButton,
    Divider,
    Grid,
    Group,
    Image,
    Loader,
    Modal,
    Stack,
    Text,
    Title,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import * as _ from 'lodash';
import dayjs from 'dayjs';
import {
    IconCalendar,
    IconCheck,
    IconCornerUpRightDouble,
    IconHelp,
    IconMail,
    IconPhone,
    IconQuestionCircle,
    IconSelector,
    IconSortAscending2,
    IconStatusChange,
    IconUser,
    IconX,
} from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import SupportTicketTable from '../SupportTicket/SupportTicketTable';
import { Link } from 'react-router-dom';
import SupportMerchatTicketTable from '../SupportTicket/SupportMerchantTicketTable';

const urlsPath = urls?.cipher?.support.merchantTicket;
const urlsSupportTypePath = urls?.cipher?.support.ticketType;
const urlsUserPath = urls?.cipher?.user;
const tasksServicesUrlsPath = urls?.cipher?.task;
console.log("merchant path",urlsPath)
const initialFormData: SupportTicketFormValuesProps = {
    id: null,
    priority: '',
    reason: '',
    type: '',
    assigned_to: '',
    user: '',
    is_resolved: false,
    is_active: false,
    description: '',
    object_id: '',
    model: '',
};

const MerchantList = () => {
    const { user_permissions, userId, is_superuser, groups } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [searchUser, setSearchUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [searchAssignedUser, setSearchAssignedUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [assignedUserOptions, setAssignedUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchReportedUser, setSearchReportedUser] = useState<string>('');
    const [reportedUsersOptions, setReportedUsersOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchReportedServices, setSearchReportedServices] = useState<string>('');
    const [reportedServicesOptions, setReportedServicesOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchReportedTasks, setSearchReportedTasks] = useState<string>('');
    const [reportedTasksOptions, setReportedTasksOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchSupportType, setSearchSupportType] = useState<string>('');
    const [supportTypeOptions, setSupportTypeOptions] = useState<{ value: string; label: string }[]>([]);
    const [ticketModal, setTicketModal] = useState<boolean>(false);
    const [ticketDetail, setTicketDetail] = useState<SupportTicketResult | null | undefined>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [selfAssign, setSelfAssign] = useState(false);

    const filterFormInitialData: SupportFilterFormValuesProps = {
        created_range: '',
        start_date: '',
        end_date: '',
        assigned_to: is_superuser || groups?.map((val) => _.capitalize(val)).includes('Admin') ? '' : (userId as string),
        type: 'merchant-premium',
        priority: '',
        status: '',
        is_active: '',
        is_resolved: '',
        ordering: '',
    };

    const [dark] = useDark();
    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

    const [supportFormData, setSupportFormData] = useState<SupportTicketFormValuesProps>({ ...initialFormData });

    const [supportFilterFormData, setSupportFilterFormData] = useState<SupportFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    useEffect(() => {
        setSupportFilterFormData({
            ...filterFormInitialData,
            assigned_to: is_superuser || groups?.map((val) => _.capitalize(val)).includes('Admin') ? '' : (userId as string),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const supportAPI = new CipherAPI(urlsPath?.path);
    const supportTypeAPI = new CipherAPI(urlsSupportTypePath?.path);
    const supportMultipleDeleteAPI = new CipherAPI(urlsPath?.mulipleDelete);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['support-ticket', page, limitChange, ...[filterFormInitialData]], () =>
        supportAPI.list({
            // type: "merchant-premium",
            search: query,
            page,
            page_size: limitChange,
            ...supportFilterFormData,
            assigned_to: is_superuser || groups?.map((val) => _.capitalize(val)).includes('Admin') ? '' : (userId as string),
        })
    );

    // Fetch the users from the API as the per user keywords request
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
    // Fetch the assigned-users from the API as the per user keywords request
    const { isFetching: isAssignedUserFetching } = useQuery(
        ['assigned-users-options'],
        () => userOptionsAPI.list({ page: -1, search: searchAssignedUser }),
        {
            enabled: !!searchAssignedUser,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                    return {
                        value: String(id),
                        label: `${username}`,
                    };
                });
                setAssignedUserOptions(options);
            },
        }
    );
    // Fetch the reported-users from the API as the per user keywords request
    const { isFetching: isReportedUserFetching } = useQuery(
        ['reported-users-options'],
        () => userOptionsAPI.list({ page: -1, search: searchReportedUser }),
        {
            enabled: !!searchReportedUser,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                    return {
                        value: String(id),
                        label: `${username}`,
                    };
                });
                setReportedUsersOptions(options);
            },
        }
    );
    // Fetch the reported-services from the API as the per user keywords request
    const serviceAPI = new CipherAPI(tasksServicesUrlsPath?.entityPath);
    const { isFetching: isReportedServicesFetching } = useQuery(
        ['reported-services-options'],
        () => serviceAPI.list({ page: -1, search: searchReportedServices }),
        {
            enabled: !!searchReportedServices,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, title }: { id: number; title: string }) => {
                    return {
                        value: String(id),
                        label: `${title}`,
                    };
                });
                setReportedServicesOptions(options);
            },
        }
    );
    // Fetch the reported-tasks from the API as the per user keywords request
    const taskAPI = new CipherAPI(tasksServicesUrlsPath?.list);
    const { isFetching: isReportedTasksFetching } = useQuery(
        ['reported-tasks-options'],
        () => taskAPI.list({ search: searchReportedTasks, page: -1 }),
        {
            enabled: !!searchReportedTasks,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, title }: { id: number; title: string }) => {
                    return {
                        value: String(id),
                        label: `${title}`,
                    };
                });
                setReportedTasksOptions(options);
            },
            onError: (err) => {
                console.log('err', err);
            },
        }
    );

    // Fetch the support type options from the API as the per user keywords request
    useQuery(['support-type-options', searchSupportType], () => supportTypeAPI.list({ page: -1, target: searchSupportType }), {
        onSuccess: (data) => {
            const options = data?.data.map(({ slug, name }: { slug: string; name: string }) => {
                return {
                    value: String(slug),
                    label: `${name}`,
                };
            });
            setSupportTypeOptions(options);
        },
    });

    const supportMutation = useMutation((data: SupportTicketTypeFormValuesProps) => supportAPI.store(data, Number(rowId)));

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const supportMultiDeleteMutation = useMutation((checkedIds: string[]) => supportMultipleDeleteAPI.store({ pk: checkedIds }), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['support-ticket', pageToSet, limitChange]);
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

    const supportDeleteMutation = useMutation((id: string) => supportAPI.delete(id), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['support-ticket', pageToSet, limitChange]);
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

    const onCreateSupport = (data: any, actions: any) => {
        supportMutation.mutate(data, {
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
                    if (pageToSet === page) queryClient.invalidateQueries(['support-ticket', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['support-ticket', page, limitChange, ...[filterFormInitialData]], () =>
            supportAPI.list({ search: query, page_size: limitChange, ...supportFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((support: SupportTicketResult) => String(support.id));
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
        const checkedRowId = data?.data?.result.map((support: SupportTicketResult) => String(support.id));
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!supportDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleMultiDeleteCloseModal = () => {
        if (!supportMultiDeleteMutation.isLoading) {
            setMultiDeleteModal(false);
        }
    };

    const handleFormClose = () => {
        if (!supportMutation.isLoading) {
            setSupportFormData({ ...initialFormData });
            setRowId(null);
            setSelfAssign(false);
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId(null);
    };

    const handleFormModalEdit = (object: SupportTicketResult) => {
        setSupportFormData(mapToViewModal(object));
        setFormModal(true);
        setRowId(object?.id);
    };

    const mapToViewModal = (value: SupportTicketResult) => {
        const findCurrentUser = [{ ...value?.user }];

        const formatCurrentUser = findCurrentUser.map(({ id, username }) => {
            return {
                value: String(id),
                label: String(username),
            };
        });

        setUserOptions(formatCurrentUser);

        if (!_.isNull(value?.assigned_to)) {
            const findCurrentAssignedUser = [{ ...value?.assigned_to }];
            const formatCurrentAssignedUser = findCurrentAssignedUser.map(({ id, username }) => {
                return {
                    value: String(id),
                    label: String(username),
                };
            });

            setAssignedUserOptions(formatCurrentAssignedUser);
        }

        if (!_.isNull(value?.object && _.toLower(value?.object_type) === 'user')) {
            setReportedUsersOptions([{ value: String(value.object_id), label: String(value?.object) }]);
        }

        if (!_.isNull(value?.object && _.toLower(value?.object_type) === 'entityservice')) {
            setReportedServicesOptions([{ value: String(value.object_id), label: String(value?.object) }]);
        }

        if (!_.isNull(value?.object && _.toLower(value?.object_type) === 'task')) {
            setReportedTasksOptions([{ value: String(value.object_id), label: String(value?.object) }]);
        }

        return {
            id: value?.id,
            priority: _.isNull(value?.priority) ? '' : String(value?.priority?.value),
            reason: value?.reason,
            type: String(value?.type?.slug),
            assigned_to: _.isNull(value?.assigned_to) ? '' : String(value?.assigned_to?.id),
            user: _.isNull(value?.user) ? '' : String(value?.user?.id),
            is_resolved: value?.is_resolved,
            is_active: value?.is_active,
            description: value.description,
            object_id: _.isNull(value?.object_id) ? '' : String(value?.object_id),
            model: _.isNull(value?.object_type) ? '' : String(_.toLower(value?.object_type)),
        };
    };

    const handleSupportDetail = (object: SupportTicketResult) => {
        setTicketModal(true);
        setTicketDetail(object);
    };

    const handleTicketModalClose = () => {
        setTicketModal(false);
        setTicketDetail(null);
    };

    const onFilterFormClear = async () => {
        setSupportFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['support-ticket', page, limitChange, ...[filterFormInitialData]], () =>
            supportAPI.list({ page: 1, page_size: '10', ...filterFormInitialData })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setSupportFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_supportticket')) {
        return <BlockedPageMessage />;
    }

    const URL = process.env['NX_CIPHER_API_URL'];

    return (
        <>
            <PageHeader pageTitle="Merchant Ticket">
                {/* {(is_superuser || user_permissions?.includes('add_supportticket')) && <Button onClick={handleFormModal} name="Create" />} */}
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
                                initialValues={supportFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        start_date: values?.start_date ? getFormatedDate(new Date(values?.start_date)) : '',
                                        end_date: values?.end_date ? getFormatedDate(new Date(values?.end_date)) : '',
                                    };

                                    delete dataToSend.created_range;

                                    setIsFiltering(true);
                                    setSupportFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['support-ticket', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            supportAPI.list({
                                                ...dataToSend,
                                                page: 1,
                                                page_size: limitChange,
                                            }),
                                        {}
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <DateRangeField
                                                    name="created_range"
                                                    placeHolder="Select booked range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('created_range', value);
                                                        setFieldValue('start_date', value[0]);
                                                        setFieldValue('end_date', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="type"
                                                    placeHolder="Select ticket type"
                                                    options={supportTypeOptions}
                                                    handleChange={(value) => {
                                                        setFieldValue('type', value);
                                                    }}
                                                    icon={<IconQuestionCircle size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            {is_superuser ||
                                                (groups?.map((val) => _.capitalize(val)).includes('Admin') && (
                                                    <Grid.Col md={2}>
                                                        <SelectField
                                                            name="assigned_to"
                                                            placeHolder="Search assigned"
                                                            options={assignedUserOptions}
                                                            handleChange={(value) => setFieldValue('assigned_to', value)}
                                                            onSearchChange={(value) => {
                                                                if (value && value.length >= 3) {
                                                                    setSearchAssignedUser(value);
                                                                } else {
                                                                    setSearchAssignedUser('');
                                                                }
                                                            }}
                                                            rightSection={isAssignedUserFetching && <Loader size="xs" />}
                                                            icon={<IconUser size={18} stroke={1.75} />}
                                                            searchable
                                                            clearable
                                                            style={{ marginBottom: 0 }}
                                                        />
                                                    </Grid.Col>
                                                ))}

                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="priority"
                                                    placeHolder="Select priority"
                                                    options={[
                                                        { value: '0', label: 'Low' },
                                                        { value: '1', label: 'Medium' },
                                                        { value: '2', label: 'High' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('priority', value);
                                                    }}
                                                    icon={<IconSortAscending2 size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="status"
                                                    placeHolder="Select status"
                                                    options={[
                                                        { value: 'open', label: 'Open' },
                                                        { value: 'assigned', label: 'Assigned' },
                                                        { value: 'closed', label: 'Closed' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('status', value);
                                                    }}
                                                    icon={<IconStatusChange size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_resolved"
                                                    placeHolder="Select resolved"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_resolved', value);
                                                    }}
                                                    icon={<IconCornerUpRightDouble size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_active"
                                                    placeHolder="Select is active"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_active', value);
                                                    }}
                                                    icon={<IconCornerUpRightDouble size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="ordering"
                                                    placeHolder="Order by"
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
                <SupportMerchatTicketTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isDeleteModalOpened={deleteModal}
                    isMultiDeleteModalOpened={multiDeleteModal}
                    isSingleDeleteMutationLoading={supportDeleteMutation.isLoading}
                    isMultiDeleteMutationLoading={supportMultiDeleteMutation.isLoading}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    handleSingleDelete={handleSingleDelete}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onClickDeleteAll={() => setMultiDeleteModal(true)}
                    onConfirmSingleDelete={() => supportDeleteMutation.mutate(String(rowId))}
                    onConfirmMultiDelete={() => supportMultiDeleteMutation.mutate(checked)}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                    handleFormModalEdit={handleFormModalEdit}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    handleSupportDetail={handleSupportDetail}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={supportFormData}
                validationSchema={supportSchema}
                onSubmit={(values, actions) => {
                    const dataToSend: SupportTicketFormValuesProps = { ...values };
                    if (!values?.assigned_to) delete dataToSend?.assigned_to;
                    onCreateSupport(dataToSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue, handleBlur }) => (
                    <FormModal
                        size={'lg'}
                        opened={formModal}
                        onClose={() => {
                            if (!supportMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit Report' : 'Add Report'}`}
                        onConfirm={handleSubmit}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={supportMutation.isLoading}>
                        <Form>
                            <SelectInputField
                                name="user"
                                labelName="User"
                                placeHolder="Select user"
                                error={errors.user}
                                touch={touched.user}
                                options={userOptions}
                                textMuted="Write at least 3 letter to get the user"
                                handleChange={(value) => setFieldValue('user', value)}
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
                                withAsterisk
                            />

                            <SelectField
                                name="model"
                                labelName="Report Type"
                                placeHolder="Select report type"
                                error={errors.model}
                                touch={touched.model}
                                options={[
                                    { value: 'user', label: 'User' },
                                    { value: 'entityservice', label: 'Entity Service' },
                                    { value: 'task', label: 'Task' },
                                    { value: 'none', label: 'Other' },
                                ]}
                                handleChange={(value) => {
                                    setFieldValue('model', value);
                                    if (value && value !== 'none') {
                                        setSearchSupportType(value);
                                    } else {
                                        setSearchSupportType('');
                                    }
                                }}
                                icon={<IconSortAscending2 size={18} stroke={1.75} />}
                                clearable
                                withAsterisk
                            />

                            {values?.model === 'user' && (
                                <SelectInputField
                                    name="object_id"
                                    labelName="Reported User"
                                    placeHolder="Select user to report"
                                    error={errors.object_id}
                                    touch={touched.object_id}
                                    options={reportedUsersOptions}
                                    textMuted="Write at least 3 letter to get the user"
                                    handleChange={(value) => setFieldValue('object_id', value)}
                                    onSearchChange={(value) => {
                                        if (value && value.length >= 3) {
                                            setSearchReportedUser(value);
                                        } else {
                                            setSearchReportedUser('');
                                        }
                                    }}
                                    rightSection={isReportedUserFetching && <Loader size="xs" />}
                                    icon={<IconUser size={18} stroke={1.75} />}
                                    searchable
                                    clearable
                                    withAsterisk
                                />
                            )}
                            {values?.model === 'entityservice' && (
                                <SelectInputField
                                    name="object_id"
                                    labelName="Reported Service"
                                    placeHolder="Select service to report"
                                    error={errors.object_id}
                                    touch={touched.object_id}
                                    options={reportedServicesOptions}
                                    textMuted="Write at least 3 letter to get the service"
                                    handleChange={(value) => setFieldValue('object_id', value)}
                                    onSearchChange={(value) => {
                                        if (value && value.length >= 3) {
                                            setSearchReportedServices(value);
                                        } else {
                                            setSearchReportedServices('');
                                        }
                                    }}
                                    rightSection={isReportedServicesFetching && <Loader size="xs" />}
                                    icon={<IconUser size={18} stroke={1.75} />}
                                    searchable
                                    clearable
                                    withAsterisk
                                />
                            )}
                            {values?.model === 'task' && (
                                <SelectInputField
                                    name="object_id"
                                    labelName="Reported Task"
                                    placeHolder="Select task to report"
                                    error={errors.object_id}
                                    touch={touched.object_id}
                                    options={reportedTasksOptions}
                                    textMuted="Write at least 3 letter to get the task"
                                    handleChange={(value) => setFieldValue('object_id', value)}
                                    onSearchChange={(value) => {
                                        if (value && value.length >= 3) {
                                            setSearchReportedTasks(value);
                                        } else {
                                            setSearchReportedTasks('');
                                        }
                                    }}
                                    rightSection={isReportedTasksFetching && <Loader size="xs" />}
                                    icon={<IconUser size={18} stroke={1.75} />}
                                    searchable
                                    clearable
                                    withAsterisk
                                />
                            )}
                            <SelectField
                                name="type"
                                labelName="Support Type"
                                placeHolder="Select type"
                                error={errors.type}
                                touch={touched.type}
                                options={supportTypeOptions}
                                handleChange={(value) => {
                                    setFieldValue('type', value);
                                }}
                                icon={<IconHelp size={18} stroke={1.75} />}
                                clearable
                                withAsterisk
                            />
                            {values?.type === 'other' && (
                                <TextAreaField
                                    height={80}
                                    name="reason"
                                    labelName="Reason"
                                    placeHolder="Enter the reason for other support type"
                                    error={errors.reason}
                                    touch={touched.reason}
                                    withAsterisk
                                />
                            )}
                            <TextAreaField
                                name="description"
                                labelName="Description"
                                placeHolder="Enter the description"
                                error={errors.description}
                                touch={touched.description}
                                withAsterisk
                            />
                            <SelectField
                                name="priority"
                                labelName="Priority"
                                placeHolder="Select priority"
                                error={errors.priority}
                                touch={touched.priority}
                                options={[
                                    { value: '0', label: 'Low' },
                                    { value: '1', label: 'Medium' },
                                    { value: '2', label: 'High' },
                                ]}
                                handleChange={(value) => {
                                    setFieldValue('priority', value);
                                }}
                                icon={<IconSortAscending2 size={18} stroke={1.75} />}
                                clearable
                                withAsterisk
                            />
                            <SwitchCheckbox
                                name="self-assign"
                                checked={selfAssign}
                                onChange={(e) => {
                                    setSelfAssign(e.currentTarget.checked);
                                    setFieldValue('assigned_to', userId);
                                }}
                                labelName="Assign to self"
                                mb={15}
                            />
                            <SelectInputField
                                disabled={selfAssign}
                                name="assigned_to"
                                labelName="Assigned To"
                                placeHolder="Select user"
                                error={errors.assigned_to}
                                touch={touched.assigned_to}
                                options={assignedUserOptions}
                                textMuted="Write at least 3 letter to get the user"
                                handleChange={(value) => setFieldValue('assigned_to', value)}
                                onSearchChange={(value) => {
                                    if (value && value.length >= 3) {
                                        setSearchAssignedUser(value);
                                    } else {
                                        setSearchAssignedUser('');
                                    }
                                }}
                                rightSection={isAssignedUserFetching && <Loader size="xs" />}
                                icon={<IconUser size={18} stroke={1.75} />}
                                searchable
                                clearable
                                withAsterisk
                            />
                            {rowId && (
                                <SwitchCheckbox
                                    name="is_resolved"
                                    checked={values.is_resolved}
                                    onChange={(e) => setFieldValue('is_resolved', e.currentTarget.checked)}
                                    labelName="Is Resolved"
                                    mb={15}
                                />
                            )}
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
            <Modal
                opened={ticketModal}
                onClose={handleTicketModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Report Detail
                    </Title>
                }
                size="70%"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}>
                <Group position="apart">
                    <Title order={4} sx={{ display: 'inline-block' }} mb={5}>
                        {ticketDetail?.type.name}
                    </Title>
                    <Box>
                        <Group position="right" mb={4}>
                            <Text size="xs" weight={500}>
                                Created On:{' '}
                                <Text component="span" color="dimmed">
                                    {converDateFromIsonString(new Date(String(ticketDetail?.created_at)))}
                                </Text>
                            </Text>
                        </Group>
                        <Group position="right" mb={4}>
                            <Text size="xs" weight={500}>
                                Updated On:{' '}
                                <Text component="span" color="dimmed">
                                    {dayjs(ticketDetail?.updated_at).fromNow()}
                                </Text>
                            </Text>
                        </Group>
                        <Group position="right">
                            <Text size="xs" weight={500}>
                                Resolved:{' '}
                                <Badge
                                    size="sm"
                                    name={ticketDetail?.is_resolved ? 'Yes' : 'No'}
                                    color={ticketDetail?.is_resolved ? 'green' : 'red'}
                                />
                            </Text>
                        </Group>
                    </Box>
                </Group>
                <Divider my={20} variant="dashed" />
                <Stack>
                    <Box>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Created By
                        </Text>
                        <Group position="left" spacing={15} align="normal">
                            <Avatar src={`${ticketDetail?.created_by?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                            <Box>
                                <Title order={5} weight={600} mb={5}>
                                    {`${ticketDetail?.created_by?.first_name ?? ''} ${ticketDetail?.created_by?.middle_name ?? ''} ${
                                        ticketDetail?.created_by?.last_name ?? ''
                                    }`}
                                    <Text color="dimmed" size={13} weight={400}>
                                        @{ticketDetail?.created_by?.username}
                                    </Text>
                                </Title>
                                <Group spacing={5} mb={3}>
                                    <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.created_by?.email ?? '-'}</Text>
                                </Group>
                                <Group spacing={5}>
                                    <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.created_by?.phone ?? '-'}</Text>
                                </Group>
                            </Box>
                        </Group>
                    </Box>
                    <Box>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Reported By
                        </Text>
                        <Group position="left" spacing={15} align="normal">
                            <Avatar src={`${ticketDetail?.user?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                            <Box>
                                <Title order={5} weight={600} mb={5}>
                                    {`${ticketDetail?.user?.first_name ?? ''} ${ticketDetail?.user?.middle_name ?? ''} ${
                                        ticketDetail?.user?.last_name ?? ''
                                    }`}
                                    <Text color="dimmed" size={13} weight={400}>
                                        @{ticketDetail?.user?.username}
                                    </Text>
                                </Title>
                                <Group spacing={5} mb={3}>
                                    <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.user?.email ?? '-'}</Text>
                                </Group>
                                <Group spacing={5}>
                                    <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.user?.phone ?? '-'}</Text>
                                </Group>
                            </Box>
                        </Group>
                    </Box>
                    <Box>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Assigned To
                        </Text>
                        <Group position="left" spacing={15} align="normal">
                            <Avatar src={`${ticketDetail?.assigned_to?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                            <Box>
                                <Title order={5} weight={600} mb={5}>
                                    {`${ticketDetail?.assigned_to?.first_name ?? ''} ${ticketDetail?.assigned_to?.middle_name ?? ''} ${
                                        ticketDetail?.assigned_to?.last_name ?? ''
                                    }`}
                                    <Text color="dimmed" size={13} weight={400}>
                                        @{ticketDetail?.assigned_to?.username}
                                    </Text>
                                </Title>
                                <Group spacing={5} mb={3}>
                                    <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.assigned_to?.email ?? '-'}</Text>
                                </Group>
                                <Group spacing={5}>
                                    <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.assigned_to?.phone ?? '-'}</Text>
                                </Group>
                            </Box>
                        </Group>
                    </Box>
                </Stack>
                <Divider my={20} variant="dashed" />
                <Grid gutter="md" mb={15}>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Report Type
                        </Text>
                        <Box>
                            <Text color="dimmed">{ticketDetail?.type?.name}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Reported To
                        </Text>
                        <Box>
                            {ticketDetail?.object_type ? (
                                <Tooltip label="Click to view detail" withArrow>
                                    <Link
                                        to={
                                            ticketDetail?.object_type === 'User'
                                                ? `https://${
                                                    URL === 'https://sandbox.homaale.api.cagtu.io/api/v1' ? 'sandbox.' : ''
                                                }homaale.com/tasker/${ticketDetail?.object_id}`
                                                : ticketDetail?.object_type === 'Service'
                                                    ? `https://${
                                                        URL === 'https://sandbox.homaale.api.cagtu.io/api/v1' ? 'sandbox.' : ''
                                                    }homaale.com/services/${ticketDetail?.object_id}`
                                                    : ''
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <Badge
                                            name={ticketDetail?.object_type}
                                            styles={(theme) => ({
                                                root: {
                                                    '&:hover': {
                                                        textDecoration: 'underline',
                                                        cursor: 'pointer',
                                                    },
                                                },
                                            })}
                                        />
                                    </Link>
                                </Tooltip>
                            ) : (
                                <Badge name={'Other'} />
                            )}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Status
                        </Text>
                        <Box>
                            <StatusBadge name={(_.toLower(ticketDetail?.status) as string) ?? ''} />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Priority
                        </Text>
                        <Box>
                            {_.isNull(ticketDetail?.priority) ? (
                                <Badge name="Not Set" color="gray" />
                            ) : (
                                <PriorityBadge name={String(ticketDetail?.priority?.label)} />
                            )}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Is Active
                        </Text>
                        <Box>
                            <Badge name={ticketDetail?.is_active ? 'Yes' : 'No'} color={ticketDetail?.is_active ? 'green' : 'red'} />
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Is Resoved
                        </Text>
                        <Box>
                            <Badge name={ticketDetail?.is_resolved ? 'Yes' : 'No'} color={ticketDetail?.is_resolved ? 'green' : 'red'} />
                        </Box>
                    </Grid.Col>
                    {ticketDetail?.reason && (
                        <Grid.Col>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Reason
                            </Text>
                            <Text color="dimmed">{ticketDetail?.reason}</Text>
                        </Grid.Col>
                    )}
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Description
                        </Text>
                        <Text color="dimmed">{ticketDetail?.description}</Text>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Attachement
                        </Text>
                        {ticketDetail?.attachment && ticketDetail?.attachment.length ? (
                            <Group position="left" spacing={13}>
                                {ticketDetail?.attachment.map((val: any, index: number) => {
                                    return (
                                        <Text
                                            key={index}
                                            component="a"
                                            size={12}
                                            weight={500}
                                            href={val?.media}
                                            target="_blank"
                                            color="blue"
                                            download={val?.media}>
                                            <Image
                                                src={val?.media ?? ''}
                                                width={54}
                                                height={54}
                                                radius="md"
                                                fit="cover"
                                                styles={{
                                                    imageWrapper: {
                                                        background: theme.colors.gray['1'],
                                                        borderRadius: theme.radius.md,
                                                    },
                                                }}
                                            />
                                        </Text>
                                    );
                                })}
                            </Group>
                        ) : (
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue" mb={20}>
                                Attachments not available
                            </Alert>
                        )}
                    </Grid.Col>
                </Grid>
                <Divider mb={20} variant="dashed" />
                <Stack>
                    <Box>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Resolved By
                        </Text>
                        <Group position="left" spacing={15} align="normal">
                            <Avatar src={`${ticketDetail?.action_performed_by?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                            <Box>
                                <Title order={5} weight={600} mb={5}>
                                    {`${ticketDetail?.action_performed_by?.first_name ?? ''} ${
                                        ticketDetail?.action_performed_by?.middle_name ?? ''
                                    } ${ticketDetail?.action_performed_by?.last_name ?? ''}`}
                                    <Text color="dimmed" size={13} weight={400}>
                                        @{ticketDetail?.action_performed_by?.username}
                                    </Text>
                                </Title>
                                <Group spacing={5} mb={3}>
                                    <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.action_performed_by?.email ?? '-'}</Text>
                                </Group>
                                <Group spacing={5}>
                                    <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">{ticketDetail?.action_performed_by?.phone ?? '-'}</Text>
                                </Group>
                            </Box>
                        </Group>
                    </Box>

                    {ticketDetail?.action && (
                        <Box>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Action
                            </Text>
                            <Text color="dimmed">{ticketDetail?.action}</Text>
                        </Box>
                    )}
                </Stack>
            </Modal>
        </>
    );
};

export default MerchantList;
