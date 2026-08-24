import * as Yup from "yup";

import { passwordValidate } from "./GlobalValidations";

export const OtpVerifyValidationSchema = Yup.object().shape({
    otp: Yup.string()
        .matches(/^\d+$/, "The field should have digits only")
        .max(6, "The OTP code should only be of six digits"),
    password: passwordValidate,
    confirm_password: Yup.string()
        .required("Required field")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
});
