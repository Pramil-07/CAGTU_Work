import { createStyles } from "@mantine/core";

export const useMerchantStyles = createStyles((theme) => ({
    root: {
        ".info_wrapper": {
            "& h1": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[2]
                        : theme.colors.brand[4],
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 8,
            },
            "& h2": {
                fontSize: 48,
                fontWeight: 700,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[2]
                        : theme.colors.socialicons[9],
                marginBottom: 24,
                lineHeight: "52px",
                [theme.fn.smallerThan("sm")]: {
                    fontSize: 30,
                },
            },
            "& h3": {
                fontSize: 24,
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[2]
                        : theme.colors.gray[6],
                marginBottom: 48,
            },
            "& h5": {
                fontSize: 14,
                fontWeight: 500,
            },
            ".link": {
                cursor: "pointer",
                ":hover": {
                    color: theme.colors.brand[3],
                },
            },
        },
        ".first_merchant_image": {
            [theme.fn.smallerThan("lg")]: {
                display: "none",
            },
        },
    },
    service_provider: {
        ".second_merchant_image": {
            [theme.fn.smallerThan("lg")]: {
                width: 400,
                height: 400,
            },
            [theme.fn.smallerThan("sm")]: {
                display: "none",
            },
        },
        ".service_wrapper": {
            ".wrapper_link": {
                fontSize: 15,
                fontWeight: 500,
                marginTop: 38,
                gap: 10,
                width: 130,
                cursor: "pointer",
                display: "flex",
                borderRadius: 4,
                padding: 4,
                ":hover": {
                    color: `${theme.colors[theme.primaryColor][4]}`,
                    transition: "0.3s all",
                },
            },
            "& h3": {
                fontSize: 32,
                fontWeight: 600,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[2]
                        : theme.colors.gray[9],
                marginBottom: 24,
            },
            "& p": {
                fontFamily: "Inter",
                textAlign: "justify",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: "27px",
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[2]
                        : theme.colors.gray[6],
            },
        },
    },
}));
