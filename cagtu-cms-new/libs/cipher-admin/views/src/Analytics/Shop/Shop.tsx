import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, Badge as MantineBadge, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconCategory, IconListDetails } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface ShopStatusResult {
    status: string;
    count: number;
}
interface shopResult {
    is_active: boolean;
    count: number;
}
interface PieChartResult {
    id: string;
    label: string;
    value: number;
}
interface CatgeoryByShop {
    category__name: string;
    count: number;
}
interface CroductByShop {
    shop__name: string;
    count: number;
}
const urlsPath = urls?.cipher?.analytics;

const ShopAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const shopAPI = new CipherAPI(urlsPath?.shop);
    const [shop, setShop] = useState<PieChartResult[]>([]);
    const [shopGroupData, setShopGroupData] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['shop-analytics'], () => shopAPI.list(), {
        onSuccess: (data) => {
            const shopData = data?.data?.shop_active_status?.map((val: shopResult) => ({
                id: val?.is_active ? 'Active' : 'Inactive',
                label: val?.is_active ? 'Active' : 'Inactive',
                value: val?.count,
            })) || [];
            const shopGroupData = data?.data?.shop_status?.map((val: ShopStatusResult) => ({
                id: String(val?.status),
                label: String(val?.status),
                value: val?.count,
            })) || [];
            setShop(shopData);
            setShopGroupData(shopGroupData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_shop_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Shop Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Available Shop
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.shop_count || 0)}</Title>
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
                                    Shop
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={shop} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Shop Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={shopGroupData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Most Popular Shop by Category
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Name</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.shop_by_category?.length ? (
                                        data.data.shop_by_category.map((cat: CatgeoryByShop, key: number) => (
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
                                    Most Popular Merchant by Product
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Name</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.shop_by_product?.length ? (
                                        data.data.shop_by_product.map((cat: CroductByShop, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.shop__name}
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

export default ShopAnalytics;
