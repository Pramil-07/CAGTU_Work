import React, {useState, useEffect, useMemo, useRef} from "react"
import Image from "next/image"
import {TrendingUp, Package, Users, DollarSign, Calendar, Eye, Download, Search} from "lucide-react"
import {
    Card,
    Container,
    Grid,
    Title,
    Text,
    Group,
    Button,
    TextInput,
    Badge,
    Avatar,
    Table,
    Select,
    Tabs,
    Progress,
    Box,
    Loader,
    Pagination,
    Alert, useMantineTheme, TextInputProps, Modal,
} from "@mantine/core"
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend} from "chart.js"
import {Bar} from "react-chartjs-2"
import {axiosClient} from "@/utils/axiosClient"
import {SoldData,} from "@/types/SoldProduct/SoldProductProps"
import HomaaleLoader from "@/components/common/HomaaleLoader";
import Layout from "@/components/Layout/Layout";
import Empty from "@/components/common/Empty";
import Breadcrumb from "@/components/common/BreadCrumb"
import {useDark} from "@/utils/helpers";
import {dark} from "@mui/material/styles/createPalette";
import ProductAnalytics from "@/components/merchant/ProfilePage/ProductAnalytics";
import ShopAnalytics from "@/components/merchant/ProfilePage/ShopAnalytics";
import {useBrand} from "@/hooks/useBrand";
import {DatePickerInput} from "@mantine/dates";
import dayjs from "dayjs";
import {useDebouncedValue, useMediaQuery} from "@mantine/hooks";
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { IconFilterCode } from "@tabler/icons-react"
import {IconExternalLink} from "@tabler/icons-react"
import ConvertAndFormat from "@/components/CurrencyNumberFormatter/ConvertAndFormat"
import { useCurrency } from "@/currency/CurrencyContext"

dayjs.extend(weekOfYear);
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend)

// Define CartStatus enum based on CART_STATUS_CHOICES
enum CartStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PAID = "PAID",
    RELEASED = "RELEASED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED",
}

// Reusable Metric Card component
interface MetricCardProps {
    title: string
    value: string|React.ReactNode
    icon: React.ReactNode
    trend?: string
    trendColor?: string
    subtitle?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, trendColor = "green", subtitle }) => {
    const dark = useDark();

    return (
    <Card
        withBorder
        shadow="md"
        radius="lg"
        sx={(theme) => ({
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows.lg,
                // color: dark ? "white" : "black",
            },
            padding: theme.spacing.lg,
        })}
    >
        <Group position="apart" mb="sm">
            <Text weight={600}  size="sm" c="gray.7" style={{color: dark ? "#c6c1c1" : "black",}}>{title}</Text>
            <Box sx={{color: trendColor}}>{icon}</Box>
        </Group>
        <Text size="xl" weight={700} style={{color: dark ? "#c6c1c1" : "black",}} c="dark.9">{value ||""}</Text>
        {(trend || subtitle) && (
            <Text size="xs" c="gray.6" mt={4}>
                {trend && <Text c={trendColor} component="span" weight={500}>{trend}</Text>} {subtitle}
            </Text>
        )}
    </Card>
)}

export interface CustomDateRangePickerProps {
    value: [Date | null, Date | null]
    onChange: (value: [Date | null, Date | null]) => void
    label?: string
    placeholder?: string
    clearable?: boolean
    mb?: number | string
    dropdownType?: 'popover' | 'modal'
    radius?: string
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
                                                                                value,
                                                                                onChange,
                                                                                label,
                                                                                placeholder,
                                                                                clearable = false,
                                                                                mb,
                                                                                dropdownType = 'popover',
                                                                                ...props
                                                                            }) => {
    const theme = useMantineTheme()
    const inputRef = useRef<HTMLButtonElement>(null)

    const handleChange = (newValue: [Date | null, Date | null]) => {
        onChange(newValue)
    }

    return (
        <DatePickerInput
            type="range"
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            clearable={clearable}
            ref={inputRef}
            mb={mb}
            popoverProps={{
                position: 'bottom',
                withArrow: true,
                withinPortal: dropdownType === 'popover',
            }}
            rightSection={
                clearable && (value[0] || value[1]) ? (
                    <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => onChange([null, null])}
                        sx={{ padding: 0, minWidth: 20 }}
                    >
                        ✕
                    </Button>
                ) : (
                    <Calendar size={16} />
                )
            }
            styles={{
                input: {
                    cursor: 'pointer',
                },
            }}
            {...props}
        />
    )
}

export default function SoldProducts() {
    const [data, setData] = useState<SoldData | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm,300)
    const [statusFilter, setStatusFilter] = useState<string>(CartStatus.PAID)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalRevenue, setTotalRevenue] = useState<number>(0)
    const [totalProductsSold, setTotalProductsSold] = useState<number>(0)
    const [averageOrderValue, setAverageOrderValue] = useState<number>(0)
    const [totalStock, setTotalStock] = useState<number>(0)
    const [currency , setCurrency] = useState<string | undefined>()
    // const [orderDateFrom, setOrderDateFrom] = useState<Date | null>(null);
    // const [orderDateTo, setOrderDateTo] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
    const [revenueGrowth, setRevenueGrowth] = useState<number>(0)
    const [productsSoldGrowth, setProductsSoldGrowth] = useState<number>(0)
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
    const [modalOpened, setModalOpened] = useState<boolean>(false)
    const dark = useDark();
    const theme = useMantineTheme();
    const brand = useBrand();
    const currencyLabel = brand === "cagtu" ? "AU$" : "रु";
    const isSmallScreen = useMediaQuery("(max-width: 768px)")
    const isMid = useMediaQuery('(max-width: 1200px)');
    const [rawData, setRawData] = useState<SoldData | null>(null)
    const [totalCount , setTotalCount] = useState<any>(1)
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
    const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
    const [showFilter, setShowFilter] = useState(true);
    const[exchangeInfo, setExchangeInfo] = useState<number>(89.0); 
    const today = dayjs().startOf('day');
    const currentWeek = today.week();
    const lastWeek = currentWeek - 1 > 0 ? currentWeek - 1 : 52;
    const currentMonth = today.format('MMMM');
    const lastMonth = today.subtract(1, 'month').format('MMMM');
    const currentYear = today.year();
    const lastYear = currentYear - 1;
    const{globalCurrency}=useCurrency();

    const statusOptions = [
        {value: "all", label: "All Status"},
        {value: CartStatus.DRAFT, label: "Draft"},
        {value: CartStatus.PENDING, label: "Pending"},
        {value: CartStatus.APPROVED, label: "Approved"},
        {value: CartStatus.PAID, label: "Paid"},
        {value: CartStatus.RELEASED, label: "Released"},
        {value: CartStatus.EXPIRED, label: "Expired"},
        {value: CartStatus.CANCELLED, label: "Cancelled"},
    ];
    useEffect(() => {
            const fetchExchangeRate = async () => {
                const exchangeData= await axiosClient.get(`locale/cms/exchangerate`);
                const { result } = exchangeData.data;
                // Extract value and currency code
                const rate = parseFloat(result[0]?.value); // Save only the exchange rate (e.g., 89.0)
               
                setExchangeInfo(rate);
                console.log('Extracted Exchange Info:', exchangeInfo);
    
            }
            fetchExchangeRate();
        }),[];

    // Fetch data from API with status filter
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const params: {
                    page: number;
                    totalPages: number;
                    status?: string;
                    search?:string;
                    order_date_from?: string;
                    order_date_to?: string;
                    month?: string;
                    week?: number;
                    year?: number;
                } = {
                    page: currentPage,
                    totalPages: data?.total_pages || 1,
                }
                if (statusFilter !== "all") {
                    params.status = statusFilter;
                }
                if (dateRange[0] && dateRange[1]) {
                    params.order_date_from = dayjs(dateRange[0]).format("YYYY-MM-DD");
                    params.order_date_to = dayjs(dateRange[1]).format("YYYY-MM-DD");
                }
                if (selectedMonth) {
                    if (selectedMonth === "thisMonth") {
                        params.month = currentMonth;
                    } else if (selectedMonth === "lastMonth") {
                        params.month = lastMonth;
                    } else {
                        params.month = selectedMonth;
                    }
                }
                if (selectedWeek) {
                    params.week = selectedWeek === 'thisWeek' ? currentWeek : selectedWeek === 'lastWeek' ? lastWeek : undefined;
                }
                if (selectedPeriod === "thisYear") {
                    params.order_date_from = dayjs().startOf("year").format("YYYY-MM-DD");
                    params.order_date_to = dayjs().endOf("year").format("YYYY-MM-DD");
                } else if (selectedPeriod === "lastYear") {
                    params.order_date_from = dayjs().subtract(1, "year").startOf("year").format("YYYY-MM-DD");
                    params.order_date_to = dayjs().subtract(1, "year").endOf("year").format("YYYY-MM-DD");
                }
                if(debouncedSearchTerm){
                    params.search = debouncedSearchTerm;
                }
                const response = await axiosClient.get(`/merchant/product/sold-product`, {params})
                // console.log("data of sold products ", response.data.data)
                const responseData = response.data as SoldData
                setData(responseData)
                setRawData(responseData)
                setTotalCount(response.data.total_count)
                setTotalRevenue(response.data.total_revenue)
                setTotalProductsSold(response.data.product_sold)
                setAverageOrderValue(response.data.average_oder_value)
                setTotalStock(response.data.total_stock)
                setRevenueGrowth(response.data.sales_analytics.revenue.growth_percent)
                setProductsSoldGrowth(response.data.sales_analytics.products_sold.growth_percent)
                const currency =
                response.data.data?.find((item: any) => item?.cart_item.product.local_currency_details.code )?.cart_item.product.local_currency_details.code ?? null
                setCurrency(currency)
                console.log("Currency of sold products", response.data.data?.find((item: any) => item?.cart_item.product.local_currency_details.code )?.cart_item.product.local_currency_details.code )

            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Failed to fetch sold products")
            } finally {
                setLoading(false)
            }
        }
        if ((dateRange[0] && dateRange[1]) || (!dateRange[0] && !dateRange[1])) {
            fetchData()
        }
    }, [statusFilter , selectedMonth , selectedWeek ,dateRange[0] && dateRange[1] , selectedPeriod , debouncedSearchTerm])

    // Filter products based on search term and status
    const filteredProducts = useMemo(() => {
        if (!rawData?.data) return [];

        let filtered = rawData.data;

        // Search filter
        filtered = filtered.filter((item: any) =>
            item.Seller.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.cart_item.product.SKU?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.Buyer.info?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((item: any) => item.Seller.product.sold_details.status === statusFilter);
        }

        // Date range filter
        if (dateRange[0] && dateRange[1]) {
            const start = dayjs(dateRange[0]).startOf("day");
            const end = dayjs(dateRange[1]).endOf("day");
            filtered = filtered.filter((item: any) => {
                const saleDate = dayjs(item.Seller.product.sold_details.sold_date);
                return saleDate.isAfter(start) && saleDate.isBefore(end);
            });
        }

        // Month filter
        if (selectedMonth) {
            const targetMonth = selectedMonth === "thisMonth" ? currentMonth : selectedMonth === "lastMonth" ? lastMonth : selectedMonth;
            filtered = filtered.filter(
                (item: any) => dayjs(item.Seller.product.sold_details.sold_date).format("MMMM") === targetMonth
            );
        }

        // Period filter (thisMonth, lastMonth, thisYear, lastYear)
        if (selectedPeriod) {
            if (selectedPeriod === 'thisYear') {
                filtered = filtered.filter((item: any) =>
                    dayjs(item.Seller.product.sold_details.sold_date).year() === currentYear
                );
            } else if (selectedPeriod === 'lastYear') {
                filtered = filtered.filter((item: any) =>
                    dayjs(item.Seller.product.sold_details.sold_date).year() === lastYear
                );
            }
        }

        // Week filter
        if (selectedWeek) {
            const targetWeek = selectedWeek === "thisWeek" ? currentWeek : lastWeek;
            filtered = filtered.filter((item: any) =>
                dayjs(item.Seller.product.sold_details.sold_date).week() === targetWeek
            );
        }

        return filtered;
    }, [rawData, searchTerm, statusFilter, dateRange, selectedMonth, selectedWeek, selectedPeriod]);

    // Pagination
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * totalCount;
        const end = start + totalCount;
        return filteredProducts.slice(start, end);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / totalCount);

    const formatCurrency = (amount: number) => `${currency || currencyLabel} ${amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

    // Chart data for sales performance
    const salesChart = {
        data: {
            labels: filteredProducts.map((item: any) => item.Seller.product.name),
            datasets: [
                {
                    label: "Revenue",
                    data: filteredProducts.map((item: any) => item.Seller.product.sold_details.total_price),
                    backgroundColor: "rgba(59, 130, 246, 0.7)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                    borderRadius: 4,
                    color: dark ? "#fffdfd" : "transparent"
                },
                {
                    label: "Units Sold",
                    data: filteredProducts.map((item: any) => item.Seller.product.stock.cart_quantity),
                    backgroundColor: "rgba(16, 185, 129, 0.7)",
                    borderColor: "rgba(16, 185, 129, 1)",
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Amount (रु) / Units",
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Products",
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 12 },
                    },
                    grid: {
                        display: false,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "top" as const,
                    labels: {
                        boxWidth: 20,
                        padding: 20,
                        font: { size: 12 },
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                },
            },
        },
    }

    const handleStatusChange = (value: string | null) => {
        setStatusFilter(value || "all");
        setCurrentPage(1); // Reset to page 1 when status changes
    };

    const openModal = (item: any) => {
        setSelectedProduct(item);
        setModalOpened(true);
    };

    if (loading) {
        return (
            <Layout currentTitle={"Sold Products"} hideBreadCrumbs>
                <div className="flex justify-center items-center h-screen">
                    <HomaaleLoader />
                </div>
            </Layout>
        )
    }

    return (
        <>
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Product Sale Details"
                size="lg"
                radius="md"
                centered
                sx={(theme) => ({
                    '.mantine-Modal-content': {
                        backgroundColor: dark ? '#1c1c1c' : 'white',
                    },
                })}
            >
                {selectedProduct && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Group>
                        <Avatar
                            src={selectedProduct.Seller.product.product_image[0] || "/placeholder.svg"}
                            size={100}
                            radius="md"
                        />
                        </Group>
                        <Group>
                            <Text weight={600}>Product:</Text>
                            <Text>{selectedProduct.Seller.product.name}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>SKU:</Text>
                            <Text>{selectedProduct.cart_item.product.SKU}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Customer:</Text>
                            <Text>{selectedProduct.Buyer.info?.full_name || 'Unknown'}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Delivery Address:</Text>
                            <Text>{`${selectedProduct.Buyer.info?.address_line || "Unknown"}, ${selectedProduct.Buyer.info?.city || "Unknown"},${selectedProduct.Buyer.info?.country || "Unknown"}`}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Order Quantity:</Text>
                            <Text>{selectedProduct.Seller.product.stock.cart_quantity}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Total Stock:</Text>
                            <Text>{selectedProduct.Seller.product.stock.total_quantity.toLocaleString()}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Sale Price:</Text>
                            <Text>{
                            formatCurrency(selectedProduct.Seller.product.price.final_price)}</Text>
                        </Group>
                        {selectedProduct.Seller.product.sold_details.status === CartStatus.PAID && (
                        <Group>
                            <Text weight={600}>Purchased Price:</Text>
                            <Text>{selectedProduct.Seller.product.purchased_currency.symbol}{selectedProduct.Seller.product.price.final_price}</Text>
                        </Group>
                        )}
                        <Group>
                            <Text weight={600}>Discount:</Text>
                            <Text>{selectedProduct.Seller.product.price.discount_percentage}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Sale Date:</Text>
                            <Text>{new Date(selectedProduct.Seller.product.sold_details.sold_date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}</Text>
                        </Group>
                        <Group>
                            <Text weight={600}>Status:</Text>
                            <Badge
                                size="md"
                                color={
                                    selectedProduct.Seller.product.sold_details.status === CartStatus.APPROVED ? "green" :
                                        selectedProduct.Seller.product.sold_details.status === CartStatus.PENDING ? "yellow" :
                                            selectedProduct.Seller.product.sold_details.status === CartStatus.PAID ? "blue" :
                                                selectedProduct.Seller.product.sold_details.status === CartStatus.RELEASED ? "teal" :
                                                    selectedProduct.Seller.product.sold_details.status === CartStatus.EXPIRED ? "gray" : "red"
                                }
                                variant="filled"
                            >
                                {selectedProduct.Seller.product.sold_details.status}
                            </Badge>
                        </Group>
                    </Box>
                )}
            </Modal>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <Group position="apart" align="flex-start">
                    <Box>
                        <Title order={1} sx={(theme) => ({
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: dark ? "grey" : theme.colors.dark[9],
                        })}>
                            Sales Overview
                        </Title>
                        <Breadcrumb currentTitle={"sales overview"} items={[{name: "Merchant Dashboard", href: ""}]}/>
                        <Text c="gray.6" size="md" mt={8}>
                            Track and analyze your product sales performance
                        </Text>
                    </Box>
                </Group>

                <Card withBorder shadow="sm" radius="md" mb="md"
                      sx={{overflow: "visible"}}
                >
                    <Card.Section p="md">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex justify-between items-center w-full w-auto">
                                <Title order={3}>Filters & Search</Title>
                                <div className="flex justify-end w-80 ">
                                    {/*<TextInput*/}
                                    {/*    // label="Search Bar"*/}
                                    {/*    placeholder="Search products, SKU, or customer..."*/}
                                    {/*    value={searchTerm}*/}
                                    {/*    onChange={(e) => setSearchTerm(e.currentTarget.value)}*/}
                                    {/*    // leftSection={<Search size={16} />}*/}
                                    {/*    radius="md"*/}
                                    {/*    w="100%"*/}
                                    {/*/>*/}
                                    <button
                                        className="p-1 rounded transition-colors ml-2"
                                        aria-label="Filter"
                                        onClick={() => setShowFilter((prev: any) => !prev)}
                                    >
                                        <IconFilterCode
                                            style={{
                                                background: dark ? theme.colors.dark[6] : "#fff",
                                            }}
                                            className="w-5 h-5 hover:text-orange-400"
                                        />
                                    </button>
                                </div>
                                </div>
                            </div>
                        </Card.Section>
                        {showFilter && (
                        <Card.Section p="xs">
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                <CustomDateRangePicker
                                    label="Date Range"
                                    placeholder="select date"
                                    value={dateRange}
                                    onChange={setDateRange}
                                    // mb={23}
                                    dropdownType="popover"
                                    clearable
                                    radius="md"
                                />
                                <Select
                                    label="Status Filter"
                                    placeholder="Select Status"
                                    data={statusOptions}
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                    // clearable
                                    // mb={23}
                                    radius="md"

                                    dropdownPosition="bottom" // Explicitly set dropdown to appear below
                                    // maxDropdownHeight={200} // Limit dropdown height for scrollable list
                                />
                                <Select
                                    label={isSmallScreen ? "Month" : "Month Filter"}
                                    placeholder="Select Month"
                                    data={[
                                        { value: "thisMonth", label: "This Month" },
                                        { value: "lastMonth", label: "Last Month" },
                                        { value: "January", label: "January" },
                                        { value: "February", label: "February" },
                                        { value: "March", label: "March" },
                                        { value: "April", label: "April" },
                                        { value: "May", label: "May" },
                                        { value: "June", label: "June" },
                                        { value: "July", label: "July" },
                                        { value: "August", label: "August" },
                                        { value: "September", label: "September" },
                                        { value: "October", label: "October" },
                                        { value: "November", label: "November" },
                                        { value: "December", label: "December" },
                                    ]}
                                    value={selectedMonth}
                                    onChange={(value) => {
                                        setSelectedMonth(value);
                                        setSelectedPeriod(null);
                                    }}
                                    clearable
                                    radius="md"
                                    dropdownPosition="bottom"
                                    w="100%"
                                />
                                <Select
                                    label={isSmallScreen ? "Year" : "Year Filter"}
                                    placeholder="Select Year"
                                    data={[
                                        { value: "thisYear", label: "This Year" },
                                        { value: "lastYear", label: "Last Year" },
                                    ]}
                                    value={selectedPeriod}
                                    onChange={(value) => {
                                        setSelectedPeriod(value);
                                        setSelectedMonth(null);
                                    }}
                                    clearable
                                    radius="md"
                                    dropdownPosition="bottom"
                                    w="100%"
                                />
                                <Select
                                    label={isSmallScreen ? "Week" : "Week Filter"}
                                    placeholder="Select Week"
                                    data={[
                                        { value: "thisWeek", label: "This Week" },
                                        { value: "lastWeek", label: "Last Week" },
                                    ]}
                                    value={selectedWeek}
                                    onChange={(value) => setSelectedWeek(value)}
                                    clearable
                                    radius="md"
                                    dropdownPosition="bottom"
                                    w="100%"
                                />
                            </div>
                        </Card.Section>
                            )}
                    </Card>

                <Grid gutter="lg">
                    <Grid.Col xs={12} md={6} lg={3}>
                        <MetricCard
                            title="Total Revenue"
                            value={<ConvertAndFormat number={totalRevenue} currency={currency} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}/>}
                            icon={<DollarSign size={20} />}
                            trend={`${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
                            subtitle="from last month"
                            trendColor={revenueGrowth < 0 ? "red.6" : "teal.6"}
                        />
                    </Grid.Col>
                    <Grid.Col xs={12} md={6} lg={3}>
                        <MetricCard
                            title="Products Sold"
                            value={totalProductsSold?.toLocaleString()}
                            icon={<Package size={20} />}
                            trend={`${productsSoldGrowth > 0 ? '+' : ''}${productsSoldGrowth.toFixed(1)}%`}
                            subtitle="from last month"
                            trendColor={productsSoldGrowth < 0 ? "red.6" : "teal.6"}
                        />
                    </Grid.Col>
                    <Grid.Col xs={12} md={6} lg={3}>
                        <MetricCard
                            title="Average Order Value"
                            value={<ConvertAndFormat number={averageOrderValue} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={currency}/>}
                            icon={<TrendingUp size={20} />}
                            trend="+5.1%"
                            subtitle="from last month"
                            trendColor="green.6"
                        />
                    </Grid.Col>
                    <Grid.Col xs={12} md={6} lg={3}>
                        <MetricCard
                            title="Total Stock"
                            value={totalStock?.toLocaleString()}
                            icon={<Users size={20} />}
                            subtitle="Available inventory"
                            trendColor="purple.6"
                        />
                    </Grid.Col>
                </Grid>

                <Tabs defaultValue="sales" radius="md">
                    <Tabs.List>
                        <Tabs.Tab value="sales">Sales</Tabs.Tab>
                        <Tabs.Tab value="salesAlytics">Sales Analytics</Tabs.Tab>
                        <Tabs.Tab value="productAnalytics">Product Analytics</Tabs.Tab>
                        <Tabs.Tab value="shopAnalytics">Shop Analytics</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="sales" pt="md">
                        <Card
                            withBorder
                            shadow="md"
                            radius="lg"
                            mt="lg"
                            sx={(theme) => ({
                                background: dark ? theme.colors.dark[6] : "transparent",
                                overflow: "visible",
                                transition: "box-shadow 0.2s ease",
                                "&:hover": { boxShadow: theme.shadows.lg },
                            })}
                        >
                            <Card.Section p="lg">
                            <div className="flex justify-between items-center">
                            <Title order={3} style={{color: dark ? "#d5d1d1" : "black",}} c="dark.9">Sales
                                Details</Title>
                                <TextInput
                                    placeholder="Search products, SKU, or customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.currentTarget.value)}
                                    radius="md"
                                    w="25%"
                                />
                            </div>
                            </Card.Section>
                            <Card.Section>
                                <Box sx={{ overflowX: "auto" , backgroundColor: dark ? theme.colors.dark[6]: "white"}}>
                                    <Table
                                        highlightOnHover
                                        sx={(theme) => ({
                                            "& thead tr th": {
                                                background: dark ? theme.colors.dark[6] : "transparent",
                                                color: dark ? "#d5d1d1" : "black",
                                                fontWeight: 600,
                                                padding: theme.spacing.md,
                                            },
                                            "& tbody tr": {
                                                transition: "background 0.1s ease",
                                                "&:hover": {
                                                    background: dark ? "#201e1e" : "transparent",
                                                    color: dark ? "white" : "black",
                                                },
                                            },
                                        })}
                                    >
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Product</th>
                                            {/*<th style={{ textAlign: 'center', verticalAlign: 'middle' }}>SKU</th>*/}
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Customer</th>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Delivery Address</th>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Order Quantity</th>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Total Stock</th>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Sale Price</th>
                                            {/*<th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Discount</th>*/}
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Sale Date</th>
                                            <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={9}>
                                                    <Empty title="No data" description="No Data matching your search found." />
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map((item: any) => (
                                                <tr key={item.cart_item.id}>
                                                    <td>
                                                        <Box
                                                            sx={(theme) => ({
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: theme.spacing.xs,
                                                                textAlign: "center",
                                                                justifyContent: "center",
                                                                maxWidth: "150px",
                                                                [theme.fn.smallerThan("sm")]: {
                                                                    maxWidth: "100px",
                                                                },
                                                        })}
                                                    >
                                                        <Box
                                                            sx={(theme) => ({
                                                                width: "64px",
                                                                height: "64px",
                                                                borderRadius: theme.radius.md,
                                                                overflow: "hidden",
                                                                backgroundColor: theme.colors.gray[1],
                                                                [theme.fn.smallerThan("sm")]: {
                                                                    width: "48px",
                                                                    height: "48px",
                                                                },
                                                            })}
                                                        >
                                                            {item.Seller.product.product_image?.length ? (
                                                                <Image
                                                                    src={item.Seller.product.product_image[0] || "/placeholder.svg"}
                                                                    alt={item.Seller.product.name}
                                                                    width={64}
                                                                    height={64}
                                                                    style={{
                                                                        objectFit: "cover",
                                                                        width: "100%",
                                                                        height: "100%",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        height: "100%",
                                                                    }}
                                                                >
                                                                    <Package size={24} color="#A1A1AA"/>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <Text
                                                            weight={500}
                                                            size="sm"
                                                        >
                                                            {item.Seller.product.name}
                                                        </Text>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Box
                                                        sx={(theme) => ({
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: theme.spacing.xs,
                                                            textAlign: "center",
                                                            color : dark ? "#bab8b8" : "black",
                                                            maxWidth: "150px",
                                                            [theme.fn.smallerThan("sm")]: {
                                                                maxWidth: "100px",
                                                            },
                                                        })}
                                                    >
                                                        <Avatar
                                                            src={item.Buyer.info?.profile_image}
                                                            radius="xl"
                                                            size={48}
                                                            sx={{
                                                                color : dark ? "#bab8b8" : "black"
                                                            }}
                                                        >
                                                            {item.Buyer.info?.full_name?.charAt(0).toUpperCase() || "?"}
                                                        </Avatar>
                                                        <Text
                                                            weight={600}
                                                            size="sm"
                                                            c="dark.9"
                                                            style={{color : dark ? "#bab8b8" : "black"}}
                                                            sx={{
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {item.Buyer.info?.full_name}
                                                        </Text>
                                                    </Box>
                                                </td>
                                                <td
                                                    style={{
                                                        padding:0,
                                                        textAlign:"center"
                                                    }}>
                                                    <Box
                                                        sx={(theme) => ({
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: theme.spacing.xs,
                                                            textAlign: "center",
                                                            margin : "0 auto",
                                                            color: dark ? "#bab8b8" : "black",
                                                            maxWidth: "150px",
                                                            [theme.fn.smallerThan("sm")]: {
                                                                maxWidth: "100px",
                                                            },
                                                        })}
                                                    >
                                                        <Box>
                                                            <Text style={{display : "flex" ,justifyContent:"center", alignItems:"center"}} size="sm" c="gray.6">
                                                                {`${item.Buyer.info?.address_line || "Unknown"}, ${item.Buyer.info?.city || "Unknown"}`}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            height: "100%",
                                                        }}
                                                    >
                                                        <Badge size="md" color="teal" variant="filled">
                                                            {item.Seller.product.stock.cart_quantity}
                                                        </Badge>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            color : dark ? "#bab8b8" : "black",
                                                        }}>
                                                        <Text size="sm" style={{color : dark ? "#bab8b8" : "black"}}
                                                              c="dark.7">{item.Seller.product.stock.total_quantity.toLocaleString()}</Text>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Box
                                                        sx={(theme) => ({
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        })}
                                                    >
                                                        <Text weight={600} style={{color : dark ? "#bab8b8" : "black"}}
                                                              c="dark.9">
                                                                <ConvertAndFormat number={item.Seller.product.price.final_price} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={currency}/>
                                                                {/* {formatCurrency(item.Seller.product.price.final_price)} */}
                                                                </Text>
                                                        <Text size="sm" c="gray.5"
                                                              sx={{textDecoration: "line-through"}}>
                                                                <ConvertAndFormat number={item.Seller.product.price.original_price} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={currency}/>
                                                            {/* {formatCurrency(item.Seller.product.price.original_price)} */}
                                                        </Text>
                                                    </Box>
                                                </td>
                                                <td>
                                                    <Group spacing={6}
                                                           sx={{
                                                               display: "flex",
                                                               justifyContent: "center",
                                                               alignItems: "center",
                                                           }}
                                                    >
                                                        <Calendar size={16} style={{color : dark ? "#bab8b8" : "black"}}/>
                                                        <Text size="sm"
                                                              sx={{color : dark ? "#bab8b8" : "black"}}>
                                                            {new Date(item.Seller.product.sold_details.sold_date).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </Text>
                                                    </Group>
                                                </td>
                                                <td>
                                                    <Group
                                                        spacing={8}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Badge
                                                            size="md"
                                                            color={
                                                                item.Seller.product.sold_details.status === CartStatus.APPROVED
                                                                    ? "green"
                                                                    : item.Seller.product.sold_details.status === CartStatus.PENDING
                                                                        ? "yellow"
                                                                        : item.Seller.product.sold_details.status === CartStatus.PAID
                                                                            ? "blue"
                                                                            : item.Seller.product.sold_details.status === CartStatus.RELEASED
                                                                                ? "teal"
                                                                                : item.Seller.product.sold_details.status === CartStatus.EXPIRED
                                                                                    ? "gray"
                                                                                    : "red"
                                                            }
                                                            variant="filled"
                                                        >
                                                            {item.Seller.product.sold_details.status}
                                                        </Badge>
                                                        <Button
                                                            variant="subtle"
                                                            size="xs"
                                                            onClick={() => openModal(item)}
                                                            sx={{ padding: 0 }}
                                                        >
                                                            <IconExternalLink size={16} style={{ color: dark ? "#bab8b8" : "black" }} />
                                                        </Button>
                                                    </Group>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </Table>
                            </Box>
                        </Card.Section>
                        <Card.Section p="md">
                            <Pagination
                                total={data?.total_pages || 1}
                                sx={{justifyContent: "center"}}
                                radius={"lg"}
                                mt={28}
                                value={currentPage}
                                onChange={setCurrentPage}
                                position="center"
                            />
                        </Card.Section>
                    </Card>
                </Tabs.Panel>

                <Tabs.Panel value="salesAlytics" pt="lg">
                    <Grid gutter="lg">
                        <Grid.Col xs={12} lg={6}>
                            <Card
                                withBorder
                                shadow="md"
                                radius="lg"
                                sx={(theme) => ({
                                    background: dark ? "#191919" : "transparent",
                                    transition: "box-shadow 0.2s ease",
                                    "&:hover": {boxShadow: theme.shadows.lg},
                                })}
                            >
                                <Card.Section p="lg">
                                    <Title order={3} style={{color: dark ? "#d5d1d1" : "black", background: dark ? "#191919" : "transparent"}} c="dark.9">Sales Performance</Title>
                                </Card.Section>
                                <Card.Section p="lg">
                                    <Bar data={salesChart.data} options={salesChart.options}/>
                                </Card.Section>
                            </Card>
                        </Grid.Col>
                        <Grid.Col xs={12} lg={6}>
                            <Card
                                withBorder
                                shadow="md"
                                radius="lg"
                                sx={(theme) => ({
                                    background: dark ? "#1c1c1c" : "transparent",
                                    color: dark ? "#d5d1d1" : "transparent",
                                    transition: "box-shadow 0.2s ease",
                                    "&:hover": {boxShadow: theme.shadows.lg},
                                })}
                            >
                                <Card.Section p="lg">
                                    <Title order={3} style={{color: dark ? "#d5d1d1" : "black",}} c="dark.9">Stock Analysis</Title>
                                </Card.Section>
                                <Card.Section p="lg">
                                    <Box sx={{display: "flex", flexDirection: "column", gap: "1.5rem"}}>
                                        {filteredProducts.map((item: any) => {
                                            const soldPercentage =
                                                (item.Seller.product.stock.cart_quantity / item.Seller.product.stock.total_quantity) * 100
                                            return (
                                                <Box key={item.cart_item.id}>
                                                    <Group position="apart">
                                                        <Text weight={600} style={{color: dark ? "#d5d1d1" : "black"}} c="dark.9">{item.Seller.product.name}</Text>
                                                        <Text size="sm" c="gray.6">
                                                            {item.Seller.product.stock.cart_quantity} / {item.Seller.product.stock.total_quantity}
                                                        </Text>
                                                    </Group>
                                                        <Progress value={Math.min(soldPercentage, 100)} size="lg" radius="md" color="orange" />
                                                        <Text size="xs" c="gray.6">{soldPercentage.toFixed(2)}% sold</Text>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Card.Section>
                                </Card>
                            </Grid.Col>
                        </Grid>
                        <Card
                            withBorder
                            shadow="md"
                            radius="lg"
                            mt="lg"
                            sx={(theme) => ({
                                backgroundColor: dark ? "#1c1c1c" : "transparent",
                                transition: "box-shadow 0.2s ease",
                                "&:hover": { boxShadow: theme.shadows.lg },
                            })}
                        >
                            <Card.Section p="lg">
                                <Title order={3} style={{color: dark ? "#d5d1d1" : "black"}} c="dark.9">Revenue Breakdown</Title>
                            </Card.Section>
                            <Card.Section p="lg" style={{backgroundColor: dark ? "#1c1c1c" : "transparent"}}>
                                <Grid gutter="lg">
                                    <Grid.Col xs={12} md={4}>
                                        <Box
                                            sx={(theme) => ({
                                                textAlign: "center",
                                                p: "1.5rem",
                                                border: `1px solid ${theme.colors.gray[2]}`,
                                                borderRadius: theme.radius.md,
                                                background: dark ? "#272525" : "transparent",
                                                transition: "transform 0.2s ease",
                                                "&:hover": { transform: "translateY(-4px)" },
                                            })}
                                        >
                                            <Text size="xl" weight={700} c="teal.6">{formatCurrency(totalRevenue)} <ConvertAndFormat number={totalRevenue} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={currency??"NPR"}/></Text>
                                            <Text size="sm" c="gray.6" mt={8}>Total Revenue</Text>
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col xs={12} md={4}>
                                        <Box
                                            sx={(theme) => ({
                                                textAlign: "center",
                                                p: "1.5rem",
                                                border: `1px solid ${theme.colors.gray[2]}`,
                                                borderRadius: theme.radius.md,
                                                background: dark ? "#272525" : "transparent",
                                                transition: "transform 0.2s ease",
                                                "&:hover": { transform: "translateY(-4px)" },
                                            })}
                                        >
                                            <Text size="xl" weight={700} c="blue.6">{formatCurrency(averageOrderValue)}</Text>
                                            <Text size="sm" c="gray.6" mt={8}>Average Order Value</Text>
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col xs={12} md={4}>
                                        <Box
                                            sx={(theme) => ({
                                                textAlign: "center",
                                                p: "1.5rem",
                                                border: `1px solid ${theme.colors.gray[2]}`,
                                                borderRadius: theme.radius.md,
                                                background: dark ? "#272525" : "transparent",
                                                transition: "transform 0.2s ease",
                                                "&:hover": { transform: "translateY(-4px)" },
                                            })}
                                        >
                                            <Text size="xl" weight={700} c="purple.6">{filteredProducts.length}</Text>
                                            <Text size="sm" c="gray.6" mt={8}>Total Orders</Text>
                                        </Box>
                                    </Grid.Col>
                                </Grid>
                            </Card.Section>
                        </Card>
                    </Tabs.Panel>
                <Tabs.Panel value="productAnalytics" pt="md">
                    <div className="mt-5">
                    <ProductAnalytics/>
                    </div>
                </Tabs.Panel>
                <Tabs.Panel value="shopAnalytics" pt="md">
                    <div className="mt-5">
                        <ShopAnalytics/>
                    </div>
                </Tabs.Panel>
            </Tabs>
            </Box>
        </>
    )
}
