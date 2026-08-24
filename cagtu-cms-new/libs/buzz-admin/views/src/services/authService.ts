import http from './httpService';
import jwtDecode from 'jwt-decode';
import { urls } from '@cagtu-cms/data-access';
import { BuzzLoginFormValueProps } from '@cagtu-cms/util-formatter';

const accessTokenKey = 'access';

interface JwtToken {
    exp: number;
}

// Blog App Login
export const login = async (values: BuzzLoginFormValueProps) => {
    const response = await http.post(urls?.buzz?.cms?.auth?.login, values);
    if (response.data.message) throw new Error(response.data.message);
    const {
        data: { access },
    } = response;

    localStorage.setItem(accessTokenKey, access);
    http.setJwt(String(getJwt()));
};

// Logout
export const logout = () => {
    localStorage.removeItem(accessTokenKey);
};

// Get the CurrentUser Detail from the token
export const getCurrentUser = () => {
    try {
        const jwt = localStorage.getItem(accessTokenKey) as string;
        if (jwtDecode<JwtToken>(jwt).exp < Date.now() / 1000) {
            logout();
        } else {
            return jwtDecode(jwt);
        }
    } catch (err) {
        return null;
    }
};

// Get the token-key from the localStorage
export const getJwt = () => localStorage.getItem(accessTokenKey);

const auth = {
    login,
    logout,
    getCurrentUser,
    getJwt,
};

export default auth;
