import {Box} from "@mantine/core";
import {GoogleLogin} from "@react-oauth/google";
import Cookies from "js-cookie";
import {useRouter} from "next/router";

import {googleLogin} from "@/features/auth/authSlice";
import {useAppDispatch} from "@/hooks";
import type {GoogleLoginProps} from "@/types/LoginInputProps";
import {getFCMTOKEN} from "@/utils/helpers";

import {toast} from "../common/Toast";

const Google = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    return (
        <Box
            sx={{
                zIndex: 100,
                opacity: 0,
                position: "absolute",
                top: 4,
                left: 24,
            }}
        >
            <GoogleLogin
                onSuccess={async (credentialResponse) => {
                    credentialResponse.credential &&
                        Cookies.set(
                            "credentials",
                            credentialResponse.credential
                        );

                    const FCM_TOKEN = await getFCMTOKEN();
                    const loginData = { ...credentialResponse, FCM_TOKEN };

                    dispatch(googleLogin(loginData as GoogleLoginProps))
                        .unwrap()
                        .then(() => {
                            const referrer = document.referrer;
                            const isFromSameDomain = referrer &&   (
                                referrer.includes("localhost:3005") ||
                                referrer.includes("homaale.com") ||
                                referrer.includes("test-develop.d2y8k8uakte57r.amplifyapp.com")
                            );
                            const nextUrl = router?.query?.next as string | undefined;
                            if (nextUrl && nextUrl.startsWith("/")) {
                                router.replace(nextUrl);
                            } else if (window.history.length > 1 && isFromSameDomain) {
                                router.back();
                            } else {
                                router.replace("/#");
                            }
                        })
                        .catch((error) => {
                            const { non_field_errors } = error;
                            toast.error(non_field_errors?.[0]);
                        });
                }}
                onError={() => {
                    console.log("Login Failed");
                }}
                size="medium"
            />
        </Box>
    );
};

export default Google;
