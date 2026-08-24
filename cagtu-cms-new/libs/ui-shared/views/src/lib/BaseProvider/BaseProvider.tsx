import { globalTheme } from '@cagtu-cms/util-formatter';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';
import { ReactNode } from 'react';

const BaseProvider = ({ children }: { children: ReactNode }) => {
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'theme',
        defaultValue: 'light',
    });

    const toggleColorScheme = (value?: ColorScheme) => {
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
    };

    useHotkeys([['mod+J', () => toggleColorScheme()]]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme, ...globalTheme }} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider limit={2} position="top-center" autoClose={3000}>
                    {children}
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
};

export default BaseProvider;
