import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import * as Yup from 'yup';
import * as _ from 'lodash';

// Hooks for dark and light mode
export const useDark = () => {
    const { colorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    return [dark];
};

// Icon Color mode for dark and light mode
export const useIconColorMode = () => {
    const [dark] = useDark();
    const theme = useMantineTheme();
    const iconColorMode = dark ? theme.colors.gray[2] : theme.colors.gray[7];

    return [iconColorMode];
};

// Password Regular Expression (Min 8, 1 Uppercase Letter, 1 Lowercase Letter,1 Number and 1 Special Character)
export const passwordRegex = /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/;

// Phone Number Regular Expression
export const phoneRegExp = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

// File Size
export const FILE_SIZE = 1024 * 1024;

// File Supported Format
export const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'];

// Image upload Validate if no required
export const imageUploadValidate = Yup.array()
    .of(
        Yup.mixed()
            .test('fileFormat', 'Unsupported file format', (value) => {
                return value && SUPPORTED_FORMATS.includes(value.type);
            })
            .test('fileSize', 'File too large', (value) => {
                return value && value.size <= FILE_SIZE;
            })
    )
    .nullable();

// Image upload Validate if required
export const validateExistingSingleFile = (existingFileField: string) => {
    return Yup.mixed().when(existingFileField, (existingFile) => {
        if (existingFile) {
            return Yup.array()
                .of(
                    Yup.mixed()
                        .test('fileFormat', 'Unsupported file format', (value) => {
                            return value && SUPPORTED_FORMATS.includes(value.type);
                        })
                        .test('fileSize', 'File too large', (value) => {
                            return value && value.size <= FILE_SIZE;
                        })
                )
                .length(1, 'Required field')
                .nullable();
        } else {
            return Yup.array()
                .of(
                    Yup.mixed()
                        .test('fileFormat', 'Unsupported file format', (value) => {
                            return value && SUPPORTED_FORMATS.includes(value.type);
                        })
                        .test('fileSize', 'File too large', (value) => {
                            return value && value.size <= FILE_SIZE;
                        })
                )
                .length(1, 'Required field')
                .required('Required file');
        }
    });
};

// Image upload Validate for large file if required
export const validateLargeImageFile = (existingFileField: string) => {
    return Yup.mixed().when(existingFileField, (existingFile) => {
        if (existingFile) {
            return Yup.array()
                .of(
                    Yup.mixed().test('fileFormat', 'Unsupported file format', (value) => {
                        return value && SUPPORTED_FORMATS.includes(value.type);
                    })
                )
                .length(1, 'Required field')
                .nullable();
        } else {
            return Yup.array()
                .of(
                    Yup.mixed().test('fileFormat', 'Unsupported file format', (value) => {
                        return value && SUPPORTED_FORMATS.includes(value.type);
                    })
                )
                .length(1, 'Required field')
                .required('Required file');
        }
    });
};

// Yup Validation
export const urlValidate = Yup.string().url('Invalid URL');
export const stringValidate = Yup.string().min(2, 'Must be 2 characters or more').required('Required field');
export const stringNotReqValidate = Yup.string().min(2, 'Must be 2 characters or more');
export const stringReqOnly = Yup.string().required('Required field');
export const dateValidate = Yup.string();
export const emailValidate = Yup.string().email('Invalid Email').required('Required field');
export const editorValidate = Yup.string().min(12, 'Required field').required('Required field');
export const numberValidate = Yup.number()
    .integer('Must be an Integer')
    .typeError('Must be a number')
    .positive('Must be a positive number')
    .min(0)
    .required('Required Field');
export const phoneValidate = Yup.string().matches(phoneRegExp, 'Invalid phone number').required('Required field');
export const passwordValidate = Yup.string()
    .min(8, 'Must contain at least 8 characters.')
    .matches(passwordRegex, 'Password must have 1 Uppercase, 1 Lowercase letter, 1 Number and 1 Special character.')
    .required('Required field');
export const confirmPasswordValidate = Yup.string()
    .when('password', {
        is: (val: string) => (val && val.length > 0 ? true : false),
        then: Yup.string().oneOf([Yup.ref('password')], 'Password must match'),
    })
    .required('Required field');

// Get Date in Format YYYY-MM-DD order
export const getFormatedDate = (value: Date) => {
    const today = new Date(value);
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();

    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
};

/**
 * Function that converts ISO Date String into 'Month Day, Year' i.e; "Aug 16, 2022".
 * @param {} value :: ISO Date String
 * @returns {String} :: Return Date into "Aug 16, 2022" order
 */
export const converDateFromIsonString = (value: Date) => {
    const createDate = new Date(value);
    const dateSplit = createDate.toDateString().split(' ');
    return `${dateSplit[1]} ${dateSplit[2]}, ${dateSplit[3]}`;
};

/**
 * Function that converts Time String into Date string.
 * @param {} value :: Time String "00:00:00"
 * @returns {String} :: Return Date into "Wed Sep 21 2022 10:00:00 GMT+0545 (Nepal Time)" order
 */
export const convertTimeStringToDateString = (value: string) => new Date(`${new Date().toISOString().split('T')[0]}T${value}`) as unknown as string;

/**
 * Function that converts Date into IsoString.
 * @param value :: "Wed Sep 21 2022 10:00:00 GMT+0545 (Nepal Time)"
 * @returns  :: Return Date into "2022-11-27T18:15:00.000Z" order
 */
export const convertDateToIsoString = (value: Date) => new Date(value).toISOString();

/**
 * Function that converts Date String into ISO Date String.
 * @param {} value :: Time String "YYYY-MM-DD"
 * @returns {String} :: Return Date into "Wed Sep 21 2022 10:00:00 GMT+0545 (Nepal Time)" order
 */
export const convertDateStringToISO = (value: string) => converDateFromIsonString(new Date(value)) as unknown as string;

// Get Time Format in 00:00
const padTo2Digits = (value: number) => String(value).padStart(2, '0');

export const getFormatedTime = (value: Date) => {
    const date = new Date(value);
    const hoursAndMinutes = padTo2Digits(date.getHours()) + ':' + padTo2Digits(date.getMinutes());
    return hoursAndMinutes;
};

// Convert Time to AM/PM
export const getTimeInAMPM = (value: string) => {
    let timeString = value;
    const H = +timeString.substr(0, 2);
    const h = H % 12 || 12;
    const ampm = H < 12 || H === 24 ? ' AM' : ' PM';
    timeString = h + timeString.substr(2, 3) + ampm;

    return timeString;
};

/**
 * Function that converts ISO Date String into '00:00 PM' i.e; "12:58 PM".
 * @param {} value :: ISO Date String
 * @returns {String} :: Return Time as "00:00 PM/AM" format
 */
export const getFormatedTimeAmPm = (value: Date) => {
    const isoDateValue = new Date(value);
    const hoursAndMinutes = padTo2Digits(isoDateValue.getHours()) + ':' + padTo2Digits(isoDateValue.getMinutes());
    const convertToAmPm = getTimeInAMPM(hoursAndMinutes);

    return convertToAmPm;
};

/**
 * Function that converts Time String into 'AM/PM' i.e; "12:58 PM / 10:00 AM".
 * @param {} value :: Time String "00:00:00"
 * @returns {String} :: Return Time as "00:00 AM/PM" format
 */
export const convertTimeStringToAMPM = (value: string) => {
    const timeString = convertTimeStringToDateString(value);
    return getFormatedTimeAmPm(new Date(timeString));
};

/**
 * Function that return a delete URL with multiple IDs.
 * @param {} checkedIds :: ChekedIDs is multiple ids of table row
 * @param {} urls :: Delete API url
 * @returns {String} :: Return Delete URL with mupltiple id inside 'id' query params
 */
export const getDeleteUrl = (checkedIds: string[], urls: string) => {
    let url = `${urls}?id=[`;
    checkedIds.forEach((id: string, index: number) => {
        const suffix = checkedIds.length - 1 === index ? ']' : ',';
        url = url + `${id}${suffix}`;
    });
    return url;
};

// Convert bytes into ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
/**
 * Function that Convert bytes into ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'].
 * @param {} bytes :: File size in bytes
 * @param {} decimals :: Decimals count show afetr the decimal "."
 * @returns {String} :: Return into string after convert the bytes into KB, MB, GB and so on.
 */
export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Function will converts file URL to findout the filename.
 * @param {} value :: File URL
 * @returns {String} :: Return filename e.g; 'image6.jpg'
 */
export const getFileName = (value: string) => {
    const docName = _.last(value.split('/'));
    return docName;
};
/**
 * Function will converts file URL to findout the file extension.
 * @param {} value :: File URL
 * @returns {String} :: Return filename e.g; '.jpg, .png, .pdf'
 */
export const getFileExtension = (value: string) => {
    const docName = _.last(value.split('/'));
    const docExtension = _.last(docName?.split('.'));
    return docExtension;
};

/**
 * Function will converts any numbers which is more than, 1000, 1000000, and 1000000000 into K, M and B
 * @param number :: Number
 * @returns :: Return '1K, 1M, 1B'
 */
export const abbreviateNumber = (number: number) => {
    if (number < 1000) {
        return number;
    }
    if (number >= 1000 && number < 1000000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    if (number >= 1000000 && number < 1000000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } if (number >= 1000000000) {
        return (number / 1000000000).toFixed(1) + 'B';
    }
    else {
        return '0';
    }
};

/*
Function to assign english horoscope sign name to respective horoscope sign id
*/
export const getEnglishHoroscopeName = (id: number) => {
    switch (id) {
        case 1:
            return 'Aries';
        case 2:
            return 'Taurus';
        case 3:
            return 'Gemini';
        case 4:
            return 'Cancer';
        case 5:
            return 'Leo';
        case 6:
            return 'Virgo';
        case 7:
            return 'Libra';
        case 8:
            return 'Scorpio';
        case 9:
            return 'Sagittarius';
        case 10:
            return 'Capricorn';
        case 11:
            return 'Aquarius';
        case 12:
            return 'Pisces';
        default:
            return '';
    }
};

/*
Function to assign nepali horoscope sign name to respective horoscope sign id
*/
export const getNepaliHoroscopeName = (id: number) => {
    switch (id) {
        case 1:
            return 'मेष';
        case 2:
            return 'वृष';
        case 3:
            return 'मिथुन';
        case 4:
            return 'कर्कट';
        case 5:
            return 'सिंह';
        case 6:
            return 'कन्या';
        case 7:
            return 'तुला';
        case 8:
            return 'वृश्चिक';
        case 9:
            return 'धनु';
        case 10:
            return 'मकर';
        case 11:
            return 'कुम्भ';
        case 12:
            return 'मीन';
        default:
            return '';
    }
};

/*
Function to assign display format from type id
*/
export const getHoroscopeFormat = (id: number) => {
    switch (id) {
        case 1:
            return 'Daily';
        case 2:
            return 'Weekly';
        case 3:
            return 'Monthly';
        case 4:
            return 'Yearly';
        default:
            return '';
    }
};

export const getCommisionMultiplier = (commission: number) => {
    const vat = 1.13;
    return 1 - (commission + 0.02) * vat;
};

// Get payable amount for a given amount by adding commission and service charge
export const getPayableAmount = (amount: string, commission: string) => {
    return Math.ceil(parseFloat(amount) / getCommisionMultiplier(parseFloat(commission)));
};

// Get receivable amount for a given amount from payable by subtracting commission and service charge
export const getReceivableAmount = (payable: string, commission: string) => {
    return Math.ceil(parseFloat(payable) * getCommisionMultiplier(parseFloat(commission)));
};

//Stores page limit for table date
export const storePageLimit = (page: string) => {
    localStorage.setItem('pageLimit', page);
};

//Gets page limit for table date
export const getPageLimit = () => {
    return localStorage.getItem('pageLimit');
};

//gets shape value for advertisement
export const getShape = (value: string) => {
    switch (value) {
        case 'lg_thin':
            return 'Large Thin';
        case 'md_thin':
            return 'Medium Thin';
        case 'sm_thin':
            return 'Small Thin';
        case 'lg_card':
            return 'Large Card';
        case 'md_card':
            return 'Medium Card';
        case 'sm_card':
            return 'Small Card';
        case 'lg_tall':
            return 'Large Tall';
        case 'md_tall':
            return 'Medium Tall';
        case 'sm_tall':
            return 'Small Tall';
        default:
            return '';
    }
};

//gets priority value for advertisement
export const getPriority = (value: string) => {
    switch (value) {
        case '1':
            return '1st';
        case '2':
            return '2nd';
        case '3':
            return '3rd';
        case '4':
            return '4th';
        case '5':
            return '5th';
        default:
            return '';
    }
};

//gets behaviour value for advertisement
export const getBehaviour = (value: string) => {
    switch (value) {
        case 'new_tab':
            return 'New Tab';
        case 'modal':
            return 'Modal';
        case 'pop_up':
            return 'Popup';
        case 'vanishing':
            return 'Vanishing';
        case 'bg':
            return 'Background';
        default:
            return '';
    }
};

//gets source value for advertisement
export const getSource = (value: string | null) => {
    switch (value) {
        case '0':
            return 'Internal';
        case '1':
            return 'External';
        default:
            return '';
    }
};

