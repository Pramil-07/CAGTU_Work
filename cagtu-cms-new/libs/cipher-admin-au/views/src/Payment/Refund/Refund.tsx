import { Button, PageHeader, PaperBox, SelectField, StatusBadge } from '@cagtu-cms/ui-shared';
import RefundTable from './RefundTable';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import {
    CipherUserContext,
    RefundFilterFormValuesProps,
    RefundResult,
    converDateFromIsonString,
    convertTimeStringToAMPM,
    getPageLimit,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Avatar, Badge, Box, CloseButton, Divider, Grid, Group, List, Modal, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { IconMail, IconPhone } from '@tabler/icons';
import _ from 'lodash';
import RefundProcess from './RefundProcess';
import { Form, Formik } from 'formik';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

const filterFormInitialData: RefundFilterFormValuesProps = {
    is_compensated: '',
    is_penalized: '',
    is_refunded: '',
    user_type: '',
};

const urlsPath = urls?.cipher?.payment;

const Refund = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [refundDetailModal, setRefundDetailModal] = useState(false);
    const [refundDetail, setRefundDetail] = useState<RefundResult>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [refundFilterFormData, setRefundFilterFormData] = useState<RefundFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    // Refund list get api
    const refundListAPI = new CipherAPI(urlsPath?.refund);
    const {
        isLoading,
        isFetching,
        isSuccess,
        data: refundData,
    } = useQuery(['refund-list', page, limitChange, ...[refundFilterFormData]], () =>
        refundListAPI.list({ search: query, page, page_size: limitChange, ...refundFilterFormData })
    );

    //Refund list search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['refund-list', page, limitChange, ...[refundFilterFormData]], () =>
            refundListAPI.list({ search: query, page_size: limitChange, ...refundFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    //Refund detail handle function
    const handleDetailModalOpen = (object: RefundResult) => {
        setRefundDetail(object);
        setRefundDetailModal(true);
    };
    //Refund detail handle function
    const handleDetailModalClose = () => {
        setRefundDetail(undefined);
        setRefundDetailModal(false);
    };

    //Refund filter form open function
    const onShowFilterForm = () => setShowFilter(true);

    //Refund filter clear function
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setRefundFilterFormData({ ...filterFormInitialData });
    };

    const onFilterFormClear = async () => {
        setRefundFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['refund-list', page, limitChange, ...[filterFormInitialData]], () =>
            refundListAPI.list({ search: query, page: 1, page_size: '10', ...filterFormInitialData })
        );
    };

    if (!is_superuser && !user_permissions?.includes('view_booking')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Refund Request" />
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
                                initialValues={refundFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend: RefundFilterFormValuesProps = {
                                        ...values,
                                    };
                                    setIsFiltering(true);
                                    setRefundFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['refund-list', page, limitChange, ...[dataToSend]], () =>
                                        refundListAPI.list({ search: query, page: 1, page_size: limitChange, ...dataToSend })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_compensated"
                                                    placeHolder="Is Compensated?"
                                                    options={[
                                                        {
                                                            value: 'true',
                                                            label: 'Yes',
                                                        },
                                                        {
                                                            value: 'false',
                                                            label: 'No',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('is_compensated', value)}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_penalized"
                                                    placeHolder="Is Penalized?"
                                                    options={[
                                                        {
                                                            value: 'true',
                                                            label: 'Yes',
                                                        },
                                                        {
                                                            value: 'false',
                                                            label: 'No',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('is_penalized', value)}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="is_refunded"
                                                    placeHolder="Is Refunded?"
                                                    options={[
                                                        {
                                                            value: 'true',
                                                            label: 'Yes',
                                                        },
                                                        {
                                                            value: 'false',
                                                            label: 'No',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('is_refunded', value)}
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectField
                                                    name="user_type"
                                                    placeHolder="Choose user type"
                                                    options={[
                                                        {
                                                            value: 'tasker',
                                                            label: 'Tasker',
                                                        },
                                                        {
                                                            value: 'client',
                                                            label: 'client',
                                                        },
                                                    ]}
                                                    handleChange={(value) => setFieldValue('user_type', value)}
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
                <RefundTable
                    data={refundData?.data?.result}
                    page={page}
                    onSetPage={setPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isSuccess={isSuccess}
                    onHandleSearch={onHandleSearch}
                    total={refundData?.data?.total_pages}
                    handleDetailModalOpen={handleDetailModalOpen}
                    onShowFilterForm={onShowFilterForm}
                />
            </PaperBox>
            <Modal
                size={'60%'}
                opened={refundDetailModal}
                onClose={() => {
                    handleDetailModalClose();
                }}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Refund Details
                    </Title>
                }>
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Cancelled By :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <Group position="apart" align="normal" mb={40}>
                    <Group position="left" spacing={15} align="normal">
                        <Avatar src={`${refundDetail?.cancelled_by?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                        <Box>
                            <Title order={6} weight={600}>
                                {refundDetail?.cancelled_by?.full_name}
                            </Title>
                            <Text color="dimmed" size={13} weight={400} mb={5}>
                                @ {refundDetail?.cancelled_by?.username}
                            </Text>
                            <Group spacing={5} mb={3}>
                                <IconMail size={16} stroke={1.75} />
                                <Text color="dimmed">{refundDetail?.cancelled_by?.email ? refundDetail?.cancelled_by?.email : '-'}</Text>
                            </Group>
                            <Group spacing={5}>
                                <IconPhone size={16} stroke={1.75} />
                                <Text color="dimmed">{refundDetail?.cancelled_by?.phone ? refundDetail?.cancelled_by?.phone : '-'}</Text>
                            </Group>
                        </Box>
                    </Group>
                    <Stack align="flex-start" spacing={0}>
                        <Text weight={500} size={'xs'}>
                            Created at : {refundDetail?.created_at ? converDateFromIsonString(refundDetail?.created_at) : '_'}
                        </Text>
                        <Text weight={500} size={'xs'}>
                            Start Date : {refundDetail?.start_date ? converDateFromIsonString(refundDetail?.start_date) : '_'}
                        </Text>
                        <Text weight={500} size={'xs'}>
                            Start Time : {refundDetail?.start_time ? convertTimeStringToAMPM(refundDetail?.start_time) : '_'}
                        </Text>
                        <Text weight={500} size={'xs'}>
                            Start Date : {refundDetail?.end_date ? converDateFromIsonString(refundDetail?.end_date) : '_'}
                        </Text>
                        <Text weight={500} size={'xs'}>
                            Start Time : {refundDetail?.end_time ? convertTimeStringToAMPM(refundDetail?.end_time) : '_'}
                        </Text>
                    </Stack>
                </Group>
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Details :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <Grid align="start">
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            1. Price
                        </Text>
                        <Box>
                            <Text weight={500} size={20}>
                                {refundDetail?.entity_service?.currency?.symbol ?? ''}{' '}
                                {refundDetail?.price ? _.ceil(Number(refundDetail?.price), 2) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            2. Earning
                        </Text>
                        <Box>
                            <Text weight={500} size={20}>
                                {refundDetail?.entity_service?.currency?.symbol ?? ''}{' '}
                                {refundDetail?.earning ? _.ceil(Number(refundDetail?.earning), 2) : '-'}
                            </Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            3. Cancelling Party
                        </Text>
                        <Box>
                            {refundDetail?.cancelling_party ? (
                                <Badge radius={'sm'} size="lg" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                                    {_.capitalize(refundDetail?.cancelling_party)}
                                </Badge>
                            ) : (
                                '-'
                            )}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            4. Status
                        </Text>
                        <Box>
                            {refundDetail?.is_compensated || refundDetail?.is_penalized || refundDetail?.is_refunded ? (
                                <Badge radius={'sm'} size="lg" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                                    {refundDetail?.is_compensated
                                        ? 'Compensated'
                                        : refundDetail?.is_penalized
                                        ? 'Penalized'
                                        : refundDetail?.is_refunded
                                        ? 'Refunded'
                                        : ''}
                                </Badge>
                            ) : (
                                <StatusBadge name={_.toLower(refundDetail?.status) ?? ''} />
                            )}
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            5. Location
                        </Text>
                        <Box>
                            <Text>{refundDetail?.location ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            6. Is Accepted
                        </Text>
                        <Box>
                            <Badge radius={'xs'} color={refundDetail?.is_accepted ? 'green' : 'red'}>
                                {refundDetail?.is_accepted ? 'Yes' : 'No'}
                            </Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            7. Is Active
                        </Text>
                        <Box>
                            <Badge radius={'xs'} color={refundDetail?.is_active ? 'green' : 'red'}>
                                {refundDetail?.is_active ? 'Yes' : 'No'}
                            </Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            8. Description
                        </Text>
                        <Box>
                            <Text>{refundDetail?.description ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            10. Cancellation Reason
                        </Text>
                        <Box>
                            <Text>{refundDetail?.cancellation_reason ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            9. Cancellation Description
                        </Text>
                        <Box>
                            <Text>{refundDetail?.cancellation_description ?? '-'}</Text>
                        </Box>
                    </Grid.Col>
                </Grid>
                {refundDetail?.requirements && refundDetail?.requirements?.length > 0 && (
                    <>
                        <Box my={20}>
                            <Divider variant="dashed" />
                            <Text weight={500} color="dimmed" my={5}>
                                Requirements :
                            </Text>
                            <Divider variant="dashed" />
                        </Box>
                        <List>
                            {refundDetail?.requirements.map((requirement, index) => (
                                <List.Item key={index}>{requirement}</List.Item>
                            ))}
                        </List>
                    </>
                )}
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Service Details :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <List>
                    <List.Item>Title : {refundDetail?.entity_service?.title ?? '_'}</List.Item>
                    <List.Item>
                        Budget :{' '}
                        {refundDetail?.entity_service?.is_range
                            ? `${refundDetail?.entity_service?.currency?.symbol ?? ''} ${
                                  refundDetail?.entity_service?.budget_from ? _.ceil(Number(refundDetail?.entity_service?.budget_from), 2) : '-'
                              } - ${refundDetail?.entity_service?.currency?.symbol ?? ''} ${
                                  refundDetail?.entity_service?.budget_to ? _.ceil(Number(refundDetail?.entity_service?.budget_to), 2) : '-'
                              }`
                            : `${refundDetail?.entity_service?.currency?.symbol ?? ''} ${
                                  refundDetail?.entity_service?.budget_from ? _.ceil(Number(refundDetail?.entity_service?.budget_from), 2) : '-'
                              }`}
                    </List.Item>
                    <List.Item>
                        Payable :{' '}
                        {refundDetail?.entity_service?.is_range
                            ? `${refundDetail?.entity_service?.currency?.symbol ?? ''} ${
                                  refundDetail?.entity_service?.payable_from ? _.ceil(Number(refundDetail?.entity_service?.payable_from), 2) : '-'
                              } - ${refundDetail?.entity_service?.currency?.symbol ?? ''} ${
                                  refundDetail?.entity_service?.payable_to ? _.ceil(Number(refundDetail?.entity_service?.payable_to), 2) : '-'
                              }`
                            : `${refundDetail?.entity_service?.currency?.symbol ?? ''} ${
                                  refundDetail?.entity_service?.payable_from ? _.ceil(Number(refundDetail?.entity_service?.payable_from), 2) : '-'
                              }`}
                    </List.Item>
                    <List.Item>Created By : {refundDetail?.entity_service?.created_by?.full_name}</List.Item>
                    <List.Item>Service : {refundDetail?.entity_service?.service?.title ?? '-'}</List.Item>
                    <List.Item>Category : {refundDetail?.entity_service?.service?.category?.name ?? '-'}</List.Item>
                </List>
                {(is_superuser || user_permissions?.includes('change_booking')) && (
                    <Box my={20}>
                        <Divider variant="dashed" />
                        <Group position="apart" py={5}>
                            <Text weight={500} color="dimmed" my={5}>
                                Refund Action :
                            </Text>
                            <Group position="right">
                                {refundDetail?.is_compensated || refundDetail?.is_penalized || refundDetail?.is_refunded ? (
                                    <Badge radius={'sm'} size="lg" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                                        {refundDetail?.is_compensated
                                            ? 'Compensated'
                                            : refundDetail?.is_penalized
                                            ? 'Penalized'
                                            : refundDetail?.is_refunded
                                            ? 'Refunded'
                                            : ''}
                                    </Badge>
                                ) : (
                                    <RefundProcess
                                        data={refundDetail}
                                        page={page}
                                        limitChange={limitChange}
                                        handleDetailModalClose={handleDetailModalClose}
                                    />
                                )}
                            </Group>
                        </Group>

                        <Divider variant="dashed" />
                    </Box>
                )}
            </Modal>
        </>
    );
};

export default Refund;
