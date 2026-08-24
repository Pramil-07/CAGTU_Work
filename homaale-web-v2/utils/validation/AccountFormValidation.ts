import dayjs from "dayjs";
import * as Yup from "yup";

import {
    phoneNumberValidationUnRequiredSchema,
    stringReq,
    stringUnReq,
    tagValidate,
} from "./GlobalValidations";

export const accountFormSchema = Yup.object().shape({
    first_name: stringReq,
    middle_name: Yup.string()
        .matches(/^[^!@#$%^&*+=<>:;|~]*$/, {
            message: "Symbols are not allowed",
        })
        .matches(/^[^\d]*$/, "Field cannot contain numbers"),
    last_name: stringReq,
    phone: phoneNumberValidationUnRequiredSchema,
    bio: Yup.string()
        .required("Required Field")
        .nullable()
        .max(
            250,
            "Your about section should contain maximum of 250 characters"
        ),
    gender: stringReq,
    date_of_birth: Yup.date()
        .max(
            dayjs(new Date()).endOf("month").subtract(16, "years").toDate(),
            "You must be at least 16 years"
        )
        .required("Required"),
    experience_level: Yup.string().required("Required field"),
    skills: tagValidate,
    interests: tagValidate,
    // active_hour_start: Yup.string().required("Required field").nullable(),
    // active_hour_end: Yup.string().required("Required field").nullable(),
    country: stringUnReq,
    city: stringUnReq,
    address_line1: stringUnReq,
    charge_currency: stringUnReq,
    profile_visibility: stringUnReq,
    task_preferences: stringUnReq,
});
