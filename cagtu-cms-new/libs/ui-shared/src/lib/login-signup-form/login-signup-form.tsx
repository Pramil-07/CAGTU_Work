import { LoginSignupFormProps, useDark } from '@cagtu-cms/util-formatter';
import { Box, Group, Paper, ThemeIcon, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconMoon, IconSunHigh } from '@tabler/icons';
import LogoIcon from '../common/logoIcon';

const LoginSignupForm = ({ title, children, logo }: LoginSignupFormProps) => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const { toggleColorScheme } = useMantineColorScheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: dark ? theme.colors.dark[6] : theme.colors.blue[7],
                display: 'flex',
                alignItems: 'center',
            }}>
            <ThemeIcon
                variant="light"
                radius="xl"
                size={32}
                color="gray"
                onClick={() => toggleColorScheme()}
                sx={{
                    cursor: 'pointer',
                    position: 'absolute',
                    bottom: theme.spacing.lg,
                    right: theme.spacing.lg,
                }}>
                {dark ? <IconSunHigh size={20} color={theme.colors.yellow[6]} /> : <IconMoon size={20} color={theme.colors.gray[7]} />}
            </ThemeIcon>
            <Paper p={60} sx={{ width: 450, minHeight: 600 }} mx="auto" radius="lg" my="lg">
                <Group position="left" spacing={'xs'} mb={50} align="center">
                    {!logo ? (
                        <>
                            <LogoIcon />
                            <Title order={4} sx={{ fontWeight: 600, fontSize: 20 }}>
                                Cagtu
                            </Title>
                        </>
                    ) : (
                        logo
                    )}
                </Group>
                <Title order={4} sx={{ fontWeight: 600 }} mb={30}>
                    {title}
                </Title>
                {children}
            </Paper>
        </Box>
    );
};

export default LoginSignupForm;
