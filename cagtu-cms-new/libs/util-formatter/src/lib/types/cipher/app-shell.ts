import { ReactNode } from 'react';

export interface AppShellProps {
    sidebarList: ReactNode;
    headerComponent?: ReactNode;
    children: ReactNode;
}
