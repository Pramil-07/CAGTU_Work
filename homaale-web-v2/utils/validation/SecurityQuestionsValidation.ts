import * as Yup from "yup";

import { stringUnReq } from "./GlobalValidations";

export const securityQuestionSchema = Yup.object().shape({
    question: stringUnReq,
    answer: stringUnReq,
});
