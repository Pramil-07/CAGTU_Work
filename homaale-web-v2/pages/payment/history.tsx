import {
    ActionIcon,
    Box,
    Flex,
    Indicator,
    Pagination,
    ScrollArea,
    Select,
    Table,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import {
    IconArrowNarrowDown,
    IconArrowNarrowUp,
    IconChevronDown,
    IconChevronUp,
    IconFileSpreadsheet,
    IconSwitchVertical,
    IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";

import Empty from "@/components/common/Empty";
import { Filters } from "@/components/common/Filters";
import { ResetButton } from "@/components/common/ResetButton";
import Layout from "@/components/Layout/Layout";
import { SkeletonTableList } from "@/components/skeletons/SkeletonTableList";
import { TRANSACTION_STATUS } from "@/constants/TRANSACTION_STATUS";
import {
    PriceFilterTypes,
    reset,
    setQuery,
} from "@/features/utils/filterSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useTransactionHistory } from "@/hooks/payment/useTransactionHistory";
import { useCurrency } from "@/currency/CurrencyContext";
import { axiosClient } from "@/utils/axiosClient";
import ConvertAndFormat from "@/components/CurrencyNumberFormatter/ConvertAndFormat";

const TransactionHistory = () => {
    const theme = useMantineTheme();
    const [paginationNumber, setPaginationNumber] = useState(1);
    const [pageSize, setPageSize] = useState<string>("");
    const {globalCurrency} = useCurrency();
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

    const { query, date, amount } = useAppSelector(
        (state) => state.filterReducer
    );

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(reset());
    }, [dispatch]);

    useEffect(() => {
        setPaginationNumber(1);
    }, [query]);

    const { data: paymentHistory, isLoading } = useTransactionHistory(
        paginationNumber,
        pageSize ?? "10",
        query ?? ""
    );
    const elements = paymentHistory?.result?.map((item) => {
        return {
            transactionId: item?.id.substring(0, 8),
            payee: item?.receiver?.full_name,
            payer: item?.sender?.full_name,
            isEarning: item?.earning,
            transactionDate: format(new Date(item?.created_at), "PP, hh:mm a"),
            transactionType: item?.transaction_type,
            methods: item?.payment_method?.name,
            status: item?.status,
            currency: item?.currency?.code,
            amount: `${item?.currency?.code} ${+parseFloat(
                item?.amount
            ).toFixed(2)}`,
            amountNumber: +parseFloat(item?.amount).toFixed(2),
        };
    });

    const render_status_button = (status: string) => {
        switch (status) {
            case TRANSACTION_STATUS.Initiated:
                return {
                    title: TRANSACTION_STATUS.Initiated,
                    color: "#3EAEFF",
                };
            case TRANSACTION_STATUS.Completed:
                return {
                    title: TRANSACTION_STATUS.Completed,
                    color: "#38C675",
                };
            case TRANSACTION_STATUS.dispute:
                return {
                    title: TRANSACTION_STATUS.dispute,
                    color: "#FE5050",
                };
            case TRANSACTION_STATUS.pending:
                return {
                    title: TRANSACTION_STATUS.pending,
                    color: "#F98900",
                };
            case TRANSACTION_STATUS.reverted:
                return {
                    title: TRANSACTION_STATUS.reverted,
                    color: "#297796",
                };
            case TRANSACTION_STATUS.settled:
                return {
                    title: TRANSACTION_STATUS.settled,
                    color: "#495057",
                };
            case TRANSACTION_STATUS.Penalty:
                return {
                    title: TRANSACTION_STATUS.Penalty,
                    color: "#FE5050",
                };

            default:
                break;
        }
    };

    const rows = elements?.map((element) => (
        <tr key={element.transactionId}>
            <td>{element.transactionId}</td>
            <td>{element.payee}</td>
            <td>{element.payer}</td>
            <td>{element.transactionDate}</td>
            <td>{element.transactionType}</td>
            <td>{element.methods}</td>
         
            <td>
                <Text
                    component="p"
                    sx={{
                        textAlign: "center",
                        // display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        textTransform: "capitalize",
                    }}
                    maw={120}
                    p={"6px 24px"}
                    color={render_status_button(element.status)?.color}
                    bg={`${render_status_button(element.status)?.color}33`}
                >
                    {render_status_button(element.status)?.title}
                </Text>
            </td>
            
       
            <td
                style={{
                    display: "flex",
                    alignItems: "center",
                    color: element.isEarning ? "#38C675" : "#FE5050",
                    gap: 6,
                }}
            >
                {element.isEarning ? (
                    <IconChevronUp size={16} stroke={2.5} />
                ) : (
                    <IconChevronDown size={16} stroke={2.5} />
                )}
                {element.amount}
                {/* <ConvertAndFormat
                    number={(element.amountNumber)}
                    globalCurrency={globalCurrency}
                    currency={element.currency}
                    exchangeRate={exchangeInfo} /> */}
            </td>
            <td
        
                style={{
                    // display: "flex",
                    // alignItems: "center",
                    // color: element.isEarning ? "#38C675" : "#FE5050",
                    // gap: 6,
                }}
            >
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: element.isEarning ? "#38C675" : "#FE5050",
                    gap: 6,
                }}
                >
                {element.isEarning ? (
                    <IconChevronUp size={16} stroke={2.5} />
                ) : (
                    <IconChevronDown size={16} stroke={2.5} />
                )}
                {/* {element.amount} */}
                <ConvertAndFormat
                    number={(element.amountNumber)}
                    globalCurrency={globalCurrency}
                    currency={element.currency}
                    exchangeRate={exchangeInfo} />
                    </Box>
            </td>
         
        </tr>
    ));

    return (
        <Layout heading="Transaction History" currentTitle="Transaction History"breadCrumbsItems={[{name:"Payment",href:""}]}>
            <Box
                sx={{
                    border:
                        theme.colorScheme === "dark"
                            ? `1px solid ${theme.colors.gray[7]}`
                            : `1px solid rgba(0, 0, 0, 0.08)`,
                    borderRadius: 4,
                    background:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : "inherit",
                    padding: 16,
                }}
            >
                <>
                    <Flex
                        mb={16}
                        justify={"start"}
                        gap={10}
                        align={{ base: "flex-start", sm: "center" }}
                        direction={{ base: "column", sm: "row" }}
                    >
                        <Filters
                            search
                            statusFilter
                            statusType="transaction"
                            paymentMethod
                            filterDate
                            filterBudget
                            priceType={PriceFilterTypes.amount}
                        />
                        <Flex justify={"flex-start"}>
                            {query && <ResetButton />}
                            {paymentHistory &&
                            paymentHistory.result.length > 0 ? (
                                <CSVLink
                                    data={paymentHistory?.result ?? ""}
                                    filename="transaction_history.csv"
                                    target="_blank"
                                >
                                    <Tooltip
                                        label="Export CSV"
                                        position="bottom"
                                        styles={{
                                            tooltip: {
                                                fontSize: 12,
                                                padding: "3px 8px",
                                                fontWeight: 500,
                                            },
                                        }}
                                    >
                                        <ActionIcon
                                            variant="light"
                                            radius="xl"
                                            size={40}
                                            color="gray.5"
                                            sx={{
                                                cursor: "pointer",
                                            }}
                                        >
                                            <IconFileSpreadsheet
                                                size={22}
                                                stroke={1.75}
                                            />
                                        </ActionIcon>
                                    </Tooltip>
                                </CSVLink>
                            ) : null}
                        </Flex>
                    </Flex>
                    {isLoading ? (
                        <SkeletonTableList />
                    ) : (
                        <ScrollArea>
                            {paymentHistory &&
                            paymentHistory.result.length > 0 ? (
                                <Table verticalSpacing="sm" highlightOnHover>
                                    <thead>
                                    <tr>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text ml={6}>
                                                    Transaction ID
                                                </Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text ml={6}>Payee</Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text ml={6}>Payer</Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"} gap={8}>
                                                <Text ml={6}>
                                                    Transaction Date
                                                </Text>
                                                <Indicator
                                                    inline
                                                    radius={"xl"}
                                                    color={"red"}
                                                    sx={{
                                                        ".mantine-Indicator-indicator":
                                                            {
                                                                width: 15,
                                                            },
                                                    }}
                                                    disabled={!date}
                                                    label={
                                                        <ActionIcon
                                                            variant={
                                                                "transparent"
                                                            }
                                                            w={10}
                                                            radius="xl"
                                                            onClick={() =>
                                                                dispatch(
                                                                    setQuery(
                                                                        {
                                                                            key: "date",
                                                                            value: "",
                                                                        }
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <IconX
                                                                color="white"
                                                                size={12}
                                                            />
                                                        </ActionIcon>
                                                    }
                                                    size={16}
                                                >
                                                    <ActionIcon
                                                        variant={
                                                            date
                                                                ? "filled"
                                                                : "transparent"
                                                        }
                                                        size={"sm"}
                                                        color={"blue"}
                                                        onClick={() =>
                                                            dispatch(
                                                                setQuery({
                                                                    key: "date",
                                                                    value: "&ordering=-created_at",
                                                                })
                                                            )
                                                        }
                                                    >
                                                        {!date && (
                                                            <IconSwitchVertical
                                                                color={
                                                                    theme.colorScheme ===
                                                                    "dark"
                                                                        ? theme
                                                                            .colors
                                                                            .gray[4]
                                                                        : theme
                                                                            .colors
                                                                            .homaaleSlate[5]
                                                                }
                                                                size={16}
                                                            />
                                                        )}

                                                        {date &&
                                                            (date ===
                                                            "&ordering=-created_at" ? (
                                                                <IconArrowNarrowDown
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ) : (
                                                                <IconArrowNarrowUp
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ))}
                                                    </ActionIcon>
                                                </Indicator>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text>Transaction Type</Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text ml={6}>Methods</Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text ml={6}>Status</Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"} gap={8}>
                                                <Text ml={6}>Paid Amount</Text>
                                                <Indicator
                                                    inline
                                                    radius={"xl"}
                                                    color={"red"}
                                                    sx={{
                                                        ".mantine-Indicator-indicator":
                                                            {
                                                                width: 15,
                                                            },
                                                    }}
                                                    disabled={!amount}
                                                    label={
                                                        <ActionIcon
                                                            variant={
                                                                "transparent"
                                                            }
                                                            w={10}
                                                            radius="xl"
                                                            onClick={() =>
                                                                dispatch(
                                                                    setQuery(
                                                                        {
                                                                            key: "amount",
                                                                            value: "",
                                                                        }
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <IconX
                                                                color="white"
                                                                size={12}
                                                            />
                                                        </ActionIcon>
                                                    }
                                                    size={16}
                                                >
                                                    <ActionIcon
                                                        variant={
                                                            amount
                                                                ? "filled"
                                                                : "transparent"
                                                        }
                                                        size={"sm"}
                                                        color={"blue"}
                                                        onClick={() =>
                                                            dispatch(
                                                                setQuery({
                                                                    key: "amount",
                                                                    value: "&ordering=-amount",
                                                                })
                                                            )
                                                        }
                                                    >
                                                        {!amount && (
                                                            <IconSwitchVertical
                                                                color={
                                                                    theme.colorScheme ===
                                                                    "dark"
                                                                        ? theme
                                                                            .colors
                                                                            .gray[4]
                                                                        : theme
                                                                            .colors
                                                                            .homaaleSlate[5]
                                                                }
                                                                size={16}
                                                            />
                                                        )}

                                                        {amount &&
                                                            (amount ===
                                                            "&ordering=-amount" ? (
                                                                <IconArrowNarrowDown
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ) : (
                                                                <IconArrowNarrowUp
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ))}
                                                    </ActionIcon>
                                                </Indicator>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"} gap={8}>
                                                <Text ml={6}>Amount</Text>
                                                <Indicator
                                                    inline
                                                    radius={"xl"}
                                                    color={"red"}
                                                    sx={{
                                                        ".mantine-Indicator-indicator":
                                                            {
                                                                width: 15,
                                                            },
                                                    }}
                                                    disabled={!amount}
                                                    label={
                                                        <ActionIcon
                                                            variant={
                                                                "transparent"
                                                            }
                                                            w={10}
                                                            radius="xl"
                                                            onClick={() =>
                                                                dispatch(
                                                                    setQuery(
                                                                        {
                                                                            key: "amount",
                                                                            value: "",
                                                                        }
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <IconX
                                                                color="white"
                                                                size={12}
                                                            />
                                                        </ActionIcon>
                                                    }
                                                    size={16}
                                                >
                                                    <ActionIcon
                                                        variant={
                                                            amount
                                                                ? "filled"
                                                                : "transparent"
                                                        }
                                                        size={"sm"}
                                                        color={"blue"}
                                                        onClick={() =>
                                                            dispatch(
                                                                setQuery({
                                                                    key: "amount",
                                                                    value: "&ordering=-amount",
                                                                })
                                                            )
                                                        }
                                                    >
                                                        {!amount && (
                                                            <IconSwitchVertical
                                                                color={
                                                                    theme.colorScheme ===
                                                                    "dark"
                                                                        ? theme
                                                                            .colors
                                                                            .gray[4]
                                                                        : theme
                                                                            .colors
                                                                            .homaaleSlate[5]
                                                                }
                                                                size={16}
                                                            />
                                                        )}

                                                        {amount &&
                                                            (amount ===
                                                            "&ordering=-amount" ? (
                                                                <IconArrowNarrowDown
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ) : (
                                                                <IconArrowNarrowUp
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            ))}
                                                    </ActionIcon>
                                                </Indicator>
                                            </Flex>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>{rows}</tbody>
                                </Table>
                            ) : (
                                <Empty
                                    title="No Data Found."
                                    description="You have no transaction history."
                                />
                            )}
                        </ScrollArea>
                    )}
                </>

                {paymentHistory && paymentHistory.result.length > 0 && (
                    <Flex mt={16}>
                        <Select
                            data={["10", "20", "30", "40"]}
                            placeholder="10"
                            onChange={(value) => {
                                if (value) setPageSize(value);
                            }}
                        />
                        <Pagination
                            total={
                                paymentHistory ? paymentHistory?.total_pages : 0
                            }
                            color="orange"
                            size={"md"}
                            value={paginationNumber}
                            onChange={(value) => {
                                setPaginationNumber(value);
                            }}
                        />
                    </Flex>
                )}
            </Box>
        </Layout>
    );
};

export default TransactionHistory;
