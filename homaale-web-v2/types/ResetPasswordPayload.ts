export interface ResetPasswordPayload {
    uid: string | string[] | undefined;
    token: string | string[] | undefined;
    password: string;
    confirm_password: string;
}
