import * as Yup from 'yup';
import { numberValidate, stringReqOnly, stringValidate, validateExistingSingleFile } from '../../util/helper';

export const currencySchema = Yup.object().shape({
    name: stringValidate.max(64, 'Cannot be more than 64 characters'),
    code: stringValidate.max(5, 'Cannot be more than 5 characters'),
    current_value: numberValidate.min(0.0).round('floor').nullable(true),
    minor: numberValidate.nullable(true),
});

export const exchangeRateSchema = Yup.object().shape({
    value: numberValidate.min(0.0).round('floor').nullable(true),
    currency: stringReqOnly.nullable(),
});

export const languageSchema = Yup.object().shape({
    name: stringValidate.max(64, 'Cannot be more than 64 characters'),
    code: stringValidate.max(5, 'Cannot be more than 5 characters'),
});

export const countrySchema = Yup.object().shape({
    name: stringValidate.max(64, 'Cannot be more than 64 characters'),
    local_name: stringValidate,
    code: stringValidate.max(3, 'Cannot be more than 3 characters'),
    phone_code: numberValidate.max(99999, 'Cannot be more than 5 characters'),
    currency: stringReqOnly.nullable(),
    language: stringReqOnly.nullable(),
});

export const citySchema = Yup.object().shape({
    name: stringValidate,
    local_name: stringValidate,
    zip_code: numberValidate.max(9999999999, 'Cannot be more than 10 characters'),
    country: stringReqOnly.nullable(),
});

export const bankSchema = Yup.object().shape({
    name: stringValidate,
    swift_code: stringValidate,
    country: stringReqOnly.nullable(),
    logo: validateExistingSingleFile('profilePreviewUrl'),
});

export const branchSchema = Yup.object().shape({
    name: stringValidate,
    bank: stringReqOnly.nullable(),
});

export const topSkillsSchema = Yup.object().shape({
    skills: Yup.array().of(stringValidate).min(1, 'Required field').required('Required field'),
    country: stringReqOnly.nullable(),
});

export const skillsSchema = Yup.object().shape({
    name: stringValidate,
});

export const taskRecommendSchema = Yup.object().shape({
    title: stringValidate.max(64, 'Cannot be more than 64 characters'),
    entity_services: Yup.array().of(stringValidate).min(1, 'Required field').required('Required field'),
});
