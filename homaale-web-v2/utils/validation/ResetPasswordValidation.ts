import * as Yup from "yup";

import { passwordValidate } from "./GlobalValidations";

export const ResetPasswordValidationSchema = Yup.object().shape({
    password: passwordValidate,
    confirm_password: Yup.string()
        .required("Required field")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
});
