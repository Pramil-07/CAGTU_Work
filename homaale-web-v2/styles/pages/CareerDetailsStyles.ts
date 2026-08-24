import { createStyles } from "@mantine/core";

export const useCareerDetailsStyles = createStyles((theme) => ({
    root: {
        padding: 24,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        "& p": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
        "& h2": {
            fontSize: 48,
            fontWeitht: 600,
            [theme.fn.smallerThan("xs")]: {
                fontSize: 20,
                fontWeight: 300,
            },
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[7],
            marginBottom: 12,
        },
        "& h3": {
            fontSize: 18,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
            marginBottom: 12,
            "& span": {
                fontSize: 14,
                fontWeitht: 400,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[5]
                        : theme.colors.gray[7],
            },
        },
        ".apply_Btn": {
            color:
                theme.colorScheme === "dark" ? theme.colors.gray[5] : "white",
            background: theme.colors.homaaleSlate[8],
        },
    },
    body_wrapper: {
        "& h2": {
            [theme.fn.smallerThan("xs")]: {
                fontSize: 20,
                fontWeight: 300,
            },
            marginBottom: 24,
        },
        "& p": {
            textAlign: "justify",
            marginBottom: 32,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.gray[8],
        },
    },
}));
