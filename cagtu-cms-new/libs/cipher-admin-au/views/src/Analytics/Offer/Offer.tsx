import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, ThemeIcon, Title, useMantineTheme, Text, Tooltip } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import * as _ from 'lodash';
import { IconBolt, IconCoin, IconDiscount2, IconDiscountCheck, IconPercentage, IconTag } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface OfferTypeResult {
    offer_type: string;
    count: number;
}
interface OfferStatusResult {
    is_active: boolean;
    count: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

const urlsPath = urls?.cipher?.analytics;

const OfferAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const theme = useMantineTheme();
    const offerAnalyticsAPI = new CipherAPI(urlsPath?.offer);
    const [offerType, setOfferType] = useState<PieChartResult[]>([]);
    const [offerStatus, setOfferStatus] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['offer-analytics'], () => offerAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const offerTypeData =
                data?.data?.offer_type &&
                data?.data?.offer_type.map((val: OfferTypeResult) => {
                    return {
                        id: _.upperFirst(val?.offer_type),
                        label: _.upperFirst(val?.offer_type),
                        value: val?.count,
                    };
                });
            const offerStatusData =
                data?.data?.offer_status &&
                data?.data?.offer_status.map((val: OfferStatusResult) => {
                    return {
                        id: val?.is_active ? 'Active Offers' : 'Inactive Offers',
                        label: val?.is_active ? 'Active Offers' : 'Inactive Offers',
                        value: val?.count,
                    };
                });
            setOfferType(offerTypeData);
            setOfferStatus(offerStatusData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_offer_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Offer Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Offer
                                        </Title>
                                        <Group align="baseline" spacing={5}>
                                            <Title order={4} weight={500}>
                                                {abbreviateNumber(data?.data?.offer_used?.count)}/
                                                <Text component="span">{abbreviateNumber(data?.data?.offer_stats?.total)}</Text>
                                            </Title>
                                            <Text color="dimmed" component="span" size={13}>
                                                used
                                            </Text>
                                        </Group>
                                        <Group spacing={3}>
                                            <IconCoin size={16} stroke={1.72} color={theme.colors.dark['2']} />
                                            <Text color="dimmed" size={12} mr={2}>
                                                Total Amt:
                                            </Text>
                                            {_.isNull(data?.data?.offer_used?.total_amount) ? (
                                                <Text component="span" weight={500} size={12}>
                                                    0
                                                </Text>
                                            ) : (
                                                <Tooltip
                                                    label={`Rs. ${data?.data?.offer_used?.total_amount.toLocaleString()}`}
                                                    withArrow
                                                    position="bottom"
                                                    styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                    <Text component="span" weight={500} size={12}>
                                                        {abbreviateNumber(data?.data?.offer_used?.total_amount)}
                                                    </Text>
                                                </Tooltip>
                                            )}
                                        </Group>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconDiscount2 size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox sx={{ minHeight: 111 }}>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Available Offers
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.offer_stats?.available_offers)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="green">
                                        <IconDiscountCheck size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Free Offers
                                        </Title>
                                        <Group align="baseline" spacing={5}>
                                            <Title order={4} weight={500}>
                                                {abbreviateNumber(data?.data?.offer_used?.free_count)}/
                                                <Text component="span">{abbreviateNumber(data?.data?.offer_stats?.free_offers)}</Text>
                                            </Title>
                                            <Text color="dimmed" component="span" size={13}>
                                                used
                                            </Text>
                                        </Group>
                                        <Group spacing={3}>
                                            <IconCoin size={16} stroke={1.72} color={theme.colors.dark['2']} />
                                            <Text color="dimmed" size={12} mr={2}>
                                                Amount:
                                            </Text>
                                            {_.isNull(data?.data?.offer_used?.free_amount) ? (
                                                <Text component="span" weight={500} size={12}>
                                                    0
                                                </Text>
                                            ) : (
                                                <Tooltip
                                                    label={`Rs. ${data?.data?.offer_used?.free_amount.toLocaleString()}`}
                                                    withArrow
                                                    position="bottom"
                                                    styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                    <Text component="span" weight={500} size={12}>
                                                        {abbreviateNumber(data?.data?.offer_used?.free_amount)}
                                                    </Text>
                                                </Tooltip>
                                            )}
                                        </Group>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="violet">
                                        <IconBolt size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Discount Offers
                                        </Title>
                                        <Group align="baseline" spacing={5}>
                                            <Title order={4} weight={500}>
                                                {abbreviateNumber(data?.data?.offer_used?.discount_count)}/
                                                <Text component="span">{abbreviateNumber(data?.data?.offer_stats?.discount_offers)}</Text>
                                            </Title>
                                            <Text color="dimmed" component="span" size={13}>
                                                used
                                            </Text>
                                        </Group>
                                        <Group spacing={3}>
                                            <IconCoin size={16} stroke={1.72} color={theme.colors.dark['2']} />
                                            <Text color="dimmed" size={12} mr={2}>
                                                Amount:
                                            </Text>
                                            {_.isNull(data?.data?.offer_used?.discount_amount) ? (
                                                <Text component="span" weight={500} size={12}>
                                                    0
                                                </Text>
                                            ) : (
                                                <Tooltip
                                                    label={`Rs. ${data?.data?.offer_used?.discount_amount.toLocaleString()}`}
                                                    withArrow
                                                    position="bottom"
                                                    styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                    <Text component="span" weight={500} size={12}>
                                                        {abbreviateNumber(data?.data?.offer_used?.discount_amount)}
                                                    </Text>
                                                </Tooltip>
                                            )}
                                        </Group>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl">
                                        <IconPercentage size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Quantity Offers
                                        </Title>
                                        <Group align="baseline" spacing={5}>
                                            <Title order={4} weight={500}>
                                                {abbreviateNumber(data?.data?.offer_used?.quantity_count)}/
                                                <Text component="span">{abbreviateNumber(data?.data?.offer_stats?.quantity_offers)}</Text>
                                            </Title>
                                            <Text color="dimmed" component="span" size={13}>
                                                used
                                            </Text>
                                        </Group>
                                        <Group spacing={3}>
                                            <IconCoin size={16} stroke={1.72} color={theme.colors.dark['2']} />
                                            <Text color="dimmed" size={12} mr={2}>
                                                Amount:
                                            </Text>
                                            {_.isNull(data?.data?.offer_used?.quantity_amount) ? (
                                                <Text component="span" weight={500} size={12}>
                                                    0
                                                </Text>
                                            ) : (
                                                <Tooltip
                                                    label={`Rs. ${data?.data?.offer_used?.quantity_amount.toLocaleString()}`}
                                                    withArrow
                                                    position="bottom"
                                                    styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                    <Text component="span" weight={500} size={12}>
                                                        {abbreviateNumber(data?.data?.offer_used?.quantity_amount)}
                                                    </Text>
                                                </Tooltip>
                                            )}
                                        </Group>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="yellow">
                                        <IconTag size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Offer Type
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={offerType} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Offer Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={offerStatus} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default OfferAnalytics;
