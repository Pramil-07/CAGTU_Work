import { createStyles } from "@mantine/core";

export const useKycStyles = createStyles((theme) => ({
    wrapper: {
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : "1px solid #00000008",
        borderRadius: 8,
        padding: 40,
        [theme.fn.smallerThan("md")]: {
            padding: 16,
        },
        p: {
            fontSize: 14,
            color: theme.colors.gray[6],
            span: {
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.homaaleSlate[8],
            },
        },
        ".basic-details": {
            ".verified": {
                color: theme.colors.green[6],
                backgroundColor: theme.colors.green[4],
                padding: "4px 10px",
                display: "inline-block",
                textAlign: "center",
                borderRadius: "5px",
                fontSize: "12px",
            },
            ".pending": {
                color: "#fff",
                backgroundColor: theme.colors.yellow[4],
                padding: "4px 10px",
                display: "inline-block",
                textAlign: "center",
                borderRadius: "5px",
                fontSize: "12px",
            },
        },
        ".mantine-Accordion-item": {
            border:
                theme.colorScheme === "dark"
                    ? `1px solid ${theme.colors.dark[7]}`
                    : `1px solid ${theme.colors.homaaleSlate[3]}`,
            borderRadius: 8,
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[7] : "inherit",
            overflow: "hidden",
            ".mantine-Accordion-control": {
                "&:not([data-disabled]):hover": {
                    backgroundColor:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.colors.gray[0],
                },
                "&[aria-expanded=true]": {
                    backgroundColor:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.colors.gray[0],
                },
            },
            ".mantine-Accordion-panel": {
                backgroundColor:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[7]
                        : theme.colors.gray[0],
            },
        },
    },
}));
