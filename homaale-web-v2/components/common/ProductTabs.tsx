import { useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useState, useCallback } from "react";
// import { notifications } from "@mantine/notifications";
import {Package, ShoppingBag, RefreshCw, EyeOff } from "lucide-react";
import ProductCard from "@/components/ProductCard/ProductCard";
import ProductList from "@/components/ProductCard/ProductList";
import { Skeleton } from "@mantine/core";

export interface Product {
    id: number | string;
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
         code: string
    };
    is_active?: boolean;
    is_deleted?: boolean;
    is_pinned?: boolean;
    pinned_id?:string
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

interface ProductTabsProps {
    activeId: number;
    setActiveId: (id: number) => void;
    showUserProducts: boolean;
    setShowUserProducts: (show: boolean) => void;
    isGrid: boolean;
    products: Product[];
    userProducts: Product[];
    // setUserProducts: (products: Product[]) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    dark: boolean;
    productsPerPage: number;
    deletedProducts: Product[];
    // setDeletedProducts: (products: Product[]) => void;
    // setProducts: (products: Product[]) => void;
    activeTab: string | null;
    setActiveTab: (tab: string | null) => void;
    showInactiveProducts: boolean;
    setShowInactiveProducts: (show: boolean) => void;
    fetchInactiveProducts: () => void;
    fetchDeletedProducts: () => void;
    fetchUserProducts: () => void;
    purchasedProducts: Product[];
    // setPurchasedProducts: (products: Product[]) => void;
    fetchPurchasedProducts: () => void;
    setSearchTerm: (term: string) => void;
    sortOrder: string | null;
    setSortOrder: (order: string | null) => void;
    fetchAllProducts : () =>void;
    soldProducts: Product[];
    fetchSoldProducts: () => void;
}

const MY_LIST = 2;
const PRODUCT_ID = 4;

const ProductTabs: React.FC<ProductTabsProps> = ({
                                                     activeId,
                                                     setActiveId,
                                                     showUserProducts,
                                                     setShowUserProducts,
                                                     isGrid,
                                                     products,
                                                     userProducts,
                                                     // setUserProducts,
                                                     loading,
                                                     // setLoading,
                                                     dark,
                                                     productsPerPage,
                                                     deletedProducts,
                                                     // setDeletedProducts,
                                                     // setProducts,
                                                     activeTab,
                                                     setActiveTab,
                                                     fetchAllProducts,
                                                     showInactiveProducts,
                                                     setShowInactiveProducts,
                                                     fetchInactiveProducts,
                                                     purchasedProducts,
                                                     // fetchDeletedProducts,
                                                     fetchUserProducts,
                                                     // setSearchTerm,
                                                     sortOrder,
                                                     setSortOrder,
                                                     soldProducts,
                                                     fetchSoldProducts,
                                                 }) => {
    const router = useRouter();
    const theme = useMantineTheme();
    const [inactiveProducts, setInactiveProducts] = useState<Product[]>([]);
    // const handleProductClick = (product:Product) => {
    //     // Store product data in localStorage
    //     localStorage.setItem('productData', JSON.stringify(product));
    //     router.push('/');
    //   };
    const toggleInactiveProducts = useCallback(() => {
        const newShowInactive = !showInactiveProducts;
        setShowInactiveProducts(newShowInactive);
        setActiveTab(newShowInactive ? "inactive" : "my-products");
        if (newShowInactive) {
            fetchInactiveProducts();
        }
    }, [showInactiveProducts, setShowInactiveProducts, setActiveTab, fetchInactiveProducts]);

    const renderProductList = (productsToRender: Product[]) => {
        return isGrid ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {productsToRender.map((product) => (
                    <div key={product?.id} className="flex mb-2 sm:mb-1">
                        <ProductCard
                            tabValue={activeTab === "purchased_products" ? "Purchased Products" : undefined}
                            is_purchased={activeTab === "purchased_products"}
                            products={product}

                            pinnedId={product.pinned_id}
                            myProduct={activeTab === "my_products"}
                            allProduct={activeTab === null}
                            fetchAllProducts={fetchAllProducts}
                            fetchUserProducts={fetchUserProducts}
                        />

                    </div>
                ))}
            </div>

        ) : (
            <ProductList
                products={productsToRender}
                dark={dark}
                purchasedTabValue={activeTab === "purchased_products" ? "Purchased Products" : undefined}
                soldTabValue={activeTab === "sold" ? "Sold Products" : undefined}
                tabValue={activeTab === "deleted" ? "Deleted Products" : undefined}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />
        );
    };

    const renderEmptyState = (message: string) => (
        <div
            style={{ background: dark ? theme.colors.dark[8] : "#fff" }}
            className="flex flex-col items-center justify-center p-12 bg-gradient-to-b from-gray-50 to-white"
        >
            <div className="relative">
                <div className="absolute -left-6 top-0 animate-bounce delay-100">
                    <Package className="w-8 h-8 text-gray-300" />
                </div>
                <div className="animate-bounce">
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                </div>
                <div className="absolute -right-6 top-0 animate-bounce delay-200">
                    <Package className="w-8 h-8 text-gray-300" />
                </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-2">{message}</h2>
            <p className="text-gray-500 text-center max-w-sm mb-6">
                {activeTab === "deleted" ? "You don’t have any deleted products." : showInactiveProducts ? "You don’t have any inactive products." : "You haven't added any products yet."}
            </p>
            {/*<button*/}
            {/*    style={{ background: dark ? theme.colors.dark[8] : "#fff" }}*/}
            {/*    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-colors"*/}
            {/*    onClick={() => {*/}
            {/*        setActiveId(PRODUCT_ID);*/}
            {/*        setShowUserProducts(false);*/}
            {/*        router.push("/products");*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <RefreshCw className="w-4 h-4 mr-2" />*/}
            {/*    View All Products*/}
            {/*</button>*/}
        </div>
    );

    const renderSkeletons = () => (
        <div className="mt-10 px-4 md:px-6 max-w-[2000px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: productsPerPage }).map((_, index) => (
                    <div key={index} className="border-round border-1 surface-border p-4 surface-card">
                        <Skeleton height="200px" width="100%"></Skeleton>
                        <div className="flex justify-content-between mt-3 mb-3">
                            <Skeleton width="70%" height="1rem"></Skeleton>
                        </div>
                        <Skeleton width="40%" height="1.5rem"></Skeleton>
                        <div className="flex justify-content-between mt-3 gap-2">
                            <Skeleton width="30%" height="2rem"></Skeleton>
                            <Skeleton width="30%" height="2rem"></Skeleton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (activeId === PRODUCT_ID) {
        return loading ? renderSkeletons() : products.length > 0 ? (
            <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">{renderProductList(products)}</div>
        ) : renderEmptyState("No Products Found");
    }

    if (activeId === MY_LIST && showUserProducts) {
        if (activeTab === "deleted") {
            return loading ? renderSkeletons() : deletedProducts.length > 0 ? (
                <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">{renderProductList(deletedProducts)}</div>
            ) : renderEmptyState("No Deleted Products Found");
        }

        if (activeTab === "purchased_products") {
            return loading ? renderSkeletons() : purchasedProducts.length > 0 ? (
                <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">{renderProductList(purchasedProducts)}</div>
            ) : renderEmptyState("No Purchased Products Found");
        }
        if (activeTab === "sold") {
            return loading ? renderSkeletons() : soldProducts.length > 0 ? (
                <div className="mt-10 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">{renderProductList(soldProducts)}</div>
            ) : renderEmptyState("No Sold Products Found");
        }
        return (
            <div className="mt-3 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
                {loading ? renderSkeletons() : (
                    <>
                        {(activeTab === "my-products" || !activeTab || activeTab === "inactive") && (
                            <div className="mb-4 flex justify-end">
                                <button
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-colors"
                                    onClick={toggleInactiveProducts}
                                >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    {showInactiveProducts ? "Hide Inactive Products" : "Show Inactive Products"}
                                </button>
                            </div>
                        )}
                        {showInactiveProducts ? (
                            inactiveProducts.length > 0 ? renderProductList(inactiveProducts) : renderEmptyState("No Inactive Products Found")
                        ) : userProducts.length > 0 ? (
                            renderProductList(userProducts)
                        ) : renderEmptyState("You Don't Have Any Products")}
                    </>
                )}
            </div>
        );
    }

    return null;
};

export default ProductTabs;
