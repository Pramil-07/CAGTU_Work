export type LinkedAccountProps = LinkedAccount[];

export interface LinkedAccount {
    id: number;
    provider: string;
    uid: string;
    extra_data: ExtraData;
    created: string;
    modified: string;
    user: string;
}

export interface ExtraData {
    hd: string;
    aud: string;
    azp: string;
    exp: number;
    iat: number;
    iss: string;
    jti: string;
    nbf: number;
    sub: string;
    name: string;
    email: string;
    picture: string;
    given_name: string;
    family_name: string;
    email_verified: boolean;
}
