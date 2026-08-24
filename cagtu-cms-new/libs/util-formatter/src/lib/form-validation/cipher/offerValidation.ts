import * as Yup from 'yup';
import { numberValidate, stringReqOnly, stringValidate, validateExistingSingleFile } from '../../util/helper';

export const offerRuleSchema = Yup.object().shape({
    title: stringValidate,
    description: stringValidate,
});

export const serviceOfferSchema = Yup.object().shape({
    title: stringValidate,
    description: stringValidate.notRequired(),
    offer_rule: stringReqOnly.nullable(true),
    discount: numberValidate
        .when('discount_type', {
            is: 'Percentage',
            then: numberValidate.max(100, 'Discount percentage cannot be greater than 100 percent').nullable(true),
        })
        .notRequired()
        .nullable(true),
    discount_limit: numberValidate.round('floor').notRequired().nullable(true),
    offer_type: stringValidate.required('Please select any one offer type').nullable(true),
    quantity: numberValidate.notRequired().nullable(true),
    code: Yup.string().when('offer_type', (offer_type, schema) => {
        return offer_type === 'promo_code' || offer_type === 'coupon' || offer_type === 'scratch_card'
            ? schema.required('Required field')
            : schema.nullable(true);
    }),
    start_date: Yup.date().required('Required field').nullable(true),
    end_date: Yup.date()
        .when('start_date', (start_date, schema) => {
            if (start_date) {
                const dayAfter = new Date(start_date.getTime());
                return schema.min(dayAfter, 'End date-time must be greater than start date-time').notRequired().nullable(true);
            }
        })
        .notRequired()
        .nullable(true),
    image: validateExistingSingleFile('profilePreviewUrl'),
    // entity_services: Yup.array().min(1, 'Required field').nullable(true),
    // offer_scope: Yup.array()
    //     .of(
    //         Yup.object().shape(
    //             {
    //                 entity_service: Yup.string()
    //                     .when(['service', 'category'], {
    //                         is: (service: string, category: string) => !service && !category,
    //                         then: stringReqOnly.nullable(true),
    //                     })
    //                     .nullable(true),
    //                 service: Yup.string()
    //                     .when(['entity_service', 'category'], {
    //                         is: (entity_service: string, category: string) => !entity_service && !category,
    //                         then: stringReqOnly.nullable(true),
    //                     })
    //                     .nullable(true),
    //                 category: Yup.string()
    //                     .when(['entity_service', 'service'], {
    //                         is: (entity_service: string, service: string) => !entity_service && !service,
    //                         then: stringReqOnly.nullable(true),
    //                     })
    //                     .nullable(true),
    //             },
    //             [
    //                 ['entity_service', 'service'],
    //                 ['entity_service', 'category'],
    //                 ['service', 'category'],
    //             ]
    //         )
    //     )
    //     .nullable(true),
});

export const rewardsRuleSchema = Yup.object().shape(
    {
        model: stringReqOnly.nullable(true),
        action: stringReqOnly.nullable(true),
        reward_points: Yup.number()
            .when(['reward_percentage'], {
                is: (reward_percentage: string) => !reward_percentage,
                then: numberValidate.nullable(true),
            })
            .nullable(true),
        reward_percentage: Yup.number()
            .when(['reward_points'], {
                is: (reward_points: string) => !reward_points,
                then: numberValidate.max(100, 'Percent cannot be greater than 100').nullable(true),
            })
            .nullable(true),
    },
    [['reward_points', 'reward_percentage']]
);

export const badgeSchema = Yup.object().shape({
    title: stringValidate,
    progress_level_start: numberValidate.min(0, 'Cannot be negative number').nullable(true),
    progress_level_end: numberValidate.moreThan(Yup.ref('progress_level_start'), 'Must be greater than progress level start').nullable(true),
    image: validateExistingSingleFile('profilePreviewUrl'),
});


export const MerchantValidationSchema = Yup.object().shape({
  full_name: stringValidate,

  logo: Yup.mixed()
    .required('Business logo is required')
    .test('file', 'A valid file is required', (value) => value instanceof File),

  active_hour_start: Yup.string()
    .required('Active hour start is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in hh:mm format'),

  active_hour_end: Yup.string()
    .required('Active hour end is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in hh:mm format'),

  category: Yup.string()
    .required('Category is required')
    .notOneOf(['0'], 'Invalid category selection'),

  user: Yup.string()
    .required('User is required'),

  owner: Yup.string()
    .required('Owner is required'),

  address_line1: Yup.string()
    .required('Address Line 1 is required'),
});