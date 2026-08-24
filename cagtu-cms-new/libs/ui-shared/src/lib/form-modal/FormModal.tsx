import { Modal, Title, Group, Button, ModalProps } from '@mantine/core';
import { ReactNode } from 'react';
import { Button as FormModalButton } from '@cagtu-cms/ui-shared';

/* eslint-disable-next-line */
export interface FormModalProps {
    opened: boolean;
    onClose: () => void;
    title: ReactNode;
    loading: boolean;
    onConfirm: () => void;
    confirmButtonText: string;
    children: ReactNode;
}

const FormModal = ({ onClose, opened, title, loading, onConfirm, confirmButtonText, children, ...restProps }: FormModalProps & ModalProps) => {
    return (
        <Modal
            {...restProps}
            opened={opened}
            onClose={onClose}
            centered
            title={
                <Title order={4} sx={{ fontWeight: 600 }}>
                    {title}
                </Title>
            }
            overlayBlur={3}
            overlayOpacity={0.2}
            closeOnClickOutside={false}>
            {children}
            <Group position="right" mt={20}>
                <Button variant="default" px={15} onClick={onClose} sx={{ fontWeight: 500 }} disabled={loading}>
                    Cancel
                </Button>
                <FormModalButton name={confirmButtonText} loading={loading} onClick={onConfirm} />
            </Group>
        </Modal>
    );
};

export default FormModal;
