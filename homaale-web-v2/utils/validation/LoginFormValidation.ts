import * as Yup from "yup";

import { phoneNumberValidationSchema, stringUnReq } from "./GlobalValidations";

/**
 * Checks if Login is Valid
 */
export const LoginValidationSchema = Yup.object().shape({
    username: stringUnReq,
    password: Yup.string().required("Required field"),
});

export const emailResendSchema = Yup.object().shape({
    email: Yup.string().email().required("Required field"),
});

export const OTPResendSchema = Yup.object().shape({
    phone: phoneNumberValidationSchema,
});
