import { createStyles } from "@mantine/core";

export const useChatStyles = createStyles((theme) => ({
    root: {},
    card: {
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        boxShadow: " 0px 0px 2px rgba(0, 0, 0, 0.2)",
        padding: "19px 8px",
        borderRadius: 4,
        marginBottom: 16,
        "&:hover": {
            transition: "all 0.03s ease",
            transform: "scale(1.02)",
            boxShadow: `0px 0px 2px ${theme.colors[theme.primaryColor][4]}`,
        },
        ".card__left": {
            gap: 16,
            "&--content": {
                "& h5": {
                    fontWeight: 500,
                    marginBottom: 8,
                },
                "& p": {
                    fontWeight: 400,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[5]
                            : theme.colors.gray[7],
                },
            },
        },
        ".card__right": {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            "& p": {
                flexDirection: "column",
                fontSize: "0.625rem",
                fontWeight: 400,
                color: theme.colors.gray[6],
            },
            "& span": {
                background: theme.colors[theme.primaryColor][4],
                color: "#fff",
                textAlign: "center",
                width: 30,
                borderRadius: 2,
            },
        },
    },
    chat: {
        position: "sticky",
        top: 64,
        border: `0.5px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.gray[8]
                : theme.colors.gray[1]
        }`,
        ".chat__header": {
            padding: "10px 20px",
            background:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[8]
                    : theme.colors.gray[1],
            "&--left": {
                gap: 10,
            },
            "&--right": {},
        },
        ".chat__input": {
            display: "flex",
            marginInline: "auto",
            marginBottom: 20,
            gap: 20,
            width: "95%",
        },
    },
    message: {
        padding: "19px 22px",
        marginRight: 10,
        ".message__user": {
            gap: 10,
            fontWeight: 400,
            marginBottom: 10,
            "& h4": {
                marginBottom: 0,
                fontSize: 14,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[4]
                        : theme.colors.gray[8],
            },
            "& p": {
                fontSize: 10,
                padding: 0,
                marginBottom: 0,
                background: "none",
                color: theme.colors.gray[6],
            },
        },
        ".sender__content": {
            fontSize: 12,
            padding: 12,
            background: theme.colors.gray[1],
            lineHeight: 2,
            borderRadius: 4,
            color: theme.colors.gray[8],
        },
        ".message__content": {
            fontSize: 12,
            padding: 12,
            background: theme.colors.brand[2],
            lineHeight: 2,
            borderRadius: 4,
            color: theme.colors.gray[8],
        },
    },
}));
