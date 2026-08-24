import * as Yup from 'yup';
import { numberValidate, stringValidate } from '../../util/helper';

export const refundSchema = Yup.object().shape({
    booking: stringValidate,
    charge: numberValidate,
    type: stringValidate,
});
