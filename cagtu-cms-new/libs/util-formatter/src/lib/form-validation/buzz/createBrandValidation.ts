import * as Yup from 'yup';
import { stringValidate } from '../../util/helper';

export const brandSchema = Yup.object().shape({
    name: stringValidate,
    image: Yup.array().length(1, 'Required Field').nullable(true),
    banner: Yup.array().length(1, 'Required Field'),
});
