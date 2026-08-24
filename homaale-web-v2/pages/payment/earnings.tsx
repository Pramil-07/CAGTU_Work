import {
    ActionIcon,
    Box,
    Button,
    createStyles,
    Flex,
    Grid,
    Indicator,
    Pagination,
    ScrollArea,
    Select,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconArrowNarrowDown,
    IconArrowNarrowUp,
    IconBusinessplan,
    IconCoin,
    IconCurrencyDollar,
    IconFileSpreadsheet,
    IconPig,
    IconSwitchVertical,
    IconX,
} from "@tabler/icons-react";
import {format} from "date-fns";
import React, {useEffect, useState} from "react";
import {CSVLink} from "react-csv";

import Empty from "@/components/common/Empty";
import {Filters} from "@/components/common/Filters";
import Layout from "@/components/Layout/Layout";
import {SkeletonEarningsCard} from "@/components/skeletons/SkeletonMyEarningsCard";
import {SkeletonTableList} from "@/components/skeletons/SkeletonTableList";
import {setQuery} from "@/features/utils/filterSlice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useEarnings} from "@/hooks/payment/useEarnings";
import {useMyWallet} from "@/hooks/payment/useWallet";
import {GoAlert, GoAlertFill} from "react-icons/go";
import ConvertAndFormat from "@/components/CurrencyNumberFormatter/ConvertAndFormat";
import { useCurrency } from "@/currency/CurrencyContext";
import { axiosClient } from "@/utils/axiosClient";
import MyEarnings from "@/components/profile/MyEarnings";
import { Currency } from "lucide-react";
import { Result } from "postcss";

const Earnings = () => {
    const {classes, theme} = useStyles();
    const [paginationNumber, setPaginationNumber] = useState(1);
    const [pageSize, setPageSize] = useState<string>("");
    const {query, amount, date} = useAppSelector(
        (state) => state.filterReducer
    );
    const {globalCurrency}= useCurrency();

    const {data: earningHistory, isLoading} = useEarnings(
        paginationNumber,
        pageSize ?? "10",
        query
    );
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

    const dispatch = useAppDispatch();

    const {data: walletData, isLoading: isWalletLoading} = useMyWallet();
  

    const myWallet = walletData && walletData[0];
    console.log("earnings", Number(myWallet?.total_income))

    const elements = earningHistory?.result?.map((item) => {
        return {
            id: item?.id,
            transactionId: item?.transaction,
            payer: item?.sender,
            details: item?.task_title.toString(),
            transactionDate: format(new Date(item?.created_at), "PP, hh:mm a"),
            amount: parseFloat(item?.amount).toFixed(2),
            currency: item?.currency?.code,
            
        };
    });
    console.log(earningHistory?.result , "Result");

    const rows = elements?.map((element) => (
        <tr key={element?.id}>
            <td>{element.transactionId.substring(0, 8)}</td>
            <td>{element.payer}</td>
            <td>{element.details}</td>
            <td>{element.transactionDate}</td>

            <td>
                {parseFloat(element.amount) > 0 ? (
                    <Button
                        sx={{
                            background: "#38C67520",
                            color: "#38C675",
                            "&:not([data-disabled]):hover": {
                                background: "#38C67520",
                            },
                        }}
                        compact
                        p={"0 24px"}
                    >
                        Received
                    </Button>
                ) : (
                    <Button
                        compact
                        p={"0 24px"}
                        sx={{
                            background: "#FE505020",
                            color: "#FE5050",
                            "&:not([data-disabled]):hover": {
                                background: "#FE505020",
                            },
                        }}
                    >
                        Paid
                    </Button>
                )}
            </td>

            <td
                style={{
                    color: `${
                        parseFloat(element.amount) > 0 ? "#38C675" : "#FE5050"
                    }`,
                }}
            >
                {/* {element.amount}  */}
                <ConvertAndFormat globalCurrency={globalCurrency} exchangeRate={exchangeInfo} number={element.amount} currency={element.currency||"NPR"} />
            </td>
        </tr>
    ));
   

    return (
        <Layout heading="My Earnings" currentTitle="Earnings"breadCrumbsItems={[{name:"Payment",href:""}]}>
            {isWalletLoading ? (
                <SkeletonEarningsCard/>
            ) : (
                <>
                    <p
                        className="text-sm flex gap-2 text-red-500 mx-1 font-medium  mt-1">
                        <GoAlertFill className=" text-lg "/> Cannot withdraw less than ₹100.
                    </p>
                    <Grid gutter={10} className={classes.wrapper}>

                        <Grid.Col xs={3} sm={6} lg={3}>
                            <Flex className="box-wrapper">
                                <Box>
                                    <Text
                                        component="p"
                                        className="amount"
                                        color={theme.colors.homaaleSlate[5]}
                                    >
                                        {/* {myWallet?.currency}{" "} */}
                                       <ConvertAndFormat number={myWallet?.available_balance
                                                ? +parseFloat(
                                                    myWallet?.available_balance
                                                ).toFixed(2)
                                                : "0"} globalCurrency={globalCurrency} exchangeRate={exchangeInfo||89}currency={myWallet?.currency} />
                                    </Text>
                                    <Text
                                        className="amount-title"
                                        color={
                                            theme.colors.homaaleSlate[
                                                theme.colorScheme === "dark"
                                                    ? 2
                                                    : 4
                                                ]
                                        }
                                        size={16}
                                        weight={500}
                                        truncate
                                        lineClamp={1}
                                    >
                                        Current Balance
                                    </Text>
                                </Box>
                                <IconCoin size={40} className="icon"/>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col xs={3} sm={6} lg={3}>
                            <Flex className="box-wrapper">
                                <Box>
                                    <Text
                                        component="p"
                                        className="amount"
                                        color={"green.6"}
                                    >
                                        {/* {myWallet?.currency}{" "}
                                        {myWallet?.total_income ?? "0"} */}
                                        <ConvertAndFormat number={myWallet?.total_income ?? "0"} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={myWallet?.currency}/>
                                    </Text>
                                    <Text
                                        color={
                                            theme.colors.homaaleSlate[
                                                theme.colorScheme === "dark" ? 2 : 4
                                                ]
                                        }
                                        size={16}
                                        weight={500}
                                        className="amount-title"
                                        truncate
                                        lineClamp={1}

                                    >
                                        Total Earnings
                                    </Text>

                                </Box>

                                <IconPig size={40} className="icon"/>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col xs={3} sm={6} lg={3}>
                            <Flex className="box-wrapper">
                                <Box>
                                    <Text
                                        component="p"
                                        className="amount"
                                        color={"red.6"}
                                    >
                                        {/* {myWallet?.currency}{" "}
                                        {myWallet?.total_withdrawals ?? "0"} */}
                                        <ConvertAndFormat number={myWallet?.total_withdrawals ?? "0"} globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={myWallet?.currency}/>
                                    </Text>
                                    <Text
                                        color={
                                            theme.colors.homaaleSlate[
                                                theme.colorScheme === "dark"
                                                    ? 2
                                                    : 4
                                                ]
                                        }
                                        size={16}
                                        weight={500}
                                        className="amount-title"
                                        truncate
                                        lineClamp={1}
                                    >
                                        Total Withdrawals
                                    </Text>
                                </Box>
                                <IconBusinessplan size={40} className="icon"/>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col xs={3} sm={6} lg={3}>
                            <Flex className="box-wrapper">
                                <Box>
                                    <Text
                                        component="p"
                                        className="amount"
                                        color={"orange"}
                                    >
                                        {/* {myWallet?.currency}{" "}
                                        {myWallet?.frozen_amount
                                            ? +parseFloat(
                                                myWallet?.frozen_amount
                                            ).toFixed(2)
                                            : "0"} */}
                                            <ConvertAndFormat number= {myWallet?.frozen_amount
                                            ? +parseFloat(
                                                myWallet?.frozen_amount
                                            ).toFixed(2)
                                            : "0"}globalCurrency={globalCurrency} exchangeRate={exchangeInfo} currency={myWallet?.currency}/>
  
                                    
                                    </Text>
                                    <Text
                                        color={
                                            theme.colors.homaaleSlate[
                                                theme.colorScheme === "dark"
                                                    ? 2
                                                    : 4
                                                ]
                                        }
                                        size={16}
                                        weight={500}
                                        className="amount-title"
                                        truncate
                                        lineClamp={1}
                                    >
                                        Pending Amount
                                    </Text>
                                </Box>
                                <IconCurrencyDollar
                                    size={40}
                                    className="icon"
                                />
                            </Flex>
                        </Grid.Col>

                    </Grid>
                </>
            )}

            <Box
                sx={{
                    background:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : "inherit",
                    border:
                        theme.colorScheme === "dark"
                            ? `1px solid ${theme.colors.gray[7]}`
                            : `1px solid rgba(0, 0, 0, 0.08)`,
                    borderRadius: 4,
                    padding: "12px 32px",
                    marginTop: 24,
                }}
            >
                <>
                    <Flex mb={16} justify={"start"}>
                        <Filters search/>
                        {earningHistory && earningHistory.result.length > 0 ? (
                            <CSVLink
                                data={earningHistory?.result ?? ""}
                                filename="my_earnings.csv"
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

                    {isLoading ? (
                        <SkeletonTableList/>
                    ) : (
                        <ScrollArea>
                            {earningHistory &&
                            earningHistory.result.length > 0 ? (
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
                                                <Text ml={6}>Paid by</Text>
                                            </Flex>
                                        </th>
                                        <th>
                                            <Flex justify={"start"}>
                                                <Text ml={6}>Paid for</Text>
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
                                                <Text ml={6}>Status</Text>
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
                                    description="You have no earning history."
                                />
                            )}
                        </ScrollArea>
                    )}
                </>
                {earningHistory && earningHistory.result.length > 0 && (
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
                                earningHistory ? earningHistory?.total_pages : 0
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

export default Earnings;

const useStyles = createStyles((theme) => ({
    wrapper: {
        ".box-wrapper": {
            padding: "24px ",
            border:
                theme.colorScheme === "dark"
                    ? `1px solid ${theme.colors.gray[7]}`
                    : `1px solid rgba(0, 0, 0, 0.08)`,
            borderRadius: 4,
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.darkBackground[0]
                    : "#F9FAFB",
            ".amount": {
                // color: theme.colors.homaaleSlate[
                //     theme.colorScheme === "dark" ? 6 : 8
                // ],
                fontSize: 16,
                fontWeight: 500,
                [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
                    fontSize: 18,
                },
            },
            ".amount-title": {
                whiteSpace: "break-spaces",
                fontSize: 12,
                fontWeight: 500,
                [`@media (min-width: ${theme.breakpoints.sm}px)`]: {
                    fontSize: 14,
                },
            },
            ".icon": {
                color: theme.colors.homaaleSlate[5],
                display: "inline-block",
                [`@media (min-width: ${theme.breakpoints.xs}px)`]: {
                    display: "none",
                },
                [`@media (min-width: ${theme.breakpoints.md}px)`]: {
                    display: "inline-block",
                },
            },
        },
    },
}));
