import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    CreatableInputField,
    DateRangeField,
    ErrorAlert,
    FormModal,
    InputField,
    PaperBox,
    PasswordInputField,
    SelectField,
    SuccessModal,
} from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    EarningsResult,
    getFormatedDate,
    getPageLimit,
    GroupResult,
    RoleResult,
    useDark,
    useDataLimit,
    UserFilterFormValuesProps,
    userPasswordSchema,
    UsersFormValuesProps,
    UsersResult,
    usersSchema,
} from '@cagtu-cms/util-formatter';
import { Box, Center, CloseButton, Divider, Grid, Loader, useMantineTheme, Modal, Title, Table, Text, Alert } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
    IconCalendar,
    IconCheck,
    IconCircleCheck,
    IconForbid2,
    IconLock,
    IconMail,
    IconPhone,
    IconQuestionCircle,
    IconSelector,
    IconTie,
    IconUserCheck,
    IconUsers,
    IconX,
} from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useState } from 'react';
import UserDetailModal from '../../components/common/UserDetailModal';
import UserListTable from './UserListTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.user;
const rewardPath = urls?.cipher?.rewards;
const userAnalyticsPath = urls?.cipher?.analytics;

const filterFormInitialData: UserFilterFormValuesProps = {
    created_range: '',
    date_from: '',
    date_to: '',
    group: '',
    is_suspended: '',
    is_active: '',
    is_verified: '',
    role: '',
    ordering: '',
};

const initialFormData: UsersFormValuesProps = {
    id: '',
    // username: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    roles: [],
    groups: [],
};

const User = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [query, setQuery] = useState<string>('');
    const [checked, setChecked] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const [formModal, setFormModal] = useState(false);
    const [rowId, setRowId] = useState<string>('');
    const [page, setPage] = useState(1);
    // const [rolesOptions, setRolesOptions] = useState([]);
    const [groupsOptions, setGroupsOptions] = useState([]);
    const [successModal, setSuccessModal] = useState(false);
    const [analyticsModal, setAnalyticsModal] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [userFormData, setUserFormData] = useState<UsersFormValuesProps>({
        ...initialFormData,
    });

    const [userFilterFormData, setUserFilterFormData] = useState<UserFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const userAPI = new CipherAPI(urlsPath?.path);
    const userSuspendAPI = new CipherAPI(urlsPath?.suspend);
    const userWhitelistAPI = new CipherAPI(urlsPath?.whitelist);
    // const roleOptionAPI = new CipherAPI(urlsPath?.role?.options);
    const groupOptionAPI = new CipherAPI(urlsPath?.group?.options);
    const multiVerifyAPI = new CipherAPI(urlsPath?.multipleVerify);
    const profileVerifyAPI = new CipherAPI(urlsPath?.profileVerify);
    const addRewardAPI = new CipherAPI(rewardPath?.path);
    const userAnalyticsAPI = new CipherAPI(userAnalyticsPath?.tasker);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['users', page, limitChange, ...[filterFormInitialData]], () =>
        userAPI.list({ search: query, page, page_size: limitChange, ...userFilterFormData })
    );

    const userMutation = useMutation((data: UsersFormValuesProps) => userAPI.store(data, rowId));
    const { isFetching: userFetching } = useQuery(['user', rowId], () => userAPI.get(rowId), {
        enabled: !!rowId && !!formModal,
        onSuccess: (data) => {
            setUserFormData(mapToViewModal(data?.data));
        },
    });

    const { isLoading: userDetailFetching, data: userData } = useQuery(['user-detail', userId], () => userAPI.get(userId), {
        enabled: !!userId,
    });

    const { isLoading: userAnalyticsFetching, data: userAnalyticsData } = useQuery(['user-analytics', userId], () => userAnalyticsAPI.get(userId), {
        enabled: !!userId,
    });

    // useQuery(['roles-options'], () => roleOptionAPI.list(), {
    //     onSuccess: ({ data }) => {
    //         const options = data.map((val: RoleResult) => {
    //             return {
    //                 value: String(val?.id),
    //                 label: val?.name,
    //             };
    //         });
    //         setRolesOptions(options);
    //     },
    // });

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

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;
    const pageToFetchMultiple = data?.data?.result.length <= checked.length ? page - 1 : page;

    const userMultiVerifyMutation = useMutation((checkedIds: string[]) => multiVerifyAPI.store({ users: checkedIds, is_verified: true }), {
        onSuccess: (data) => {
            if (data.data?.status === 'failure') {
                setSuccessModal(false);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: data.data?.message,
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            } else {
                setSuccessModal(false);
                setChecked([]);
                showNotification({
                    title: 'Congrats! User Verified',
                    message: data.data?.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                const pageToSet = pageToFetchMultiple < 1 ? 1 : pageToFetchMultiple;
                if (pageToSet === page) queryClient.invalidateQueries(['users', pageToSet, limitChange]);
                else setPage(pageToSet);
            }
        },
        onError: (error: any) => {
            const {
                data: { message },
            } = error.response;
            setSuccessModal(false);
            showNotification({
                title: 'Uh oh! something went wrong',
                message: message ?? 'Sorry! There was a problem with your request.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const onCreateUser = (data: UsersFormValuesProps, actions: FormikHelpers<UsersFormValuesProps>) => {
        userMutation.mutate(data, {
            onSuccess: (data) => {
                if (data.data.status === 'failure') {
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: 'Uh oh! something went wrong',
                        message: data.data.message.title[0],
                        color: 'red',
                        icon: <IconX size={18} />,
                    });
                } else {
                    actions.resetForm();
                    setFormModal(false);
                    setRowId('');
                    showNotification({
                        title: `Congrats! User ${rowId ? 'Updated' : 'Created'}`,
                        message: rowId ? data.data.message ?? 'User updated successfully' : data.data.message ?? 'User created successfully',
                        color: 'green',
                        icon: <IconCheck size={18} />,
                    });
                    const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
                    if (pageToSet === page) queryClient.invalidateQueries(['users', pageToSet, limitChange]);
                    else setPage(pageToSet);
                }
            },
            onError: (error: any) => {
                const {
                    data: { message, email, username, phone },
                } = error.response;
                actions.setFieldError('email', email && email[0]);
                actions.setFieldError('username', username && username[0]);
                actions.setFieldError('phone', phone && phone[0]);
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: message ?? 'Sorry! There was a problem with your request.',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const profileVerifyMutation = useMutation<any, void, { is_profile_verified: boolean; id: number }>(
        ({ is_profile_verified, id }) => profileVerifyAPI.save({ is_profile_verified }, id),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Profile Verified',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['user-detail', userId]);
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
        }
    );

    const userSuspendMutation = useMutation<any, void, { user: string; to_date: string; reason: string }>(
        ({ user, to_date, reason }) => userSuspendAPI.store({ user, to_date, reason }),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Suspended!',
                    message: data.data.message,
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['user-detail', userId]);
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
        }
    );

    const addRewardPointMutation = useMutation<any, void, { reward_point: number }>(
        ({ reward_point }) => addRewardAPI.storeWithIdAndData({ reward_point }, userId),
        {
            onSuccess: (data) => {
                showNotification({
                    title: 'Congrats! Reward Point Added',
                    message: data.data.message ?? 'Successfully given reward point to the user.',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['user-detail', userId]);
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
        }
    );

    const userWhitelistMutation = useMutation<any, void, { id: string }>(({ id }) => userWhitelistAPI.storeWithUrl(`${urlsPath?.whitelist}${id}/`), {
        onSuccess: (data) => {
            showNotification({
                title: 'Suspension Removed!',
                message: data.data.message,
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            queryClient.invalidateQueries(['user-detail', userId]);
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

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['users', page, limitChange, ...[filterFormInitialData]], () =>
            userAPI.list({ search: query, page_size: limitChange, ...userFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const onSelectAll = () => {
        const isSelectAll = isAllCheckboxSelected();
        if (isSelectAll) {
            setChecked([]);
        } else {
            const checkedRowId = data?.data?.result.map((user: UsersResult) => user.id);
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
        const checkedRowId = data?.data?.result.map((user: UsersResult) => user.id);
        const isAllSelected = checkedRowId.every((id: number) => checked.includes(String(id)));
        return isAllSelected;
    };

    const handleSuccessCloseModal = () => {
        if (!userMultiVerifyMutation.isLoading) {
            setSuccessModal(false);
        }
    };

    const handleFormClose = () => {
        if (!userMutation.isLoading) {
            setUserFormData({
                ...initialFormData,
            });
            setRowId('');
            setFormModal(false);
        }
    };

    const handleFormModal = () => {
        setFormModal(true);
        setRowId('');
    };

    const handleFormModalEdit = (id: string) => {
        setFormModal(true);
        setRowId(id);
    };

    const handleUserDetail = (id: string) => {
        setUserModal(true);
        setUserId(id);
    };

    const handleUserAnalytics = (id: string) => {
        setAnalyticsModal(true);
        setUserId(id);
    };

    const mapToViewModal = (value: UsersFormValuesProps) => {
        const rolesOptions = value.roles && value.roles.map((val: any) => String(val?.id));
        const groupsOptions = value.groups && value.groups.map((val: any) => String(val?.id));
        return {
            id: value.id,
            // username: value.username ?? '',
            first_name: value.first_name ?? '',
            middle_name: value.middle_name ?? '',
            last_name: value.last_name ?? '',
            email: value.email ?? '',
            phone: value.phone ?? '',
            roles: rolesOptions,
            groups: groupsOptions,
            password: '',
        };
    };

    const onFilterFormClear = async () => {
        setUserFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['users', page, limitChange, ...[filterFormInitialData]], () => userAPI.list({ page: 1, page_size: '10' }));
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setUserFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_user')) {
        return <BlockedPageMessage />;
    }
    console.log("user rowid", rowId)

    return (
        <>
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
                                initialValues={userFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        date_from: values?.date_from ? getFormatedDate(new Date(values?.date_from)) : '',
                                        date_to: values?.date_to ? getFormatedDate(new Date(values?.date_to)) : '',
                                    };

                                    delete dataToSend.created_range;

                                    setIsFiltering(true);
                                    setUserFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['users', page, limitChange, ...[filterFormInitialData]], () =>
                                        userAPI.list({ ...dataToSend, page: 1, page_size: limitChange })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <DateRangeField
                                                    name="created_range"
                                                    placeHolder="Select created range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('created_range', value);
                                                        setFieldValue('date_from', value[0]);
                                                        setFieldValue('date_to', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            {/* <Grid.Col md={2}>
                                                <SelectField
                                                    name="role"
                                                    placeHolder="Select groups"
                                                    options={rolesOptions}
                                                    handleChange={(value) => setFieldValue('role', value)}
                                                    icon={<IconUsers size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col> */}
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="group"
                                                    placeHolder="Select roles"
                                                    options={groupsOptions}
                                                    handleChange={(value) => setFieldValue('group', value)}
                                                    icon={<IconTie size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_suspended"
                                                    placeHolder="Select suspended"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_suspended', value);
                                                    }}
                                                    icon={<IconForbid2 size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_verified"
                                                    placeHolder="Select verified"
                                                    options={[
                                                        { value: 'true', label: 'Yes' },
                                                        { value: 'false', label: 'No' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_verified', value);
                                                    }}
                                                    icon={<IconUserCheck size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_active"
                                                    placeHolder="Select active"
                                                    options={[
                                                        { value: 'true', label: 'Active' },
                                                        { value: 'false', label: 'Inactive' },
                                                    ]}
                                                    handleChange={(value) => {
                                                        setFieldValue('is_active', value);
                                                    }}
                                                    icon={<IconCircleCheck size={18} stroke={1.75} />}
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
                <UserListTable
                    data={data?.data?.result}
                    page={page}
                    checked={checked}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    isCheckboxSelect={isCheckboxSelect as unknown as undefined}
                    handleSelect={handleSelect as unknown as undefined}
                    onSelectAll={onSelectAll}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    handleFormModalEdit={handleFormModalEdit}
                    handleFormModal={handleFormModal}
                    handleUserVerify={() => setSuccessModal(true)}
                    handleUserDetail={handleUserDetail}
                    handleUserAnalytics={handleUserAnalytics}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Formik
                enableReinitialize
                initialValues={userFormData}
                validationSchema={!rowId ? userPasswordSchema : usersSchema}
                onSubmit={(values, actions) => {
                    const dataSend: UsersFormValuesProps = { ...values };
                    if (!values?.phone) delete dataSend.phone;
                    if (!values?.email) delete dataSend.email;
                    onCreateUser(dataSend, actions);
                }}>
                {({ errors, touched, handleSubmit, handleReset, values, setFieldValue }) => (
                    <FormModal
                        opened={formModal}
                        onClose={() => {
                            if (!userMutation.isLoading) {
                                handleReset();
                            }
                            handleFormClose();
                        }}
                        title={`${rowId ? 'Edit User' : 'Add User'}`}
                        onConfirm={!userFetching ? handleSubmit : () => undefined}
                        confirmButtonText={`${rowId ? 'Save' : 'Add'}`}
                        loading={userMutation.isLoading}
                        size="xl">
                        <Form>
                            {userFetching ? (
                                <Center>
                                    <Loader size="xs" variant="bars" />
                                </Center>
                            ) : (
                                <>
                                    {/* <InputField
                                        name="username"
                                        error={errors.username}
                                        touch={touched.username}
                                        labelName="Username"
                                        placeHolder="e.g. vishalhapa"
                                        withAsterisk
                                    /> */}
                                    <Grid>
                                        <Grid.Col md={4}>
                                            <InputField
                                                name="first_name"
                                                error={errors.first_name}
                                                touch={touched.first_name}
                                                labelName="First Name"
                                                placeHolder="Enter first name"
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={4}>
                                            <InputField
                                                name="middle_name"
                                                error={errors.middle_name}
                                                touch={touched.middle_name}
                                                labelName="Middle Name"
                                                placeHolder="Enter middle name"
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={4}>
                                            <InputField
                                                name="last_name"
                                                error={errors.last_name}
                                                touch={touched.last_name}
                                                labelName="Last Name"
                                                placeHolder="Enter last name"
                                                withAsterisk
                                            />
                                        </Grid.Col>
                                    </Grid>
                                    <InputField
                                        name="email"
                                        error={errors.email}
                                        touch={touched.email}
                                        labelName="Email Address"
                                        placeHolder="e.g. example@example.com"
                                        withAsterisk={!values?.phone}
                                        icon={<IconMail size={18} stroke={1.75} />}
                                    />
                                    <InputField
                                        name="phone"
                                        error={errors.phone}
                                        touch={touched.phone}
                                        labelName="Phone"
                                        placeHolder="e.g. +977 98536787998"
                                        withAsterisk={!values?.email}
                                        icon={<IconPhone size={18} stroke={1.75} />}
                                    />
                                    {!rowId && (
                                        <PasswordInputField
                                            name="password"
                                            error={errors.password}
                                            touch={touched.password}
                                            labelName="Password"
                                            placeHolder="XXXXXXXXXXXX"
                                            icon={<IconLock size={18} stroke={1.75} />}
                                        />
                                    )}
                                    {/* <CreatableInputField
                                        name="roles"
                                        options={rolesOptions}
                                        labelName="Groups"
                                        placeHolder="e.g. General User, Tasker, Manager, Accountant,"
                                        error={errors.roles as string}
                                        touch={touched.roles}
                                        value={values.roles}
                                        onChange={(value) => setFieldValue('roles', value)}
                                        icon={<IconUsers size={18} stroke={1.75} />}
                                        nothingFound=""
                                        searchable
                                        clearable
                                    /> */}
                                    <CreatableInputField
                                        name="groups"
                                        options={groupsOptions}
                                        labelName="Roles"
                                        placeHolder="e.g. Admin, Staff, Tasker"
                                        error={errors.groups as string}
                                        touch={touched.groups}
                                        value={values.groups}
                                        onChange={(value) => setFieldValue('groups', value)}
                                        icon={<IconTie size={18} stroke={1.75} />}
                                        nothingFound=""
                                        searchable
                                        clearable
                                    />
                                </>
                            )}
                        </Form>
                    </FormModal>
                )}
            </Formik>
            <SuccessModal
                opened={successModal}
                onClose={handleSuccessCloseModal}
                title="Are you sure?"
                description="Do you really want to verify selected users?"
                loading={userMultiVerifyMutation.isLoading}
                onConfirm={() => userMultiVerifyMutation.mutate(checked)}
                confirmButtonText="Yes! Verify it"
            />
            <UserDetailModal
                opened={userModal}
                title="User Detail"
                onClose={() => setUserModal(false)}
                data={userData?.data}
                isLoading={userDetailFetching}
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                size="xl"
                handleProfileVerify={profileVerifyMutation}
                handleUserSuspension={userSuspendMutation}
                handleUserWhitlist={userWhitelistMutation}
                handleRewardPoint={addRewardPointMutation}
                userID={userId}
            />
            <Modal
                opened={analyticsModal}
                onClose={() => setAnalyticsModal(false)}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Analytics
                    </Title>
                }>
                {userAnalyticsFetching ? (
                    <Center>
                        <Loader size="xs" variant="bars" />
                    </Center>
                ) : (
                    <>
                        {userAnalyticsData?.data?.earnings.length < 1 && userAnalyticsData?.data?.expenses.length < 1 && (
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue">
                                No analytics available
                            </Alert>
                        )}
                        {userAnalyticsData?.data?.earnings.length >= 1 && (
                            <>
                                <Title order={6} weight={600}>
                                    Earnings
                                </Title>
                                <Divider variant="dashed" mt="xs" mb="sm" />
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0} mb="md">
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Currency</th>
                                            <th style={{ width: 60, fontWeight: 600 }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userAnalyticsData?.data?.earnings.map((cat: EarningsResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span">{cat?.currency}</Text>
                                                </td>
                                                <td>
                                                    <Text component="span">{cat?.total}</Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </>
                        )}
                        {userAnalyticsData?.data?.expenses.length >= 1 && (
                            <>
                                <Title order={6} weight={600}>
                                    Expenses
                                </Title>
                                <Divider variant="dashed" mt="xs" mb="sm" />
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Currency</th>
                                            <th style={{ width: 60, fontWeight: 600 }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userAnalyticsData?.data?.expenses.map((cat: EarningsResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span">{cat?.currency}</Text>
                                                </td>
                                                <td>
                                                    <Text component="span">{cat?.total}</Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
};

export default User;
