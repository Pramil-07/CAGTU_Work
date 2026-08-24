import * as Yup from 'yup';
import { emailValidate, passwordValidate, phoneValidate, stringReqOnly, stringValidate } from '../../util/helper';

export const supportTypeSchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
    notify_to: Yup.array().of(Yup.string()).min(1, 'Required field').required('Required field'),
});

export const supportSchema = Yup.object().shape({
    full_name: stringValidate.notRequired(),
    email: emailValidate.notRequired(),
    phone: phoneValidate.notRequired().nullable(true),
    priority: stringReqOnly.nullable(true),
    type: stringReqOnly.nullable(true),
    user: stringReqOnly.nullable(true),
    assigned_to: stringReqOnly.nullable(true),
    description: stringValidate,
});

export const emailSchema = Yup.object().shape({
    username: stringValidate,
    email: emailValidate,
    type: stringReqOnly.nullable(true),
});

export const emailPasswordSchema = emailSchema.shape({
    password: passwordValidate,
});
