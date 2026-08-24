import { createContext } from 'react';

interface UserContextType {
    username?: string;
    email?: string;
    isAdmin?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    user_permissions?: string[];
}

export const UserContext = createContext<UserContextType>({});

export default UserContext;
