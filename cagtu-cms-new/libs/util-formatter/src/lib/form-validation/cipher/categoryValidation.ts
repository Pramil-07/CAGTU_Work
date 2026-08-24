import * as Yup from 'yup';
import { stringValidate } from '../../util/helper';

export const cipherCategorySchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
    icon: stringValidate.notRequired().nullable(true),
    avatar_images: Yup.array().max(10, 'Cannot upload more than 10 avatars'),
});

export const topCategoriesSchema = Yup.object().shape({
    category: Yup.string().required('Required field')
});
