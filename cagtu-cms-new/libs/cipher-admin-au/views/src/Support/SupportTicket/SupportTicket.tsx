import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Badge, Button, DateRangeField, ErrorAlert, PageHeader, PaperBox, PriorityBadge, SelectField, StatusBadge } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    getFormatedDate,
    getPageLimit,
    SupportFilterFormValuesProps,
    SupportTicketResolveProps,
    SupportTicketResult,
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
    Text,
    Title,
    useMantineTheme,
    Button as MantineButton,
    Textarea,
    Stack,
    Tooltip,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useEffect, useState } from 'react';
import SupportTicketTable from './SupportTicketTable';
import * as _ from 'lodash';
import dayjs from 'dayjs';
import {
    IconAlertCircle,
    IconCalendar,
    IconCheck,
    IconCornerUpRightDouble,
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
import { Link } from 'react-router-dom';

const urlsPath = urls?.cipher?.support.ticket;
const urlsSupportTypePath = urls?.cipher?.support.ticketType;
const urlsUserPath = urls?.cipher?.user;

const ticketVerifyFormData: SupportTicketResolveProps = {
    action: '',
    is_resolved: true,
};

const SupportTicket = () => {
    const { user_permissions, userId, is_superuser, groups } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [deleteModal, setDeleteModal] = useState(false);
    const [multiDeleteModal, setMultiDeleteModal] = useState(false);
    const [rowId, setRowId] = useState<number | null>();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [searchAssignedUser, setSearchAssignedUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [assignedUserOptions, setAssignedUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [supportTypeOptions, setSupportTypeOptions] = useState<{ value: string; label: string }[]>([]);
    const [ticketModal, setTicketModal] = useState<boolean>(false);
    const [ticketDetail, setTicketDetail] = useState<SupportTicketResult | null | undefined>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [ticketResolve, setTicketResolve] = useState(false);

    const filterFormInitialData: SupportFilterFormValuesProps = {
        created_range: '',
        start_date: '',
        end_date: '',
        assigned_to: userId as string,
        type: '',
        priority: '',
        status: '',
        is_active: '',
        is_resolved: '',
        ordering: '',
    };

    const [dark] = useDark();
    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

    const [supportFilterFormData, setSupportFilterFormData] = useState<SupportFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    useEffect(() => {
        setSupportFilterFormData({
            ...filterFormInitialData,
            assigned_to: userId as string,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const supportAPI = new CipherAPI(urlsPath?.path);
    const supportTypeAPI = new CipherAPI(urlsSupportTypePath?.path);
    const supportMultipleDeleteAPI = new CipherAPI(urlsPath?.mulipleDelete);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);
    const ticketResolveAPI = new CipherAPI(urlsPath?.resolve);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['support-ticket', page, limitChange, ...[filterFormInitialData]], () =>
        supportAPI.list({
            search: query,
            page,
            page_size: limitChange,
            ...supportFilterFormData,
            assigned_to: userId as string,
        })
    );

    // Fetch the users from the API as the per user keywords request
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

    useQuery(['support-type-options'], () => supportTypeAPI.list({ page: -1 }), {
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

    const handleFormModalEdit = (object: SupportTicketResult) => {
        setRowId(object?.id);
    };

    const handleSupportDetail = (object: SupportTicketResult) => {
        setTicketModal(true);
        setTicketDetail(object);
    };

    //Support ticket verify mutation action
    const ticketVerifyMutation = useMutation((data: SupportTicketResolveProps) => ticketResolveAPI.store(data, Number(ticketDetail?.id)));
    const handleTicketVerify = (data: SupportTicketResolveProps, actions: FormikHelpers<SupportTicketResolveProps>) => {
        ticketVerifyMutation.mutate(data, {
            onSuccess: (data) => {
                actions.resetForm();
                handleTicketModalClose();
                showNotification({
                    title: 'Congrats!',
                    message: data.data.message ?? 'Issue has been resolved and support ticket has been closed',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                if (pageToSet === page) queryClient.invalidateQueries(['support-ticket', pageToSet, limitChange]);
                else setPage(pageToSet);
            },
            onError: (error: any) => {
                const {
                    data: { detail },
                } = error.response;
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: detail ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
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
            <PageHeader pageTitle="Ticket" />
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
                <SupportTicketTable
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
            <Modal
                opened={ticketModal}
                onClose={handleTicketModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Ticket Detail
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
                            <StatusBadge name={_.toLower(ticketDetail?.status) as string ?? ''} />
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
                <Divider my={20} variant="dashed" />
                {(is_superuser || user_permissions?.includes('resolve_supportticket')) ? (
                    <Group position="apart">
                        <Text weight={500}>Resolved This Issue?</Text>
                        <Group position="left" spacing={10}>
                            {ticketDetail?.is_resolved ? (
                                <Badge name="Resolved" color="green" />
                            ) : (
                                <MantineButton
                                    compact
                                    variant="default"
                                    color="gray"
                                    loading={ticketVerifyMutation?.isLoading}
                                    sx={{ fontWeight: 500, fontSize: 12 }}
                                    onClick={() => {
                                        setTicketResolve(true);
                                    }}>
                                    {ticketVerifyMutation?.isLoading ? 'Resolving' : 'Resolve'}
                                </MantineButton>
                            )}
                        </Group>
                    </Group>
                ) : (
                    <Stack>
                        <Text weight={500}>Resolved This Issue?</Text>
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Permission Denied" color="red">
                            You don't have permission to resolve this issue
                        </Alert>
                    </Stack>
                )}
            </Modal>
            <Formik
                enableReinitialize
                initialValues={ticketVerifyFormData}
                onSubmit={(values, actions) => {
                    handleTicketVerify({ ...values }, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <Modal
                        opened={ticketResolve}
                        onClose={() => {
                            setTicketResolve(false);
                            handleReset();
                        }}
                        centered
                        title={
                            <Title order={5} sx={{ fontWeight: 600 }}>
                                Comment
                            </Title>
                        }
                        size="sm"
                        overlayBlur={3}
                        overlayOpacity={0.2}
                        closeOnClickOutside={false}>
                        <Form onSubmit={handleSubmit}>
                            <Textarea
                                name="action"
                                placeholder="Enter comment"
                                minRows={4}
                                error={errors.action && touched.action}
                                onChange={(e: any) => {
                                    setFieldValue('action', e.target.value);
                                }}
                            />
                            <Group position={'right'} mt={10}>
                                <MantineButton
                                    loading={ticketVerifyMutation?.isLoading}
                                    compact
                                    variant="default"
                                    color="gray"
                                    sx={{ fontWeight: 500, fontSize: 12 }}
                                    type="submit"
                                    onClick={() => {
                                        setTicketResolve(false);
                                    }}>
                                    Submit
                                </MantineButton>
                            </Group>
                        </Form>
                    </Modal>
                )}
            </Formik>
        </>
    );
};

export default SupportTicket;
