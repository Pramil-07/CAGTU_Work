import { Center, Box, Title, Text, useMantineTheme } from '@mantine/core';
import { ReactNode } from 'react';

interface ErrorBoundaryMessageProps {
    statusCode: string;
    title: ReactNode;
    children: ReactNode;
}

const ErrorBoundaryMessage = ({ statusCode, title, children }: ErrorBoundaryMessageProps) => {
    const theme = useMantineTheme();

    return (
        <Center style={{ height: '100vh', background: theme.colors.gray['0'] }}>
            <Box sx={{ textAlign: 'center' }}>
                <Title sx={{ fontSize: 220, fontFamily: 'Poppins', color: theme.colors.gray['4'], lineHeight: 1 }} mb={15}>
                    {statusCode.slice(0, 1)}
                    <span style={{ color: theme.colors.blue['6'] }}>{statusCode.slice(1, 2)}</span>
                    {statusCode.slice(2, 3)}
                </Title>
                <Title order={1} sx={{ fontFamily: 'Poppins', color: theme.colors.dark['9'] }} mb={15}>
                    {title}
                </Title>
                <Text sx={{ fontFamily: 'Poppins', color: theme.colors.gray['6'], fontSize: theme.fontSizes.md }}>{children}</Text>
            </Box>
        </Center>
    );
};

export default ErrorBoundaryMessage;
