"use client"
import { useParams, useRouter } from "next/navigation"
import React, {useContext, useEffect, useRef, useState} from "react"
import Image from "next/image"
import logo from "@/images/logo-bg-min.png"
import { IconButton, Tooltip, Card, CardContent } from "@mui/material"
import { Heart, Shuffle, Star } from "lucide-react"
import Link from "next/link"
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap"
import { ShareWith } from "../../../components/ShareWith"
import apiClient from "../../../axiosConfig"
import {Box, Center, Flex, Rating, useMantineTheme} from "@mantine/core"
import CartContext from "../../../context/CartContext"
import CommentSection from "@/components/common/CommentSection"
import { useAuth } from "@/lib/AuthContext"
import type { CommentUser } from "@/app/blog/[title]/page"
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import Error from "../../../components/Error/Error";
import axios, {AxiosError} from "axios";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {IconCheck} from "@tabler/icons-react";
import ProductDisplay from "@/components/ProductDisplay";
import {toast} from "@/components/common/Toast";
import {useAuthModalContext} from "@/components/authModalProvider";

interface CommentData {
    count: number
    current: number
    page_size: number
    purchased: boolean
    result : Comment[]
}
interface Comment {
    id: number
    user: CommentUser
    created_at: string
    updated_at: string
    deleted_at: string | null
    status: string
    rating: number
    review: string
    product: number | null
    blog: number | null
}

interface NewComment {
    review: string
    rating: number
}

const EachProduct = () => {
    const params = useParams()
    const paramName = params.name as string
    const router = useRouter()
    const [isInWishlist, setIsInWishlist] = useState(false)
    const { addToCartWithQuantity, cartItems, refreshWishCount } = useContext(CartContext)
    const [activeKey, setActiveKey] = useState("description")
    const [quantity, setQuantity] = useState(1)
    const [product, setProduct] = useState<any>(null)
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [productList, setProductList] = useState<any>(null)
    const [productSideList, setProductSideList] = useState<any>(null)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStock, setSelectedStock] = useState<any>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const theme = useMantineTheme()
    const [comments, setComments] = useState<Comment[]>([])
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [newComment, setNewComment] = useState<NewComment>({ review: "", rating: 0 })
    const [expandedComments, setExpandedComments] = useState<number[]>([])
    const [commentError, setCommentError] = useState("")
    const [commentCount , setCommentCount] = useState<number>(0)
    const [purchased , setPurchased] = useState<boolean>(false)
    const { isLoggedIn } = useAuth()
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const productId = product?.id;
    const {showLogin} = useAuthModalContext();
    console.log("product id",productId)
    const [isClamped, setIsClamped] = useState(false);
    const descRef = useRef<HTMLDivElement>(null);

    const checkClamped = () => {
        if (descRef.current) {
            const el = descRef.current;
            setIsClamped(el.scrollHeight > el.clientHeight);
        }
    };

    useEffect(() => {
        checkClamped();
        window.addEventListener("resize", checkClamped);
        return () => window.removeEventListener("resize", checkClamped);
    }, [product?.meta_description]);


    const isInCart = cartItems.some((item: any) => item.id === (selectedStock ? `${product?.id}` : null))

    // Fetch product details
    useEffect(() => {
        if (!paramName) return;

        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/product/${paramName}/`);
                console.log("data of product", response.data);
                setProduct(response.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Product not found");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, [paramName]);


    // console.log("productid inside",productId)


    const productImages = React.useMemo(() => {
        const images: string[] = []

        // Add thumbnail image if available
        if (product?.thumbnail_image) {
            images.push(product.thumbnail_image)
        }

        // Add extra images from product.images[]
        if (product?.images?.length > 0) {
            product.images.forEach((img: any) => {
                if (img.image && !images.includes(img.image)) {
                    images.push(img.image)
                }
            })
        }

        // Add stock images
        if (product?.stocks?.length > 0) {
            product.stocks.forEach((stock: any) => {
                if (stock.image && !images.includes(stock.image)) {
                    images.push(stock.image)
                }
            })
        }

        return images.length > 0 ? images : [logo]
    }, [product, selectedStock])

    const handleAddToCart = () => {
        if (selectedStock) {
            addToCartWithQuantity(
                {
                id: `${product.id}`,
                productId: product.id,
                stockId: selectedStock.id,
                name: product.name,
                price: selectedStock.price,
                    image: product?.thumbnail_image || product?.images[0],
                size: selectedStock.size,
                size_unit: selectedStock.size_unit,
                color: selectedStock.color,
                    quantity: quantity,
                },
                quantity
            );
            toast.success("Item added to cart!");
        }
    };

    useEffect(() => {
        const fetchProductList = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/product/list/?page_size=6`);
                setProductList(response.data.result);
                console.log("product list",response.data.result);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Product not found");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductList();
    }, [paramName]);

    useEffect(() => {
        const fetchProductList = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/product/list/?page_size=6`);
                setProductSideList(response.data.result);
                console.log("product list",response.data.result);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Product not found");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductList();
    }, [paramName]);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/product/${paramName}/`);
                setProduct(response.data);
                console.log("product details data",response.data)
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Product not found");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [paramName]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await apiClient.get(`/product/similar-products/${product.id}/`);
                setRelatedProducts(response.data.data)
                console.log("Related products:", response.data);
            } catch (err: any) {
                console.error("Error fetching related products:", err.message);
            }
        };
        fetchRelatedProducts();
    }, [productId]);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await apiClient.get(`/activity/rating/slug/${paramName}/`);
                console.log("get comments",response.data)
                setComments(response.data.result || []);
                setCommentCount(response.data?.count || 0);
                setPurchased(response?.data?.purchased || false);
            } catch (err) {
                console.error("Error fetching comments:", err);
                setCommentError("Failed to load comments");
            }
        };

        fetchComments();
    }, [paramName]);

    // Update selected stock and size when product changes
    useEffect(() => {
        if (product?.stocks?.length > 0) {
            setSelectedStock(product?.stocks[0]);
            setSelectedSize(`${product?.stocks[0]?.size} ${product?.stocks[0]?.size_unit}`);
            setQuantity(Math.min(1, product?.stocks[0]?.quantity));
        }
    }, [product]);

    // Toggle comment expansion
    const toggleComment = (id: number) => {
        setExpandedComments((prev) =>
            prev.includes(id) ? prev.filter((commentId) => commentId !== id) : [...prev, id]
        );
    };

    // Handle star rating click
    const handleStarClick = (rating: number) => {
        setNewComment((prev) => ({ ...prev, rating }));
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoggedIn) {
            setCommentError("Please log in to post a comment");
            return;
        }
        if (!newComment.review || newComment.rating === 0) {
            setCommentError("Please provide a review and rating");
            return;
        }

        try {
            const formData = new FormData()
            formData.append("rating", String(newComment.rating))
            formData.append("review", newComment.review)

            await apiClient.post(`/activity/rating/?product_id=${product.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setNewComment({ review: "", rating: 0 })
            const response = await apiClient.get(`/activity/rating/slug/${paramName}/`)
            setComments(response.data.result || [])
        } catch (err) {
            console.error("Failed to submit comment:", err)
            setError("Failed to submit comment")
        }
    }

    if (isLoading) {
        return (
            <Box style={{ minHeight: "40vh" }}>
                <Container className="p-6 page-container">
                    {/* Skeleton for Breadcrumbs */}
                    <div className="h-auto bg-gray-100 p-3">
                        <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                    </div>

                    <Container className="w-full flex flex-col mt-3 lg:flex-row gap-6">
                        {/* Skeleton for Main Product Container */}
                        <div className="flex flex-col lg:flex-row w-full gap-5">
                            <div className="flex flex-col items-center md:items-start w-auto">
                                {/* Skeleton for Main Image */}
                                <div className="relative w-[780px] h-[500px] bg-gray-300 rounded-sm animate-pulse"></div>
                                {/* Skeleton for Thumbnail Gallery */}
                                <div className="flex gap-3 mt-4 justify-center flex-wrap">
                                    {[...Array(4)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="w-16 h-16 bg-gray-300 rounded-md animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                                {/* Skeleton for Product Info */}
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 w-full">
                                {/* Skeleton for Product Title and Category */}
                                <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                                <div className="flex justify-between">
                                    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                                </div>
                                <hr className="my-3" />
                                {/* Skeleton for Price and Stock */}
                                <div className="flex justify-between">
                                    <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                                </div>
                                <hr className="my-3" />
                                {/* Skeleton for Description */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                                </div>
                                {/* Skeleton for Size and Color */}
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                                    {[...Array(3)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-8 w-16 bg-gray-300 rounded animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                                    {[...Array(3)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                                {/* Skeleton for Quantity and Buttons */}
                                <div className="flex gap-2">
                                    <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                                    <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-10 w-40 bg-gray-300 rounded animate-pulse"></div>
                                    <div className="h-10 w-10 bg-gray-300 rounded animate-pulse"></div>
                                    <div className="h-10 w-10 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Skeleton for New Products */}
                        <div className="w-full mt-6 lg:mt-0">
                            <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse mb-4"></div>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-300 rounded animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Container>

                    {/* Skeleton for Tabs and Description */}
                    <section className="max-w-5xl mt-8">
                        <Container>
                            <div className="flex gap-4">
                                {[...Array(3)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-6 bg-gray-300 rounded w-24 animate-pulse"
                                    ></div>
                                ))}
                            </div>
                            <div className="mt-5">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        </Container>
                    </section>
                </Container>
            </Box>
        );
    }

    if (!product) {
        return (
            <Error/>
        );
    }
    const handleAddToWishlist = async () => {
        if (!isLoggedIn) {
            showLogin();
            return;
        }
        try {
            const response = await apiClient.post(`/product/wish/${product.id}/${selectedStock.id}/`, {});
            if (response.status === 200 || response.status === 201) {
                setIsInWishlist(true);
                await refreshWishCount();
                toast.success("Added to wishlist!");
                console.log('Added to wishlist successfully');
            } else {
                console.error('Failed to add to wishlist:', response.status);
                toast.error("Failed to add to wishlist.");
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Error adding to wishlist:', error.response?.data || error.message);
                toast.error("Failed to add to wishlist.");
            }  else {
                console.error('Unknown error:', error);
                toast.error("An unexpected error occurred.");
            }
        }

    };

    const handleRemoveFromWishlist = async () => {
        if (!isLoggedIn) {
            showLogin();
            return;
        }
        try {
            const response = await apiClient.post(`/product/wish/${product.id}/${selectedStock.id}/`);
            if (response.status === 200 || response.status === 204) {
                setIsInWishlist(false);
                await refreshWishCount();
                toast.success("Removed from wishlist!");
                console.log('Removed from wishlist successfully');
            } else {
                console.error('Failed to remove from wishlist:', response.status);
                toast.error("Failed to remove from wishlist.");
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Error removing from wishlist:', error.response?.data || error.message);
                toast.error("Failed to remove from wishlist.");
            }  else {
                console.error('Unknown error:', error);
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div>
            <div className="w-full bg-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-5">
            <BreadCrumbs
                currentTitle={product?.name}
                items={[{name: "Shop", href: "/shop"}]}
            />
        </div>
        </div>
        <div className="w-full flex page-container items-center justify-center">
            <div className="  item-center justify-center bg-white rounded-lg">

                <Container className="w-full flex flex-col mt-5 lg:flex-row gap-6">
                    {/* Main Product Container */}
                    <div className="flex flex-col lg:flex-row w-full flex-1 order-1 gap-5">
                        <div className="flex flex-col items-center md:items-start w-auto">
                            {/* Main Image with Hover Zoom */}
                            <div className="relative overflow-hidden rounded-sm bg-gray-50 group">
                                <Image
                                    src={productImages[selectedImageIndex] || "/placeholder.svg"}
                                    alt={product?.name || "Product Image"}
                                    width={780}
                                    height={0}
                                    className="object-fit h-[400px] cursor-pointer transition-transform duration-500 ease-in-out group-hover:scale-110"
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            {productImages.length >= 1 && (
                                <div className="flex gap-3 mt-4 justify-center flex-wrap">
                                    {productImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                                                selectedImageIndex === index
                                                    ? "border-red-600 shadow-md scale-105"
                                                    : "border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            <Image
                                                src={image || "/placeholder.svg"}
                                                alt={`Product view ${index + 1}`}
                                                fill
                                                className="object-contain"
                                                sizes="80px"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 text-sm text-gray-700 space-y-1">
                                <p>
                                    <strong>Estimated Delivery:</strong> <span>3 - 5 days</span>
                                </p>
                                <p>
                                    <strong>Tags: </strong>

                                    <span>
                                        {product?.tags && product.tags.length > 0 ? (
                                            product.tags.map((tag: any, index: number) => (
                                                <React.Fragment key={tag.id}>
                                                    <Link
                                                        href={{
                                                            pathname: "/shop",
                                                            query: {
                                                                tags: tag.name.toLowerCase().replace(/\s+/g, "-"),
                                                                idTag: tag.id,
                                                            },
                                                        }}
                                                        className="hover:underline mr-1"
                                                    >
                                                        {tag.name}
                                                    </Link>
                                                    {index < product.tags.length - 1 && ","}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            "Sweets"
                                        )}
                                    </span>
                                </p>
                                <p>
                                    {/*<strong>SKU:</strong> <span>{product?.stocks[0]?.sku}</span>*/}
                                    <strong>SKU:</strong>
                                    <span>{selectedStock?.sku || product?.stocks[0]?.sku || "N/A"}</span>
                                </p>
                                <p>
                                    <span>Free Shipping & Returns:</span>
                                    <span> On all orders over $200.00</span>
                                </p>
                                <div className="flex gap-2 mt-4 mb-4 text-sm">
                                        <span className="text-gray-600">
                                          Share this :
                                        </span>
                                    <ShareWith/>
                                </div>

                                {product?.warranty_type === "No Warranty" && (
                                    <p>
                                        <strong>Warranty:</strong> <span>{product.warranty_period}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col text-left gap-4 mt-4 md:mt-0 w-full">
                            <Col xs={12} sm={12} md={12} lg={12} className="order-md-2">
                                <div>
                                    <div className="min-h-[400px]">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                            {product?.name
                                                ? product.name.charAt(0).toUpperCase() + product.name.slice(1)
                                                : "Colorful Pattern Shirts HD450"}
                                        </h1>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
                                        <div
                                            className={`text-sm font-medium hover:text-[${theme.colors.brand[7]}] cursor-pointer`}
                                            style={{ color: theme.colors.brand[6] }}
                                        >
                                            <span className="text-gray-500">Category:</span>{" "}
                                            {product?.category?.name ? (
                                                <Link
                                                    href={{
                                                        pathname: "/shop",
                                                        query: {
                                                            category: product.category.name.toLowerCase().replace(/\s+/g, "-"),
                                                            id: product.category.id,
                                                        },
                                                    }}
                                                    className="hover:underline"
                                                >
                                                    {product.category.name}
                                                </Link>

                                            ) : (
                                                "Sweets"
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-600 flex gap-1 items-center">
                                              <Rating value={product?.rating?.avg_rating?.rating__avg} readOnly size="xs" mt="4px"/> (
                                            {product?.rating?.total_count || 0} reviews)
                                        </span>
                                    </div>
                                    <hr className="my-3"/>
                                    <div className="flex items-center flex-wrap">
                                        {/*<span className="text-lg sm:text-2xl font-medium text-gray-900">*/}
                                        {/*  {selectedStock?.stock?.[0]?.is_default*/}
                                        {/*      ? `${product?.currency?.symbol}${selectedStock?.price ?? product?.stocks[0]?.price}`*/}
                                        {/*      : `${product?.currency?.symbol??"AU$"}${product.stocks[0]?.price}`}*/}
                                        {/*</span>*/}
                                        { (
                                            <div className="flex flex-wrap w-full justify-between ">
                                                <div>
                                                  <span className="text-xl text-gray-500" style={{color: theme.colors.brand[7]}}>
                                                    {product?.currency?.symbol || "AU$"} {selectedStock?.price || product?.stocks[0]?.price|| 0}
                                                  </span>
                                                    <span className="pl-3 text-sm text-gray-500 line-through">
                                                    {product?.currency?.symbol || "AU$"} {selectedStock?.mrp || product?.stocks[0]?.mrp || 0}
                                                  </span>
                                                    {selectedStock?.offer_type !== "No offer" && (
                                                    <span className="text-sm pl-7 font-semibold text-gray-500" style={{color: theme.colors.brand[7]}}>
                                                        {selectedStock?.offer_type}
                                                  </span>
                                                        )}
                                                </div>
                                                <div>
                                                    <p>
                                                        {selectedStock?.quantity && selectedStock.quantity <= 5 ? (
                                                            <span className="text-red-500">
                                                                Only {selectedStock.quantity || 0} left – Limited Stock!
                                                            </span>
                                                        ) : (
                                                            <span className="text-green-500">
                                                                        {selectedStock?.quantity || 0} items in stock
                                                                    </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <hr className="my-3"/>
                                    <div className="mt-2 ">
                                        <div
                                            ref={descRef}
                                            className={`text-gray-600 product-description mt-2`}
                                            dangerouslySetInnerHTML={{
                                                __html: product?.meta_description.replace(/<br\s*\/?>/gi, "") || "",
                                            }}
                                        />
                                        {/*{isClamped && (*/}
                                        {/*    <button*/}
                                        {/*        onClick={() => setShowFullDescription(!showFullDescription)}*/}
                                        {/*        className="text-sm text-red-600 hover:underline mt-2"*/}
                                        {/*    >*/}
                                        {/*        {showFullDescription ? "View Less" : "View More"}*/}
                                        {/*    </button>*/}
                                        {/*)}*/}
                                        <Box component="div" mb="20px" className="mt-5 text-md line-clamp-2">
                                            {Array.isArray(product.extra_data) && product.extra_data?.length > 0 ? (
                                                <>
                                                    {product.extra_data.map((highlights: any, index: any) => (
                                                        <Flex key={index} align="center">
                                                            <IconCheck size={14} color={theme.colors.blue[5]}
                                                                       style={{marginRight: "8px"}}/>
                                                            <p>{highlights.charAt(0).toUpperCase() + highlights.slice(1)}</p>
                                                        </Flex>
                                                    ))}
                                                </>
                                            ) : null}
                                        </Box>
                                    </div>
                                </div>
                                    {product?.stocks?.length > 0 && (
                                        <div className="product-container mt-4 mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold me-2">Size</span>
                                                {[...new Set(product.stocks.map((stock: any) => `${stock?.size} ${stock?.size_unit}`))].map(
                                                    (size: any, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => {
                                                                setSelectedSize(size)
                                                                const matchingStock = product.stocks.find(
                                                                    (stock: any) => `${stock?.size} ${stock?.size_unit}` === size,
                                                                )
                                                                setSelectedStock(matchingStock)
                                                            }}
                                                            style={{
                                                                padding: "4px 12px",
                                                                borderRadius: "4px",
                                                                border: selectedSize === size ? "1px solid #008080" : "1px solid #ccc",
                                                                backgroundColor: selectedSize === size ? theme.colors.brand[7] : "#fff",
                                                                color: selectedSize === size ? "#fff" : "#000",
                                                                textTransform: "uppercase",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            {size}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <span className="font-semibold">Color</span>
                                                {product?.stocks
                                                    .filter((stock: any) => `${stock?.size} ${stock?.size_unit}` === selectedSize)
                                                    .map((stock: any, index: any) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedStock(stock)}
                                                            style={{
                                                                width: "22px",
                                                                height: "22px",
                                                                borderRadius: "50%",
                                                                backgroundColor: stock.color,
                                                                border: selectedStock?.id === stock.id ? "2px solid #666" : "1px solid #ccc",
                                                                position: "relative",
                                                                padding: 0,
                                                                outline: "none",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            {selectedStock?.id === stock.id && (
                                                                <span
                                                                    style={{
                                                                        width: "7px",
                                                                        height: "7px",
                                                                        backgroundColor: theme.colors.brand[7],
                                                                        borderRadius: "50%",
                                                                        position: "absolute",
                                                                        top: "-2px",
                                                                        right: "-2px",
                                                                        border: "1px solid #1f1f1f",
                                                                    }}
                                                                />
                                                            )}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 mb-4 flex items-center gap-2">
                                        <span className="font-semibold">Quantity</span>
                                        <div className="flex w-[130px]">
                                            <IconButton
                                                sx={{
                                                    width: "30px",
                                                    height: "32px",
                                                    backgroundColor: "lightgrey",
                                                    border: "none",
                                                    borderRadius: "15%",
                                                    "&:hover": {
                                                        backgroundColor: theme.colors.brand[7],
                                                        color: "#ffffff",
                                                    },
                                                }}
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            >
                                                −
                                            </IconButton>
                                            <input
                                                type="text"
                                                className="w-10 h-8 text-center border-y border-gray-300"
                                                value={quantity}
                                                readOnly
                                            />
                                            <IconButton
                                                sx={{
                                                    width: "30px",
                                                    height: "32px",
                                                    backgroundColor: "lightgrey",
                                                    border: "none",
                                                    borderRadius: "15%",
                                                    "&:hover": {
                                                        backgroundColor: theme.colors.brand[7],
                                                        color: "#ffffff",
                                                    },
                                                }}
                                                onClick={() =>
                                                    setQuantity((q) => Math.min(selectedStock?.quantity || Number.POSITIVE_INFINITY, q + 1))
                                                }
                                            >
                                                +
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <IconButton
                                            sx={{
                                                backgroundColor: isInCart ? "#ed973e" : theme.colors.brand[7],
                                                color: "#ffffff",
                                                borderRadius: "5px",
                                                height: "43px",
                                                width: "200px",
                                                padding: "8px 16px",
                                                fontSize: "14px",
                                                "&:hover": {
                                                    backgroundColor: isInCart ? "#f4b26d" : theme.colors.brand[8],
                                                    color: "#ffffff",
                                                },
                                            }}
                                            onClick={!isInCart ? handleAddToCart : () => router.push("/cart")}
                                        >
                                            {isInCart ? "In Cart" : "Add to Cart"}
                                        </IconButton>
                                        <Tooltip
                                            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                            placement="top"
                                            arrow
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        backgroundColor: theme.colors.brand[7],
                                                        fontSize: "12px",
                                                        padding: "6px 10px",
                                                        borderRadius: "5px",
                                                    },
                                                },
                                                arrow: {sx: {color: theme.colors.brand[7]}},
                                            }}
                                        >
                                            <IconButton
                                                sx={{
                                                    width: 45,
                                                    height: 45,
                                                    borderRadius: "5px",
                                                    border: "1px solid #1f1f1f1f",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        transform: "scale(1.1) translateY(-4px)",
                                                        backgroundColor: theme.colors.brand[7],
                                                        color: "#ffffff",
                                                    },
                                                }}
                                                onClick={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
                                            >
                                                <Heart size={16} fill={isInWishlist ? "#ff0000" : "none"}/>
                                            </IconButton>
                                        </Tooltip>
                                        {/*<Tooltip*/}
                                        {/*    title="Compare"*/}
                                        {/*    placement="top"*/}
                                        {/*    arrow*/}
                                        {/*    componentsProps={{*/}
                                        {/*        tooltip: {*/}
                                        {/*            sx: {*/}
                                        {/*                backgroundColor: theme.colors.brand[7],*/}
                                        {/*                fontSize: "12px",*/}
                                        {/*                padding: "6px 10px",*/}
                                        {/*                borderRadius: "5px",*/}
                                        {/*            },*/}
                                        {/*        },*/}
                                        {/*        arrow: {sx: {color: theme.colors.brand[7]}},*/}
                                        {/*    }}*/}
                                        {/*>*/}
                                        {/*    <IconButton*/}
                                        {/*        sx={{*/}
                                        {/*            width: 45,*/}
                                        {/*            height: 45,*/}
                                        {/*            borderRadius: "5px",*/}
                                        {/*            border: "1px solid #1f1f1f1f",*/}
                                        {/*            transition: "all 0.3s ease",*/}
                                        {/*            "&:hover": {*/}
                                        {/*                transform: "scale(1.1) translateY(-4px)",*/}
                                        {/*                backgroundColor: theme.colors.brand[7],*/}
                                        {/*                color: "#ffffff",*/}
                                        {/*            },*/}
                                        {/*        }}*/}
                                        {/*    >*/}
                                        {/*        <Shuffle size={16}/>*/}
                                        {/*    </IconButton>*/}
                                        {/*</Tooltip>*/}
                                    </div>
                                    <hr className="p-2 mt-2"/>
                                    {/*<p>*/}
                                    {/*    <strong>SKU:</strong> <span>{product?.stocks[0]?.sku}</span>*/}
                                    {/*</p>*/}
                                    {/*<p>*/}
                                    {/*    <span>Free Shipping & Returns:</span>*/}
                                    {/*    <span> On all orders over $200.00</span>*/}
                                    {/*</p>*/}
                                </div>
                            </Col>
                        </div>
                    </div>

                    {/* New Products Card - Sidebar for Large Screens */}
                    <div className="hidden md:flex items-start justify-items-start lg:block mt-6 lg:mt-0 order-2">
                        <div className="shadow-sm w-75">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">NEW PRODUCTS</h3>
                                <div className="space-y-4">
                                    {productList?.map((item: any) => (
                                        <Link
                                            key={item.id}
                                            href={`/product/${item.slug}`}
                                            className="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition"
                                        >
                                            <div className="flex gap-3">
                                                <Image
                                                    src={item?.images[0]?.image}
                                                    alt={item?.name}
                                                    width={50}
                                                    height={50}
                                                    className="w-16 h-16 bg-gray-100 object-contain rounded-md flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>

                                                    {/*<p className="text-sm font-semibold text-gray-900 mt-1">{item?.currency?.symbol}{item?.stock?.price}</p>*/}
                                                    <span className="text-sm text-gray-800">
                                                        {item?.currency?.symbol || "AU$"} {item.stock.price || 0}
                                                    </span>
                                                    {item.stock.mrp && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                      {item?.currency?.symbol || "AU$"} {item.stock.mrp}
                                                    </span>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <div className="flex">
                                                            {item?.rating?.rating_avg || [1, 2, 3, 4, 5].map((star: any) => (
                                                                <Star key={star || 1}
                                                                      className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </div>
                    </div>
                </Container>

                {/* Product Detail Section */}
                <section className="max-w-5xl mt-8">
                    <Container>
                        <div className="border-gray-300 rounded">
                            <Tabs
                                activeKey={activeKey}
                                onSelect={(key: any) => setActiveKey(key)}
                                id="controlled-tab-example"
                                className="flex text-sm gap-2 lg:gap-6"
                            >
                                <Tab
                                    eventKey="description"
                                    title={
                                        <span
                                            className={`text-sm sm:text-base font-medium pb-1 transition-all duration-200 ${
                                                activeKey === "description"
                                                    ? "text-red-600 border-b-2 border-red-600"
                                                    : "text-gray-900 border-b-2 border-transparent hover:text-red-500 hover:-translate-y-0.5"
                                            }`}
                                        >
                                          DESCRIPTION
                                        </span>
                                    }
                                >
                                    {activeKey === "description" && (
                                        <div
                                            className="p-4 text-gray-600 mt-5 product-description"
                                            dangerouslySetInnerHTML={{
                                                __html: `${product?.description}`,
                                            }}
                                        />
                                    )}
                                </Tab>

                                <Tab
                                    eventKey="information"
                                    title={
                                        <span
                                            className={`text-sm sm:text-base font-medium pb-1 transition-all duration-200 ${
                                                activeKey === "information"
                                                    ? "text-red-600 border-b-2 border-red-600"
                                                    : "text-gray-900 border-b-2 border-transparent hover:text-red-500 hover:-translate-y-0.5"
                                            }`}
                                        >
                                          ADDITIONAL INFO
                                        </span>
                                    }
                                >
                                    {activeKey === "information" && (
                                        <div
                                            className="p-4 text-gray-600 mt-5 text-sm"
                                            // dangerouslySetInnerHTML={{
                                            //     __html: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo id quibusdam
                                            // accusantium aspernatur. Quo aliquam quas perspiciatis, velit, optio a earum
                                            // consectetur dicta, dolorem aut expedita blanditiis dolore ducimus tenetur?`,
                                            // }}
                                        >
                                            {Array.isArray(product.extra_data) && product.extra_data?.length > 0 ? (
                                                <>
                                                    {product.extra_data.map((highlights: any, index: any) => (
                                                        <Flex key={index} align="center">
                                                            <IconCheck size={14} color={theme.colors.blue[5]}
                                                                       style={{marginRight: "8px"}}/>
                                                            <p>{highlights.charAt(0).toUpperCase() + highlights?.slice(1)}</p>
                                                        </Flex>
                                                    ))}
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </Tab>

                                <Tab
                                    eventKey="comment"
                                    title={
                                        <span
                                            className={`text-1 sm:text-base font-medium pb-1 transition-all duration-200 ${
                                                activeKey === "comment"
                                                    ? "text-red-600 border-b-2 border-red-600"
                                                    : "text-gray-900 border-b-2 border-transparent hover:text-red-500 hover:-translate-y-0.5"
                                            }`}
                                        >
                                          RATINGS ({commentCount})
                                        </span>
                                    }
                                >
                                    <div className="mt-5">
                                        {activeKey === "comment" && (
                                            <CommentSection
                                                slug={paramName}
                                                id={product.id}
                                                productId={product.id}
                                                comments={comments}
                                                newComment={newComment}
                                                setNewComment={setNewComment}
                                                expandedComments={expandedComments}
                                                toggleComment={toggleComment}
                                                handleCommentSubmit={handleCommentSubmit}
                                                handleStarClick={handleStarClick}
                                                error={commentError}
                                                isProduct={true}
                                                isLoggedIn={isLoggedIn}
                                                isPurchased={purchased}
                                            />
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>

                        <Container className="mt-8 w-full">
                            <h3 className="text-xl font-bold">Related Products</h3>
                            <hr className="mb-4"/>
                            {relatedProducts.length > 0 ? (
                                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {relatedProducts?.slice(0, 4).map((relatedProduct) => (
                                        <div key={relatedProduct.id}>
                                            <ProductDisplay
                                                product={relatedProduct}
                                                border={false}
                                                isWish={relatedProduct.is_bookmarked}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 mb-8">No related products available.</p>
                            )}
                        </Container>

                        {/* New Products Section for Medium and Smaller Devices */}
                        <div className="lg:hidden mt-8">
                            <Container>
                                <div className="shadow-sm">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-4">NEW PRODUCTS</h3>
                                        <div className="space-y-4">
                                            {productSideList?.map((item: any) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/product/${item.slug}`}
                                                    className="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition"
                                                >
                                                    <div className="flex gap-3">
                                                        <Image
                                                            src={item?.images[0]?.image || logo}
                                                            alt={item?.name}
                                                            width={50}
                                                            height={50}
                                                            className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0"
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <div className="flex">
                                                                    {item?.rating?.rating_avg || [1, 2, 3, 4, 5].map((star: any) => (
                                                                        <Star key={star || 1}
                                                                              className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900 mt-1">{item?.currency?.symbol || "AU$"}{item?.stock?.price || "0.00"}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </div>
                            </Container>
                        </div>

                        {/*<div*/}
                        {/*    className="relative bg-red-500 mt-2 mb-3 rounded-2xl shadow-md p-6 flex items-center justify-between overflow-hidden">*/}
                        {/*    /!* Left Content *!/*/}
                        {/*    <div className="z-10 max-w-md">*/}
                        {/*        <p className="text-gray-600 text-sm mb-2">Repair Services</p>*/}
                        {/*        <h2 className="text-2xl font-semibold leading-snug">*/}
                        {/*            We&apos;re an Apple <br/> Authorised Service Provider*/}
                        {/*        </h2>*/}
                        {/*    </div>*/}

                        {/*    /!* Right Images *!/*/}
                        {/*    <div className="flex gap-4">*/}
                        {/*        <img*/}
                        {/*            src="/assets/four.png"*/}
                        {/*            alt="product"*/}
                        {/*            className="w-28 p-1 bg-white h-40 object-cover rounded-lg shadow-md rotate-[-5deg]"*/}
                        {/*        />*/}
                        {/*        <img*/}
                        {/*            src="/assets/five.png"*/}
                        {/*            alt="product"*/}
                        {/*            className="w-28 h-40 p-1 bg-white object-cover rounded-lg shadow-md rotate-[2deg]"*/}
                        {/*        />*/}
                        {/*        <img*/}
                        {/*            src="/assets/nine.png"*/}
                        {/*            alt="product"*/}
                        {/*            className="w-28 h-40 p-1 bg-white object-cover rounded-lg shadow-md rotate-[5deg]"*/}
                        {/*        />*/}
                        {/*    </div>*/}

                        {/*    /!* Background decorative pattern (optional) *!/*/}
                        {/*    <div className="absolute inset-0">*/}
                        {/*        /!* You can add bg pattern, SVG, or gradient here *!/*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </Container>
                </section>

            </div>
        </div>
        </div>
    )
}

export default EachProduct