import { Alert, Badge, Box, Flex, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Image from "next/image";
import React from "react";

import type { BankWalletProps } from "@/hooks/useBankWallet";

export const BankWalletCard = ({
    data,
}: {
    data: BankWalletProps["result"][0];
}) => {
    const { bank_name, bank_account_number, logo, is_verified, is_primary } =
        data ?? ({} as BankWalletProps["result"][0]);

    const theme = useMantineTheme();
    return (
        <Flex
            gap={15}
            justify={"flex-start"}
            direction={{ base: "column", xs: "row" }}
            w={"100%"}
        >
            <Image
                src={logo ? logo : "/images/placeholder/taskPlaceholder.png"}
                height={50}
                width={80}
                style={{
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                }}
                alt="servicecard-image"
            />
            <Box>
                <h4>{bank_name}</h4>
                <span>{bank_account_number}</span>
                {!is_verified && (
                    <Alert
                        mt={10}
                        sx={{
                            "& span": {
                                color: theme.colors.brand[3],
                                fontSize: 14,
                            },
                        }}
                        p={5}
                    >
                        <Flex align={"center"} justify={"flex-start"} gap={5}>
                            <IconAlertCircle
                                size="1.2rem"
                                color={theme.colors.brand[3]}
                            />
                            <span>Pending verification</span>
                        </Flex>
                    </Alert>
                )}
            </Box>
            {is_primary && (
                <Badge
                    ml={"auto"}
                    fw={400}
                    p={15}
                    color={"blue"}
                    sx={{
                        "& span": {
                            fontSize: 12,
                            textTransform: "capitalize",
                        },
                    }}
                >
                    Primary
                </Badge>
            )}
        </Flex>
    );
};
