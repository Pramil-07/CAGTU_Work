// import styles from './sidebar.module.scss';
import { Navbar, ScrollArea } from '@mantine/core';
import { ReactNode } from 'react';

/* eslint-disable-next-line */
export interface SidebarProps {
    opened: boolean;
    minimize?: boolean;
    children: ReactNode;
}

export const Sidebar = ({ opened, minimize, children }: SidebarProps) => {
    const minSm = minimize ? 60 : 250;

    return (
        <Navbar p="xs" hiddenBreakpoint="md" hidden={!opened} width={{ xl: minSm as number, sm: minSm as number }}>
            <Navbar.Section grow component={ScrollArea} scrollbarSize={6}>
                {children}
            </Navbar.Section>
        </Navbar>
    );
};

export default Sidebar;
