import { ReactNode } from 'react';

export interface DashboardRoutesProps {
    path: string;
    key: string;
    name: string;
    icon: ReactNode;
    component?: ReactNode;
    isAdmin?: boolean;
}
