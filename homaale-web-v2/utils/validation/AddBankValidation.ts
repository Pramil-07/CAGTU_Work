import * as Yup from "yup";

import { stringReq, stringUnReq } from "./GlobalValidations";

export const addBankWalletSchema = (is_wallet: boolean) =>
    Yup.object().shape({
        bank_name: stringUnReq,
        branch_name: !is_wallet ? stringUnReq : Yup.string().nullable(),
        bank_account_name: stringReq,
        bank_account_number: stringUnReq,
    });
