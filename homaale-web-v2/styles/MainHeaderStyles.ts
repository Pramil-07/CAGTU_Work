import { createStyles } from "@mantine/core";

export const useMainHeaderStyles = createStyles((theme) => ({
    headerWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
    },
    suspended: {
        alignContent: "center",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        background:
            theme.colorScheme === "dark" ? theme.colors.red[4] : "#FFEDED",
    },
    topheadernotification: {
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
    },
}));
