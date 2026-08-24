import * as Yup from "yup";

import { stringUnReq } from "./GlobalValidations";

export const feedbackFormloggedInSchema = Yup.object().shape({
    subject: stringUnReq,
    description: stringUnReq,
    feedback_category: stringUnReq,
});
export default feedbackFormloggedInSchema;
