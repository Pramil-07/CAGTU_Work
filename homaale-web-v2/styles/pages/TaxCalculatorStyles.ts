import { createStyles } from "@mantine/core";

export const useTaxCalculatorStyles = createStyles((theme) => ({
    wrapper: {
        background:
            theme.colorScheme === "dark"
                ? theme.colors.darkBackground[0]
                : "inherit",
        border:
            theme.colorScheme === "dark"
                ? "none"
                : `1px solid rgba(0, 0, 0, 0.08)`,
        padding: 48,
        [theme.fn.smallerThan("sm")]: {
            padding: 16,
        },
        borderRadius: 8,
        marginBottom: 48,
        ".mantine-InputWrapper-label": {
            color: theme.colors.homaaleSlate[8],
            fontWeight: 500,
        },
        ".heading": {
            fontSize: 20,
        },
        " .sub-heading": {
            fontSize: 12,
            color: theme.colors.gray[6],
            lineHeight: "18px",
            marginBottom: 24,
        },
        ".block-title": {
            fontSize: 18,
            fontWeight: 500,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[6],
            marginBottom: 8,
        },

        ".col-right": {
            ".box": {
                borderRadius: 4,
                padding: 16,

                background:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[7]
                        : "inherit",
                border:
                    theme.colorScheme === "dark"
                        ? "none"
                        : `1px solid rgba(0, 0, 0, 0.08)`,

                "&__title": {
                    fontSize: 16,
                    fontWeight: 500,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.homaaleSlate[6],
                },
                "&__amount": {
                    fontSize: 24,
                    fontWeight: 600,
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.gray[0]
                            : theme.colors.homaaleSlate[8],
                },
            },
            ".tax-slab-container": {
                textAlign: "center",
                width: "100%",
                padding: 16,
                borderRadius: 4,
                marginTop: 32,
                [theme.fn.smallerThan("md")]: {
                    marginTop: 16,
                },
                background: theme.colors.homaaleSlate[8],
                "& p": {
                    fontSize: 24,
                    color: "#fff",
                },
                "& h1": {
                    fontSize: 48,
                    color: "#fff",
                    fontWeight: 500,
                    "& span": {
                        fontWeight: 700,
                    },
                },
            },
            ".tax-slab-table": {
                marginTop: 32,
                "& th": {
                    fontWeight: 500,
                    color: theme.colors.homaaleSlate[8],
                    paddingBottom: 24,
                },
                "& tr": {
                    "&:nth-last-child(1), :nth-last-child(2)": {
                        "& td": {
                            color: theme.colors.homaaleSlate[8],
                        },
                    },
                },
                "& td": {
                    fontWeight: 500,
                    color: theme.colors.homaaleSlate[5],
                },
            },
        },
    },
    taxInfoWrapper: {
        background:
            theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
        border:
            theme.colorScheme === "dark"
                ? "none"
                : `1px solid rgba(0, 0, 0, 0.08)`,
        borderRadius: 8,
        padding: 80,
        [theme.fn.smallerThan("sm")]: {
            padding: 24,
        },
        justifyContent: "center",
        paddingTop: 48,
        "& h2": {
            fontSize: 20,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
            fontWeight: 500,
            marginBottom: 24,
        },
        "& p": {
            fontSize: 16,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[1]
                    : theme.colors.homaaleSlate[6],
            marginBottom: 8,
        },
    },
}));
