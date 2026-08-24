import { createContext } from 'react';

interface SidebarContextType {
    opened: boolean;
    minimize: boolean;
    handleAsideToggler?: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({ opened: false, minimize: false });

export default SidebarContext;
