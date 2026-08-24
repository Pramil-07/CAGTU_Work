import { Box, Button, LoadingOverlay } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import urls from "@/constants/urls";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useBoxStyles } from "@/styles/pages/BoxStyles";
import { axiosClient } from "@/utils/axiosClient";

import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";
import { formatNumberWithCondition } from "@/utils/helpers";
import ConvertAndFormat, { convertCurrency } from "../CurrencyNumberFormatter/ConvertAndFormat";
import { useCurrency } from "@/currency/CurrencyContext";

interface CartAddProps {
    order?: string;
    tasks?: string[];
    products?: string[];
    selected_currency:string
    converted_amount:number|string;
}

interface CartItem {
    id: string;
    entity_service: {
        is_requested: boolean;
        title: string;
    };
}

export const TotalCart = ({
                              items,
                              totalPrice,
                              selectedProducts = [],
                              orderData,
                              selectedCurrency,
                          }: {
    items: string[]; // Now treated as selected tasks
    totalPrice: number;
    selectedProducts?: string[];
    orderData?: { result: CartItem[] };
    selectedCurrency?: string | null;
}) => {
    const { classes } = useBoxStyles();
    const router = useRouter();
    const { mutate, isLoading: isCartLoading } = useMutation(
        (data: CartAddProps) => {
            return axiosClient.post(urls.cart.add, data);
        }
    );
    const{globalCurrency} = useCurrency();
    const { checkStatus } = useUserStatus();
    const[convertedAmount, setConvertedAmount] = useState<number>(0);
    const [exchangeInfo, setExchangeInfo] = useState<number>(89.0);
           useEffect(() => {
                const fetchExchangeRate = async () => {
                    const exchangeData= await axiosClient.get(`locale/cms/exchangerate`);
                    const { result } = exchangeData.data;
                    // Extract value and currency code
                    const rate = parseFloat(result[0]?.value); // Save only the exchange rate (e.g., 89.0)

                    setExchangeInfo(rate);
                    console.log('Extracted Exchange Info:', exchangeInfo);

                }
                fetchExchangeRate();
            }),[]
            console.log("first,selectedCurrency12", selectedCurrency);

    const categorizedItems = React.useMemo(() => {
        if (!orderData?.result) return { tasks: 0, services: 0 };

        return orderData.result
            .filter(item => items.includes(item.id))
            .reduce(
                (acc, item) => {
                    if (item.entity_service.is_requested) {
                        acc.tasks++;
                    } else {
                        acc.services++;
                    }
                    return acc;
                },
                { tasks: 0, services: 0 }
            );
    }, [items, orderData]);
    const convertedResult = useMemo(() => {
        console.log("useMemo inputs:", {
          totalPrice,
          selectedCurrency,
          globalCurrency,
          exchangeInfo,
        });
        // Validate inputs
        if (!totalPrice || isNaN(totalPrice)) {
          console.warn("Invalid totalPrice, returning default:", totalPrice);
          return { amount: 0, currency: globalCurrency, symbol: globalCurrency === "AUD" ? "AUD" : "रु" };
        }
        if (!selectedCurrency || !["AUD", "NPR"].includes(selectedCurrency)) {
          console.warn("Invalid selectedCurrency, using fallback:", selectedCurrency);
        }
        if (!globalCurrency || !["AUD", "NPR"].includes(globalCurrency)) {
          console.warn("Invalid globalCurrency:", globalCurrency);
        }

        const result = convertCurrency(totalPrice, globalCurrency, selectedCurrency || "NPR", exchangeInfo);
        console.log("convertCurrency result:", result);
        return result;
      }, [totalPrice, selectedCurrency, globalCurrency, exchangeInfo]);

      useEffect(() => {
        setConvertedAmount(convertedResult.amount);
        console.log("Updated convertedAmount:", convertedResult.amount);
      }, [convertedResult]);

      console.log("converted amount" , convertedAmount);
      console.log("totalPrice", totalPrice);

    const handleCheckout = () => {
        if (checkStatus("kyc")) {
            mutate(
                {
                    tasks: items.length > 0 ? items : undefined,
                    products: selectedProducts.length > 0 ? selectedProducts : undefined,
                    selected_currency:globalCurrency,
                    converted_amount: convertedAmount.toFixed(3),
                },
                {
                    onSuccess: async (data) => {
                        router.push({
                            pathname: "/checkout/",
                            query: { id: data?.data?.order },
                        });
                    },
                    onError: async (error: any) => {
                        const { tasks, products, non_field_errors } = error.response.data;

                        tasks && toast.error(tasks[0]);
                        products && toast.error(products[0]);
                        non_field_errors && toast.error(non_field_errors[0]);
                    },
                }
            );
        }
    };

    const hasItems = items.length > 0 || selectedProducts.length > 0;
    console.log("first", selectedCurrency);

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isCartLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <Box className={classes.totalCart}>
                <h4>Your Cart Total</h4>
                {/*<div className="mb-1">*/}
                {/*    {categorizedItems.tasks > 0 && (*/}
                {/*        <p className="text-sm">Tasks: {categorizedItems.tasks}</p>*/}
                {/*    )}*/}
                {/*    {categorizedItems.services > 0 && (*/}
                {/*        <p className="text-sm">Services: {categorizedItems.services}</p>*/}
                {/*    )}*/}
                {/*    {selectedProducts.length > 0 && (*/}
                {/*        <p className="text-sm">Products: {selectedProducts.length}</p>*/}
                {/*    )}*/}
                {/*</div>*/}
                <p>
                    {/*Price:&nbsp;*/}
                    {/*NRS.*/}
                    {/*<span>*/}
                    {/*    /!*{totalPrice.toFixed(2)}*!/*/}
                    {/*    /!*{product.local_currency_details?.symbol || ''} &nbsp;*!/*/}
                    {/*    {formatNumberWithCondition(totalPrice, "")}*/}
                    {/*</span>*/}
                    {/* {selectedCurrency || "NRS"}&nbsp; */}
                    <span>
                        {<ConvertAndFormat number={totalPrice} globalCurrency={globalCurrency} currency={selectedCurrency||"NPR"} exchangeRate={89}/>}
                    </span>
                </p>
                <Button
                    fullWidth
                    mb={24}
                    disabled={!hasItems}
                    onClick={handleCheckout}
                >
                    Proceed to Checkout
                </Button>
                <p className="content">
                    Price displayed excludes any applicable <br />
                    <Link href={"/settings/termsandconditions"}>
                        taxes and a handling fee.
                    </Link>
                </p>
            </Box>
        </>
    );
};
