import * as Yup from 'yup';
import { stringValidate } from '../util/helper';

export const createBlogSchema = Yup.object().shape({
    title: stringValidate,
    content: Yup.string().min(12, 'Reqired field').required('Required field'),
    image: Yup.array().length(1, 'Required Field'),
});

export default createBlogSchema;
