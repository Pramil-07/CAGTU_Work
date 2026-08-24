import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import {
    ErrorAlert,
    PaperBox,
    Badge as MantineBadge,
    SkeletonUserAnalytics,
    PieChart,
    PageHeader,
    BarChart
} from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconCategory, IconListDetails } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface merchantResult {
    is_active: boolean;
    count: number;
}
interface merchantPremiumResult {
    is_premium: boolean;
    count: number;
}
interface merchantByCategory {
    category__name: string;
    count: number;
}
interface MerchantCity {
    city__name: string;
    count: number;
}
interface MerchantCountry {
    country__name: string;
    count: number;
}
const urlsPath = urls?.cipher?.analytics;

const MerchantAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const merchantAPI = new CipherAPI(urlsPath?.merchant);
    const [merchantPremiumData, setMerchantPremiumData] = useState([]);
    const [merchantData, setMerchantData] = useState([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['merchant-analytics'], () => merchantAPI.list(), {
        onSuccess: (data) => {
            const merchantData = data?.data?.merchant_active_status?.map((val: merchantResult) => ({
                id: val?.is_active ? 'Active' : 'Inactive',
                label: val?.is_active ? 'Active' : 'Inactive',
                value: val?.count,
            })) || [];
            const merchantPremiumData = data?.data?.merchant_premium_status?.map((val: merchantPremiumResult) => ({
                id: val?.is_premium ? 'Premium' : 'Standard',
                label: val?.is_premium ? 'Premium' : 'Standard',
                value: val?.count,
            })) || [];
            setMerchantData(merchantData);
            setMerchantPremiumData(merchantPremiumData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_merchant_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Merchant Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Available Merchant
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.merchant_count || 0)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconListDetails size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Merchant Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={merchantData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Merchant Premium Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={merchantPremiumData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Most Popular Merchant by Category
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Name</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.merchant_by_category?.length ? (
                                        data.data.merchant_by_category.map((cat: merchantByCategory, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.category__name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={cat?.count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>
                                                <Text align="center">No data available</Text>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Merchant Category by City
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Name</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.merchant_city?.length ? (
                                        data.data.merchant_city.map((cat: MerchantCity, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.city__name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={cat?.count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>
                                                <Text align="center">No data available</Text>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Merchant Category by Country
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Name</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.merchant_country?.length ? (
                                        data.data.merchant_country.map((cat: MerchantCountry, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.country__name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={cat?.count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2}>
                                                <Text align="center">No data available</Text>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default MerchantAnalytics;
