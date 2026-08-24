import { createStyles } from "@mantine/core";

export const useCheckoutStyles = createStyles((theme) => ({
    wrapper: {
        ".container-box": {
            border:
                theme.colorScheme === "dark"
                    ? `1px solid ${theme.colors.gray[7]}`
                    : `1px solid rgba(0, 0, 0, 0.08)`,
            borderRadius: 4,
            background:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",
            padding: "16px 24px",
        },
        ".right-box": {
            position: "sticky",
            top: "80px",
        },
        ".left-box": {
            padding: "24px 30px",
        },
    },
}));
