import CryptoJS from "crypto-js";

import { getAESEndpoint } from "../helpers";

const Encrypt = (message: string) => {
    return CryptoJS.AES.encrypt(message, getAESEndpoint()).toString();
};

const Decrypt = (message: string) => {
    return CryptoJS.AES.decrypt(message, getAESEndpoint()).toString(
        CryptoJS.enc.Utf8
    );
};

export { Decrypt, Encrypt };
