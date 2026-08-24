import { createStyles } from '@mantine/core';

export const usePageTabNavbarStyles = createStyles((theme) => ({
    ct_pagetab_menu: {
        margin: 0,
        padding: 0,
        display: 'flex',
        borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
    },
    ct_pagetab_menu_item: {
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[3],
        fontWeight: 500,
        fontSize: 13,
        padding: `${0}px ${0}px ${theme.spacing.xs}px`,
        borderRadius: theme.radius.sm,
        marginRight: theme.spacing.xl,
        position: 'relative',
        '&:hover': {
            textDecoration: 'none',
            color: theme.colors.blue[6],
        },
        '&::before': {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            height: '2px',
            marginTop: '-1px',
            // borderRadius: theme.radius.sm,
            background: theme.colors.blue[6],
            opacity: 0,
        },
        '&.tabActive': {
            color: theme.colors.blue[6],
            '&::before': {
                opacity: 1,
            },
        },
        '&:last-child': {
            marginRight: 0,
        },
    },
}));
