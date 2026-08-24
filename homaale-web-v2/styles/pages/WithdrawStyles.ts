import { createStyles } from "@mantine/core";

export const useWithdrawStyles = createStyles((theme) => ({
    root: {
        "& h2": {
            fontSize: 20,
            fontWeight: 500,
        },
    },
    accounts: {
        border: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[6]
                : `rgba(0, 0, 0, 0.08)`
        }`,
        borderRadius: 4,

        ".mantine-Radio-body": {
            width: "100%",
            ".mantine-Radio-labelWrapper": {
                width: "100%",
            },
        },

        ".account__selector": {
            padding: 12,
            border: `1px solid ${
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[6]
                    : `rgba(0, 0, 0, 0.08)`
            }`,
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[2]
                    : theme.colors.homaaleSlate[6],
            cursor: "pointer",
            "&:hover": {
                background:
                    theme.colorScheme === "dark"
                        ? theme.colors.brand[5]
                        : theme.colors.brand[2],
                transition: "0.35s all ease",
            },
        },

        "& h5": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[1]
                    : theme.colors.homaaleSlate[6],
            fontWeight: 500,
            marginLeft: 10,
        },
    },

    PayForm: {
        border: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[6]
                : `rgba(0, 0, 0, 0.08)`
        }`,
        borderRadius: 4,

        "& p": {
            "& span": {
                fontSize: 12,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[4]
                        : theme.colors.gray[6],
            },
        },

        ".current_balance": {
            padding: 16,
            borderRadius: 4,
            marginTop: 24,
            marginBottom: 16,
            fontSize: 14,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[2]
                    : theme.colors.homaaleSlate[5],

            background: "#FFF5E5",

            "& p": {
                fontSize: 24,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.brand[6]
                        : theme.colors.brand[3],
                textAlign: "center",

                "& span": {
                    fontSize: 32,
                    color: theme.colors.brand[3],
                    fontWeight: 600,
                },
            },
        },
    },
    cardSelector: {
        padding: 16,
        display: "flex",
        border: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[6]
                : `rgba(0, 0, 0, 0.08)`
        }`,
        borderRadius: 4,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[2]
                : theme.colors.homaaleSlate[6],
        marginTop: 24,
        gap: 18,
        "& h4": {
            fontWeight: 500,
        },
        "& span": {
            fontSize: 16,
        },
        "& p": {
            marginTop: 4,
        },
    },
}));
