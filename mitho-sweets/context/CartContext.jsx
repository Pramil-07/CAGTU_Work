"use client";
import { createContext, useEffect, useState } from "react";
import apiClient from "@/axiosConfig";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishCount, setWishCount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const cartCount = cartItems?.length;

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      const { items, expiry } = JSON.parse(savedCart);
      if (expiry > Date.now()) {
        setCartItems(items);
      } else {
        localStorage.removeItem("cartItems");
      }
    }

    const savedWishCount = localStorage.getItem("wishCount");
    if (savedWishCount) {
      setWishCount(Number(savedWishCount));
    }

    const savedPaymentMethod = localStorage.getItem("selectedPaymentMethod");
    if (savedPaymentMethod) {
      setSelectedPaymentMethod(savedPaymentMethod);
    }
  }, []);

  const fetchCartData = async () => {
    try {
      const response = await apiClient.get('/product/wish/');
      const result = response.data.count;
      setWishCount(result);
      localStorage.setItem("wishCount", result);
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    if (cartItems?.length > 0) {
      const expiry = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
      localStorage.setItem("cartItems", JSON.stringify({ items: cartItems, expiry }));
    } else {
      localStorage.removeItem("cartItems");
    }
  }, [cartItems]);

  useEffect(() => {
    if (selectedPaymentMethod) {
      localStorage.setItem("selectedPaymentMethod", selectedPaymentMethod);
    } else {
      localStorage.removeItem("selectedPaymentMethod");
    }
  }, [selectedPaymentMethod]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      let found = false;
      const updatedItems = prevItems.map((item) => {
        if (item.id === product.id) {
          found = true;
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });

      if (!found) {
        return [...prevItems, { ...product, quantity: 1 }];
      }

      return updatedItems;
    });
  };

  const addToCartWithQuantity = (product, quantity) => {
    if (isNaN(quantity) || quantity < 1) {
      return;
    }
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        return prevItems.map((item) =>
            item.id === product.id ? { ...item, quantity } : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (product) => {
    setCartItems((prevCartItems) => {
      return prevCartItems.filter((item) => item.id !== product.id);
    });
  };

  const addFromInput = (product, count) => {
    const quantity = Number(count);
    if (isNaN(quantity) || quantity < 1) return;

    setCartItems((prevItems) => {
      let found = false;
      const updatedItems = prevItems.map((item) => {
        if (item.id === product.id) {
          found = true;
          return { ...item, quantity };
        }
        return item;
      });

      if (!found) {
        return [...prevItems, { ...product, quantity }];
      }

      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
    setSelectedPaymentMethod(null);
  };

  const refreshWishCount = async () => {
    await fetchCartData();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
            cartCount,
            wishCount,
        removeFromCart,
        addToCart,
            addToCartWithQuantity,
        addFromInput,
        clearCart,
        refreshWishCount,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
