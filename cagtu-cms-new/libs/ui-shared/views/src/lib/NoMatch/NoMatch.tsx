import { useDark } from '@cagtu-cms/util-formatter';
import { Box, Center, Text, Title, useMantineTheme } from '@mantine/core';

const NoMatch = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();

    return (
        <Center style={{ height: '100vh', background: dark ? theme.colors.dark[8] : theme.colors.gray[0] }}>
            <Box sx={{ textAlign: 'center' }}>
                <Title sx={{ fontSize: 220, lineHeight: 1, color: dark ? theme.colors.gray[8] : theme.colors.gray[4] }} mb={15}>
                    4<span style={{ color: theme.colors.blue[6] }}>0</span>4
                </Title>
                <Title order={1} mb={15} sx={{ color: dark ? theme.colors.gray[4] : theme.colors.dark[9] }}>
                    Page Not Found
                </Title>
                <Text sx={{ fontSize: 16 }} color={theme.colors.gray[6]}>
                    Make sure the address is correct and the page hasn't moved.
                </Text>
            </Box>
        </Center>
    );
};

export default NoMatch;
