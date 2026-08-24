import React from "react";
import { Modal, Text, Group, Button, useMantineTheme } from "@mantine/core";

interface ConfirmationModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                                 opened,
                                                                 onClose,
                                                                 onConfirm,
                                                                 title,
                                                                 message,
                                                             }) => {
    const theme = useMantineTheme();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}

            size="sm"
            overlayProps={{
                color: theme.colors.gray[2],
                opacity: 0.55,
                blur: 6,
            }}
        >
            <Text size="sm" mb="md">
                {message}
            </Text>
            <Group justify="flex-end">
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onConfirm}>
                    Confirm
                </Button>
            </Group>
        </Modal>
    );
};

export default ConfirmationModal;