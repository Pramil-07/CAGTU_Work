import { globalTheme, homaaleColors, useSwitchColorMode } from '@cagtu-cms/util-formatter';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';
import { ReactNode } from 'react';

const HomaaleBaseProvider = ({ children }: { children: ReactNode }) => {
    const { colorScheme, toggleColorScheme } = useSwitchColorMode();

    useHotkeys([['mod+J', () => toggleColorScheme()]]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme, ...globalTheme, ...homaaleColors }} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider limit={2} position="top-center" autoClose={3000}>
                    {children}
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
};

export default HomaaleBaseProvider;
