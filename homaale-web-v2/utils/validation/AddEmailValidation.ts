import * as Yup from "yup";

import { emailValidationSchema, passwordValidate } from "./GlobalValidations";

export const addEmailSchema = Yup.object().shape({
    email: emailValidationSchema,
    password: passwordValidate,
});
