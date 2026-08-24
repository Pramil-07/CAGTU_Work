import { Box, Center, Text, Title, useMantineTheme } from '@mantine/core';
import { IconFolderOff } from '@tabler/icons';

const NoDataMessage = () => {
    const theme = useMantineTheme();

    return (
        <Center sx={{ minHeight: 300, textAlign: 'center' }}>
            <Box>
                <IconFolderOff color={theme.colors.gray[5]} size={52} stroke={1.25} />
                <Title order={5} mt={10} mb={8} sx={{ fontWeight: 500 }}>
                    No data to display
                </Title>
                <Text color="dimmed">No data available. Please start adding your data.</Text>
            </Box>
        </Center>
    );
};

export default NoDataMessage;
