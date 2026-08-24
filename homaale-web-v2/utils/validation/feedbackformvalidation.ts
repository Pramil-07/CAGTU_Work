import * as Yup from "yup";

import {
    emailValidationSchema,
    phoneNumberValidationSchema,
    stringUnReq,
} from "./GlobalValidations";

export const feedbackFormSchema = Yup.object().shape({
    full_name: stringUnReq,
    subject: stringUnReq,
    // email: emailValidationSchema,
    phone: phoneNumberValidationSchema,
    // feedback_category: stringUnReq,
    description: stringUnReq,
});
export const feedbackFormIsloggedInSchema = Yup.object().shape({
    subject: stringUnReq,
    // feedback_category: stringUnReq,
    description: stringUnReq,
});
export default feedbackFormSchema;
