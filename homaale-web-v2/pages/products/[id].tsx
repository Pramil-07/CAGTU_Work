import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout/Layout";
import EntityProductDetails, {ProductDetail} from "@/components/ProductCard/EntityProductDetail";
import { Footer } from "@/components/Layout/Footer";
import SimilarProducts from "@/components/ProductCard/SimilarProductCard";
import SimilarServices from "@/components/ProductCard/SimilarServiceCard";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {axiosClient} from "@/utils/axiosClient";

const ProductDetails = () => {
    const router = useRouter();
    const [productId, setProductId] = useState<string | string[] | undefined>(undefined);
    const [error,setError]=useState("")
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<ProductDetail | null>(null);
    useEffect(() => {
        if (router.isReady) {
            const { id, isPurchased } = router.query;
            if (!id) {
                setError("Product ID is missing");
                setIsLoading(false);
                return;
            }
            setProductId(id);
            setIsLoading(false);
            // Debugging: Log isPurchased to verify query parameter
            // if (process.env.NODE_ENV === "development") {
            //     console.log("ProductDetails Query:", { id, isPurchased });
            // }
        }
    }, [router.isReady, router.query]);

        const fetchProductData = async () => {
            try {
                setIsLoading(true)
                const response = await axiosClient.get(`/product/${productId}`);
                setProduct(response.data);
                setIsLoading(false);
                // console.log("product detail",response.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setIsLoading(false);
            }
        };

    useEffect(() => {
        if (productId){
        fetchProductData()
        }
    }, [productId]);
    if (isLoading) {
        return (
            <Layout
                heading="Product Details"
                breadCrumbsItems={[{name:"Task & Bookings",href:""},{name: "Products", href: "/products"}]}
                currentTitle={product?.name}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100vw",
                }}>
                    <HomaaleLoader/>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            heading="Product Details"
            breadCrumbsItems={[{name:"Task & Bookings",href:"/products"},{ name: "Products", href: "/products" }]}
            currentTitle={product?.name}
        >
            <EntityProductDetails productId={productId}/>


            <SimilarProducts productId={productId} />
            <SimilarServices productId={productId} />


            <Footer/>
        </Layout>
    );
};

export default ProductDetails;
