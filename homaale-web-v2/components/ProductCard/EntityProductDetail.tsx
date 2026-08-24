
import React, {useState, useEffect} from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Share2,
    X,
    ShoppingCart,
    Check,
    Star,
    ThumbsUp,
    MessageCircle,
    Edit, Trash2,
} from 'lucide-react';
import {Alert, Box, Flex, Progress, Rating, Tooltip, useMantineTheme} from "@mantine/core";
import {IconShare, IconBox, IconShoppingCartCheck, IconStar, IconCheck} from "@tabler/icons-react";
import {axiosClient} from "@/utils/axiosClient";
import {notifications} from "@mantine/notifications";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import router from "next/router";
import {modals} from '@mantine/modals';
import {useUserStatus} from "@/hooks/useUserStatus";
import profileInfo from "@/components/merchant/ProfilePage/ProfileInfo";
import {useProfile} from "@/hooks/useProfile";
import RatingSection from '../rating/RatingSection';
import ProductDetails from '@/pages/products/[id]';
import {display} from '@mui/system';
import Reviews, {ReviewCard} from '../merchant/ProfilePage/Reviews';
import {ShareButton} from "@/components/common/ShareButton";
import Ellipsis from "@/components/common/Ellipsis";
import {isLoggedIn} from "@/utils/helpers";
import {BiCategory} from "react-icons/bi";
import {FaStar} from 'react-icons/fa6';
import {FaRegStar} from 'react-icons/fa';
import {useEntityServiceDetailStyles} from "@/styles/pages/EntityServiceDetailStyles";
import ConvertAndFormat from '../CurrencyNumberFormatter/ConvertAndFormat';
import { useCurrency } from '@/currency/CurrencyContext';

export interface ProductDetail {
    id: string;
    is_active: boolean;
    name: string;
    product_status: string;
    category_details: {
        id: number;
        name: string;
        slug: string;
        icon: string;
        extra_data: any;
        commission: number;
        inherits_commission: boolean;
    };
    description: string;
    slug: string;
    price: number;
    stock_quantity: number;
    rating: number;
    SKU: string | number;
    cost_price: number;
    key_feature: string[];
    local_currency_details: {
        code: string;
        name: string;
        minor: number;
        tolerance: number;
        supports_stripe: boolean;
        is_active: boolean;
        current_value: number;
        is_default: boolean;
        enable_currency_configuration: boolean;
        symbol: string;
    };
    discount_per: number;
    shop?: {
        name: string;
        latitude: number;
        longitude: number;
        status: string;
        about: string;
    };
    image_details:{
        id:number,
        image:string
    }[]
    images: string[];
    about_product?: string;
    user:string;
    shop_id: string;
    variant_details: Array<{
        SKU: string;
        color: string | null;
        id: number;
        images: string[];
        size: string | null;
        label: string;
    }>;
}


const EntityProductDetails = (
    {productId}: { productId: string | string[] | undefined | any }
) => {
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [review, setReview] = useState(false);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
    const [alertInfo, setAlertInfo] = useState({
        message: '',
        visible: false,
        icon: null as React.ReactNode,
        title: ''
    });
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const {data: profileData} = useProfile();
    const Profileid = profileData?.user?.id;
    const productid = product?.user;
    const {checkStatus} = useUserStatus();
    const permission = Profileid === productid;
    const discountAmount = product ? (product.price * product.discount_per) / 100 : 0;
    const price = product ? product.price - discountAmount : 0;
    const finalPrice = product ? product.price : 0;
    const shopId = product?.shop_id;
    const productName = product?.name;
    const productImage = product?.images[0];
    const {classes} = useEntityServiceDetailStyles();
    const theme = useMantineTheme();
    const{globalCurrency}=useCurrency();
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
        },[])


    // console.log("product details", product)
    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: "Successfully Added",
            message,
            color: "green",
            icon: <Check className="w-4 h-4"/>,
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
            icon: <X className="w-4 h-4"/>,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };

    function formatNumberWithCondition(number: number, symbol: any): string {
        if (symbol === "रु") {
            // Custom format for Nepali style
            return number.toLocaleString('en-IN', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
            });
        } else {
            // Default English format
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
            });
        }
    }


    useEffect(() => {
        if (router.query.isPurchased === 'true') {
            setReview(true);
        } else {
            setReview(false);
        }

        const fetchProductData = async () => {
            try {
                setLoading(true);


                const response = await axiosClient.get(`/product/${productId}`);
                setProduct(response.data);
                setLoading(false);
                // console.log("product detail",response.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setLoading(false);
            }
        };

        fetchProductData();


    }, [productId, router.query]);


    const handleAddToBox = async () => {
        if (!checkStatus("profile")) {
            // showErrorNotification("Please complete KYC to add items to cart");
            return;
        }

        if (!isAdded && !isAnimating && productId) {
            setIsAnimating(true);
            try {
                const newCartItem = {
                    product: productId,
                    variant: selectedVariantId,
                    quantity: quantity
                };

                const response = await axiosClient.post('product/cart/', {
                    products: [newCartItem]
                });

                setIsAdded(true);
                showSuccessNotification("Product added to box");
                setIsAnimating(false);
            } catch (error) {
                setIsAnimating(false);
                showErrorNotification("Failed to add product to box");
                // console.error('Error adding to cart:', error);
            }
        } else if (!selectedVariantId) {
            showErrorNotification("Please select a size and color");
        }
    };

    const handleRemoveFromBox = async () => {
        if (!checkStatus("profile")) {
            // showErrorNotification("Please complete KYC to remove items from cart");
            return;
        }
        router.push("/box");
    };

    // Auto slider effect
    useEffect(() => {
        if (!product) return;

        const interval = setInterval(() => {
            setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [product]);

    const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;

        const image = e.currentTarget;
        const {left, top, width, height} = image.getBoundingClientRect();
        const x = (e.clientX - left) / width * 100;
        const y = (e.clientY - top) / height * 100;

        setMousePosition({x, y});
    };


    const handleEdit = () => {
        router.push({
            pathname: "/post/entity",
            query: {
                type: "product",
                id: productId,
            },
        });
    };

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDelete = async () => {
        modals.openConfirmModal({
            title: "Delete Confirmation",
            children: (
                <div><p>Are you sure you want to delete your product ?</p>
                    <p className="text-red-500 ml-20 mt-2">This action cannot be undone.</p>
                </div>),
            labels: {confirm: 'Delete', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: async () => {
                try {
                    const productIds = Array.isArray(productId) ? productId : [productId];
                    const payload = {product_ids: productIds};

                    // console.log('Payload:', JSON.stringify(payload, null, 2));

                    await axiosClient.put('/product/delete/?action=soft', payload);

                    notifications.show({
                        title: "Success",
                        message: "Product moved to bin successfully",
                        color: 'green',
                        icon: <Check className="w-4 h-4"/>,
                        autoClose: 3000,
                        style: {
                            position: 'fixed',
                            top: '60px',
                            right: "20px",
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    });

                    router.push('/products');
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error occurred';

                    notifications.show({
                        title: "Error",
                        message: `Product Failed to move to bin: ${errorMessage}`,
                        color: 'red',
                        icon: <X className="w-4 h-4"/>,
                        autoClose: 3000,
                        style: {
                            position: 'fixed',
                            top: '60px',
                            right: "20px",
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    });
                }
            }
        });
    };

    const handleBuyNow = async () => {
        if (!checkStatus("profile")) {
            // showErrorNotification("Please complete KYC to add items to box");
            return;
        }

        if (!isAdded && !isAnimating && productId) {
            setIsAnimating(true);
            try {
                const newCartItem = {
                    product: productId,
                    variant: selectedVariantId,
                    quantity: quantity
                };

                const response = await axiosClient.post('product/cart/', {
                    products: [newCartItem]
                });

                setIsAdded(true);
                // showSuccessNotification("Product added to cart");
                router.push("/box");
                setIsAnimating(false);
            } catch (error) {
                setIsAnimating(false);
                showErrorNotification("Failed to add product to box");
                // console.error('Error adding to cart:', error);
            }
        } else if (!selectedVariantId) {
            showErrorNotification("Please select a size and color");
        }
    };
    const truncateHTML = (html: string, charLimit: number) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        const plainText = div.textContent || div.innerText || "";

        if (plainText.length <= charLimit) {
            return html;
        }

        let result = '';
        let charCount = 0;
        const stack = []; // To track open tags
        let i = 0;

        while (i < html.length && charCount < charLimit) {
            if (html[i] === '<') {
                // Handle HTML tags
                const tagEnd = html.indexOf('>', i);
                if (tagEnd === -1) break;
                const tag = html.slice(i, tagEnd + 1);
                const isClosingTag = tag.startsWith('</');

                if (!isClosingTag && !tag.includes('/>')) {
                    const tagNameMatch = tag.match(/<([a-zA-Z0-9]+)/);
                    if (tagNameMatch) {
                        stack.push(tagNameMatch[1]);
                    }
                } else if (isClosingTag) {
                    const tagNameMatch = tag.match(/<\/([a-zA-Z0-9]+)/);
                    if (tagNameMatch && stack[stack.length - 1] === tagNameMatch[1]) {
                        stack.pop();
                    }
                }
                result += tag;
                i = tagEnd + 1;
            } else {
                // Handle text content
                result += html[i];
                charCount++;
                i++;
            }
        }

        // Append ellipsis
        result += '...';

        // Close any open tags
        while (stack.length > 0) {
            result += `</${stack.pop()}>`;
        }

        return result;
    };

    const handlePrevImage = () => {
        if (!product) return;
        setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        if (!product) return;
        setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    };
    const goToShop = () => {
        router.push(`/shops/${shopId}`);
    };
    const goToCatagory = () => {
        if (!product?.category_details) {
            router.push('/products');
            return;
        }

        const {name, id} = product.category_details;
        router.push({
            pathname: '/products',
            query: {
                // category: slug,
                category_name: name,
                category_id: id.toString(),
            },
        });
    };

    // Variant Selection Logic
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        setSelectedColor(null);
        setSelectedVariantId(null);
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        const variant = product?.variant_details.find(
            (v) => v.size === selectedSize && v.color === color
        );
        setSelectedVariantId(variant ? variant.id : null);
    };

    const uniqueSizes = Array.from(
        new Set(
            product?.variant_details
                .filter((variant): variant is { size: string; color: string | null; SKU: string; id: number; images: string[]; label: string } => variant.size != null)
                .map(variant => variant.size)
        )
    ) as string[];

    const availableColors = selectedSize
        ? Array.from(
            new Set(
                product?.variant_details
                    .filter((variant): variant is { size: string; color: string; SKU: string; id: number; images: string[]; label: string } => variant.size === selectedSize && variant.color != null)
                    .map(variant => variant.color)
            )
        ) as string[]
        : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <HomaaleLoader/>
            </div>
        );
    }
    if (error) {
        return <div className="text-red-500 p-4 text-center">{error}, try reloading the page</div>;
    }
    if (!product) {
        return <div className="text-center p-4">No product information available</div>;
    }

    const descriptionText = product.description?.replace(/<[^>]+>/g, '');
    // const shouldShowToggle = descriptionText?.length > 300;

    return (
        <div className="max-w-[1500px] mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-[500px_1fr] gap-8">
                {/* Image Gallery */}
                <div className="relative">
                    <div
                        className="relative overflow-hidden rounded-lg"
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                        onMouseMove={handleImageMouseMove}
                    >
                        {product.image_details.length >0 ? (



                               <img
                                   src={product.image_details[selectedImage]?.image}
                                   alt={product.name}
                                   className={`w-[550px] h-[400px] object-contain transition-transform duration-200 ${
                                       isZoomed ? 'scale-125' : ''
                                   }`}
                                   style={isZoomed ? {
                                       transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                                   } : {}}
                               />




                        ) : (
                            <img
                                src={"/images/placeholder/taskPlaceholder.png"}
                                alt={product.name}
                                className={`w-[550px] h-[500px] object-contain transition-transform duration-200 ${
                                    isZoomed ? 'scale-125' : ''
                                }`}
                                style={isZoomed ? {
                                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                                } : {}}
                            />
                        )}

                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                        >
                            <ChevronLeft className="w-6 h-6"/>
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                        >
                            <ChevronRight className="w-6 h-6"/>
                        </button>
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                        {product.image_details.map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => setSelectedImage(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${
                                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                                }`}
                            >
                                <img
                                    src={img.image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg"/>
                            </button>
                        ))}
                    </div>
                </div>

                {/*{alertInfo.visible && (*/}
                {/*    <Alert className="fixed bottom-20 right-4 z-50 max-w-md animate-slide-up">*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*            {alertInfo.icon}*/}
                {/*            <div>*/}
                {/*                <h4 className="font-semibold">{alertInfo.title}</h4>*/}
                {/*                <p className="text-sm whitespace-pre-line">{alertInfo.message}</p>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </Alert>*/}
                {/*)}*/}

                {/* Product Details */}
                <div className="space-y-2 md:-mt-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {product?.name ? product.name.charAt(0).toUpperCase() + product.name.slice(1) : ''} 
                                {/*{product.name}*/}
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            {/*<button*/}
                            {/*    onClick={handleShareProduct}*/}
                            {/*    className="p-1 rounded-full hover:bg-gray-50">*/}
                            {/*    <Share2 className="w-6 h-6"/>*/}
                            {/*</button>*/}
                            <ShareButton

                                showText={false}
                                url={
                                    typeof window !== "undefined"
                                        ? window.location.origin +
                                        `/products/${productId}`
                                        : ""
                                }
                                size={30}
                            />
                            {!permission && isLoggedIn() && (
                                <Ellipsis
                                    size={16}
                                    type="product"
                                    id={productId}
                                    reportHeading={productName ? `Report ${productName}` : "Merchant"}
                                    reportSubHeading="Please provide details about the issue with this product."
                                    reportedUserId={productId}
                                    reportedUserName={productName || "Merchant"}
                                    reportedUserImage={productImage || ""}
                                />
                            )}
                            {permission && isLoggedIn() && (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="p-1 rounded-full hover:bg-gray-100">
                                        <Edit className="w-6 h-6"/>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-1 rounded-full hover:bg-gray-100">
                                        <Trash2 className="w-6 h-6"/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => {
                                const rating = product.rating || 0;
                                if (rating === 0 && i === 0) {
                                    return <FaStar key={i} className="text-gray-300"/>;
                                }
                                return (
                                    <span key={i} className={i < rating ? 'text-orange-400' : 'text-gray-300'}>
                                        <FaStar/>
                                    </span>
                                );
                            })}
                        </div>
                        <span className="text-sm text-gray-600">{product.rating || 0} Ratings</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            {/* Prices */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-orange-500">
                                {/* {product.local_currency_details?.symbol || ''} &nbsp; */}
                                  {/*// {product.cost_price.toLocaleString()}*!/*/}
                                  {/* {formatNumberWithCondition(price, product.local_currency_details?.symbol)} */}
                                  <ConvertAndFormat number={price} currency={product.local_currency_details?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}/>

                            </span>
                                <span className="text-gray-400 line-through">
                                {/* {product.local_currency_details?.symbol || ''} &nbsp; */}
                                    {/*{product.price.toLocaleString()}*!/*/}
                                    {/* {formatNumberWithCondition(finalPrice, product.local_currency_details?.symbol)} */}
                                    <ConvertAndFormat number={finalPrice} currency={product.local_currency_details?.code} globalCurrency={globalCurrency} exchangeRate={exchangeInfo}/>
                            </span>
                                {/*<span className="text-green-600">-{product.discount_per}%</span>*/}
                            </div>

                            {/* Stock Info */}
                            {typeof product.stock_quantity === 'number' && (
                                <div>
                                <span
                                    className={`text-sm font-medium ${
                                        product.stock_quantity === 0 ? "text-gray-500" :
                                            product.stock_quantity <= 10 ? "text-red-500" : "text-green-600"
                                    }`}
                                >
                                  {
                                      product.stock_quantity === 0 ? "Sold Out"
                                          : product.stock_quantity <= 10
                                              ? `Low Stock (${product.stock_quantity} left)`
                                              : "In Stock"
                                  }
                                </span>
                                </div>
                            )}
                        </div>
                    </div>


                    {/*<div*/}
                    {/*    // className={`text-gray-700 whitespace-pre-line ${*/}
                    {/*    //     isExpanded ? '' : 'line-clamp-6'*/}
                    {/*    // }`} // Remove line-clamp when expanded*/}
                    {/*    className={classes.description}*/}
                    {/*    dangerouslySetInnerHTML={{__html: !shouldShowToggle ? product.description : truncateHTML(product.description, 250)}}*/}
                    {/*/>*/}
                    {product?.category_details?.name && product?.category_details?.name && product?.category_details?.name.trim() !== '' && (
                        <Tooltip withArrow label="Category" position="bottom-start">
                            <div className="flex items-center">
                                {/*<div className="mt-8 flex">*/}
                                <p className="mr-2">Category :</p>
                                {/*        <BiCategory size={20} className="text-gray-600 mr-2"/>*/}
                                <span onClick={goToCatagory}
                                      className="text-orange-500 hover:cursor-pointer">{product?.category_details?.name}</span>
                                {/*</div>*/}
                            </div>
                        </Tooltip>
                    )}
                    {product.shop && product.shop.name && product.shop.name.trim() !== '' && (
                        <Tooltip withArrow label="Shop Name" className="mb-3" position="bottom-start">
                            <div className="flex items-center">
                                <p className="mr-2">Shop Name :</p>
                                <span onClick={goToShop}
                                      className="text-orange-500 hover:cursor-pointer ">{product?.shop?.name}</span>
                            </div>
                        </Tooltip>
                    )}

                    {product?.variant_details?.length > 0 && (
                        <div className="space-y-2">
                            <hr style={{margin: "10px", marginBottom: "10px"}}/>
                            {/* Size */}
                            {uniqueSizes.length > 0 && (
                                <div>
                                    <h3 className="text-sm text-gray-500">Size</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {uniqueSizes.map((size, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSizeSelect(size)}
                                                    className={`px-3 py-1 rounded border border-gray-300 hover:bg-orange-100 text-sm transition-colors ${
                                                        selectedSize === size ? 'bg-orange-100 border-orange-500' : ''
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Color */}
                            {selectedSize && availableColors.length > 0 && (
                                <div>
                                    <h3 className="text-sm text-gray-500">Color</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex gap-2 flex-wrap">
                                            {availableColors.map((color, index) => {
                                                // Normalize color to lowercase and trim, with fallback to black
                                                const normalizedColor = color?.toLowerCase().trim() || '#000000';
                                                // Validate color (hex or named CSS color)
                                                const isValidColor = /^#[0-9A-F]{6}$/i.test(normalizedColor) || CSS.supports('color', normalizedColor);
                                                const displayColor = isValidColor ? normalizedColor : '#000000';

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleColorSelect(color)}
                                                        className={`
                                                            px-3 py-1 rounded border border-gray-300 text-sm transition-colors
                                                            hover:bg-[color-mix(in_srgb,${displayColor}_20%,white)]
                                                            ${selectedColor === color ? `bg-[color-mix(in_srgb,${displayColor}_20%,white)] bg-orange-100 border-orange-500` : ''}
                                                        `}
                                                        style={{'--color': displayColor} as React.CSSProperties}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className="w-4 h-4 rounded-full inline-block border border-gray-200"
                                                                style={{backgroundColor: displayColor}}
                                                            ></span>
                                                            {color}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm text-gray-500">Quantity</h3>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-semibold  "
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(q + 1, product.stock_quantity || 0))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 rounded bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xl "
                                    disabled={quantity >= (product.stock_quantity || 0)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="mt-5 text-sm text-gray-600 font-medium">
                            **Price is inclusive of VAT**
                        </div>
                        <hr style={{margin: "10px", marginBottom: "10px"}}/>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleBuyNow}
                                style={{
                                    borderRadius: "10px",
                                }}
                                className={`
                                    rounded-2xl w-56
                                    relative overflow-hidden px-4 md:px-6 py-2
                                    transition-all duration-300 ease-out
                                    bg-blue-500 hover:bg-blue-600
                                    text-white
                                    group flex items-center justify-center gap-2 min-w-[120px] md:min-w-32
                                    before:content-[''] before:absolute before:top-0 before:left-0
                                    before:w-full before:h-full before:bg-white/20
                                    before:transform before:scale-x-0 before:origin-right
                                    hover:before:scale-x-100 hover:before:origin-left
                                    before:transition-transform before:duration-300
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <IconBox className="w-5 h-5"/>
                                    <span className="text-sm md:text-base">Buy Now</span>
                                </div>
                            </button>
                            <button
                                onClick={isAdded ? handleRemoveFromBox : handleAddToBox}
                                disabled={isAnimating}
                                style={{
                                    borderRadius: "10px",
                                }}
                                className={`
                                rounded-2xl
                                relative overflow-hidden px-4 md:px-6 py-2
                                transition-all duration-300 ease-out w-full md:w-auto
                                ${isAdded ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'}
                                text-white
                                disabled:opacity-50 disabled:cursor-not-allowed
                                group flex items-center justify-center gap-2 min-w-[120px] md:min-w-32
                                before:content-[''] before:absolute before:top-0 before:left-0
                                before:w-full before:h-full before:bg-white/20
                                before:transform before:scale-x-0 before:origin-right
                                hover:before:scale-x-100 hover:before:origin-left
                                before:transition-transform before:duration-300
                            `}
                            >
                                <div
                                    className={`
                                    flex items-center gap-2 md:px-6
                                    transform transition-transform duration-300
                                    ${isAdded ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
                                `}
                                >
                                    <ShoppingCart className="w-5 h-5"/>
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
                            </button>
                        </div>
                        <Box
                            component="div"
                            mb="20px"
                            className={classes.requirements}
                        >
                            {Array.isArray(product.key_feature) && product.key_feature?.length > 0 ? (
                                <>
                                    <h4> Key Specification: </h4>
                                    {product.key_feature?.map((highlights, index) => (
                                        <Flex
                                            justify="flex-start"
                                            className="requirement-list"
                                            key={index}
                                        >
                                            <IconCheck
                                                size={18}
                                                color={`${theme.colors.blue[5]}`}
                                                style={{
                                                    marginRight: "8px",
                                                }}
                                            />
                                            <p>{highlights}</p>
                                        </Flex>
                                    ))}
                                </>
                            ) : (
                                ""
                            )}
                        </Box>
                    </div>
                </div>
            </div>

            {/*About Product details*/}
            <div className="mt-8">
                <h2 className="text-2xl font-bold">About Product</h2>
                {/*<div*/}
                {/*    // className={`text-gray-700 whitespace-pre-line ${*/}
                {/*    //     isExpanded ? '' : 'line-clamp-6'*/}
                {/*    // }`} // Remove line-clamp when expanded*/}
                {/*    className={classes.description}*/}
                {/*    dangerouslySetInnerHTML={{ __html: isExpanded || !shouldShowToggle ? product.description : truncateHTML(product.description, 300) }}*/}
                {/*/>*/}
                <div
                    className={`${classes.description} text-gray-700 whitespace-pre-line overflow-auto px-1 pr-2`}
                    dangerouslySetInnerHTML={{__html: product.description}}
                />

                {/*{shouldShowToggle && (*/}
                {/*    <button*/}
                {/*        onClick={toggleDescription}*/}
                {/*        className="mt-2 text-orange-500 flex flex-end hover:text-orange-400 font-medium"*/}
                {/*    >*/}
                {/*        {isExpanded ? 'See Less' : 'See More'}*/}
                {/*    </button>*/}
                {/*)}*/}
            </div>


            {/* Reviews Section */}
            <div className="mt-16" style={{}}>
                <Reviews merchantId={product?.user} productId={product?.id} is_product={true} is_purchased={review}/>
            </div>
        </div>
    );
};


export default EntityProductDetails;

