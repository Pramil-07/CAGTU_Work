import * as Yup from "yup";

import {
    descriptionReq,
    stringUnReq,
    termsAndConditionValidation,
} from "./GlobalValidations";

export const cancelSchema = Yup.object().shape({
    cancellation_reason: stringUnReq,
    cancellation_description: descriptionReq,
    is_terms_condition: termsAndConditionValidation,
});
