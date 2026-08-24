import * as Yup from "yup";

import { formatDate } from "../formatTime";
import {
    descriptionReq,
    termsAndConditionValidation,
} from "./GlobalValidations";

export const postEntityServiceSchema = (maxImages: number, maxVideos: number) =>
    Yup.object().shape({
        title: Yup.string()
            .required("Title is required")
            .min(10, "Title is too short"),
        description: descriptionReq,
        highlights: Yup.array().required("Requirements is required"),
        currency: Yup.string().required("Currency is required"),
        location: Yup.string().when("is_online", {
            is: "false",
            then: Yup.string().required("Location is required"),
        }),
        budget_type: Yup.string().required("Budget type is required"),
        start_date: Yup.date().when("is_requested", {
            is: true,
            then: Yup.date().required("Start Date is required"),
        }),
        end_date: Yup.date().when("is_requested", {
            is: true,
            then: Yup.date()
                .when("start_date", (start_date, schema) => {
                    if (start_date) {
                        const dayAfter = new Date(start_date.getTime());
                        return schema
                            .min(
                                dayAfter,
                                "End date cannot be less than start date"
                            )
                            .nullable(true);
                    }
                    return Yup.date().required("Required field").nullable(true);
                })
                .required("End Date is required")
                .nullable(),
        }),

        city: Yup.string().required("City is required").nullable(),
        service: Yup.string().required("Service is required"),
        category: Yup.string().required("Service is required"),
        budget_to: Yup.number()
            .min(0, "Budget to must be greater than 0")
            .required("Budget to is required"),
        end_time: Yup.string().when("is_requested", {
            is: false,
            then: Yup.string().nullable(),
            otherwise: Yup.string()
                .when(["start_date", "end_date"], {
                    is: (start_date: Date, end_date: Date) =>
                        start_date?.getTime() !== end_date?.getTime(),
                    then: Yup.string().nullable(),
                    otherwise: Yup.string()
                        .when("start_time", (start, schema) => {
                            const startDate: Date = start
                                ? formatDate(start)
                                : new Date();
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
                                                startDate.getTime() !==
                                                valueDate.getTime()
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
                        })
                        .nullable(),
                })
                .nullable(),
        }),

        is_terms_condition: termsAndConditionValidation,
        budget_from: Yup.number()
            .when("budget_choose", {
                is: "variable",
                then: Yup.number()
                    .when("budget_to", (budget_to, schema) => {
                        if (budget_to) {
                            return schema
                                .max(
                                    budget_to,
                                    "Budget from must be smaller than Budget to"
                                )
                                .nullable(true)
                                .required("Required field");
                        }
                    })
                    .nullable(),
            })
            .nullable(),
        imagePreviewUrl: Yup.array().max(
            maxImages,
            `Cannot Upload more than ${maxImages} images`
        ),
        videoPreviewUrl: Yup.array().max(
            maxVideos,
            `Cannot Upload more than ${maxVideos} videos`
        ),
        // ...(is_requested === "product"
        //     ? {
        //         currency: Yup.string().required("Currency is required"), // Products use currency
        //         cost_price: Yup.number().min(0).required("Cost price is required"),
        //         price: Yup.number().min(0).required("Price is required"),
        //         stock_quantity: Yup.number().min(0).required("Stock quantity is required"),
        //     }
        //     : {
        //         currency: Yup.string().required("Currency is required"),
        //
        //     }),
        // // Common fields for all types
        // images: Yup.array().max(maxImages, `Maximum ${maxImages} images allowed`),

    });

// import * as Yup from "yup";
// import { formatDate } from "../formatTime";
// import {
//     descriptionReq,
//     termsAndConditionValidation,
// } from "./GlobalValidations";
//
// const productBudgetSchema = Yup.object().shape({
//     cost_price: Yup.number()
//         .required('Cost price is required')
//         .min(1, 'Cost price must be greater than 0'),
//     discount_percentage: Yup.number()
//         .min(0, 'Discount cannot be negative')
//         .max(100, 'Discount cannot exceed 100%'),
//     selling_price: Yup.number(),
// });
//
// export const postEntityServiceSchema = (MaxImages: number, MaxVideos: number) => {
//     const isProductPage = typeof window !== "undefined" && window.location.pathname.includes("/product");
//
//     return Yup.object().shape({
//         title: Yup.string().required("Title is required"),
//         description: Yup.string().required("Description is required"),
//         highlights: Yup.array()
//             .of(Yup.string())
//             .min(1, "At least one highlight is required"),
//         city: Yup.string().required("City is required"),
//         location: Yup.string().when("is_online", {
//             is: "false",
//             then: Yup.string().required("Location is required"),
//         }),
//         budget_type: Yup.string().required("Budget type is required"),
//         budget_to: Yup.number()
//             .typeError("Budget must be a number")
//             .required("Budget is required")
//             .min(1, "Budget must be greater than 0"),
//         budget_from: Yup.number().when("budget_choose", {
//             is: "variable",
//             then: Yup.number()
//                 .typeError("Budget must be a number")
//                 .required("Budget is required")
//                 .min(1, "Budget must be greater than 0"),
//         }),
//         category: Yup.string().required("Category is required"),
//         service: Yup.string().required("Service is required"),
//         currency: Yup.string().required("Currency is required"),
//         images: Yup.array()
//             .of(
//                 Yup.mixed().test(
//                     "fileSize",
//                     "File size is too large",
//                     (value) => !value?.size || value?.size <= 4000000
//                 )
//             )
//             .test(
//                 "maxFiles",
//                 `More than ${MaxImages} images cannot be uploaded`,
//                 (value) => !value || value.length <= MaxImages
//             ),
//         videos: Yup.array()
//             .of(
//                 Yup.mixed().test(
//                     "fileSize",
//                     "File size is too large",
//                     (value) => !value?.size || value?.size <= 10000000
//                 )
//             )
//             .test(
//                 "maxFiles",
//                 `More than ${MaxVideos} videos cannot be uploaded`,
//                 (value) => !value || value.length <= MaxVideos
//             ),
//         start_date: Yup.date().when("is_requested", {
//             is: true,
//             then: Yup.date().required("Start date is required"),
//         }),
//         end_date: Yup.date().when("is_requested", {
//             is: true,
//             then: Yup.date()
//                 .required("End date is required")
//                 .min(Yup.ref("start_date"), "End date must be after start date"),
//         }),
//         start_time: Yup.string().when("is_requested", {
//             is: true,
//             then: Yup.string().required("Start time is required"),
//         }),
//         end_time: Yup.string().when("is_requested", {
//             is: true,
//             then: Yup.string().required("End time is required"),
//         }),
//         is_terms_condition: Yup.boolean()
//             .required("Terms and conditions must be accepted")
//             .oneOf([true], "Terms and conditions must be accepted"),
//         // Add product budget validation when is_requested is "product"
//         ...(isProductPage ? productBudgetSchema.fields : {}),
//     });
// };
