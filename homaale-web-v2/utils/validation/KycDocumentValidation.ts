import * as Yup from "yup";

import { stringReq } from "./GlobalValidations";

const stringReqOnly = Yup.string().required("Required field");
const dateValidation = Yup.date().nullable().required("Required field");
const fileUploadValidate = Yup.array()

    .min(1, "Required field")
    .max(1, "No more than one image is allowed.")
    .of(
        Yup.mixed()
            .test("fileFormat", "Unsupported file format", (value) => {
                return value;
            })
            .test("fileSize", "File too large", (value) => {
                return value;
            })
    )
    .required("Required field");

export const KYCDocumentSchema = Yup.object().shape({
    document_type: stringReqOnly,
    document_id: stringReqOnly,
    file: fileUploadValidate,
    issuer_organization: stringReqOnly,
    issued_date: dateValidation,
});
export const KYCFormSchema = Yup.object().shape({
    // logo: stringReqOnly,
    full_name: stringReq,
    address: stringReqOnly,
    // organization_name: stringReqOnly,
    country: stringReqOnly,
});
