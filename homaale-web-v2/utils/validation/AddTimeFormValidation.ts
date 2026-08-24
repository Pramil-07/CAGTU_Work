import * as Yup from "yup";

import { formatDate } from "../formatTime";
import { timeInterval } from "./GlobalValidations";

export const addTimeFromSchema = Yup.object().shape({
    start: timeInterval,
    end: Yup.string()
        .test(
            "is-15-minute-interval",
            "Time must be in a 15-minute interval",
            (value) => {
                const splitTime = value?.split(":");
                const minute = splitTime ? parseInt(splitTime[1]) : 0;
                return minute % 15 === 0;
            }
        )
        .when("start", (start, schema) => {
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
                            return startDate.getTime() !== valueDate.getTime();
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
});
