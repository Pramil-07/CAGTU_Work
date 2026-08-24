import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    Button,
    DateField,
    DateRangeField,
    ErrorAlert,
    PageHeader,
    PaperBox,
    SelectField,
    SelectInputField,
    ViewAnalyticsButton,
} from '@cagtu-cms/ui-shared';
import { AssignedTaskFilterFormValuesProps, CipherUserContext, getFormatedDate, getPageLimit, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { Box, CloseButton, Divider, Grid, Loader, useMantineTheme } from '@mantine/core';
import { IconCalendar, IconCornerUpRightDouble, IconSelector, IconStatusChange, IconUser } from '@tabler/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import AssignedTaskTable from './AssignedTaskTable';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.task;
const urlsUserPath = urls?.cipher?.user;

const filterFormInitialData: AssignedTaskFilterFormValuesProps = {
    status: '',
    assignee: '',
    assigner: '',
    is_requested: '',
    date_range: '',
    assigned_from: '',
    assigned_to: '',
    end_date: '',
    ordering: '',
};

const AssignedTaskList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchAssignee, setSearchAssignee] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [assigneeOptions, setAsigneeOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchAssigner, setSearchAssigner] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [assignerOptions, setAsignerOptions] = useState<{ value: string; label: string }[]>([]);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [assignedTaskFilterFormData, setAssignedTaskFilterFormData] = useState<AssignedTaskFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const assignedTaskAPI = new CipherAPI(urlsPath?.list);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['assigned-task', page, limitChange, ...[filterFormInitialData]], () =>
        assignedTaskAPI.list({
            search: query,
            page,
            page_size: limitChange,
            ...assignedTaskFilterFormData,
        })
    );

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['assigned-task', page, limitChange, ...[filterFormInitialData]], () =>
            assignedTaskAPI.list({
                search: query,
                page_size: limitChange,
                ...assignedTaskFilterFormData,
            })
        );
        setQuery(query);
        setPage(1);
    };

    // Fetch the user list from the API as the per user keywords request
    const { isFetching: isUserFetching } = useQuery(['assignee-options'], () => userOptionsAPI.list({ page: -1, search: searchAssignee }), {
        enabled: !!searchAssignee,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setAsigneeOptions(options);
        },
    });

    // Fetch the user list from the API as the per user keywords request
    const { isFetching: isAssignerFetching } = useQuery(['assigner-options'], () => userOptionsAPI.list({ page: -1, search: searchAssigner }), {
        enabled: !!searchAssigner,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setAsignerOptions(options);
        },
    });

    const onFilterFormClear = async () => {
        setAssignedTaskFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['assigned-task', page, limitChange, ...[filterFormInitialData]], () =>
            assignedTaskAPI.list({
                page: 1,
                page_size: '10',
            })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setAssignedTaskFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_task')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Assigned Task">
                <ViewAnalyticsButton navigateTo="/analytics/assigned-task" />
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
                                initialValues={assignedTaskFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        end_date: values?.end_date ? getFormatedDate(new Date(values?.end_date)) : '',
                                        assigned_from: values?.assigned_from ? getFormatedDate(new Date(values?.assigned_from)) : '',
                                        assigned_to: values?.assigned_to ? getFormatedDate(new Date(values?.assigned_to)) : '',
                                    };
                                    delete dataToSend.date_range;

                                    setIsFiltering(true);
                                    setAssignedTaskFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['assigned-task', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            assignedTaskAPI.list({
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
                                                    name="date_range"
                                                    placeHolder="Select date range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('date_range', value);
                                                        setFieldValue('assigned_from', value[0]);
                                                        setFieldValue('assigned_to', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <DateField
                                                    name="end_date"
                                                    placeHolder="Select end date"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleChange={(value) => setFieldValue('end_date', value)}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="assignee"
                                                    placeHolder="Search assignee"
                                                    options={assigneeOptions}
                                                    handleChange={(value) => setFieldValue('assignee', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchAssignee(value);
                                                        } else {
                                                            setSearchAssignee('');
                                                        }
                                                    }}
                                                    rightSection={isUserFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    withAsterisk
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="assigner"
                                                    placeHolder="Search assigner"
                                                    options={assignerOptions}
                                                    handleChange={(value) => setFieldValue('assigner', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchAssigner(value);
                                                        } else {
                                                            setSearchAssigner('');
                                                        }
                                                    }}
                                                    rightSection={isAssignerFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    withAsterisk
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
                                                    name="status"
                                                    placeHolder="Select status"
                                                    options={[
                                                        { value: 'Open', label: 'Open' },
                                                        { value: 'On Progress', label: 'On Progress' },
                                                        { value: 'Completed', label: 'Completed' },
                                                        { value: 'Closed', label: 'Closed' },
                                                        { value: 'Cancelled', label: 'Cancelled' },
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
                                                    name="ordering"
                                                    placeHolder="Sort by"
                                                    options={[
                                                        { value: 'service__title', label: 'Ascending' },
                                                        { value: '-service__title', label: 'Descending' },
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
                <AssignedTaskTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    onShowFilterForm={onShowFilterForm}
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
        </>
    );
};

export default AssignedTaskList;
