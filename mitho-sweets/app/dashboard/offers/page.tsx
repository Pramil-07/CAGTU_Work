"use client";

import React, { useEffect, useRef, useState } from "react";
import DataTable from "@/components/DataTable/DataTable";
import apiClient from "@/axiosConfig";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {
    Center,
    Pagination,
    useMantineTheme,
    Button,
    Modal,
    Group,
    TextInput,
    Select,
    NumberInput,
    ActionIcon,
    Textarea,
    Text,
    Stack,
    Divider
} from "@mantine/core";

import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import {DateInput, DatePicker, DatePickerInput} from "@mantine/dates";
import {showNotification} from "@mantine/notifications";

interface Product {
    id: number;
    name: string;
    images: { id: number; image: string }[];
    stock: {
        id: number;
        price: string;
        mrp: number;
        discount: number;
        quantity: number;
        size: number;
        size_unit: string;
        status: string;
        color: string;
    };
    category: { id: number; name: string; parent: number | null; slug: string };
}
interface OfferTypes{
    id: number;
    status: string;
    name: string;
}
interface Offer {
    id: number;
    offer_name: string;
    offer_type: number | string; // Allow both number and string
    product: Product;
    meta_description: string;
    end_date: string;
    discount_type: "flat" | "percentage";
    discount_amount: number | null;
    discount_percentage: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

const Page = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
    const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const transactionsRef = useRef<HTMLDivElement | null>(null);
    const theme = useMantineTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [offerTypes, setOfferTypes] = useState<OfferTypes[]>([]);

    const fetchOfferTypes = async () => {
        try {
            setProductsLoading(true);
            const response = await apiClient.get(`/offer/types/`); 
            setOfferTypes(response.data.data);
        } catch (error) {
            console.error("Failed to fetch offer types:", error);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchOffers = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/offer/list/?page=${page}`);
            setOffers(response.data.result.data || []);
            setTotalPages(response.data.total_pages || 1);
            setCurrentPage(response.data.current || 1);
        } catch (error) {
            console.error("Failed to fetch offers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);
            const response = await apiClient.get(`/product/list/`); 
            setProducts(response.data.result || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers(currentPage);
        fetchProducts();
        fetchOfferTypes();
    }, [currentPage]);

    const form = useForm({
        initialValues: {
            offer_name: "",
            offer_type: "",
            product_id: '',
            meta_description: '',
            end_date: '',
            discount_type: 'flat' as 'flat' | 'percentage',
            discount_amount: null as number | null,
            discount_percentage: null as string | null,
            status: 'Active',
        },
        validate: {
            offer_name: (value) => (value.length < 1 ? 'Offer name is required' : null),
            offer_type: (value) => (value ? null : 'Offer type is required'),
            product_id: (value) => (value ? null : 'Product is required'),
            end_date: (value) => (value ? null : 'End date is required'),
            discount_type: (value) => (value ? null : 'Discount type is required'),
        },
    });

    const handleCreate = () => {
        setEditingOffer(null);
        form.reset();
        setModalOpen(true);
    };

    const handleEdit = (record: Offer) => {
        setEditingOffer(record);
        const selectedOfferType = offerTypes.find(type => type.name === record.offer_type);
        form.setValues({
            offer_name: record.offer_name,
            offer_type: selectedOfferType ? selectedOfferType.id.toString() : '',
            product_id: record.product.id.toString(),
            meta_description: record.meta_description,
            end_date: record.end_date,
            discount_type: record.discount_type,
            discount_amount: record.discount_amount ? Number(record.discount_amount) : null,
            discount_percentage: record.discount_percentage || null,
            status: record.status,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values: typeof form.values) => {
        try {
            setLoading(true);
            const payload = {
                offer_name: values.offer_name,
                offer_type: Number(values.offer_type),
                product: values.product_id,
                meta_description: values.meta_description,
                end_date: values.end_date,
                discount_type: values.discount_type,
                ...(values.discount_type === 'flat'
                    ? { discount_amount: values.discount_amount }
                    : { discount_percentage: values.discount_percentage }),
                status: values.status,
            };

            if (editingOffer) {
                await apiClient.put(`/offer/${editingOffer.id}/`, payload);
                console.log("Updated offer:", editingOffer.id);
            } else {
                await apiClient.post(`/offer/create/`, payload);
                console.log("Created new offer");
            }
            setModalOpen(false);
            fetchOffers(currentPage);
        } catch (error) {
            console.error("Failed to save offer:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (record: Offer) => {
        showNotification({
            title: 'Confirm Deletion',
            message: (
                <>
                    Are you sure you want to delete offer: {record.offer_name}?
                    <Group mt="md">
                        <Button
                            variant="outline"
                            onClick={() => close()}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    await apiClient.delete(`/offer/${record.id}/`);
                                    console.log("Deleted offer:", record.id);
                                    fetchOffers(currentPage);
                                    showNotification({
                                        title: 'Success',
                                        message: 'Offer deleted successfully',
                                        color: 'green',
                                    });
                                } catch (error) {
                                    console.error("Failed to delete offer:", error);
                                    showNotification({
                                        title: 'Error',
                                        message: 'Failed to delete offer',
                                        color: 'red',
                                    });
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </Group>
                </>
            ),
            color: 'red',
            autoClose: false,
        });
    };

    const handleView = (record: Offer) => {
        setViewingOffer(record);
        setViewModalOpen(true);
    };

    const columns: any[] = [
        {
            title: "Name",
            dataIndex: "offer_name",
            key: "offer_name",
            render: (value: string) => <span>{value}</span>,
        },
        {
            title: "Offer Type",
            dataIndex: "offer_type",
            key: "offer_type",
            render: (value: string) => <span>{value}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value: string) => <span>{value}</span>,
        },
        {
            title: "Discount",
            key: "discount",
            render: (_: any, record: Offer) => (
                <span>
                    {record.discount_type === "percentage" && record.discount_percentage
                        ? `${record.discount_percentage}%`
                        : record.discount_amount
                            ? `${record.discount_amount} Flat`
                            : "N/A"}
                </span>
            ),
        },
        {
            title: "End Date",
            dataIndex: "end_date",
            key: "end_date",
            render: (value: string) => <span>{value}</span>,
        },
    ];

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative"> 
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl text-red-500 font-bold mb-1">Offers</h1>
                <Button
                    onClick={handleCreate}
                    loading={loading}
                    color="red"
                    variant="filled"
                >
                    <IconPlus size={18} />   Create Offer
                </Button>
            </div>
            <BreadCrumbs
                currentTitle="Offers"
                items={[{name: "Dashboard", href: "/dashboard"}]}
                className="hover:text-red-500 cursor-pointer py-2"
            />
            <div ref={transactionsRef}>
                <DataTable
                    columns={columns}
                    data={offers}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    loading={loading}
                    handleView={handleView}
                    isCategoryPage={false}
                />
                {totalPages > 1 && (
                    <Center mt="xl">
                        <Pagination
                            total={totalPages}
                            value={currentPage}
                            onChange={setCurrentPage}
                            radius="xl"
                            color={theme.colors.brand?.[7] || "red"}
                        />
                    </Center>
                )}
            </div>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingOffer ? "Edit Offer" : "Create Offer"}
                size="lg"
                centered
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        label="Offer Name"
                        placeholder="write offer name"
                        mb="md"
                        radius="md"
                        required
                        {...form.getInputProps("offer_name")}
                    />
                    <Select
                        label="Offer Type"
                        placeholder="e.g., Dashain Offer"
                        data={
                            productsLoading
                                ? [{ value: '', label: 'Loading...' }]
                                : offerTypes.map(p => ({ value: p.id.toString(), label: p.name }))
                        }
                        mb="md"
                        radius="md"
                        required
                        {...form.getInputProps('offer_type')}
                        styles={{
                            input: {
                                width: '100%',
                                minWidth: '100%',
                            },
                        }}
                    />
                    <Select
                        label="Product"
                        placeholder="Select a product"
                        data={
                            productsLoading
                                ? [{ value: '', label: 'Loading...' }]
                                : products.map(p => ({ value: p.id.toString(), label: p.name }))
                        }
                        styles={{
                            input: {
                                width: '100%',
                                minWidth: '100%',
                            },
                        }}
                        mb="md"
                        radius="md"
                        required
                        searchable
                        {...form.getInputProps('product_id')}
                    />
                    <Textarea
                        label="Meta Description"
                        placeholder="Enter meta description"
                        mb="md"
                        radius="md"
                        {...form.getInputProps('meta_description')}
                    />
                    <DateInput
                        label="End Date"
                        placeholder="Select end date"
                        mb="md"
                        radius="md"
                        required
                        {...form.getInputProps('end_date')}
                        styles={(theme) => ({
                            input: {
                                border: `1px solid ${theme.colors.red[5]}`,
                                borderRadius: theme.radius.md,
                                padding: '8px 12px',
                                '&:focus': {
                                    borderColor: theme.colors.red[7],
                                    boxShadow: `0 0 0 2px ${theme.colors.red[2]}`,
                                },
                            },
                            calendar: {
                                backgroundColor: theme.white,
                                border: `1px solid ${theme.colors.gray[3]}`,
                                borderRadius: theme.radius.md,
                                padding: '10px',
                            },
                            day: {
                                '&[data-selected]': {
                                    backgroundColor: theme.colors.red[5],
                                    color: theme.white,
                                    borderRadius: theme.radius.sm,
                                },
                                '&:hover': {
                                    backgroundColor: theme.colors.red[2],
                                },
                            },
                        })}
                    />
                    <Select
                        label="Discount Type"
                        placeholder="Select discount type"
                        data={[
                            { value: 'flat', label: 'Flat' },
                            { value: 'percentage', label: 'Percentage' }
                        ]}
                        mb="md"
                        required
                        radius="md"
                        onClick={(value) => {
                            form.setFieldValue('discount_amount', null);
                            form.setFieldValue('discount_percentage', null);
                            form.setFieldValue('discount_type', value as unknown as 'flat' | 'percentage');
                        }}
                        {...form.getInputProps('discount_type')}
                        styles={{
                            input: {
                                width: '100%',
                                minWidth: '100%',
                            },
                        }}
                    />
                    {form.values.discount_type === 'flat' ? (
                        <NumberInput
                            label="Discount Amount"
                            placeholder="Enter flat discount amount"
                            mb="md"
                            required
                            radius="md"
                            {...form.getInputProps('discount_amount')}
                        />
                    ) : (
                        <TextInput
                            label="Discount Percentage"
                            placeholder="e.g., 10"
                            mb="md"
                            required
                            radius="md"
                            {...form.getInputProps('discount_percentage')}
                        />
                    )}
                    <Select
                        label="Status"
                        placeholder="Select status"
                        data={[
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' }
                        ]}
                        mb="md"
                        radius="md"
                        required
                        {...form.getInputProps('status')}
                        styles={{
                            input: {
                                width: '100%',
                                minWidth: '100%',
                            },
                        }}
                    />
                    <Group mt="md">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            color="red"
                        >
                            {editingOffer ? 'Update' : 'Create'}
                        </Button>
                    </Group>
                </form>
            </Modal>

            <Modal
                opened={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Offer Details"
                size="lg"
                centered
            >
                {viewingOffer && (
                    <Stack gap="xs">
                        <div>
                            <Text style={{ fontWeight: 500 }}>Offer Name</Text>
                            <Text>{viewingOffer.offer_name}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Offer Type</Text>
                            <Text>{offerTypes.find(type => type.id === Number(viewingOffer.offer_type))?.name || viewingOffer.offer_type}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Product</Text>
                            <Text>{viewingOffer.product.name}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Meta Description</Text>
                            <Text>{viewingOffer.meta_description}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>End Date</Text>
                            <Text>{viewingOffer.end_date}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Discount Type</Text>
                            <Text>{viewingOffer.discount_type === 'flat' ? 'Flat' : 'Percentage'}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Discount</Text>
                            <Text>
                                {viewingOffer.discount_type === 'percentage' && viewingOffer.discount_percentage
                                    ? `${viewingOffer.discount_percentage}%`
                                    : viewingOffer.discount_amount
                                        ? `${viewingOffer.discount_amount} Flat`
                                        : 'N/A'}
                            </Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Status</Text>
                            <Text>{viewingOffer.status}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Created At</Text>
                            <Text>{new Date(viewingOffer.created_at).toLocaleString()}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Updated At</Text>
                            <Text>{new Date(viewingOffer.updated_at).toLocaleString()}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text style={{ fontWeight: 500 }}>Product Details</Text>
                            <Text>Category: {viewingOffer.product.category.name}</Text>
                            <Text>Price: AU$ {viewingOffer.product.stock.price}</Text>
                            <Text>Stock Quantity: {viewingOffer.product.stock.quantity}</Text>
                            <Text>Size: {viewingOffer.product.stock.size} {viewingOffer.product.stock.size_unit}</Text>
                            <Text>Color: {viewingOffer.product.stock.color}</Text>
                        </div>
                        <Divider />
                        <Group align="right">
                            <Button
                                variant="outline"
                                onClick={() => setViewModalOpen(false)}
                            >
                                Close
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </div>
    );
};

export default Page;