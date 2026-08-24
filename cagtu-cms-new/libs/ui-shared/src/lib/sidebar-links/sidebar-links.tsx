import { DashboardRoutesProps, SidebarContext, UserContext } from '@cagtu-cms/util-formatter';
import { Anchor } from '@mantine/core';
import { NavLink } from 'react-router-dom';
import { useSidebarStyles } from '@cagtu-cms/ui-styles';
import { useContext } from 'react';

interface SidebarListProps {
    routes: DashboardRoutesProps[];
}

const SidebarLinks = ({ routes }: SidebarListProps) => {
    const { classes } = useSidebarStyles();
    const { minimize } = useContext(SidebarContext);
    const { isAdmin } = useContext(UserContext);
    console.log("router",routes)

    return (
        <>
            {routes.map((prop, key) => {
                if (prop.isAdmin && isAdmin) {
                    return (
                        <li key={key} className={classes.ct_menu_item}>
                            <Anchor
                                component={NavLink}
                                to={prop?.path}
                                className={classes.ct_menu_link}
                                sx={(theme) => ({
                                    padding: minimize ? `${theme.spacing.xs}px ${theme.spacing.sm}px` : `${theme.spacing.xs}px ${theme.spacing.md}px`,
                                })}>
                                <span className={classes.ct_menu__link_icon}>{prop?.icon}</span>
                                {!minimize && <span className={classes.ct_menu__link_text}>{prop?.name}</span>}
                            </Anchor>
                        </li>
                    );
                } else if (prop.isAdmin && !isAdmin) return null;
                else {
                    return (
                        <li key={key} className={classes.ct_menu_item}>
                            <Anchor
                                component={NavLink}
                                to={prop?.path}
                                className={classes.ct_menu_link}
                                sx={(theme) => ({
                                    padding: minimize ? `${theme.spacing.xs}px ${theme.spacing.sm}px` : `${theme.spacing.xs}px ${theme.spacing.md}px`,
                                })}>
                                <span className={classes.ct_menu__link_icon}>{prop?.icon}</span>
                                {!minimize && <span className={classes.ct_menu__link_text}>{prop?.name}</span>}
                            </Anchor>
                        </li>
                    );
                }
            })}
        </>
    );
};

export default SidebarLinks;
