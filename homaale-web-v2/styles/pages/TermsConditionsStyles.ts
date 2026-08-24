import { createStyles } from "@mantine/core";

export const useTermsConditionsStyles = createStyles((theme) => ({
    root: {
        "& p": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[7],
            marginBottom: 24,
            marginTop: 8,
            textAlign: "justify",
        },
        "& h2": {
            fontWeight: 600,
            fontSize: 16,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[8],
            marginTop: 44,
            marginBottom: 24,
        },
        "& h3": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[8],
            fontWeight: 500,
            fontSize: 14,
        },
    },
}));
