import { createSlice } from "@reduxjs/toolkit"
import type { Icon } from "@tabler/icons-react"
import { IconCheck } from "@tabler/icons-react"
import { IconExclamationMark } from "@tabler/icons-react"
import { IconUser } from "@tabler/icons-react"

export interface ModalState {
    opened: boolean
    color: string
    title: string
    description: string
    link?: string
    buttonTitle?: string
    icon: Icon
}
export interface SuccessPayload {
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

export const ModalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        login: (state) => {
            state.opened = true
            state.color = "#1F2937"
            state.title = "PLEASE LOGIN"
            state.description = "Login to continue further."
            state.link = "/auth/login"
            state.buttonTitle = "Go to login"
            state.icon = IconUser
        },
        profile: (state) => {
            state.opened = true
            state.color = "#FCA500"
            state.title = "Incomplete Profile"
            state.description = "Please complete your profile to continue"
            state.link = "/settings/account"
            state.buttonTitle = "Go to Profile"
            state.icon = IconUser
        },
        kyc: (state) => {
            state.opened = true
            state.color = "#FCA500"
            state.title = "Complete your KYC"
            state.description = "Please complete your KYC to continue"
            state.link = "/profile?active_tab=kyc-details"
            state.buttonTitle = "Go to KYC"
            state.icon = IconUser
        },
        suspended: (state) => {
            state.opened = true
            state.color = "#FE5050"
            state.title = "ACCOUNT SUSPENDED"
            state.description = "User is suspended"
            state.link = "/support"
            state.buttonTitle = "Go to Support"
            state.icon = IconExclamationMark
        },
        cannot_deactivate: (state) => {
            state.opened = true
            state.color = "#FCA500"
            state.title = "WARNING"
            state.description = "You cannot deactivate your account as you have active bookings."
            state.link = "/bookings"
            state.buttonTitle = "Go to Bookings"
            state.icon = IconExclamationMark
        },
        success: (state, { payload }: { payload: SuccessPayload }) => {
            state.opened = true
            state.color = "#38C675"
            state.title = "Success"
            state.description = payload.description
            state.link = payload.link
            state.buttonTitle = payload.btnTitle
            state.icon = IconCheck
        },
        close: (state) => {
            state.opened = false
        },
    },
})

export const { login, profile, kyc, suspended, close, success, cannot_deactivate } = ModalSlice.actions

export default ModalSlice.reducer
