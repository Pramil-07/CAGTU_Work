import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// CSS Modules, react-datepicker-cssmodules.css
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import { Input } from '@mantine/core';

interface DateTimePickerProps extends ReactDatePickerProps {
    label: string;
    error: string;
}

const DateTimePicker = ({ label, error, ...rest }: DateTimePickerProps): JSX.Element => {
    return (
        <Input.Wrapper label={label} error={error}>
            <Input
                component={DatePicker}
                styles={{
                    input: {
                        height: 44,
                        border: error ? '1px solid red' : '',
                        color: error ? 'red' : '',
                        '&::placeholder': {
                            color: error ? 'red' : '',
                        },
                    },
                }}
                {...rest}
            />
        </Input.Wrapper>
    );
};

export default DateTimePicker;
