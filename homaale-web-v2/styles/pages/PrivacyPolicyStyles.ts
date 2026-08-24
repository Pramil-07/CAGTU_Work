import { createStyles } from "@mantine/core";

export const usePrivacyPolicyStyles = createStyles((theme) => ({
    root: {
        "& p": {
            textAlign: "justify",
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[7],
        },
        "& h2": {
            fontWeight: 600,
            fontSize: 16,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[8],
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
