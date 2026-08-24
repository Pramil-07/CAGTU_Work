import * as Yup from "yup";

import { dateReq, stringUnReq } from "./GlobalValidations";

export const eventCreateSchema = Yup.object().shape({
    entity_service: stringUnReq,
    title: stringUnReq,
    start: dateReq,
    end: Yup.date()
        .when("start", (start_date, schema) => {
            if (start_date) {
                const dayAfter = new Date(start_date.getTime());
                return schema
                    .min(dayAfter, "End date cannot be less than start date")
                    .nullable(true);
            }
            return Yup.date().required("Required field").nullable(true);
        })
        .required("End Date is required")
        .nullable(),
    guest_limit: Yup.number().required("Required field").nullable(),
    hours: stringUnReq,
});
