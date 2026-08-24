import { Alert, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import React from "react";

const NoDataAlert = ({ message, ...restProps }: { message?: string }) => {
    const theme = useMantineTheme();
    return (
        <Alert
            {...restProps}
            icon={
                <IconAlertCircle size="1rem" color={theme.colors.brand[4]} />
            }
            color={theme.colors.brand[4]}
            variant="outline"
            w={"100%"}
            sx={{
                ".mantine-Alert-message": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.homaaleSlate[7],
                    fontWeight: 500,
                },
            }}
        >
            {message ?? "No Data available."}
        </Alert>
    );
};

export default NoDataAlert;
