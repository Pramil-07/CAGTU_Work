import { createStyles } from "@mantine/core";

export const useInfoBannerStyles = createStyles((theme) => ({
    root: {
        padding: "80px 120px",
        [theme.fn.smallerThan("md")]: {
            padding: "40px 60px",
        },
        [theme.fn.smallerThan("sm")]: {
            padding: "20px 30px",
        },
        marginBottom: 80,
        borderRadius: 32,
        "& h5": {
            marginBottom: 16,
        },
        "& h2": {
            marginBottom: 24,
            [theme.fn.smallerThan("lg")]: {
                fontSize: 24,
            },
        },
        "& p": {
            font: "400 16px/27px inter",
            color:
                theme.colorScheme === "light"
                    ? theme.colors.gray[7]
                    : theme.colors.gray[4],
            marginBottom: 25,
        },
        "& ul": {
            listStyleType: "none",
            padding: 0,
            fontSize: 15,
            fontWeight: 500,
            marginBottom: 40,
            "& li": {
                display: "flex",
                alignItems: "center",
                gap: 12,
                color:
                    theme.colorScheme === "light"
                        ? theme.colors.gray[9]
                        : theme.colors.gray[2],
                marginBottom: 13,
                [theme.fn.smallerThan("lg")]: {
                    fontSize: 14,
                },

                "& svg": {
                    background: theme.colors.brand[1],
                    color: theme.colors.brand[4],
                    padding: 4,
                    borderRadius: 8,
                },
            },
        },
    },
    active: {
        background:
            theme.colorScheme === "light"
                ? "#F9F4FE"
                : theme.colors.homaaleSlate[8],
    },
}));
