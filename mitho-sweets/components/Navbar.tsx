"use client";
import { FiShoppingCart, FiMenu, FiHeart } from "react-icons/fi";
import { AiFillHome } from "react-icons/ai";
import { FaInfoCircle, FaShoppingBag, FaPhone, FaUser } from "react-icons/fa";
import { MdArticle } from "react-icons/md";
import { IoMdPhonePortrait, IoIosSearch } from "react-icons/io";
import { SlEarphonesAlt } from "react-icons/sl";
import React, { useContext, useMemo, useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import {Drawer, Select, Button, Box, useMantineTheme, Text} from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { useCategories } from "@/lib/hooks/useCategory";
import CategoryDropdown from "@/components/CategoryDropdown";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import Cookies from "js-cookie";
import UserMenu from "@/components/userMenu/UserMenu";
import { useMaster } from "@/hooks/useMaster";
import CartContext from "@/context/CartContext";
import { UserIcon } from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import {ShareWith} from "@/components/ShareWith";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import apiClient from "@/axiosConfig";
import NoDataPage from "@/components/Error/NoDataPage";
import logo from "@/images/logo-bg.png";
import logo2 from "@/images/mithoSweetsBgRemoved.png";
import {useAuthModalContext} from "@/components/authModalProvider";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import {IconSearch} from "@tabler/icons-react";
import {FaArrowRight} from "react-icons/fa6";

const Header = () => {
  const { categories, isLoading } = useCategories();
  const [category, setCategory] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null); // Store category ID
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const { isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const { cartItems, removeFromCart, cartCount, wishCount, cartTotal } = useContext(CartContext);
  // const cartCount = cartContext?.cartCount || 0;
  // const wishCount = cartContext?.wishCount || 0;
  const theme = useMantineTheme();
  const { profiles } = useMaster();
  const [isCartHover, setIsCartHover] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // console.log("profiles",profiles)
  const {showLogin} = useAuthModalContext();

  const handleCartClick = () => {
    router.push('/cart');
  };
  const totalPrice = cartItems.reduce(
      (acc: number, item: { price: number; quantity: number; }) => acc + item.price * item.quantity,
      0
  );

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (selectedItem) {
      removeFromCart(selectedItem);
    }
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);

    const checkoutData = cartItems.map((item: { productId: any; stockId: any; quantity: any; }) => ({
      product: item.productId,
      stock: item.stockId,
      quantity: item.quantity
    }));

    try {
      const response = await apiClient.post('/checkout/cart/create/', checkoutData);
      if (response) {
        router.push('/cart/checkout');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const truncate = (text: any, limit: number, byWords = false) => {
    if (!text) return "";
    const str = String(text);
    return byWords
        ? str.split(" ").length > limit
            ? str.split(" ").slice(0, limit).join(" ") + "..."
            : str
        : str.length > limit
            ? str.slice(0, limit) + "..."
            : str;
  };

  const announcementBanners = useMemo(() => {
    return profiles?.flatMap((p) => p?.banners?.filter((b) => b?.banner_type === "ANN")) || [];
  }, [profiles]);

  const promoData = useMemo(() => {
    if (announcementBanners?.length > 0) {
      return announcementBanners?.map((banner) => ({
        id: banner?.id,
        text: banner?.title || "",
      }));
    }
    return [
      { id: 1, text: "Save 25% by ordering from our website!" },
      { id: 2, text: "Free shipping on orders over $50!" },
      { id: 3, text: "Special discount: Buy 2, Get 1 Free!" },
    ];
  }, [announcementBanners]);

  const [currentPromo, setCurrentPromo] = useState(promoData[0]);
  const [isVisible, setIsVisible] = useState(true);

  const mediaQueryStyles = `
@media (max-width: 776px) {
.third-section {
    display: none;
  }
.first-section {
    display: none;
  }
.sd-section {
    display: none;
  }
.show-mobile-776 {
    display: flex;
  }
}
@media (max-width: 776px) {
.show-mobile-776 {
    display: flex !important;
  }
}
@media (min-width: 777px) {
.show-mobile-776 {
    display: none !important;
  }
}
@media (min-width: 768px) {
.mantine-Select-input {
    width: 170px !important;
    height: 43px !important;
  }
}
@media (max-width: 1160px) {
.px-zero .first-section {
    padding-left: 40px;
    padding-right: 40px;
  }
.px-zero .second-section {
    padding-left: 40px;
    padding-right: 40px;
  }
.px-zero .third-section {
    padding-left: 40px;
    padding-right: 40px;
  }
}
@media (min-width: 776px) {
.second-section {
    position: sticky !important;
  }
}
@media (max-width: 776px) {
.second-section.sticky-mobile {
    position: fixed !important;
    top: 0;
    left: 0;
    z-index: 50;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    height: 56px;
  }
}
`;

  useEffect(() => {
    if (!promoData.length) return;
    let index = 0;
    setCurrentPromo(promoData[0]);
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        index = (index + 1) % promoData.length;
        setCurrentPromo(promoData[index]);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [promoData]);

  const handleLogout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    Cookies.remove("credentials");
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (categoryId && categorySlug) {
      queryParams.set("category", categorySlug);
      queryParams.set("id", categoryId);
    }

    if (searchQuery.trim()) {
      queryParams.set("query", searchQuery.trim());
    }

    const queryString = queryParams.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  };


  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const linkClasses = (path: string): string =>
      `hover:text-[${theme.colors.brand[7]}] transition-colors duration-200 ${
          pathname === path ? `text-red-500 font-semibold` : ""
      }`;

  return (
      <header className="flex flex-col bg-white border-b shadow-sm w-full">
        {/* First section */}
        <div className="first-section bg-orange-400 border-b-4 border-orange-500 text-white font-medium w-full"
        style={{backgroundColor: theme.colors.brand[7],
        borderColor: theme.colors.brand[5]}}>
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              {profiles ? profiles?.map((profile) => (
                      <div key={profile.id} className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="flex items-center gap-1">
                          <IoMdPhonePortrait/>
                          <span>{profile?.phone || "(0497 - 936 - 602)"}</span>
                        </div>
                        <span className="hidden sm:inline">|</span>
                        <span>
                    {profile.address
                        ? `${profile.address.street_address}, ${profile.address.suburb} ${profile.address.postcode} ${profile.address.state}`
                        : "Hercules Street, Ashfield 2131 NSW"}
                  </span>
                      </div>
                  )) :
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex items-center gap-1">
                      <IoMdPhonePortrait/>
                      <span>(0497 - 936 - 602)</span>
                    </div>
                    <span className="hidden sm:inline">|</span>
                    <span>
                        Hercules Street, Ashfield 2131 NSW
                  </span>
                  </div>
              }
            </div>


            {/* Promo Text */}
            <div
                className={`text-center sm:text-left transition-opacity duration-500 ease-in-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                }`}
            >
              {currentPromo.text}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 justify-center">
              {!isLoggedIn ? (
                  <Link href="/login">
                    <Button
                        className="px-3 py-1.5 bg-orange-400 hover:bg-orange-400 rounded text-white text-xs sm:text-sm flex items-center gap-1">
                    <UserIcon size={18} />
                      Log In / Sign Up
                    </Button>
                  </Link>
              ) : (
                 <></>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Second section */}
        <div
            className={`second-section w-full py-3 sm:py-4 flex items-center justify-between gap-4 sm:gap-6 ${
            isSticky ? "sticky top-0 bg-white z-40 sticky-mobile" : ""
          }`}
            style={{ borderBottomWidth: isSticky ? 3 : "", borderBottomColor: isSticky ? theme.colors.brand[5] : ""}}
        >
          <div className="max-w-7xl mx-auto px-1 sm:px-3 w-full">
            <div className="flex items-center justify-between gap-4 sm:gap-6 md:gap-8">
              {profiles ? profiles?.map((profile) => (
                      <Link key={profile.id} href="/"
                            className="flex text-xl sm:text-2xl md:text-3xl font-bold font-sans md:text-gray-800">
                        <Image
                            src={profile.profile_logo}
                            alt={"logo"}
                            width={45}
                            height={10}/>
                        <div className="flex items-center">
                          {profile.profile_name || "Mitho Sweets"}
                        </div>
                      </Link>
                  )) :
                  <Link href="/"
                        className="flex text-xl sm:text-2xl md:text-3xl font-bold font-sans md:text-gray-800">
                    <Image
                        src="/assets/logo-bg.png"
                        alt={"logo"}
                        width={45}
                        height={10}/>
                    <div className="flex items-center">
                      {"Mitho Sweets"}
                    </div>
                  </Link>
              }
              <div className="flex-1 w-full sd-section hidden md:flex items-center justify-center gap-2">
                {/* Dropdown */}
                {/*<Select*/}
                {/*    value={categoryId || null}*/}
                {/*    onChange={(value) => {*/}
                {/*      const selectedCategory: any = categories?.find((cat) => cat.id.toString() === value);*/}
                {/*      setCategoryId(value || null);*/}
                {/*      setCategorySlug(selectedCategory ? selectedCategory.slug : null);*/}
                {/*    }}*/}
                {/*    data={categories?.map((cat) => ({*/}
                {/*      value: cat.id.toString(),*/}
                {/*      label: cat.name,*/}
                {/*    }))}*/}
                {/*    placeholder="All Categories"*/}
                {/*    searchable*/}
                {/*    disabled={isLoading}*/}
                {/*    classNames={{*/}
                {/*      input:*/}
                {/*          "px-3 py-1.5 mt-3 text-sm sm:text-base font-medium rounded-sm bg-white border-b-2 border-gray-300 focus:border-b-2 focus:border-red-600 w-48 sm:w-56 md:w-64",*/}
                {/*    }}*/}
                {/*    clearable*/}
                {/*/>*/}
                <div className="relative " style={{ width: "28rem" }}>
                  <div className="flex items-end ">
                  <IconSearch size={28} style={{margin: 4, color: "gray"}}/>
                    <input
                        type="text"
                        value={searchQuery || ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter" && searchQuery.trim() !== "") {
                            handleSearch();
                          }
                        }}
                        placeholder="Search Products..."
                        name="search"
                        className="w-full pr-12 py-1.5 sm:py-2 rounded-sm border-0 focus:border-0 text-sm sm:text-base focus:outline-none"
                    />
                  </div>
                  <button
                      onClick={handleSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-red-500"
                      aria-label="Search"
                  >
                    <FaArrowRight size={20}/>
                  </button>
                  <hr className="border-t-4 border-gray-500"/>
                </div>

                {/*<Select*/}
                {/*    value={categoryId || null}*/}
                {/*    onChange={(value) => {*/}
                {/*      const selectedCategory: any = categories?.find((cat) => cat.id.toString() === value);*/}
                {/*      setCategoryId(value || null);*/}
                {/*      setCategorySlug(selectedCategory ? selectedCategory.slug : null);*/}
                {/*    }}*/}
                {/*    data={categories?.map((cat) => ({*/}
                {/*      value: cat.id.toString(),*/}
                {/*      label: cat.name,*/}
                {/*    }))}*/}
                {/*    placeholder="All Categories"*/}
                {/*    searchable*/}
                {/*    disabled={isLoading}*/}
                {/*    classNames={{*/}
                {/*      input:*/}
                {/*          "px-3 py-1.5 text-sm sm:text-base font-medium rounded-sm bg-white border-b-2 border-gray-300 focus:border-b-2 focus:border-red-600 w-48 sm:w-56 md:w-64",*/}
                {/*    }}*/}
                {/*    clearable*/}
                {/*/>*/}
                {/*  <div className="relative w-60 lg:w-96 hidden md:block">*/}
                {/*    <input*/}
                {/*        id="search"*/}
                {/*        type="text"*/}
                {/*        value={searchQuery}*/}
                {/*        onChange={(e) => setSearchQuery(e.target.value)}*/}
              {/*        onKeyDown={handleKeyDown}*/}
              {/*        placeholder=" "
              {/*        className="peer w-full pl-5 pr-12 py-1.5 sm:py-2 rounded-sm border border-gray-300 focus:border-b-2 focus:border-red-600 text-sm sm:text-base focus:outline-none"*/}
              {/*    />*/}
              {/*    <label*/}
              {/*        htmlFor="search"*/}
              {/*        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm transition-all */}
              {/*peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 */}
              {/*peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:text-red-600 bg-white px-1"*/}
              {/*    >*/}
              {/*      Search products...*/}
              {/*    </label>*/}
              {/*    <button*/}
              {/*        onClick={handleSearch}*/}
              {/*        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-orange-500"*/}
              {/*        aria-label="Search"*/}
              {/*    >*/}
              {/*      <IoIosSearch size={20}/>*/}
              {/*    </button>*/}
              {/*  </div>*/}
              </div>

              {/* Icons */}
              <span className="flex items-center hidden lg:flex  gap-3 flex-wrap">
                <SlEarphonesAlt/>{profiles ? profiles?.map((profile) => profile.hotline_number) : "123-456-789"}
              </span>
              <div className="flex items-center gap-3 lg:hidden">
                <Link
                    href={isLoggedIn ? "/shop/wishlist" : "#"}
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        showLogin();
                      }
                    }}
                    className="relative cursor-pointer"
                >
                  <FiHeart size={20} className="sm:w-6 sm:h-6"/>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {wishCount}
                  </span>
                </Link>
                <Link
                    href={isLoggedIn ? "/cart" : "#"}
                    className="relative cursor-pointer"
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      showLogin();
                    }
                  }}
              >
                <HiOutlineShoppingBag size={28} className="mb-1" />
                <span className="absolute -top-1 -right-0 bg-red-500 text-white text-xs rounded-full px-1">
                    {cartCount}
                  </span>
              </Link>
                {isLoggedIn && (
                    <div
                        className="rounded-full bg-red-700"
                        style={{
                          borderRadius:"100%",
                          overflow: "hidden",
                        }}
                    >
                      <UserMenu/>
                    </div>
                )}
            <div
                onClick={open}
                className="cursor-pointer show-mobile-776 hover:text-red-500 transition-colors duration-200 md:hidden ml-auto"
                role="button"
                aria-label="Open navigation menu"
            >
              <FiMenu size={20} className="sm:w-6 sm:h-6"/>
            </div>
                {profiles?.map((profile) => (
              <Drawer key={profile.id} opened={opened} onClose={close} position="right" size="xs" padding="md" title={profile.profile_name || "Mitho Sweets"}>
              <div className="flex flex-col gap-4 mt-4 font-medium text-base sm:text-lg">
                <div className="flex flex-col">
                  <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="mb-2 mt-3 px-4 pr-12 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-red-500"
                    aria-label="Search"
                  >
                    <IoIosSearch size={20} />
                  </button>
                </div>
                <div className="mt-3">
                    <CategoryDropdown forDrawer />
                  </div>
                    <div className={`flex items-center gap-3 hover:text-[${theme.colors.brand[7]}] mt-2 px-2 border-b py-3 cursor-pointer transition`}>
                    <AiFillHome className="text-lg sm:text-xl"/>
                    <Link href="/" onClick={close}>
                      Home
                    </Link>
                  </div>
                  <div className={`flex items-center gap-3 hover:text-[${theme.colors.brand[7]}] px-2 border-b py-3 cursor-pointer transition`}>
                    <FaInfoCircle className="text-lg sm:text-xl"/>
                    <Link href="/contact" onClick={close}>
                      About
                    </Link>
                  </div>
                  <div className={`flex items-center gap-3 hover:text-[${theme.colors.brand[7]}] px-2 border-b py-3 cursor-pointer transition`}>
                    <FaShoppingBag className="text-lg sm:text-xl"/>
                    <Link href="/shop" onClick={close}>
                      Shop
                    </Link>
                  </div>
                  <div className={`flex items-center gap-3 hover:text-[${theme.colors.brand[7]}] px-2 border-b py-3 cursor-pointer transition`}>
                    <MdArticle className="text-lg sm:text-xl"/>
                    <Link href="" onClick={close}>
                      Blog
                    </Link>
                  </div>
                  <div className={`flex items-center gap-3 hover:text-[${theme.colors.brand[7]}] px-2 border-b py-3 cursor-pointer transition`}>
                    <FaPhone className="text-lg sm:text-xl"/>
                    <Link href="/contact" onClick={close}>
                      Contact
                    </Link>
                  </div>
                  <div className={`flex items-center gap-3 hover:text-[${theme.colors.brand[7]}] px-2 border-b py-3 cursor-pointer transition`}>
                    <FaUser className="text-lg sm:text-xl"/>
                    {!isLoggedIn && (
                        <Link href="/login" onClick={close}>
                          <div>Log In/Sign Up</div>
                        </Link>
                    )}
                    {isLoggedIn && (
                        <div onClick={handleLogout}>
                          Log out
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-5">
                  <div>
                    {/*{!isLoggedIn && (*/}
                    {/*    <Link href="/login" onClick={close}>*/}
                    {/*      <div className="text-xs sm:text-sm hover:!text-gray-700"*/}
                    {/*           style={{ color: theme.colors.brand[7] }}>Log In/Sign Up</div>*/}
                    {/*    </Link>*/}
                    {/*)}*/}
                    {/*{isLoggedIn && (*/}
                    {/*    <div className="text-xs sm:text-sm cursor-pointer hover:!text-gray-700"*/}
                    {/*         style={{ color: theme.colors.brand[7] }} onClick={handleLogout}>*/}
                    {/*      Log out*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    <div className="flex text-xs sm:text-sm mt-1">
                      {profiles?.map((profile) => (
                          <div
                              className="flex items-center gap-1 hover:!text-gray-700"
                              style={{ color: theme.colors.brand[7] }}
                              key={profile.id}
                          > <span>
                              {profile.address
                                  ? `${profile.address.street_address}, ${profile.address.suburb} ${profile.address.postcode} ${profile.address.state}`
                                  : "Hercules Street, Ashfield 2131 NSW"}
                            </span>
                          </div>
                      ))}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      {profiles ? profiles?.map((profile) => (
                          <div
                              className="flex items-center gap-1 hover:!text-gray-700"
                              style={{ color: theme.colors.brand[7] }}
                              key={profile.id}
                          > <IoMdPhonePortrait/><span>{profile.phone_number || "(0497 - 936 - 602)"}</span>
                          </div>
                      )):
                          <div
                              className="flex items-center gap-1 hover:!text-gray-700"
                              style={{color: theme.colors.brand[7]}}
                          ><IoMdPhonePortrait/><span>0497 - 936 - 602</span>
                          </div>
                      }
                    </div>
                    <div className="text-xs text-gray-500 sm:text-sm mt-7">
                      Follow us
                    </div>
                    <div className="text-xs sm:text-sm mt-2">
                      <ShareWith/>
                    </div>
                  </div>
                </div>
              </div>
            </Drawer>
                    ))}
          </div>
          </div>
          </div>
        </div>

        {/* Third section */}
        {!opened && (
            <div
                className={`third-section w-full flex flex-col md:flex-row border-t p-3 sm:p-4 md:p-5 justify-between items-center gap-3 md:gap-6 ${
                    isSticky ? "fixed top-0 left-0 h-16 z-50 bg-white shadow-md border-b" : ""
              }`}
                style={{ borderBottomWidth: isSticky ? 3 : "", borderBottomColor: isSticky ? theme.colors.brand[5] : ""}}
            >
              <div className="max-w-7xl mx-auto px-2 sm:px-4 w-full">
                <div className="flex flex-wrap justify-between items-center gap-3 md:gap-6">
                  <div className="w-full md:w-auto">
                <CategoryDropdown/>
              </div>
                  <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 font-medium text-center">
                <Link href="/" className={linkClasses("/") + " text-xs sm:text-sm md:text-base"}>
                  Home
                </Link>
                <Link href="/about" className={linkClasses("/about") + " text-xs sm:text-sm md:text-base"}>
                  About
                </Link>
                <Link href="/shop" className={linkClasses("/shop") + " text-xs sm:text-sm md:text-base"}>
                  Shop
                </Link>
                <Link href="/blog" className={linkClasses("/blog") + " text-xs sm:text-sm md:text-base"}>
                  Blog
                </Link>
                <Link href="/contact" className={linkClasses("/contact") + " text-xs sm:text-sm md:text-base"}>
                  Contact
                </Link>
              </div>
              <div className="flex items-center gap-4 sm:hidden !md:hidden lg:flex text-xs sm:text-sm md:text-base">
                <Link href="/shop/wishlist" className="relative cursor-pointer"
                      onClick={(e) => {
                        if (!isLoggedIn) {
                          e.preventDefault();
                          showLogin();
                        }
                      }}
                >
                  <FiHeart size={20} className="sm:w-6 sm:h-6"/>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                   {wishCount}
          </span>
                </Link>
                <div
                    className="relative cursor-pointer"
                    onClick={handleCartClick}
                    onMouseEnter={() => setIsCartHover(true)}
                    onMouseLeave={() => setIsCartHover(false)}
                >
                  <HiOutlineShoppingBag size={28} className="mb-1"/>
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {cartCount}
                  </span>
                  <ConfirmationModal
                      opened={modalOpen}
                      onClose={handleModalClose}
                      onConfirm={handleModalConfirm}
                      title="Remove Item"
                      message={`Are you sure you want to remove ${selectedItem?.name} from your cart?`}
                  />
                  {isCartHover && (
                      <div
                          className="border"
                          onClick={(e) => e.stopPropagation()}
                      >
                      <div
                          className="absolute p-5 mr-20  w-[350px] bg-white border rounded-md shadow-lg z-50 transition-all duration-300 ease-in-out overflow-hidden"
                          style={{
                            top: 35,
                            right: -100,
                            opacity: isCartHover ? 1 : 0,
                            transform: isCartHover ? 'translateY(0)' : 'translateY(20px)'
                          }}
                      >
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-semibold">Cart</span>
                          <span className="text-sm text-gray-500">{cartCount} items</span>
                        </div>
                          <div className="max-h-[350px] overflow-y-auto">
                            {cartItems?.length > 0 ? (
                                cartItems.slice(0, 7).map((item: { id: React.Key | null | undefined; image: any; name: string; symbol: string | symbol | any; quantity: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; price: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
                            <div key={item.id} className="flex items-center justify-between py-2">
                              <Image
                                  src={item.image?.image || logo2}
                                    alt={item.name || "none"}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 object-cover"
                                />
                              <div className="flex-1 ml-2">
                  <span className="block text-lg" style={{ color: theme.colors.brand[5] }}>
                    {truncate(item?.name, 25)}
                  </span>
                                <span className="block text-md text-gray-500">
                    {item?.quantity} x <span className="text-lg font-bold" style={{ color: theme.colors.brand[7] }}>
                      {item?.symbol || "AU$"}{item.price}
                    </span>
                  </span>
                              </div>
                                <button
                                    className="text-gray-500 text-xl hover:text-gray-700"
                                    onClick={() => handleDeleteClick(item)}
                                >
                                  &times;
                                </button>
                            </div>
                                ))
                            ) : (
                                  <Box pos={"relative"}
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "30vh",
                                        textAlign: "center",
                                        // padding: "20px",
                                      }}
                                  >
                                    <Image src={logo} alt="Logo" width={100} height={100} />
                                    <Text size="xl" mt="md">
                                      {"Your cart is empty."}
                                    </Text>

                                  </Box>
                            )}
                          </div>
                        <div className="flex justify-between mt-2 pt-2 border-t">
                          <span className="font-semibold text-lg text-gray-500">Total</span>
                          <span className="font-bold text-lg" style={{ color: theme.colors.brand[7] }}>
            {"AU$"} {totalPrice}
            </span>
                        </div>
                        <div className="flex justify-between flex-wrap mt-2">
                          <Link href="/cart">
                            <Button variant="outline" size="md" className="text-sx py-1 rounded">
                              View cart
                            </Button>
                          </Link>
                            <Button
                                size="md"
                                className="text-white text-sx py-1 rounded ml-2"
                                onClick={(e) => {
                                  if (!isLoggedIn) {
                                    e.preventDefault();
                                    showLogin();
                                  } else{
                                    handleCheckout();
                                  }
                                }}
                                // onClick={handleCheckout}
                                loading={checkoutLoading}
                            >
                            Checkout
                          </Button>
                          </div>
                        </div>
                      </div>
                  )}
                </div>
                {isLoggedIn && (
                        <div
                            className="rounded-full bg-red-700"
                            style={{
                      borderRadius:"100%",
                              overflow: "hidden",
                            }}
                        >
                      <UserMenu/>
                    </div>
                )}
                  </div>
                </div>
              </div>
            </div>
        )}
        <style jsx>{mediaQueryStyles}</style>
      </header>
  );
};

export default Header;