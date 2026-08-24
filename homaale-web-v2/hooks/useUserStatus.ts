import { kyc, login, profile, suspended } from "@/features/utils/modalSlice";
import { useAppDispatch } from "@/hooks";

import { useUser } from "./useUser";
import {useRouter} from "next/router";

export enum USERSTATUS {
    profile = "profile",
    kyc = "kyc",
}

export const useUserStatus = () => {
    const { data } = useUser();
    const router = useRouter();
    const isKycDetailsPage = router.pathname === "/profile" && router.query.active_tab === "kyc-details";
    const dispatch = useAppDispatch();

    const checkStatus = (option: "profile" | "kyc") => {
        if (isKycDetailsPage) {
            return true;
        }
        if (data) {
            if (!data?.is_suspended) {
                switch (option) {
                    case USERSTATUS?.profile:
                        if (data?.has_profile) {
                            return true;
                        } else {
                            dispatch(profile());
                            return false;
                        }

                    case USERSTATUS?.kyc:
                        if (data?.has_profile) {
                            if (data?.is_kyc_verified) {
                                return true;
                            } else {
                                dispatch(kyc());
                                return false;
                            }
                        } else {
                            dispatch(profile());
                            return false;
                        }

                    default:
                        return false;
                }
            } else {
                dispatch(suspended());
                return false;
            }
        } else {
            dispatch(login());
            return false;
        }
    };

    const checkSuspention = () => {
        if (data?.is_suspended) {
            dispatch(suspended());
            return false;
        } else {
            return true;
        }
    };

    return { checkStatus, checkSuspention };
};
