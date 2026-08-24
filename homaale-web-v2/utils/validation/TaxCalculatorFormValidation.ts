import * as Yup from "yup";

import { stringUnReq } from "./GlobalValidations";

const numberValidate = Yup.number()
    .required("Required field")
    .typeError("salary must be a number");

const genderStatusValidate = Yup.mixed().required("Required field");
const maritalStatusValidate = Yup.mixed().oneOf(["Married", "Unmarried"]);

const incomeStatusValidate = Yup.mixed().required("Required field");

export const taxCalculatorSchema = Yup.object().shape({
    gender: stringUnReq,
    salary: numberValidate,
    marital_status: stringUnReq,
    income_time: stringUnReq,
});

export default taxCalculatorSchema;
