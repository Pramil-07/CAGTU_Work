import * as Yup from "yup";

import { emailValidationSchema } from "./GlobalValidations";
import { stringUnReq } from "./GlobalValidations";

export const contactFormSchema = Yup.object().shape({
    full_name: stringUnReq,
    email: emailValidationSchema,
    message: stringUnReq,
});

export default contactFormSchema;
