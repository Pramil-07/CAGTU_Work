"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get("msaccessToken"));

    useEffect(() => {
        const checkLogin = () => {
            setIsLoggedIn(!!Cookies.get("msaccessToken"));
        };
        checkLogin();
        // Optional: Listen for cookie changes in other tabs
        window.addEventListener("storage", checkLogin);
        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    const login = (token: string) => {
        Cookies.set("msaccessToken", token, { path: "/" });
        setIsLoggedIn(true);
    };

    const logout = () => {
        Cookies.remove("msaccessToken", { path: "/" });
        Cookies.remove("refreshToken",{path:"/"})
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};