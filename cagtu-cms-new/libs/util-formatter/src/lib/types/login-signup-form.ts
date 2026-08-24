import { ReactNode } from 'react';

export interface LoginSignupFormProps {
    title: string;
    children: ReactNode;
    logo?: ReactNode;
}
export interface BuzzLoginFormValueProps {
    email: string;
    password: string;
}
export interface LoginFormValueProps {
    username: string;
    password: string;
}
