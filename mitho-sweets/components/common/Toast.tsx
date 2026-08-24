import { showNotification } from "@mantine/notifications";
import { IconCheck, IconCircleX } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import type { ReactNode } from "react";

type Message = ReactNode;

interface ApiResponse {
    status: "success" | "error" | string;
    message: string;
}

export const toast = {
    error: (message: Message, title = "Error") =>
        showNotification({
            title,
            message,
            color: "red",
            icon: <IconCircleX />,
            autoClose: 3000,
        }),

    success: (message: Message, title = "Success") =>
        showNotification({
            title,
            message,
            color: "green",
            icon: <IconCheck />,
            autoClose: 3000,
        }),

    confirm: (message: Message, onConfirm: () => void) => {
        modals.openConfirmModal({
            title: "Please confirm your action",
            children: <p>{message}</p>,
            labels: { confirm: "Yes", cancel: "No" },
            confirmProps: { color: "red" },
            cancelProps: { color: "gray" },
            onCancel: () => console.log("Operation canceled"),
            onConfirm,
        });
    },

    apiResponse: (response: ApiResponse) => {
        if (response.status.toLowerCase() === "success") {
            toast.success(response.message);
        } else {
            toast.error(response.message || "Something went wrong");
        }
    },
};
