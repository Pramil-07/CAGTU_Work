import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import {toast} from "@/components/common/Toast";

interface ConfirmModalProps {
    title?: string;
    message?: string;
    onConfirm: () => void;
}

// Refactored to function
export const openConfirmModal = ({
                                     title = "Please confirm your action",
                                     message = "Are you sure you want to proceed?",
                                     onConfirm,
                                 }: ConfirmModalProps) => {
    modals.openConfirmModal({
        title,
        children: <Text size="sm">{message}</Text>,
        labels: { confirm: "Yes", cancel: "No" },
        confirmProps: { color: "orange" },
        cancelProps: { color: "gray" },
        onCancel: () => toast.error("Action was canceled"),
        onConfirm,
    });
};
