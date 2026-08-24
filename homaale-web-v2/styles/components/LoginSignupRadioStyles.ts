import { createStyles } from "@mantine/core";

export const useLoginSignupRadioStyles = createStyles((theme) => ({
    radioWrapper: {
        marginBottom: 20,
        ".box": {
            background: theme.colors.homaaleSlate[0],
            padding: "8px 16px",
            border: `1px solid ${theme.colors.homaaleSlate[3]}`,
            borderRadius: 8,
            ":has(.mantine-Radio-root[data-checked=true])": {
                background: theme.colors.brand[0],
                border: `1px solid ${theme.colors.brand[3]}`,
                ".mantine-Radio-radio": {
                    background: "#f9971f",
                },
            },
            ".icon": {
                color: theme.colors.homaaleSlate[8],
                marginRight: 8,
                cursor: "pointer",
            },
            "& span": {
                fontSize: 14,
                fontWeight: 500,
                marginRight: 12,
                color: theme.colors.homaaleSlate[8],
                cursor: "pointer",
            },
            ".mantine-Radio-radio": {
                background:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[0]
                        : "#fff",
                borderColor: "#f9971f",
            },
        },
        "input[type=checkbox]": {
            accentColor: theme.colors.brand[4],
        },
    },
}));
