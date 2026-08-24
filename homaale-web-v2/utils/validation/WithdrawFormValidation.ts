import * as Yup from "yup";

import { stringUnReq } from "./GlobalValidations";

export const WithdrawFormSchema = (
    available_amount: number,
    minimum_withdraw: number
) =>
    Yup.object().shape({
        amount: Yup.number()
            .min(
                minimum_withdraw,
                `Minimum withdraw amount is ${minimum_withdraw}`
            )
            .max(
                available_amount,
                "Your withdraw amount exceeds your current wallet amount"
            )
            .required("Budget to is required"),
        bank_account: stringUnReq,
    });
