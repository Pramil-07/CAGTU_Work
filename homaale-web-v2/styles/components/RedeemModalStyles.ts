import { createStyles } from "@mantine/core";

export const useRedeemModalStyles = createStyles((theme) => ({
    root: {
        ".modal_body": {
            ".modal_title": {
                "& h2": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[5]
                            : theme.colors.gray[8],
                    fontSize: 26,
                    fontWeight: 500,
                },
                "& h3": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[5]
                            : theme.colors.gray[8],
                    fontSize: 20,
                    fontWeight: 500,
                },
            },
            ".modal_description": {
                "& h4": {
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.colors.homaaleSlate[5],
                },
            },
        },
        ".description": {
            fontSize: 16,
            fontWeight: 400,
            color: theme.colors.gray[6],
            lineHeight: "24px",
            marginBottom: 24,
        },
        ".footer_titles": {
            "& h3": {
                fontSize: 16,
                fontWeight: 400,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[6],
                marginBottom: 16,
            },
            "& h4": {
                fontSize: 12,
                fontWeight: 400,
                color: theme.colors.gray[5],
                margin: 0,
                marginBottom: 16,
            },
            "& h5": {
                fontSize: 12,
                fontWeight: 400,
                color: "#FE5050",
                marginBottom: 19,
            },
        },
        ".discount_code": {
            "& h3": {
                fontSize: 18,
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.status[0],
            },
        },
    },
}));
