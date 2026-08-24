import {
    ActionIcon,
    createStyles,
    Flex,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconArrowNarrowDown,
    IconArrowNarrowUp,
    IconReceipt,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React from "react";

import { useMyWallet } from "@/hooks/payment/useWallet";

const MyEarnings = () => {
    const { data: myWallet } = useMyWallet();

    const router = useRouter();
    const { classes } = useStyles();
    const theme = useMantineTheme();

    return (
        <div className={classes.wrapper}>
            <div className="whole-cont-earning">
                <Text className="current-balance">Current Balance</Text>
                <Text component="p" className="current-amount">
                    {myWallet?.length !== 0 && myWallet
                        ? `${+parseFloat(myWallet[0].available_balance).toFixed(
                              2
                          )}  ${myWallet[0].currency} `
                        : "0 "}
                </Text>
                <Flex
                    align={"center"}
                    justify={"space-between"}
                    className=" lower-transaction"
                >
                    <Text component="p" className="latest-transaction">
                        Latest Transaction:
                    </Text>
                    <Flex>
                        <Flex align={"center"} justify={"center"} mr={16}>
                            <Text className=" weekly-points">
                                {myWallet?.length !== 0 && myWallet
                                    ? `${myWallet[0].last_received}`
                                    : "0 "}
                            </Text>
                            <IconArrowNarrowUp
                                style={{ fontSize: "16px", color: "#38C675" }}
                            />
                        </Flex>
                        <Flex align={"center"} justify={"start"}>
                            <Text className="weekly-points">
                                {myWallet?.length !== 0 && myWallet
                                    ? `${myWallet[0].last_paid}`
                                    : "0 "}
                            </Text>
                            <IconArrowNarrowDown
                                style={{ fontSize: "16px", color: "#FE5050" }}
                            />
                        </Flex>
                    </Flex>
                </Flex>
                <ActionIcon className="div-invoice">
                    <IconReceipt
                        style={{
                            fontSize: "24px",
                            // cursor: "pointer",
                            color: theme.colors.homaaleSlate[5],
                        }}
                        onClick={() => router.push("/payment/earnings")}
                    />
                </ActionIcon>
            </div>
        </div>
    );
};
const useStyles = createStyles((theme) => ({
    wrapper: {
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : "#F1F8FF",
        position: "relative",
        borderRadius: "4px",
        ".whole-cont-earning": {
            padding: "16px",
            ".current-balance": {
                fontSize: 12,
            },
            ".current-amount": {
                color: theme.colors.brand[4],
                fontSize: 32,
                fontWeight: 500,
            },
            ".lower-transaction": {
                marginTop: 14,
                ".latest-transaction": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.homaaleSlate[7],
                    fontWeight: 600,
                    fontSize: 14,
                },
                ".weekly-points": {
                    // color:
                    //     theme.colorScheme === "dark"
                    //         ? theme.colors.dark[0]
                    //         : theme.colors.homaaleSlate[7],
                    fontWeight: 500,
                    fontSize: 14,
                },
            },
            ".div-invoice": {
                position: "absolute",
                top: 15,
                right: 20,
            },
        },
    },
}));

export default MyEarnings;
