import { ReactNode } from 'react';

export interface HeaderProps {
    opened: boolean;
    onClick?: () => void;
    children: ReactNode;
}
