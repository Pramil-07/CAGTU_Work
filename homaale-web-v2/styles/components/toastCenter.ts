import { createStyles } from "@mantine/core";

export const useNotificationStyles = createStyles(() => ({
    cardNotification: {
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "90%",
        maxWidth: 400,
        margin: 0,
        // Ensure the styles override Mantine's defaults
        "&.mantine-Notification-root": {
            margin: 0,
        },
    },
}));
