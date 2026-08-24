import * as Yup from "yup";

const stringReqOnly = Yup.string().required("Required field");
const dateValidation = Yup.date().required("Required field");

export const educationFormSchema = Yup.object().shape({
    school: stringReqOnly,
    description: stringReqOnly,
    degree: stringReqOnly,
    field_of_study: stringReqOnly,
    location: stringReqOnly,
    start_date: dateValidation,
    end_date: Yup.date()
        .when("start_date", (start_date, schema) => {
            if (start_date) {
                const dayAfter = new Date(start_date.getTime());
                return schema
                    .min(dayAfter, "End date must be greater than Start date")
                    .nullable(true);
            }
            return Yup.date().required("Required field").nullable(true);
        })
        .required(),
});
