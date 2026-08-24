import { Modal, Title, Text, Group, Button, ModalProps } from '@mantine/core';

/* eslint-disable-next-line */
export interface DeleteModalProps {
    opened: boolean;
    onClose?: () => void;
    title: string;
    description: string;
    loading: boolean;
    onConfirm?: () => void;
}

const DeleteModal = ({ onClose, opened, title, description, loading, onConfirm, ...restProps }: DeleteModalProps & Partial<ModalProps>) => {
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
            }>
            <Text>{description}</Text>
            <Group position="right" mt={20}>
                <Button variant="default" px={15} onClick={onClose} sx={{ fontWeight: 500 }} disabled={loading}>
                    Cancel
                </Button>
                <Button color="red" px={15} loading={loading} onClick={onConfirm} sx={{ fontWeight: 500 }}>
                    Yes! Delete it
                </Button>
            </Group>
        </Modal>
    );
};

export default DeleteModal;
