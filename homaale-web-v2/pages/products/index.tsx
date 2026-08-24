import React, {useState, useEffect, forwardRef} from 'react';
import {
    AspectRatio,
    Flex,
    Pagination,
    SelectItemProps,
    Button,
    Tabs,
    ActionIcon,
    Box,
    useMantineTheme, Alert
} from "@mantine/core";
import type {NextPage} from "next";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import Layout from "@/components/Layout/Layout";
import {useGetAds} from "@/hooks/useGetAds";
import type {EntityServiceLisitngProps} from "@/types/EntityServiceLisitngProps";
import {axiosClient} from "@/utils/axiosClient";
import {isLoggedIn} from "@/utils/helpers";
import {useUser} from "@/hooks/useUser";
// import { HeartIcon, HeartCrack } from 'lucide-react';
import {useDark} from "@/utils/helpers";
// import { notifications } from "@mantine/notifications";
import {useFilterStyles} from "@/styles/components/FilterStyles";
import {useUserStatus} from "@/hooks/useUserStatus";
import ProductTabs from "@/components/common/ProductTabs";
import ViewToggleButton from '@/components/ViewToggle';
import ProductFilter from '@/components/ProductCard/ProductFilter';
import CategorySidebar from "@/components/CategorySidebar/CategorySidebar";
import {useProfile} from "@/hooks/useProfile";
import {ShopCardProps} from "@/pages/shops";
import {notifications} from "@mantine/notifications";
import {useSelector} from "react-redux";
import {RootState} from "@/store";
import { useMediaQuery } from '@mantine/hooks';
import Breadcrumb from '@/components/common/BreadCrumb';
import HomaaleLoader from '@/components/common/HomaaleLoader';
import {IoMdInformationCircleOutline} from "react-icons/io";

const deduplicateProducts = (products: any[]): Product[] => {
    const seenIds = new Set<string>();
    const transformedProducts: Product[] = [];

    for (const item of products) {
        const productId = item.product.id;
        if (!seenIds.has(productId)) {
            seenIds.add(productId);
            transformedProducts.push({
                id: productId,
                name: item.product.name,
                rating: 0, // Default rating
                price: item.product.price.original_price,
                image_details:[{
                    id:item.image_details.id,
                    image:item.image_details.image
                }],
                images: item.product.images || [],
                is_pinned: item.product.is_pinned,
                pinned_id: item.product.pinned_id,
                product_status: true, // Based on APPROVED status
                discount_per: parseFloat(item.product.price.discount_percentage) || 0,
                local_currency_details: {
                    symbol: '$', // Default currency
                    code: 'USD', // Default currency code
                },
                shop: {
                    name: item.shop?.name || 'Unknown Shop',
                    location: item.shop?.location || 'Unknown Location',
                },
                user: {
                    id: 'unknown', // Default user
                    username: 'unknown',
                },
            });
        }
    }

    return transformedProducts;
};

interface Product {
    id: number;
    name: string;
    rating: number;
    price: number;
    image_details:{
        id:number,
        image:string
    }[]
    images: string[];
    product_status: boolean;
    discount_per: number;
    local_currency_details: {
        symbol: string
        code: string;

    };
    is_pinned?: boolean;
    pinned_id?:string
    merchant_premium?:boolean;
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

interface Category {
    id: number;
    name: string;
}

export interface CmsProps {
    total_pages: number;
    count: number;
    current: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    result: Array<{
        id: number;
        is_premium: boolean;
        max_shops: number;
        max_products: number;
        created_at: string;
        updated_at: string;
    }>;
}


// Constants
const MY_LIST = 2;
const PRODUCT_ID = 4;
const PRODUCTS_PER_PAGE = 13;

const Products: NextPage<{ servicesData: EntityServiceLisitngProps }> = ({servicesData}) => {
    const filterState = useSelector((state: RootState) => state.filterReducer);
    const router = useRouter();
    const [activeId, setActiveId] = useState(PRODUCT_ID);
    const [isGrid, setIsGrid] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [userProducts, setUserProducts] = useState<Product[]>([]);
    const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
    const [inactiveProducts, setInactiveProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const {classes} = useFilterStyles();
    const theme = useMantineTheme();

    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    const [showUserProducts, setShowUserProducts] = useState(false);
    const [showInactiveProducts, setShowInactiveProducts] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [pinnedProducts, setPinnedProducts] = useState<Product[]>([]);
    const [showPin, setShowPin] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [minRating, setMinRating] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [purchased, setPurchased] = useState("purchased")
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [hasDeletedProducts, setHasDeletedProducts] = useState<boolean>(false);
    const [hasPurchasedProducts, setHasPurchasedProducts] = useState<boolean>(false);
    const [merchantData , setMerchantData] = useState(undefined);

    const {data: ads} = useGetAds("/services?is_requested=null");
    const dark = useDark();
    const {data: error} = useUser();
    const {checkStatus} = useUserStatus();
    const {query} = useRouter();
    const categoryId = router.query.category_id;
    const childCategoryId = router.query.subCategoryId;
    const childCategoryName = router.query.subCategoryName;

    const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
    const [soldProducts, setSoldProducts] = useState<Product[]>([]);
    const [hasSoldProducts, setHasSoldProducts] = useState<boolean>(false);
    const user = useProfile();
    const merchantId = user?.data && user?.data.user?.id;
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [canCreateProduct, setCanCreateProduct] = useState<boolean>(false);
    const [maxProducts, setMaxProducts] = useState<number>(0);
    const [currentProductCount, setCurrentProductCount] = useState<number>(0);
    const [showAlert, setShowAlert] = useState<boolean>(true);
     const isMobile = useMediaQuery('(max-width: 768px)');
     const [isMerchant, setIsMerchant]=useState<boolean>(false)
    /*console.log("merchant id ",merchantId)*/
    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${merchantId}/`);
                // setProfile(response.data);
                setIsPremium(response.data.merchant_data.is_premium || false); // Set premium status
                setIsMerchant(response.data.is_merchant)
               /* console.log("ismerchant",response.data.is_merchant)*/
                // console.log("merchant data",response.data.merchant_data.is_premium)
            } catch (error) {
                // console.error("Error fetching data:", error);
                setIsPremium(false); // Default to false on error
            }
        };
        fetchApiData();
    }, [merchantId]);

    useEffect(() => {
        setIsGrid(true);
    }, [activeTab]);

    const verifyMerchant = isMerchant
    console.log("can create product",canCreateProduct)
 useEffect(()=>{
    console.log("is_merchant", isMerchant)

 },[isMerchant])
    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${merchantId}/`);
                setMerchantData(response.data.merchant_data.id);
                setIsPremium(response.data.merchant_data.is_premium);
            } catch (error) {
                // console.error("Error fetching merchant data:", error);
                setIsPremium(false);
            }
        };
        if (merchantId) fetchApiData();
    }, [merchantId]);

    // console.log("my products",maxProducts)
    // console.log("verified merchant product",verifyMerchant)
    useEffect(() => {
        const fetchCmsLimit = async () => {
            if (!isMerchant) {
                setCanCreateProduct(false);
                setMaxProducts(0);
                setCurrentProductCount(0);
                return;
            }

            // if (!verifyMerchant) {
            //     // notifications.show({
            //     //     title: "You need to be merchant to use this feature",
            //     //     message: `need to be merchant to use this feature`,
            //     //     color: "orange",
            //     // });
            //     setCanCreateProduct(false);
            //     setMaxProducts(0);
            //     setCurrentProductCount(0);
            //     return;
            // }
            setLoading(true);
            try {
                // Fetch user products to get count
                const userProductsResponse = await axiosClient.get('/product/user-product/?page=1');
                const productCount = userProductsResponse.data.count ?? 0;
                setCurrentProductCount(productCount);

                console.log("product count",productCount)
                // Fetch CMS limits
                const cmsResponse = await axiosClient.get<CmsProps>("/merchant/cms-merchant-limits/");
                if (!cmsResponse.data.result || !Array.isArray(cmsResponse.data.result)) {
                    throw new Error("Invalid CMS response: result is missing or not an array");
                }

                // Select CMS data based on is_premium
                const cmsData = cmsResponse.data.result.find((item) => item.is_premium === isPremium);
                if (!cmsData) {
                    throw new Error(`No CMS data found for ${isPremium ? "premium" : "non-premium"} merchant`);
                }

                setMaxProducts(cmsData.max_products);
                // console.log("max products ",cmsData.max_products)

                // Determine if user can create more products
                const canCreate = productCount < cmsData.max_products;
                setCanCreateProduct(canCreate);

                // Show notification based on remaining product limit
                const remainingProducts = cmsData.max_products - productCount;
                // if (!canCreate) {
                //     notifications.show({
                //         title: "Product Creation Limit Reached",
                //         message: `You have reached the maximum product limit (${cmsData.max_products}). ${
                //             isPremium ? "Contact support at Hommale Team." : "Upgrade to premium to create more products."
                //         }`,
                //         color: "orange",
                //     });
                // } else {
                //     notifications.show({
                //         title: "Product Creation Available",
                //         message: `You can create ${remainingProducts} more product${remainingProducts === 1 ? "" : "s"} as a ${
                //             isPremium ? "premium" : "free"
                //         } user.`,
                //         color: "green",
                //     });
                // }
            } catch (error) {
                console.error("CMS limit error:", error);
                setMaxProducts(0);
                setCurrentProductCount(0);
                setCanCreateProduct(false);
                // notifications.show({
                //     title: "Error",
                //     message: "Failed to fetch product limits. Contact support at Hommale Team.",
                //     color: "red",
                //     style: {
                //         position: 'fixed',
                //         top: '60px',
                //         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                //     },
                // });
            } finally {
                setLoading(false);
            }
        };

        fetchCmsLimit();
    }, [isMerchant, isPremium]);

    useEffect(() => {
        const checkDeletedProducts = async () => {
            try {
                const response = await axiosClient.get('/product/search/?is_deleted=True&my_products=True&page=1');
                const count = response.data.count || 0;
                setHasDeletedProducts(count > 0);
            } catch (error) {
                console.error("Error checking deleted products:", error);
                setHasDeletedProducts(false);
            }
        };

        const checkPurchasedProducts = async () => {
            try {
                const response = await axiosClient.get('/product/paid-product/');
                const rawProducts = response.data.data || response.data.results || response.data;
                const count = Array.isArray(rawProducts) ? rawProducts.length : 0;
                setHasPurchasedProducts(count > 0);
            } catch (error) {
                console.error("Error checking purchased products:", error);
                setHasPurchasedProducts(false);
            }
        };
        const checkSoldProducts = async () => {
            try {
                const response = await axiosClient.get('/merchant/product/sold-product?status=PAID');
                const count = response.data.total_count || 0;
                setHasSoldProducts(count > 0);
                console.log("Sold products count:", count, "Response:", response.data); // Debug log
            } catch (error) {
                console.error("Error checking sold products:", error);
                setHasSoldProducts(false);
            }
        };
        if (isLoggedIn()) {
            checkDeletedProducts();
            checkPurchasedProducts();
            checkSoldProducts();
        }
    }, []);


    const fetchProducts = async (endpoint: string, setter: (products: Product[]) => void, extraParams = '') => {
        try {
            setLoading(true);

            let finalEndpoint = endpoint;

            // Add extra parameters (like my_products=true) if provided
            if (extraParams) {
                finalEndpoint += `${finalEndpoint.includes('?') ? '&' : '?'}${extraParams}`;
            }

            // Add pagination
            finalEndpoint += `${finalEndpoint.includes('?') ? '&' : '?'}page=${page}`;

            // Use filterSlice's search (e.g., &name=heater) if available, else fallback to searchTerm
            if (filterState.search) {
                finalEndpoint += filterState.search;
            } else if (searchTerm) {
                finalEndpoint += `&name=${encodeURIComponent(searchTerm)}`; // Fallback to searchTerm
            }
            if (minPrice !== null) finalEndpoint += `&min_price=${minPrice}`;
            if (maxPrice !== null) finalEndpoint += `&max_price=${maxPrice}`;
            if (minRating !== null && minRating !== '0') finalEndpoint += `&min_rating=${minRating}`;
            if (categoryId) finalEndpoint += `&category=${categoryId}`;
            if (childCategoryId) finalEndpoint += `&subCategoryId=${childCategoryId}`;
            if (sortOrder === "price_asc") finalEndpoint += `&ordering=price`;
            else if (sortOrder === "price_desc") finalEndpoint += `&ordering=-price`;
            else if (sortOrder === "rating_desc") finalEndpoint += `&ordering=-rating`;
            else if (sortOrder === "rating_asc") finalEndpoint += `&ordering=rating`;

            // console.log("Fetching from:", finalEndpoint);
            const response = await axiosClient.get(finalEndpoint);

            setter(response.data.results || []);
            setTotalItems(response.data.count || 0);
        } catch (error) {
            console.error("Error fetching products:", error);
            // showErrorNotification("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPinnedProducts = async () => {
        try {
            const response = await axiosClient.get("/product/pinned-items/", {
                params: {
                    active: true,
                    pinned_type: "Product",
                },
            });
            const pinnedItems = response.data.result;
            // console.log("product items:", response.data.res ult);
            const productDetailsPromises = pinnedItems.map((item: any) =>
                axiosClient.get(`/product/${item.product}/`)
            );
            const shopDetailsResponses = await Promise.all(productDetailsPromises);
            const transformedPinnedProducts: Product[] = shopDetailsResponses.map((res: any) => {
                const product = res.data;
                return {
                    id: product.id,
                    name: product.name,
                    rating: product.rating || 0, // Default rating if not provided
                    price: product.price?.original_price || 0, // Default price
                    image_details:[{
                        id:product.image_details.id,
                        image:product.image_details.image
                    }],
                    images: product.images || [], // Use images array or empty array
                    product_status: true, // Default to active
                    discount_per: parseFloat(product.price?.discount_percentage) || 0, // Default discount
                    local_currency_details: {
                        symbol: product.local_currency_details?.symbol || "$",// Default currency
                        code:product.local_currency_details?.code||"USD"
                    },
                    is_pinned: true,
                    pinned_id: product.pinned_id,
                    shop: {
                        name: product.shop?.name || "Unknown Shop",
                        location: product.shop?.location || "Unknown Location",
                    },
                    user: {
                        id: product.user?.id || "unknown",
                        username: product.user?.username || "unknown",
                    },
                };
            });
            setPinnedProducts(transformedPinnedProducts);
            setShowPin(true);
        } catch (error) {
            console.error("Error fetching pinned shops:", error);
            setPinnedProducts([]);
            setShowPin(false);
            notifications.show({
                title: "Error",
                message: "Failed to fetch pinned shops.",
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };

    const togglePinnedProducts = () => {
        // console.log("Toggling showPin, current value:", showPin, "activeTab:", activeTab);
        if (showPin) {
            setShowPin(false);
            if (activeTab === "Products") {
                // console.log("Fetching all products");
                fetchAllProducts();
            } else if (activeTab === "My Products" && isLoggedIn()) {
                // console.log("Fetching user products");
                fetchUserProducts();
            }
        } else {
            // console.log("Fetching pinned products");
            fetchPinnedProducts();
        }
    };
    // Fetch helpers
    const fetchAllProducts = () => fetchProducts('/product/search/', setProducts);
    const fetchUserProducts = () => {
        if (hasFilters()) {
            fetchProducts('/product/search/', setUserProducts, 'my_products=True'); // Use search endpoint with my_products=true when filtering
        } else {
            fetchProducts('/product/user-product/', setUserProducts); // Default to user-product endpoint when no filters
        }
    };
    const fetchInactiveProducts = () => fetchProducts('/product/search/?is_active=False', setInactiveProducts);
    const fetchDeletedProducts = async () => {
        try {
            setLoading(true);
            const finalEndpoint = `/product/search/?is_deleted=True&my_products=True&page=${page}`;

            // console.log("Fetching Deleted Products from:", finalEndpoint);
            const response = await axiosClient.get(finalEndpoint);
            // console.log("Deleted Products API Response:", response.data);

            // Ensure results is an array
            let rawProducts = response.data.results || response.data.data || response.data;
            if (!Array.isArray(rawProducts)) {
                console.warn("Deleted Products: rawProducts is not an array, defaulting to empty array");
                rawProducts = [];
            }
            const transformedProducts: Product[] = rawProducts.map((item: any) => ({
                id: item.id,
                name: item.name,
                rating: item.rating || 0,
                price: item.price,
                images: item.images || [],
                product_status: item.product_status, // Deleted products are inactive
                discount_per: item.discount_per || 0,
                local_currency_details: {
                    symbol: item.local_currency_details?.symbol || '$',
                },
                shop: {
                    name: item.shop?.name || 'Unknown Shop',
                    location: item.shop?.location || 'Unknown Location',
                },
                user: {
                    id: item.user?.id || 'unknown',
                    username: item.user?.username || 'unknown',
                },
            }));

            // console.log("Transformed Deleted Products:", transformedProducts);

            setDeletedProducts(transformedProducts);
            setTotalItems(response.data.count || transformedProducts.length);
        } catch (error) {
            console.error("Error fetching deleted products:", error);
            // showErrorNotification("Failed to load deleted products. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const fetchPurchasedProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/product/paid-product/');
            // console.log("Purchased Products API Response:", response.data);

            let rawProducts = response.data.data || response.data.results || response.data;
            if (!Array.isArray(rawProducts)) {
                console.warn("Purchased Products: rawProducts is not an array, defaulting to empty array");
                rawProducts = [];
            }

            const transformedProducts: Product[] = rawProducts.map((item: any, index: number) => ({
                id: `${item.product.id}`,
                name: item.product.name,
                rating: 0,
                price: item.product.price.original_price,
                images: item.product.images || [],
                product_status: "Purchased",
                discount_per: parseFloat(item.product.price.discount_percentage) || 0,
                local_currency_details: {
                    symbol: 'रु',
                },
                shop: {
                    name: item.shop?.name || 'Unknown Shop',
                    location: item.shop?.location || 'Unknown Location',
                },
                user: {
                    id: 'unknown',
                    username: 'unknown',
                },
                isPurchased: true, // For fallback button logic
                purchase_details: {
                    total_price: item.purchase_details.total_price || 0,
                    purchase_date: item.purchase_details.purchase_date || '',
                    status: item.purchase_details.status || 'UNKNOWN',
                },
            }));

            // Log transformed products to check for duplicates
            // console.log("Transformed Purchased Products:", transformedProducts);

            setPurchasedProducts(transformedProducts);
            setTotalItems(response.data.count || transformedProducts.length);
        } catch (error) {
            console.error("Error fetching purchased products:", error);
            // showErrorNotification("Failed to load purchased products. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const hasFilters = () => {
        return !!searchTerm || minPrice !== null || maxPrice !== null || minRating !== null || categoryId !== null || sortOrder !== null;
    };
    const fetchSoldProducts = async () => {
        try {
            setLoading(true);
            let finalEndpoint = `/merchant/product/sold-product?page=${page}&status=PAID`;

            if (filterState.search) {
                finalEndpoint += filterState.search;
            } else if (searchTerm) {
                finalEndpoint += `&name=${encodeURIComponent(searchTerm)}`;
            }
            if (minPrice !== null) finalEndpoint += `&min_price=${minPrice}`;
            if (maxPrice !== null) finalEndpoint += `&max_price=${maxPrice}`;
            if (minRating !== null && minRating !== '0') finalEndpoint += `&min_rating=${minRating}`;
            if (categoryId) finalEndpoint += `&category=${categoryId}`;
            if (childCategoryId) finalEndpoint += `&subCategoryId=${childCategoryId}`;
            if (sortOrder === "price_asc") finalEndpoint += `&ordering=price`;
            else if (sortOrder === "price_desc") finalEndpoint += `&ordering=-price`;
            else if (sortOrder === "rating_desc") finalEndpoint += `&ordering=-rating`;
            else if (sortOrder === "rating_asc") finalEndpoint += `&ordering=rating`;

            console.log("Fetching sold products from:", finalEndpoint);

            const response = await axiosClient.get(finalEndpoint);
            console.log("Sold products response:", response.data);

            let rawProducts = response.data.data || response.data.results || response.data;
            if (!Array.isArray(rawProducts)) {
                console.warn("Sold Products: rawProducts is not an array, defaulting to empty array");
                rawProducts = [];
            }

            const transformedProducts: Product[] = rawProducts.map((item: any) => {
                const product = item.cart_item?.product || {};
                return {
                    id: product.id || `sold-${Math.random()}`,
                    name: product.name || "Unknown Product",
                    rating: product.rating || 0,
                    price: parseFloat(product.price) || product.selling_price || 0,
                    images: product.images || [],
                    product_status: product.product_status || false,
                    discount_per: parseFloat(product.discount_per) || 0,
                    local_currency_details: {
                        symbol: product.local_currency_details?.symbol || '$',
                    },
                    shop: {
                        name: product.shop_name || item.shop?.name || 'Unknown Shop',
                        location: item.shop?.location || 'Unknown Location',
                    },
                    user: {
                        id: item.Seller?.id || 'unknown',
                        username: item.Seller?.username || 'unknown',
                    },
                };
            });

            setSoldProducts(transformedProducts);
            setTotalItems(response.data.total_count || transformedProducts.length);
            console.log("Transformed sold products:", transformedProducts);
        } catch (error) {
            console.error("Error fetching sold products:", error);
            notifications.show({
                title: "Error",
                message: "Failed to load sold products. Please try again.",
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        } finally {
            setLoading(false);
        }
    };
    // Fetch on tab change or filter update
    useEffect(() => {
        if (activeId === PRODUCT_ID) {
            fetchAllProducts();
        } else if (activeId === MY_LIST) {
            if (activeTab === "deleted") {

                fetchDeletedProducts();
            } else if (activeTab === "purchased_products") {
                fetchPurchasedProducts();
            } else if (activeTab === "sold") {
                fetchSoldProducts();
            } else if (showInactiveProducts) {
                fetchInactiveProducts();
            } else {
                fetchUserProducts();
            }
        }
    }, [
        activeId,
        activeTab,
        showInactiveProducts,
        page,
        searchTerm,
        minPrice,
        maxPrice,
        minRating,
        categoryId,
        childCategoryId,
        sortOrder,
    ]);


    const clearAllFilters = () => {
        setSearchTerm("");
        setMinPrice(null);
        setMaxPrice(null);
        setMinRating(null);
        // setCategoryId(null);
        setCategoryName(null);
        setSortOrder(null);
        setPage(1);
    };
    const handleCategoryClick = () => {
        setDrawerOpen(true)
    }

    const CustomSelectItem = forwardRef<HTMLDivElement, SelectItemProps & { icon?: JSX.Element }>(
        ({label, icon, ...others}, ref) => (
            <div ref={ref} {...others} style={{display: "flex", alignItems: "center"}}>
                {icon}
                <span>{label}</span>
            </div>
        )
    );
    CustomSelectItem.displayName = "CustomSelectItem";

    // if (error) return <div><layout></layout></div>;

    const toggleDrawer = (open: boolean) => {
        // Return a function that takes an event for onClick
        return (event?: React.KeyboardEvent | React.MouseEvent) => {
            if (
                event &&
                event.type === 'keydown' &&
                ((event as React.KeyboardEvent).key === 'Tab' ||
                    (event as React.KeyboardEvent).key === 'Shift')
            ) {
                return;
            }
            setDrawerOpen(open);
        };
    };

    const drawerContent = (

        <Box
            sx={{
                width: isMobile?"300px":400, height: '100%', backgroundColor: dark ? theme.colors.dark[7]
                    : theme.colors.homaaleSlate[0],
            }}
        >
            <Box sx={{
                p: 2,
                borderBottom: '1px solid #ddd',
                // display: "end",
                justifyContent: 'space-between',
                alignItems: '',

                backgroundColor: dark ? theme.colors.dark[7]
                    : theme.colors.homaaleSlate[0],
                position: "relative",
            }}>
                {/* <Flex>
                    <h2 style={{
                        visibility: "hidden"
                    }}>CATEGORY SIDEBAR</h2>

                    <Button style={{position: "relative", right: "10px"}} variant="subtle"
                            onClick={toggleDrawer(false)}>
                        X
                    </Button>
                </Flex> */}
            </Box>
            <CategorySidebar closeDrawer={toggleDrawer(false)} />
        </Box>
    );
    const remainingProducts = maxProducts - currentProductCount;

    const handleCreateProduct = () => {

        if (!verifyMerchant) {
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

        if (canCreateProduct) {
            router.push({
                pathname: "/post/entity",
                query: {type: "product"},
            });
        }else {
            notifications.show({
                title: "Action Restricted",
                message: `You cannot create a new Product. You have reached the maximum Product limit (${maxProducts}). ${
                    !isPremium ? "Upgrade to a premium account to create more Products." : ""
                }`,
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };

    return (
        <Layout currentTitle={"Products"}hideBreadCrumbs={true} breadCrumbsItems={[{name:"Task & Bookings",href:""}]}>
            {/*<div className="mb-4 ml-1 grid grid-cols-2 items-center">*/}
            {!isLoggedIn() && (<h3 className="font-medium mb-4">Products</h3>)}
            {/*</div>*/}

            {isLoggedIn() && (
                <Tabs
                    defaultValue="products"
                    className="mt-9 mb-5"
                    styles={{
                        tab: {
                            padding: '8px 16px',
                            fontSize: '14px',
                            '@media (max-width: 768px)': {
                                width: '100%',
                                justifyContent: 'flex-start',
                            },
                            '&[data-active]': {color: theme.colors.brand[4]},
                        },
                        tabsList: {
                            flexWrap: 'wrap',
                            gap: '8px',
                            '@media (max-width: 768px)': {
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                            },
                        },
                        // tab: {
                        //     padding: '8px 16px',
                        //     fontSize: '14px',
                        //     '@media (max-width: 768px)': {
                        //         width: '100%',
                        //         justifyContent: 'flex-start',
                        //     },
                        // },
                    }}
                >

                    <Tabs.List>
                        <Tabs.Tab
                            value="products"
                            onClick={() => {
                                setActiveId(PRODUCT_ID);
                                setShowUserProducts(false);
                                setActiveTab(null);
                                setShowInactiveProducts(false);
                                clearAllFilters();
                                fetchAllProducts();
                                router.push("/products/");
                            }}
                        >
                            Products
                        </Tabs.Tab>

                        {isLoggedIn() && (
                            <Tabs.Tab
                                value="My Products"
                                onClick={() => {
                                    setActiveId(MY_LIST);
                                    setShowUserProducts(true);
                                    setActiveTab("my_products");
                                    setShowInactiveProducts(false);
                                    clearAllFilters();
                                    fetchUserProducts();
                                }}
                            >
                                My Products
                            </Tabs.Tab>
                        )}
                        {isPremium && hasDeletedProducts && (
                            <Tabs.Tab
                                value="Deleted Products"
                                onClick={() => {
                                    setActiveId(MY_LIST);
                                    setShowUserProducts(true);
                                    setActiveTab("deleted");
                                    setShowInactiveProducts(false);
                                    clearAllFilters();
                                    fetchDeletedProducts();
                                }}
                            >
                                Deleted Products
                            </Tabs.Tab>
                        )}
                        {hasPurchasedProducts && (
                        <Tabs.Tab
                            value="Purchased Products"
                            onClick={() => {
                                setActiveId(MY_LIST);
                                setShowUserProducts(true);
                                setActiveTab("purchased_products");
                                setShowInactiveProducts(false);
                                clearAllFilters();
                                fetchPurchasedProducts();
                            }}
                        >
                            Purchased Products
                        </Tabs.Tab>
                        )}
                        {hasSoldProducts && (
                            <Tabs.Tab
                                value="Sold Products"
                                onClick={() => {
                                    setActiveId(MY_LIST);
                                    setShowUserProducts(true);
                                    setActiveTab("sold");
                                    setShowInactiveProducts(false);
                                    clearAllFilters();
                                    fetchSoldProducts();
                                }}
                            >
                                Sold Products
                            </Tabs.Tab>
                        )}
                        {/*{isLoggedIn() && (*/}
                        {/*    <Button onClick={togglePinnedProducts} size="sm" variant="outline">*/}
                        {/*        {showPin ? "Hide Pinned Products" : "Show Pinned Products"}*/}
                        {/*    </Button>*/}
                        {/*)}*/}
                        {isLoggedIn() &&(
                            <div className="mt-2 md:mt-0 md:ml-auto">
                                <Button
                                    sx={{fontWeight: 400}}
                                    className="text-sm px-5 py-2 mb-0.5"
                                    size="sm"
                                    onClick={handleCreateProduct}
                                >
                                    Add Product
                                </Button>
                            </div>
                        )}
                    </Tabs.List>
                </Tabs>
            )}
            <div style={{padding:"10px"}}>

            <Breadcrumb currentTitle={'Products'} items={[{name:"Tasks & Bookings",href:""}]}/>
                {isLoggedIn() && verifyMerchant && maxProducts > 0 && showAlert && activeTab === 'my_products' && (
                    <Alert
                        color={remainingProducts > 0 ? "green" : "orange"}
                        sx={{
                            display : 'flex',
                            width: isMobile ? "100%" : "auto",
                            textAlign: "left",
                            zIndex: 10,
                            flexShrink: 0,
                            backgroundColor: 'transparent',
                            marginTop : 8,
                            padding: 0,
                        }}
                        // withCloseButton
                        // onClose={() => setShowAlert(false)}
                    >
                        <Flex align="center" gap="xs" styles={{marginRight: '1rem'}}>
                            <IoMdInformationCircleOutline
                                style={{
                                    fontSize: '1rem',
                                    color: remainingProducts > 0 ? theme.colors.green[6] : theme.colors.orange[6],
                                }}
                            />
                            <span
                                style={{
                                    color: remainingProducts > 0 ? theme.colors.green[6] : theme.colors.orange[6],
                                }}
                            >
                              {remainingProducts > 0
                                  ? `Note : You can create ${remainingProducts} more product${remainingProducts === 1 ? "" : "s"} as a ${isPremium ? "premium" : "Basic"} user.`
                                  : `Note : You have reached the maximum product limit of ${maxProducts}. ${isPremium ? "Contact support at Hommale Team." : "Upgrade to premium to create more products."}`}
                            </span>
                        </Flex>
                    </Alert>
                )}
            </div>


            <Flex
                justify={"flex-start"}
                align={"center"}
                wrap={"nowrap"}
                gap={"sm"}
                w={"100%"}
                className={classes.root}
            >
                <ProductFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    categoryId={categoryId}
                    // setCategoryId={setCategoryId}
                    categories={categories}
                    categoryName={categoryName}
                    setCategoryName={setCategoryName}
                    childCategoryId={childCategoryId}
                    childCategoryName={childCategoryName}
                    handleCategoryClick={handleCategoryClick}
                    drawerContent={drawerContent}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}

                />
                {/*{console.log("activeTab:", activeTab)}*/}
                {(activeTab === "my_products" || activeTab === "deleted" || activeTab === "purchased_products" || activeTab === "sold") && (
                    <ViewToggleButton
                        isGrid={isGrid}
                        setIsGrid={setIsGrid}
                        dark={dark}/>
                )}
                {/*<Button*/}
                {/*    onClick={clearAllFilters}*/}
                {/*    variant="outline"*/}
                {/*    size="sm"*/}
                {/*>*/}
                {/*    Clear Filters*/}
                {/*</Button>*/}
            </Flex>

            {ads?.result?.filter(val => val.is_active && val.priority === 1 && val.web_shape === "lg_thin")
                .map(item => (
                    <section className="mx-4 md:mx-0 my-4 md:my-6" key={item.id}>
                        <AspectRatio ratio={16 / 1.25} mx="auto" className="max-w-full">
                            <Link href={item.redirect_url} target="_blank">
                                <Image
                                    src={item.image}
                                    style={{objectFit: "contain"}}
                                    fill
                                    alt="ad-image"
                                    priority
                                />
                            </Link>
                        </AspectRatio>
                    </section>
                ))}
            {/*{isLoggedIn() && verifyMerchant && maxProducts > 0 && showAlert && activeTab === 'my_products' && (*/}
            {/*    <Alert*/}
            {/*        title={*/}
            {/*            remainingProducts > 0*/}
            {/*                ? `You can create ${remainingProducts} more product${remainingProducts === 1 ? "" : "s"} as a ${isPremium ? "premium" : "Basic"} user.`*/}
            {/*                : `You have reached the maximum product limit of ${maxProducts}. ${isPremium ? "Contact support at Hommale Team." : "Upgrade to premium to create more products."}`*/}
            {/*        }*/}
            {/*        color={remainingProducts > 0 ? "green" : "orange"}*/}
            {/*        sx={{*/}
            {/*            width: isMobile ? "90%" : "80%", // Adjust width for responsiveness*/}
            {/*            maxWidth: 500, // Keep maxWidth to prevent it from becoming too wide*/}
            {/*            margin: "5px 0 0 0", // Remove auto margin for centering, align to start*/}
            {/*            textAlign: "left", // Align text to the left*/}
            {/*            boxShadow: theme.shadows.md,*/}
            {/*            borderRadius: theme.radius.md,*/}
            {/*            zIndex: 10, // Ensure it stays above other content*/}
            {/*        }}*/}
            {/*        withCloseButton*/}
            {/*        onClose={() => setShowAlert(false)}*/}
            {/*    >*/}
            {/*        {""}*/}
            {/*    </Alert>*/}
            {/*)}*/}
            <ProductTabs
                activeId={activeId}
                setActiveId={setActiveId}
                showUserProducts={showUserProducts}
                setShowUserProducts={setShowUserProducts}
                isGrid={isGrid}
                products={showPin ? pinnedProducts : products}
                userProducts={userProducts}
                // setUserProducts={setUserProducts}
                loading={loading}
                setLoading={setLoading}
                dark={dark}
                productsPerPage={PRODUCTS_PER_PAGE}
                deletedProducts={deletedProducts}
                // setDeletedProducts={setDeletedProducts}
                // setProducts={setProducts}
                fetchAllProducts={fetchAllProducts}
                setActiveTab={setActiveTab}
                showInactiveProducts={showInactiveProducts}
                setShowInactiveProducts={setShowInactiveProducts}
                fetchInactiveProducts={fetchInactiveProducts}
                fetchDeletedProducts={fetchDeletedProducts}
                fetchUserProducts={fetchUserProducts}
                purchasedProducts={purchasedProducts}
                // setPurchasedProducts={setPurchasedProducts}
                fetchPurchasedProducts={fetchPurchasedProducts}
                activeTab={activeTab}
                setSearchTerm={setSearchTerm}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                soldProducts={soldProducts}
                fetchSoldProducts={fetchSoldProducts}
            />

            {totalPages > 0 && isGrid && (
                <Pagination
                    sx={{width: "100%", bottom: "5%", justifyContent: "center"}}
                    radius="lg"
                    mt={28}
                    total={totalPages}
                    value={page}
                    onChange={setPage}
                />
            )}
        </Layout>
    );
};

export default Products;
