import * as Yup from "yup";

const stringReqOnly = Yup.string().required("Required field");
const urlValidation = Yup.string()
    .matches(
        /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&-//=]*)$/,
        "Enter a valid url starting with http(s)"
    )
    .required("Required field");

export const certificateFormSchema = Yup.object().shape({
    name: stringReqOnly,
    issuing_organization: stringReqOnly,
    description: stringReqOnly,
    credential_id: stringReqOnly,
    certificate_url: urlValidation,
    issued_date: Yup.date().required().nullable(true),
    expire_date: Yup.date()
        .when("issued_date", (issued_date, schema) => {
            if (issued_date) {
                const dayAfter = new Date(issued_date.getTime());
                return schema
                    .min(
                        dayAfter,
                        "Expiry date must be greater than Issued date"
                    )
                    .nullable(true);
            }
            return Yup.date().nullable(true);
        })
        .nullable(true),
});
