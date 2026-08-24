import { createStyles } from "@mantine/core";

export const useFAQSStyles = createStyles((theme) => ({
    tabs_list: {
        ":hover": {
            background: theme.colors.gray[1],
        },
        padding: "8px 16px",
        borderRadius: 4,
        width: 195,
        display: "flex",
        border: "none",
        marginBottom: 24,
        background:
            theme.colorScheme === "dark" ? theme.colors.gray[8] : "none",
        cursor: "pointer",
        "& h3": {
            whiteSpace: "nowrap",
            fontFamily: "Poppins",
            fontSize: 14,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[5]
                    : theme.colors.gray[8],
        },
    },
    topic: {
        border: "1px solid rgba(0, 0, 0, 0.08)",
        padding: 24,
        borderRadius: 4,
        display: "flex",
        gap: 24,
        [theme.fn.smallerThan("md")]: {
            flexDirection: "column",
        },
    },
    tabs_content: {
        width: "100%",
        borderRadius: 4,
        gap: 12,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        padding: "48px 48px 24px 48px",
        ".accordion_item": {
            ".control": {
                "& h4": {
                    margin: 0,
                },
                ":hover": {
                    background: "none",
                },
            },
            borderRadius: 4,
            "& h4": {
                fontSize: 18,
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[7],
            },
            "& p": {
                fontSize: 12,
                fontWeight: 400,
                marginBottom: 20,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[5]
                        : theme.colors.gray[7],
            },
        },
    },
    "& h2": {
        padding: 10,
        fontWeight: 500,
        fontSize: 24,
    },
    description: {
        ".image-faq": {
            [theme.fn.smallerThan("lg")]: {
                display: "none",
            },
        },
        background: theme.colors.secondaryColor[1],
        padding: 42,
        borderRadius: 4,
        alignItems: "center",
        "& h3": {
            marginTop: 20,
            fontSize: 16,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[5]
                    : theme.colors.brand[3],
        },
        "& h4": {
            margin: 0,
            fontSize: 48,
            fontWeight: 700,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[4]
                    : theme.colors.gray[8],
        },
        ".contact-us": {
            cursor: "pointer",
            background: theme.colors.homaaleSlate[8],
            padding: "12px 25px 12px 30px",
            borderRadius: 6,
            width: 253,
            marginTop: 48,
            "& h4": {
                fontSize: 15,
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[4]
                        : theme.colors.white[0],
            },
        },
    },
}));
