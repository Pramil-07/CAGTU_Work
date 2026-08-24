"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/axiosConfig";
import Image from "next/image";
import { Box, Button, Center, Container, Loader, useMantineTheme } from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import CartContext from "@/context/CartContext";
import { LuTrash2 } from "react-icons/lu";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import ErrorPage from "@/components/Error/Error";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { toast } from "@/components/common/Toast";
import logo from "@/images/mithoSweetsBgRemoved.png";

interface Product {
    added_by: string;
    id: number;
    name: string;
    rating: {
        rating__avg: number;
        count: number;
    };
    count: number;
    rating__avg: number;
    slug: string;
}

interface Stock {
    discount: string | number;
    id: number;
    image: string;
    mrp: number;
    price: number;
    slug: string;
}

interface CartItem {
    product: Product;
    stock: Stock;
}

const Page = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartLoading, setCartLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [buttonLoading, setButtonLoading] = useState<{ [key: number]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"delete" | null>(null);
    const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

    const router = useRouter();
    const { addToCart } = useContext(CartContext);
    const theme = useMantineTheme();

    const handleAddToCart = async (item: CartItem) => {
        setButtonLoading((prev) => ({ ...prev, [item.stock.id]: true }));
        try {
            addToCart({
                id: `${item.product.id}`,
                productId: item.product.id,
                stockId: item.stock.id,
                name: item.product.name,
                price: item.stock.mrp,
                image: item.stock.image,
                quantity: 1,
            });
            router.push("/cart");
        } catch (error) {
            console.error("Error adding to cart:", error);
        } finally {
            setButtonLoading((prev) => ({ ...prev, [item.stock.id]: false }));
        }
    };

    const handleDeleteFromWishlist = async (item: CartItem) => {
        try {
            await apiClient.post(`/product/wish/${item.product.id}/${item.stock.id}/`);
            setCartItems((prev) => prev.filter((ci) => ci.stock.id !== item.stock.id));
        } catch (error) {
            console.error("Error deleting from wishlist:", error);
        }
    };

    const handleDeleteClick = (item: CartItem) => {
        setSelectedItem(item);
        setModalType("delete");
        setModalOpen(true);
    };

    const handleModalConfirm = () => {
        if (modalType === "delete" && selectedItem) {
            handleDeleteFromWishlist(selectedItem);
            toast.success(`${selectedItem.product.name} removed from wishlist`);
        }
        setModalOpen(false);
        setSelectedItem(null);
        setModalType(null);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedItem(null);
        setModalType(null);
    };

    useEffect(() => {
        const fetchCartData = async () => {
            setCartLoading(true);
            try {
                const response = await apiClient.get("/product/wish/");
                const result = response.data.result;
                setCartItems(result);
            } catch (err) {
                setError("Error fetching cart data. Please try again.");
                console.error("Cart fetch error:", err);
            } finally {
                setCartLoading(false);
            }
        };

        fetchCartData();
    }, []);

    return (
        <div>
        <div className="w-full bg-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-5">
                    <BreadCrumbs currentTitle="Wishlist" items={[{ name: "Shop", href: "/Shop" }]} />
            </div>
        </div>
        <div className="max-w-6xl mx-auto p-6 bg-white w-full page-container">
            <div className="flex items-center justify-center mb-4">
                    {cartLoading ? (
                        <Box style={{ minHeight: "100vh" }}>
                            <Container
                                size="xl"
                                py="xl"
                                className="flex justify-center items-center min-h-[80lvh]">
                            <Center>
                                <MithoSweetsLoader />
                            </Center>
                        </Container>
                    </Box>
                    ) : cartItems.length > 0 ? (
                        <div className="max-w-6xl mx-auto p-6 bg-white w-full page-container overflow-x-auto">
                        <table className="w-full table-auto border">
                            <thead>
                            <tr className="text-gray-700 text-center border">
                                <th className="p-2 md:p-3 font-semibold text-md"></th>
                                <th className="p-2 md:p-3 font-semibold text-start text-md">Product</th>
                                    <th className="p-2 md:p-3 font-semibold border text-md hidden sm:table-cell">
                                        Price
                                    </th>
                                <th className="p-2 md:p-3 font-semibold border text-md">Stock Status</th>
                                <th className="p-2 md:p-3 font-semibold border text-md">Action</th>
                                <th className="p-2 md:p-3 font-semibold border text-md">Remove</th>
                            </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                <tr key={item.stock.id} className="border-b">
                                    <td className="p-2 md:p-3 border">
                                        <div className="flex justify-center items-center">
                                        <Image
                                                src={item.stock.image || logo}
                                            alt={"none"}
                                            width={50}
                                            height={50}
                                            className="w-12 h-12 md:w-20 md:h-20"
                                            style={{ borderRadius: "7px", objectFit: "cover" }}
                                        />
                                        </div>
                                    </td>
                                    <td className="p-2 md:p-3 align-middle text-start text-sm md:text-lg border">
                            <span className="font-medium hover:text-teal-500 text-center cursor-pointer"
                                  style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      color: theme.colors.brand[7],
                                  }}
                                  onClick={() => router.push(`/product/${item.stock.slug}`)}
                            >{item.product.name}</span></td>
                                    <td className="p-2 md:p-3 text-gray-600 text-xs md:text-sm text-center border hidden sm:table-cell">${item?.stock?.mrp}</td>
                                    <td className="p-2 md:p-3 text-center text-gray-600 text-xs border md:text-sm">
                                        {/*{item.product.quantity}*/}
                                        In Stock
                                    </td>
                                    <td className="p-2 text-gray-600 text-center text-xs md:text-sm border font-semibold">
                                        <Button
                                            size={"md"}
                                            onClick={() => handleAddToCart(item)}
                                            disabled={buttonLoading[item.stock.id]}
                                            leftSection={
                                                buttonLoading[item.stock.id] ? (
                                                    <Loader size={16} color={theme.colors.brand[0]} />
                                                ) : (
                                                    <HiOutlineShoppingBag size={22} />
                                                )
                                            }
                                        >
                                            {buttonLoading[item.stock.id] ? 'Adding...' : 'Add to cart'}
                                        </Button>
                                    </td>
                                    <td className="p-2 md:p-3 text-center text-xs md:text-sm border font-semibold">
                                            <button
                                                className={`text-gray-500 hover:text-[${theme.colors.brand[7]}] hover:scale-105`}
                                                onClick={() => handleDeleteClick(item)}
                                            >
                                                <LuTrash2 size={18}/>
                                            </button>
                                        </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                            <ConfirmationModal
                                opened={modalOpen}
                                onClose={handleModalClose}
                                onConfirm={handleModalConfirm}
                                title="Remove from Wishlist"
                                message={
                                    selectedItem
                                        ? `Are you sure you want to remove ${selectedItem.product.name} from your wishlist?`
                                        : "Are you sure you want to remove this item?"
                                }
                            />
                    </div>
                ) : (
                    <ErrorPage msg={"No items were found on whishlist"} />
                )}
            </div>
        </div>
        </div>
    );
};

export default Page;
