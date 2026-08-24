import * as Yup from 'yup';
import { stringReqOnly } from '../util/helper';

export const scheduleInterviewSchema = Yup.object().shape({
    interview_date: Yup.date().min(new Date(), 'Start Date must be greater than today.').required('Required field').nullable(),
    interview_time: stringReqOnly,
});

export default scheduleInterviewSchema;
