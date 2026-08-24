import React, {useEffect, useState} from 'react';
import {Box, Button, Checkbox, useMantineTheme} from "@mantine/core";
import {IconBoxSeam, IconStar} from "@tabler/icons-react";
import {isLoggedIn, useDark} from "@/utils/helpers";
import {ShoppingCart, Check, HeartIcon, HeartCrack} from 'lucide-react';
import dynamic from "next/dynamic";
import { useUserStatus } from "@/hooks/useUserStatus";
import { notifications } from "@mantine/notifications";
import router from "next/router";
import { axiosClient } from "@/utils/axiosClient";
import {useProfile} from "@/hooks/useProfile";
import {IconEye} from "@tabler/icons-react";
import {MdReviews} from "react-icons/md";
import {TiPin, TiPinOutline} from "react-icons/ti";
import {isPinned} from "@mantine/hooks/lib/use-headroom/use-headroom";
import {poppins} from "@/theme/GlobalTheme";
import classes from "*.module.css";
import {useLandingStyles} from "@/styles/pages/LandingStyles";
import {PiBookmarkSimpleFill, PiBookmarkSimpleLight} from "react-icons/pi";
import {useNotificationStyles} from "@/styles/components/toastCenter";
import eventEmitter from "@/components/eventEmitter";
import { useCurrency } from '@/currency/CurrencyContext';
import {format} from "date-fns";

 export interface Product {
    id: number | string;
    name: string;
    rating: number;
    rating_count?: number;
    price: number | any;
     image_details: { id: number; image: string } | { id: number; image: string }[];
    images: string[];
    product_status: boolean | string;
    discount_per: string | any;
    is_pinned?:boolean;
    pinned_id?:string;
    is_pinned_by_owner?: boolean;
    local_currency_details: {
        symbol: string;
        code: string;
    };
    shop: {
        name: string;
        location: string | any;
    };
    user: {
        id: number | string;
        username: string;
    };
     purchase_details?: {
         total_price: number;
         purchase_date: string;
         status: string;
     };
}

interface ProductCardProps {
    products: Product;
    isInCart?: boolean;
    onClick?: null | undefined;
    tabValue?: string;
    is_purchased?: boolean;
    pinnedId?:string;
    is_pinned?:boolean;
    myProduct?:any;
    isShopDetailPage?:boolean;
    allProduct?:any;
    fetchAllProducts?:any;
    fetchUserProducts?:any;
}

const ProductCard: React.FC<ProductCardProps> = ({ products, tabValue,is_purchased , pinnedId , myProduct , isShopDetailPage , allProduct ,fetchAllProducts ,fetchUserProducts }) => {
    const theme = useMantineTheme();
    const dark = useDark();
    const [isAdded, setIsAdded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const {checkStatus} = useUserStatus();
    const [purchased, setPurchased] = useState(false)
    const [addReview, SetAddReview] = useState(false);
    const discountAmount = products ? (products.price * products.discount_per) / 100 : 0;
    const finalPrice = products ? products.price - discountAmount : 0;
    // const productImage = products?.image_details[0]?.image || "";
    const RibbonContainer = dynamic(() => import('react-ribbons').then(mod => mod.RibbonContainer), { ssr: false });
    const Ribbon = dynamic(() => import('react-ribbons').then(mod => mod.Ribbon), { ssr: false });
    const { data: profileData } = useProfile();
    const Profileid = profileData?.user?.id;
    const productCreatorid = products?.user?.id;
    const owner = Profileid === productCreatorid;
    const {globalCurrency , exchangeRate}= useCurrency();
    // const [isActive, setIsActive] = useState<boolean | undefined>(pinned);
    const [isActive, setIsActive] = useState<boolean>(products.is_pinned || false);
    const [pinnedItemId, setPinnedItemId] = useState<ProductCardProps | undefined | string>(pinnedId);
       /*const [exchangeInfo, setExchangeInfo] = useState<number>(89.0);*/
    const {classes} = useLandingStyles();
    const pinnedProduct = products.is_pinned_by_owner
    const { classes: notificationClasses } = useNotificationStyles();
       /*useEffect(() => {
            const fetchExchangeRate = async () => {
                const exchangeData= await axiosClient.get(`locale/cms/exchangerate`);
                const { result } = exchangeData.data;
                // Extract value and currency code
                const rate = parseFloat(result[0]?.value); // Save only the exchange rate (e.g., 89.0)

                setExchangeInfo(rate);
                console.log('Extracted Exchange Info:', exchangeInfo);

            }
            fetchExchangeRate();
        },[])
        console.log("exchangeinfo from service card", exchangeInfo);

        console.log("currency from product card", products.local_currency_details?.code, globalCurrency);*/

    const viewDetail = () => {
        router.push(`/products/${products.id}`);
    };
    const reviewProduct = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!products.id) {
            console.error("Product ID is undefined");
            return;
        }
        const url = `/products/${products.id}?isPurchased=true`;
        console.log("Navigating to:", url);
        try {
            router.push(url);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    const getRibbonColor = (status: string | boolean) => {
        const statusStr = String(status).toLowerCase();
        switch (statusStr) {
            case 'featured':
                return '#22C55E';
            case 'general':
                return '#F9971F';
            case 'sale':
                return '#067fdf';
            case 'hot deals':
                return '#EF4444';
            default:
                return '#F9971F';
        }
    };
    // function formatNumberWithCondition(number: number, symbol: any ): string {
    //     if (symbol === "रु") {
    //         return number.toLocaleString('en-IN', {
    //             minimumFractionDigits: 0,
    //             maximumFractionDigits: 2,
    //         });
    //     } else {
    //         return number.toLocaleString('en-US', {
    //             minimumFractionDigits: 0,
    //             maximumFractionDigits: 2,
    //         });
    //     }
    // }
    function convertCurrency(
        amount: number | string,
        globalCurrency: string,
        currency: string | undefined,
        exchangeRate: number
    ): { amount: number; currency: string; symbol: string | undefined } {
        const parsedAmount = parseFloat(amount.toString());
        if (isNaN(parsedAmount)) {
            throw new Error("Invalid amount provided");
        }

        // Default to globalCurrency if currency is undefined
        const effectiveCurrency = currency || globalCurrency;

        if (globalCurrency !== effectiveCurrency) {
            if (effectiveCurrency === "AUD") {
                return { amount: parsedAmount * exchangeRate, currency: "NPR", symbol: "रु" };
            } else if (effectiveCurrency === "NPR") {
                return { amount: parsedAmount / exchangeRate, currency: "AUD", symbol: "AU$" };
            } else {
                console.warn(`Unsupported currency: ${effectiveCurrency}. Defaulting to ${globalCurrency}.`);
                return { amount: parsedAmount, currency: globalCurrency, symbol: globalCurrency === "AUD" ? "AU$" : "रु" };
            }
        } else {
            console.log(effectiveCurrency, globalCurrency, "currency and globalCurrency are same");
            return {
                amount: parsedAmount,
                currency: effectiveCurrency,
                symbol: effectiveCurrency === "AUD" ? "AU$" : effectiveCurrency === "NPR" ? "रु" : undefined
            };
        }
    }

    function formatNumberWithCondition(number: number, symbol: string | undefined){
        if (!symbol) {
            // Handle undefined symbol
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
            });
        }

        if (symbol === "रु") {
            // Custom format for Nepali style (NPR)
            return number.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
            });
        } else if (symbol === "AU$") {
            // Format for AUD with exactly 2 decimal places
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } else {
            // Fallback for other valid symbols
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
            });
        }
    }

    function convertAndFormatCurrency(amount: number | string, globalCurrency: string|undefined, currency: string|undefined, exchangeRate: number) {
        const { amount: convertedAmount, symbol } = convertCurrency(amount, globalCurrency!, currency!, exchangeRate);
        const formattedAmount = formatNumberWithCondition(convertedAmount, symbol);

        return `${symbol || ''} ${formattedAmount}`;

    }



    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: "Successfully Added",
            message,
            color: "green",
            icon: <HeartIcon className="w-4 h-4" />,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };
    // console.log(products.name, products?.image_details[0]?.image)

    const showErrorNotification = (message: string) => {
        notifications.show({
            title: "Something went wrong",
            message,
            color: "red",
            icon: <HeartCrack className="w-4 h-4" />,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };

    const handleAddToBox = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!checkStatus("profile")) {
            return;
        }

        if (!isAdded && !isAnimating) {
            setIsAnimating(true);
            try {
                const newCartItem = {
                    product: products.id,
                    quantity: 1,
                    variants: null,
                };

                const response = await axiosClient.post('product/cart/', {
                    products: [newCartItem]
                });
                setIsAdded(true);
                showSuccessNotification("Product added to box");
                setIsAnimating(false);
                eventEmitter.emit("cartUpdated");
            } catch (error) {
                setIsAnimating(false);
                showErrorNotification("Failed to add product to box");
                console.error('Error adding to cart:', error);
            }
        }
    };

    const handlePinProduct = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            if (!isActive) {

                const response = await axiosClient.post(`product/pinned-items/`, {
                    product: products.id,
                    priority: 1,
                    active: true,
                });
                setPinnedItemId(response.data.id);
                // console.log('pin',response.data)
                setIsActive(true);

            } else {

                if (!pinnedItemId) throw new Error("Pinned item ID not found");
                await axiosClient.delete(`product/pinned-items/${pinnedItemId}/`);
                setPinnedItemId(undefined);
                setIsActive(false);

            }
            if (allProduct && fetchAllProducts) await fetchAllProducts();
            if (myProduct && fetchUserProducts) await fetchUserProducts();
            // notifications.show({
            //     title: 'Success',
            //     message: `Product "${products.name}" ${isActive ? 'pinned' : 'unpinned'} successfully!`,
            //     color: 'green',
            // });
        } catch (error: any) {
            console.error("Error pinning/unpinning product:", error);

        }
    };

    const handleViewCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push('/box');
    };

    const openViewProduct = () => {
        router.push(`/products/${products.id}`);
    };
    const openViewPurchaseProduct = () => {
        router.push('')
    };

    return (
        <div className="relative w-full max-w-[280px] mx-auto cursor-pointer group">
            <div onClick={tabValue==="Purchased Products"?openViewPurchaseProduct:openViewProduct} className="relative ">
                <div className="absolute top-0 z-10">
                    <RibbonContainer>
                        <Ribbon
                            side="left"
                            type="edge"
                            size="normal"
                            backgroundColor={getRibbonColor(products?.product_status)}
                            color="#ccffff"
                            fontFamily="sans"
                            withStripes
                        >
                            {products?.product_status}
                        </Ribbon>
                    </RibbonContainer>
                </div>
                {!myProduct && pinnedProduct && isShopDetailPage &&(
                    <div
                        className="absolute top-2 right-2 bg-gray-50 p-1.5 rounded-full z-20"
                        aria-label="Product is pinned by shop owner"
                    >
                        <TiPin className="text-xl text-red-500" />
                    </div>
                )}
                <Box
                    sx={{
                        background: dark ? theme.colors.dark[8] : "#fff",
                        borderRadius: "10px",
                        "&:hover":{
                            borderColor:theme.colors.brand[3]
                        }

                    }}
                    className="flex flex-col h-full border hover:border-gray shadow-md overflow-hidden w-full max-w-sm mx-auto md:max-w-none transform transition duration-200 ease-in-out hover:scale-101"
                >
                    <div className="relative pt-[100%] w-full">
                        <img
                            src={(Array.isArray(products?.image_details)
                                    ? products.image_details[0]?.image
                                    : products?.image_details?.image) || "/images/placeholder/taskPlaceholder.png"}
                            alt={products?.name}
                            className="absolute top-0 left-0 w-full h-full object-contain bg-gray-50"
                        />
                    </div>
                    <div className="flex flex-col flex-grow p-3 ">
                        <div className="relative group px-1 ">
                            <h3
                                className=" sm:text-base  line-clamp-1  transition-all duration-200"
                                style={{
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 1,
                                    fontSize: 14,
                                    fontFamily: "poppins"
                                }}
                            >
                                {products?.name ? products.name.charAt(0).toUpperCase() + products.name.slice(1) : ''}
                            </h3>
                            {products?.name?.length > 27  && (
                            <div
                                className="absolute left-0 -top-11 hidden group-hover:block bg-gray-800 text-white text-sm p-2 rounded shadow-lg"
                                style={{
                                    maxWidth: "200px",
                                    whiteSpace: "normal",
                                    wordWrap: "break-word",
                                    zIndex: 10,
                                }}
                            >
                                {products?.name ? products.name.charAt(0).toUpperCase() + products.name.slice(1) : ''}
                            </div>
                        )}
                        </div>
                        <div className="flex sm:flex-row sm:items-center justify-between mb-1 px-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                                {tabValue === "Purchased Products" && is_purchased && products.purchase_details ? (
                                    <div>
                                        <p style={{ color: theme.colors.product[0] }} className="text-md sm:text-xl md:text-sm text-orange-500 font-bold">
                                            {convertAndFormatCurrency(products.purchase_details.total_price,globalCurrency, products.local_currency_details?.code, exchangeRate ?? 1)}
                                            {/* {products.local_currency_details?.symbol} {formatNumberWithCondition(products.purchase_details.total_price, products.local_currency_details?.symbol)} */}
                                        </p>
                                        {/*<p className="text-xs text-gray-500">Purchased on: {products.purchase_details.purchase_date}</p>*/}
                                        {/*<p className="text-xs text-gray-500">Status: {products.purchase_details.status}</p>*/}
                                    </div>
                                ) : (
                                    <p style={{ color: theme.colors.product[0] }} className="text-md sm:text-xl md:text-sm text-orange-500 font-bold">
                                       {convertAndFormatCurrency(finalPrice,globalCurrency, products.local_currency_details?.code, exchangeRate ?? 1)}
                                        {/* {products.local_currency_details?.symbol} {formatNumberWithCondition(finalPrice, products.local_currency_details?.symbol)} */}
                                    </p>
                                )}
                                {tabValue !== "Purchased Products" && is_purchased && products.discount_per > 0 && finalPrice !== products.price && (
                                    <div className="flex items-center text-xs">
                                        <span className="text-gray-500 line-through">
                                            {/*{products.local_currency_details?.symbol}*/}
                                            {convertAndFormatCurrency(products.price,globalCurrency, products.local_currency_details?.code, exchangeRate ?? 1)}
                                            {/* {formatNumberWithCondition(products.price, products.local_currency_details?.symbol)} */}
                                        </span>
                                        <span className="text-green-600">
                                        </span>
                                    </div>
                                )}
                            </div>
                            {/* <div className="flex flex-col md:flex-row md:items-center mb-1 mt-1 "
                                 style={{
                                     color:
                                         theme.colorScheme === "dark"
                                             ? theme.colors.dark[0]
                                             : theme.colors.homaaleSlate[5],
                                 }}
                            >

                                <div className="flex items-center gap-1">
                                    <IconStar color={products?.rating > 0 ? "orange" : undefined} size={16}/>
                                    <span className="text-gray-500 text-xs">{products?.rating ? products?.rating.toFixed(0) : 0}</span>
                                    {products?.rating_count&&products?.rating_count > 0 && (<span> ({products?.rating_count})</span>)}
                                </div>

                            </div> */}
                            <div className="flex flex-col md:flex-row md:items-center mb-1 mt-1 "
                                 style={{
                                     color:
                                         theme.colorScheme === "dark"
                                             ? theme.colors.dark[0]
                                             : theme.colors.homaaleSlate[5],
                                 }}
                            >

                                <div className="flex items-center gap-1">
                                    <IconStar color={products?.rating > 0 ? "orange" : "gray"} size={16}/>
                                    <span className="text-gray-500">{products?.rating ? products?.rating.toFixed(0) : 0}</span>
                                    {typeof products?.rating_count === 'number' && products.rating_count > 0 && (<span className="text-gray-500"> ({products.rating_count})</span>)}                                </div>
                            </div>
                        </div>
                        {tabValue === "Purchased Products" && is_purchased && products.purchase_details && (
                                <div className="flex justify-center text-xs text-gray-500">  Purchased on: {format(new Date(products.purchase_details.purchase_date), 'PPP')}
                                </div>
                            )}
                                {tabValue !== "Purchased Products" && !owner && (
                            <Button
                                variant={"outline"}
                                radius={"xl"}
                                onClick={isAdded ? handleViewCart : handleAddToBox}
                                disabled={isAnimating}

                                sx={{
                                    '&:hover': {
                                        background: isAdded ? theme.colors.green[4] : theme.colors.brand[4],
                                        color: 'white',
                                    },
                                    background: isAdded ? theme.colors.green[4] : "",
                                    color : isAdded ? 'white' : theme.colors.brand[4],
                                    borderColor: isAdded ? theme.colors.green[4] : ""[4],
                                }}
                            >
                                <div
                                    className={`
                                    flex items-center gap-2
                                    transform transition-transform duration-300
                                    ${isAdded ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
                                `}
                                >
                                    <span className="text-sm md:text-base">Add to Box</span>
                                </div>
                                <div
                                    className={`
                                    absolute inset-0 flex items-center justify-center gap-2
                                    transform transition-transform duration-300
                                    ${isAdded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                                `}
                                >
                                    <Check className="w-4 h-4 md:w-5 md:h-5"/>
                                    <span className="text-sm md:text-base">In Box</span>
                                </div>
                                {isAnimating && (
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 animate-ripple"/>
                                    </div>
                                )}
                            </Button>
                        )}
                        {tabValue !== "Purchased Products" && owner && (
                            <Button
                                variant={"outline"}
                                radius={"xl"}
                                onClick={handleAddToBox}
                                disabled={isAnimating}
                                sx={{
                                    '&:hover': {
                                        background: isAdded ? theme.colors.green[4] : theme.colors.brand[4],
                                        color: 'white',
                                    },
                                    background: isAdded ? theme.colors.green[4] : "",
                                    color : isAdded ? 'white' : theme.colors.brand[4],
                                    borderColor: isAdded ? theme.colors.green[4] : ""[4],
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm md:text-base">Add to Box</span>
                                </div>
                            </Button>
                        )}
                        {tabValue === "Purchased Products" && is_purchased && (
                            <Button
                                variant={"outline"}
                                radius={"xl"}
                                onClick={reviewProduct}
                                disabled={isAnimating}
                                sx={{
                                    '&:hover': {
                                        background: isAdded ? theme.colors.green[4] : theme.colors.brand[4],
                                        color: 'white',
                                    },
                                    background: isAdded ? theme.colors.green[4] : "",
                                    color : isAdded ? 'white' : theme.colors.brand[4],
                                    borderColor: isAdded ? theme.colors.green[4] : ""[4],
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <MdReviews className="w-5 h-5 "/>
                                    <span className="text-sm">Add your review</span>
                                </div>
                            </Button>
                        )}
                    </div>
                    {(myProduct || allProduct) && isLoggedIn() && (
                        <Button
                            className={`absolute top-2 right-2 transition-opacity bg-gray-50 p-1.5 rounded-full focus:ring-2 focus:ring-gray-50 ${
                                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                           }`}
                            styles={{
                               root: {
                                    padding: 0,
                                    width: '2rem',
                                    height: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    '&:hover': {
                                        background: 'transparent',
                                    },
                                },
                            }}
                            onClick={handlePinProduct}

                            role="button"
                            tabIndex={0}
                            title={isActive ? "Unpin Product" : "Pin Product"}
                        >
                            {myProduct ? (
                                isActive ? (
                                    <TiPin className="text-xl text-red-500" />
                                ) : (
                                    <TiPinOutline className="text-xl text-red-500" />
                                )
                            ) : allProduct ? (
                                isActive ? (
                                    <PiBookmarkSimpleFill className="text-xl text-red-500" />
                                ) : (
                                    <PiBookmarkSimpleLight className="text-xl text-red-500" />
                                )
                            ) : (
                                <PiBookmarkSimpleLight className="text-xl text-red-500" />
                            )}

                        </Button>
                        )}
            </Box>
                </div>
        </div>
    );
};

export default ProductCard;
