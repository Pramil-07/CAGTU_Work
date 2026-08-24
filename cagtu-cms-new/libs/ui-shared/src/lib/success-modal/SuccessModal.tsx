import { Modal, Title, Text, Group, Button, ModalProps } from '@mantine/core';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface SuccessModalProps {
    opened: boolean;
    onClose?: () => void;
    title: string;
    description: ReactNode;
    loading: boolean;
    onConfirm?: () => void;
    confirmButtonText: string;
}

const SuccessModal = ({
    onClose,
    opened,
    title,
    description,
    loading,
    onConfirm,
    confirmButtonText,
    ...restProps
}: SuccessModalProps & Partial<ModalProps>) => {
    return (
        <Modal
            {...restProps}
            opened={opened}
            onClose={onClose as VoidFunction}
            centered
            title={
                <Title order={5} sx={{ fontWeight: 500 }}>
                    {title}
                </Title>
            }
            overlayBlur={3}
            overlayOpacity={0.2}
            closeOnClickOutside={false}>
            <Text>{description}</Text>
            <Group position="right" mt={20}>
                <Button variant="default" px={15} onClick={onClose} sx={{ fontWeight: 500 }}>
                    Cancel
                </Button>
                <Button color="teal" px={15} loading={loading} onClick={onConfirm} sx={{ fontWeight: 500 }}>
                    {confirmButtonText}
                </Button>
            </Group>
        </Modal>
    );
};

export default SuccessModal;
