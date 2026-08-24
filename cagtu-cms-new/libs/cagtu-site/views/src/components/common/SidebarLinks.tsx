import { useSidebarStyles } from '@cagtu-cms/ui-styles';
import { CipherDashboardRoutesProps, SidebarContext, CipherUserContext } from '@cagtu-cms/util-formatter';
import { Anchor } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons';
import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarListProps {
    routes: CipherDashboardRoutesProps[];
}

const SidebarLinks = ({ routes }: SidebarListProps) => {
    const { classes } = useSidebarStyles();
    const { minimize } = useContext(SidebarContext);
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [openMenu, setOpenMenu] = useState<number[]>([]);

    const handleMenuDropdown = (key: number) => {
        setOpenMenu((prevState: number[]) => {
            if (prevState.includes(key)) {
                return prevState.filter((val: number) => val !== key);
            } else {
                return [...prevState, key];
            }
        });
    };

    const checkSidebarSubMenuActive = (hasChildActive: boolean) => {
        const defaultClass = classes.ct_menu_item;
        const activeClass = 'active';
        return hasChildActive ? `${defaultClass} ${activeClass}` : defaultClass;
    };

    return (
        <>
            {routes.map((prop, key) => {
                if (!prop?.hasChild) {
                    if (is_superuser || user_permissions?.includes(prop?.permissionName as string) || prop?.permissionName === 'public') {
                        return (
                            <li key={key} className={classes.ct_menu_item}>
                                <Anchor
                                    component={NavLink}
                                    to={String(prop?.path)}
                                    className={classes.ct_menu_link}
                                    sx={(theme) => ({
                                        padding: minimize ? `${8}px ${theme.spacing.xs}px` : `${8}px ${theme.spacing.xs}px`,
                                    })}>
                                    <span className={classes.ct_menu__link_icon}>{prop?.icon}</span>
                                    {!minimize && <span className={classes.ct_menu__link_text}>{prop?.name}</span>}
                                </Anchor>
                            </li>
                        );
                    } else {
                        return '';
                    }
                } else {
                    if (prop?.permissions?.some((permission) => is_superuser || user_permissions?.includes(permission))) {
                        return (
                            <li key={key} className={checkSidebarSubMenuActive(openMenu.includes(key))}>
                                <Anchor
                                    component="span"
                                    className={classes.ct_menu_link}
                                    onClick={() => handleMenuDropdown(key)}
                                    sx={(theme) => ({
                                        padding: minimize ? `${8}px ${theme.spacing.xs}px` : `${8}px ${theme.spacing.xs}px`,
                                    })}>
                                    <span className={classes.ct_menu__link_icon}>{prop?.icon}</span>
                                    {!minimize && (
                                        <>
                                            <span className={classes.ct_menu__link_text}>{prop?.name}</span>
                                            <IconChevronRight className="svg-inline-arrow--fa" size={14} />
                                        </>
                                    )}
                                </Anchor>
                                {!minimize && openMenu.includes(key) && (
                                    <ul className={classes.ct_submenu}>
                                        {prop?.children &&
                                            prop?.children.map((child, index) => {
                                                const key = `${index}_child`;
                                                if (
                                                    is_superuser ||
                                                    user_permissions?.includes(child?.permissionName as string) ||
                                                    child?.permissionName === 'public'
                                                ) {
                                                    return (
                                                        <li key={key} className={classes.ct_menu_item}>
                                                            <Anchor
                                                                component={NavLink}
                                                                to={`${String(prop?.path)}${String(child?.path)}`}
                                                                className={classes.ct_menu_link}>
                                                                <span className={classes.ct_menu__link_text}>{child?.name}</span>
                                                            </Anchor>
                                                        </li>
                                                    );
                                                } else {
                                                    return '';
                                                }
                                            })}
                                    </ul>
                                )}
                            </li>
                        );
                    } else {
                        return '';
                    }
                }
            })}
        </>
    );
};

export default SidebarLinks;
