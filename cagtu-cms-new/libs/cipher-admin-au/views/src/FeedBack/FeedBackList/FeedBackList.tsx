import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, DateRangeField, ErrorAlert, PageHeader, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    FeedbackFilterFormValuesProps,
    FeedbackResult,
    getFormatedDate,
    getPageLimit,
    useDark,
    useDataLimit,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { Alert, Avatar, Box, CloseButton, Divider, Grid, Group, Image, Modal, Text, Title, useMantineTheme } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import * as _ from 'lodash';
import dayjs from 'dayjs';
import FeedBackListTable from './FeedBackListTable';
import { IconCalendar, IconCategory2, IconMail, IconPhone, IconQuestionCircle, IconSelector } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const urlsPath = urls?.cipher?.support.feedback;
const urlsFeedbackCatPath = urls?.cipher?.support.feedback?.category;

const filterFormInitialData: FeedbackFilterFormValuesProps = {
    feedback_category_id: '',
    ordering: '',
    start_date: '',
    end_date: '',
    created_range: '',
};

const FeedBackList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [feedbackCatOptions, setfeedbackCatOptions] = useState<{ value: string; label: string }[]>([]);
    const [feedbackModal, setFeedbackModal] = useState<boolean>(false);
    const [feedbackDetail, setFeedbackDetail] = useState<FeedbackResult | null | undefined>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

    const [feedbackFilterFormData, setFeedbackFilterFormData] = useState<FeedbackFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const feedbackAPI = new CipherAPI(urlsPath?.path);
    const feedbackOptionsAPI = new CipherAPI(urlsFeedbackCatPath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['feedback', page, limitChange, ...[filterFormInitialData]], () =>
        feedbackAPI.list({ search: query, page, page_size: limitChange, ...feedbackFilterFormData })
    );

    // Feedback Category Options
    useQuery(['feedbackCat-options'], () => feedbackOptionsAPI.list({ page: -1 }), {
        onSuccess: (data) => {
            const options = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: `${name}`,
                };
            });
            setfeedbackCatOptions(options);
        },
    });

    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['feedback', page, limitChange, ...[filterFormInitialData]], () =>
            feedbackAPI.list({ search: query, page_size: limitChange, ...feedbackFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    const handleDetail = (object: FeedbackResult) => {
        setFeedbackModal(true);
        setFeedbackDetail(object);
    };

    const handleFeedbackModalClose = () => {
        setFeedbackModal(false);
        setFeedbackDetail(null);
    };

    const onFilterFormClear = async () => {
        setFeedbackFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['feedback', page, limitChange, ...[filterFormInitialData]], () =>
            feedbackAPI.list({ page: 1, page_size: '10' })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setFeedbackFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_feedback')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Feedback" />
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
                                initialValues={feedbackFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend = {
                                        ...JSON.parse(JSON.stringify(values)),
                                        start_date: values?.start_date ? getFormatedDate(new Date(values?.start_date)) : '',
                                        end_date: values?.end_date ? getFormatedDate(new Date(values?.end_date)) : '',
                                    };

                                    delete dataToSend.created_range;

                                    setIsFiltering(true);
                                    setFeedbackFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['contact', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            feedbackAPI.list({
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
                                                    name="feedback_category_id"
                                                    placeHolder="Select feedback category"
                                                    options={feedbackCatOptions}
                                                    handleChange={(value) => setFieldValue('feedback_category_id', value)}
                                                    icon={<IconCategory2 size={18} stroke={1.75} />}
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
                <FeedBackListTable
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
                    isFetching={isFetching}
                    query={query}
                />
            </PaperBox>
            <Modal
                opened={feedbackModal}
                onClose={handleFeedbackModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Feedback Detail
                    </Title>
                }
                size="xl"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}>
                <Group position="apart" align="normal" mb={20}>
                    <Group position="left" spacing={15} align="normal">
                        <Avatar src={`${feedbackDetail?.user?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                        <Box>
                            <Title order={5} weight={600} mb={5}>
                                {`${feedbackDetail?.user?.first_name ?? ''} ${feedbackDetail?.user?.middle_name ?? ''} ${
                                    feedbackDetail?.user?.last_name ?? ''
                                }`}
                                <Text color="dimmed" size={13} weight={400}>
                                    @{feedbackDetail?.user?.username}
                                </Text>
                            </Title>
                            <Group spacing={5} mb={3}>
                                <IconMail size={18} stroke={1.75} color={iconColorMode} />
                                <Text color="dimmed">{feedbackDetail?.user?.email ?? '-'}</Text>
                            </Group>
                            <Group spacing={5}>
                                <IconPhone size={18} stroke={1.75} color={iconColorMode} />
                                <Text color="dimmed">{feedbackDetail?.user?.phone ?? '-'}</Text>
                            </Group>
                        </Box>
                    </Group>
                    <Box>
                        <Group position="right" mb={4}>
                            <Text size="xs" weight={500}>
                                Created On:{' '}
                                <Text component="span" color="dimmed">
                                    {converDateFromIsonString(new Date(String(feedbackDetail?.created_at)))}
                                </Text>
                            </Text>
                        </Group>
                        <Group position="right" mb={4}>
                            <Text size="xs" weight={500}>
                                Updated On:{' '}
                                <Text component="span" color="dimmed">
                                    {dayjs(feedbackDetail?.updated_at).fromNow()}
                                </Text>
                            </Text>
                        </Group>
                    </Box>
                </Group>
                <Divider mb={20} variant="dashed" />
                <Grid gutter="md">
                    <Grid.Col md={8}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Subject
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(feedbackDetail?.subject)}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Feedback Category
                        </Text>
                        <Box>
                            <Text color="dimmed">{feedbackDetail?.feedback_category?.name}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Description
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(feedbackDetail?.description)}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Attachement
                        </Text>
                        {!_.isNull(feedbackDetail?.attachment) ? (
                            <Text
                                component="a"
                                size={12}
                                weight={500}
                                href={feedbackDetail?.attachment}
                                target="_blank"
                                color="blue"
                                download={feedbackDetail?.attachment}>
                                <Image
                                    src={feedbackDetail?.attachment ?? ''}
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
                        ) : (
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue">
                                Attachments not available
                            </Alert>
                        )}
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default FeedBackList;
