"use client"

import { useState } from "react"
import type { Icon } from "@tabler/icons-react"
import { IconCheck, IconExclamationMark, IconUser } from "@tabler/icons-react"

interface ModalState {
    opened: boolean
    color: string
    title: string
    description: string
    link?: string
    buttonTitle?: string
    icon: Icon
}

interface SuccessPayload {
    btnTitle?: string
    description: string
    link?: string
}

const initialState: ModalState = {
    opened: false,
    color: "",
    title: "",
    description: "",
    link: "",
    buttonTitle: "",
    icon: IconExclamationMark,
}

export function useAuthModal() {
    const [modalState, setModalState] = useState<ModalState>(initialState)

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, opened: false }))
    }

    const showLogin = () => {
        setModalState({
            opened: true,
            color: "#1F2937",
            title: "PLEASE LOGIN",
            description: "Login to continue further.",
            link: "/login",
            buttonTitle: "Go to login",
            icon: IconUser,
        })
    }

    const showProfile = () => {
        setModalState({
            opened: true,
            color: "#FCA500",
            title: "Incomplete Profile",
            description: "Please complete your profile to continue",
            link: "/profile",
            buttonTitle: "Go to Profile",
            icon: IconUser,
        })
    }

    const showKyc = () => {
        setModalState({
            opened: true,
            color: "#FCA500",
            title: "Complete your KYC",
            description: "Please complete your KYC to continue",
            link: "/profile?active_tab=kyc-details",
            buttonTitle: "Go to KYC",
            icon: IconUser,
        })
    }

    const showSuspended = () => {
        setModalState({
            opened: true,
            color: "#FE5050",
            title: "ACCOUNT SUSPENDED",
            description: "User is suspended",
            link: "/support",
            buttonTitle: "Go to Support",
            icon: IconExclamationMark,
        })
    }

    const showCannotDeactivate = () => {
        setModalState({
            opened: true,
            color: "#FCA500",
            title: "WARNING",
            description: "You cannot deactivate your account as you have active bookings.",
            link: "/bookings",
            buttonTitle: "Go to Bookings",
            icon: IconExclamationMark,
        })
    }

    const showSuccess = (payload: SuccessPayload) => {
        setModalState({
            opened: true,
            color: "#38C675",
            title: "Success",
            description: payload.description,
            link: payload.link,
            buttonTitle: payload.btnTitle,
            icon: IconCheck,
        })
    }

    return {
        modalState,
        closeModal,
        showLogin,
        showProfile,
        showKyc,
        showSuspended,
        showCannotDeactivate,
        showSuccess,
    }
}
