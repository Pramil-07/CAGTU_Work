import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Button, DateRangeField, ErrorAlert, PaperBox, SelectField } from '@cagtu-cms/ui-shared';
import { BookingsFilterFormValuesProps, getFormatedDate, getPageLimit, useDark, useDataLimit } from '@cagtu-cms/util-formatter';
import { Box, CloseButton, Divider, Grid, Loader, Modal, Title, useMantineTheme } from '@mantine/core';
import { IconCalendar, IconCategory, IconCornerUpRightDouble, IconSelector, IconTool, IconUser } from '@tabler/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import BookingsTable from './BookingsTable';
import BookingDetail from './BookingDetail';

const urlsPath = urls?.cipher?.task?.bookings;
const urlsUserPath = urls?.cipher?.user;
const urlsCatPath = urls?.cipher?.category;
const urlsServicePath = urls?.cipher?.services;

const filterFormInitialData: BookingsFilterFormValuesProps = {
    booked_from: '',
    booked_to: '',
    requested_from: '',
    requested_to: '',
    is_requested: '',
    booked_range: '',
    requested_range: '',
    ordering: '',
    created_by: '',
    entity_service__created_by: '',
    service: '',
    category: '',
};

const BookingsList = ({ status }: { status: string }) => {
    const queryClient = useQueryClient();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [showFilter, setShowFilter] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchBookedUser, setSearchBookedUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [bookedUserOptions, setBookedUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchRequestedUser, setSearchRequestedUser] = useState<string>(''); // Read the value from user select field after values enter i.e; more than 3 letter
    const [requestedUserOptions, setRequestedUserOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchCategory, setSearchCategory] = useState<string>(''); // Read the value from category select field after values enter i.e; more than 3 letter
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [searchService, setSearchService] = useState<string>(''); // Read the value from service select field after values enter i.e; more than 3 letter
    const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
    const [bookingDetailId, setBookingDetailId] = useState('');
    const [bookingDetailModal, setBookingDetailModal] = useState(false);

    const [dark] = useDark();
    const theme = useMantineTheme();

    const [bookingsFilterFormData, setBookingsFilterFormData] = useState<BookingsFilterFormValuesProps>({
        ...filterFormInitialData,
    });

    const bookingsAPI = new CipherAPI(urlsPath);
    const userOptionsAPI = new CipherAPI(urlsUserPath?.path);
    const categoryOptionsAPI = new CipherAPI(urlsCatPath?.selectOptions);
    const serviceOptionsAPI = new CipherAPI(urlsServicePath?.path);

    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['bookings', page, limitChange, ...[bookingsFilterFormData], status], () =>
        bookingsAPI.list({ page, page_size: limitChange, ...bookingsFilterFormData, status: status, search: query })
    );

    // Fetch the user list from the API as the per user keywords request
    const { isFetching: isBokedUserFetching } = useQuery(['booked-user'], () => userOptionsAPI.list({ page: -1, search: searchBookedUser }), {
        enabled: !!searchBookedUser,
        onSuccess: (data) => {
            const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                return {
                    value: String(id),
                    label: `${username}`,
                };
            });
            setBookedUserOptions(options);
        },
    });

    // Fetch the user list from the API as the per user keywords request
    const { isFetching: isRequestedUserFetching } = useQuery(
        ['requested-user'],
        () => userOptionsAPI.list({ page: -1, search: searchRequestedUser }),
        {
            enabled: !!searchRequestedUser,
            onSuccess: (data) => {
                const options = data?.data.map(({ id, username }: { id: number; username: string }) => {
                    return {
                        value: String(id),
                        label: `${username}`,
                    };
                });
                setRequestedUserOptions(options);
            },
        }
    );

    // Fetch the category list from the API as the per user keywords request
    const { isFetching: isCategoryFetching } = useQuery(['category-options'], () => categoryOptionsAPI.list({ search: searchCategory }), {
        enabled: !!searchCategory,
        onSuccess: (data) => {
            const categoryOptions = data?.data.map(({ id, name }: { id: number; name: string }) => {
                return {
                    value: String(id),
                    label: name,
                };
            });
            setCategoryOptions(categoryOptions);
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

    const onHandleSearch = (query: string) => {
        setQuery(query);
        queryClient.prefetchQuery(['bookings', page, limitChange, ...[filterFormInitialData], status], () =>
            bookingsAPI.list({ search: query, page: 1, page_size: limitChange, ...bookingsFilterFormData, status: status })
        );
    };

    const onFilterFormClear = async () => {
        setBookingsFilterFormData({ ...filterFormInitialData });
        await queryClient.prefetchQuery(['bookings', page, limitChange, ...[filterFormInitialData]], () =>
            bookingsAPI.list({ page: 1, page_size: '10' })
        );
    };

    const onShowFilterForm = () => setShowFilter(true);
    const onShowFilterFormClose = () => {
        setShowFilter(false);
        setBookingsFilterFormData({ ...filterFormInitialData });
    };

    //Booking detail handle function
    const handleDetailModalOpen = (bookingId: string) => {
        setBookingDetailId(bookingId);
        setBookingDetailModal(true);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    return (
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
                            initialValues={bookingsFilterFormData}
                            onSubmit={async (values) => {
                                const dataToSend = {
                                    ...JSON.parse(JSON.stringify(values)),
                                    requested_from: values?.requested_from ? getFormatedDate(new Date(values?.requested_from)) : '',
                                    requested_to: values?.requested_to ? getFormatedDate(new Date(values?.requested_to)) : '',
                                    booked_from: values?.booked_from ? getFormatedDate(new Date(values?.booked_from)) : '',
                                    booked_to: values?.booked_to ? getFormatedDate(new Date(values?.booked_to)) : '',
                                };

                                delete dataToSend.booked_range;
                                delete dataToSend.requested_range;

                                setIsFiltering(true);
                                setBookingsFilterFormData({ ...dataToSend });
                                setPage(1);
                                await queryClient.prefetchQuery(['bookings', page, limitChange, ...[filterFormInitialData]], () =>
                                    bookingsAPI.list({
                                        ...dataToSend,
                                        page: 1,
                                        page_size: limitChange,
                                    })
                                );
                                if (isSuccess) setIsFiltering(false);
                            }}>
                            {({ handleReset, setFieldValue, dirty }) => (
                                <Form>
                                    <Grid mb={10}>
                                        <Grid.Col md={2}>
                                            <DateRangeField
                                                name="booked_range"
                                                placeHolder="Select booked range"
                                                icon={<IconCalendar size={18} stroke={1.75} />}
                                                handleDateRange={(value) => {
                                                    setFieldValue('booked_range', value);
                                                    setFieldValue('booked_from', value[0]);
                                                    setFieldValue('booked_to', value[1]);
                                                }}
                                                style={{ marginBottom: 0 }}
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={2}>
                                            <DateRangeField
                                                name="requested_range"
                                                placeHolder="Select requested range"
                                                icon={<IconCalendar size={18} stroke={1.75} />}
                                                handleDateRange={(value) => {
                                                    setFieldValue('requested_range', value);
                                                    setFieldValue('requested_from', value[0]);
                                                    setFieldValue('requested_to', value[1]);
                                                }}
                                                style={{ marginBottom: 0 }}
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={2}>
                                            <SelectField
                                                name="created_by"
                                                placeHolder="Search booked by"
                                                options={bookedUserOptions}
                                                handleChange={(value) => setFieldValue('created_by', value)}
                                                onSearchChange={(value) => {
                                                    if (value && value.length >= 3) {
                                                        setSearchBookedUser(value);
                                                    } else {
                                                        setSearchBookedUser('');
                                                    }
                                                }}
                                                rightSection={isBokedUserFetching && <Loader size="xs" />}
                                                icon={<IconUser size={18} stroke={1.75} />}
                                                searchable
                                                clearable
                                                style={{ marginBottom: 0 }}
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={2}>
                                            <SelectField
                                                name="entity_service__created_by"
                                                placeHolder="Search requested by"
                                                options={requestedUserOptions}
                                                handleChange={(value) => setFieldValue('entity_service__created_by', value)}
                                                onSearchChange={(value) => {
                                                    if (value && value.length >= 3) {
                                                        setSearchRequestedUser(value);
                                                    } else {
                                                        setSearchRequestedUser('');
                                                    }
                                                }}
                                                rightSection={isRequestedUserFetching && <Loader size="xs" />}
                                                icon={<IconUser size={18} stroke={1.75} />}
                                                searchable
                                                clearable
                                                style={{ marginBottom: 0 }}
                                            />
                                        </Grid.Col>
                                        <Grid.Col md={2}>
                                            <SelectField
                                                name="category"
                                                placeHolder="Search category"
                                                options={categoryOptions}
                                                handleChange={(value) => setFieldValue('category', value)}
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
                                            <SelectField
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
                                                    { value: 'entity_service__title', label: 'Ascending' },
                                                    { value: '-entity_service__title', label: 'Descending' },
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
            <BookingsTable
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
                handleDetailModalOpen={handleDetailModalOpen}
            />
            <Modal
                size={'60%'}
                opened={bookingDetailModal}
                onClose={() => {
                    setBookingDetailId('');
                    setBookingDetailModal(false);
                }}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Booking Details
                    </Title>
                }>
                <BookingDetail id={bookingDetailId} />
            </Modal>
        </PaperBox>
    );
};

export default BookingsList;
