import { Alert, Box, Flex } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { FormikHelpers } from "formik";
import { Form, Formik } from "formik";
import React, { useState } from "react";

import { useMyWallet } from "@/hooks/payment/useWallet";
import type { BankWalletProps } from "@/hooks/useBankWallet";
import { useWithdrawStyles } from "@/styles/pages/WithdrawStyles";
import type { WithdrawPayload } from "@/types/WithdrawPayload";
import { WithdrawFormSchema } from "@/utils/validation/WithdrawFormValidation";

import DescriptionField from "../common/form/DescriptionField";
import FormButton from "../common/form/FormButton";
import NumberField from "../common/form/NumberField";
import { WithdrawConfirmModal } from "./WithdrawConfirmModal";
import ConvertAndFormat from "../CurrencyNumberFormatter/ConvertAndFormat";
import { useCurrency } from "@/currency/CurrencyContext";

export const PayTransferForm = ({
    bankId,
    selectedBank,
}: {
    bankId: number | null;
    selectedBank?: BankWalletProps["result"][0];
}) => {
    const { classes, theme } = useWithdrawStyles();

    const { data: walletData } = useMyWallet();

    const [confirmModal, setConfirmModal] = useState(true);

    const [withdrawPayload, setWithdrawPayload] = useState<WithdrawPayload|null>(null);
    const [action, setAction] = useState<FormikHelpers<WithdrawPayload>>();
    const{globalCurrency}= useCurrency();
    
    return (
        <Box py={16} px={{ base: 20, xs: 48 }} className={classes.PayForm}>
            {walletData && (
                <Flex
                    justify={"center"}
                    direction={"column"}
                    className={"current_balance"}
                    gap={16}
                >
                    Your Current Balance:
                    <p>
                        {/* {walletData[0]?.currency}{" "} */}
                        <span>
                            {/* {walletData[0]?.available_balance
                                ? +parseFloat(walletData[0]?.available_balance)
                                : 0} */}
                                <ConvertAndFormat
                                number={+parseFloat(
                                    walletData[0]?.available_balance
                                )}
                                currency={walletData[0]?.currency}
                                globalCurrency={globalCurrency} exchangeRate={89} />                                   
                        </span>
                    </p>
                </Flex>
            )}

            {walletData && (
                <Formik
                    initialValues={{
                        amount: walletData[0]?.available_balance ?? "0",
                        bank_account: bankId ?? null,
                        description: "",
                    }}
                    enableReinitialize
                    validationSchema={WithdrawFormSchema(
                        parseInt(walletData[0]?.available_balance),
                        walletData[0]?.minimum_withdraw
                    )}
                    onSubmit={(value, action) => {
                        setWithdrawPayload({
                            amount: value.amount,
                            bank_account: bankId,
                            description: value.description,
                        });
                        setAction(action);
                        setConfirmModal(true);
                    }}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <NumberField
                                id="amount"
                                name="amount"
                                label={"Withdrawable amount"}
                                placeholder={(+walletData[0]
                                    ?.available_balance).toString()}
                                disabled={true}
                                touch={touched.amount}
                                error={errors.amount}
                                minimum={100}
                            />
                            <Alert mb={24}>
                                <Flex
                                    align={"center"}
                                    justify={"flex-start"}
                                    gap={5}
                                    sx={{
                                        "& span": {
                                            color: theme.colors.brand[3],
                                        },
                                    }}
                                >
                                    <IconAlertCircle
                                        size="1.2rem"
                                        color={theme.colors.brand[3]}
                                    />
                                    {!walletData[0]?.available_balance ? (
                                        <span>
                                            You do not have sufficient balance
                                        </span>
                                    ) : (
                                        <span>
                                            The minimum amount that can be
                                            withdrawn from the account is{" "}
                                            {walletData[0]?.currency}.
                                            {walletData[0]?.minimum_withdraw}.
                                        </span>
                                    )}
                                </Flex>
                            </Alert>
                            <DescriptionField
                                id="description"
                                name={"description"}
                                disabled={!walletData[0]?.available_balance}
                                label={"Add Note"}
                                placeholder={"Note here"}
                                touch={touched.description}
                                error={errors.description}
                            />
                            {errors.bank_account && touched.bank_account && (
                                <Alert mb={24} color={"red"}>
                                    <Flex
                                        align={"center"}
                                        justify={"flex-start"}
                                        gap={5}
                                        sx={{
                                            "& span": {
                                                color: theme.colors.status[1],
                                            },
                                        }}
                                    >
                                        <IconAlertCircle
                                            size="1.2rem"
                                            color={theme.colors.status[1]}
                                        />
                                        <span>
                                            Please choose an account first to
                                            continue
                                        </span>
                                    </Flex>
                                </Alert>
                            )}

                            <FormButton
                                name={"Proceed"}
                                id={"Proceed-btn"}
                                type="submit"
                                 disabled={!walletData[0]?.available_balance}
                            />
                        </Form>
                    )}
                </Formik>
            )}
            {confirmModal && withdrawPayload && selectedBank && (
                <WithdrawConfirmModal
                    opened={confirmModal}
                    setOpened={setConfirmModal}
                    selectedBank={selectedBank}
                    withdrawPayload={withdrawPayload}
                    action={action}
                />
            )}
        </Box>
    );
};
