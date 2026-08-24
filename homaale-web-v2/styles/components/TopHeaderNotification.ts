import { createStyles } from "@mantine/core";

export const useTopHeaderNotificationStyles = createStyles((theme) => ({
    mainwrapper: {
        alignContent: "center",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        background:
            theme.colorScheme === "dark"
                ? "linear-gradient(69deg, rgba(20,21,24,1) 9%, rgba(111,64,27,1) 54%, rgba(20,21,24,1) 97%)"
                : "linear-gradient(90deg, #E7E1FA 0%, rgba(219, 239, 240, 0.778406) 22.16%, rgba(251, 222, 206, 0.481398) 51.86%, rgba(219, 151, 225, 0.307815) 81.9%, rgba(76, 109, 226, 0.19) 100%)",
    },
    suspended: {
        alignContent: "center",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        background:
            theme.colorScheme === "dark" ? theme.colors.red[4] : "#FFEDED",
    },
    incomplete: {
        alignContent: "center",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        background:
            theme.colorScheme === "dark" ? theme.colors.status[0] : "#ECF7FF",
    },
    topheadernotification: {
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
    },
    registerwrapper: {
        display: "flex",
        alignItems: "center",
        padding: "3px 8px 3px 12px",
        gap: 5,
        background: theme.colors.socialicons[9],
        color: "white",
        borderRadius: 6,
        cursor: "pointer",
    },
    action: {
        color: theme.colors.homaaleSlate[8],
    },
}));
