import * as Yup from "yup";

import { passwordValidate } from "./GlobalValidations";

export const changePasswordSchema = Yup.object().shape({
    old_password: passwordValidate,
    new_password: passwordValidate,
    confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Passwords do not match")
        .required("Required field"),
});

export default changePasswordSchema;

export const addPasswordSchema = Yup.object().shape({
    new_password: passwordValidate,
    confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Passwords do not match")
        .required("Required field"),
});
