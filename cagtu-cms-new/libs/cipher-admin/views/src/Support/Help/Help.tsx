import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, DateRangeField, ErrorAlert, PageHeader, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import {
    converDateFromIsonString,
    getFormatedDate,
    getPageLimit,
    HelpFilterFormValueProps,
    HelpResult,
    useDark,
    useDataLimit,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { Avatar, Box, CloseButton, Divider, Grid, Group, Loader, Modal, Text, Title, useMantineTheme } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import * as _ from 'lodash';
import HelpTable from './HelpTable';
import { IconCalendar, IconHelp, IconMail, IconPhone, IconSelector, IconUser } from '@tabler/icons';

const urlsPath = urls?.cipher?.support?.help;
const urlsHelpTopicPath = urls?.cipher?.support?.help?.topic;
const urlsUserPath = urls?.cipher?.user;

const filterFormInitialData: HelpFilterFormValueProps = {
    created_range: '',
    date_range_after: '',
    date_range_before: '',
    ordering: '',
    user: '',
    topic: '',
};

const Report = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [helpTopicOptions, setHelpTopicOptions] = useState<{ value: string; label: string }[]>([]);
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [helpModal, setHelpModal] = useState<boolean>(false);
    const [helpDetail, setHelpDetail] = useState<HelpResult | null | undefined>();
    const [searchUser, setSearchUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

    const [helpFilterFormData, setHelpFilterFormData] = useState<HelpFilterFormValueProps>({
        ...filterFormInitialData,
    });

    const helpAPI = new CipherAPI(urlsPath?.path);
    const helpTopicOptionsAPI = new CipherAPI(urlsHelpTopicPath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data } = useQuery(['help', page, limitChange, ...[filterFormInitialData]], () =>
        helpAPI.list({ page, page_size: limitChange, ...helpFilterFormData })
    );

    // Help Topic Options
    useQuery(['helpTopic-options'], () => helpTopicOptionsAPI.list({ page: -1 }), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, topic }: { id: number; topic: string }) => {
                return {
                    value: String(id),
                    label: _.upperFirst(topic),
                };
            });
            setHelpTopicOptions(options);
        },
    });

    // User Options
    const { isFetching: isUserFetching } = useQuery(['user-options'], () => userOptionsAPI.list({ page: -1, search: searchUser }), {
        enabled: !!searchUser,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: username,
                };
            });
            setUserOptions(options);
        },
    });

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['help', page, limitChange, ...[filterFormInitialData]], () =>
            helpAPI.list({ search: query, page_size: limitChange, ...helpFilterFormData })
        );
    };

    const handleDetail = (object: HelpResult) => {
        setHelpModal(true);
        setHelpDetail(object);
    };

    const handleReportModalClose = () => {
        setHelpModal(false);
        setHelpDetail(null);
    };

    const onFilterFormClear = async () => {
        setHelpFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['help', page, limitChange, ...[filterFormInitialData]], () => helpAPI.list({ page: 1, page_size: '10' }));
        await onShowFilterFormClose();
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setHelpFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <PageHeader pageTitle="Help" />
            <PaperBox>
                {showFilter && data?.data?.result && data?.data?.result.length >= 1 && (
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
                                initialValues={helpFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        date_range_after: values?.date_range_after ? getFormatedDate(new Date(values?.date_range_after)) : '',
                                        date_range_before: values?.date_range_before ? getFormatedDate(new Date(values?.date_range_before)) : '',
                                    };

                                    delete dataToSend.created_range;

                                    setIsFiltering(true);
                                    setHelpFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['help', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            helpAPI.list({
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
                                                    placeHolder="Select date range"
                                                    icon={<IconCalendar size={18} stroke={1.75} />}
                                                    handleDateRange={(value) => {
                                                        setFieldValue('created_range', value);
                                                        setFieldValue('date_range_after', value[0]);
                                                        setFieldValue('date_range_before', value[1]);
                                                    }}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="topic"
                                                    placeHolder="Search help topic"
                                                    options={helpTopicOptions}
                                                    handleChange={(value) => setFieldValue('topic', value)}
                                                    icon={<IconHelp size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="user"
                                                    placeHolder="Search user"
                                                    options={userOptions}
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
                <HelpTable
                    data={data?.data?.result}
                    page={page}
                    isLoading={isLoading}
                    isSuccess={isSuccess}
                    total={data?.data?.total_pages}
                    onSetPage={setPage}
                    onHandleSearch={onHandleSearch}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    handleDetail={handleDetail}
                    onShowFilterForm={onShowFilterForm}
                />
            </PaperBox>
            <Modal
                opened={helpModal}
                onClose={handleReportModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Help Detail
                    </Title>
                }
                size="xl"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}>
                <Group position="apart" align="normal" mb={20}>
                    <Group position="left" align="normal" mb={20}>
                        <Avatar src={`${helpDetail?.user?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                        <Box>
                            <Title order={5} weight={600} mb={5}>
                                {`${helpDetail?.user?.first_name ?? ''} ${helpDetail?.user?.middle_name ?? ''} ${helpDetail?.user?.last_name ?? ''}`}
                                <Text color="dimmed" size={13} weight={400}>
                                    @{helpDetail?.user?.username}
                                </Text>
                            </Title>
                            <Group spacing={5} mb={13}>
                                <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                <Text color="dimmed">{helpDetail?.user?.email ?? '-'}</Text>
                            </Group>
                            <Group spacing={5}>
                                <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                <Text color="dimmed">{helpDetail?.user?.phone ?? '-'}</Text>
                            </Group>
                        </Box>
                    </Group>
                    <Box>
                        <Group position="right" mb={4}>
                            <Text size="xs" weight={500}>
                                Created On:{' '}
                                <Text component="span" color="dimmed">
                                    {converDateFromIsonString(new Date(String(helpDetail?.created_at)))}
                                </Text>
                            </Text>
                        </Group>
                    </Box>
                </Group>
                <Divider mb={20} variant="dashed" />
                <Grid gutter="md">
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Help Topic
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(helpDetail?.topic?.topic)}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Reason
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(helpDetail?.reason ?? '-')}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Details
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(helpDetail?.details ?? '-')}</Text>
                        </Box>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default Report;
