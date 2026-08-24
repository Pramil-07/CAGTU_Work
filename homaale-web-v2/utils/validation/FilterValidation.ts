import * as Yup from "yup";

export const DateFilterSchema = Yup.object().shape({
    date_before: Yup.date()
        .when("date_after", (date_after, schema) => {
            if (date_after) {
                return schema
                    .min(date_after, "Date 'To' cannot be less than 'From'")
                    .nullable(true);
            }
        })
        .nullable(),
});

export default DateFilterSchema;
