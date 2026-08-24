import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, Badge as MantineBadge, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconListDetails } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface ProductResult {
    is_active: boolean;
    count: number;
}
interface PieChartResult {
    id: string;
    label: string;
    value: number;
}
interface CategeoryByProduct {
    category__name: string;
    count: number;
}
interface TopRatedProduct {
    product__name: string;
    rating: number;
}
const urlsPath = urls?.cipher?.analytics;

const ProductAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const ProductAnalyticsAPI = new CipherAPI(urlsPath?.product);
    const [product, setProduct] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['product-analytics'], () => ProductAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const productData = data?.data?.shop_status.map((val: ProductResult) => {
                return {
                    id: val?.is_active ? 'Active' : 'Inactive',
                    label: val?.is_active ? 'Inactive' : 'Active',
                    value: val?.count,
                };
            });

            setProduct(productData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_product_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Product Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Available Product
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.product_count)}</Title>
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
                                    Product Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={product} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Top Rated Products
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Rated Product</th>
                                        <th style={{ width: 80, fontWeight: 600 }}>Total Rating</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.top_rated_product.map((service: TopRatedProduct, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                    {service?.product__name}
                                                </Text>
                                            </td>
                                            <td>
                                                <MantineBadge name={service?.rating} radius="xl" />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Most Popular Product by Category
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Product</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data?.data?.product_by_category.map((service: CategeoryByProduct, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                    {service?.category__name}
                                                </Text>
                                            </td>
                                            <td>
                                                <MantineBadge name={service?.count} radius="xl" />
                                            </td>
                                        </tr>
                                    ))}
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

export default ProductAnalytics;
