import * as Yup from 'yup';
import { stringReqOnly, stringValidate } from '../../util/helper';

export const withdrawSchema = Yup.object().shape({
    payment_method: stringReqOnly,
    intent_id: stringValidate,
});

export const userWalletWithdrawSchema = Yup.object().shape({
    receiver: stringReqOnly,
});
