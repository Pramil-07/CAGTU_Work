"use client"

import type React from "react"
import { useState, useContext } from "react"
import { Heart, Eye } from "lucide-react"
import CartContext from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { IconButton, Tooltip } from "@mui/material"
import Image from "next/image"
import logo from "@/images/logo-bg-min.png"
import { HiOutlineShoppingBag } from "react-icons/hi2"
import { PiShareFatLight } from "react-icons/pi"
import { useMantineTheme } from "@mantine/core"
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"
import PurchasedProductModal from "@/components/Profile/PurchasedProduct/PurchasedProductModal";

// Updated interface to match your CartItem structure
interface StockDetails {
    color: string
    size_unit: string
    size: number
}

interface CartItemProduct {
    product_name: string
    product_price: number
    product_id: number
    product_image: string | null
    product_images: string[]
    quantity: number
    sub_total: number
    store_name: string
    stock: StockDetails
}

interface ProductDisplayProps {
    product: CartItemProduct
    border?: boolean
    openModalHandler:()=>void
}

const PurchasedProductCard: React.FC<ProductDisplayProps> = ({ product, border,openModalHandler }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [modalOpened, setModalOpened] = useState(false)
    const [iconHovered, setIconHovered] = useState(false)
    const { cartItems, addToCart } = useContext(CartContext)
    const isInCart = cartItems.some((item:any) => item.id === `${product.product_id}`)
    const router = useRouter()
    const theme = useMantineTheme()

    const handleAddToCart = () => {
        addToCart({
            id: `${product.product_id}`,
            productId: product.product_id,
            stockId: product.product_id, // Using product_id as stockId since stock info isn't available
            name: product.product_name,
            price: product.product_price,
            image: product.product_image,
            quantity: "1",
        })
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => {
            if (index < Math.floor(rating)) {
                return <FaStar size={13.5} key={index} className="text-yellow-400 inline" />
            } else if (index < rating && rating % 1 >= 0.5) {
                return <FaStarHalfAlt size={13} key={index} className="text-yellow-400 inline" />
            } else {
                return <FaRegStar size={13} key={index} className="text-gray-300 inline" />
            }
        })
    }

    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden relative transition-all duration-300 ease-in-out ${border ? "rounded-2xl border border-gray-300" : ""} `}
            style={{

                transform: border ? "translateY(0)" : isHovered ? "translateY(-5px)" : "translateY(0)",
                boxShadow: border ? (isHovered ? "0 8px 20px rgba(0,0,0,0.07)" : "0 5px 5px rgba(0,0,0,0.03)") : "none",
                maxHeight: "410px",
                maxWidth:"280px",
                minWidth:"280px",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image Container */}
            <div
                className="relative overflow-hidden flex items-center justify-center mx-4 mt-4"
                style={{
                    height: "260px",
                    backgroundColor: "#d4d9dd",
                    borderRadius: "12px",
                }}
                onClick={openModalHandler}
            >
                {/* Store Name Badge */}
                {product?.store_name && (
                    <div
                        className="absolute top-2 left-2 text-white px-2 py-[2px] rounded-2xl text-[10px] font-semibold z-10"
                        style={{ backgroundColor: "#ff69b4" }}
                    >
                        {product.store_name}
                    </div>
                )}

                {/* Hover Action Buttons */}
                <div
                    className="absolute inset-0 flex items-center justify-center gap-2 z-10 transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                >
                    {/* Quick View Button */}
                    <Tooltip
                        title="Quick View"
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
                            arrow: {
                                sx: {
                                    color: theme.colors.brand[7],
                                },
                            },
                        }}
                    >
                        <IconButton
                            sx={{
                                width: 35,
                                height: 35,
                                color: theme.colors.brand[7],
                                backgroundColor: theme.colors.brand[2],
                                border: "1px solid #",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.1) translateY(-4px)",
                                    backgroundColor: theme.colors.brand[7],
                                    color: "#ffffff",
                                },
                            }}
                            onClick={()=>{setModalOpened(true)}}
                        >
                            <Eye size={20} />
                        </IconButton>
                    </Tooltip>

                    {/*<Tooltip*/}
                    {/*    title="Add To Wishlist"*/}
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
                    {/*        arrow: {*/}
                    {/*            sx: {*/}
                    {/*                color: theme.colors.brand[7],*/}
                    {/*            },*/}
                    {/*        },*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <IconButton*/}
                    {/*        sx={{*/}
                    {/*            width: 35,*/}
                    {/*            height: 35,*/}
                    {/*            color: theme.colors.brand[7],*/}
                    {/*            backgroundColor: theme.colors.brand[2],*/}
                    {/*            border: "1px solid #",*/}
                    {/*            transition: "all 0.3s ease",*/}
                    {/*            "&:hover": {*/}
                    {/*                transform: "scale(1.1) translateY(-4px)",*/}
                    {/*                backgroundColor: theme.colors.brand[7],*/}
                    {/*                color: "#ffffff",*/}
                    {/*            },*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        <Heart size={16} />*/}
                    {/*    </IconButton>*/}
                    {/*</Tooltip>*/}

                    {/*<Tooltip*/}
                    {/*    title="Share"*/}
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
                    {/*        arrow: {*/}
                    {/*            sx: {*/}
                    {/*                color: theme.colors.brand[7],*/}
                    {/*            },*/}
                    {/*        },*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <IconButton*/}
                    {/*        sx={{*/}
                    {/*            width: 35,*/}
                    {/*            height: 35,*/}
                    {/*            color: theme.colors.brand[7],*/}
                    {/*            backgroundColor: theme.colors.brand[2],*/}
                    {/*            border: "1px solid #",*/}
                    {/*            transition: "all 0.3s ease",*/}
                    {/*            "&:hover": {*/}
                    {/*                transform: "scale(1.1) translateY(-4px)",*/}
                    {/*                backgroundColor: theme.colors.brand[7],*/}
                    {/*                color: "#ffffff",*/}
                    {/*            },*/}
                    {/*        }}*/}
                    {/*    >*/}
                    {/*        <PiShareFatLight size={16} />*/}
                    {/*    </IconButton>*/}
                    {/*</Tooltip>*/}
                </div>

                {/* Product Image */}
                <Image
                    src={
                        isHovered
                            ? product?.product_images?.[1] || product?.product_images?.[0] || product?.product_image || logo
                            : product?.product_images?.[0] || product?.product_image || logo
                    }
                    height={500}
                    width={500}
                    alt={product.product_name}
                    className="w-full h-full object-fit-contain transition-transform duration-1000 ease-in-out"
                    style={{
                        transform: isHovered ? "scale(1.03)" : "scale(1)",
                        borderRadius: "12px",
                    }}
                />
            </div>

            {/* Product Details */}
            <div className={`${!border ? "px-4" : "p-4"} bg-white`}>
                <div className={`flex flex-col ${!border ? "text-center" : ""}`}>
                    {/* Store Name */}
                    {border && <p className="text-gray-500 text-xs">{product.store_name}</p>}

                    {/* Product Name */}
                    <h6 className="text-sm font-semibold cursor-pointer text-gray-800 mb-1 line-clamp-1 hover:text-[#e62e4d] transition-colors duration-300">
                        {product?.product_name}
                    </h6>

                    {/* Stock Details */}
                    {product.stock && (
                        <div className={`flex ${!border ? "justify-center" : "items-center"} mb-2`}>
                            <div className="flex gap-2 text-xs text-gray-600">
                                {product.stock.color && <span>Color: {product.stock.color}</span>}
                                {product.stock.size && (
                                    <span>
                    Size: {product.stock.size}
                                        {product.stock.size_unit}
                  </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div className={`flex ${!border ? "justify-center items-baseline" : "items-center"}`}>
            <span className="font-semibold text-base mr-2" style={{ color: theme.colors.brand[7] }}>
              ${product.product_price?.toFixed(2) || "0.00"}
            </span>
                    </div>

                    {/* Quantity if available */}
                    {/*{product.quantity && (*/}
                    {/*    <div className={`flex ${!border ? "justify-center" : "items-center"} mt-1`}>*/}
                    {/*        <span className="text-xs text-gray-500">Qty: {product.quantity}</span>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>

            {/* Add to Cart Button */}
            {/*{border && (*/}
            {/*    <div className="absolute bottom-4 right-4">*/}
            {/*        <div className="group relative">*/}
            {/*            <Tooltip*/}
            {/*                title={`${isInCart ? "In Cart" : "Add To Cart"}`}*/}
            {/*                placement="top"*/}
            {/*                arrow*/}
            {/*                componentsProps={{*/}
            {/*                    tooltip: {*/}
            {/*                        sx: {*/}
            {/*                            backgroundColor: theme.colors.brand[7],*/}
            {/*                            fontSize: "9px",*/}
            {/*                            padding: "6px 10px",*/}
            {/*                            borderRadius: "5px",*/}
            {/*                        },*/}
            {/*                    },*/}
            {/*                    arrow: {*/}
            {/*                        sx: {*/}
            {/*                            color: theme.colors.brand[7],*/}
            {/*                        },*/}
            {/*                    },*/}
            {/*                }}*/}
            {/*            >*/}
            {/*                <IconButton*/}
            {/*                    sx={{*/}
            {/*                        width: 35,*/}
            {/*                        height: 35,*/}
            {/*                        color: theme.colors.brand[7],*/}
            {/*                        backgroundColor: theme.colors.brand[2],*/}
            {/*                        border: "1px solid #",*/}
            {/*                        transition: "all 0.2s ease-in-out",*/}
            {/*                        "&:hover": {*/}
            {/*                            transform: "scale(1.1) translateY(-4px)",*/}
            {/*                            backgroundColor: theme.colors.brand[7],*/}
            {/*                            color: "#ffffff",*/}
            {/*                        },*/}
            {/*                    }}*/}
            {/*                    onClick={handleAddToCart}*/}
            {/*                >*/}
            {/*                    <HiOutlineShoppingBag size={20} />*/}
            {/*                    {cartItems.find((item:any) => item.id === `${product.product_id}`)?.quantity && (*/}
            {/*                        <sup className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">*/}
            {/*                            {cartItems.find((item:any) => item.id === `${product.product_id}`)?.quantity}*/}
            {/*                        </sup>*/}
            {/*                    )}*/}
            {/*                </IconButton>*/}
            {/*            </Tooltip>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}
            <PurchasedProductModal opened={modalOpened} onClose={() => setModalOpened(false)} product={product} onAddToCart={()=>{setModalOpened(false)}} isInCart={false}/>
        </div>
    )
}

export default PurchasedProductCard
