import * as Yup from 'yup';
import { numberValidate, stringReqOnly, stringValidate } from '../../util/helper';

export const servicePackageSchema = Yup.object().shape({
    title: stringValidate.min(2, 'Must be 2 characters or more'),
    description: Yup.string().min(12, 'Required field').required('Required field'),
    // service: stringReqOnly,
    budget: numberValidate,
    no_of_revision: numberValidate,
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
        then: stringReqOnly.nullable(),
    }),
});
