"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Card, Title, Text, useMantineTheme, Flex } from "@mantine/core";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { FaRupeeSign, FaUsers, FaChartLine } from "react-icons/fa";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import apiClient from "@/axiosConfig";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import NoDataPage from "@/components/Error/NoDataPage";

// Type for chart data
interface ChartData {
  name: string;
  value: number;
}

// Type for low-stock product data
interface LowStockProduct {
  id: number;
  product__name: string;
  quantity: number;
}

// Mock time-series data (since API responses lack monthly data)
const generateMockMonthlyData = (
  months: number,
  baseValue: number,
  variation: number
): ChartData[] => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames.slice(0, months).map((month) => ({
    name: month,
    value: Math.round(baseValue + (Math.random() - 0.5) * variation),
  }));
};

export default function ProductAnalytics() {
  const theme = useMantineTheme();
  const brandColor = theme.colors?.brand?.[6] || theme.colors.blue[6];
const COLORS = ['#FF6B6B', '#4ECDC4'];
  // State for API data
  const [salesData, setSalesData] = useState<{
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    top_selling_products: any[];
  }>({ total_revenue: 0, total_orders: 0, average_order_value: 0, top_selling_products: [] });
  const [customerData, setCustomerData] = useState<{
    unique_customers: number;
    repeat_customers: number;
  }>({ unique_customers: 0, repeat_customers: 0 });
   const [productViewsVsPurchases, setProductViewsVsPurchases] = useState<
  { product_id: number; name: string; purchases: number }[]
>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // State for chart data
  const [overviewChartData, setOverviewChartData] = useState<ChartData[]>([]);
  const [salesChartData, setSalesChartData] = useState<ChartData[]>([]);
  const [usersChartData, setUsersChartData] = useState<ChartData[]>([]);

  // Fetch API data
  const fetchSalesData = async () => {
    try {
      const response = await apiClient.get("/analytics/sales/");
      setSalesData(response.data || { total_revenue: 0, total_orders: 0, average_order_value: 0, top_selling_products: [] });
      console.log("Sales data", response.data);
    } catch (e) {
      console.error("Error fetching sales data", e);
      setSalesData({ total_revenue: 0, total_orders: 0, average_order_value: 0, top_selling_products: [] });
    }
  };

  const fetchCustomerData = async () => {
    try {
      const response = await apiClient.get("/analytics/customers/");
      setCustomerData(response.data.result || { unique_customers: 0, repeat_customers: 0 });
      console.log("Customer data", response.data);
    } catch (e) {
      console.error("Error fetching customer data", e);
      setCustomerData({ unique_customers: 0, repeat_customers: 0 });
    }
  };



const fetchProductData = async () => {
  try {
    const response = await apiClient.get("/analytics/products/");
    const lowStock = response.data?.low_stock_products || response.data?.low_stock_products || [];
    const purchases = response.data?.product_views_vs_purchases || [];
    setLowStockProducts(lowStock);
    setProductViewsVsPurchases(purchases);
    console.log("Product data", response.data);
  } catch (e) {
    console.error("Error fetching product data", e);
    setLowStockProducts([]);
    setProductViewsVsPurchases([]);
  }
};
console.log("product purchase vs view",productViewsVsPurchases)

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSalesData(), fetchCustomerData(), fetchProductData()]);
      setIsLoading(false);
    };

    fetchData();
  }, []); // Empty dependency array to run once on mount

  // Update chart data after API data is fetched
  useEffect(() => {
    if (!isLoading) {
      setOverviewChartData(generateMockMonthlyData(8, salesData.total_revenue / 8 || 500, 300));
      setSalesChartData(generateMockMonthlyData(8, salesData.total_orders / 8 || 100, 50));
      setUsersChartData(generateMockMonthlyData(8, customerData.unique_customers / 8 || 200, 100));
    }
  }, [isLoading, salesData.total_revenue, salesData.total_orders, customerData.unique_customers]);

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <MithoSweetsLoader />
    </div>
  );
}

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg">
      <h1
        className="justify-start text-2xl font-bold mb-3"
        style={{ color: brandColor }}
      >
        Product Analytics
      </h1>

      <BreadCrumbs
        currentTitle="Product Analytics"
        items={[{ name: "Dashboard", href: "/dashboard" }]}
        className="hover:text-red-500 cursor-pointer py-2"
      />

      <Tabs defaultValue="overview" color="red">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="sales">Sales</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="products">Products</Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview" pt="md">
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap="md">
            <Card shadow="sm" padding="lg" radius="md" style={{ flex: 1 }}>
              <Flex align="center" gap="md">
                <FaRupeeSign size={40} />
                <div>
                  <Title order={4}>Total Revenue</Title>
                  <Text size="xl" fw={700}>Rs. {salesData.total_revenue.toLocaleString()}</Text>
                </div>
              </Flex>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" style={{ flex: 1 }}>
              <Flex align="center" gap="md">
                <FaUsers size={40} />
                <div>
                  <Title order={4}>Unique Customers</Title>
                  <Text size="xl" fw={700}>{customerData.unique_customers.toLocaleString()}</Text>
                </div>
              </Flex>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" style={{ flex: 1 }}>
              <Flex align="center" gap="md">
                <FaChartLine size={40} />
                <div>
                  <Title order={4}>Total Orders</Title>
                  <Text size="xl" fw={700}>{salesData.total_orders.toLocaleString()}</Text>
                </div>
              </Flex>
            </Card>
          </Flex>

          {/* <Card mt="md" shadow="sm" padding="lg" radius="md">
            <Title order={5} mb="md">
              Monthly Revenue Trend
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overviewChartData}>
                <CartesianGrid stroke="#efe" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={brandColor}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card> */}
        </Tabs.Panel>

        {/* Sales Tab */}
  <Tabs.Panel value="sales" pt="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3}  mb="md">
          Top Selling Products
        </Title>
        {salesData?.top_selling_products?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesData.top_selling_products}
                dataKey="total_sold"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {salesData.top_selling_products.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Text  >
            No data available for top-selling products.
          </Text>
        )}
      </Card>
    </Tabs.Panel>

        {/* Users Tab */}
        <Tabs.Panel value="users" pt="md">
          <Card shadow="sm" padding="lg" radius="md">
            <Title order={5} mb="md">
              Monthly New Customers Trend
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usersChartData}>
                <CartesianGrid stroke="#efe" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} users`} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={brandColor}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Tabs.Panel>

        {/* Products Tab */}
    <Tabs.Panel value="products" pt="md">
  <Card shadow="sm" padding="lg" radius="md" mb="md">
    <Title order={5} mb="md">
      Low Stock Products
    </Title>
    {lowStockProducts.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={lowStockProducts}>
          <CartesianGrid stroke="#efe" strokeDasharray="5 5" />
          <XAxis dataKey="product__name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value} units`} />
          <Bar dataKey="quantity" fill={brandColor} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <Text>No low stock products found.</Text>
    )}
  </Card>

  <Card shadow="sm" padding="lg" radius="md">
    <Title order={5} mb="md">
      Product Purchases
    </Title>
    {productViewsVsPurchases.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productViewsVsPurchases}>
          <CartesianGrid stroke="#efe" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value} purchases`} />
          <Bar dataKey="purchases" fill={theme.colors?.brand?.[7] || theme.colors.blue[7]} />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <Text>No purchase data available for products.</Text>
    )}
  </Card>
</Tabs.Panel>
      </Tabs>
    </div>
  );
}