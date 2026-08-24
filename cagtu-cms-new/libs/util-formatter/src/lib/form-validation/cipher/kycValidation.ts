import * as Yup from 'yup';
import { stringReqOnly, stringValidate } from '../../util/helper';

export const kycSchema = Yup.object().shape({
    name: stringValidate,
    role: stringValidate,
    gender: stringReqOnly,
    dob: Yup.date().nullable().required('Required field'),
    vat_number: stringValidate,
    country: stringReqOnly,
    address_1: stringValidate,
});

export const kycDocumentSchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
});
