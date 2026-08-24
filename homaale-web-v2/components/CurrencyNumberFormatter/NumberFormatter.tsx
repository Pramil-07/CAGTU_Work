//
// import React from 'react';
//
// // import {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
//
//
//
//
//
// interface NumberFormatterProps {
//     number?: number;
//     symbol?: string;
// }
//
// const NumberFormatter: React.FC<NumberFormatterProps> = ({ number, symbol }) => {
//     const formatNumberWithCondition = (number: number, symbol: string | undefined): string => {
//         if (symbol === "रु") {
//             // Custom format for Nepali style
//             return number.toLocaleString('en-IN', {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//             });
//         } else {
//             // Default English format
//             return number.toLocaleString('en-US', {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//             });
//         }
//     };
//
//     return <span>{formatNumberWithCondition(number, symbol)}</span>;
// };
//
// export default NumberFormatter;


import React from 'react';

interface NumberFormatterProps {
    number?: number | string;
    symbol?: string;
}

const NumberFormatter: React.FC<NumberFormatterProps> = ({number, symbol}) => {
    const formatNumberWithCondition = (
        input: number | string | undefined,
        symbol: string | undefined
    ): string => {
        if (input === undefined || input === null || input === '') {
            return ''; // Return an empty string for invalid or missing numbers
        }

        // Ensure input is converted to a number if it’s a string
        const validNumber = typeof input === 'number' ? input : parseFloat(input);

        // Return empty if parsing fails
        if (isNaN(validNumber)) {
            return '';
        }

        if (symbol === 'रु') {
            // Custom format for Nepali style
            return validNumber.toLocaleString('en-IN', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
            });
        } else {
            // Default English format
            return validNumber.toLocaleString('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
            });
        }
    };

    return <>{formatNumberWithCondition(number, symbol)}</>;
};

export default NumberFormatter;
