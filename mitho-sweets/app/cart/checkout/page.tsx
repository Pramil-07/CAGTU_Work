"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import apiClient from "@/axiosConfig";
import StripeCheckoutForm from "@/components/payment/StripeCheckout";
import { Elements } from '@stripe/react-stripe-js';
import { useRouter } from "next/navigation";
import { Box, Button, Center, Container, useMantineTheme, Modal, ActionIcon } from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import Error from "@/components/Error/Error";
import logo from "@/images/mithoSweetsBgRemoved.png";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import { Tag } from "lucide-react";
import { stripePromise } from "@/styles/Stripe";
import CartContext from "@/context/CartContext";
import { useUser } from "@/hooks/useUser";
import { IconChevronRight } from "@tabler/icons-react";
import { Tooltip } from "@mui/material";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {toast} from "@/components/common/Toast";

interface CartItem {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  stock_image: string;
  product_price: number;
}

interface CartResponse {
  status: string;
  data: CartItem[];
  cart_total : number;
  delivery_charge: number;
  final_total: number;
}

interface DeliveryAddress {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  country: string;
  state: string;
  city: string;
  street_address: string;
  company_name?: string | null;
  postal_code?: string | null;
  delivery_option?: string | null;
  user?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  slug: string;
  logo: string;
  thumbnail: string;
}

const Page = () => {
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useContext(CartContext);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [cartLoading, setCartLoading] = useState<boolean>(true);
  const [addressLoading, setAddressLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const theme = useMantineTheme();
  const brandColor = theme.colors.brand[7];
  const { user } = useUser();
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    email: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    country: "",
    state: "",
    city: "",
    street_address: "",
    company_name: "",
    postal_code: "",
    delivery_option: "",
  });
  const [existingAddress, setExistingAddress] = useState<DeliveryAddress[]>([]);
  const [isAddressModified, setIsAddressModified] = useState<boolean>(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [isAddressListVisible, setIsAddressListVisible] = useState(false);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [finalTotal, setFinalTotal] = useState<number>(0);
  const handleClearAddress = () => {
    setDeliveryAddress({
      email: "",
      first_name: "",
      last_name: "",
      contact_number: "",
      country: "",
      state: "",
      city: "",
      street_address: "",
      company_name: "",
      postal_code: "",
      delivery_option: "",
    });
    setIsAddressModified(true);
    setFieldErrors({});
  };

  useEffect(() => {
    const fetchCartData = async () => {
      setCartLoading(true);
      try {
        const response = await apiClient.get('/checkout/cart/');
        const result: CartResponse = response.data;
        if (result.status === 'success' && Array.isArray(result.data)) {
          setCartItems(result.data);
          const total = result.data.reduce((sum, item) => sum + item.total_price, 0);
          setTotalPrice(total); // Keep this for reference if needed
          setCartTotal(result.cart_total); // New state for cart_total
          setDeliveryCharge(result.delivery_charge); // New state for delivery_charge
          setFinalTotal(result.final_total);
        } else {
          setError('Failed to fetch cart data: Invalid response');
          console.error('Invalid cart response:', result);
        }
      } catch (err) {
        setError('Error fetching cart data. Please try again.');
        console.error('Cart fetch error:', err);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartData();
  }, []);

  useEffect(() => {
    const fetchDeliveryAddress = async () => {
      setAddressLoading(true);
      try {
        const response = await apiClient.get('/checkout/delivery-address/');
        if (Array.isArray(response.data.data)) {
          setExistingAddress([...response.data.data]);
          console.log("data",response)
        } else {
          setExistingAddress([]);
          console.log("data",response)
        }
      } catch (err) {
        console.error('Address fetch error:', err);
        setExistingAddress([]);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchDeliveryAddress();
  }, []);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await apiClient.get('/payment/method/');
        if (response.data && Array.isArray(response.data)) {
          setPaymentMethods(response.data);
        } else {
          setError('Failed to fetch payment methods: Invalid response');
          console.error('Invalid payment methods response:', response.data);
        }
      } catch (err) {
        setError('Error fetching payment methods. Please try again.');
        console.error('Payment methods fetch error:', err);
      }
    };

    fetchPaymentMethods();
  }, []);

  const validateAddress = (address: DeliveryAddress): { isValid: boolean; errors: { [key: string]: string } } => {
    const errors: { [key: string]: string } = {};
    if (!address.email) errors.email = "Field email is required *";
    if (!address.first_name) errors.first_name = "Field First Name is required *";
    if (!address.last_name) errors.last_name = "Field last Name is required *";
    if (!address.country) errors.country = "Field Country is required *";
    if (!address.state) errors.state = "Field State is required *";
    if (!address.city) errors.city = "Field City is required *";
    if (!address.street_address) errors.street_address = "Field Street Address is required *";
    if (!address.contact_number) errors.contact_number = "Field Contact Number is required *";
    if (!address.postal_code) errors.postal_code = "Field Postal Code is required *";
    return { isValid: Object.keys(errors)?.length === 0, errors };
  };
  const handleSaveAddress = async () => {
    const { isValid, errors } = validateAddress(deliveryAddress);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    try {
      setActionLoading(true);
      setContactError(null);
      setFieldErrors({});
      // Include user ID in the payload if available
      const payload = { ...deliveryAddress, user: user?.id || undefined };
      const response = await apiClient.post('/checkout/delivery-address/', payload);
      if (response.data.status === 'success') {
        toast.success("Address saved successfully!");
        // Re-fetch addresses only on success
        const fetchResponse = await apiClient.get('/checkout/delivery-address/');
        if (Array.isArray(fetchResponse.data.data)) {
          setExistingAddress([...fetchResponse.data.data]);
        } else {
          setExistingAddress([]);
          console.warn("fetchDeliveryAddress after save: response.data.data is not an array", fetchResponse.data);
        }
        handleClearAddress(); // Clear form only on success
      } else {
        // Map backend error messages to fieldErrors
        const backendErrors = response.data.message || {};
        const mappedErrors: { [key: string]: string } = {};
        Object.keys(backendErrors).forEach((key) => {
          if (Array.isArray(backendErrors[key]) && backendErrors[key]?.length > 0) {
            mappedErrors[key] = backendErrors[key][0]; // Use the first error message
          }
        });
        setFieldErrors(mappedErrors);
        if (Object.keys(mappedErrors)?.length === 0) {
          setContactError('Error saving address. Please check your details and try again.');
        }
      }
    } catch (err: any) {
      setContactError(err.response?.data?.message || 'Error saving address. Please try again.');
      toast.error(err.response?.data?.message || 'Error saving address. Please try again.');
      console.error('Save address error:', err);
    } finally {
      setActionLoading(false);
    }
  };


  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      setContactError("Please select a payment method");
      return;
    }

    if (cartItems?.length === 0) {
      setContactError("Your cart is empty");
      return;
    }

    setActionLoading(true);
    setContactError(null);
    setFieldErrors({});
    try {
      let payload;
      if (!isAddressModified && existingAddress?.length > 0) {
        const selectedAddress = existingAddress.find(
            (addr) => addr.email === deliveryAddress.email
        );
        if (selectedAddress?.id) {
          payload = { delivery_address_id: selectedAddress.id };
        } else {
          setContactError("No valid saved address selected");
          setActionLoading(false);
          return;
        }
      } else {
        const { isValid, errors } = validateAddress(deliveryAddress);
        if (!isValid) {
          setFieldErrors(errors);
          setActionLoading(false);
          return;
        }
        payload = { delivery_data: deliveryAddress };
      }

      const paymentResponse = await apiClient.post(`/payment/intent/${selectedPaymentMethod}/`, payload);
      if (selectedPaymentMethod === 'stripe' && paymentResponse.data?.data?.client_secret) {
        const clientSecret = paymentResponse.data.data.client_secret;
        if (!clientSecret.startsWith('pi_')) {
          setContactError('Invalid client secret received from server.');
          console.error('Invalid client_secret:', clientSecret);
          setActionLoading(false);
          return;
        }
        setStripeClientSecret(clientSecret);
        setStripeModalOpen(true);
        toast.success("Stripe payment initialized successfully!");
      } else if (paymentResponse.data?.data?.links?.[1]?.href) {
        window.location.href = paymentResponse.data.data.links[1].href;
        toast.success("Redirecting to payment gateway...");
      } else if (selectedPaymentMethod === 'cod') {
        toast.success("successfully! ordered the items, Redirecting to... ");
        window.location.href = ("/payment-success");
      } else {
        setContactError('Invalid payment response. Please try again.');
        console.error('Invalid payment response:', paymentResponse.data);
        toast.error('Invalid payment response. Please try again.');
      }
    } catch (err: any) {
      setContactError(err.response?.data?.message || 'Error processing payment. Please check your payment details and try again.');
      toast.error(err.response?.data?.message || 'Error processing payment. Please check your payment details and try again.');
      console.error('Payment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (cartLoading && addressLoading) {
    return (
        <Box style={{ minHeight: "50vh" }}>
          <Container size="xl" py="xl" className="flex justify-center items-center min-h-[50lvh]">
            <Center><MithoSweetsLoader /></Center>
          </Container>
        </Box>
    );
  }

  if (error) {
    return <Error />;
  }

  return (
      <div>
      <div className="w-full bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-5">
          <BreadCrumbs
              currentTitle="Checkout"
              items={[{name: "Cart", href: "/cart"}]}
          />
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Section - Billing Details and Form */}
        <div className="w-full lg:w-1/2 bg-white rounded-md">
          <h2 className="text-xl md:text-2xl font-medium mb-4">Billing Details</h2>
          {existingAddress?.length > 0 ? (
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">Your Saved Addresses</h4>
                  {existingAddress?.length > 2 && (
                      <>
                  <Tooltip
                      title={isAddressListVisible ? "Hide addresses" : "Show addresses"}
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
                    <ActionIcon
                        variant="transparent"
                        onClick={() => setIsAddressListVisible((prev: any) => !prev)}
                        aria-label={isAddressListVisible ? "Show less" : "Show more"}
                    >
                      <IconChevronRight
                          style={{
                            color: theme.colors.brand[7],
                            transform: isAddressListVisible ? "rotate(270deg)" : "rotate(90deg)",
                            transition: "transform 0.2s",
                          }}
                      />
                    </ActionIcon>
                  </Tooltip>
                      </>
                      )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {existingAddress.slice(0, isAddressListVisible ? undefined : 2).map((address) => (
                      <div
                          key={address.id}
                          className="relative border rounded-md p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm mb-2"
                          onClick={() => {
                            setDeliveryAddress({
                              email: address.email || "",
                              first_name: address.first_name || "",
                              last_name: address.last_name || "",
                              contact_number: address.contact_number || "",
                              country: address.country || "",
                              state: address.state || "",
                              city: address.city || "",
                              street_address: address.street_address || "",
                              company_name: address.company_name || "",
                              postal_code: address.postal_code || "",
                              delivery_option: address.delivery_option || "",
                            });
                            setIsAddressModified(false);
                            setFieldErrors({});
                          }}
                      >
                        <input
                            type="radio"
                            className="absolute top-2 right-2 h-4 w-4 text-red-700 focus:ring-red-700"
                            checked={!isAddressModified && deliveryAddress.email === address.email}
                            onChange={() => {
                              setDeliveryAddress({
                                email: address.email || "",
                                first_name: address.first_name || "",
                                last_name: address.last_name || "",
                                contact_number: address.contact_number || "",
                                country: address.country || "",
                                state: address.state || "",
                                city: address.city || "",
                                street_address: address.street_address || "",
                                company_name: address.company_name || "",
                                postal_code: address.postal_code || "",
                                delivery_option: address.delivery_option || "",
                              });
                              setIsAddressModified(false);
                              setFieldErrors({});
                            }}
                        />
                        <p className="text-gray-600">{address.first_name} {address.last_name}</p>
                        <p className="text-gray-600">{address.street_address}, {address.city}</p>
                        <p className="text-gray-600">{address.email}, {address.contact_number}</p>
                      </div>
                  ))}
                </div>
                {existingAddress?.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No saved address found. Please enter your details below.</p>
                )}
              </div>
          ) : (
              <p className="text-sm text-gray-500">No saved address found. Please enter your details below.</p>
          )}
          <form className="space-y-4">
            <FloatingLabelInput
                label="First name"
                placeholder="First name"
                value={deliveryAddress.first_name || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, first_name: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, first_name: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="first_name"
                className={fieldErrors.first_name ? "border-red-500" : ""}
                error={fieldErrors.first_name}
            />
            <FloatingLabelInput
                label="Last name"
                placeholder="Last name"
                value={deliveryAddress.last_name || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, last_name: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, last_name: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="last_name"
                className={fieldErrors.last_name ? "border-red-500" : ""}
                error={fieldErrors.last_name}
            />
            <FloatingLabelInput
                label="Company Name"
                placeholder="Company Name"
                value={deliveryAddress.company_name || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, company_name: value || "" }));
                  setIsAddressModified(true); // Add this
                }}
                name="company_name"
            />
            <FloatingLabelInput
                label="Country"
                placeholder="Country"
                value={deliveryAddress.country || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, country: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, country: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="country"
                className={fieldErrors.country ? "border-red-500" : ""}
                error={fieldErrors.country}
            />
            <FloatingLabelInput
                label="City/Town"
                placeholder="City/Town"
                value={deliveryAddress.city || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, city: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, city: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="city"
                className={fieldErrors.city ? "border-red-500" : ""}
                error={fieldErrors.city}
            />
            <FloatingLabelInput
                label="State"
                placeholder="State"
                value={deliveryAddress.state || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, state: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, state: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="state"
                className={fieldErrors.state ? "border-red-500" : ""}
                error={fieldErrors.state}
            />
            <FloatingLabelInput
                label="Address"
                placeholder="Address"
                value={deliveryAddress.street_address || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, street_address: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, street_address: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="street_address"
                className={fieldErrors.street_address ? "border-red-500" : ""}
                error={fieldErrors.street_address}
            />
            <FloatingLabelInput
                label="Postcode/ZIP"
                placeholder="Postcode/ZIP"
                value={deliveryAddress.postal_code || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, postal_code: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, postal_code: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="postal_code"
                className={fieldErrors.postal_code ? "border-red-500" : ""}
                error={fieldErrors.postal_code}
            />
            <FloatingLabelInput
                label="Contact Number"
                placeholder="+990942342"
                value={deliveryAddress.contact_number || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, contact_number: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, contact_number: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="contact_number"
                className={fieldErrors.contact_number ? "border-red-500" : ""}
                error={fieldErrors.contact_number}
            />
            <FloatingLabelInput
                label="Email address"
                placeholder="Email address"
                value={deliveryAddress.email || ""}
                onChange={(value) => {
                  setDeliveryAddress((prev) => ({ ...prev, email: value || "" }));
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                  setIsAddressModified(true); // Add this
                }}
                required
                name="email"
                className={fieldErrors.email ? "border-red-500" : ""}
                error={fieldErrors.email}
            />
            <div>
              <label className="block text-md font-medium text-gray-700">Additional information</label>
              <textarea
                  value={deliveryAddress.delivery_option || ""}
                  onChange={(e) => {
                    setDeliveryAddress((prev) => ({ ...prev, delivery_option: e.target.value || "" }));
                    setIsAddressModified(true); // Add this
                  }}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm text-sm md:text-base"
                  placeholder="Notes about your order, e.g. special notes for delivery"
              />
            </div>
            <div className="flex flex-col items-end">
    <span
        className="text-gray-500 hover:text-gray-700 cursor-pointer mb-2"
        onClick={handleClearAddress}
    >
      x clear all
    </span>
              <Button
                  onClick={handleSaveAddress}
                  disabled={actionLoading}
                  loading={actionLoading}
              >
                Save Delivery Address
              </Button>
             <span className="text-xs text-red-400"> *optional </span></div>
          </form>
        </div>

        {/* Right Section - Your Orders and Payment */}
        <div className="w-full lg:w-1/2 bg-white p-4 md:p-6 border rounded-md">
          <h2 className="text-xl md:text-2xl font-medium mb-4">Your Orders</h2>
          <div className="overflow-x-auto -mx-2 md:mx-0">
            <table className="w-full table-auto border">
              <thead>
              <tr className="text-gray-700 border">
                <th className="p-2 font-semibold text-md w-[15%]"></th>
                <th className="px-16 font-semibold text-start text-md w-[70%]">Product</th>
                <th className="p-2 font-semibold text-center border text-md w-[10%]">Total</th>
              </tr>
              </thead>
              <tbody>
              {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 text-center border w-[30px]">
                      <Image
                          src={item.stock_image || logo}
                          alt={item.product_name}
                          width={50}
                          height={50}
                          style={{ borderRadius: "7px", objectFit: "cover" }}
                      />
                    </td>
                    <td className="border text-center w-[50px]">
                      <span className="text-sm md:text-base font-bold" style={{ color: theme.colors.brand[7] }}>
                        {item.product_name}
                      </span>
                      <br /> x{item.quantity}
                    </td>
                    <td className="p-2 md:p-3 text-center text-gray-700 text-sm md:text-base border w-[20px]">
                      ${item.total_price?.toFixed(2)}
                    </td>
                  </tr>
              ))}
              <tr className="border">
                <td className="p-2 md:p-3 border w-[50px]">Subtotal</td>
                <td className="p-2 md:p-3 text-right w-[20px]">${cartTotal}</td>              </tr>
              <tr className="border">
                <td className="p-2 md:p-3 border w-[50px]">Shipping</td>
                <td className="p-2 md:p-3 text-right w-[20px]">${deliveryCharge} {deliveryCharge === 0 ? "(Free Shipping)" : ""}</td>
              </tr>
              <tr className="border">
                <td className="p-2 md:p-3 border w-[50px]">Total</td>
                <td
                    className="p-2 md:p-3 text-right font-bold"
                    style={{ color: theme.colors.brand[7] }}
                >
                  ${finalTotal}                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-lg mt-2 font-semibold text-gray-800">Apply Coupon</h3>
            <input
                type="coupon"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm text-sm md:text-base"
                placeholder="Enter Your Coupon"
            />
            <Button
                className="w-1/3 py-2 mt-2 text-white rounded-sm transition text-sm border border-gray-400 duration-400 flex items-center justify-center gap-2"
            >
              <Tag style={{ transform: "rotate(45deg)" }} size={18} />
              Apply
            </Button>
          </div>
          <div className="space-y-4 mt-6">
            <h3 className="text-lg md:text-xl font-semibold ">Payment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
              {paymentMethods.map((method) => (
                  <div
                      key={method.id}
                      className={`w-full p-4 border rounded-md shadow-sm transition relative flex items-center gap-2 ${
                          selectedPaymentMethod === method.slug
                              ? "border-red-700 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.slug)}
                      style={{ cursor: actionLoading ? "not-allowed" : "pointer" }}
                  >
                    <input
                        type="radio"
                        checked={selectedPaymentMethod === method.slug}
                        onChange={() => setSelectedPaymentMethod(method.slug)}
                        className="absolute top-2 right-2 h-4 w-4 text-red-700 rounded-full focus:ring-red-700"
                        disabled={actionLoading}
                    />
                    <Image
                        src={method.thumbnail || method.logo}
                        alt={method.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm md:text-base">{method.name}</span>
                  </div>
              ))}
            </div>
            {contactError && <p className="text-red-500 text-sm mt-1">!!! {contactError}</p>}
            <Button
                onClick={handlePlaceOrder}
                loading={actionLoading}
                disabled={actionLoading}
            >
              Place Order
            </Button>

          </div>
        </div>

        <Modal.Root
            opened={stripeModalOpen}
            onClose={() => {
              setStripeModalOpen(false);
              setStripeClientSecret(null);
            }}
            centered
            closeOnEscape={false}
            closeOnClickOutside={false}
            size="md"
            padding={32}
        >
          <Modal.Overlay style={{ opacity: 0.55, blur: 3 }} />
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Card Information</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
              {stripeClientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: { theme: 'stripe' } }}>
                    <StripeCheckoutForm clientSecret={stripeClientSecret} />
                  </Elements>
              )}
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      </div>
      </div>
  );
};

export default Page;