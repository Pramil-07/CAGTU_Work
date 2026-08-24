import * as Yup from "yup";

import {
    passwordValidate,
    phoneNumberValidationSchema,
} from "./GlobalValidations";

export const addPhoneSchema = Yup.object().shape({
    phone: phoneNumberValidationSchema,
    password: passwordValidate,
});
