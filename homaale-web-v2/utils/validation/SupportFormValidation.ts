import * as Yup from "yup";

const stringReqOnly = Yup.string().required("Required field");

export const SupportFormValidation = Yup.object().shape({
    type: stringReqOnly,
    description: stringReqOnly,
});
export const OtherSupportFormValidation = Yup.object().shape({
    type: stringReqOnly,
    reason: stringReqOnly,
    description: stringReqOnly,
});
