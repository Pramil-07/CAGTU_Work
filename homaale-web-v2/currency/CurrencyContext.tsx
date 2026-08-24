import { axiosClient } from "@/utils/axiosClient";
import React, { createContext, useContext, useEffect, useState } from "react";

type CurrencyContextType = {
  globalCurrency: string;
  setGlobalCurrency: (val: string) => void;
  exchangeRate?: number | null;
};

const CurrencyContext = createContext<CurrencyContextType>({
  globalCurrency: "NPR",
  setGlobalCurrency: () => {},

});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalCurrency, setGlobalCurrency] = useState<string>("NPR");
  const [exchangeRate, setExchangeRate] = useState<number | null>(93);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const { data } = await axiosClient.get(`locale/cms/exchangerate`);
        const rate = parseFloat(data.result[0]?.value) || 1; // fallback to 1
        setExchangeRate(rate);
      } catch (error) {
        console.error('Failed to fetch exchange rate', error);
        setExchangeRate(1); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("globalCurrency");
      setGlobalCurrency(stored || "");
    }
  }, []);

  // Save currency to localStorage only on the client side
  useEffect(() => {
    if (typeof window !== "undefined" && globalCurrency) {
      localStorage.setItem("globalCurrency", globalCurrency);
    }
  }, [globalCurrency]);

  return (
    <CurrencyContext.Provider value={{ globalCurrency, setGlobalCurrency,exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};
