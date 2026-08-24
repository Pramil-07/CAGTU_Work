import * as Yup from 'yup';
import { numberValidate, stringValidate } from '../../util/helper';

export const cipherHoroscopeSchema = Yup.object().shape({
    sign: numberValidate,
    description: stringValidate,
});
