import { createStyles } from "@mantine/core";

export const useNotificationStyles = createStyles((theme) => ({
    root: {
        "& h3": {
            fontWeight: 500,
            fontSize: 20,
        },
        "& p": {
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: theme.colors[theme.primaryColor][4],
            fontWeight: 400,
            fontSize: 12,

            "&:hover": {
                color: theme.colors.gray[6],
                transition: "0.3s ease",
            },
        },
        ".scroll": {
            ".header": {
                fontSize: 16,
                marginLeft: 14,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[4]
                        : theme.colors.gray[8],
            },
            "& p": {
                fontSize: 14,
                marginLeft: 14,
                color: theme.colors.gray[6],
                marginBottom: 8,
            },
        },
    },
    card: {
        cursor: "pointer",
        display: "flex",
        padding: "6px 16px",
        gap: 8,
        paddingBottom: 6,
        marginBottom: 8,
        borderRadius: 8,

        ".content": {
            fontWeight: 500,
            fontSize: 16,
            "& h4": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[4]
                        : theme.colors.gray[8],
                fontWeight: 500,
                fontSize: 16,
                margin: 0,
                "& span": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[3]
                            : theme.colors.gray[7],
                    fontWeight: 400,
                    fontSize: 14,
                },
            },
            "&__date": {
                fontWeight: 400,
                fontSize: 10,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[6],
            },
        },
    },
    icon: {
        background: theme.colors.status[0],
        color: "#ffffff",
        borderRadius: 50,
        padding: 8,
        height: 42,
        width: 42,
    },
    kyc_submit_icon: {
        background: theme.colors.yellow[6],
        color: "#ffffff",
        borderRadius: 50,
        padding: 8,
        height: 42,
        width: 42,
    },
    kyc_verified_icon: {
        background: theme.colors.green[6],
        color: "#ffffff",
        borderRadius: 50,
        padding: 8,
        height: 42,
        width: 42,
    },
    kyc_rejected_icon: {
        background: theme.colors.red[6],
        color: "#ffffff",
        borderRadius: 50,
        padding: 8,
        height: 42,
        width: 42,
    },
}));
