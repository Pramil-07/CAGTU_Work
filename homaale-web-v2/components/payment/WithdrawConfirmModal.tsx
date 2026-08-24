import type { MantineNumberSize } from "@mantine/core";
import { Checkbox } from "@mantine/core";
import { Button } from "@mantine/core";
import { Text } from "@mantine/core";
import { Box } from "@mantine/core";
import { Flex } from "@mantine/core";
import { LoadingOverlay } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { Modal, Title } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { FormikHelpers } from "formik";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import React from "react";

import urls from "@/constants/urls";
import type { BankWalletProps } from "@/hooks/useBankWallet";
import type { WithdrawPayload } from "@/types/WithdrawPayload";
import { axiosClient } from "@/utils/axiosClient";

import HomaaleLoader from "../common/HomaaleLoader";
import { toast } from "../common/Toast";
import { BankWalletCard } from "./BankWalletCard";

export const WithdrawConfirmModal = ({
    opened,
    setOpened,
    withdrawPayload,
    selectedBank,
    action,
}: {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    withdrawPayload: WithdrawPayload;
    selectedBank: BankWalletProps["result"][0];
    action?: FormikHelpers<WithdrawPayload>;
}) => {
    const theme = useMantineTheme();

    const { mutate, isLoading } = useMutation<
        any,
        AxiosError<{ non_field_errors: string }>,
        WithdrawPayload
    >(async () => {
        const data = await axiosClient.post<WithdrawPayload>(
            urls.wallet.withdraw,
            {
                bank_account: withdrawPayload.bank_account,
                description: withdrawPayload.description,
            }
        );
        return data;
    });

    const [checked, setChecked] = useState(false);

    const handleSubmition = () => {
        mutate(withdrawPayload, {
            onSuccess: () => {
                setOpened(false);
                toast.success("Your withdrawal request has been submitted");
                action && action.resetForm();
            },
            onError: (e) => {
                toast.error(e.response?.data?.non_field_errors[0]);
            },
        });
    };

    return (
        <Modal.Root
            opened={opened}
            onClose={() => setOpened(false)}
            size={"lg"}
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
                            {"Review your transfer"}
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
                    <Flex justify={"center"} gap={8}>
                        <Text
                            component="p"
                            size={24}
                            fw={400}
                            color={theme.colors.gray[6]}
                            mb={0}
                        >
                            NPR
                        </Text>
                        <Text
                            component="p"
                            size={40}
                            fw={500}
                            color={theme.colors.homaaleSlate[8]}
                            mb={0}
                        >
                            {(+withdrawPayload?.amount).toString()}
                        </Text>
                    </Flex>
                    <span>Transfer to:</span>
                    <Box
                        sx={{
                            border: `1px solid rgba(0, 0, 0, 0.08)`,
                            borderRadius: 4,
                            padding: 16,
                            marginTop: 8,
                        }}
                    >
                        <BankWalletCard data={selectedBank} />
                    </Box>
                    <Checkbox
                        label={
                            <>
                                I agree to the{" "}
                                <Link href={"/homaale-terms-conditions"}>
                                    terms and conditions{" "}
                                </Link>
                                and{" "}
                                <Link href={"/homaale-terms-conditions"}>
                                    Privacy policy.
                                </Link>
                            </>
                        }
                        mb={10}
                        mt={30}
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                    />
                    <Flex
                        justify={"center"}
                        direction={"column"}
                        gap={15}
                        mt={30}
                    >
                        <Button
                            fullWidth
                            onClick={handleSubmition}
                            disabled={!checked}
                            id={"transfer-btn"}
                        >
                            Request Withdraw
                        </Button>
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setOpened(false)}
                        >
                            Cancel
                        </Button>
                    </Flex>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
