import { createStyles } from "@mantine/core";

export const useSecuritySettingStyles = createStyles((theme) => ({
    wrapper: {
        ".mantine-Accordion-label": {
            p: {
                fontSize: 13,
                fontWeight: 400,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.homaaleSlate[6],
            },
        },
    },
}));
