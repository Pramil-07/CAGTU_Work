import { Box, Flex, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";

import { useUserStatus } from "@/hooks/useUserStatus";

export type UserInfoProps = {
    icon: any;
    info: string;
    link?: string;
    is_requested?: boolean;
    no_redirect?: boolean;
};
const UserInfo = ({
    icon,
    info,
    link,
    is_requested,
    no_redirect,
}: UserInfoProps) => {
    const theme = useMantineTheme();
    const router = useRouter();
    const { checkStatus } = useUserStatus();
    const handleClick = () => {
        if (link && !no_redirect) {
            router.push(link);
        } else if (!no_redirect && checkStatus("kyc")) {
            router.push({
                pathname: "/post/entity",
                query: {
                    is_requested: is_requested,
                },
            });
        }
    };
    return (
        <Flex
            className={`icon_wrapper`}
            mb={24}
            justify={"flex-start"}
            gap={12}
        >
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    background:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[8]
                            : `${theme.colors.brand[0]}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                }}
            >
                {icon}
            </Box>
            <h5
                className={`${link || is_requested ? "link" : ""}`}
                onClick={() => handleClick()}
            >
                {info}
            </h5>
        </Flex>
    );
};

export default UserInfo;
