'use-client'
import {Grid, Text, Box} from "@mantine/core";
import {dehydrate, QueryClient, useQuery} from "@tanstack/react-query";
import type {GetStaticProps} from "next";
import {useEffect, useState, useMemo} from "react";
import Layout from "@/components/Layout/Layout";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import {useBoxStyles} from "@/styles/pages/BoxStyles";
import type {MyBookingProps} from "@/types/booking/MyBookingProps";
import type {CartProps} from "@/types/box/CartProps";
import {notifications} from "@mantine/notifications";
import {IconX} from "@tabler/icons-react";
import BoxCard from "@/components/box/BoxPayCard";
import ProductBoxCard from "@/components/box/ProductBoxCard";
import {TotalCart} from "@/components/box/TotalCart";
import SkeletonBoxList from "@/components/skeletons/SkeletonBoxList";

interface CartItemProps {
    cart_item_id: string;
    product: {
        id: string;
        sku: string;
        images: string[];
        name: string;
        description: string;
        price: number;
        discount_percentage: string;
        final_price: number;
        stock_quantity: number;
        created_by: string;
        Varients: {
            SKU: string | number;
            color: string;
            is_active: boolean;
            label: string;
            qr_code: string | number | null;
            size: string;
        };
        local_currency_details: {
            symbol: string;
        };
    };
    shop: {
        shop_id: string;
        shop_name: string;
        shop_images: string[];
        shop_owner: string;
        location: string[];
        status: {
            is_active: boolean;
            is_verified: string;
        };
        created_at: string;
    };
    order_quantity: number;
    total_price: number;
    stock_status: string;
    cart_status: string;
    date_added: string;
    last_updated: string;
    payment_status: string;
    currency_symbol: string;
    currency_code: string;
}

interface CartResponse {
    result: CartItemProps[];
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
}

const BoxPage = () => {
    const {classes} = useBoxStyles();
    const [cartItems, setCartItems] = useState<CartItemProps[]>([]);
    const [selectedCartItems, setSelectedCartItems] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
    const [cartUpdated, setCartUpdated] = useState(0);
    

    const showCurrencyErrorNotification = () => {
        notifications.show({
            title: "Currency Mismatch",
            message: "You cannot select items with different currencies in the cart.",
            color: "red",
            icon: <IconX className="w-4 h-4"/>,
            autoClose: 3000,
            style: {position: 'fixed', top: '60px',right: "20px", boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'},
        });
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get<CartResponse>('/product/cart/?is_requested=true');
                const cartItemsData = response.data?.result;
                if (!Array.isArray(cartItemsData)) {
                    throw new Error("Cart items data is not in the expected format");
                }
                setCartItems(cartItemsData);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch cart items");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCartItems();
    }, [cartUpdated]);

    useEffect(() => {
        const fetchOrderList = async () => {
            try {
                const {data} = await axiosClient.get<CartProps>(`${urls.cart.list}?page=1`);
                // Since we're not using queryClient, we directly update the orderData via useQuery
            } catch (error) {
                console.log("Error fetching order list:", error);
            }
        };
        fetchOrderList();
    }, []);

    const {data: orderData, isLoading: orderLoading} = useQuery<any, Error, CartProps>(
        ["order-list"],
        async () => {
            const {data} = await axiosClient.get<CartProps>(urls.cart.list);
            return data;
        }
    );

    const [items, setItems] = useState<string[]>([]);

    const calculateTotalPrice = useMemo(() => {
        let total = 0;
        let currency: string | null = null;
        if (orderData?.result && items.length > 0) {
            const filteredOrders = orderData.result.filter(item => items.includes(item.id));
            filteredOrders.forEach(item => {
                const itemCurrency = item.currency?.symbol || "NRS";
                if (currency && currency !== itemCurrency) {
                    showCurrencyErrorNotification();
                    setItems(items.filter(id => id !== item.id));
                    return;
                }
                currency = itemCurrency;
                total += parseFloat(item.price || '0');
            });
        }
        if (cartItems && selectedCartItems.length > 0) {
            const filteredCartItems = cartItems.filter(item => selectedCartItems.includes(item.cart_item_id));
            filteredCartItems.forEach(item => {
                const itemCurrency = item.currency_symbol || item.product.local_currency_details?.symbol || "NRS";
                if (currency && currency !== itemCurrency) {
                    showCurrencyErrorNotification();
                    setSelectedCartItems(selectedCartItems.filter(id => id !== item.cart_item_id));
                    return;
                }
                currency = itemCurrency;
                total += item.total_price;
            });
        }
        return total;
    }, [cartItems, selectedCartItems, orderData, items, setItems, setSelectedCartItems]);

    const {data: bookingData, isLoading: bookingLoading} = useQuery<any, Error, MyBookingProps>(
        ["unapproved-booking-list"],
        async () => {
            const {data} = await axiosClient.get<MyBookingProps>(`${urls.booking.my_booking}?is_accepted=false`);
            return data;
        }
    );

    const truncateName = (name: string | undefined) => {
        if (!name) return "";
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        const letterCount = capitalized.replace(/\s+/g, '').length;
        if (letterCount > 25) {
            let currentLetters = 0;
            let truncated = '';
            for (const char of capitalized) {
                if (char !== ' ') currentLetters++;
                if (currentLetters > 25) {
                    truncated += '...';
                    20
                    break;
                }
                truncated += char;
            }
            return truncated;
        }
        return capitalized;
    };
    console.log(bookingData?.result, "bookingData");

    return (
        <Layout heading="Box" currentTitle="box">
            <Grid gutter={30}>
                <Grid.Col lg={8}>
                    <Box className={classes.section}>
                        <Text className={classes.sectionTitle}>Payment</Text>
                        {orderLoading && <SkeletonBoxList />}
                        {orderData?.result && orderData.result.length > 0 ? (
                            <BoxCard
                                orderData={orderData.result}
                                setItems={setItems}
                                items={items}
                                selectedCurrency={selectedCurrency}
                                setSelectedCurrency={setSelectedCurrency}
                                truncateName={truncateName}
                            />
                        ) : (
                            <Text className={classes.emptyText}>No approved bookings to make a payment.</Text>
                        )}
                    </Box>

                    <Box className={classes.section}>
                        {Array.isArray(cartItems) && cartItems.length === 0 && (
                            <Text className={classes.sectionTitle}>Products</Text>
                        )}
                        {/*{isLoading && <SkeletonBoxList />}*/}
                        {Array.isArray(cartItems) && cartItems.length > 0 ? (
                            <ProductBoxCard
                                cartItems={cartItems}
                                selectedItems={selectedCartItems}
                                setSelectedItems={setSelectedCartItems}
                                selectedCurrency={selectedCurrency}
                                setSelectedCurrency={setSelectedCurrency}
                                truncateName={truncateName}
                                setCartItems={setCartItems}
                                setCartUpdated={setCartUpdated}
                                // page={page}
                                // setPage={setPage}
                                // totalPages={totalPages}
                                // filterTitle={filterTitle}
                                // setFilterTitle={setFilterTitle}
                            />
                        ) : (
                            <Text className={classes.emptyText}>No products in your cart.</Text>
                        )}
                    </Box>

                    <Box className={classes.section}>
                        <Text className={classes.sectionTitle}>Waiting List</Text>
                        {bookingLoading && <SkeletonBoxList />}
                        {bookingData?.result && bookingData?.result.length > 0 ? (
                            <BoxCard
                                bookingData={bookingData?.result as any}
                                truncateName={truncateName}
                            />
                        ) : (
                            <Text className={classes.emptyText}>No bookings in your waiting list.</Text>
                        )}
                    </Box>
                </Grid.Col>
                <Grid.Col lg={4} md={12}>
                    <TotalCart
                        items={items}
                        totalPrice={calculateTotalPrice}
                        selectedProducts={selectedCartItems}
                        orderData={orderData}
                        selectedCurrency={selectedCurrency}
                    />
                </Grid.Col>
            </Grid>
        </Layout>
    );
};

export default BoxPage;

// export const getStaticProps: GetStaticProps = async () => {
//     const queryClient = new QueryClient();
//     await queryClient.prefetchQuery(["order-list"], async (): Promise<any> => {
//         try {
//             const data = await axiosClient.get<CartProps>(`${urls.cart.list}?page=1`);
//             return data ?? {};
//         } catch (error) {
//             console.log("Error fetching order list:", error);
//         }
//     });
//     return {
//         props: {
//             dehydratedState: dehydrate(queryClient),
//         },
//     };
// };
