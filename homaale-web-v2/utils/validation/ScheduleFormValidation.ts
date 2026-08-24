import * as Yup from "yup";

import { formatDate } from "../formatTime";
import { dateReq, stringUnReq } from "./GlobalValidations";

export const scheduleFromSchema = Yup.object().shape({
    repeat_type: stringUnReq,
    start_date: dateReq,
    end_date: Yup.date()
        .when("start_date", (start_date, schema) => {
            if (start_date) {
                const dayAfter = new Date(start_date.getTime());
                return schema
                    .min(dayAfter, "End date cannot be less than start date")
                    .nullable(true);
            }
            return Yup.date().required("Required field").nullable(true);
        })
        .nullable(true),
    slots: Yup.array().of(
        Yup.object().shape({
            start: Yup.string().required("Time is requried"),
            end: Yup.string().when("start", (start, schema) => {
                const startDate: Date = start ? formatDate(start) : new Date();
                if (start) {
                    return schema
                        .test(
                            "same_dates_test",
                            "Start and end time must not be equal.",
                            function (value: string) {
                                const valueDate = value
                                    ? formatDate(value)
                                    : new Date();
                                return (
                                    startDate.getTime() !== valueDate.getTime()
                                );
                            }
                        )
                        .nullable(true)
                        .test(
                            "greater_time",
                            "End time cannot be smaller then start time.",
                            function (value: string) {
                                const valueDate = formatDate(value);
                                return startDate < valueDate;
                            }
                        )
                        .nullable(true);
                }
                return Yup.string().required("Required field").nullable(true);
            }),
        })
    ),
});
