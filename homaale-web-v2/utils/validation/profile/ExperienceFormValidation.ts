import * as Yup from "yup";

const stringReqOnly = Yup.string().required("Required field");
const dateValidation = Yup.date().nullable().required("Required field");
const employmentType = Yup.mixed().oneOf(["Full Time", "Part Time"]);

export const experienceFormSchema = Yup.object().shape({
    title: stringReqOnly,
    description: stringReqOnly,
    employment_type: employmentType,
    company_name: stringReqOnly,
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
            return Yup.date().nullable(true);
        })
        .nullable(true),
});
