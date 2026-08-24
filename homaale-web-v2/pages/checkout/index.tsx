import {
    Box,
    Button,
    Flex,
    Grid,
    Group,
    Loader,
    LoadingOverlay,
    Modal, ScrollArea, Table,
    Text,
    Tooltip,
} from "@mantine/core";
import {Elements} from "@stripe/react-stripe-js";
import {
    IconCalendarTime,
    IconClockHour5,
    IconMapPin, IconPackage,
    IconStack,
} from "@tabler/icons-react";
import {TbArrowBackUp} from "react-icons/tb";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {format} from "date-fns";
import {Form} from "formik";
import {Formik} from "formik";
import _ from "lodash";
import Image from "next/image";
import router, {useRouter} from "next/router";
import React, {useEffect, useMemo, useState} from "react";
import * as Yup from "yup";

import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import NoPaymentMethods from "@/components/common/NoPaymentMethods";
import {toast} from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import StripeCheckoutForm from "@/components/payment/StripeCheckout";
import {SkeletonPaymentMethods} from "@/components/skeletons/SkeletonPaymentMethods";
import urls from "@/constants/urls";
import {CheckIcon} from "@/public/svgs/CheckIcon";
import {useCheckoutStyles} from "@/styles/pages/CheckoutStyles";
import type {CheckoutDataProps} from "@/types/CheckoutDataProps";
import type {PromocodePayload} from "@/types/PromocodePayload";
import {axiosClient} from "@/utils/axiosClient";
import {handleEsewaMutation} from "@/utils/payment/esewa";
import {appearance, stripePromise} from "@/utils/payment/stripe";
import {stringUnReq} from "@/utils/validation/GlobalValidations";
import { useCurrency } from "@/currency/CurrencyContext";
import ConvertAndFormat, { convertCurrency } from "@/components/CurrencyNumberFormatter/ConvertAndFormat";

export interface PaymentMethodProps {
    id: number;
    name: string;
    logo: string;
    type: string;
    slug: string;
}

interface claimPaymentProps {
    order: string | string[] | undefined;
    // order_product: string | string[] | undefined;
}

const Checkout = () => {
    const {classes, theme} = useCheckoutStyles();
    const [stripeOpened, setstripeOpened] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const router = useRouter();
    const query = router.query.id;

    const [paymentType, setPaymentType] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const {globalCurrency}=useCurrency();
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
      


    const {data: paymentMethods, isLoading: isPaymentMethodsLoading} =
        useQuery(["payment-methods", query], async () => {
            const response = await axiosClient.get(urls.payment.method);
            return response;
        });
    console.log('payment methods', paymentMethods)

    const {mutate: createIntentMutation, isLoading: isCreateIntentLoading} =
        useMutation((data: { order: string | string[] }): any => {
            return axiosClient.post(
                `${urls.payment.intent}${paymentType.toLowerCase()}/`,
                data
            );
        });

    const {mutate: promoMutaion, isLoading: promoLoading} = useMutation<
        any,
        AxiosError<{ non_field_errors: string[] }>,
        PromocodePayload
    >((data) => {
        return axiosClient.post(urls.offer.offerCode, data);
    });

    const {mutate: claimPaymentMutation, isLoading: isClaimLoading} =
        useMutation((data: claimPaymentProps): any => {
            return axiosClient.post(urls.payment.claim, data);
        });
    const currencyFormats: Record<
        string,
        { locale: string; symbol: string; currencyCode: string }
    > = {
        NPR: {
            locale: "en-IN", // Indian format for Nepali-style commas (12,34,567)
            symbol: "रु",
            currencyCode: "NPR",
        },
        USD: {
            locale: "en-US", // Standard US format (1,234,567)
            symbol: "$",
            currencyCode: "USD",
        },
        // Add more currencies as needed
    };

// Default fallback for unknown currencies
    const defaultFormat = {
        locale: "en-IN",
        symbol: "रु",
        currencyCode: "NPR",
    };

    const goBack = () => {
        router.push("/box");
    };

    const formatPrice = (number: number, currencyCode: string): string => {
        const formattedNumber = new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        }).format(number);
        return `${currencyCode} ${formattedNumber}`;
    };

    const {data: checkoutData}: any = useQuery(
        ["all-services-checkout", query],
        async () => {
            try {
                const response = await axiosClient.get<CheckoutDataProps>(
                    `${urls.payment.order}${query}/`
                );
                return response;
            } catch (error) {
                if (error instanceof AxiosError) {
                    throw new Error(error?.response?.data?.message);
                }
            }
        }
    );
   const selectedCurrency:string=checkoutData?.data?.product_order?.currency
   console.log('selected currency from checkout', selectedCurrency)
    console.log('checkout data', checkoutData)

    const {grand_total, currency} = checkoutData?.data ?? {};
    const calculateSubtotal = () => {
        const orderItemsTotal = checkoutData?.data?.order_item?.reduce(
            (sum: number, item: { amount: any }) =>
                sum + (parseFloat(item?.amount || "0") || 0),
            0
        ) || 0;
        const productOrderTotal = parseFloat(checkoutData?.data?.product_order?.total_price || "0") || 0;
        return orderItemsTotal + productOrderTotal;
    };

    const [stripeClientSecret, setStripeClientSecret] = useState();
    const options = {
        clientSecret: stripeClientSecret,
        appearance: appearance,
    };

    console.log("paymentMethods full response:", paymentMethods);
    console.log("paymentMethods.data:", paymentMethods?.data);
    console.log("Nepal payment methods:", paymentMethods?.data?.nepal);
    console.log("International payment methods:", paymentMethods?.data?.International);
    useEffect(() => {
        if (globalCurrency !== "NPR") {
          setPaymentType(""); // Reset paymentType to hide CheckIcon
          setErrorMsg(""); // Optionally clear error message
        }
      }, [globalCurrency]);
      useEffect(() => {
        if (globalCurrency !== "AUD") {
          setPaymentType(""); // Reset paymentType to hide CheckIcon
          setErrorMsg(""); // Optionally clear error message
        }
      }, [globalCurrency]);

    const convertedResult = useMemo(() => {
        console.log("useMemo inputs:", {
          grand_total,
          selectedCurrency,
          globalCurrency,
          exchangeInfo,
        });
        // Validate inputs
        if (!grand_total|| isNaN(grand_total)) {
          console.warn("Invalid totalPrice, returning default:",grand_total);
          return { amount: 0, currency: globalCurrency, symbol: globalCurrency === "AUD" ? "AUD" : "रु" };
        }
        if (!selectedCurrency || !["AUD", "NPR"].includes(selectedCurrency)) {
          console.warn("Invalid selectedCurrency, using fallback:", selectedCurrency);
        }
        if (!globalCurrency || !["AUD", "NPR"].includes(globalCurrency)) {
          console.warn("Invalid globalCurrency:", globalCurrency);
        }
    
        const result = convertCurrency(grand_total, globalCurrency, selectedCurrency || "NPR", exchangeInfo);
        console.log("convertCurrency result:", result);
        return result;
      }, [grand_total, selectedCurrency, globalCurrency, exchangeInfo]);
    
      useEffect(() => {
        setConvertedAmount(convertedResult.amount);
        console.log("Updated convertedAmount:", convertedResult.amount);
      }, [convertedResult]);
      console.log( "converted amount from checkout" , convertedAmount);
    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader/>}
                visible={isCreateIntentLoading || promoLoading}
                sx={{position: "fixed", inset: 0}}
            />
            {!query && (
                <Layout currentTitle={"checkout"}>
                    <Flex
                        align={"center"}
                        justify={"center"}
                        direction={"column"}
                        sx={{minHeight: "100%"}}
                        mt={64}
                    >
                        <IconStack size={48} color={theme.colors.blue[7]}/>
                        <Text size={24} color={theme.colors.homaaleSlate[8]}>
                            No items to checkout
                        </Text>
                        <Text color={theme.colors.homaaleSlate[5]} mb={12}>
                            Active orders to checkout will be listed in this
                            page.
                        </Text>
                        <Button onClick={() => router.push("/box")}>
                            Check my Box
                        </Button>
                    </Flex>
                </Layout>
            )}

            {query && (
                <Layout heading="Checkout" currentTitle={"checkout"}>
                    {isPaymentMethodsLoading ? (
                        <SkeletonPaymentMethods/>
                    ) : (
                        <>
                            <Grid className={classes.wrapper}>
                                <Grid.Col sm={12} md={7}>
                                    <Box className="container-box left-box">
                                        {/*<h4>Order Summary</h4>*/}
                                        <Flex justify="flex-end">
                                            <Tooltip label="Back">
                                                <button onClick={goBack}><TbArrowBackUp size={20}/></button>
                                            </Tooltip>
                                        </Flex>
                                        {/* Task List Section */}
                                        {checkoutData?.data?.order_item?.length > 0 && (
                                            <>
                                                <Text component="p" size={16} weight={500} mt={16} mb={8}>
                                                    Task List
                                                </Text>
                                                <ScrollArea type="auto" scrollbarSize={8}>
                                                    <Table
                                                        horizontalSpacing="sm"
                                                        verticalSpacing="xs"
                                                        withBorder
                                                        withColumnBorders
                                                        sx={{
                                                            border: theme.colorScheme === "dark"
                                                                ? `1px solid ${theme.colors.gray[7]}`
                                                                : `1px solid rgba(0, 0, 0, 0.08)`,
                                                            borderRadius: 4,
                                                            background: theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
                                                            minWidth: 600,
                                                            [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
                                                                minWidth: 400,
                                                            },
                                                        }}
                                                    >
                                                        <thead>
                                                        <tr>
                                                            <th style={{width: "15%"}}>Image</th>
                                                            <th style={{width: "40%"}}>Name</th>
                                                            <th style={{width: "25%"}}>Date</th>
                                                            <th style={{width: "20%"}}>Total Price</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {checkoutData?.data?.order_item.map((item: { task: { price:string; entity_service_images: string | any[]; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; location: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; currency: string; }; created_at: string | number | Date; amount: string; }, index: any) => (
                                                            <tr key={`task-${index}`}>
                                                                <td>
                                                                    <Image
                                                                        src={
                                                                            item?.task?.entity_service_images?.length > 0
                                                                                ? item.task.entity_service_images[0].media
                                                                                : "/images/placeholder/taskPlaceholder.png"
                                                                        }
                                                                        height={50}
                                                                        width={50}
                                                                        alt={`task-${item?.task?.title}`}
                                                                        style={{ borderRadius: "4px", objectFit: "cover" }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Text
                                                                        component="p"
                                                                        weight={500}
                                                                        // size={{ base: "sm", xs: "md" }} // Smaller font on mobile
                                                                    >
                                                                        {item?.task?.title}
                                                                    </Text>
                                                                    {/*<Flex align="center" gap={8}>*/}
                                                                    {/*    <IconMapPin size={14} color={theme.colors.red[5]} />*/}
                                                                    {/*    <Text*/}
                                                                    {/*        component="p"*/}
                                                                    {/*        // size={{ base: "xs", xs: "sm" }}*/}
                                                                    {/*        color={theme.colors.homaaleSlate[5]}*/}
                                                                    {/*    >*/}
                                                                    {/*        {item?.task?.location}*/}
                                                                    {/*    </Text>*/}
                                                                    {/*</Flex>*/}
                                                                </td>
                                                                <td>
                                                                    <Flex direction="column" gap={4}>
                                                                        <Flex align="center" gap={8}>
                                                                            <IconCalendarTime size={14} color={theme.colors.brand[4]} />
                                                                            <Text component="p"
                                                                                  // size={{ base: "xs", xs: "sm" }}
                                                                            >
                                                                                {format(new Date(item?.created_at), "PP")}
                                                                            </Text>
                                                                        </Flex>
                                                                        <Flex align="center" gap={8}>
                                                                            <IconClockHour5 size={14} color={theme.colors.blue[5]} />
                                                                            <Text component="p"
                                                                                  // size={{ base: "xs", xs: "sm" }}
                                                                            >
                                                                                {format(new Date(item?.created_at), "p")}
                                                                            </Text>
                                                                        </Flex>
                                                                    </Flex>
                                                                </td>
                                                                <td>
                                                                    <Text
                                                                        component="p"
                                                                        weight={500}
                                                                        // size={{ base: "sm", xs: "md" }}
                                                                        color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[7]}
                                                                    >
                                                                        {/* {formatPrice(parseFloat(item?.amount), item?.task?.currency)} */}
                                                                        <ConvertAndFormat number={(parseFloat(item?.task.price))} globalCurrency={globalCurrency} exchangeRate={89} currency={item?.task?.currency}/>
                                                                    </Text>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </Table>
                                                </ScrollArea>
                                            </>
                                        )}

                                        {/* Product List Section */}
                                        {checkoutData?.data?.product_order?.items?.length > 0 && (
                                            <>
                                                <Text component="p" size={16} weight={500} mt={16} mb={8}>
                                                    Product List
                                                </Text>
                                                <ScrollArea type="auto" scrollbarSize={8}>
                                                    <Table
                                                        horizontalSpacing="sm"
                                                        verticalSpacing="xs"
                                                        withBorder
                                                        withColumnBorders
                                                        sx={{
                                                            border: theme.colorScheme === "dark"
                                                                ? `1px solid ${theme.colors.gray[7]}`
                                                                : `1px solid rgba(0, 0, 0, 0.08)`,
                                                            borderRadius: 4,
                                                            background: theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
                                                            minWidth: 600,
                                                            [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
                                                                minWidth: 400,
                                                            },
                                                        }}
                                                    >
                                                        <thead>
                                                        <tr>
                                                            <th style={{ width: "15%" }}>Image</th>
                                                            <th style={{ width: "40%" }}>Name</th>
                                                            <th style={{ width: "25%" }}>Quantity</th>
                                                            <th style={{ width: "20%" }}>Total Price</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {checkoutData?.data?.product_order?.items.map((item: { product_images: string | any[]; quantity: number | any; unit_price: number | any; product_name: any; shop_location: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; price: number; }, index: any) => (
                                                            <tr key={`product-${index}`}>
                                                                <td>
                                                                    <Image
                                                                        src={
                                                                            item?.product_images?.length > 0
                                                                                ? item?.product_images[0].image_url
                                                                                : "/images/placeholder/taskPlaceholder.png"
                                                                        }
                                                                        height={50}
                                                                        width={50}
                                                                        alt={`product-${item?.product_name}`}
                                                                        style={{ borderRadius: "4px", objectFit: "cover" }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Text
                                                                        component="p"
                                                                        weight={500}
                                                                        // size={{ base: "sm", xs: "md" }}
                                                                    >
                                                                        {item?.product_name
                                                                            ? String(item?.product_name).charAt(0).toUpperCase() + String(item?.product_name).slice(1)
                                                                            : ""}
                                                                    </Text>
                                                                    {/*{item?.shop_location && (*/}
                                                                    {/*    <Flex align="center" gap={8}>*/}
                                                                    {/*        <IconMapPin size={14} color={theme.colors.red[5]} />*/}
                                                                    {/*        <Text*/}
                                                                    {/*            component="p"*/}
                                                                    {/*            // size={{ base: "xs", xs: "sm" }}*/}
                                                                    {/*            color={theme.colors.homaaleSlate[5]}*/}
                                                                    {/*        >*/}
                                                                    {/*            {item.shop_location}*/}
                                                                    {/*        </Text>*/}
                                                                    {/*    </Flex>*/}
                                                                    {/*)}*/}
                                                                </td>

                                                                <td>
                                                                    <Flex direction="column" gap={4}>
                                                                        <Flex align="center" gap={8}>
                                                                            {/*<Tooltip label="Quantity" position="top" withArrow offset={5}>*/}
                                                                            {/*    <Text>Qty:</Text>*/}
                                                                            {/*    <IconPackage size={16} className="text-gray-400" />*/}
                                                                            {/*</Tooltip>*/}
                                                                            <Tooltip label="Quantity">
                                                                                <IconPackage size={14} color={theme.colors.brand[4]} />
                                                                            </Tooltip>
                                                                            <Text component="p"
                                                                                  // size={{ base: "xs", xs: "sm" }}
                                                                            >
                                                                                {item?.quantity}

                                                                                {/*{format(new Date(checkoutData.data.product_order.created_at), "PP")}*/}
                                                                            </Text>
                                                                            {item?.unit_price?.length > 0 && (
                                                                            <Text component="p">
                                                                                X 
                                                                                {/* {item?.unit_price}{" "} */}
                                                                                <ConvertAndFormat number={item?.unit_price} currency={checkoutData?.data?.product_order?.currency} globalCurrency={globalCurrency} exchangeRate={89}/>
                                                                            </Text>
                                                                            )}
                                                                        </Flex>
                                                                        {/*<Flex align="center" gap={8}>*/}
                                                                        {/*    <IconClockHour5 size={14} color={theme.colors.blue[5]} />*/}
                                                                        {/*    <Text component="p"*/}
                                                                        {/*          // size={{ base: "xs", xs: "sm" }}*/}
                                                                        {/*    >*/}
                                                                        {/*        {format(new Date(checkoutData.data.product_order.created_at), "p")}*/}
                                                                        {/*    </Text>*/}
                                                                        {/*</Flex>*/}
                                                                    </Flex>
                                                                </td>
                                                                <td>
                                                                    <Text
                                                                        component="p"
                                                                        weight={500}
                                                                        // size={{ base: "sm", xs: "md" }}
                                                                        color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[7]}
                                                                    >
                                                                        {/* {formatPrice(item?.price, checkoutData?.data?.product_order?.currency)} */}
                                                                        <ConvertAndFormat number={item?.price} currency={checkoutData?.data?.product_order?.currency} globalCurrency={globalCurrency} exchangeRate={89}/>
                                                                    </Text>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </Table>
                                                </ScrollArea>
                                            </>
                                        )}

                                        {/* Subtotal, Promo Code, and Grand Total */}
                                        <Box
                                            sx={{
                                                borderBottom: theme.colorScheme === "dark"
                                                    ? `1px solid ${theme.colors.gray[7]}`
                                                    : `1px solid rgba(0, 0, 0, 0.08)`,
                                                paddingBottom: 18,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <Flex
                                                sx={{
                                                    borderBottom: theme.colorScheme === "dark"
                                                        ? `1px solid ${theme.colors.gray[7]}`
                                                        : `1px solid rgba(0, 0, 0, 0.08)`,
                                                    paddingBottom: 12,
                                                    marginBottom: 18,
                                                }}
                                            >
                                                <Text weight={400}>Sub Total</Text>
                                                <Text
                                                    weight={600}
                                                    size={14}
                                                    color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[7]}
                                                >
                                                    {/*{currency}{" "}*/}
                                                    {/*{(() => {*/}
                                                    {/*    const orderItemsTotal = checkoutData?.data?.order_item?.reduce(*/}
                                                    {/*        (sum: number, item: { amount: any }) =>*/}
                                                    {/*            sum + (parseFloat(item?.amount || "0") || 0),*/}
                                                    {/*        0*/}
                                                    {/*    ) || 0;*/}
                                                    {/*    const productOrderTotal = parseFloat(checkoutData?.data?.product_order?.total_price || "0") || 0;*/}
                                                    {/*    const subtotal = orderItemsTotal + productOrderTotal;*/}
                                                    {/*    return subtotal.toFixed(2);*/}
                                                    {/*})()}*/}
                                                    {/* {formatPrice(calculateSubtotal(), currency)} */}
                                                        {formatPrice(grand_total, globalCurrency)}
                                                    {/* <ConvertAndFormat number={calculateSubtotal()} currency={currency} globalCurrency={globalCurrency} exchangeRate={89}/> */}
                                                </Text>
                                            </Flex>
                                            <Formik
                                                initialValues={{
                                                    offer_type: "promo_code",
                                                    code: "",
                                                    order: query as string
                                                }}
                                                enableReinitialize
                                                validationSchema={Yup.object().shape({code: stringUnReq})}
                                                onSubmit={(value, action) =>
                                                    promoMutaion(value, {
                                                        onSuccess: async () => {
                                                            toast.success("Promo code applied");
                                                            queryClient.invalidateQueries(["all-services-checkout"]);
                                                            action.resetForm();
                                                        },
                                                        onError: (e: any) => {
                                                            const {non_field_errors} = e.response.data;
                                                            action.setFieldError("code", non_field_errors && non_field_errors[0]);
                                                        },
                                                    })
                                                }
                                            >
                                                {({errors, touched}) => (
                                                    <Form>
                                                        <Flex justify={"flex-start"} align={"flex-start"} gap={12}>
                                                            <InputField
                                                                id="code"
                                                                name={"code"}
                                                                placeholder="Enter promo code"
                                                                touch={touched.code}
                                                                error={errors.code}
                                                                w={"100%"}
                                                                data-autofocus
                                                                withAsterisk
                                                            />
                                                            <FormButton name={"Apply"} id={"apply-btn"} type="submit"
                                                                        size={"md"}/>
                                                        </Flex>
                                                    </Form>
                                                )}
                                            </Formik>
                                            {checkoutData?.data?.order_item?.[0]?.offer_value && (
                                                <Flex>
                                                    <Text component="p">Discount</Text>
                                                    <Text>
                                                        {checkoutData?.data?.order_item[0]?.task?.currency}{" "}
                                                        {(+parseFloat(checkoutData?.data?.order_item[0].offer_value).toFixed(2))}
                                                    </Text>
                                                </Flex>
                                            )}
                                        </Box>

                                        <Flex>
                                            <Text
                                                size={20}
                                                weight={500}
                                                color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[8]}
                                            >
                                                Grand Total
                                            </Text>
                                            <Text
                                                size={20}
                                                weight={500}
                                                color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[8]}
                                            >
                                                {/*{currency} {grand_total?.toFixed(2)}*/}
                                                {formatPrice(grand_total, globalCurrency)}
                                                {/* <ConvertAndFormat number={grand_total} currency={currency}  globalCurrency={globalCurrency} exchangeRate={89}/> */}
                                            </Text>
                                        </Flex>

                                        {grand_total && grand_total > 0 ? (
                                            <Button
                                                fullWidth
                                                mt={24}
                                                disabled={paymentType === "" || errorMsg !== "" || isCreateIntentLoading}
                                                onClick={async () => {
                                                    createIntentMutation(
                                                        {order: query},
                                                        {
                                                            onSuccess: (data: any) => {
                                                                console.log("payment ", data);
                                                                switch (paymentType) {
                                                                    case "khalti":
                                                                        router.push(data?.data?.data?.payment_url);
                                                                        break;
                                                                    case "paypal":
                                                                        router.push(data?.data?.data?.links[1]?.href);
                                                                        break;
                                                                    case "connect_ips":
                                                                        router.push(data?.data?.data?.redirect_url);
                                                                        break;
                                                                    case "esewa":
                                                                        handleEsewaMutation(data?.data?.data?.request_url, data?.data?.data);
                                                                        break;
                                                                    default:
                                                                        setStripeClientSecret(data?.data?.data?.client_secret);
                                                                        setstripeOpened(true);
                                                                }
                                                            },
                                                            onError: (error: any) => {
                                                                const errorMessage: any = error?.response?.data;
                                                                setErrorMsg(() => {
                                                                    if (_.has(errorMessage, "merchant.details"))
                                                                        return errorMessage?.merchant?.details[0]?.description;
                                                                    else return errorMessage;
                                                                });
                                                            },
                                                        }
                                                    );
                                                }}
                                            >
                                                {isCreateIntentLoading ?
                                                    <Loader variant="dots" color="gray"/> : "Continue Checkout"}
                                            </Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                mt={24}
                                                disabled={isClaimLoading}
                                                loading={isClaimLoading}
                                                onClick={() => {
                                                    claimPaymentMutation(
                                                        {order: query},
                                                        {
                                                            onSuccess: () => {
                                                                toast.success("Checkout completed");
                                                                router.push("/bookings?active_tab=2");
                                                            },
                                                            onError: (err: any) => {
                                                                toast.error(err.message);
                                                            },
                                                        }
                                                    );
                                                }}
                                            >
                                                Continue Checkout
                                            </Button>
                                        )}
                                    </Box>
                                </Grid.Col>
                                <Grid.Col sm={12} md={5}>
                                    <Box className="container-box right-box" mb={8}>
                                        {grand_total !== undefined   && grand_total >= 0 ? (
                                            <>
                                                <h4>Payment Methods</h4>
                                                <Text component="p" size={14} weight={500} mt={16} mb={8}>
                                                    Nepal&apos;s Payment Methods
                                                </Text>
                                                <Group>
                                                    {paymentMethods?.data?.nepal?.length > 0 ? (
                                                        paymentMethods?.data.nepal
                                                            .filter((item: PaymentMethodProps) => item.type === "wallet")
                                                            .map((item: PaymentMethodProps, index: number) => (
                                                                <Box
                                                                    key={`${item?.id}-${index}`}
                                                                    sx={{
                                                                        border: theme.colorScheme === "dark"
                                                                            ? `1px solid ${theme.colors.gray[7]}`
                                                                            : `1px solid rgba(0, 0, 0, 0.08)`,
                                                                        borderRadius: 4,
                                                                        background: theme.colorScheme === "dark" ? theme.colors.dark[7] : "inherit",
                                                                        padding: "12px 32px",
                                                                        width: "100%",
                                                                        [`@media (min-width: ${theme.breakpoints.xs}px)`]: { width: "180px" },
                                                                        position: "relative",
                                                                        opacity: globalCurrency === "NPR" ? 1 : 0.5, // Disable if not NPR
                                                                    }}
                                                                    onClick={() => { globalCurrency === "NPR" &&
                                                                        setPaymentType(item?.slug);
                                                                        setErrorMsg("");
                                                                       
                                                                    }}
                                                                   
                                                                  
                                                                >
                                                                   
                                                                    <Flex justify="space-between" align="center" gap={32}>
                                                                        <Image
                                                                            src={item?.logo || "/images/placeholder/payment.png"}
                                                                            width={36}
                                                                            height={48}
                                                                            alt={item?.name}
                                                                            style={{ objectFit: "contain" }}
                                                                        />
                                                                        <Text component="p">{item?.name}</Text>
                                                                    </Flex>
                                                                    {item?.slug === paymentType && (
                                                                        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                                                                            <CheckIcon  />
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            ))
                                                    ) : (
                                                        <Text>No Nepal&apos;s Payment Methods available for this Currency</Text>
                                                    )}
                                                </Group>

                                                <Text component="p" size={14} weight={500} mt={32} mb={8}>
                                                    International Payment Methods
                                                </Text>
                                                <Group>
                                                    { paymentMethods?.data?.International?.length > 0 ? (
                                                        paymentMethods?.data.International
                                                            .filter((item: PaymentMethodProps) => item.type === "card" || item.type === "bank" || item.type === "wallet")
                                                            .map((item: PaymentMethodProps) => (
                                                                <Box
                                                                    key={item?.id}
                                                                    sx={{
                                                                        border: theme.colorScheme === "dark"
                                                                            ? `1px solid ${theme.colors.gray[7]}`
                                                                            : `1px solid rgba(0, 0, 0, 0.08)`,
                                                                        borderRadius: 4,
                                                                        background: theme.colorScheme === "dark" ? theme.colors.dark[7] : "inherit",
                                                                        padding: "12px 32px",
                                                                        width: "100%",
                                                                        [`@media (min-width: ${theme.breakpoints.xs}px)`]: { width: "180px" },
                                                                        position: "relative",
                                                                        opacity: globalCurrency === "AUD" ? 1 : 0.5, // Disable if not AUD
                                                                    }}
                                                                    onClick={() => { globalCurrency==="AUD" &&
                                                                        setPaymentType(item?.slug);
                                                                        setErrorMsg("");
                                                                    }}
                                                                >
                                                                    <Flex justify="space-between" align="center" gap={32}>
                                                                    <Image
                                                                        src={item?.logo || "/images/placeholder/payment.png"}
                                                                        width={36}
                                                                        height={48}
                                                                        alt={item?.name}
                                                                        style={{ objectFit: "contain" }}
                                                                    />
                                                                    <Text component="p">{item?.name}</Text>
                                                                    </Flex>
                                                                    {item?.slug === paymentType && (
                                                                        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                                                                            <CheckIcon />
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            ))
                                                    ) : (
                                                        <Text>No international payment methods available for this Currency</Text>
                                                    )}
                                                </Group>
                                                <Text component="span" color="red.5">
                                                    {errorMsg}
                                                </Text>
                                            </>
                                        ) : (
                                            <NoPaymentMethods />
                                        )}
                                    </Box>
                                </Grid.Col>
                            </Grid>

                            <Modal.Root opened={stripeOpened}
                                        onClose={() => setstripeOpened(false)}
                                        centered
                                        closeOnEscape={false}
                                        closeOnClickOutside={false}
                                        size={"md"}
                                        padding={32}>
                                <Modal.Overlay sx={{opacity: 0.55, blur: 3,}}/>
                                <Modal.Content>
                                    <Modal.Header>
                                        <Modal.Title>Card Information</Modal.Title>
                                        <Modal.CloseButton/>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {paymentType === "stripe" && (
                                            <div className="App mb-5">
                                                {options.clientSecret && (
                                                    <Elements stripe={stripePromise} options={options}>
                                                        <StripeCheckoutForm/>
                                                    </Elements>
                                                )}
                                            </div>
                                        )}
                                    </Modal.Body>
                                </Modal.Content>
                            </Modal.Root>
                        </>
                    )}
                </Layout>
            )}
        </>
    );
};

export default Checkout;
