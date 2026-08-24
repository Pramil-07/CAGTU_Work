import * as Yup from "yup";

import {
    emailValidationSchema,
    phoneNumberValidationSchema,
    stringUnReq,
} from "./GlobalValidations";
const FILE_SIZE = 1024 * 1024;
const SUPPORTED_FORMATS = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileUploadValidate = Yup.array()
    .length(1, "Required Field")
    .of(
        Yup.mixed()
            .test("fileFormat", "Unsupported file format", (value) => {
                return value && SUPPORTED_FORMATS.includes(value.type);
            })
            .test("fileSize", "File too large", (value) => {
                return value && value.size <= FILE_SIZE;
            })
    )
    .required("Required field");

const urlValidation = Yup.string()
    .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "Enter correct url!"
    )
    .required("Required field");

export const carrerApplyFormValidation = Yup.object().shape({
    full_name: stringUnReq,
    email: emailValidationSchema,
    phone: phoneNumberValidationSchema,
    // current_company: stringUnReq,
    experience: stringUnReq,
    portfolio_link: urlValidation,
    cv: fileUploadValidate,
    // cover_letter: stringUnReq,
});
