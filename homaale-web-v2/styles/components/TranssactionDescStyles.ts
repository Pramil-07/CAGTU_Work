import { createStyles } from "@mantine/core";

export const useTransactionDescStyles = createStyles((theme) => ({
    root: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 34px",
        background:
            theme.colorScheme === "dark"
                ? theme.colors.gray[9]
                : theme.colors.homaaleGrey[0],
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[8]}`
                : "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 6,
        ".desc_wrapper": {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            "& h2": {
                fontSize: 24,
                fontWeight: 500,
                color: theme.colors.brand[3],
            },
            "& h4": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[7]
                        : theme.colors.gray[8],
                fontSize: 14,
                fontWeight: 400,
            },
        },
    },
}));
