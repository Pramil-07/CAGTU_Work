import { usePageTabNavbarStyles } from '@cagtu-cms/ui-styles';
import { PageTabNavbarProps } from '@cagtu-cms/util-formatter';
import { Anchor, Box, useMantineTheme } from '@mantine/core';
import { NavLink, useLocation } from 'react-router-dom';

const PageTabNavbar = ({ navbarOptions }: PageTabNavbarProps) => {
    const location = useLocation();
    const { classes } = usePageTabNavbarStyles();
    const theme = useMantineTheme();

    const checkPageTabNavActive = (path: string) => {
        const defaultClass = classes.ct_pagetab_menu_item;
        const activeClass = 'tabActive';
        return location.pathname === path ? `${defaultClass} ${activeClass}` : defaultClass;
    };

    return (
        <Box mb={theme.spacing.lg}>
            <ul className={classes.ct_pagetab_menu}>
                {navbarOptions &&
                    navbarOptions.map((value, key) => (
                        <Anchor key={key} component={NavLink} to={value?.to} className={checkPageTabNavActive(value?.pageActivePath)}>
                            {value?.name}
                        </Anchor>
                    ))}
            </ul>
        </Box>
    );
};

export default PageTabNavbar;
