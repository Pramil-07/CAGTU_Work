import * as Yup from 'yup';
import { numberValidate, stringReqOnly, stringValidate } from '../../util/helper';

export const taskSchema = Yup.object().shape({
    user: stringReqOnly,
    service: stringReqOnly.nullable(),
    title: stringValidate.min(2, 'Must be 2 characters or more'),
    budget_from: Yup.number().when('budget_select', {
        is: 'custom',
        then: numberValidate.nullable(true),
    }),
    budget_to: Yup.number()
        .when('budget_select', {
            is: 'custom',
            then: numberValidate.moreThan(Yup.ref('budget_from'), 'Must be more than budget from').nullable(true),
        })
        .when('budget_select', {
            is: 'fixed',
            then: numberValidate.nullable(true),
        }),
    discount_value: Yup.number()
        .when('is_discount_offer', {
            is: true,
            then: numberValidate.nullable(true),
        })
        .when('discount_type', {
            is: 'Percentage',
            then: numberValidate.max(100, 'Discount percentage cannot be greater than 100 percent').nullable(true),
        }),
    discount_type: Yup.string().when('is_discount_offer', {
        is: true,
        then: stringReqOnly.nullable(true),
    }),
    currency: stringReqOnly.nullable(true),
    country: stringReqOnly.nullable(true),
    city: Yup.string().when('country', (country, schema) => {
        return country ? schema.required('Required field') : schema.nullable(true);
    }),
    start_date: Yup.date()
        .when('is_requested', {
            is: true,
            then: Yup.date().required('Required field').nullable(true),
        })
        .nullable(true),
    end_date: Yup.date()
        .when('start_date', (start_date, schema) => {
            if (start_date) {
                const dayAfter = new Date(start_date.getTime());
                return schema.min(dayAfter, 'End date must be greater than start date').nullable(true);
            }
            return schema.when('is_requested', {
                is: true,
                then: Yup.date().required('Required field').nullable(true),
            });
        })
        .nullable(true),
    start_time: Yup.date()
        .when('is_requested', {
            is: true,
            then: Yup.date().min(new Date(), 'Start time must be greater than current time').required('Required field').nullable(true),
        })
        .nullable(true),
    end_time: Yup.date()
        .when('start_time', (start_time, schema) => {
            if (start_time) {
                const timeAfter = new Date(start_time.getTime() + 60);
                return schema.min(timeAfter, 'End time must be greater than start time').nullable(true);
            }
            return schema.when('is_requested', {
                is: true,
                then: Yup.date().required('Required field').nullable(true),
            });
        })
        .nullable(true),
    budget_type: stringReqOnly.nullable(),
    images: Yup.array().max(5, 'Cannot upload more than 5 images'),
    videos: Yup.array().max(2, 'Cannot upload more than 2 videos'),
});

export const taskFilterSchema = Yup.object().shape({
    budget_from: numberValidate.notRequired(),
    budget_to: numberValidate.notRequired(),
});
