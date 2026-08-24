import { createStyles } from '@mantine/core';

export const useSidebarStyles = createStyles((theme, _params, getRef) => ({
    ct_menu_item: {
        ref: getRef('ct_menu_item'),

        listStyleType: 'none',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        userSelect: 'none',
        '.svg-inline-arrow--fa': {
            transform: 'translateZ(0)',
            transition: 'all .3s ease',
        },
        '&.active': {
            background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            borderRadius: theme.radius.sm,
            '.svg-inline-arrow--fa': {
                transform: 'rotate(90deg)',
            },
        },
    },
    ct_menu_link: {
        ref: getRef('ct_menu_link'),
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[3],
        fontWeight: 500,
        fontSize: 14,
        padding: `${8}px ${theme.spacing.xs}px`,
        borderRadius: theme.radius.sm,
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        userSelect: 'none',
        '&:hover': {
            textDecoration: 'none',
            color: theme.colors.blue[6],
            background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
        '&.active': {
            color: theme.colors.blue[6],
            background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
    },
    ct_menu__link_icon: {
        fontSize: 16,
        verticalAlign: 'middle',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        flex: `${0} ${0} ${35}px`,
        '.icon-tabler': {
            width: 20,
            height: 20,
        },
    },
    ct_menu__link_text: {
        ref: getRef('ct_menu__link_text'),
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        userSelect: 'none',
    },
    ct_submenu: {
        margin: `${5}px ${0}px ${16}px ${20}px`,
        padding: 0,
        borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray['4']}`,
        userSelect: 'none',
        [`.${getRef('ct_menu_item')}`]: {
            borderRadius: 0,
            [`.${getRef('ct_menu_link')}`]: {
                paddingTop: 0,
                paddingBottom: 0,
                borderRadius: 0,
                margin: `${4}px ${0}px ${4}px ${theme.spacing.sm}px`,
            },
        },
    },
}));
