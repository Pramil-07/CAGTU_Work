import type { Dispatch, SetStateAction } from "react";

export interface OtpModalpProps {
    opened: boolean;
    onClose: () => void;
    setShowForm: Dispatch<SetStateAction<boolean>>;
}
export interface AuthProps {
    otp?: string;
    phone: string;
    scope: string;
}
export interface ResendOtpPayload {
    phone: string;
    method: string;
}
