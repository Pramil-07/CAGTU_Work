import * as Yup from 'yup';
import { stringValidate } from '../../util/helper';

export const groupSchema = Yup.object().shape({
    name: stringValidate.min(2, 'Must be 2 characters or more'),
});
