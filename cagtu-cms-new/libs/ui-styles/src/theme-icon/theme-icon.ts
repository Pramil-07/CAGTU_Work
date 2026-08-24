import { createStyles } from '@mantine/core';

export const useThemeIconStyles = createStyles((theme) => ({
    ct_theme_icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        svg: {
            width: 18,
            height: 18,
            fill: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[5],
        },
    },
    name: {
        '&:hover': {
            textDecoration: 'underline',
            cursor: 'pointer',
            color: theme.colors.blue,
        },
    },
}));
