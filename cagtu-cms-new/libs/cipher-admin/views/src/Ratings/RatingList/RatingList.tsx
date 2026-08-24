import { Button, PageHeader, PaperBox, SelectInputField } from '@cagtu-cms/ui-shared';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import {
    CipherUserContext,
    RatingListFilterFormValuesProps,
    RatingListResult,
    converDateFromIsonString,
    getPageLimit,
    useDark,
    useDataLimit,
} from '@cagtu-cms/util-formatter';
import RatingListTable from './RatingListTable';
import {
    Alert,
    Avatar,
    Badge,
    Box,
    CloseButton,
    Divider,
    Grid,
    Group,
    Loader,
    Modal,
    Rating,
    Stack,
    Text,
    Title,
    useMantineTheme,
} from '@mantine/core';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { IconAlertCircle, IconMail, IconPhone, IconTool, IconUser } from '@tabler/icons';
import _ from 'lodash';
import { Form, Formik } from 'formik';

const filterFormInitialData: RatingListFilterFormValuesProps = {
    rated_by: '',
    rated_to: '',
    rating: '',
    service: '',
    service_type: '',
};

const urlsPath = urls?.cipher?.ratings;
const urlsServicePath = urls?.cipher?.services;
const urlsUserPath = urls?.cipher?.user;

const RatingList = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [dark] = useDark();
    const theme = useMantineTheme();
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [ratingDetailModal, setRatingDetailModal] = useState(false);
    const [ratingDetail, setRatingDetail] = useState<RatingListResult>();
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [ratingListFilterFormData, setRatingListFilterFormData] = useState<RatingListFilterFormValuesProps>({
        ...filterFormInitialData,
    });
    const [searchService, setSearchService] = useState<string>(''); // Read the value from service select field after values enter i.e; more than 3 letter
    const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchRatedBy, setSearchRatedBy] = useState<string>('');
    const [ratedByOptions, setRatedByOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchRatedTo, setSearchRatedTo] = useState<string>('');
    const [ratedToOptions, setRatedToOptions] = useState<{ value: string; label: string }[]>([]);

    // Rating list get api
    const ratingListAPI = new CipherAPI(urlsPath?.list);
    const {
        isLoading,
        isFetching,
        isSuccess,
        data: ratingListData,
    } = useQuery(['rating-list', page, limitChange, ...[ratingListFilterFormData]], () =>
        ratingListAPI.list({ search: query, page, page_size: limitChange, ...ratingListFilterFormData })
    );

    //Rating list search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['rating-list', page, limitChange, ...[ratingListFilterFormData]], () =>
            ratingListAPI.list({ search: query, page_size: limitChange, ...ratingListFilterFormData })
        );
        setQuery(query);
        setPage(1);
    };

    // Fetch the service list from the API as the per user keywords request
    const serviceOptionsAPI = new CipherAPI(urlsServicePath?.path);
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

    // Fetch the rated by users list from the API as the per user keywords request
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);
    const { isFetching: isRatedByFetching } = useQuery(['rated-by-options'], () => userOptionsAPI.list({ page: -1, search: searchRatedBy }), {
        enabled: !!searchRatedBy,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setRatedByOptions(options);
        },
    });

    // Fetch the rated to users list from the API as the per user keywords request
    const { isFetching: isRatedToFetching } = useQuery(['rated-to-options'], () => userOptionsAPI.list({ page: -1, search: searchRatedTo }), {
        enabled: !!searchRatedTo,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setRatedToOptions(options);
        },
    });

    //Rating detail handle function
    const handleDetailModalOpen = (object: RatingListResult) => {
        setRatingDetail(object);
        setRatingDetailModal(true);
    };
    //Rating detail handle function
    const handleDetailModalClose = () => {
        setRatingDetail(undefined);
        setRatingDetailModal(false);
    };

    //Rating list filter form open function
    const onShowFilterForm = () => setShowFilter(true);

    //Refund filter clear function
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setRatingListFilterFormData({ ...filterFormInitialData });
    };

    const onFilterFormClear = async () => {
        setRatingListFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['rating-list', page, limitChange, ...[filterFormInitialData]], () =>
            ratingListAPI.list({ search: query, page: 1, page_size: '10', ...filterFormInitialData })
        );
    };

    if (!is_superuser && !user_permissions?.includes('view_rating')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Rating List" />
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
                                initialValues={ratingListFilterFormData}
                                onSubmit={async (values) => {
                                    const dataToSend: RatingListFilterFormValuesProps = {
                                        ...values,
                                    };
                                    setIsFiltering(true);
                                    setRatingListFilterFormData({ ...dataToSend });
                                    setPage(1);
                                    await queryClient.prefetchQuery(['rating-list', page, limitChange, ...[dataToSend]], () =>
                                        ratingListAPI.list({ search: query, page: 1, page_size: limitChange, ...dataToSend })
                                    );
                                    if (isSuccess) setIsFiltering(false);
                                }}>
                                {({ handleReset, setFieldValue, dirty, values }) => (
                                    <Form>
                                        <Grid mb={10}>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="service_type"
                                                    placeHolder="Search service type"
                                                    options={serviceOptions}
                                                    handleChange={(value) => {
                                                        setFieldValue('service_type', value);
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
                                                    name="rated_by"
                                                    placeHolder="Search rated by user"
                                                    options={ratedByOptions}
                                                    value={values?.rated_by}
                                                    handleChange={(value) => setFieldValue('rated_by', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchRatedBy(value);
                                                        } else {
                                                            setSearchRatedBy('');
                                                        }
                                                    }}
                                                    rightSection={isRatedByFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="rated_to"
                                                    placeHolder="Search rated to user"
                                                    options={ratedToOptions}
                                                    value={values?.rated_to}
                                                    handleChange={(value) => setFieldValue('rated_to', value)}
                                                    onSearchChange={(value) => {
                                                        if (value && value.length >= 3) {
                                                            setSearchRatedTo(value);
                                                        } else {
                                                            setSearchRatedTo('');
                                                        }
                                                    }}
                                                    rightSection={isRatedToFetching && <Loader size="xs" />}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
                                                    clearable
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </Grid.Col>
                                            <Grid.Col md={2}>
                                                <SelectInputField
                                                    name="rating"
                                                    placeHolder="Select rating"
                                                    options={[
                                                        {
                                                            value: '1',
                                                            label: '1',
                                                        },
                                                        {
                                                            value: '2',
                                                            label: '2',
                                                        },
                                                        {
                                                            value: '3',
                                                            label: '3',
                                                        },
                                                        {
                                                            value: '4',
                                                            label: '4',
                                                        },
                                                        {
                                                            value: '5',
                                                            label: '5',
                                                        },
                                                    ]}
                                                    value={values?.rating ?? ''}
                                                    handleChange={(value) => setFieldValue('rating', value)}
                                                    icon={<IconUser size={18} stroke={1.75} />}
                                                    searchable
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
                <RatingListTable
                    data={ratingListData?.data?.result}
                    page={page}
                    onSetPage={setPage}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    query={query}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isSuccess={isSuccess}
                    onHandleSearch={onHandleSearch}
                    total={ratingListData?.data?.total_pages}
                    handleDetailModalOpen={handleDetailModalOpen}
                    onShowFilterForm={onShowFilterForm}
                />
            </PaperBox>
            <Modal
                size={'60%'}
                opened={ratingDetailModal}
                onClose={() => {
                    handleDetailModalClose();
                }}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Rating Details
                    </Title>
                }>
                <Group position="apart" align="normal">
                    <Rating value={ratingDetail?.rating ?? 0} fractions={2} readOnly size={'lg'} />
                    <Stack align="flex-start" spacing={0}>
                        <Text weight={500} size={'xs'}>
                            Created at : {ratingDetail?.created_at ? converDateFromIsonString(ratingDetail?.created_at) : '-'}
                        </Text>
                        <Text weight={500} size={'xs'}>
                            Replied at : {ratingDetail?.replied_date ? converDateFromIsonString(ratingDetail?.replied_date) : '-'}
                        </Text>
                    </Stack>
                </Group>
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Rated By :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <Group position="left" spacing={15} align="normal" mb={20}>
                    <Avatar src={`${ratingDetail?.rated_by?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                    <Box>
                        <Title order={6} weight={600}>
                            {ratingDetail?.rated_by?.full_name}
                        </Title>
                        <Text color="dimmed" size={13} weight={400} mb={5}>
                            @ {ratingDetail?.rated_by?.username}
                        </Text>
                        <Group spacing={5} mb={3}>
                            <IconMail size={16} stroke={1.75} />
                            <Text color="dimmed">{ratingDetail?.rated_by?.email ? ratingDetail?.rated_by?.email : '-'}</Text>
                        </Group>
                        <Group spacing={5}>
                            <IconPhone size={16} stroke={1.75} />
                            <Text color="dimmed">{ratingDetail?.rated_by?.phone ? ratingDetail?.rated_by?.phone : '-'}</Text>
                        </Group>
                    </Box>
                </Group>
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Rated To :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <Group position="left" spacing={15} align="normal">
                    <Avatar src={`${ratingDetail?.rated_to?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                    <Box>
                        <Title order={6} weight={600}>
                            {ratingDetail?.rated_to?.full_name}
                        </Title>
                        <Text color="dimmed" size={13} weight={400} mb={5}>
                            @ {ratingDetail?.rated_to?.username}
                        </Text>
                        <Group spacing={5} mb={3}>
                            <IconMail size={16} stroke={1.75} />
                            <Text color="dimmed">{ratingDetail?.rated_to?.email ? ratingDetail?.rated_to?.email : '-'}</Text>
                        </Group>
                        <Group spacing={5}>
                            <IconPhone size={16} stroke={1.75} />
                            <Text color="dimmed">{ratingDetail?.rated_to?.phone ? ratingDetail?.rated_to?.phone : '-'}</Text>
                        </Group>
                    </Box>
                </Group>
                <Box my={20}>
                    <Divider variant="dashed" />
                    <Text weight={500} color="dimmed" my={5}>
                        Details :
                    </Text>
                    <Divider variant="dashed" />
                </Box>
                <Grid align="start" my={15}>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            1. Service
                        </Text>
                        <Box>
                            <Text>{ratingDetail?.entity_service ?? ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            2. Service Type
                        </Text>
                        <Box>
                            <Text>{ratingDetail?.service_type ?? ''}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            3. Is Requested
                        </Text>
                        <Box>
                            <Badge radius={'xs'} color={ratingDetail?.is_requested ? 'green' : 'red'}>
                                {ratingDetail?.is_requested ? 'Yes' : 'No'}
                            </Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            4. Is Verified
                        </Text>
                        <Box>
                            <Badge radius={'xs'} color={ratingDetail?.is_verified ? 'green' : 'red'}>
                                {ratingDetail?.is_verified ? 'Yes' : 'No'}
                            </Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            5. Review
                        </Text>
                        <Box>
                            <Box>
                                {ratingDetail?.review ? (
                                    <Text>{ratingDetail?.review}</Text>
                                ) : (
                                    <Group align="left">
                                        <Alert icon={<IconAlertCircle size="1rem" />} color="red">
                                            Not Reviewed Yet
                                        </Alert>
                                    </Group>
                                )}
                            </Box>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                            6. Reply
                        </Text>
                        <Box>
                            {ratingDetail?.reply ? (
                                <Text>{ratingDetail?.reply}</Text>
                            ) : (
                                <Group align="left">
                                    <Alert icon={<IconAlertCircle size="1rem" />} color="red">
                                        Not Rated Yet
                                    </Alert>
                                </Group>
                            )}
                        </Box>
                    </Grid.Col>
                </Grid>
            </Modal>
        </>
    );
};

export default RatingList;
