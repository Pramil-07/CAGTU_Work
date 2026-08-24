import { ReactNode } from 'react';
import { DateRangePickerValue } from '@mantine/dates';

export interface DateFieldProps {
    name: string;
    labelName?: ReactNode;
    placeHolder?: string;
    error?: string;
    touch?: boolean;
    fieldRequired?: boolean;
    textMuted?: ReactNode;
    handleChange: (value: Date) => void;
}

export interface DateRangeFieldProps extends Omit<DateFieldProps, 'handleChange'> {
    handleDateRange: (value: DateRangePickerValue) => void | Date | null;
}
