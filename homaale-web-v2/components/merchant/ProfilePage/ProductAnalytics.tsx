import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PieChart from '@/components/common/PieChart';
import { axiosClient } from '@/utils/axiosClient';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title, useMantineTheme } from '@mantine/core';
import { IconListDetails } from '@tabler/icons-react';
import { Badge as MantineBadge, BadgeProps } from '@mantine/core';
import HomaaleLoader from '@/components/common/HomaaleLoader';
import { useDark } from '@/utils/helpers';

interface ProductResult {
    is_active: boolean;
    count: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

interface CategoryByProduct {
    category__name: string;
    count: number;
}

interface TopRatedProduct {
    product__name: string;
    avg_rating: number;
}

const ProductAnalytics = () => {
    const [product, setProduct] = useState<PieChartResult[]>([]);
    const theme = useMantineTheme();
    const dark = useDark();

    const abbreviateNumber = (number: number) => {
        if (number < 1000) return number;
        if (number >= 1000 && number < 1000000) return (number / 1000).toFixed(1) + 'K';
        if (number >= 1000000 && number < 1000000000) return (number / 1000000).toFixed(1) + 'M';
        if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
        return '0';
    };

    const { isLoading, isError, isSuccess, data } = useQuery(
        ['merchant-product-analytics'],
        () => axiosClient.get('analytics/user-product/'),
        {
            onSuccess: (response) => {
                // console.log('Full response:', response);
                const productData = response?.data?.product_status?.map((val: ProductResult) => ({
                    id: val.is_active ? 'Active' : 'Inactive',
                    label: val.is_active ? 'Active' : 'Inactive',
                    value: val?.count,
                })) || [];
                // console.log('Mapped productData:', productData);
                setProduct(productData);
            },
            onError: (error) => {
                console.error('Error fetching product data:', error);
            },
        }
    );

    useEffect(() => {
        console.log('Product state:', product);
    }, [product]);

    if (isError) {
        return <Text color="red">Error loading product analytics</Text>;
    }

    return (
        <>
            {isLoading && <HomaaleLoader />}
            {isSuccess && (
                <div
                    // className="w-full drop-shadow-md mt-5 mx-auto p-4 shadow-sm rounded-2xl overflow-hidden"
                    // style={{
                    //     marginTop: '20px',
                    //     borderRadius: '20px',
                    //     boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    //     backgroundColor: dark ? theme.colors.dark[6] : '#fff',
                    // }}
                >
                    <Grid gutter="md" mb="xl">
                        <Grid.Col
                            lg={3.5}
                            md={4}
                            ml={6}
                            style={{ borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            <Box>
                                <Group position="apart" spacing={10}>
                                    <Box>
                                        <Title order={5} weight={500} size={13} mb={5}>
                                            Available Product
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.product_count || 0)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconListDetails />
                                    </ThemeIcon>
                                </Group>
                            </Box>
                        </Grid.Col>
                        <Grid.Col
                            xl={0}
                            md={4}
                            ml={13}
                            style={{ borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            <Box>
                                <Group position="apart" spacing={10}>
                                    <Box>
                                        <Title order={5} weight={500} size={13} mb={5}>
                                            Deleted Product
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.deleted_product_count || 0)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconListDetails />
                                    </ThemeIcon>
                                </Group>
                            </Box>
                        </Grid.Col>
                    </Grid>

                    <Grid gutter="lg">
                        <Grid.Col
                            md={3.5}
                            mr="sm"
                            style={{
                                borderRadius: '10px',
                                marginLeft: '7px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            }}
                        >
                            <Box sx={{ height: 300, width: '100%' }}>
                                <Title order={5} weight={600} mb={15}>
                                    Product Status
                                </Title>
                                {product?.length > 0 ? (
                                    <PieChart data={product} />
                                ) : (
                                    <Text>No product status data available.</Text>
                                )}
                            </Box>
                        </Grid.Col>

                        {/* Rest of the component (Top Rated Products and Most Popular Product by Category) */}
                        <Grid.Col
                            md={4}
                            mr="sm"
                            style={{ borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            <Box sx={{ minHeight: 379 }}>
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
                                    {(data?.data?.top_rated_product || []).map((service: TopRatedProduct, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                    {service?.product__name}
                                                </Text>
                                            </td>
                                            <td>
                                                <MantineBadge
                                                    size="lg"
                                                    radius="xs"
                                                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}
                                                >
                                                    {service?.avg_rating}
                                                </MantineBadge>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!data?.data?.top_rated_product || data?.data?.top_rated_product.length === 0) && (
                                        <tr>
                                            <td colSpan={2}>
                                                <Text color="dimmed">No top-rated products available.</Text>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </Box>
                        </Grid.Col>

                        <Grid.Col
                            md={4}
                            style={{ borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            <Box sx={{ minHeight: 379 }}>
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
                                    {(data?.data?.product_by_category || []).map((service: CategoryByProduct, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                    {service?.category__name}
                                                </Text>
                                            </td>
                                            <td>
                                                <MantineBadge
                                                    size="lg"
                                                    radius="xs"
                                                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}
                                                >
                                                    {service?.count}
                                                </MantineBadge>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!data?.data?.product_by_category || data?.data?.product_by_category.length === 0) && (
                                        <tr>
                                            <td colSpan={2}>
                                                <Text color="dimmed">No categories available.</Text>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </Box>
                        </Grid.Col>
                    </Grid>
                </div>
            )}
        </>
    );
};

export default ProductAnalytics;
