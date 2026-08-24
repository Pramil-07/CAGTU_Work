import { ReactNode } from 'react';

export interface CipherDashboardRoutesProps {
    path?: string;
    key: string;
    name: string;
    icon: ReactNode;
    role?: string[];
    hasChild?: boolean;
    permissions?: string[];
    permissionName?: string;
    children?: {
        path?: string;
        key: string;
        name: string;
        role?: string[];
        permissionName?: string;
    }[];
}
