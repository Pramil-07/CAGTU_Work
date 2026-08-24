import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Badge, Button, ErrorAlert, PageHeader, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import {
    Attachment,
    converDateFromIsonString,
    entityServiceActionOptions,
    getPageLimit,
    ReportFilterFormValuesProps,
    reportModelOptions,
    ReportResult,
    stringReqOnly,
    useDark,
    useDataLimit,
    userActionOptions,
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
    Button as MantineButon,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import * as _ from 'lodash';
import * as Yup from 'yup';
import ReportTable from './ReportTable';
import { showNotification } from '@mantine/notifications';
import { IconBox, IconCheck, IconQuestionCircle, IconSelector, IconUser, IconX } from '@tabler/icons';

const urlsPath = urls?.cipher?.report;
const urlsUserPath = urls?.cipher?.user;

const filterFormInitialData: ReportFilterFormValuesProps = {
    model: '',
    ordering: '',
    reported_by: '',
};

const Report = () => {
    const queryClient = useQueryClient();
    const [rowId, setRowId] = useState<number | null>();
    const [deleteModal, setDeleteModal] = useState(false);
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [reportModal, setReportModal] = useState<boolean>(false);
    const [reportDetail, setReportDetail] = useState<ReportResult | null | undefined>();
    const [searchReportedBy, setSearchReportedBy] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [reportFilterFormData, setReportFilterFormData] = useState<ReportFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const reportAPI = new CipherAPI(urlsPath?.path);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);

    const { isLoading, isError, isSuccess, data } = useQuery(['report', page, limitChange, ...[filterFormInitialData]], () =>
        reportAPI.list({ page, page_size: limitChange, ...reportFilterFormData })
    );

    // User Options
    const { isFetching: isUserFetching } = useQuery(['user-options'], () => userOptionsAPI.list({ page: -1, search: searchReportedBy }), {
        enabled: !!searchReportedBy,
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

    const pageToFecth = data?.data?.result.length <= 1 ? page - 1 : page;

    const reportActionMutation = useMutation<any, void, { action: string }>((action) => reportAPI.save(action, Number(rowId)), {
        onSuccess: (data) => {
            setReportModal(false);
            setRowId(null);
            showNotification({
                title: 'Congrats!',
                message: data.data.message ?? 'Action performed successfully',
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            const pageToSet = pageToFecth < 1 ? 1 : pageToFecth;
            if (pageToSet === page) queryClient.invalidateQueries(['report', pageToSet, limitChange]);
            else setPage(pageToSet);
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

    const reportDeleteMutation = useMutation((id: string) => reportAPI.delete(id), {
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
                if (pageToSet === page) queryClient.invalidateQueries(['report', pageToSet, limitChange]);
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
        queryClient.prefetchQuery(['report', page, limitChange, ...[filterFormInitialData]], () =>
            reportAPI.list({ search: query, page_size: limitChange, ...reportFilterFormData })
        );
    };

    const handleSingleDelete = (id: number) => {
        setDeleteModal(true);
        setRowId(id);
    };

    const handleCloseModal = () => {
        if (!reportDeleteMutation.isLoading) {
            setDeleteModal(false);
            setRowId(null);
        }
    };

    const handleDetail = (object: ReportResult) => {
        setReportModal(true);
        setReportDetail(object);
        setRowId(object?.id);
    };

    const handleReportModalClose = () => {
        setReportModal(false);
        setReportDetail(null);
        setRowId(null);
    };

    const onFilterFormClear = async () => {
        setReportFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['report', page, limitChange, ...[filterFormInitialData]], () =>
            reportAPI.list({ page: 1, page_size: '10' })
        );
        await onShowFilterFormClose();
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setReportFilterFormData({ ...filterFormInitialData });
    };

    if (isError) {
        return <ErrorAlert />;
    }

    return (
        <>
            <PageHeader pageTitle="Report" />
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
                                initialValues={reportFilterFormData}
                                onSubmit={async (values) => {
                                    setIsFiltering(true);
                                    setReportFilterFormData({ ...values });
                                    setPage(1);
                                    await queryClient.prefetchQuery(
                                        ['report', page, limitChange, ...[filterFormInitialData]],
                                        () =>
                                            reportAPI.list({
                                                ...values,
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
                                                <SelectField
                                                    name="model"
                                                    placeHolder="Select model"
                                                    options={reportModelOptions}
                                                    handleChange={(value) => setFieldValue('model', value)}
                                                    icon={<IconBox size={18} stroke={1.75} />}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="reported_by"
                                                    placeHolder="Search reported by"
                                                    options={userOptions}
                                                    handleChange={(value) => setFieldValue('reported_by', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchReportedBy(value);
                                                        } else {
                                                            setSearchReportedBy('');
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
                <ReportTable
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
                    handleSingleDelete={handleSingleDelete}
                    isDeleteModalOpened={deleteModal}
                    handleSingleDeleteCloseModal={handleCloseModal}
                    isSingleDeleteMutationLoading={reportDeleteMutation.isLoading}
                    onConfirmSingleDelete={() => reportDeleteMutation.mutate(String(rowId))}
                />
            </PaperBox>
            <Modal
                opened={reportModal}
                onClose={handleReportModalClose}
                centered
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Report Detail
                    </Title>
                }
                size="xl"
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}>
                <Group position="apart" align="normal" mb={20}>
                    <Box>
                        <Group position="left" mb={4}>
                            <Text size="xs" weight={500}>
                                Reported On:{' '}
                                <Text component="span" color="dimmed">
                                    {converDateFromIsonString(new Date(String(reportDetail?.reported_date)))}
                                </Text>
                            </Text>
                        </Group>
                        <Group position="left" mb={4}>
                            <Text size="xs" weight={500}>
                                Resolved On:{' '}
                                <Text component="span" color="dimmed">
                                    {!_.isNull(reportDetail?.action_performed_date)
                                        ? converDateFromIsonString(new Date(String(reportDetail?.action_performed_date)))
                                        : '-'}
                                </Text>
                            </Text>
                        </Group>
                    </Box>
                </Group>
                <Divider mb={20} variant="dashed" />
                <Grid gutter="md">
                    <Grid.Col md={6}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Model
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(reportDetail?.model)}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={6}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Report For
                        </Text>
                        <Box>
                            {reportDetail?.model === 'entityservice' && <Text color="dimmed">{reportDetail?.object?.title}</Text>}
                            {reportDetail?.model === 'user' && <Text color="dimmed">{reportDetail?.object?.username}</Text>}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={6}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Reason
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(reportDetail?.reason)}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Description
                        </Text>
                        <Box>
                            <Text color="dimmed">{_.upperFirst(reportDetail?.description)}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Attachement
                        </Text>
                        {reportDetail?.attachment && reportDetail?.attachment.length ? (
                            <Group position="left" spacing={13}>
                                {reportDetail?.attachment.map((val: Attachment, index: number) => {
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
                            <Alert icon={<IconQuestionCircle size={24} stroke={1.75} />} color="blue">
                                Attachments not available
                            </Alert>
                        )}
                    </Grid.Col>
                </Grid>
                <Divider mt={16} mb={8} variant="dashed" />
                <Group position="apart">
                    <Text weight={500}>Reported By</Text>
                    <Group position="left" spacing={5}>
                        <Avatar src={`${reportDetail?.reported_by?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                        <Text weight={500} component="span">{`${reportDetail?.reported_by?.first_name ?? ''} ${
                            reportDetail?.reported_by?.middle_name ?? ''
                        } ${reportDetail?.reported_by?.last_name ?? ''}`}</Text>
                    </Group>
                </Group>
                <Divider my={8} variant="dashed" />
                <Group position="apart">
                    <Text weight={500}>Resolved By</Text>
                    <Group position="left" spacing={10}>
                        <Avatar src={`${reportDetail?.action_performed_by?.profile_image ?? ''}`} alt="user-profile" size={30} radius={'xl'} />
                        {reportDetail?.action_performed_by?.username === 'admin' ? (
                            <Text weight={500} component="span">
                                {_.upperFirst(reportDetail?.action_performed_by?.username)}
                            </Text>
                        ) : (
                            <Text weight={500} component="span">{`${reportDetail?.action_performed_by?.first_name ?? ''} ${
                                reportDetail?.action_performed_by?.middle_name ?? ''
                            } ${reportDetail?.action_performed_by?.last_name ?? ''}`}</Text>
                        )}
                    </Group>
                </Group>
                <Divider my={8} variant="dashed" />
                <Group position="apart">
                    <Text weight={500}>Action</Text>
                    {!_.isNull(reportDetail?.action) ? (
                        <Badge name={reportDetail?.action} color="red" />
                    ) : (
                        <Formik
                            enableReinitialize
                            initialValues={{ action: _.isNull(reportDetail?.action) ? '' : reportDetail?.action }}
                            validationSchema={Yup.object().shape({
                                action: stringReqOnly.nullable(true),
                            })}
                            onSubmit={(values) => {
                                reportActionMutation.mutate({ action: values?.action as string });
                            }}>
                            {({ setFieldValue, errors, touched }) => (
                                <Form>
                                    <Group position="left" spacing={5}>
                                        <SelectField
                                            name="action"
                                            placeHolder="Select"
                                            error={errors.action}
                                            touch={touched.action}
                                            options={
                                                reportDetail?.model === 'user' || reportDetail?.model === 'merchant'
                                                    ? userActionOptions
                                                    : entityServiceActionOptions
                                            }
                                            handleChange={(value) => {
                                                setFieldValue('action', value);
                                            }}
                                            clearable
                                            style={{ marginBottom: 0 }}
                                        />
                                        <MantineButon
                                            type="submit"
                                            name="submit"
                                            variant="filled"
                                            size="xl"
                                            sx={{ fontWeight: 500, fontSize: 13 }}
                                            compact
                                            loading={reportActionMutation.isLoading}>
                                            Submit
                                        </MantineButon>
                                    </Group>
                                </Form>
                            )}
                        </Formik>
                    )}
                </Group>
            </Modal>
        </>
    );
};

export default Report;
