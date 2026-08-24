import * as Yup from "yup";

import {
    emailValidationSchema,
    passwordValidate,
    phoneNumberValidationSchema,
    termsAndConditionValidation,
} from "./GlobalValidations";

export const emailSignUpSchema = Yup.object().shape({
    email: emailValidationSchema,
    password: passwordValidate,
    confirmPassword: Yup.string()
        .required("Required field")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
    acceptTerms: termsAndConditionValidation,
});

export const phoneSignUpSchema = Yup.object().shape({
    phone: phoneNumberValidationSchema,
    password: passwordValidate,
    confirmPassword: Yup.string()
        .required("Required field")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
    acceptTerms: termsAndConditionValidation,
});
