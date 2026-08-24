"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
    Avatar,
    Badge,
    Button,
    Tabs,
    Container,
    Grid,
    Group,
    Stack,
    Text,
    Title,
    ActionIcon,
    Center,
    Box,
    SimpleGrid,
    Card,
    ThemeIcon,
    Progress,
    Paper,
    Pagination,
    useMantineTheme,
    Table,
    TextInput,
    Select,
    NumberInput,
    Flex,
} from "@mantine/core"
import {
    IconPackage,
    IconShoppingBag,
    IconStar,
    IconTrendingUp,
    IconHeart,
    IconMapPin,
    IconEdit,
    IconBell,
    IconSettings,
    IconCalendar,
    IconHistory,
    IconMail,
    IconPhone,
    IconShield,
    IconChartBar,
    IconLayoutGrid,
    IconLayoutList,
    IconFilter,
    IconArrowAutofitDownFilled,
    IconArrowDown,
    IconArrowUp,
} from "@tabler/icons-react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader"
import StatsCard from "@/components/Profile/StatsCard"
import apiClient from "@/axiosConfig"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Transaction } from "@/DataTypes/TransactionProps"
import type { Order } from "@/DataTypes/OrderHistoryProps"
import ErrorPage from "@/components/Error/Error"
import type { CartResponse } from "@/DataTypes/PurchasedProps"
import PurchasedProductCard from "@/components/cards/PurchasedProductCard"
import { OrderTableRow } from "@/components/Profile/OrderHistory/OrderCard"
import { TransactionTableRow } from "@/components/Profile/TransactionHistoryTable/TransactionHistoryTable"
import BreadCrumbs from "@/components/common/BreadCrumbs"
import { DateInput } from "@mantine/dates"

// Types
interface Product {
    id: number | string
    name: string
    price: number
    average_rating: number
    currency?: {
        code?: string
    }
    stock?: {
        price?: number
        mrp?: number
    }
    slug?: string
    [key: string]: any
}
export interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    profile_image: string
    role?: string [];
    profile_complete_percentage: number
    is_profile_complete: boolean
    address: {
        city: string
        country: string
        postal_code: string
        state: string
        street_address: string
    }[]
    created_at: string
    totalOrders: number
    totalSpent: number
    loyaltyPoints: number
    membershipLevel: string
    completedOrders: number
    pendingOrders: number
}

// Dummy data
const dummyUser: User = {
    id: "1",
    first_name: "Alexandra",
    last_name: "chen",
    email: "alexandra.chen@example.com",
    phone: "+1 (555) 123-4567",
    profile_image: "/placeholder.svg?height=120&width=120",
    created_at: "2023-01-15",
    totalOrders: 47,
    totalSpent: 8249.75,
    loyaltyPoints: 2850,
    membershipLevel: "Premium",
    completedOrders: 44,
    pendingOrders: 3,
    profile_complete_percentage: 0,
    address: [
        {
            city: ", San Francisco",
            country: "USA",
            postal_code: "94105",
            state: "CA",
            street_address: "123 Innovation Drive",
        },
    ],
    is_profile_complete: true,
}

// API functions
async function fetchUserData(): Promise<any> {
    try {
        const response = await apiClient.get("/account/customer/profile")
        if (!response) throw new Error("Failed to fetch user data")
        return await response.data.data
    } catch (error) {
        console.error("Error fetching user data:", error)
        return dummyUser
    }
}

async function fetchTransactions(page = 1, provider = "", status = "", startDate: Date | null = null, endDate: Date | null = null, minPrice: number | null = null, maxPrice: number | null = null,sortDate:boolean): Promise<{
    result: Transaction[]
    total_pages: number
    current: number
}> {
    try {
        const queryParams = new URLSearchParams();
        if (provider) queryParams.append("provider", provider);
        if (status) queryParams.append("payment_status", status);
        if(sortDate) queryParams.append("sort_by", "date");
        if (startDate) queryParams.append("start_date", startDate.toISOString().split('T')[0]);
        if (endDate) queryParams.append("end_date", endDate.toISOString().split('T')[0]);
        if (minPrice !== null) queryParams.append("min_price", minPrice.toString());
        if (maxPrice !== null) queryParams.append("max_price", maxPrice.toString());
        queryParams.append("page", page.toString());
        const response = await apiClient.get(`/payment/transaction/?${queryParams.toString()}`)
        if (!response) throw new Error("Failed to fetch transactions")
        return response.data
    } catch (error) {
        console.error("Error fetching transactions:", error)
        return { result: [], total_pages: 0, current: 1 }
    }
}

async function fetchOrders(page = 1, orderId = "", date: Date | null = null, status = "", productName = "",sortDate:boolean): Promise<{
    result: Order[]
    total_pages: number
}> {
    try {
        const queryParams = new URLSearchParams();
        if (orderId && orderId.length >= 4) {
            const orderIdNum = parseInt(orderId, 10);
            if (!isNaN(orderIdNum)) {
                queryParams.append("order_id", orderIdNum.toString());
            }
        }
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            queryParams.append("date", formattedDate);
        }
        if(sortDate) queryParams.append("sort_by", "date");
        if (status) queryParams.append("order_status", status);
        if (productName) queryParams.append("product_id", productName);
        queryParams.append("page", page.toString());
        const response = await apiClient.get(`/checkout/order/history/?${queryParams.toString()}`)
        if (!response) throw new Error("Failed to fetch orders")
        return response.data
    } catch (error) {
        console.error("Error fetching orders:", error)
        return { result: [], total_pages: 0 }
    }
}

async function fetchPurchasedProducts(page = 1, productName = "", status = ""): Promise<{
    result: CartResponse["result"]
    total_pages: number
}> {
    try {
        const queryParams = new URLSearchParams();
        if (productName) queryParams.append("product_id", encodeURIComponent(productName));
        if (status) queryParams.append("order_status", status);
        queryParams.append("page", page.toString());
        const response = await apiClient.get(`/checkout/orderitem/?${queryParams.toString()}`);
        return {
            result: response.data.result || [],
            total_pages: response.data.total_pages || 0
        };
    } catch (error) {
        console.error("Error fetching purchased products:", error)
        return { result: [], total_pages: 0 };
    }
}

async function fetchProductList(): Promise<Product[]> {
    try {
        const response = await apiClient.get("/product/list/");
        return response.data.result || [];
    } catch (error) {
        console.error("Error fetching product list:", error)
        return [];
    }
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<CartResponse["result"]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
const validTabs = ["orders", "products", "transactions", "analytics"]
const searchParams = useSearchParams()
const initialTab = validTabs.includes(searchParams.get("tab") || "") ? searchParams.get("tab") : "orders"
const initialProductPage = searchParams.get("tab") === "products" ? parseInt(searchParams.get("page") || "1", 10) : 1
const [activeTab, setActiveTab] = useState<string | null>(initialTab)
const [productPage, setProductPage] = useState(initialProductPage)
const [productTotalPages, setProductTotalPages] = useState(0)
    const [viewMode, setViewMode] = useState<"card" | "table">("table")
    const [page, setPage] = useState(1)
    const [orderTotalPages, setOrderTotalPages] = useState(0)
    const [transactionPage, setTransactionPage] = useState(1)
    const [transactionTotalPages, setTransactionTotalPages] = useState(0)
    const [previousTab, setPreviousTab] = useState<string | null>(null)
    const [uniqueProducts, setUniqueProducts] = useState<{ value: string; label: string }[]>([])
    const [productList, setProductList] = useState<Product[]>([])
    const[sortDate, setSortDate] = useState<boolean>(false)
    const[sortTransactionDate, setSortTransactionDate] = useState<boolean>(false)
    const router = useRouter()
    const theme = useMantineTheme()

const handleTabChange = (value: string | null) => {
    setPreviousTab(activeTab)
    setActiveTab(value)

    // Reset page states when switching tabs
    if (value !== "orders") setPage(1)
    if (value !== "products") setProductPage(1)
    if (value !== "transactions") setTransactionPage(1)

    // Update the URL with the selected tab only
    const params = new URLSearchParams(searchParams)
    if (value) {
        params.set("tab", value)
        params.delete("page") // Always remove the page parameter
    } else {
        params.delete("tab")
        params.delete("page")
    }
    router.push(`/Profile?${params.toString()}`, { scroll: false })
}

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true)
            try {
                const userData = await fetchUserData()
                setUser(userData)
            } catch (error) {
                console.error("Error loading user data:", error)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    // Function to calculate estimated delivery date
    function calculateEstimatedDeliveryDate(createdAt: string, daysToAdd = 3): string | null {
        try {
            const createdDate = new Date(createdAt)
            if (isNaN(createdDate.getTime())) {
                throw new Error("Invalid created_at date")
            }
            const deliveryDate = new Date(createdDate)
            deliveryDate.setDate(createdDate.getDate() + daysToAdd)
            return deliveryDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch (error) {
            console.error("Error calculating delivery date:", error)
            return null
        }
    }

    if (loading) {
        return (
            <Box style={{ minHeight: "100vh" }}>
                <Container size="xl" py="xl">
                    <Center h={400}>
                        <MithoSweetsLoader />
                    </Center>
                </Container>
            </Box>
        )
    }

    if (!user) {
        return (
            <Box style={{ minHeight: "100vh" }}>
                <Container size="xl" py="xl">
                    <Center h={400}>
                        <Text size="lg" c="white">
                            Failed to load profile data
                        </Text>
                    </Center>
                </Container>
            </Box>
        )
    }

    const tabVariants: Variants = {
        hidden: {
            opacity: 0,
            x: 50,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            x: -50,
            scale: 0.95,
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    }

    const buttonVariants: Variants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.2, ease: "easeOut" },
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 },
        },
    }

    const iconVariants: Variants = {
        hover: {
            rotate: 360,
            scale: 1.1,
            transition: { duration: 0.3, ease: "easeInOut" },
        },
        tap: {
            scale: 0.9,
            transition: { duration: 0.1 },
        },
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
    }

    const filterVariants: Variants = {
        hidden: { height: 0, opacity: 0, overflow: "hidden" },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
    }

    const PurchasedProductTable: React.FC<{ products: CartResponse["result"] }> = ({ products }) => (
        <motion.div
            className="w-full overflow-x-auto"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="min-w-[600px]">
                <Table highlightOnHover striped>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Product Name</Table.Th>
                            <Table.Th>Store</Table.Th>
                            <Table.Th>Price</Table.Th>
                            <Table.Th>Quantity</Table.Th>
                            <Table.Th>Color</Table.Th>
                            <Table.Th>Size</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {products?.map((product, index) => (
                            <motion.tr
                                key={product.product_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: index * 0.05,
                                    duration: 0.3,
                                    ease: "easeOut",
                                }}
                                style={{ display: "table-row" }}
                            >
                                <Table.Td>
                                    <Text
                                        fw={700}
                                        size="sm"
                                        c="dark.8"
                                        className="cursor-pointer hover:text-[#e62e4d]"
                                        onClick={() => {
                                            throw new Error("Function not implemented.")
                                        }}
                                    >
                                        {product.product_name}
                                    </Text>
                                </Table.Td>
                                <Table.Td>{product.store_name}</Table.Td>
                                <Table.Td>
                                    <Text size="sm" fw={700} c="#10b981">
                                        ${product.product_price.toFixed(2)}
                                    </Text>
                                </Table.Td>
                                <Table.Td>{product.quantity}</Table.Td>
                                <Table.Td>{product.stock?.color || "N/A"}</Table.Td>
                                <Table.Td>
                                    {product.stock?.size
                                        ? `${product.stock.size} ${product.stock.size_unit}`
                                        : "N/A"}
                                </Table.Td>
                            </motion.tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </div>
        </motion.div>
    )

    return (
        <div className="w-full">
            <div className="w-full bg-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-5">
                    <BreadCrumbs currentTitle="Profile" />
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <Container size="xl" py="xl">
                    <Stack gap="xl">
                        {/* Header Section */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <Paper
                                radius="xl"
                                p={0}
                                style={{
                                    background: "#F2F7F2",
                                    boxShadow: "0 5px 30px lightgrey",
                                }}
                            >
                                <Box p={{ base: "md", sm: "lg", md: "xl" }}>
                                    <Grid align="center">
                                        <Grid.Col span={{ base: 12, md: 4 }}>
                                            <Stack align="center" gap="lg">
                                                <Box pos="relative">
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Avatar
                                                            src={user?.profile_image || "/placeholder.svg"}
                                                            alt={`${user?.first_name} ${user?.last_name}`}
                                                            size={120}
                                                            radius="50%"
                                                            style={{
                                                                border: "4px solid black",
                                                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                                                            }}
                                                        />
                                                    </motion.div>
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.1, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Number.POSITIVE_INFINITY,
                                                            ease: "easeInOut",
                                                        }}
                                                    >
                                                        <ThemeIcon
                                                            size="lg"
                                                            radius="xl"
                                                            color="teal"
                                                            style={{
                                                                position: "absolute",
                                                                bottom: 5,
                                                                right: 5,
                                                                border: "3px solid white",
                                                            }}
                                                        >
                                                            <IconShield size={16} />
                                                        </ThemeIcon>
                                                    </motion.div>
                                                </Box>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay: 0.3,
                                                        type: "spring",
                                                        stiffness: 200,
                                                        damping: 10,
                                                    }}
                                                >
                                                    <Badge
                                                        size="lg"
                                                        radius="md"
                                                        variant="light"
                                                        color="yellow"
                                                        style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", color: "black" }}
                                                    >
                                                        {user?.membershipLevel} Member
                                                    </Badge>
                                                </motion.div>
                                            </Stack>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, md: 5 }}>
                                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                                <Stack gap="md">
                                                    <motion.div variants={cardVariants}>
                                                        <Title order={1} size="h1" c="black">
                                                            {`${user?.first_name} ${user?.last_name}`}
                                                        </Title>
                                                    </motion.div>
                                                    <Stack gap="sm">
                                                        <motion.div variants={cardVariants}>
                                                            <Group gap="sm">
                                                                <IconMail size={16} color="black" />
                                                                <Text c="black" size="sm">
                                                                    {user?.email}
                                                                </Text>
                                                            </Group>
                                                        </motion.div>
                                                        <motion.div variants={cardVariants}>
                                                            <Group gap="sm">
                                                                <IconPhone size={16} color="black" />
                                                                <Text c="black" size="sm">
                                                                    {user?.phone}
                                                                </Text>
                                                            </Group>
                                                        </motion.div>
                                                        <motion.div variants={cardVariants}>
                                                            <Group gap="sm">
                                                                <IconMapPin size={16} color="black" />
                                                                <Text c="black" size="sm">
                                                                    {user?.address[0]?.city}, {user?.address[0]?.state}
                                                                </Text>
                                                            </Group>
                                                        </motion.div>
                                                        <motion.div variants={cardVariants}>
                                                            <Group gap="sm">
                                                                <IconCalendar size={16} color="black" />
                                                                <Text c="black" size="sm">
                                                                    Member since {new Date(user?.created_at || "").getFullYear()}
                                                                </Text>
                                                            </Group>
                                                        </motion.div>
                                                    </Stack>
                                                </Stack>
                                            </motion.div>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, md: 3 }}>
                                            <Stack gap="lg" align="center">
                                                <Group gap="sm">
                                                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                                                        <Button
                                                            color="crimson"
                                                            onClick={() => router.push("/Profile/form")}
                                                            leftSection={<IconEdit size={16} />}
                                                            radius="md"
                                                            size="md"
                                                        >
                                                            Edit Profile
                                                        </Button>
                                                    </motion.div>
                                                </Group>
                                                {/* <Group gap="sm">
                                                    <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                                                        <ActionIcon
                                                            variant="white"
                                                            color="dark"
                                                            size="xl"
                                                            radius="md"
                                                            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                                                        >
                                                            <IconSettings size={20} color="black" />
                                                        </ActionIcon>
                                                    </motion.div>
                                                    <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                                                        <ActionIcon
                                                            variant="white"
                                                            color="dark"
                                                            size="xl"
                                                            radius="md"
                                                            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                                                        >
                                                            <IconBell size={20} color="black" />
                                                        </ActionIcon>
                                                    </motion.div>
                                                    <motion.div variants={iconVariants} whileHover="hover" whileTap="tap">
                                                        <ActionIcon
                                                            variant="white"
                                                            color="dark"
                                                            size="xl"
                                                            radius="md"
                                                            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                                                        >
                                                            <IconHeart size={20} color="black" />
                                                        </ActionIcon>
                                                    </motion.div>
                                                </Group> */}
                                                <Box w="100%">
                                                    <Group justify="space-between" mb="xs">
                                                        <Text size="sm" c="black" fw={500}>
                                                            Profile Completion
                                                        </Text>
                                                        <Text size="sm" c="black" fw={600}>
                                                            {user?.profile_complete_percentage}%
                                                        </Text>
                                                    </Group>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                                    >
                                                        <Progress
                                                            value={user?.profile_complete_percentage}
                                                            color="teal"
                                                            size="md"
                                                            radius="xl"
                                                            style={{ backgroundColor: "grey" }}
                                                        />
                                                    </motion.div>
                                                </Box>
                                            </Stack>
                                        </Grid.Col>
                                    </Grid>
                                </Box>
                            </Paper>
                        </motion.div>

                        {/* Stats Cards */}
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                                <motion.div variants={cardVariants}>
                                    <StatsCard
                                        icon={IconPackage}
                                        label="Total Orders"
                                        value={user?.totalOrders || 0}
                                        color="#3b82f6"
                                        subtitle="Lifetime orders"
                                        trend={12}
                                    />
                                </motion.div>
                                <motion.div variants={cardVariants}>
                                    <StatsCard
                                        icon={IconStar}
                                        label="Loyalty Points"
                                        value={user?.loyaltyPoints || 0}
                                        color="#f59e0b"
                                        subtitle="Available points"
                                        trend={25}
                                    />
                                </motion.div>
                                <motion.div variants={cardVariants}>
                                    <StatsCard
                                        icon={IconTrendingUp}
                                        label="This Month"
                                        value="12 Orders"
                                        color="#8b5cf6"
                                        subtitle="Current month"
                                        trend={15}
                                    />
                                </motion.div>
                            </SimpleGrid>
                        </motion.div>

                        {/* Main Content */}
                        <Paper
                            radius="xl"
                            p={{ base: "md", sm: "lg", md: "xl" }}
                            style={{
                                backgroundColor: "white",
                                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <Tabs value={activeTab} onChange={handleTabChange} color="crimson" variant="pills" radius="md">
                                <div className="overflow-x-auto mb-6">
                                    <Tabs.List
                                        mb="xl"
                                        style={{
                                            backgroundColor: "#f8fafc",
                                            padding: "8px",
                                            borderRadius: "20px",
                                            display: "flex",
                                            gap: "8px",
                                            minWidth: "fit-content",
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            animate={{
                                                backgroundColor: previousTab === "orders" ? "rgba(220, 38, 127, 0.1)" : "transparent",
                                            }}
                                            transition={{ duration: 0.3 }}
                                            style={{ borderRadius: "12px" }}
                                        >
                                            <Tabs.Tab
                                                value="orders"
                                                leftSection={
                                                    <motion.div
                                                        animate={{ rotate: activeTab === "orders" ? 360 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <IconPackage size={18} />
                                                    </motion.div>
                                                }
                                                fw={600}
                                                style={{
                                                    padding: "10px 20px",
                                                    borderRadius: "12px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <span className="hidden sm:inline">Order History</span>
                                                <span className="sm:hidden">Orders</span>
                                            </Tabs.Tab>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            animate={{
                                                backgroundColor: previousTab === "products" ? "rgba(220, 38, 127, 0.1)" : "transparent",
                                            }}
                                            transition={{ duration: 0.3 }}
                                            style={{ borderRadius: "12px" }}
                                        >
                                            <Tabs.Tab
                                                value="products"
                                                leftSection={
                                                    <motion.div
                                                        animate={{ rotate: activeTab === "products" ? 360 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <IconShoppingBag size={18} />
                                                    </motion.div>
                                                }
                                                fw={600}
                                                style={{
                                                    padding: "10px 20px",
                                                    borderRadius: "12px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <span className="hidden sm:inline">My Purchased Products</span>
                                                <span className="sm:hidden">Products</span>
                                            </Tabs.Tab>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            animate={{
                                                backgroundColor: previousTab === "transactions" ? "rgba(220, 38, 127, 0.1)" : "transparent",
                                            }}
                                            transition={{ duration: 0.3 }}
                                            style={{ borderRadius: "12px" }}
                                        >
                                            <Tabs.Tab
                                                value="transactions"
                                                leftSection={
                                                    <motion.div
                                                        animate={{ rotate: activeTab === "transactions" ? 360 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <IconHistory size={18} />
                                                    </motion.div>
                                                }
                                                fw={600}
                                                style={{
                                                    padding: "10px 20px",
                                                    borderRadius: "12px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                Transactions
                                            </Tabs.Tab>
                                        </motion.div>

                                        {/* <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            animate={{
                                                backgroundColor: previousTab === "analytics" ? "rgba(220, 38, 127, 0.1)" : "transparent",
                                            }}
                                            transition={{ duration: 0.3 }}
                                            style={{ borderRadius: "12px" }}
                                        >
                                            <Tabs.Tab
                                                value="analytics"
                                                leftSection={
                                                    <motion.div
                                                        animate={{ rotate: activeTab === "analytics" ? 360 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <IconChartBar size={18} />
                                                    </motion.div>
                                                }
                                                fw={600}
                                                style={{
                                                    padding: "10px 20px",
                                                    borderRadius: "12px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                Analytics
                                            </Tabs.Tab>
                                        </motion.div> */}
                                    </Tabs.List>
                                </div>

                                <AnimatePresence mode="wait">
                                    <Tabs.Panel value="orders" key="orders">
                                        <OrdersTab
                                            orders={orders}
                                            orderTotalPages={orderTotalPages}
                                            page={page}
                                            setPage={setPage}
                                            uniqueProducts={productList}
                                            setUniqueProducts={setProductList}
                                            theme={theme}
                                            calculateEstimatedDeliveryDate={calculateEstimatedDeliveryDate}
                                            setOrders={setOrders}
                                            setOrderTotalPages={setOrderTotalPages}
                                            fetchPurchasedProducts={fetchProductList}
                                            fetchOrders={fetchOrders}
                                            sortDate={sortDate}
                                            setSortDate={setSortDate}

                                        />
                                    </Tabs.Panel>

                                  <Tabs.Panel value="products" key="products">
                                    <ProductsTab
                                        products={products}
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                        productList={productList}
                                        setProductList={setProductList}
                                        theme={theme}
                                        setProducts={setProducts}
                                        fetchProductList={fetchProductList}
                                        fetchPurchasedProducts={fetchPurchasedProducts}
                                        PurchasedProductTable={PurchasedProductTable}
                                        productPage={productPage}
                                        setProductPage={setProductPage}
                                        productTotalPages={productTotalPages}
                                        setProductTotalPages={setProductTotalPages}
                                    />
                                </Tabs.Panel>

                                    <Tabs.Panel value="transactions" key="transactions">
                                        <TransactionsTab
                                            transactions={transactions}
                                            transactionTotalPages={transactionTotalPages}
                                            transactionPage={transactionPage}
                                            setTransactionPage={setTransactionPage}
                                            theme={theme}
                                            setTransactions={setTransactions}
                                            setTransactionTotalPages={setTransactionTotalPages}
                                            fetchTransactions={fetchTransactions}
                                            sortDate={sortTransactionDate}
                                            setSortDate={setSortTransactionDate}
                                        />
                                    </Tabs.Panel>

                                    {/* <Tabs.Panel value="analytics" key="analytics">
                                        <AnalyticsTab
                                            user={user}
                                            containerVariants={containerVariants}
                                            cardVariants={cardVariants}
                                            tabVariants={tabVariants}
                                        />
                                    </Tabs.Panel> */}
                                </AnimatePresence>
                            </Tabs>
                        </Paper>
                    </Stack>
                </Container>
            </div>
        </div>
    )
}

const OrdersTab: React.FC<{
    orders: Order[]
    orderTotalPages: number
    page: number
    sortDate:boolean
    setPage: (page: number) => void
    uniqueProducts: Product[]
    setUniqueProducts: (list: Product[]) => void
    theme: ReturnType<typeof useMantineTheme>
    calculateEstimatedDeliveryDate: (createdAt: string, daysToAdd?: number) => string | null
    setOrders: (orders: Order[]) => void
    setOrderTotalPages: (pages: number) => void
    fetchPurchasedProducts: typeof fetchProductList
    fetchOrders: typeof fetchOrders
    setSortDate:(sortDate:boolean) => void
}> = ({ orders, orderTotalPages, page,sortDate,setSortDate, setPage, uniqueProducts, setUniqueProducts, theme, calculateEstimatedDeliveryDate, setOrders, setOrderTotalPages, fetchPurchasedProducts, fetchOrders }) => {
    const [showFilters, setShowFilters] = useState(false)
    const [tempOrderIdFilter, setTempOrderIdFilter] = useState("")
    const [tempDateFilter, setTempDateFilter] = useState<Date | null>(null)
    const [tempStatusFilter, setTempStatusFilter] = useState("")
    const [tempProductFilter, setTempProductFilter] = useState("")
    const [orderIdFilter, setOrderIdFilter] = useState("")
    const [dateFilter, setDateFilter] = useState<Date | null>(null)
    const [statusFilter, setStatusFilter] = useState("")
    const [productFilter, setProductFilter] = useState("")

    const loadUniqueProducts = async () => {
        if (uniqueProducts.length > 0) return
        const fetchedProductsResponse = await fetchPurchasedProducts()
        const uniqueProductsList: Product[] = fetchedProductsResponse;
        setUniqueProducts(uniqueProductsList);
    }

    const loadOrders = async () => {
        const { result, total_pages } = await fetchOrders(page, orderIdFilter, dateFilter, statusFilter, productFilter,sortDate)
        setOrders(result)
        setOrderTotalPages(total_pages)
    }

    useEffect(() => {
        loadUniqueProducts()
    }, [])

    useEffect(() => {
        loadOrders()
    }, [page, orderIdFilter, dateFilter, statusFilter, productFilter,sortDate])

    const applyFilters = () => {
        setOrderIdFilter(tempOrderIdFilter)
        setDateFilter(tempDateFilter)
        setStatusFilter(tempStatusFilter)
        setProductFilter(tempProductFilter)
        setPage(1)
    }

    const clearFilters = () => {
        setTempOrderIdFilter("")
        setTempDateFilter(null)
        setTempStatusFilter("")
        setTempProductFilter("")
        setOrderIdFilter("")
        setDateFilter(null)
        setStatusFilter("")
        setProductFilter("")
        setSortDate(false)
        setPage(1)
    }

    return (
        <motion.div  initial="hidden" animate="visible" exit="exit" style={{
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
        }}>
          <div>
            <Button
                variant="outline"
                color="crimson"
                leftSection={<IconFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                mb="md"
            >
                {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <AnimatePresence>
                {showFilters && (
                    <motion.div initial="hidden" animate="visible" exit="hidden">
                        <Group gap="md" mb="lg" grow preventGrowOverflow={false} wrap="wrap">
                           <Group>
                            <TextInput
                                label="Order ID"
                                placeholder="Search by Order ID"
                                value={tempOrderIdFilter}
                                onChange={(event) => setTempOrderIdFilter(event.currentTarget.value)}
                                type="number"
                                min={0}
                            />
                            <DateInput
                                label="Order Date"
                                placeholder="Select Order Date"
                                value={tempDateFilter}
                                onChange={(value) => setTempDateFilter(value ? new Date(value) : null)}
                                valueFormat="MM/DD/YYYY"
                            />
                            <Select
                                label="Status"
                                placeholder="Filter by Status"
                                value={tempStatusFilter}
                                onChange={(value) => setTempStatusFilter(value ?? "")}
                                data={[
                                    { value: "", label: "All Statuses" },
                                    { value: "Ordered", label: "Ordered" },
                                    { value: "Accepted", label: "Accepted" },
                                    { value: "Cancelled", label: "Cancelled" },
                                ]}
                                searchable
                            />
                          <Select
                                        label="Product"
                                        placeholder="Filter by Product"
                                        value={tempProductFilter}
                                        onChange={(value) => setTempProductFilter(value ?? "")}
                                        data={[
                                            { value: "", label: "All Products" },
                                            ...uniqueProducts.map((product) => ({
                                                value: product.id.toString(), // Use product_id
                                                label: product.name, // Display product name
                                            })),
                                        ]}
                                        searchable
                                    />
                          
                            </Group>
                            <Group gap="xs" mt="auto">
                                <Button color="crimson" onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" color="crimson" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </Group>
                        </Group>
                    </motion.div>
                )}
            </AnimatePresence>
            <Stack gap="lg">
                {orders?.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Order ID</Table.Th>
                                        <Table.Th><Flex gap={"md"}>Ordered Date<button onClick={()=>  setSortDate(sortDate?false:true)}> {sortDate?<IconArrowDown/>:<IconArrowUp/>}</button></Flex></Table.Th>
                                        <Table.Th>Est. Delivery</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Total</Table.Th>
                                        <Table.Th>Items</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {orders.map((order) => (
                                        <OrderTableRow key={order.id} order={order} />
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <Center>
                        <ErrorPage msg="No orders match your filters" />
                    </Center>
                )}
            </Stack>
            </div>
            {orderTotalPages > 0 && (
                <Center mt="xl"
               >
                    <Pagination
                        total={orderTotalPages}
                        value={page}
                        onChange={setPage}
                        radius="xl"
                        color={theme.colors.brand[7]}
                    />
                </Center>
            )}
        </motion.div>
    )
}

const ProductsTab: React.FC<{
    products: CartResponse["result"]
    viewMode: "card" | "table"
    setViewMode: (mode: "card" | "table") => void
    productList: Product[]
    setProductList: (list: Product[]) => void
    theme: ReturnType<typeof useMantineTheme>
    setProducts: (products: CartResponse["result"]) => void
    fetchProductList: typeof fetchProductList
    fetchPurchasedProducts: typeof fetchPurchasedProducts
    PurchasedProductTable: React.FC<{ products: CartResponse["result"] }>
    productPage: number
    setProductPage: (page: number) => void
    productTotalPages: number
    setProductTotalPages: (pages: number) => void
}> = ({ products, viewMode, setViewMode, productList, setProductList, theme, setProducts, fetchProductList, fetchPurchasedProducts, PurchasedProductTable, productPage, setProductPage, productTotalPages, setProductTotalPages }) => {
    const [showFilters, setShowFilters] = useState(false)
    const [tempProductPurchasedFilter, setTempProductPurchasedFilter] = useState("")
    const [tempStatusPurchasedFilter, setTempStatusPurchasedFilter] = useState("")
    const [productPurchasedFilter, setProductPurchasedFilter] = useState("")
    const [statusPurchasedFilter, setStatusPurchasedFilter] = useState("")
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const loadProductList = async () => {
        if (productList.length > 0) return
        const fetched = await fetchProductList()
        setProductList(fetched)
    }

    const loadProducts = async () => {
        const { result, total_pages } = await fetchPurchasedProducts(productPage, productPurchasedFilter, statusPurchasedFilter)
        setProducts(result)
        setProductTotalPages(total_pages)
    }

    useEffect(() => {
        loadProductList()
    }, [])

    useEffect(() => {
        loadProducts()
        // Update URL with current page
        const params = new URLSearchParams(searchParams)
        params.set("page", productPage.toString())
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [productPage, productPurchasedFilter, statusPurchasedFilter])

    const applyFilters = () => {
        setProductPurchasedFilter(tempProductPurchasedFilter)
        setStatusPurchasedFilter(tempStatusPurchasedFilter)
        setProductPage(1) // Reset to first page when filters change
    }

    const clearFilters = () => {
        setTempProductPurchasedFilter("")
        setTempStatusPurchasedFilter("")
        setProductPurchasedFilter("")
        setStatusPurchasedFilter("")
        setProductPage(1) // Reset to first page when clearing filters
    }

    return (
        <motion.div
        //  variants={tabVariants}
          initial="hidden" animate="visible" exit="exit" style={{
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
        }}>
            <div>
            <Button
                variant="outline"
                color="crimson"
                leftSection={<IconFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                mb="md"
            >
                {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                    //  variants={filterVariants} 
                    
                     initial="hidden" animate="visible" exit="hidden">
                        <Group  gap="md" mb="lg" justify="flex-start" grow preventGrowOverflow={false} wrap="wrap">
                          
                          <Group>

                          
                            <Select
                                label="Product"
                                placeholder="Filter by Product"
                                value={tempProductPurchasedFilter}
                                onChange={(value) => setTempProductPurchasedFilter(value ?? "")}
                                data={[
                                    { value: "", label: "All Products" },
                                    ...productList.map((product) => ({
                                        value: product.id.toString(),
                                        label: product.name,
                                    })),
                                ]}
                                searchable
                            />
                            <Select
                                label="Status"
                                placeholder="Filter by Status"
                                value={tempStatusPurchasedFilter}
                                onChange={(value) => setTempStatusPurchasedFilter(value ?? "")}
                                data={[
                                    { value: "", label: "All Statuses" },
                                    { value: "Ordered", label: "Ordered" },
                                    { value: "Accepted", label: "Accepted" },
                                    { value: "Cancelled", label: "Cancelled" },
                                ]}
                                searchable
                            />
                            </Group>
                            <Group gap="xs" mt="auto"  >
                                <Button color="crimson" onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" color="crimson" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </Group>
                        </Group>
                    </motion.div>
                )}
            </AnimatePresence>
            {products?.length > 0 && (
                <div className="flex justify-end mb-4">
                    <Group gap="xs">
                        <motion.div 
                        // variants={buttonVariants} 
                        whileHover="hover" whileTap="tap">
                            <Button
                                variant={viewMode === "card" ? "filled" : "outline"}
                                onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
                                leftSection={
                                    <motion.div
                                        animate={{ rotate: viewMode === "card" ? 0 : 180 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {viewMode === "card" ? <IconLayoutList size={16} /> : <IconLayoutGrid size={16} />}
                                    </motion.div>
                                }
                                color={theme.colors.brand[7]}
                            >
                                <span className="hidden sm:inline">{viewMode === "card" ? "Table" : "Grid"} View</span>
                                <span className="sm:hidden">{viewMode === "card" ? "Table" : "Grid"}</span>
                            </Button>
                        </motion.div>
                    </Group>
                </div>
            )}
            <Box style={{ width: "100%" }}>
                {products?.length > 0 ? (
                    viewMode === "card" ? (
                        <motion.div 
                        // variants={containerVariants}
                         initial="hidden" animate="visible">
                            <SimpleGrid
                                cols={{
                                    base: 1,
                                    xs: 1,
                                    sm: 2,
                                    md: 2,
                                    lg: 3,
                                    xl: 4,
                                }}
                                spacing="sm"
                            >
                                {products?.map((product) => (
                                    <motion.div
                                        key={product.product_id}
                                        // variants={cardVariants}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <PurchasedProductCard
                                            product={product}
                                            border={true}
                                            openModalHandler={() => {
                                                throw new Error("Function not implemented.")
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </SimpleGrid>
                        </motion.div>
                    ) : (
                        <PurchasedProductTable products={products} />
                    )
                ) : (
                    <Center>
                        <ErrorPage msg={"You have no Purchased Products"} />
                    </Center>
                )}
            </Box>
            </div>
            {productTotalPages > 0 && (
                <Center mt="xl">
                    <Pagination
                        total={productTotalPages}
                        value={productPage}
                        onChange={setProductPage}
                        radius="xl"
                        color={theme.colors.brand[7]}
                    />
                </Center>
            )}
        </motion.div>
    )
}

const TransactionsTab: React.FC<{
    transactions: Transaction[]
    sortDate:boolean
    transactionTotalPages: number
    transactionPage: number
    setTransactionPage: (page: number) => void
    theme: ReturnType<typeof useMantineTheme>
    setTransactions: (transactions: Transaction[]) => void
    setTransactionTotalPages: (pages: number) => void
    fetchTransactions: typeof fetchTransactions
    setSortDate:(sortDate:boolean) => void
}> = ({ transactions, transactionTotalPages, transactionPage,sortDate,setSortDate, setTransactionPage, theme, setTransactions, setTransactionTotalPages, fetchTransactions }) => {
    const [showFilters, setShowFilters] = useState(false)
    const [tempProviderFilter, setTempProviderFilter] = useState("")
    const [tempStatusTransactionFilter, setTempStatusTransactionFilter] = useState("")
    const [tempStartDateFilter, setTempStartDateFilter] = useState<Date | null>(null)
    const [tempEndDateFilter, setTempEndDateFilter] = useState<Date | null>(null)
    const [tempPriceRangeFilter, setTempPriceRangeFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })
    const [providerFilter, setProviderFilter] = useState("")
    const [statusTransactionFilter, setStatusTransactionFilter] = useState("")
    const [startDateFilter, setStartDateFilter] = useState<Date | null>(null)
    const [endDateFilter, setEndDateFilter] = useState<Date | null>(null)
    const [priceRangeFilter, setPriceRangeFilter] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })

    const loadTransactions = async () => {
        const { result, total_pages } = await fetchTransactions(transactionPage, providerFilter, statusTransactionFilter, startDateFilter, endDateFilter, priceRangeFilter.min, priceRangeFilter.max,sortDate)
        setTransactions(result)
        setTransactionTotalPages(total_pages)
    }

    useEffect(() => {
        loadTransactions()
    }, [transactionPage, providerFilter, statusTransactionFilter, startDateFilter, endDateFilter, priceRangeFilter,sortDate])

    const applyFilters = () => {
        setProviderFilter(tempProviderFilter)
        setStatusTransactionFilter(tempStatusTransactionFilter)
        setStartDateFilter(tempStartDateFilter)
        setEndDateFilter(tempEndDateFilter)
        setPriceRangeFilter(tempPriceRangeFilter)
        setTransactionPage(1)
    }

    const clearFilters = () => {
        setTempProviderFilter("")
        setTempStatusTransactionFilter("")
        setTempStartDateFilter(null)
        setTempEndDateFilter(null)
        setTempPriceRangeFilter({ min: null, max: null })
        setProviderFilter("")
        setStatusTransactionFilter("")
        setStartDateFilter(null)
        setEndDateFilter(null)
        setSortDate(false)
        setPriceRangeFilter({ min: null, max: null })
        setTransactionPage(1)
    }

    return (
        <motion.div 
        // variants={tabVariants} 
        initial="hidden" animate="visible" exit="exit" style={{
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
        }}>
            <div>
            <Button
                variant="outline"
                color="crimson"
                leftSection={<IconFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                mb="md"
            >
                {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                    // variants={filterVariants}
                     initial="hidden" animate="visible" exit="hidden">
                        <Group gap="md" mb="lg" grow preventGrowOverflow={false} wrap="wrap">
                            <Select
                                label="Provider"
                                placeholder="Filter by Provider"
                                value={tempProviderFilter}
                                onChange={(value) => setTempProviderFilter(value ?? "")}
                                data={[
                                    { value: "", label: "All Providers" },
                                    { value: "Stripe", label: "Stripe" },
                                    { value: "PayPal", label: "PayPal" },
                                    { value: "Cash on delivery", label: "Cash on Delivery" },
                                ]}
                                searchable
                            />
                            <Select
                                label="Status"
                                placeholder="Filter by Status"
                                value={tempStatusTransactionFilter}
                                onChange={(value) => setTempStatusTransactionFilter(value ?? "")}
                                data={[
                                    { value: "", label: "All Statuses" },
                                    { value: "initiated", label: "Initiated" },
                                    { value: "completed", label: "Completed" },
                                ]}
                                searchable
                            />
                            <DateInput
                                label="Start Date"
                                placeholder="Start Date"
                                value={tempStartDateFilter}
                                onChange={(value) => setTempStartDateFilter(value ? new Date(value) : null)}
                                valueFormat="MM/DD/YYYY"
                            />
                            <DateInput
                                label="End Date"
                                placeholder="End Date"
                                value={tempEndDateFilter}
                                onChange={(value) => setTempEndDateFilter(value ? new Date(value) : null)}
                                valueFormat="MM/DD/YYYY"
                            />
                            <NumberInput
                                label="Min Price"
                                placeholder="Min Price"
                                value={tempPriceRangeFilter.min ?? ""}
                                onChange={(value) => setTempPriceRangeFilter((prev) => ({ ...prev, min: typeof value === "number" ? value : null }))}
                                min={0}
                                decimalScale={2}
                            />
                            <NumberInput
                                label="Max Price"
                                placeholder="Max Price"
                                value={tempPriceRangeFilter.max ?? ""}
                                onChange={(value) => setTempPriceRangeFilter((prev) => ({ ...prev, max: typeof value === "number" ? value : null }))}
                                min={0}
                                decimalScale={2}
                            />
                            <Group gap="xs" mt="auto">
                                <Button color="crimson" onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" color="crimson" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </Group>
                        </Group>
                    </motion.div>
                )}
            </AnimatePresence>
            {transactions.length > 0 ? (
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Transaction ID</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th>Provider</Table.Th>
                                    <Table.Th><Flex gap={"md"}>Date <button onClick={()=>{setSortDate(sortDate?false:true)}}>{sortDate?<IconArrowDown/>:<IconArrowUp/>}</button></Flex></Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {transactions.map((transaction) => (
                                    <TransactionTableRow key={transaction.id} transaction={transaction} />
                                ))}
                            </Table.Tbody>
                        </Table>
                    </div>
                </div>
            ) : (
                <ErrorPage msg="You have no Transaction History" />
            )}
            </div>
            {transactionTotalPages > 0 && (
                <Center mt="xl">
                    <Pagination
                        total={transactionTotalPages}
                        value={transactionPage}
                        onChange={setTransactionPage}
                        radius="xl"
                        color={theme.colors.brand[7]}
                    />
                </Center>
            )}
        </motion.div>
    )
}
const AnalyticsTab: React.FC<{
    user: User
    containerVariants: Variants
    cardVariants: Variants
    tabVariants: Variants
}> = ({ user, containerVariants, cardVariants, tabVariants }) => {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" style={{
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
        }}>
            

            
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div variants={cardVariants}>
                            <Card padding="xl" radius="lg" withBorder>
                                <Stack gap="lg">
                                    <Group gap="sm">
                                        <ThemeIcon size="lg" color="violet" variant="light">
                                            <IconChartBar size={20} />
                                        </ThemeIcon>
                                        <Title order={3} c="dark.8">
                                            Order Statistics
                                        </Title>
                                    </Group>
                                    <SimpleGrid cols={2} spacing="lg">
                                        <Stack align="center" gap="xs">
                                            <Text size="2xl" fw={700} c="#10b981">
                                                {user?.completedOrders}
                                            </Text>
                                            <Text size="sm" c="dimmed" ta="center">
                                                Completed Orders
                                            </Text>
                                        </Stack>
                                        <Stack align="center" gap="xs">
                                            <Text size="2xl" fw={700} c="#f59e0b">
                                                {user?.pendingOrders}
                                            </Text>
                                            <Text size="sm" c="dimmed" ta="center">
                                                Pending Orders
                                            </Text>
                                        </Stack>
                                    </SimpleGrid>
                                    <Box>
                                        <Group justify="space-between" mb="xs">
                                            <Text size="sm" fw={500} c="dark.6">
                                                Order Success Rate
                                            </Text>
                                            <Text size="sm" fw={600} c="violet">
                                                94%
                                            </Text>
                                        </Group>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                        >
                                            <Progress value={94} color="violet" size="lg" radius="xl" />
                                        </motion.div>
                                    </Box>
                                </Stack>
                            </Card>
                        </motion.div>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div variants={cardVariants}>
                            <Card padding="xl" radius="lg" withBorder>
                                <Stack gap="lg">
                                    <Group gap="sm">
                                        <ThemeIcon size="lg" color="teal" variant="light">
                                            <IconTrendingUp size={20} />
                                        </ThemeIcon>
                                        <Title order={3} c="dark.8">
                                            Spending Insights
                                        </Title>
                                    </Group>
                                    <Stack gap="md">
                                        <Group justify="space-between">
                                            <Text size="sm" fw={500} c="dark.6">
                                                Average Order Value
                                            </Text>
                                            <Text size="lg" fw={700} c="#10b981">
                                                $175.53
                                            </Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm" fw={500} c="dark.6">
                                                Monthly Average
                                            </Text>
                                            <Text size="lg" fw={700} c="#3b82f6">
                                                $687.48
                                            </Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="sm" fw={500} c="dark.6">
                                                Savings from Discounts
                                            </Text>
                                            <Text size="lg" fw={700} c="#f59e0b">
                                                $234.67
                                            </Text>
                                        </Group>
                                    </Stack>
                                </Stack>
                            </Card>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </motion.div>
        </motion.div>
         </motion.div>
    )
}