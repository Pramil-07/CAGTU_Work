import {Accordion, Box, Flex, Radio, useMantineTheme} from "@mantine/core";
import {IconBuildingBank, IconPlus, IconWallet} from "@tabler/icons-react";
import type {Dispatch, SetStateAction} from "react";
import React, {useState} from "react";

import type {BankWalletProps} from "@/hooks/useBankWallet";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useWithdrawStyles} from "@/styles/pages/WithdrawStyles";

import {AddBankWalletForm} from "./AddBankWalletForm";
import {BankWalletCard} from "./BankWalletCard";

export const AddPayAccount = ({
                                  bankId,
                                  setbankId,
                                  data,
                              }: {
    bankId: number | null;
    setbankId: Dispatch<SetStateAction<number | null>>;
    data: BankWalletProps|null;
}) => {
    const {classes} = useWithdrawStyles();

    const [bankModal, setBankModal] = useState(false);
    const [walletModal, setWalletModal] = useState(false);

    const theme = useMantineTheme();

    const {checkStatus} = useUserStatus();
    console.log(bankModal)
    console.log(walletModal)
    console.log("withdrawl", data)

    return (
        <Box
            py={16}
            px={{base: 20, xs: 48}}
            mb={24}
            className={classes.accounts}
        >
            <h2>Transfer to Saved Accounts</h2>
            <Radio.Group
                name="favoriteFramework"
                value={bankId?.toString()}
                onChange={(value) => setbankId(parseInt(value))}
                sx={{
                    ".mantine-Radio-inner": {
                        top: "40%",
                    },
                }}
            >
                {data?.result?.map((item, index) => (
                    <Radio
                        w={"100%"}
                        key={index}
                        disabled={!item.is_verified}
                        className={classes.cardSelector}
                        label={<BankWalletCard data={item}/>}
                        value={item?.id.toString()}
                    />
                ))}
            </Radio.Group>

            <Accordion
                variant="contained"
                chevronPosition="left"
                styles={{
                    chevron: {
                        "&[data-rotate]": {
                            transform: "rotate(45deg)",
                        },
                    },
                }}
                chevron={
                    <Box
                        bg={theme.colorScheme === "dark" ? "dark.6" : "gray.0"}
                        p={4}
                        ml={5}
                    >
                        <IconPlus/>
                    </Box>
                }
                mt={24}
            >
                <Accordion.Item value="Bank">
                    <Accordion.Control>
                        <h5>Add Additional Account</h5>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Flex
                            justify={"flex-start"}
                            direction={{base: "column", xs: "row"}}
                            gap={12}
                        >
                            <Flex
                                align={"center"}
                                justify={"flex-start"}
                                gap={6}
                                className={"account__selector"}
                                onClick={() => {
                                    checkStatus("kyc")
                                        ? setBankModal(true)
                                        : setBankModal(false);
                                }}
                            >
                                <IconBuildingBank size={24}/> Bank
                            </Flex>
                            <Flex
                                align={"center"}
                                justify={"flex-start"}
                                gap={6}
                                className={"account__selector"}
                                onClick={() =>
                                    checkStatus("kyc")
                                        ? setWalletModal(true)
                                        : setWalletModal(false)
                                }
                            >
                                <IconWallet size={24}/> Wallet
                            </Flex>
                        </Flex>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
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
        </Box>
    );
};
