export type LoginInputProps = {
    username: string;
    password: string;
    fcm_token: string | null;
};

export type GoogleLoginProps = {
    FCM_TOKEN: string;
    clientId: string;
    credential: string;
    select_by: string;
};
export type FacebookLoginProps = {
    FCM_TOKEN: string;
    accessToken: string;
    data_access_expiration_time: number;
    expiresIn: number;
    graphDomain: string;
    id: string;
    name: string;
    signedRequest: string;
    userId: string;
};
