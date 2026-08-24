import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PieChart from '@/components/common/PieChart';
import { axiosClient } from '@/utils/axiosClient';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title, useMantineTheme } from '@mantine/core';
import { IconListDetails } from '@tabler/icons-react';
import { Badge as MantineBadge, BadgeProps } from '@mantine/core';
import HomaaleLoader from '@/components/common/HomaaleLoader';
import { useDark } from '@/utils/helpers';

interface ShopResult {
    is_active: boolean;
    count: number;
}
interface ShopStatusResult {
    status: boolean;
    count: number;
}
interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

interface CategoryByShop {
    category__name: string;
    count: number;
}

interface ShopByProduct {
    shop__name: string;
    count: number;
}

const ShopAnalytics = () => {
    const [shop, setShop] = useState<PieChartResult[]>([]);
    const [shopStatus, setShopStatus] = useState<PieChartResult[]>([]);
    const theme = useMantineTheme();
    const dark = useDark();

    const abbreviateNumber = (number: number) => {
        if (number < 1000) return number;
        if (number >= 1000 && number < 1000000) return (number / 1000).toFixed(1) + 'K';
        if (number >= 1000000 && number < 1000000000) return (number / 1000000).toFixed(1) + 'M';
        if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
        return '0';
    };

    const {  isError, isSuccess, isLoading, data } = useQuery(
        ['merchant-shop-analytics'],
        () => axiosClient.get('analytics/user-shop/'),
        {
            onSuccess: (response) => {
                // console.log('Full response:', response);
                const shopData = response?.data?.shop_active_status?.map((val: ShopResult) => ({
                    id: val.is_active ? 'Active' : 'Inactive',
                    label: val.is_active ? 'Active' : 'Inactive',
                    value: val?.count,
                })) || [];
                const shopStatusData = response?.data?.shop_status?.map((val: ShopStatusResult) => ({
                    id: String(val?.status),
                    label: String(val?.status),
                    value: val?.count,
                })) || [];
                // console.log('Mapped productData:', shopStatusData);
                setShop(shopData)
                setShopStatus(shopStatusData);
            },
            onError: (error) => {
                console.error('Error fetching product data:', error);
            },
        }
    );

    useEffect(() => {
        console.log('Product state:', shop);
    }, [shop]);

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
                    <Grid gutter="md" mb="md">
                        <Grid.Col
                            lg={3.5}
                            md={4}
                            ml={16}
                            mb={10}
                            style={{ borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            <Box>
                                <Group position="apart" spacing={10}>
                                    <Box>
                                        <Title order={5} weight={500} size={13} mb={5}>
                                            Available Shop
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.shop_count || 0)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconListDetails />
                                    </ThemeIcon>
                                </Group>
                            </Box>
                        </Grid.Col>
                        {/*<Grid.Col*/}
                        {/*    xl={0}*/}
                        {/*    md={4}*/}
                        {/*    ml={13}*/}
                        {/*    style={{ borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}*/}
                        {/*>*/}
                        {/*    <Box>*/}
                        {/*        <Group position="apart" spacing={10}>*/}
                        {/*            <Box>*/}
                        {/*                <Title order={5} weight={500} size={13} mb={5}>*/}
                        {/*                    Deleted Product*/}
                        {/*                </Title>*/}
                        {/*                <Title weight={500}>{abbreviateNumber(data?.data?.deleted_product_count || 0)}</Title>*/}
                        {/*            </Box>*/}
                        {/*            <ThemeIcon variant="light" size={40} radius="xl" color="teal">*/}
                        {/*                <IconListDetails />*/}
                        {/*            </ThemeIcon>*/}
                        {/*        </Group>*/}
                        {/*    </Box>*/}
                        {/*</Grid.Col>*/}
                    </Grid>

                    <Grid gutter="lg" mb="xl" ml={3} >
                        <Grid.Col
                            md={3.5}
                            style={{
                                borderRadius: '10px',
                                marginLeft: '7px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            }}
                        >
                            <Box sx={{ height: 300, width: '100%' }}>
                                <Title order={5} weight={600} mb={15}>
                                    Shop  Status
                                </Title>
                                {shop?.length > 0 ? (
                                    <PieChart data={shop} />
                                ) : (
                                    <Text>No product status data available.</Text>
                                )}
                            </Box>
                        </Grid.Col>
                        <Grid.Col
                            md={3.5}
                            style={{
                                borderRadius: '10px',
                                marginLeft: '54px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            }}
                        >
                            <Box sx={{ height: 300, width: '100%' }}>
                                <Title order={5} weight={600} mb={15}>
                                    Shop Request Status
                                </Title>
                                {shopStatus?.length > 0 ? (
                                    <PieChart data={shopStatus} />
                                ) : (
                                    <Text>No product status data available.</Text>
                                )}
                            </Box>
                        </Grid.Col>
                    </Grid>
                        {/* Rest of the component (Top Rated Products and Most Popular Product by Category) */}
                        <Grid gutter="lg" ml={3}>
                        <Grid.Col
                            md={4}
                            mr="sm"
                            mb={10}
                            ml={10}
                            style={{ borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            <Box sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Most Products on shop
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Shop Name</th>
                                        <th style={{ width: 80, fontWeight: 600 }}>Total Product</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(data?.data?.shop_by_product || []).map((service: ShopByProduct, key: number) => (
                                        <tr key={key}>
                                            <td>
                                                <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                    {service?.shop__name}
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
                                    {(!data?.data?.shop_by_product || data?.data?.shop_by_product.length === 0) && (
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
                                    Most Popular Shop by Category
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                    <tr>
                                        <th style={{ fontWeight: 600 }}>Shop</th>
                                        <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(data?.data?.shop_by_category || []).map((service: CategoryByShop, key: number) => (
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
                                    {(!data?.data?.shop_by_category || data?.data?.shop_by_category.length === 0) && (
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

export default ShopAnalytics;
