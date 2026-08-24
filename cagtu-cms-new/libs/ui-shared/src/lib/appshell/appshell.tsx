import { AppShellProps, SidebarContext, useDark } from '@cagtu-cms/util-formatter';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useContext } from 'react';
import Header from '../header/header';
import Sidebar from '../sidebar/sidebar';

export const AppShell = ({ children, sidebarList, headerComponent, ...props }: AppShellProps) => {
    const [dark] = useDark();
    const { opened, minimize, handleAsideToggler } = useContext(SidebarContext);

    return (
        <MantineAppShell
            {...props}
            padding="xl"
            navbarOffsetBreakpoint={'md'}
            fixed
            header={
                <Header opened={opened} onClick={handleAsideToggler}>
                    {headerComponent}
                </Header>
            }
            navbar={
                <Sidebar opened={opened} minimize={minimize}>
                    {sidebarList}
                </Sidebar>
            }
            sx={(theme) => ({
                main: { backgroundColor: dark ? theme.colors.dark[8] : theme.colors.gray[1] },
            })}>
            {children}
        </MantineAppShell>
    );
};

export default AppShell;
