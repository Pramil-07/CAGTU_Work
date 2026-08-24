import type { ColorScheme } from "@mantine/core";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import type { ReactNode } from "react";


import { homaaleColors } from "./GlobalTheme";
import { cagtuColors } from "./CagtuColors";
import { useBrand } from "@/hooks/useBrand";

const BaseThemeProvider = ({ children }: { children: ReactNode }) => {
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: "theme",
        defaultValue: "light",
    });

    const toggleColorScheme = (value?: ColorScheme) => {
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
    };

    useHotkeys([["ctrl+J", () => toggleColorScheme()]]);
    const hostname = useBrand()

    const isCagtu = hostname === "cagtu"

    const activeTheme = isCagtu ? cagtuColors : homaaleColors;

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
        >
            <MantineProvider
                theme={{ colorScheme, ...activeTheme }}
                withGlobalStyles
                withNormalizeCSS
            >
                <Notifications
                    limit={2}
                    position="bottom-right"
                    autoClose={3000}
                />
                {children}
            </MantineProvider>
        </ColorSchemeProvider>
    );
};

export default BaseThemeProvider;
