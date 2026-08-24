import * as Yup from 'yup';
import { stringNotReqValidate, stringReqOnly, stringValidate } from '../../util/helper';

export const attributesSchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
    info: stringValidate.notRequired(),
    unit: stringNotReqValidate,
    type: stringReqOnly.nullable(),
    options: Yup.array().when('type', {
        is: 'select',
        then: Yup.array().of(stringValidate).min(1, 'Required field').required('Required field'),
    }),
});
