import * as Yup from "yup";

import { descriptionReq, stringUnReq } from "./GlobalValidations";

export const applyTaskVariableFormSchema = (
    lower_budget: number,
    upper_budget: number,
    is_range: boolean
) =>
    Yup.object().shape({
        price: is_range
            ? Yup.number()
                  .min(
                      lower_budget,
                      `Minimum amount should not be less than ${lower_budget}`
                  )
                  .max(
                      upper_budget,
                      `Maximum amount should not be greater than ${upper_budget}`
                  )
                  .required("Required field")
            : stringUnReq,
        description: descriptionReq,
    });
