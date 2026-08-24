import { createStyles } from "@mantine/core";

export const useSupportStyles = createStyles((theme) => ({
    wrapper: {
        ".form-wrapper": {
            border:
                theme.colorScheme === "dark"
                    ? `1px solid ${theme.colors.gray[7]}`
                    : `1px solid rgba(0, 0, 0, 0.08)`,
            borderRadius: 4,
            background:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
            padding: 24,
        },
    },
    myTickets: {
        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.dark[6]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        borderRadius: 8,
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
        padding: 16,
    },
}));
