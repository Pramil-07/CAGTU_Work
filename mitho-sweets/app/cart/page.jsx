"use client";
import React, {useContext, useEffect, useState} from "react";
// import Image from "next/image";
import Link from "next/link";
import CartContext from "../../context/CartContext";
import apiClient from "../../axiosConfig";
import {useRouter} from "next/navigation";
import {LuTrash2} from "react-icons/lu";
import Image from "next/image";
import MithoSweetsLoader from "../../components/Loader/MithoSweetsLoader";
import {Box, Center, Container, useMantineTheme, Button, Loader} from "@mantine/core";
import NoDataPage from "../../components/Error/NoDataPage";
import {HiOutlineFingerPrint} from "react-icons/hi";
import {Shuffle} from "lucide-react";
import {LiaBoxSolid} from "react-icons/lia";
import {HiOutlineShoppingBag} from "react-icons/hi2";
import logo from "../../images/mithoSweetsBgRemoved.png";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {useAuth} from "../../lib/AuthContext";
import {useAuthModalContext} from "../../components/authModalProvider";
import BreadCrumbs from "../../components/common/BreadCrumbs";
import {toast} from "@/components/common/Toast";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";
import {useMaster} from "../../hooks/useMaster.ts";

const Page = () => {
  const { cartItems, removeFromCart, clearCart, addFromInput } = useContext(CartContext);
    const [isLoading, setIsLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const theme = useMantineTheme()
    const { isLoggedIn, logout } = useAuth();
    const {showLogin} = useAuthModalContext();
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const { profiles} = useMaster();

    console.log("Cart product was", cartItems);
    const router = useRouter();
  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
    console.log("totalPrice",totalPrice)



    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setModalType("item");
        setModalOpen(true);
    };

    const handleClearCartClick = () => {
        setModalType("clear");
        setModalOpen(true);
    };

    const handleModalConfirm = () => {
        if (modalType === "item" && selectedItem) {
            removeFromCart(selectedItem);
            toast.success(`${selectedItem.name} removed from cart`);
        } else if (modalType === "clear") {
            clearCart();
            toast.success("All items removed from cart");
        }
        setModalOpen(false);
        setSelectedItem(null);
        setModalType(null);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedItem(null);
        setModalType(null);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showLogin({
                onSuccess: async () => {
                    await handleCheckout();
                },
            });
            return;
        }
        setCheckoutLoading(true);

        const checkoutData = cartItems.map(item => ({
            product: item.productId,
            stock: item.stockId,
            quantity: item.quantity
        }));

        try {
            const response = await apiClient.post('/checkout/cart/create/',(checkoutData),
            );
            if (response) {
                toast.success("Checkout initiated successfully!");
                router.push('/cart/checkout');
            } else {
                // console.error('Checkout failed:',);
                // alert('Checkout failed. Please try again.');
                toast.error("Checkout failed. Please try again.");
            }
            console.log("checkout data:",response)
        } catch (error) {
            console.error('Error during checkout:', error);
            // alert('An error occurred during checkout. Please try again.');
            toast.error("An error occurred during checkout. Please try again.");
        }finally {
            setCheckoutLoading(false);
        }
    };
    useEffect(() => {
        const fetchDeliveryCharge = async () => {
            try {
                const response = await apiClient.post('/payment/deliverycharge/', {
                    order_total: totalPrice
                });
                console.log("order_total",order_total)
                if (response.data && response.data.delivery_charge) {
                    setShippingCost(response.data.delivery_charge);
                }
            } catch (error) {
                // console.error('Error fetching delivery charge:', error);
                // toast.error("Failed to fetch delivery charge");
            }
        };
        fetchDeliveryCharge();
    }, [totalPrice]);
  return (
      <div>
      <div className="w-full bg-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-5">
              <BreadCrumbs
                  currentTitle="Shooping Cart"
                  items={[{name: "Shop", href: "/shop"}]}
              />
          </div>
      </div>
    <div className="max-w-6xl mx-auto p-6 bg-white w-full page-container">
      <div className="flex items-center justify-center mb-4">
        <h1 className="text-2xl font-bold ml-2">Shopping Cart</h1>
      </div>
        <ConfirmationModal
            opened={modalOpen}
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
            title={modalType === "item" ? "Remove Item" : "Clear Cart"}
            message={
                modalType === "item"
                    ? `Are you sure you want to remove ${selectedItem?.name} from your cart?`
                    : "Are you sure you want to clear all items from your cart?"
            }
        />
        {isLoading ? (
            <Box
                style={{
                    minHeight: "100vh",
                }}
            >
                <Container size="xl" py="xl" className="flex justify-center items-center min-h-[80lvh]">
                    <Center>
                        <MithoSweetsLoader />
                    </Center>
                </Container>
            </Box>
        ) : (
            <div>
                {cartItems?.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                <tr className="border-t">
                                    <th className="p-2 font-semibold text-left w-[100px]">Image</th>
                                    <th className="p-2 font-semibold text-center w-[25%]">Name</th>
                                    <th className="p-2 font-semibold text-center w-[15%]">Price</th>
                                    <th className="p-2 font-semibold text-center w-[15%]">Quantity</th>
                                    <th className="p-2 font-semibold text-right w-[15%]">Subtotal</th>
                                    <th className="p-2 font-semibold text-center w-[10%]">Remove</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cartItems?.map((item, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="p-2">
                                            <Image
                                                src={item?.image?.image || logo}
                                                alt={logo}
                                                width={70}
                                                height={70}
                                                className="w-[70px] h-[70px] rounded-sm"
                                                style={{backgroundColor: "#eceeef",}}
                                            />
                                        </td>
                                        <td className="p-2 align-middle text-center">
                      <span
                          className="font-medium"
                          style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color:theme.colors.brand[7],
                          }}
                      >
                        {item.name}
                      </span>
                                            {item.size && (
                                                <span className="text-sm text-gray-600">
                          {" "}
                                                    - ({item.size} {item.size_unit})
                        </span>
                                            )}
                                            <br />
                                            {item.color && (
                                                <span className="text-sm text-gray-600">
                          {" "}
                                                    - Color: {item.color}
                                                    <span
                                                        className="inline-block ml-1 -mb-1 w-5 h-5 rounded-xl border"
                                                        style={{ backgroundColor: item.color }}
                                                    ></span>
                        </span>
                                            )}
                                        </td>
                                        <td className=" text-center">{item?.symbol || "AU$"}{item?.price}</td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-12 h-9 text-center border rounded-md"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        addFromInput(item, parseInt(e.target.value));
                                                        toast.info(`${item.name} quantity updated`);
                                                    }}
                                                    min="1"
                                                    style={{
                                                        appearance: "auto",               // ensures default arrows appear
                                                        WebkitAppearance: "number-input", // force Chrome/Safari to show arrows
                                                        MozAppearance: "number-input",    // Firefox support (optional)
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-2 text-right">{item?.symbol}{(item.price * item.quantity).toFixed(2)}</td>
                                        <td className="p-2 text-center">
                                            <button
                                                className="text-gray-500 hover:text-gray-700 hover:scale-105"
                                                onClick={() => handleDeleteClick(item)}
                                            >
                                                <LuTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t">
                                    <td colSpan="6" className="p-2">
                                        <div className="flex justify-end items-center">
                      {/*<span className="text-md font-semibold">*/}
                      {/*  Total: ${totalPrice.toFixed(2)}*/}
                      {/*</span>*/}
                                            <button
                                                onClick={handleClearCartClick}
                                                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
                                            >
                                                <span className="mr-1 mb-0.5 text-xl">×</span> Clear Cart
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="text-right mt-4 flex items-center justify-end">
                            <div className="flex gap-2">
                                <Button
                                    component={Link}
                                    href="/shop"
                                    sx={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: 400,
                                    }}
                                    leftSection={
                                        isLoading ? (
                                            <Loader size={16} color="white" />
                                        ) : null
                                    }
                                >
                                   <HiOutlineShoppingBag size={18}/>&nbsp; {isLoading ? 'Loading...' : 'Continue Shopping'}
                                </Button>
                                <Button onClick={handleCheckout} loading={checkoutLoading}
                                        className="w-full text-white py-2 rounded transition-colors bg-green-700">
                                    <LiaBoxSolid size={20}/>&nbsp; Proceed to Checkout
                                </Button>
                            </div>
                        </div>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex flex-col items-center justify-center md:-space-y-0.5">
                                <div className="w-full border-t" style={{borderColor: theme.colors.brand[1]}}></div>
                                <div className="w-full border-t" style={{borderColor: theme.colors.brand[1]}}></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-2 bg-white text-gray-400"><HiOutlineFingerPrint size={20}/></span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Calculate Shipping</h3>
                                    <button
                                        onClick={() => setShowShippingForm(!showShippingForm)}
                                        // className={`hover:text-[${theme.colors.brand[9]}]`}
                                        style={{color:theme.colors.brand[5]}}
                                    >
                                        {showShippingForm ? <FaAngleUp /> : <FaAngleDown />}
                                    </button>

                                </div>
                                <span>Flat rate: <span style={{color: theme.colors.brand[7]}}>5% </span></span>
                                {showShippingForm && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <select className="w-full p-2 border rounded text-sm sm:text-base">
                                                <option>Choose a option...</option>
                                                <option>{profiles?.[0]?.address?.country}</option>
                                            </select>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded text-sm sm:text-base"
                                                placeholder="State / Country"
                                                value={profiles?.[0]?.address?.state || ""}
                                                readOnly
                                            />
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded text-sm sm:text-base"
                                                placeholder="PostCode / ZIP"
                                                value={profiles?.[0]?.address?.postcode || ""}
                                                readOnly
                                            />
                                        </div>

                                        <Button><Shuffle size={16}/>&nbsp; Update</Button>
                                    </>
                                )}
                            </div>
                            <div className="border p-3">
                                <h3 className="text-lg font-medium">Cart Totals</h3>
                                <table className="w-full mt-2 border border-gray-300 border-collapse">
                                    <tbody>
                                    <tr>
                                        <td className="py-1 px-2 border border-gray-300">Cart Subtotal</td>
                                        <td className="text-right font-bold py-1 px-2 border border-gray-300" style={{color: theme.colors.brand[7]}}>${totalPrice.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 px-2 border border-gray-300">Shipping</td>
                                        <td className="text-right py-1 px-2 border border-gray-300">${shippingCost.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 px-2 border border-gray-300">Total</td>
                                        <td className="text-right font-bold py-1 px-2 border border-gray-300" style={{color: theme.colors.brand[7]}}>${(totalPrice + shippingCost).toFixed(2)}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <NoDataPage msg={"No items were found on you Cart"}/>
                )}
            </div>
        )}
    </div>
      </div>
  );
};

export default Page;
