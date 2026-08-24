"use client"

import { MantineProvider, createTheme } from "@mantine/core"
import { createContext, useContext, type ReactNode } from "react"

import "@mantine/core/styles.css"
import {useAuthModal} from "@/lib/hooks/useAuthModal";
import {AuthModal} from "@/components/authModal";

const theme = createTheme({
    primaryColor: "blue",
    fontFamily: "var(--font-sans)",
    headings: {
        fontFamily: "var(--font-sans)",
    },
})

interface AuthModalContextType {
    showLogin: () => void
    showProfile: () => void
    showKyc: () => void
    showSuspended: () => void
    showCannotDeactivate: () => void
    showSuccess: (payload: { btnTitle?: string; description: string; link?: string }) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const { modalState, closeModal, showLogin, showProfile, showKyc, showSuspended, showCannotDeactivate, showSuccess } =
        useAuthModal()

    return (
        <MantineProvider theme={theme}>
            <AuthModalContext.Provider
                value={{
                    showLogin,
                    showProfile,
                    showKyc,
                    showSuspended,
                    showCannotDeactivate,
                    showSuccess,
                }}
            >
                {children}
                <AuthModal
                    opened={modalState.opened}
                    onClose={closeModal}
                    color={modalState.color}
                    title={modalState.title}
                    description={modalState.description}
                    link={modalState.link}
                    buttonTitle={modalState.buttonTitle}
                    icon={modalState.icon}
                />
            </AuthModalContext.Provider>
        </MantineProvider>
    )
}

export function useAuthModalContext() {
    const context = useContext(AuthModalContext)
    if (context === undefined) {
        throw new Error("useAuthModalContext must be used within a AuthModalProvider")
    }
    return context
}
