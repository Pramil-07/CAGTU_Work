import React, { useState, useContext } from "react";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import CartContext from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { IconButton, Tooltip } from "@mui/material";
import Image from "next/image";
import logo from "@/images/mithoSweetsBgRemoved.png";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { PiShareFatLight } from "react-icons/pi";
import { useMantineTheme } from "@mantine/core";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ShareWith } from "@/components/ShareWith";
import apiClient from "@/axiosConfig";
import {toast} from "@/components/common/Toast";
import {useAuthModalContext} from "@/components/authModalProvider";
import {useAuth} from "@/lib/AuthContext";

const ProductDisplay = ({ product, border, isWish }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Initialize isInWishlist with isWish (is_bookmarked from ProductProps)
  const [isInWishlist, setIsInWishlist] = useState(
    isWish === true || isWish === "true"
  );
  const { cartItems, addToCart, refreshWishCount } = useContext(CartContext);
  const isInCart = cartItems.some((item) => item.id === `${product.id}`);
  const router = useRouter();
  const theme = useMantineTheme();
    const { isLoggedIn } = useAuth();
    const {showLogin} = useAuthModalContext();

    const handleAddToCart = () => {
        addToCart({
            id: `${product?.id}`,
            productId: product?.id,
            stockId: product?.stock.id,
            name: product?.name,
            symbol: product?.currency?.symbol,
            price: product?.stock.price,
            image: product?.images[0],
            quantity: 1,
        });
        toast.success("Item added to cart!");
    };

  const handleAddToWishlist = async () => {
      if (!isLoggedIn) {
          showLogin();
          return;
      }
    try {
      const response = await apiClient.post(
        `/product/wish/${product.id}/${product.stock.id}/`,
        {}
      );
      if (response.status === 200 || response.status === 201) {
        setIsInWishlist(true); // Update state to reflect addition
        await refreshWishCount();
          toast.success("Added to wishlist!");
          console.log("Added to wishlist successfully");
      } else {
        console.error("Failed to add to wishlist:", response.status);
          toast.error("Failed to add to wishlist.");
      }
    } catch (error) {
      console.error(
        "Error adding to wishlist:",
        error.response?.data || error.message
      );
    }
  };

  const handleRemoveFromWishlist = async () => {
      if (!isLoggedIn) {
          showLogin();
          return;
      }
    try {
      const response = await apiClient.post(
        `/product/wish/${product.id}/${product.stock.id}/`
      );
      if (response.status === 200 || response.status === 204) {
        setIsInWishlist(false); // Update state to reflect removal
        await refreshWishCount();
          toast.success("Removed from wishlist!");
        console.log("Removed from wishlist successfully");
      } else {
        console.error("Failed to remove from wishlist:", response.status);
          toast.error("Failed to remove from wishlist.");
      }
    } catch (error) {
      console.error(
        "Error removing from wishlist:",
        error.response?.data || error.message
      );
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      if (index < Math.floor(rating)) {
        return (
          <FaStar size={13.5} key={index} className="text-yellow-400 inline" />
        );
      } else if (index < rating && rating % 1 >= 0.5) {
        return (
          <FaStarHalfAlt
            size={13}
            key={index}
            className="text-yellow-400 inline"
          />
        );
      } else {
        return (
          <FaRegStar size={13} key={index} className="text-gray-300 inline" />
        );
      }
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden relative 
                    transition-all duration-800 ease-in-out sm:h-[455px] md:h-[420px] max-h-[455px] ${
                      border ? "rounded-2xl border border-gray-300" : ""
                    } `}
      style={{
        transform: border
          ? "translateY(0)"
          : isHovered
          ? "translateY(-5px)"
          : "translateY(0)",
        boxShadow: border
          ? isHovered
            ? "0 8px 20px rgba(0,0,0,0.07)"
            : "0 5px 5px rgba(0,0,0,0.03)"
          : "none",
        // maxHeight:"445px",
        // height: "445px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div
        className={`relative overflow-hidden border flex items-center justify-center 
                     ${border ? "mx-4 h-[315px] md:h-[290px] " : "h-[240px]"} mt-4 cursor-pointer`}
                style={{
                    // height: border ? "310px" : "240px",
                    backgroundColor: "#d4d9dd",
                    borderRadius: "12px",
                    borderColor: border ? "" : theme.colors.brand[1]
                }}
            >
                {/* Status Badge */}
                {product?.product_status && (
                    <div
                        className="absolute top-2 left-2 text-white px-2 py-[2px] rounded-2xl text-[10px] font-semibold z-10"
                        style={{ backgroundColor: "#ff69b4" }}
                    >
                        {product.product_status}
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
                            onClick={() => router.push(`/product/${product.slug}`)}
                        >
                            <Eye size={20} />
                        </IconButton>
                    </Tooltip>

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
                color: isInWishlist ? "#ff0000" : theme.colors.brand[7], // Red if in wishlist
                backgroundColor: theme.colors.brand[2],
                border: "1px solid #",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1) translateY(-4px)",
                  backgroundColor: theme.colors.brand[7],
                  color: "#ffffff",
                },
              }}
              onClick={
                isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist
              }
            >
              <Heart size={16} fill={isInWishlist ? "#ff0000" : "none"} />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Share"
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
            >
              <ShareWith modal={true} slug={product.slug} />
            </IconButton>
          </Tooltip>
        </div>

        {/* Product Image */}
        <Image
          src={
            isHovered
              ? product?.images?.[1]?.image ||
                product?.images?.[0]?.image ||
                logo
              : product?.images?.[0]?.image || logo
          }
          height={500}
          width={500}
          alt={product.name}
          className="h-auto object-fit-contain transition-transform duration-1000 ease-in-out"
          style={{
            transform: isHovered ? "scale(1.03)" : "scale(1)",
            borderRadius: "12px",
          }}
          onClick={() => router.push(`/product/${product.slug}`)}
        />
      </div>

      {/* Product Details */}
      <div className={`${!border ? "px-4" : "p-4"} bg-white`}>
        <div className={`flex flex-col ${!border ? "text-center" : ""}`}>
          {/* Category */}
          {border && (
            <p className="text-gray-500 text-xs">{product.category?.name}</p>
          )}

          {/* Product Name */}
          <h6
            className={`text-md font-semibold cursor-pointer text-gray-800 ${
              border ? "" : "mt-2"
            } mb-1
                            line-clamp-1 hover:text-[#e62e4d] transition-colors duration-300`}
            onClick={() => router.push(`/product/${product.slug}`)}
          >
            {product?.name}
          </h6>

                    {/* Rating */}
                    <div className={`flex ${!border ? "justify-center" : "items-center"} mb-2`}>
                        <div className="flex mr-2">{renderStars(product?.rating?.rating__avg || 0)}</div>
                        { product?.rating?.count > 0 && (
                            <span className="text-gray-500 text-xs">
                                ({product.rating.count} {product.rating.count === 1 ? "review" : "reviews"})
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className={`flex ${!border ? "justify-center items-baseline" : "items-center"}`}>
            <span className="font-semibold text-base mr-2" style={{ color: theme.colors.brand[7] }}>
              {product?.currency?.symbol || "AU$" }{product.stock?.price || 0.00}
            </span>
                        {product.stock?.mrp && product.stock?.mrp !== product.stock?.price && (
                            <span className="text-gray-500 text-sm line-through"> {product?.currency?.symbol || "AU$" }{product.stock?.mrp}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Add to Cart Button */}
            {border && (
                <div className="absolute bottom-4 right-4">
                    <div className="group relative">
                        <Tooltip
                            title={`${isInCart ? "In Cart" : "Add To Cart"}`}
                            placement="top"
                            arrow
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        backgroundColor: theme.colors.brand[7],
                                        fontSize: "9px",
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
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "scale(1.1) translateY(-4px)",
                                        backgroundColor: theme.colors.brand[7],
                                        color: "#ffffff",
                                    },
                                }}
                                onClick={handleAddToCart}
                            >
                                <HiOutlineShoppingBag size={20} />
                                {cartItems.find((item) => item.id === `${product.id}`)?.quantity && (
                                    <sup className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                      +{cartItems.find((item) => item.id === `${product.id}`)?.quantity}
                                    </sup>
                                )}
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDisplay;
