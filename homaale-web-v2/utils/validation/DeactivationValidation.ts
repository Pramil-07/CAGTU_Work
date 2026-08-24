import * as Yup from "yup";

const stringReqOnly = Yup.string().required("Required field");

export const deactivateFormSchema = Yup.object().shape({
    reason: stringReqOnly,
    explanation: stringReqOnly,
});
