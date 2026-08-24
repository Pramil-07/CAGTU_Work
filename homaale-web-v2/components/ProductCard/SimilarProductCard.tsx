import React, {useEffect, useState} from "react";
import {Skeleton, Grid} from "@mantine/core";
import {axiosClient} from "@/utils/axiosClient";
import ProductCard from "@/components/ProductCard/ProductCard";
import {Product} from "@/components/EntityServiceDetail";
import NoDataAlert from "@/components/common/NoDataAlert";


interface SimilarProductsProps {
    productId: string | string[] | undefined;
    products?: Product[];

}

const SimilarProducts: React.FC<SimilarProductsProps> = ({productId,}) => {
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            try {
                const response = await axiosClient.get(`/product/similar/${productId}`);
                setSimilarProducts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching similar products:', error);
                setLoading(false);
            }
        };

        if (productId) {
            fetchSimilarProducts();
        }
    }, [productId]);
    console.log('similar products', similarProducts);
    console.log('similar products is loading', loading);
    console.log('similar products id', productId);

    if (similarProducts && similarProducts.length < 0) {
        return (<>
                {/*<h2 className="text-lg mb-6">Similar Products</h2>*/}
                <NoDataAlert/>
            </>
        )
    }

    return (
        <section className="py-8">
            {loading ? (
                   <>
                    <h2 className="text-lg mb-6">Similar Products</h2>
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array(3).fill(0).map((_, index) => (
                            <div className="w-[250px]" key={index}>
                                <div className="border-round border-1 surface-border p-4 surface-card">
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
                            </div>
                        ))}
                    </div>
                </div>
                   </>
            ) : (
                <>
                    {similarProducts.length > 0 && (
                        <h2 className="text-lg mb-6">Similar Products</h2>
                    )}
                        <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                    {similarProducts?.map((product) => (
                        <div key={product.id}>
                            <ProductCard products={product}/>
                        </div>
                    ))}
                </div>
                </>
            )}
        </section>
    );
};

export default SimilarProducts;
