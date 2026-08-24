import React, {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import Layout from "@/components/Layout/Layout";
import {axiosClient} from "@/utils/axiosClient";
import Image from 'next/image';
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {CalendarDays, Check, CheckCircle, ChevronLeft, ChevronRight, Edit, MapPin, X, XCircle} from "lucide-react";
import {IconShare} from "@tabler/icons-react";
import ProductCard from "@/components/ProductCard/ProductCard";
import {Alert, Button, Group, Tooltip} from "@mantine/core";
import {modals} from "@mantine/modals";
import {notifications} from "@mantine/notifications";
import {useProfile} from "@/hooks/useProfile";
import {isLoggedIn, useDark} from "@/utils/helpers";
import {useUserStatus} from "@/hooks/useUserStatus";
import {ShareButton} from "@/components/common/ShareButton";
import {FaRegEdit} from "react-icons/fa";
import {BiCategory} from "react-icons/bi";
import Ellipsis from "@/components/common/Ellipsis";
import {useEntityServiceDetailStyles} from "@/styles/pages/EntityServiceDetailStyles";
import {useMediaQuery} from "@mantine/hooks";
import {CmsProps} from "@/pages/products";

interface Shop {
    id: string;
    name: string;
    about: string;
    category: number;
    category_name: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
    location: string;
    address: string;
    owner: string;
    owner_id: string;
    images: Array<{
        id: number;
        image: string;
        uploaded_at: string;
    }>;
    created_at: string;
    updated_at: string;
    status: string;
    products: Product[];
}

interface Product {
    id: string;
    SKU: string;
    name: string;
    description: string;
    cost_price: string;
    discount_per: string;
    is_active: boolean;
    is_deleted: boolean;
    local_currency_details: any;
    price: string;
    image_details:{
        id:number,
        image:string
    }
    images: string[];
    product_status: string;
    rating: number;
    slug: string;
    is_pinned: boolean;
    pinned_id?: string;
    is_pinned_by_owner: boolean;
    stock_quantity: number;
    shop: {
        name: string;
        location: string | any;
    };
    user: {
        id: number | string;
        username: string;
    };
}

const ShopDetailPage = () => {
    const router = useRouter();
    const {id} = router.query;
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
    const [selectedImage, setSelectedImage] = useState(0);
    const [owner, setOwner] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [status, setStatus] = useState('pending');
    const [modalOpened, setModalOpened] = useState(false);
    const [cannotVerify, setCannotVerify] = useState(false);
    const [canCreateProduct, setCanCreateProduct] = useState<boolean>(false);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [isMerchant, setIsMerchant] = useState<boolean>(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [maxProducts, setMaxProducts] = useState<number>(0);
    const [currentProductCount, setCurrentProductCount] = useState<number>(0);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const dark = useDark();
    const {data: profileData} = useProfile();
    const merchantId = profileData?.user?.id;
    const verifyMerchant = profileData?.merchant_data?.[0]?.is_premium;
    const {checkStatus} = useUserStatus();
    const {classes} = useEntityServiceDetailStyles();
    const Profileid = profileData?.user?.id;
    const shopId = shop?.owner;
    const permission = Profileid === shopId;
    const isShopOwner = profileData?.user.id === shop?.owner_id;
    const shopName = shop?.name;
    const shopImage = shop?.images?.[0]?.image;

    const [alertInfo, setAlertInfo] = useState({
        message: '',
        visible: false,
        icon: null as React.ReactNode,
        title: ''
    });

    const fetchShop = async () => {
        if (!id) return;
        try {
            const response = await axiosClient.get<Shop>(`/product/shops/${id}/`);
            setShop(response.data);
            setOwner(response.data.owner_id);
            setProducts(response.data.products || []);
            setCategory(response.data.category_name);
            setLoading(false);
        } catch (err) {
            setError('Failed to load shop details');
            setLoading(false);
        }
    };

    const fetchFeaturedProducts = async () => {
        try {
            const response = await axiosClient.get('/product/featured-product/');
            setFeaturedProducts(response.data.results.slice(0, 3));
        } catch (error) {
            console.error('Error fetching featured products:', error);
        }
    };

    useEffect(() => {
        fetchShop();
        fetchFeaturedProducts();
    }, [id]);

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${merchantId}/`);
                setIsPremium(response.data.merchant_data.is_premium || false);
                setIsMerchant(response.data.is_merchant)
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsPremium(false);
            }
        };
        fetchApiData();
    }, [merchantId]);

    useEffect(() => {
        const fetchCmsLimit = async () => {
            if (!isMerchant) {
                setCanCreateProduct(false);
                setMaxProducts(0);
                setCurrentProductCount(0);
                return;
            }
            setLoading(true);
            try {
                const userProductsResponse = await axiosClient.get('/product/user-product/?page=1');
                const productCount = userProductsResponse.data.count ?? 0;
                setCurrentProductCount(productCount);

                const cmsResponse = await axiosClient.get<CmsProps>("/merchant/cms-merchant-limits/");
                if (!cmsResponse.data.result || !Array.isArray(cmsResponse.data.result)) {
                    throw new Error("Invalid CMS response: result is missing or not an array");
                }

                const cmsData = cmsResponse.data.result.find((item) => item.is_premium === isPremium);
                if (!cmsData) {
                    throw new Error(`No CMS data found for ${isPremium ? "premium" : "non-premium"} merchant`);
                }

                setMaxProducts(cmsData.max_products);
                const canCreate = productCount < cmsData.max_products;
                setCanCreateProduct(canCreate);
            } catch (error) {
                console.error("CMS limit error:", error);
                setMaxProducts(0);
                setCurrentProductCount(0);
                setCanCreateProduct(false);
            } finally {
                setLoading(false);
            }
        };

        fetchCmsLimit();
    }, [isMerchant, isPremium]);

    const statusUpdate = async () => {
        modals.openConfirmModal({
            title: "Verification Confirmation",
            children: (
                <div>
                    <p>Are you sure you want to verify this Shop?</p>
                </div>
            ),
            labels: {confirm: 'Yes, Verify', cancel: 'Cancel'},
            confirmProps: {color: 'orange'},
            onConfirm: async () => {
                try {
                    notifications.show({
                        title: "Loading...",
                        message: "please wait! while we verify your request.",
                        loading: true,
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
                    await axiosClient.post(`/shops/${id}/verify/`);
                    await fetchShop();
                } catch (error: any) {
                    let errorMessage = 'Unknown error occurred';
                    const errorArray = error.response?.data?.error;
                    if (Array.isArray(errorArray) && errorArray.length > 0) {
                        errorMessage = String(errorArray[0]);
                    }
                    notifications.show({
                        title: "Error",
                        message: `Failed to verify shop: ${errorMessage}`,
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'under_review':
                return 'Under Review';
            case 'verified':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Unknown';
        }
    };

    const handleEdit = () => {
        router.push({
            pathname: "/formShop",
            query: {id},
        });
    };

    const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const image = e.currentTarget;
        const {left, top, width, height} = image.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePosition({x, y});
    };

    const showAlert = (message: string, icon: React.ReactNode, title: string) => {
        setAlertInfo({
            message,
            visible: true,
            icon,
            title
        });
        setTimeout(() => {
            setAlertInfo(prev => ({...prev, visible: false}));
        }, 3000);
    };

    const handlePrevImage = () => {
        if (!shop?.images) return;
        setSelectedImage((prev) => (prev === 0 ? shop.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        if (!shop?.images) return;
        setSelectedImage((prev) => (prev === shop.images.length - 1 ? 0 : prev + 1));
    };

    const handleShareProduct = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showAlert(
                "Shop link has been copied to clipboard.\nReady to share!",
                <IconShare className="text-blue-500"/>,
                "Link Copied"
            );
        } catch (err) {
            showAlert(
                "Failed to copy link. Please try again.",
                <IconShare className="text-red-500"/>,
                "Share Failed"
            );
        }
    };

    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const pastDate = new Date(dateString);
        const diffInMs = now.getTime() - pastDate.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        } else if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        } else {
            return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
        }
    };

    if (loading) {
        return (
            <Layout currentTitle={"Shops"}>
                <div className="flex justify-center items-center h-screen">
                    <HomaaleLoader/>
                </div>
            </Layout>
        );
    }

    if (error || !shop) {
        return (
            <Layout currentTitle="Shop Details">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-red-500">{error || 'Shop not found'}</div>
                    <Link href="/shops" className="text-blue-500 hover:underline">Back to Shops</Link>
                </div>
            </Layout>
        );
    }

    const goToCategory = () => {
        if (!shop?.category || !shop?.category_name) {
            router.push('/shops');
            return;
        }
        router.push({
            pathname: '/shops',
            query: {
                category_name: shop.category_name,
                category_id: shop.category.toString(),
            },
        });
    };

    const handleCreateProduct = () => {
        if (!isMerchant) {
            notifications.show({
                title: "Merchant Access Required",
                message: "You must be a merchant to use this feature.",
                color: "red",
                styles: (theme) => ({
                    root: {
                        position: "fixed",
                        top: 60,
                        left: "50%",
                        transform: "translateX(-50%)",
                        maxWidth: isMobile ? "90%" : 500,
                        zIndex: 1000,
                        boxShadow: theme.shadows.md,
                        borderRadius: theme.radius.md,
                        textAlign: "center",
                    },
                }),
            });
            return;
        }

        if (!(shop?.status === "verified" && checkStatus("kyc"))) {
            notifications.show({
                title: "Action Restricted",
                message: "Only from verified shop product can be created.",
                color: "red",
                icon: <X />,
                autoClose: 3000,
                style: {
                    position: "fixed",
                    top: "60px",
                    right: "20px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
            });
            return;
        }

        if (canCreateProduct) {
            router.push({
                pathname: "/post/entity",
                query: {
                    type: "product",
                    category: shop.category,
                    shop_name: shop.id,
                },
            });
        } else {
            notifications.show({
                title: "Action Restricted",
                message: `You cannot create a new Product. You have reached the maximum Product limit (${maxProducts}). ${
                    !isPremium ? "Upgrade to a premium account to create more Products." : ""
                }`,
                color: "red",
                icon: <X />,
                style: {
                    position: "fixed",
                    top: "60px",
                    right: "20px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
            });
        }
    };

    return (
        <Layout
            breadCrumbsItems={[{name: "Shops", href: "/shops"}]}
            currentTitle={shop.name}
        >
            <div className="px-4 py-8">
                {/* Top Section: Location, Category, Status, Joined Date, Verify Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto">
                        <div>
                            <Tooltip withArrow label={shop.address || "No Address available"} position="top-start">
                                <div className="flex items-center cursor-pointer max-w-[300px]">
                                    <MapPin className="text-gray-600 mr-2 flex-shrink-0"/>
                                    <span className="truncate">{shop.address || "No Address available"}</span>
                                </div>
                            </Tooltip>
                        </div>

                            <Tooltip withArrow label="Category" position="top-start">
                                <div className="flex items-center">
                                    <BiCategory size={20} className="text-gray-600 mr-2" />
                                    <span className="cursor-pointer" onClick={goToCategory}>{shop.category_name}</span>
                                </div>
                            </Tooltip>
                        <div className="flex items-center">
                            <Tooltip withArrow label="Status" position="top-start">
                                <div className="flex items-center cursor-pointer">
                                    {isShopOwner ? (
                                        <>
                                            {shop.status === 'verified' ? (
                                                <>
                                                    <CheckCircle className="text-green-500 mr-2"/>
                                                    <span className="text-green-600">{getStatusLabel(shop.status)}</span>
                                                </>
                                            ) : shop.status === 'rejected' ? (
                                                <>
                                                    <XCircle className="text-red-500 mr-2"/>
                                                    <span className="text-red-600">{getStatusLabel(shop.status)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="text-gray-600 mr-2"/>
                                                    <span className="text-gray-600">{getStatusLabel(shop.status)}</span>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {shop.status === 'verified' ? (
                                                <>
                                                    <CheckCircle className="text-green-500 mr-2"/>
                                                    <span className="text-green-600">{getStatusLabel(shop.status)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="text-red-500 mr-2"/>
                                                    <span className="text-red-500">Not Verified</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Tooltip>
                        </div>
                            <Tooltip withArrow label="Joined Date" position="top-start">
                        <div className="flex items-center">
                            <CalendarDays className="text-gray-600 mr-2" />
                            <span>{getRelativeTime(shop.created_at)}</span>
                        </div>
                            </Tooltip>
                    </div>
                    {(shop.status === 'pending' || shop.status === 'rejected') && isLoggedIn() && isShopOwner && (
                        <Button
                            className="text-sm px-3 py-1"
                            sx={{fontWeight: 400}}
                            size="sm"
                            onClick={statusUpdate}
                        >
                            Verify Your Shop
                        </Button>
                    )}
                </div>

                {/* Image Slider, Shop Name, and About Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    {/* Image Slider */}
                    <div className="w-full">
                        <div
                            ref={imageContainerRef}
                            className="relative w-full aspect-[4/3] max-h-[300px] overflow-hidden rounded-lg"
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleImageMouseMove}
                        >
                            {shop.images[selectedImage]?.image.length > 0 ? (
                                <img
                                    src={shop.images[selectedImage]?.image}
                                    alt={shop.name}
                                    className={`w-full h-full object-cover transition-transform duration-200 ${
                                        isZoomed ? 'scale-150' : ''
                                    }`}
                                    style={
                                        isZoomed
                                            ? {transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`}
                                            : {}
                                    }
                                />
                            ) : (
                                <img
                                    src={'/images/placeholder/taskPlaceholder.png'}
                                    alt={shop.name}
                                    className={`w-full h-full object-contain transition-transform duration-200 ${
                                        isZoomed ? 'scale-150' : ''
                                    }`}
                                    style={
                                        isZoomed
                                            ? {transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`}
                                            : {}
                                    }
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
                        <div className="flex gap-2 mt-4 overflow-x-auto w-full">
                            {shop.images.map((img: any, index: any) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 ${
                                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                                    }`}
                                >
                                    <img
                                        src={img.image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {alertInfo.visible && (
                        <Alert className="fixed bottom-20 right-4 z-50 max-w-md animate-slide-up">
                            <div className="flex items-center gap-2">
                                {alertInfo.icon}
                                <div>
                                    <h4 className="font-semibold">{alertInfo.title}</h4>
                                    <p className="text-sm whitespace-pre-line">{alertInfo.message}</p>
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Shop Name and About Section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <h1 className="text-3xl font-bold">{shop.name}</h1>
                                {shop.status === "verified" && (
                                    <Image
                                        src="/CardImages/Vector.svg"
                                        alt="verified-tick"
                                        height={20}
                                        width={20}
                                        className="ml-3"
                                    />
                                )}
                            </div>
                            <div className="flex gap-2">
                                <ShareButton
                                    showText
                                    className={classes.share}
                                    url={typeof window !== "undefined" ? window.location.origin + `/shops/${shop.id}` : ""}
                                />
                                {!permission && isLoggedIn() && (
                                    <Ellipsis
                                        size={16}
                                        type="product"
                                        id={shopId}
                                        reportHeading={shopName ? `Report ${shopName}` : "Shop"}
                                        reportSubHeading="Please provide details about the issue with this Shop."
                                        reportedUserId={shopId}
                                        reportedUserName={shopName || "Shop"}
                                        reportedUserImage={shopImage || ""}
                                    />
                                )}
                                {isShopOwner && shop && (
                                    <button
                                        onClick={handleEdit}
                                        className="p-1 rounded-full hover:bg-gray-100"
                                    >
                                        <Edit className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg bg-gray-50 overflow-y-auto"
                            style={{
                                maxHeight: imageContainerRef.current?.offsetHeight
                                    ? `${imageContainerRef.current.offsetHeight}px`
                                    : 'auto',
                                scrollbarWidth: 'thin',
                                scrollbarColor: dark ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6',
                            }}
                        >
                            <h2 className="text-2xl font-semibold mb-4">About</h2>
                            <div
                                className={classes.description}
                                style={{color: dark ? "white" : "black"}}
                                dangerouslySetInnerHTML={{
                                    __html: shop.about || "There is no description of shop."
                                }}
                            />
                        </div>
                        {isShopOwner && (
                            <Button
                                sx={{fontWeight: 400, fontSize: '0.75rem', padding: '2px 8px', minHeight: '28px'}}
                                className="py-0 px-2 w-fit"
                                size="xs"
                                onClick={handleCreateProduct}
                            >
                                Add New Product
                            </Button>
                        )}
                    </div>
                </div>

                {/* All Products */}
                <div className="mt-8 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">All Products</h2>
                    <div
                        className="shadow rounded-lg p-4 sm:p-6"
                        style={{color: dark ? "white" : "black"}}
                    >
                        {products?.length > 0 ? (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
                                {products.map((product) => (
                                    <div key={product.id} className="flex justify-center">
                                        <ProductCard
                                             products={product}
                                            myProduct={isShopOwner}
                                            pinnedId={product.pinned_id}
                                            isShopDetailPage={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p
                                className="text-center text-base sm:text-lg"
                                style={{color: dark ? "white" : "black"}}
                            >
                                No products available
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ShopDetailPage;
