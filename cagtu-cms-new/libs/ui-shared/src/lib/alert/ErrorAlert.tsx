import { Alert } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons';

const ErrorAlert = () => {
    return (
        <Alert icon={<IconExclamationCircle size={24} stroke={1.75} />} title="Bummer!" color="red">
            Something terrible happened!
        </Alert>
    );
};

export default ErrorAlert;
