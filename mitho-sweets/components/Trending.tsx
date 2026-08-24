"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { Rating } from "@mantine/core";
import { ProductProps } from "@/DataTypes/Products/ProductProps";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import apiClient from "@/axiosConfig";
import ProductDisplay from "@/components/ProductDisplay";
import NoDataPage from "@/components/Error/NoDataPage";

const Trending = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<ProductProps["result"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false)

  // Function to fetch products based on category
  const fetchProducts = async (category: string) => {
    try {
      setIsLoading(true)
      let endpoint = "/product/list"; // Default endpoint for "All"
      if (category === "Featured") {
        endpoint = "/product/list/?product_status=Featured"; // Endpoint for Featured products
      } else if (category === "Best Selling") {
        endpoint = "/product/list/?product_status=Featured"; // Endpoint for Best Selling products
      }

      const response = await apiClient.get<ProductProps>(endpoint);
      setProducts(response.data.result); // Extract the result array
      console.log("data", response.data.result);
    } catch (error) {
      console.error(`Error fetching ${category} products:`, error);
      // Fallback to dummy data (ensure trending matches result structure)
      // setProducts(trending || trending);
    }
    finally {
      setIsLoading(false);
    }
  };

  // Handle category change and fetch products
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    fetchProducts(category); // Fetch products for the selected category
  };


  // Fetch products on initial render
  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]); // Empty dependency array for initial fetch

  // Reusable function to determine button styles
  const getButtonStyle = (category: string) =>
      `md:text-lg text-sm text-center mb-10 text-[#444] px-4 py-2 rounded-sm font-medium 
      transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:text-white hover:bg-red-700 ${
          activeCategory === category ? "bg-red-700 text-white" : "bg-[#eeeeee]"
      }`;

  const renderButton =()=>{
    return(
    <div className="flex gap-3 justify-between items-center">
      <div className="flex flex-wrap justify-start gap-2 md:gap-4">
        <button
            className={getButtonStyle("All")}
            onClick={() => handleCategoryChange("All")}
        >
          All
        </button>
        <button
            className={getButtonStyle("Featured")}
            onClick={() => handleCategoryChange("Featured")}
        >
          Featured
        </button>
        <button
            className={getButtonStyle("Best Selling")}
            onClick={() => handleCategoryChange("Best Selling")}
        >
          Best Selling
        </button>
      </div>
      <div className="flex justify-end items-center hidden sm:inline">
        <Link
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            href="/shop"
            className="md:text-xl text-sm border-b font-medium mb-8 hover:text-red-400 flex items-center"
        >
          View More{" "}
          <MdOutlineKeyboardDoubleArrowRight
              className={`transition-transform duration-700 ease-in-out ${isHovered ? "translate-x-1" : "translate-x-0"}`}
          />
        </Link>
      </div>
    </div>
    )
  }
const loader=()=>{

  if (isLoading) {
    return <div
        style={{
          display:"flex",
          height:"60vh",
          alignItems:"center",
          justifyContent:"center"
        }}
    ><MithoSweetsLoader/></div>;
  }
}

  return (
      <div className="py-10 w-full">

        {renderButton()}
        {loader()}


          {products?.length?
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">{
            products.slice(0, 8).map((product) => (
                <ProductDisplay key={product.id} product={product} border={true} isWish={product.is_bookmarked}/>
            ))}

              </div>
              :
              <div className="h-50">


            <NoDataPage msg={"No Data Available Right Now"} height={"50vh"} />
              </div>
          }
      </div>
  );
};

export default Trending;