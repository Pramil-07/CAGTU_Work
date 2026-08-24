import { createStyles } from "@mantine/core";

export const useBoxStyles = createStyles((theme) => ({
    section: {
        marginBottom: theme.spacing.xl,
        background: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        boxShadow: theme.shadows.sm,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: 600,
        marginBottom: theme.spacing.md,
        color: theme.colorScheme === "dark" ? theme.colors.gray[0] : theme.colors.gray[8],
    },
    tableRow: {
        "&:hover": {
            background: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        },
    },
    emptyText: {
        padding: theme.spacing.md,
        color: theme.colors.gray[6],
        textAlign: "center",
    },
    totalCart: {
        padding: 24,
        boxShadow: `0px 0px 4px rgba(0, 0, 0, 0.1), 0px 0px 1px rgba(0, 0, 0, 0.25)`,
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        borderRadius: 4,
        textAlign: "center",
        position: "sticky",
        top: 70,
        "& h4": {
            fontSize: 20,
            // marginBottom: 24,
        },
        "& p": {
            fontWeight: 600,
            fontSize: 24,
            marginBottom: 33,
            color: theme.colors.gray[6],
            "& span": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[0]
                        : theme.colors.gray[8],
            },
        },
        "& button": {
            paddingBlock: 9,
            "& span": {
                fontWeight: 400,
                fontSize: 20,
            },
        },
        ".content": {
            fontWeight: 400,
            fontSize: 14,
            margin: 0,
            color: theme.colors.gray[6],
        },
    },
    summaryContent: {
        padding: theme.spacing.md,
        borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
    },
    checkoutButton: {
        background: theme.colors.orange[6],
        "&:hover": {
            background: theme.colors.orange[7],
        },
    },
}));
