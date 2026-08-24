import { createStyles } from "@mantine/core";

export const useFooterStyles = createStyles((theme) => ({
    footer: {
        background: theme.colors.homaaleSlate[8],
        "& a": {
            color: theme.colors.homaaleSlate[1],

            "&:hover": {
                color: theme.colors.brand[3],
            },
        },
        ".footer__main": {
            paddingBlock: 60,
            fontSize: 16,
            "& h4": {
                fontWeight: 600,
                marginBottom: 30,
                color: theme.colors.homaaleSlate[1],
            },

            "&--block": {
                maxWidth: 505,
                "& p": {
                    marginTop: 31,
                    font: "400 16px/27px inter",
                    color: theme.colors.homaaleSlate[1],
                },
            },
            "& ul": {
                padding: 0,
                listStyleType: "none",
                fontWeight: 400,
                // whiteSpace: "nowrap",
                "& li": {
                    marginBottom: 10,
                },
            },
        },
        ".footer__newletter": {
            "& h2": {
                fontWeight: 600,
                fontSize: 35,
                color: theme.colors.gray[1],
                marginBottom: 15,
            },
            "& form": {
                display: "flex",
                gap: 20,
            },
        },
        ".footer__end": {
            borderTop: `1px solid ${theme.colors.homaaleSlate[1]}`,
            paddingBlock: 28,

            "&--copyright": {
                color: theme.colors.homaaleSlate[1],
                fontWeight: 500,
                fontSize: 14,
            },
            "&--social": {
                display: "flex",
                flexDirection: "row",
                justifyContent: "end",
                [theme.fn.smallerThan("sm")]: {
                    justifyContent: "start",
                },
                gap: 28,
                color: theme.colors.homaaleSlate[1],
                fontWeight: 500,
                fontSize: 14,
            },
            "&--mobile": {
                display: "flex",
                flexDirection: "row",
                justifyContent: "end",
                [theme.fn.smallerThan("sm")]: {
                    justifyContent: "start",
                    marginBottom: 15,
                },
                [theme.fn.smallerThan("xs")]: {
                    flexDirection: "column",
                },
                gap: 28,
                color: theme.colors.homaaleSlate[1],
                fontWeight: 500,
                fontSize: 14,
            },
        },
    },
}));
