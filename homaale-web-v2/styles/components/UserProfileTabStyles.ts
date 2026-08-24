import { createStyles } from "@mantine/core";

export const useUserProfileTabStyles = createStyles((theme) => ({
    wrapper: {
        background:
            theme.colorScheme === "dark"
                ? theme.colors.darkBackground[0]
                : "inherit",
        border:
            theme.colorScheme === "dark"
                ? "none"
                : `1px solid rgba(0, 0, 0, 0.08)`,
        padding: 24,
        borderRadius: 4,
        ".mantine-Tabs-tabsList": {
            ".mantine-Tabs-tab": {
                fontSize: 14,
                fontWeight: 500,
                color: theme.colors.gray[6],
                marginRight: 32,
                "&[aria-selected=true]": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.brand[4]
                            : theme.colors.homaaleSlate[8],
                },
                "&[data-active=true]": {
                    borderColor:
                        theme.colorScheme === "dark"
                            ? theme.colors.brand[4]
                            : theme.colors.homaaleSlate[8],
                },
            },
        },
    },
}));
