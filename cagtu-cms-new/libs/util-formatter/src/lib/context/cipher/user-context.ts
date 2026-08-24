import { createContext } from 'react';

export interface UserContextType {
    username?: string;
    email?: string;
    is_superuser?: boolean;
    firstName?: string;
    lastName?: string;
    groups?: string[];
    last_login?: string;
    userId?: string;
    user_permissions?: string[];
}

export const CipherUserContext = createContext<UserContextType>({});
