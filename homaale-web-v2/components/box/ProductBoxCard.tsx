import {
    Table,
    Text,
    Checkbox,
    Flex,
    Image,
    Tooltip,
    ActionIcon,
    Box,
    Button,
    Pagination,
    useMantineTheme,
} from "@mantine/core";
import React, {useState, useEffect} from "react";
import {IconX, IconPackage, IconCheck, IconPlus, IconMinus, IconTrash, IconFilterCode} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import {notifications} from "@mantine/notifications";
import {modals} from "@mantine/modals";
import {useBoxStyles} from "@/styles/pages/BoxStyles";
import {axiosClient} from "@/utils/axiosClient";
import {formatNumberWithCondition, useDark} from "@/utils/helpers";
import {HeartIcon, HeartCrack} from "lucide-react";
import {Form, Formik} from "formik";
import InputField from "@/components/common/form/InputField";
import {number, string} from "yup";
import ConvertAndFormat from "../CurrencyNumberFormatter/ConvertAndFormat";
import { useCurrency } from "@/currency/CurrencyContext";

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

interface ProductBoxCardProps {
    selectedItems?: string[],
    setSelectedItems?: React.Dispatch<React.SetStateAction<string[]>>,
    selectedCurrency?: string | null,
    setSelectedCurrency?: React.Dispatch<React.SetStateAction<string | null>>,
    truncateName: (name: string | undefined) => string,
    cartItems?: CartItemProps[],
    setCartItems?: React.Dispatch<React.SetStateAction<CartItemProps[]>>,
    setCartUpdated?: (value: (((prevState: number) => number) | number)) => void
}

const ProductBoxCard = ({
                            selectedItems,
                            setSelectedItems,
                            selectedCurrency,
                            setSelectedCurrency,
                            truncateName,
                            setCartUpdated
                        }: ProductBoxCardProps) => {
    const {classes} = useBoxStyles();
    const RibbonContainer = dynamic(() => import("react-ribbons").then((mod) => mod.RibbonContainer), {ssr: false});
    const Ribbon = dynamic(() => import("react-ribbons").then((mod) => mod.Ribbon), {ssr: false});

    // State for cart items, pagination, and filtering
    const [cartItems, setCartItems] = useState<CartItemProps[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterTitle, setFilterTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilter, setShowFilter] = useState(false);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [changedItems, setChangedItems] = useState<{ [key: string]: boolean }>({});
    const dark = useDark();
    const theme = useMantineTheme();
    const{globalCurrency}= useCurrency();
    const [exchangeInfo, setExchangeInfo] = useState<number>(89.0);
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

    // Fetch cart items
    useEffect(() => {
        const fetchCartItems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get<CartResponse>(
                    `/product/cart/?is_requested=true&page=${page}${filterTitle ? `&title=${encodeURIComponent(filterTitle)}` : ""}`
                );
                const cartItemsData = response.data.result;
                if (!Array.isArray(cartItemsData) || cartItemsData.length === 0) {
                    setCartItems([]);
                    setQuantities({});
                    setCartItems?.([]);
                } else {
                    setCartItems(cartItemsData);
                    setQuantities(
                        cartItemsData.reduce(
                            (acc, item) => ({...acc, [item.cart_item_id]: item.order_quantity}),
                            {}
                        )
                    );
                    setCartItems?.(cartItemsData);
                }
                setTotalPages(response.data.total_pages);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch cart items");
                setCartItems([]);
                setQuantities({});
            } finally {
                setIsLoading(false);
            }
        };
        fetchCartItems();
    }, [page, filterTitle]);

    // Notification functions
    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: "Success",
            message,
            color: "green",
            icon: <HeartIcon className="w-4 h-4"/>,
            autoClose: 3000,
            style: {position: "fixed", top: "60px",right: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"},
        });
    };

    const showErrorNotification = (message: string) => {
        notifications.show({
            title: "Error",
            message,
            color: "red",
            icon: <HeartCrack className="w-4 h-4"/>,
            autoClose: 3000,
            style: {position: "fixed", top: "60px",right: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"},
        });
    };

    const showCurrencyErrorNotification = () => {
        notifications.show({
            title: "Currency Mismatch",
            message: "You cannot select items with different currencies in the cart.",
            color: "red",
            icon: <IconX size={16}/>,
            autoClose: 3000,
            style: {position: "fixed", top: "60px",right: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"},
        });
    };

    // Handlers
    const handleBulkDelete = () => {
        modals.openConfirmModal({
            title: "Delete Selected Products",
            children: (
                <div className="text-sm">
                    <p>Are you sure you want to delete {selectedItems?.length} selected product(s) from your cart?</p>
                    <p className="mt-2 text-gray-500">This action cannot be undone.</p>
                </div>
            ),
            labels: {confirm: "Delete", cancel: "Cancel"},
            confirmProps: {color: "red"},
            onConfirm: async () => {
                try {
                    for (const cartId of selectedItems || []) {
                        await axiosClient.post(`product/cart/update-quantity/`, {
                            cart_id: cartId,
                            quantity: "0",
                        });
                    }
                    setSelectedItems?.([]);
                    setSelectedCurrency?.(null);
                    showSuccessNotification("Selected products deleted successfully.");
                    const response = await axiosClient.get<CartResponse>(
                        `/product/cart/?is_requested=true&page=${page}${filterTitle ? `&title=${encodeURIComponent(filterTitle)}` : ""}`
                    );
                    const cartItemsData = response.data.result;
                    if (!Array.isArray(cartItemsData) || cartItemsData.length === 0) {
                        setCartItems([]);
                        setQuantities({});
                    } else {
                        setCartItems(cartItemsData);
                        setQuantities(
                            cartItemsData.reduce(
                                (acc, item) => ({...acc, [item.cart_item_id]: item.order_quantity}),
                                {}
                            )
                        );
                    }
                    setTotalPages(response.data.total_pages);
                } catch (error) {
                    showErrorNotification("Failed to delete selected products. Please try again.");
                }
            },
        });
    };

    const handleChange = (cartItem: CartItemProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (setSelectedItems && selectedItems) {
            const itemCurrency = cartItem.currency_code|| cartItem.product.local_currency_details?.symbol || "";
            if (selectedCurrency && selectedCurrency !== itemCurrency) {
                showCurrencyErrorNotification();
                return;
            }
            if (event.target.checked) {
                setSelectedItems([...selectedItems, cartItem.cart_item_id]);
                if (!selectedCurrency) {
                    setSelectedCurrency?.(itemCurrency);
                }
            } else {
                setSelectedItems(selectedItems.filter((item) => item !== cartItem.cart_item_id));
                if (selectedItems.length === 1) {
                    setSelectedCurrency?.(null);
                }
            }
        }
    };

    const handleQuantityChange = (cartItem: CartItemProps) => (value: string) => {
        const numValue = parseInt(value) || 1;
        const constrainedValue = Math.max(1, Math.min(numValue, cartItem.product.stock_quantity));
        setQuantities((prev) => ({...prev, [cartItem.cart_item_id]: constrainedValue}));
        setChangedItems((prev) => ({
            ...prev,
            [cartItem.cart_item_id]: constrainedValue !== cartItem.order_quantity,
        }));
    };

    const handleIncrement = (cartItem: CartItemProps) => () => {
        const newQuantity = Math.min(quantities[cartItem.cart_item_id] + 1, cartItem.product.stock_quantity);
        setQuantities((prev) => ({...prev, [cartItem.cart_item_id]: newQuantity}));
        setChangedItems((prev) => ({
            ...prev,
            [cartItem.cart_item_id]: newQuantity !== cartItem.order_quantity,
        }));
    };

    const handleDecrement = (cartItem: CartItemProps) => () => {
        const newQuantity = Math.max(quantities[cartItem.cart_item_id] - 1, 1);
        setQuantities((prev) => ({...prev, [cartItem.cart_item_id]: newQuantity}));
        setChangedItems((prev) => ({
            ...prev,
            [cartItem.cart_item_id]: newQuantity !== cartItem.order_quantity,
        }));
    };

    const handleConfirmQuantity = (cartItem: CartItemProps) => async () => {
        setChangedItems((prev) => ({...prev, [cartItem.cart_item_id]: false}));
        cartItem.order_quantity = quantities[cartItem.cart_item_id];
        try {
            await axiosClient.post(`product/cart/update-quantity/`, {
                cart_id: cartItem.cart_item_id,
                quantity: quantities[cartItem.cart_item_id],
            });
            setCartUpdated?.(prev => prev + 1);
            const response = await axiosClient.get<CartResponse>(
                `/product/cart/?is_requested=true&page=${page}${filterTitle ? `&title=${encodeURIComponent(filterTitle)}` : ""}`
            );
            const cartItemsData = response.data.result;
            if (!Array.isArray(cartItemsData) || cartItemsData.length === 0) {
                setCartItems([]);
                setQuantities({});
            } else {
                setCartItems(cartItemsData);
                setQuantities(
                    cartItemsData.reduce(
                        (acc, item) => ({...acc, [item.cart_item_id]: item.order_quantity}),
                        {}
                    )
                );
            }
            setTotalPages(response.data.total_pages);
            showSuccessNotification("Quantity updated successfully.");
        } catch (error) {
            showErrorNotification("Failed to update quantity. Please try again.");
        }
    };

    const handleRemove = (cartItem: CartItemProps) => () => {
        modals.openConfirmModal({
            title: "Remove product",
            children: (
                <div className="text-sm">
                    <p>Are you sure you want to delete this product from your Box?</p>
                    <p className="mt-2 text-gray-500">This action cannot be undone.</p>
                </div>
            ),
            labels: {confirm: "Remove", cancel: "Cancel"},
            confirmProps: {color: "red"},
            onConfirm: async () => {
                try {
                    const payload = {cart_id: cartItem.cart_item_id, quantity: "0"};
                    await axiosClient.post(`product/cart/update-quantity/`, payload);

                    showSuccessNotification("Product removed successfully.");
                    const response = await axiosClient.get<CartResponse>(
                        `/product/cart/?is_requested=true&page=${page}${filterTitle ? `&title=${encodeURIComponent(filterTitle)}` : ""}`
                    );
                    const cartItemsData = response.data.result;
                    if (!Array.isArray(cartItemsData) || cartItemsData.length === 0) {
                        setCartItems([]);
                        setQuantities({});
                    } else {
                        setCartItems(cartItemsData);
                        setQuantities(
                            cartItemsData.reduce(
                                (acc, item) => ({...acc, [item.cart_item_id]: item.order_quantity}),
                                {}
                            )
                        );
                    }
                    setTotalPages(response.data.total_pages);
                } catch (error) {
                    showErrorNotification("Failed to delete Product. Please try again");
                }
            },
        });
    };

    return (
        <Box sx={{overflowX: "auto"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px"}}>
                <Text className={classes.sectionTitle}>Products</Text>
                <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
                    {showFilter && (
                        <Formik initialValues={{title: filterTitle}}
                                onSubmit={(values) => setFilterTitle(values.title)}>
                            {({setFieldValue}) => (
                                <Form>
                                    <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
                                        <InputField
                                            size="sm"
                                            radius="md"
                                            maw={160}
                                            placeholder="Filter by Product"
                                            name="title"
                                            onChange={(event) => {
                                                setFieldValue("title", event.currentTarget.value);
                                                setFilterTitle(event.currentTarget.value);
                                            }}
                                            value={filterTitle}
                                        />
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    )}
                    <button
                        className="p-1 rounded transition-colors"
                        aria-label="Filter"
                        onClick={() => setShowFilter((prev) => !prev)}
                    >
                        <IconFilterCode
                            style={{background: dark ? theme.colors.dark[6] : "#fff"}}
                            className="w-5 h-5 hover:text-gray-400"
                        />
                    </button>
                </div>
            </div>
            {cartItems.length === 0 ? (
                <Text className={classes.emptyText}>No products in your cart.</Text>
            ) : (
                <>
                    <Table highlightOnHover striped sx={{minWidth: 700}}>
                        <thead>
                        <tr>
                            <th style={{width: "5%"}}>
                                {selectedItems && selectedItems.length > 0 && (
                                    <ActionIcon variant="transparent" color="red" onClick={handleBulkDelete}>
                                        <IconTrash size={16}/>
                                    </ActionIcon>
                                )}
                            </th>
                            <th style={{width: "10%"}}>Product</th>
                            <th style={{width: "30%"}}>Title</th>
                            <th style={{width: "15%"}}>Details</th>
                            <th style={{width: "12%"}}>Quantity</th>
                            <th style={{width: "10%"}}>Price</th>
                            <th style={{width: "15%"}}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cartItems.map((cartItem) => {
                            const discountPercentage = cartItem.product.discount_percentage
                                ? parseFloat(cartItem.product.discount_percentage.replace(/[^0-9.]/g, ""))
                                : 0;

                            return (
                                <tr key={cartItem.cart_item_id} className={classes.tableRow}>
                                    <td>
                                        <Checkbox
                                            radius="lg"
                                            onChange={handleChange(cartItem)}
                                            checked={selectedItems?.includes(cartItem.cart_item_id)}
                                        />
                                    </td>
                                    <td>
                                        <Flex align="center" gap="xs">
                                            <Image
                                                src={
                                                    cartItem.product?.images?.[0] ?? '/images/placeholder/taskPlaceholder.png'
                                                }
                                                height={60}
                                                width={60}
                                                style={{objectFit: "cover", borderRadius: "4px"}}
                                                alt={cartItem?.product?.name}
                                            />
                                        </Flex>
                                    </td>
                                    <td>
                                        <Tooltip
                                            offset={5}
                                            multiline
                                            width={200}
                                            label={cartItem?.product.name}
                                            position="top"
                                            withArrow
                                        >
                                            <Text fz={{
                                                base: "xs",
                                                sm: "sm"
                                            }}>{truncateName(cartItem?.product.name)}</Text>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        {cartItem?.product?.Varients?.color && (
                                            <Text fz={{
                                                base: "xs",
                                                sm: "sm"
                                            }}>Color: {cartItem.product.Varients.color}</Text>
                                        )}
                                        {cartItem?.product?.Varients?.size && (
                                            <Text fz={{
                                                base: "xs",
                                                sm: "sm"
                                            }}>Size: {cartItem.product.Varients.size}</Text>
                                        )}
                                    </td>
                                    <td>
                                        <Flex align="start" gap="xs">
                                            <ActionIcon
                                                size="sm"
                                                variant="outline"
                                                color={theme.colors.brand[3]}
                                                onClick={handleDecrement(cartItem)}
                                                disabled={quantities[cartItem.cart_item_id] <= 1}
                                            >
                                                <IconMinus size={14}/>
                                            </ActionIcon>
                                            <input
                                                value={quantities[cartItem.cart_item_id]}
                                                onChange={(e) => handleQuantityChange(cartItem)(e.target.value)}
                                                min={1}
                                                max={cartItem?.product?.stock_quantity}
                                                className="w-12 text-center border rounded px-1 py-0.5"
                                            />
                                            <ActionIcon
                                                size="sm"
                                                variant="outline"
                                                color={theme.colors.brand[3]}
                                                onClick={handleIncrement(cartItem)}
                                                disabled={quantities[cartItem.cart_item_id] >= cartItem?.product?.stock_quantity}
                                            >
                                                <IconPlus size={14}/>
                                            </ActionIcon>
                                            {changedItems[cartItem.cart_item_id] && (
                                                <ActionIcon
                                                    size="sm"
                                                    variant="outline"
                                                    color={theme.colors.brand[3]}
                                                    onClick={handleConfirmQuantity(cartItem)}
                                                >
                                                    <IconCheck size={14}/>
                                                </ActionIcon>
                                            )}
                                        </Flex>
                                        {cartItem?.product?.stock_quantity === 0 ? (
                                            <Flex className="text-sx text-red-400 justify-center">
                                                Out of stock
                                            </Flex>
                                        ) : cartItem?.product?.stock_quantity < 15 && (
                                            <Flex className="text-sx text-red-400 justify-center">
                                                Only {cartItem?.product?.stock_quantity} left
                                            </Flex>
                                        )}
                                    </td>
                                    <td>
                                        <Text fz={{base: "xs", sm: "sm"}}>
                                            {/* {cartItem?.currency_symbol || ""}{" "} */}
                                            {<ConvertAndFormat number={(cartItem?.product?.final_price)} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={cartItem.currency_code}/>}
                                        </Text>
                                        {discountPercentage > 0 && (
                                            <Text
                                                fz={{base: "xs", sm: "sm"}}
                                                c="gray.5"
                                                style={{textDecoration: "line-through"}}
                                            >
                                                {/* {cartItem?.currency_symbol || ""}{" "} */}
                                                {<ConvertAndFormat number={(cartItem?.product?.price)} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={cartItem.currency_code} />}
                                            </Text>
                                        )}
                                    </td>
                                    <td>
                                        <Button size="xs" variant="outline" color="red" onClick={handleRemove(cartItem)}
                                                ml={8}>
                                            Cancel
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                    {cartItems.length > 0 && (
                        <Pagination
                            sx={{justifyContent: "center"}}
                            radius={"lg"}
                            mt={28}
                            total={totalPages}
                            value={page}
                            onChange={setPage}
                        />
                    )}
                </>
            )}
        </Box>
    );
};

export default ProductBoxCard;
