import * as Yup from 'yup';
import { stringValidate } from '../../util/helper';

export const categorySchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
    icon: stringValidate,
});

export const subCategorySchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
    product_attribute: Yup.array().min(1, 'Required field').required('Required field'),
    stock_attribute: Yup.array().min(1, 'Required field').required('Required field'),
});

export const childSubCategorySchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
});
