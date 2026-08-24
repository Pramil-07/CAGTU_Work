"use client";
import apiClient from "@/axiosConfig";
import React, {useEffect, useRef, useState} from "react";
import {
    Title,
    Button,
    useMantineTheme,
    Select,
    Center,
    Pagination,
    Modal,
    Flex,
    TextInput,
    Tabs,
    ActionIcon
} from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { IconX, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { LuArrowUpDown } from "react-icons/lu";
import { notifications } from "@mantine/notifications";
import DataTable from "@/components/DataTable/DataTable";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import OrderCard from "@/components/cards/OrderDetailsCard";

enum OrderStatus {
    Ordered = "Ordered",
    Accepted = "Accepted",
    BeingDelivered = "Being Delivered",
    Cancelled = "Cancelled",
    Received = "Received",
    RefundRequested = "Refund Requested",
    RefundGranted = "Refund Granted",
}

const ORDER_CHOICES = [
    ["None", "All"],
    [OrderStatus.Ordered, "Ordered"],
    [OrderStatus.Accepted, "Accepted"],
    [OrderStatus.BeingDelivered, "Being Delivered"],
    [OrderStatus.Cancelled, "Cancelled"],
    [OrderStatus.Received, "Received"],
    [OrderStatus.RefundRequested, "Refund Requested"],
    [OrderStatus.RefundGranted, "Refund Granted"],
];

const ORDER_STATUSES = [
    { value: "", label: "All Statuses" },
    { value: OrderStatus.Ordered, label: "Ordered" },
    { value: OrderStatus.Accepted, label: "Accepted" },
    { value: OrderStatus.BeingDelivered, label: "Being Delivered" },
    { value: OrderStatus.Cancelled, label: "Cancelled" },
    { value: OrderStatus.Received, label: "Received" },
    { value: OrderStatus.RefundRequested, label: "Refund Requested" },
    { value: OrderStatus.RefundGranted, label: "Refund Granted" },
];

export default function Page() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const theme = useMantineTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [pageSize, setPageSize] = useState(1);
    const [activeTab, setActiveTab] = useState<string | null>("None");
    const[openStatusModal,setOpenStatusModal]=useState(false)
    const [tempOrderIdFilter, setTempOrderIdFilter] = useState("");
    const [tempStatusFilter, setTempStatusFilter] = useState("");
    const [orderIdFilter, setOrderIdFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [tempAddressFilter, setTempAddressFilter] = useState("");
    const [orderAddressFilter, setOrderAddressFilter] = useState("");
    const [tempCreatedDateSort, setTempCreatedDateSort] = useState('');
    const [tempDeliveredDateSort, setTempDeliveredDateSort] = useState('');
    const [createdDateSort, setCreatedDateSort] = useState('');
    const [deliveredDateSort, setDeliveredDateSort] = useState('');

    
    const modalRef = useRef<HTMLDivElement>(null);

    interface Column {
        title: React.ReactNode;
        dataIndex: string;
        key: string;
        render?: (value: any, record: any) => React.ReactNode;
    }

    const columns: Column[] = [
        {
            title: (
                <div className="flex items-center">
                    Order ID
                </div>
            ),
            dataIndex: "order_id",
            key: "order_id",
            render: (order_id: number) => <span>{order_id}</span>
        },
        {
            title: (
                <div className="flex items-center">
                    Created At
                    <button
                        className="ml-2"
                        // size="xs"
                        onClick={() =>
                            setTempCreatedDateSort(
                                tempCreatedDateSort === '' ? 'created_at' : tempCreatedDateSort === 'created_at' ? '-created_at' : ''
                            )
                        }
                        // color={tempCreatedDateSort ? 'red' : 'gray'}
                    >
                        {tempCreatedDateSort === '' ? (
                            <LuArrowUpDown size={16} />
                        ) : tempCreatedDateSort === 'created_at' ? (
                            <IconArrowUp size={16} />
                        ) : (
                            <IconArrowDown size={16} />
                        )}
                    </button>
                </div>
            ),
            dataIndex: "created_at",
            key: "created_at",
            render: (created_at: string) => (
                <span>
                {created_at && new Date(created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            ),
        },
        {
            title: "Paid",
            dataIndex: "is_paid",
            key: "is_paid",
            render: (is_paid: boolean) => <span>{is_paid ? "✔️" : "❌"}</span>,
        },
        {
            title: "Delivery Address",
            dataIndex: "delivery_address",
            key: "delivery_address",
            render: (delivery_address: any) => (
                <span>
                {delivery_address
                    ? `${delivery_address.first_name} ${delivery_address.last_name}, ${delivery_address.city}, ${delivery_address.country}`
                    : "none"}
            </span>
            ),
        },
        {
            title: "Status",
            dataIndex: "order_status",
            key: "status",
        },
        {
            title: (
                <div className="flex items-center">
                    Delivered Date
                    <button
                        className="ml-2"
                        // size="xs"
                        onClick={() =>
                            setTempDeliveredDateSort(
                                tempDeliveredDateSort === '' ? 'delivered_date' : tempDeliveredDateSort === 'delivered_date' ? '-delivered_date' : ''
                            )
                        }
                        // color={tempDeliveredDateSort ? 'red' : 'gray'}
                    >
                        {tempDeliveredDateSort === '' ? (
                            <LuArrowUpDown size={16} />
                        ) : tempDeliveredDateSort === 'delivered_date' ? (
                            <IconArrowUp size={16} />
                        ) : (
                            <IconArrowDown size={16} />
                        )}
                    </button>
                </div>
            ),
            dataIndex: "delivered_date",
            key: "delivered_date",
            render: (delivered_date: string) => (
                <span>
                {delivered_date && new Date(delivered_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            ),
        },
    ];

    // Add this useEffect to handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setEditModal(false);
                setSelectedProduct(null);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setEditModal(false);
                setSelectedProduct(null);
            }
        };

        if (editModal) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [editModal]);

    const listProducts = async (
        page: number = 1,
        tabStatus: string | null = "None",
        orderId: string = "",
        status: string = "",
        address: string = "",
        createdSort: string = "",
        deliveredSort: string = ""
    ) => {
        setLoading(true);
        setError("");
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("page", page.toString());
            if (orderId) queryParams.append("order_id", orderId);
            if (status) queryParams.append("order_status", status);
            if (tabStatus && tabStatus !== "None") queryParams.append("order_status", tabStatus);
            if (address) queryParams.append("delivery_address", address);
            // Combine sorting parameters without prioritization
            const sortParams = [];
            if (createdSort) sortParams.push(createdSort);
            if (deliveredSort) sortParams.push(deliveredSort);
            if (sortParams.length > 0) queryParams.append("ordering", sortParams.join(','));

            const response = await apiClient.get(
                `/checkout/order/history/?${queryParams.toString()}`
            );
            setTotalPage(response.data.total_pages);
            setCurrentPage(response.data.current);
            setPageSize(response.data.page_size);
            setProducts(response.data.result);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Product Fetching Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange=()=>{
        setOpenStatusModal(true)
    }

    useEffect(() => {
        listProducts(currentPage, activeTab, orderIdFilter, statusFilter, orderAddressFilter, createdDateSort, deliveredDateSort);
    }, [currentPage, activeTab, orderIdFilter, statusFilter, orderAddressFilter, createdDateSort, deliveredDateSort]);

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setEditModal(true);
    };

    // useEffect(() => {
    //     listProducts();
    // }, []);

    // if (loading) {
    //     return (
    //         <div className="min-h-screen items-center flex justify-center">
    //             <MithoSweetsLoader />
    //         </div>
    //     );
    // }
    const applyFilters = () => {
        setOrderIdFilter(tempOrderIdFilter);
        setStatusFilter(tempStatusFilter);
        setOrderAddressFilter(tempAddressFilter);
        setCreatedDateSort(tempCreatedDateSort); // Apply temporary sort
        setDeliveredDateSort(tempDeliveredDateSort); // Apply temporary sort
        setCurrentPage(1); // Reset to first page
        listProducts(1, activeTab, tempOrderIdFilter, tempStatusFilter, tempAddressFilter, tempCreatedDateSort, tempDeliveredDateSort);
    };

    const clearFilters = () => {
        setTempOrderIdFilter("");
        setTempStatusFilter("");
        setTempAddressFilter("");
        setOrderIdFilter("");
        setStatusFilter("");
        setOrderAddressFilter("");
        setCreatedDateSort('');
        setDeliveredDateSort('');
        setTempCreatedDateSort(''); // Reset temporary sort
        setTempDeliveredDateSort(''); // Reset temporary sort
        setCurrentPage(1); // Reset to first page
        listProducts(1, activeTab, "", "", "", '-created_at', '');
    };

    return (
 <div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative">
                <div className="flex justify-between">
                <h1 className="text-4xl text-red-500 font-bold mb-1">Orders</h1>
            </div>
            <BreadCrumbs
                currentTitle="Orders"
                items={[{name: "Dashboard", href: "/dashboard"}]}
                className="hover:text-red-500 cursor-pointer py-2"
            />
     <Flex gap="md" direction={{ base: "column", sm: "row" }} mb="md">
         <TextInput
             placeholder="Search by Order ID"
             value={tempOrderIdFilter}
             onChange={(event) => setTempOrderIdFilter(event.currentTarget.value)}
             type="number"
             min={0}
             // style={{ flex: 1 }}
             size="md"
         />
         {/*<Select*/}
         {/*    placeholder="Filter by Status"*/}
         {/*    value={tempStatusFilter}*/}
         {/*    onChange={(value) => setTempStatusFilter(value ?? "")}*/}
         {/*    data={ORDER_STATUSES}*/}
         {/*    clearable*/}
         {/*    // style={{ flex: 1 }}*/}
         {/*/>*/}
         <TextInput
             placeholder="Search by Delivery Address"
             value={tempAddressFilter}
             onChange={(event) => setTempAddressFilter(event.currentTarget.value)}
             size="md"
         />

         <Button onClick={applyFilters} size="md">
             Apply Filters
         </Button>
         <Button variant="outline" onClick={clearFilters} size="md">
             Clear Filters
         </Button>
     </Flex>
            <Tabs value={activeTab} onChange={(value) => {
                setActiveTab(value);
                setCurrentPage(1); // Reset to first page when changing tabs
            }} color="red">
                <Tabs.List>
                    {ORDER_CHOICES.map(([value, label]) => (
                        <Tabs.Tab key={value} value={value}>
                            {label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                {ORDER_CHOICES.map(([value]) => (
                    <Tabs.Panel key={value} value={value}>
                        {error && <p className="text-red-500">{error}</p>}
                        <DataTable
                            columns={columns}
                            data={products}
                            handleEdit={handleEdit}
                            loading={loading}
                        />
                        {totalPage > 0 && !loading && (
                            <Center mt="xl">
                                <Pagination
                                    total={totalPage}
                                    value={currentPage}
                                    onChange={setCurrentPage}
                                    radius="xl"
                                    color="red"
                                />
                            </Center>
                        )}
                    </Tabs.Panel>
                ))}
            </Tabs>

            {editModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
                    <div className="bg-white p-4 rounded-xl shadow-lg border  max-h-[92vh] overflow-y-auto ">
                        <form className="space-y-6">
                            <div className="flex justify-between items-center">
                                <Title order={2} className="text-3xl font-bold" style={{color: theme.colors.brand[7]}}>
                                    View Order Details
                                </Title>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditModal(false);
                                        setSelectedProduct(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <IconX size={24} />
                                </button>
                            </div>

                            <div className="grid gap-6 p-6 bg-white shadow-lg rounded-xl">
                                {/*<div>*/}
                                {/*    <label className="block font-semibold text-gray-800 mb-3 text-xl">*/}
                                {/*        Order Details*/}
                                {/*    </label>*/}
                                {/*    <div className="shadow-lg rounded-xl p-6 bg-white">*/}
                                {/*        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">*/}
                                {/*            <div className="space-y-4">*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Order ID</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.order_id || "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Delivered Date</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.delivered_date ? new Date(selectedProduct.delivered_date).toLocaleDateString() : "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Is Paid</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.is_paid ? "Yes" : "No"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*            </div>*/}
                                {/*            <div className="space-y-4">*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Ordered</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.ordered ? "Yes" : "No"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Billing Address</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={*/}
                                {/*                            selectedProduct.billing_address*/}
                                {/*                                ? `${selectedProduct.billing_address.first_name} ${selectedProduct.billing_address.last_name}, ${selectedProduct.billing_address.city}, ${selectedProduct.billing_address.country}`*/}
                                {/*                                : "none"*/}
                                {/*                        }*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Coupon Name</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.coupon_name || "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Coupon Used</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.coupon_used ? "Yes" : "No"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*            </div>*/}
                                {/*            <div className="space-y-4">*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Discount</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.discount || "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.payment_method || "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Order Status</label>*/}
                                {/*                    <Select*/}
                                {/*                        value={selectedProduct.order_status}*/}
                                {/*                        onChange={(value) => setSelectedProduct({ ...selectedProduct, order_status: value })}*/}
                                {/*                        data={Object.values(OrderStatus).map((status) => ({*/}
                                {/*                            value: status,*/}
                                {/*                            label: status,*/}
                                {/*                        }))}*/}
                                {/*                        className="w-full"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*                <div>*/}
                                {/*                    <label className="block text-sm font-medium text-gray-600 mb-1">Total Price</label>*/}
                                {/*                    <input*/}
                                {/*                        type="text"*/}
                                {/*                        value={selectedProduct.total_price || "none"}*/}
                                {/*                        readOnly*/}
                                {/*                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"*/}
                                {/*                    />*/}
                                {/*                </div>*/}
                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/* </div>*/}
                                <OrderCard

                                    orderId={selectedProduct.id} ordered={selectedProduct.ordered} isPaid={selectedProduct.is_paid} couponUsed={selectedProduct.coupon_used} orderStatus={selectedProduct.order_status} couponName={selectedProduct.couponName} discount={selectedProduct.discount}

                                    billingAddress={selectedProduct.billing_address
                                                       ? `${selectedProduct.billing_address.first_name} ${selectedProduct.billing_address.last_name}, ${selectedProduct.billing_address.city}, ${selectedProduct.billing_address.country}`
                                                                : "none"} createdAt={selectedProduct.created_at? new Date(selectedProduct.created_at).toLocaleDateString() : "none"} totalPrice={selectedProduct.total_price} deliveredDate={selectedProduct.delivered_date ? new Date(selectedProduct.delivered_date).toLocaleDateString() : "none"} paymentMethod={selectedProduct.payment_method} handleStatusChange={handleStatusChange}/>

                                <div className="grid gap-6 p-6 bg-white shadow-lg rounded-xl">
                                <Title order={4}>Delivery Address</Title>
                                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    {selectedProduct?.delivery_address ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Name:</span>{" "}
                                                    {selectedProduct.delivery_address.first_name}{" "}
                                                    {selectedProduct.delivery_address.last_name}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Street:</span>{" "}
                                                    {selectedProduct.delivery_address.street_address}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">City:</span>{" "}
                                                    {selectedProduct.delivery_address?.city}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">State:</span>{" "}
                                                    {selectedProduct.delivery_address.state}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Country:</span>{" "}
                                                    {selectedProduct.delivery_address.country}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Postal Code:</span>{" "}
                                                    {selectedProduct.delivery_address.postal_code}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Contact:</span>{" "}
                                                    {selectedProduct.delivery_address.contact_number}
                                                </p>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Email:</span>{" "}
                                                    {selectedProduct.delivery_address.email}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700">No delivery address provided</p>
                                    )}
                                </div>
                            </div>

                                <div className="grid gap-6 p-6 bg-white shadow-lg rounded-xl max-w-96 md:max-w-4xl overflow-x-auto">
                                    <Title order={4}>Order Items</Title>
                                        <table className="w-full table-auto border-collapse">
                                            <thead>
                                            <tr>
                                                <th className="p-2 font-semibold text-left">Id</th>
                                                <th className="p-2 font-semibold text-center">Name</th>
                                                <th className="p-2 font-semibold text-center">Stock</th>
                                                <th className="p-2 font-semibold text-center">Price</th>
                                                <th className="p-2 font-semibold text-center">Quantity</th>
                                                <th className="p-2 font-semibold text-right">Subtotal</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedProduct.order_items?.length > 0 ? (
                                                selectedProduct.order_items.map((item: any, index: React.Key | null | undefined) => (
                                                <tr key={index} className="border-t">
                                                    <td className="p-2 text-center">{item?.product_id}</td>
                                                    <td className="p-2 text-center">{item?.product_name}</td>
                                                    <td className="p-2 text-center">{}</td>
                                                    <td className="p-2 text-center">{item?.symbol || "AU$"}{item?.product_price}</td>
                                                    <td className="p-2 text-center">x{item?.quantity}</td>
                                                    <td className="p-2 text-center">{item?.symbol || "AU$"}{item?.sub_total}</td>
                                                </tr>
                                            ))):(
                                                <p className="text-gray-700 flex justify-center">No order items available</p>
                                            )}
                                            </tbody>
                                        </table>
                            </div>
                            {/* Save Changes Button */}
                            <div className="flex justify-end">
                                {/*<Button*/}
                                {/*    color="orange"*/}
                                {/*    onClick={async () => {*/}
                                {/*        try {*/}
                                {/*            const formData = new FormData();*/}
                                {/*            formData.append('order_status',selectedProduct.order_status)*/}

                                {/*            await apiClient.patch(*/}
                                {/*                `/checkout/change/order-status/${selectedProduct.id}/`,*/}
                                {/*                formData ,*/}
                                {/*                {*/}
                                {/*                    headers: {*/}
                                {/*                        'Content-Type': 'multipart/form-data' ,*/}
                                {/*                    },*/}
                                {/*                }*/}
                                {/*            );*/}
                                {/*            notifications.show({*/}
                                {/*                title: "Success",*/}
                                {/*                message: "Order status updated successfully",*/}
                                {/*                color: "green",*/}
                                {/*            });*/}
                                {/*            setEditModal(false);*/}
                                {/*            setSelectedProduct(null);*/}
                                {/*            listProducts(); // Refresh the product list*/}
                                {/*        } catch (err: any) {*/}
                                {/*            notifications.show({*/}
                                {/*                title: "Error",*/}
                                {/*                message: err.response?.data?.detail || "Failed to update status",*/}
                                {/*                color: "red",*/}
                                {/*                icon: <IconX size={18} />,*/}
                                {/*            });*/}
                                {/*        }*/}
                                {/*    }}*/}
                                {/*>*/}
                                {/*    Save Changes*/}
                                {/*</Button>*/}
                            </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Modal size={"md"} centered={true} opened={openStatusModal} onClose={()=>{setOpenStatusModal(false)}} >
                <Center style={{gap:"10px"}}>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Order Status</label>
                                        <Select
                                            value={selectedProduct?.order_status}
                                            onChange={(value) => setSelectedProduct({ ...selectedProduct, order_status: value })}
                                            data={Object.values(OrderStatus).map((status) => ({
                                                value: status,
                                                label: status,
                                            }))}
                                            className="w-auto"
                                        />
                    <Button
                        color="orange"
                        onClick={async () => {
                            try {
                                const formData = new FormData();
                                formData.append('order_status',selectedProduct.order_status)

                                await apiClient.patch(
                                    `/checkout/change/order-status/${selectedProduct.id}/`,
                                    formData ,
                                    {
                                        headers: {
                                            'Content-Type': 'multipart/form-data' ,
                                        },
                                    }
                                );
                                notifications.show({
                                    title: "Success",
                                    message: "Order status updated successfully",
                                    color: "green",
                                });
                                setOpenStatusModal(false)
                                setEditModal(false);

                                setSelectedProduct(null);
                                listProducts(); // Refresh the product list
                            } catch (err: any) {
                                notifications.show({
                                    title: "Error",
                                    message: err.response?.data?.detail || "Failed to update status",
                                    color: "red",
                                    icon: <IconX size={18} />,
                                });
                            }
                        }}
                    >
                        Save Changes
                    </Button>

                                    </Center>


            </Modal>
        </div>
    );
}