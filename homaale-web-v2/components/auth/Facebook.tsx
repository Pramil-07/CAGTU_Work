import { Button, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { facebookLogin } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks";
import { FacebookIcon } from "@/public/svgs/FacebookIcon";
import type { FacebookLoginProps } from "@/types/LoginInputProps";
import { getFCMTOKEN } from "@/utils/helpers";

// Define the render prop type explicitly
interface RenderProps {
    onClick: () => void;
    isDisabled: boolean;
    isProcessing: boolean;
    isSdkLoaded: boolean;
}

const Facebook = () => {
    const theme = useMantineTheme();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const getFacebookAppId = () => {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        if (!appId) throw new Error("Facebook App ID is not set");
        return appId;
    };

    return (
        <FacebookLogin
            appId={getFacebookAppId()}
            autoLoad={false}
            callback={async (response) => {
                const FCM_TOKEN = await getFCMTOKEN();
                const loginData = { ...response, FCM_TOKEN };
                dispatch(facebookLogin(loginData as FacebookLoginProps))
                    .unwrap()
                    .then(() => {
                        router.replace(
                            router?.query?.next ? (router.query.next as string) : "/"
                        );
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }}
            render={(renderProps: RenderProps) => (
                <Button
                    variant="outline"
                    leftIcon={<FacebookIcon />}
                    onClick={renderProps.onClick}
                    disabled={renderProps.isDisabled || renderProps.isProcessing}
                    sx={{
                        height: 40,
                        width: 220,
                        border: `1px solid ${theme.colors.homaaleSlate[3]}`,
                        color:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[0]
                                : theme.colors.homaaleSlate[7],
                        fontSize: 14,
                        fontFamily: "Inter",
                        "&:not([data-disabled]):hover": {
                            background: "none",
                        },
                    }}
                >
                    Login with Facebook
                </Button>
            )}
        />
    );
};

export default Facebook;
