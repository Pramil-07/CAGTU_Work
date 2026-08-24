import { Box, Flex, Grid, Text, useMantineTheme } from "@mantine/core";
import { IconBuildingBank, IconWallet } from "@tabler/icons-react";
import React, { useState } from "react";

import Ellipsis from "@/components/common/Ellipsis";
import Layout from "@/components/Layout/Layout";
import { AddBankWalletForm } from "@/components/payment/AddBankWalletForm";
import { BankWalletCard } from "@/components/payment/BankWalletCard";
import type { BankWalletProps } from "@/hooks/useBankWallet";
import { useBankWallet } from "@/hooks/useBankWallet";
import { useUserStatus } from "@/hooks/useUserStatus";

const Billing = () => {
    const { data } = useBankWallet();

    const walletOnly = data?.result?.filter((item) => item.is_wallet);
    const bankOnly = data?.result?.filter((item) => !item.is_wallet);

    const [bankModal, setBankModal] = useState(false);
    const [walletModal, setWalletModal] = useState(false);

    const theme = useMantineTheme();

    const { checkStatus } = useUserStatus();

    const AccountWrapper = ({
        title,
        data,
    }: {
        title: string;
        data: BankWalletProps["result"];
    }) => (
        <Box mb={60}>
            <h4>{`${title} (${data?.length})`}</h4>
            <Grid mt={20}>
                {data?.length > 0 ? (
                    data?.map((item, index) => (
                        <Grid.Col sm={6} key={index}>
                            <Flex
                                sx={{
                                    border: `1px solid ${
                                        theme.colorScheme === "dark"
                                            ? theme.colors.homaaleSlate[6]
                                            : "rgba(0, 0, 0, 0.08)"
                                    }`,
                                    borderRadius: 4,
                                    padding: "18px 32px",
                                }}
                            >
                                <BankWalletCard data={item} />
                                <Ellipsis
                                    type={"bankWallet"}
                                    id={item?.id.toString()}
                                />
                            </Flex>
                        </Grid.Col>
                    ))
                ) : (
                    <Text
                        component="p"
                        size={14}
                        pl={15}
                        color={theme.colors.homaaleSlate[5]}
                    >
                        No Linked accounts found. Please link an account.{" "}
                    </Text>
                )}
            </Grid>
        </Box>
    );

    return (
        <Layout heading="Billing & Payments" currentTitle="Billing & Payments"breadCrumbsItems={[{name:"Settings",href:""}]}>
            <Box
                component="section"
                id="billing-payments-section"
                py={48}
                px={32}
                sx={{
                    border: `1px solid ${
                        theme.colorScheme === "dark"
                            ? theme.colors.homaaleSlate[6]
                            : "rgba(0, 0, 0, 0.08)"
                    }`,
                    borderRadius: 2,
                }}
            >
                {walletOnly && (
                    <AccountWrapper
                        title={"Digital Wallet"}
                        data={walletOnly}
                    />
                )}
                {bankOnly && (
                    <AccountWrapper title={"Linked Bank"} data={bankOnly} />
                )}

                <h4>Add Account</h4>

                <Flex
                    justify={"flex-start"}
                    direction={{ base: "column", xs: "row" }}
                    gap={12}
                >
                    <Flex
                        align={"center"}
                        justify={"flex-start"}
                        sx={{
                            border: `1px solid ${
                                theme.colorScheme === "dark"
                                    ? theme.colors.homaaleSlate[6]
                                    : "rgba(0, 0, 0, 0.08)"
                            }`,
                            borderRadius: 4,
                            cursor: "pointer",
                            "&:hover": {
                                background:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.brand[6]
                                        : theme.colors.brand[2],
                                transition: "0.35s all ease",
                            },
                        }}
                        py={12}
                        px={17}
                        gap={6}
                        onClick={() =>
                            checkStatus("kyc")
                                ? setBankModal(true)
                                : setBankModal(false)
                        }
                    >
                        <IconBuildingBank size={24} /> Bank
                    </Flex>
                    <Flex
                        align={"center"}
                        justify={"flex-start"}
                        sx={{
                            border: `1px solid ${
                                theme.colorScheme === "dark"
                                    ? theme.colors.homaaleSlate[6]
                                    : "rgba(0, 0, 0, 0.08)"
                            }`,
                            borderRadius: 4,
                            cursor: "pointer",
                            "&:hover": {
                                background:
                                    theme.colorScheme === "dark"
                                        ? theme.colors.brand[6]
                                        : theme.colors.brand[2],
                                transition: "0.35s all ease",
                            },
                        }}
                        py={12}
                        px={17}
                        gap={6}
                        onClick={() =>
                            checkStatus("kyc")
                                ? setWalletModal(true)
                                : setWalletModal(false)
                        }
                    >
                        <IconWallet size={24} /> Wallet
                    </Flex>
                </Flex>
            </Box>
            {bankModal && (
                <AddBankWalletForm
                    opened={bankModal}
                    setOpened={setBankModal}
                />
            )}
            {walletModal && (
                <AddBankWalletForm
                    opened={walletModal}
                    setOpened={setWalletModal}
                    is_wallet
                />
            )}
        </Layout>
    );
};

export default Billing;
