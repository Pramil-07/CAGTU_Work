import { showNotification } from "@mantine/notifications";
import { IconCheck, IconCircleX } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import type { ReactNode } from "react";

export const toast = {
    error: (message: ReactNode) =>
        showNotification({
            title: "Error",
            message,
            color: "red",
            icon: <IconCircleX />,
            style: {position: "fixed", top: "60px", right: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"},
        }),
    success: (message: ReactNode) =>
        showNotification({
            title: "Success",
            message,
            color: "green",
            icon: <IconCheck />,
            style: {position: "fixed", top: "60px", right: "20px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"},
        }),
    confirm: (message: ReactNode, onConfirm: () => void) => {
        modals.openConfirmModal({
            title: "Please confirm your action",
            children: <p>{message}</p>,
            labels: { confirm: "Yes", cancel: "No" },
            confirmProps: { color: "red" }, // Make the confirm button red
            cancelProps: { color: "gray" },
            onCancel: () => console.log("Operation canceled"),
            onConfirm: onConfirm, // Executes the function if confirmed
        });
    },


};
