import * as Yup from "yup";

const stringReqOnly = Yup.string().required("Required field");
const dateValidation = Yup.date().nullable().required("Required field");
const urlValidation = Yup.string().url().required("Required field");

export const portfolioFormSchema = Yup.object().shape({
    title: stringReqOnly,
    description: stringReqOnly,
    credential_url: urlValidation,
    issued_date: dateValidation,
    imagePreviewUrl: Yup.array().max(4, `Cannot Upload more than 4 images`),
    pdfPreviewUrl: Yup.array().max(3, `Cannot Upload more than 3 files`),
});
