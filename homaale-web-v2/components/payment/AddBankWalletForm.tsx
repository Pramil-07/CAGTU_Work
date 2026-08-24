import type { MantineNumberSize } from "@mantine/core";
import { Checkbox } from "@mantine/core";
import { Button } from "@mantine/core";
import { LoadingOverlay } from "@mantine/core";
import { Flex } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Modal, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import React from "react";

import urls from "@/constants/urls";
import { useBankBranchOptions } from "@/hooks/useBankBranchOptions";
import { useBankOptions } from "@/hooks/useBankOptions";
import type { AddBankPayload } from "@/types/AddBankPayload";
import { axiosClient } from "@/utils/axiosClient";
import { addBankWalletSchema } from "@/utils/validation/AddBankValidation";

import FormButton from "../common/form/FormButton";
import InputField from "../common/form/InputField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";

export const AddBankWalletForm = ({
    opened,
    setOpened,
    is_wallet = false,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    is_wallet?: boolean;
}) => {
    const theme = useMantineTheme();

    const { mutate, isLoading } = useMutation<any, Error, AddBankPayload>(
        async (payload) => {
            const { data } = await axiosClient.post<AddBankPayload>(
                urls.profile.bank_account,
                payload
            );
            return data;
        }
    );

    const { data: bankOptions = [] } = useBankOptions(is_wallet);

    const [bankFilter, setBankFilter] = useState("");

    const { data: bankBankOptions = [] } = useBankBranchOptions(bankFilter);

    const queryClient = useQueryClient();

    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            size={"xl"}
            scrollAreaComponent={Modal.NativeScrollArea}
            closeOnClickOutside={false}
        >
            <Modal.Overlay
                sx={{
                    opacity: 0.55,
                    blur: 3,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : theme.colors.gray[4],
                }}
            />
            <Modal.Content
                p={
                    {
                        base: "5px",
                        sm: "10px ",
                        lg: "20px",
                    } as unknown as MantineNumberSize
                }
                sx={{
                    "& h3": {
                        marginBottom: 0,
                    },
                }}
            >
                <Modal.Header sx={{ position: "relative" }}>
                    <Modal.Title>
                        <Title order={3} size={20} weight={500} mb={32}>
                            {is_wallet ? "Wallet Details" : "Bank Details"}
                        </Title>
                    </Modal.Title>
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body
                    sx={{
                        "& p": {
                            color: theme.colors.gray[7],
                            fontWeight: 400,
                            marginBottom: 16,
                            "& span": { color: theme.colors.gray[8] },
                        },
                    }}
                >
                    <LoadingOverlay
                        loader={<HomaaleLoader />}
                        visible={isLoading}
                        sx={{ position: "fixed", inset: 0 }}
                    />
                    <Formik
                        initialValues={{
                            bank_name: null,
                            branch_name: null,
                            bank_account_name: "",
                            bank_account_number: "",
                            is_primary: false,
                        }}
                        validationSchema={addBankWalletSchema(is_wallet)}
                        onSubmit={async (value: AddBankPayload) =>
                            mutate(value, {
                                onSuccess: async (data) => {
                                    toast.success(data.message);
                                    queryClient.invalidateQueries([
                                        "bank-wallet-listing",
                                    ]);
                                    setOpened(false);
                                },
                                onError: (e: any) => {
                                    console.log(
                                        "🚀 ~ file: ReviewModal.tsx:122 ~ e:",
                                        e
                                    );
                                },
                            })
                        }
                    >
                        {({ errors, touched, values, setFieldValue }) => (
                            <Form>
                                <SelectField
                                    id="bank_name"
                                    name={"bank_name"}
                                    label={
                                        is_wallet ? "Wallet Name" : "Bank Name"
                                    }
                                    handleChange={(data) => {
                                        setBankFilter(data);
                                        setFieldValue("bank_name", data);
                                        setFieldValue("branch_name", "");
                                    }}
                                    placeholder={
                                        is_wallet
                                            ? "Select Wallet"
                                            : "Select Bank"
                                    }
                                    data={bankOptions}
                                    touch={touched.bank_name}
                                    error={errors.bank_name}
                                    data-autofocus
                                    withAsterisk
                                />
                                {!is_wallet && (
                                    <SelectField
                                        id="branch_name"
                                        name={"branch_name"}
                                        label={"Branch Address"}
                                        disabled={!bankFilter}
                                        handleChange={(data) => {
                                            setFieldValue("branch_name", data);
                                        }}
                                        placeholder="Select Branch"
                                        data={bankBankOptions}
                                        touch={touched.branch_name}
                                        error={errors.branch_name}
                                        withAsterisk
                                    />
                                )}

                                <InputField
                                    id="bank_account_name"
                                    name={"bank_account_name"}
                                    label={
                                        is_wallet
                                            ? "Account Name"
                                            : "Bank Account Name"
                                    }
                                    placeholder="Account Name"
                                    touch={touched.bank_account_name}
                                    error={errors.bank_account_name}
                                    withAsterisk
                                />
                                <InputField
                                    id="bank_account_number"
                                    name={"bank_account_number"}
                                    label={
                                        is_wallet
                                            ? "Account Number"
                                            : "Bank Account Number"
                                    }
                                    placeholder="Enter Account Number"
                                    touch={touched.bank_account_number}
                                    error={errors.bank_account_number}
                                    withAsterisk
                                />
                                <Checkbox
                                    label={"Set as Primary "}
                                    mb={10}
                                    checked={values.is_primary}
                                    onChange={(event) =>
                                        setFieldValue(
                                            "is_primary",
                                            event.target.checked
                                        )
                                    }
                                    error={
                                        touched.is_primary && errors.is_primary
                                            ? errors?.is_primary
                                            : null
                                    }
                                />
                                <Flex gap={30} mt={40} justify={"center"}>
                                    <Button
                                        variant={"outline"}
                                        onClick={() => setOpened(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <FormButton
                                        name={"Save"}
                                        id={"bank-submit-btn"}
                                        type="submit"
                                    />
                                </Flex>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
