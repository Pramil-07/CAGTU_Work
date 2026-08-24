import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import * as _ from 'lodash';
import { IconCalendar, IconCalendarStats } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface BookingStatusResult {
    status: string;
    count: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

interface BookingServiceTypeResult {
    entity_service__is_requested: boolean;
    count: number;
}

const urlsPath = urls?.cipher?.analytics;

const BookingAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const bookingAnalyticsAPI = new CipherAPI(urlsPath?.booking);
    const [bookingStatus, setBookingStatus] = useState<PieChartResult[]>([]);
    const [bookingServiceType, setBookingServiceType] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['booking-analytics'], () => bookingAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const bookingStatusData = data?.data?.booking_status.map((val: BookingStatusResult) => {
                return {
                    id: _.upperFirst(val?.status),
                    label: _.upperFirst(val?.status),
                    value: val?.count,
                };
            });
            const bookingServiceTypeData = data?.data?.booking_by_service_type.map((val: BookingServiceTypeResult) => {
                return {
                    id: val?.entity_service__is_requested ? 'Task' : 'Service',
                    label: val?.entity_service__is_requested ? 'Task' : 'Service',
                    value: val?.count,
                };
            });
            setBookingStatus(bookingStatusData);
            setBookingServiceType(bookingServiceTypeData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_booking_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Booking Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Booking
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.booking_count?.total)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconCalendarStats size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Last Month Booking
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.booking_count?.last_month)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="indigo">
                                        <IconCalendar size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Booking Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={bookingStatus} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Booking Service Type
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={bookingServiceType} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default BookingAnalytics;
