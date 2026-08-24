import * as Yup from "yup";

import {
    descriptionReq,
    listValidation,
    stringUnReq,
    termsAndConditionValidation,
} from "./GlobalValidations";

export const bookingFormVariableSchema = (
    lower_budget: number,
    upper_budget: number,
    is_range: boolean,
    maxImages: number,
    maxVideos: number
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
        requirements: listValidation,
        city: Yup.string().required("City is required").nullable(),
        description: descriptionReq,
        is_terms_condition: termsAndConditionValidation,

        imagePreviewUrl: Yup.array().max(
            maxImages,
            `Cannot Upload more than ${maxImages} images`
        ),
        videoPreviewUrl: Yup.array().max(
            maxVideos,
            `Cannot Upload more than ${maxVideos} videos`
        ),
    });
