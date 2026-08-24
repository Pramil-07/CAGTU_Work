import React, { useState } from 'react';
import { Table, Text, ActionIcon, Group, Badge, Rating, Box, Checkbox, Button, Flex, Pagination, Select, Tooltip, ScrollArea } from '@mantine/core';
import { ShoppingCart, Trash2, FileText, Check, MessageSquareMore } from 'lucide-react';
import Image from 'next/image';
import { IconArrowNarrowDown, IconArrowNarrowUp, IconSwitchVertical, IconX } from "@tabler/icons-react";
import Link from 'next/link';
import router from "next/router";
import { axiosClient } from "@/utils/axiosClient";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@/components/common/form/ConfirmModal";
import { CSVLink } from 'react-csv';
import { useUserStatus } from "@/hooks/useUserStatus";
import {Product} from "@/components/Dropdown/icon";

interface Product {
    id: number | string;
    name: string;
    rating: number;
    price: number;
    images: string[];
    product_status: boolean;
    discount_per: number;
    local_currency_details: {
        symbol: string;
    };
    purchase_details?: {
        total_price: number;
        purchase_date: string;
        status: string;
    };
}

interface ProductListProps {
    products: Product[];
    dark: boolean;
    tabValue?: string;
    purchasedTabValue?: string;
    soldTabValue?: string;
    sortOrder: string | null;
    setSortOrder: (order: string | null) => void;
    // isGrid?: boolean;
}

const ProductList: React.FC<ProductListProps
    // & { isShopList?: boolean }
> = ({
                                                     products,
                                                     dark,
                                                     tabValue,
                                                     purchasedTabValue,
                                                     soldTabValue,
                                                     sortOrder,
                                                     setSortOrder,
                                                     // isShopList = false
                                                 }) => {
    const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState("10");
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [isAnimating, setIsAnimating] = useState<Set<number>>(new Set());
    const { checkStatus } = useUserStatus();
console.log("is it sold product",soldTabValue)
    const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
        if (!discountPercentage) return price;
        return price - (price * (discountPercentage / 100));
    };

    const openViewProduct = (productId: number) => {
        router.push(`products/${productId}`);
    };

    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: "Successfully Added",
            message,
            color: "green",
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };

    const showErrorNotification = (message: string) => {
        notifications.show({
            title: "Something went wrong",
            message,
            color: "red",
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };

    const handleAddToBox = async (productId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!checkStatus("kyc")) {
            showErrorNotification("Please complete KYC to add items to box");
            return;
        }

        if (!selectedProducts.has(productId) && !isAnimating.has(productId)) {
            setIsAnimating(prev => new Set(prev).add(productId));
            try {
                const newCartItem = { product: productId, quantity: 1 };
                const response = await axiosClient.post('product/cart/', {
                    products: [newCartItem]
                });

                setSelectedProducts(prev => new Set(prev).add(productId));
                showSuccessNotification("Product added to box");
                setIsAnimating(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
            } catch (error) {
                showErrorNotification("Failed to add product to box");
                setIsAnimating(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
            }
        }
    };

    const handleRemoveFromBox = () => {
        router.push("/box");
    };

    const handleRowToggle = (productId: number) => {
        if (tabValue === "Deleted Products") {
            setSelectedRowIds((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(productId)) newSet.delete(productId);
                else newSet.add(productId);
                return newSet;
            });
        } else {
            openViewProduct(productId);
        }
    };

    const handlePermanentDelete = async () => {
        if (selectedRowIds.size === 0) {
            notifications.show({
                title: "Warning",
                message: "Please select at least one product to delete.",
                color: "yellow",
                autoClose: 3000,
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
            return;
        }
        openConfirmModal({
            title: "Delete Confirmation",
            message: `Are you sure you want to permanently delete ${selectedRowIds.size} selected item(s)?`,
            onConfirm: async () => {
                try {
                    const payload = { product_ids: Array.from(selectedRowIds) };
                    await axiosClient.delete(`/product/delete/`, { data: payload });
                    notifications.show({
                        title: "Success",
                        message: `${selectedRowIds.size} product(s) permanently deleted!`,
                        color: "green",
                        autoClose: 3000,
                        style: {
                            position: 'fixed',
                            top: '60px',
                            right: "20px",
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    });
                    setSelectedRowIds(new Set());
                    window.location.reload();
                } catch (error) {
                    showErrorNotification("Failed to permanently delete the selected products.");
                }
            },
        });
    };

    const handleIndividualDelete = (productId: number) => {
        openConfirmModal({
            title: "Delete Confirmation",
            message: "Are you sure you want to permanently delete this item?",
            onConfirm: async () => {
                try {
                    const payload = { product_ids: [productId] };
                    await axiosClient.delete(`/product/delete/`, { data: payload });
                    notifications.show({
                        title: "Success",
                        message: "Product permanently deleted!",
                        color: "green",
                        autoClose: 3000,
                        style: {
                            position: 'fixed',
                            top: '60px',
                            right: "20px",
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    });
                    setSelectedRowIds((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(productId);
                        return newSet;
                    });
                    window.location.reload();
                } catch (error) {
                    showErrorNotification("Failed to permanently delete the product.");
                }
            },
        });
    };

    const handleNameSort = () => {
        setSortOrder(sortOrder === "name_asc" ? "name_desc" : "name_asc");
    };

    const handlePriceSort = () => {
        setSortOrder(sortOrder === "price_asc" ? "price_desc" : "price_asc");
    };

    const handleRatingSort = () => {
        setSortOrder(sortOrder === "rating_asc" ? "rating_desc" : "rating_asc");
    };

    const resetSort = (e: { stopPropagation: () => void; }) => {
        e.stopPropagation();
        setSortOrder(null);
    };

    const getSortState = (type: 'name' | 'price' | 'rating') => {
        if (type === 'name') {
            return sortOrder === "name_asc" ? 'asc' : sortOrder === "name_desc" ? 'desc' : 'neutral';
        }
        if (type === 'price') {
            return sortOrder === "price_asc" ? 'asc' : sortOrder === "price_desc" ? 'desc' : 'neutral';
        }
        if (type === 'rating') {
            return sortOrder === "rating_asc" ? 'asc' : sortOrder === "rating_desc" ? 'desc' : 'neutral';
        }
        return 'neutral';
    };

    const csvData = products.map((product: Product) => ({
        Name: product.name,
        Price: `${product.local_currency_details?.symbol || '$'}${calculateDiscountedPrice(product.price, product.discount_per).toLocaleString()}`,
        Rating: product.rating?.toFixed(1),
        Status: product.product_status,
        Discount: product.discount_per > 0 ? `-${product.discount_per}%` : 'None'
    }));

    const totalPages = Math.ceil(products.length / parseInt(pageSize));
    const paginatedProducts = products.slice((page - 1) * parseInt(pageSize), page * parseInt(pageSize));

    return (
        <Box sx={{ background: dark ? '#1A1B1E' : '', border: dark ? '1px solid #2C2E33' : '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 4, padding: 16 }}>
            <Flex mb={16} justify="space-between" gap={10} align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }}>
                <Flex gap={3} wrap="wrap" align="center">
                    {tabValue === "Deleted Products" && (
                        <Box mb="md">
                            <Button color="red" variant="light" leftIcon={<Trash2 size={16} />} onClick={handlePermanentDelete} disabled={selectedRowIds.size === 0}>
                                Delete Selected ({selectedRowIds.size})
                            </Button>
                        </Box>
                    )}
                </Flex>
                <Flex justify="flex-end" gap={10}>
                    {products.length > 0 && (
                        <CSVLink data={csvData} filename="product_list.csv" target="_blank">
                            <Tooltip label="Export CSV" position="bottom" styles={{ tooltip: { fontSize: 12, padding: "3px 8px", fontWeight: 500 } }}>
                                <ActionIcon variant="light" radius="xl" size={40} color="gray.5" sx={{ cursor: "pointer" }}>
                                    <FileText size={22} />
                                </ActionIcon>
                            </Tooltip>
                        </CSVLink>
                    )}
                </Flex>
            </Flex>
            <ScrollArea>
                <Table highlightOnHover>
                    <thead>
                    <tr>
                        {tabValue === "Deleted Products" && <th style={{ width: '50px' }}>Select</th>}
                        <th>Product</th>
                        <th className="px-1 py-2">
                            <Flex align="center" gap={4}>
                                <Text>Name</Text>
                                <div style={{ position: 'relative', display: 'inline-block', marginLeft: 4 }}>
                                    <ActionIcon onClick={handleNameSort} sx={{ backgroundColor: getSortState('name') !== 'neutral' ? '#1E88E5' : 'transparent', color: getSortState('name') !== 'neutral' ? 'white' : 'inherit', '&:hover': { backgroundColor: getSortState('name') !== 'neutral' ? '#1976D2' : '#f0f0f0' }, width: 16, height: 16 }} size="sm">
                                        {getSortState('name') === 'neutral' && <IconSwitchVertical color={"gray"} size={18} />}
                                        {getSortState('name') === 'asc' && <IconArrowNarrowUp size={18} />}
                                        {getSortState('name') === 'desc' && <IconArrowNarrowDown size={18} />}
                                    </ActionIcon>
                                    {getSortState('name') !== 'neutral' && (
                                        <ActionIcon size="xs" radius="xl" sx={{ position: 'absolute', top: -6, right: -8, zIndex: 1, background: "red", '&:hover': { backgroundColor: '#FF6B6B' }, width: 12, height: 12 }} onClick={resetSort}>
                                            <IconX color="white" size={12} />
                                        </ActionIcon>
                                    )}
                                </div>
                            </Flex>
                        </th>
                        <th className="px-1 py-2">
                            <Flex align="center" gap={4}>
                                {purchasedTabValue === "Purchased Products" ? (
                                    <Text>Purchased Price</Text>
                                ) : soldTabValue ? (
                                    <Text>Sold Price</Text>
                                    ) : (
                                    <Text>Price</Text>
                                    )}
                                <div style={{ position: 'relative', display: 'inline-block', marginLeft: 4 }}>
                                    <ActionIcon onClick={handlePriceSort} sx={{ backgroundColor: getSortState('price') !== 'neutral' ? '#1E88E5' : 'transparent', color: getSortState('price') !== 'neutral' ? 'white' : 'inherit', '&:hover': { backgroundColor: getSortState('price') !== 'neutral' ? '#1976D2' : '#f0f0f0' }, width: 16, height: 16 }} size="sm">
                                        {getSortState('price') === 'neutral' && <IconSwitchVertical color={"gray"} size={18} />}
                                        {getSortState('price') === 'asc' && <IconArrowNarrowUp size={18} />}
                                        {getSortState('price') === 'desc' && <IconArrowNarrowDown size={18} />}
                                    </ActionIcon>
                                    {getSortState('price') !== 'neutral' && (
                                        <ActionIcon size="xs" radius="xl" sx={{ position: 'absolute', top: -6, right: -8, zIndex: 1, background: "red", '&:hover': { backgroundColor: '#FF6B6B' }, width: 12, height: 12 }} onClick={resetSort}>
                                            <IconX color="white" size={12} />
                                        </ActionIcon>
                                    )}
                                </div>
                            </Flex>
                        </th>
                        <th className="px-1 py-2">
                            <Flex align="center" gap={4}>
                                <Text>Rating</Text>
                                <div style={{ position: 'relative', display: 'inline-block', marginLeft: 4 }}>
                                    <ActionIcon onClick={handleRatingSort} sx={{ backgroundColor: getSortState('rating') !== 'neutral' ? '#1E88E5' : 'transparent', color: getSortState('rating') !== 'neutral' ? 'white' : 'inherit', '&:hover': { backgroundColor: getSortState('rating') !== 'neutral' ? '#1976D2' : '#f0f0f0' }, width: 16, height: 16 }} size="sm">
                                        {getSortState('rating') === 'neutral' && <IconSwitchVertical color={"gray"} size={18} />}
                                        {getSortState('rating') === 'asc' && <IconArrowNarrowUp size={18} />}
                                        {getSortState('rating') === 'desc' && <IconArrowNarrowDown size={18} />}
                                    </ActionIcon>
                                    {getSortState('rating') !== 'neutral' && (
                                        <ActionIcon size="xs" radius="xl" sx={{ position: 'absolute', top: -6, right: -8, zIndex: 1, background: "red", '&:hover': { backgroundColor: '#FF6B6B' }, width: 12, height: 12 }} onClick={resetSort}>
                                            <IconX color="white" size={12} />
                                        </ActionIcon>
                                    )}
                                </div>
                            </Flex>
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedProducts.map((product: any) => {
                        const discountedPrice = calculateDiscountedPrice(product.price, product.discount_per);
                        const isInCart = selectedProducts.has(product.id);
                        const isSelected = selectedRowIds.has(product.id);

                        return (
                            <tr onClick={() => handleRowToggle(product.id)} key={product.id}>
                                {tabValue === "Deleted Products" && (
                                    <td>
                                        <Checkbox checked={isSelected} onChange={() => handleRowToggle(product.id)} onClick={(e) => e.stopPropagation()} />
                                    </td>
                                )}
                                <td className="p-2" style={{ width: '120px' }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                        {product.images && product.images.length > 0 ? (
                                            <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-200" style={{ borderRadius: '4px' }}>
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <Link href={`/products/${product.id}`} className="no-underline">
                                        <Text weight={500} className="hover:text-blue-500 transition-colors" style={{ color: dark ? '#C1C2C5' : 'inherit' }}>
                                            {product.name}
                                        </Text>
                                    </Link>
                                </td>
                                <td>
                                    {purchasedTabValue === "Purchased Products" && product.purchase_details ? (
                                        <div>
                                            <Text size="sm" weight={700} className="text-green-600 ml-10">
                                                {product.purchase_details.total_price}
                                            </Text>
                                        </div>
                                        ) : (
                                    <div>
                                        {product.discount_per > 0 ? (
                                            <Group spacing={4}>
                                                <Text size="sm" weight={700} className="text-green-600">
                                                    {product.local_currency_details?.symbol || '$'}{discountedPrice.toLocaleString()}
                                                </Text>
                                                <Text size="xs" className="line-through text-gray-500">
                                                    {product.local_currency_details?.symbol || '$'}{product.price.toLocaleString()}
                                                </Text>
                                            </Group>
                                        ) : (
                                            <Text size="sm" weight={600}>
                                                {product.local_currency_details?.symbol || '$'}{product.price.toLocaleString()}
                                            </Text>
                                        )}
                                    </div> )}
                                </td>
                                <td>
                                    <Group spacing={4}>
                                        <Rating value={product.rating} readOnly size="sm" />
                                        <Text size="xs" className="text-gray-500">({product.rating?.toFixed(1)})</Text>
                                    </Group>
                                </td>
                                <td>
                                    <Badge color={product.product_status ? 'green' : 'gray'} variant="light">
                                        {product.product_status}
                                    </Badge>
                                </td>
                                <td>
                                    <Group spacing={8}>
                                        {tabValue === "Deleted Products" ? (
                                            <ActionIcon color="red" variant="light" onClick={(e) => { e.stopPropagation(); handleIndividualDelete(product.id); }} title="Permanently Delete">
                                                <Trash2 size={16} />
                                            </ActionIcon>
                                        ) : purchasedTabValue === "Purchased Products" ? (
                                            <ActionIcon color="gray" variant="light" title="Add review">
                                                <MessageSquareMore />
                                            </ActionIcon>
                                        ) : (
                                            <>
                                                <ActionIcon
                                                    color={isInCart ? "green" : "gray"}
                                                    variant="light"
                                                    onClick={(e) => isInCart ? handleRemoveFromBox() : handleAddToBox(product.id, e)}
                                                    disabled={!product.product_status || isAnimating.has(product.id)}
                                                    title={isInCart ? "Remove from box" : "Add to box"}
                                                >
                                                    {isInCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                                                </ActionIcon>
                                            </>
                                        )}
                                    </Group>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </Table>
            </ScrollArea>
            {totalPages > 0 && (
                <Flex mt={16} justify="space-between" align="center">
                    <Select data={["10", "20", "30", "40"]} placeholder="10" value={pageSize} onChange={(value) => value && setPageSize(value)} style={{ width: 80 }} />
                    <Pagination total={totalPages} color="orange" size="md" value={page} onChange={setPage} />
                </Flex>
            )}
        </Box>
    );
};

export default ProductList;
