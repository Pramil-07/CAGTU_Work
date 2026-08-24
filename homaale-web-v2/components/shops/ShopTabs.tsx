import {Button, Skeleton, Tabs} from "@mantine/core";
import Link from "next/link";
import {ShopCard} from "@/components/shops/ShopCard";
import {ShopCardProps} from "@/pages/shops";
import {isLoggedIn} from "@/utils/helpers";
import Layout from "@/components/Layout/Layout";
import {useState} from "react";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import Empty from "@/components/common/Empty";

interface ShopTabsProps {
    allShops: ShopCardProps[];
    myShops: ShopCardProps[];
    onCreateShop?: () => void;
    isLoading: boolean;
    activeTab: string;
    fetchAllShops: () => void;
    fetchMyShops: () => void;
}

export function ShopTabs({
                             allShops,
                             myShops,
                             onCreateShop,
                             isLoading,
                             activeTab,
                             fetchAllShops,
                             fetchMyShops,
                         }: ShopTabsProps) {
    const [loading, setLoading] = useState(false);
    // console.log("status",allShops)
    const renderShopGrid = (shops: ShopCardProps[], isMyShops: boolean) => {
        if (loading) {
            return (
                <Layout currentTitle={"Shops"}>
                    <div className="flex justify-center items-center h-screen">
                        <HomaaleLoader/>
                    </div>
                </Layout>
            );
        }
        if (shops?.length === 0) {
            return (
                <div className="text-center py-8">
                    <Empty
                        title={isMyShops ? "Not Found." : "No shops Available."}
                        description={isMyShops ? "Create your first shop." : ""}
                    />
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {shops?.map((shop) => (
                    <Link href={`/shops/${shop.id}`} key={shop.id}>
                        <ShopCard
                            image={shop.image}
                            title={shop.name}
                            rating={shop.rating}
                            about={shop.about}
                            location={shop.location}
                            status={shop.status}
                            id={shop.id}
                            pinned={shop.is_pinned}
                            pinnedId={shop.pinned_id}
                            isMyShop={isMyShops}
                            fetchAllShops={fetchAllShops}
                            fetchMyShops={fetchMyShops}
                            activeTab={activeTab}
                        />
                    </Link>
                ))}
            </div>
        );
    };

    const renderSkeleton = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({length: 9}).map((_, index) => (
                    <div key={index}>
                        <Skeleton height={200} radius="md"/>
                        <Skeleton height={20} mt={10} width="80%"/>
                        <Skeleton height={15} mt={5} width="60%"/>
                    </div>
                ))}
            </div>
        );
    };


    return (
        <Tabs value={activeTab}>
            {activeTab === "allShops" && (isLoading ? renderSkeleton() : renderShopGrid(allShops, false))}
            {activeTab === "myShop" && (isLoading ? renderSkeleton() : renderShopGrid(myShops, true))}
        </Tabs>
    );
}
