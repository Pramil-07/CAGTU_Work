import React from 'react';

interface ConvertAndFormatProps {
    number?: number | string;
    symbol?: string;
    globalCurrency: string;
    currency?: string;
    exchangeRate: number;
}

const ConvertAndFormat: React.FC<ConvertAndFormatProps> = ({
    number,
    symbol: propSymbol,
    globalCurrency,
    currency,
    exchangeRate
}) => {


    // Convert currency if needed
    const convertCurrency = (
        amount: number | string | undefined,
        globalCurrency: string,
        currency: string | undefined,
        exchangeRate: number
    ): { amount: number; currency: string; symbol: string | undefined } => {
        // Log inputs for debugging
        console.log('convertCurrency inputs:', { amount, globalCurrency, currency, exchangeRate });

        // Handle invalid or missing amount
        if (amount === undefined || amount === null || amount === '') {
            console.warn('Invalid amount, defaulting to 0');
            return { amount: 0, currency: globalCurrency, symbol: globalCurrency === 'AUD' ? 'AUD' : 'रु' };
        }

        const parsedAmount = parseFloat(amount.toString());
        if (isNaN(parsedAmount)) {
            console.warn('Failed to parse amount, defaulting to 0');
            return { amount: 0, currency: globalCurrency, symbol: globalCurrency === 'AUD' ? 'AUD' : 'रु' };
        }

        // Default to globalCurrency if currency is undefined
        const effectiveCurrency = currency || globalCurrency;

        // Validate exchangeRate
        const validExchangeRate = isNaN(exchangeRate) || exchangeRate <= 0 ? 1 : exchangeRate;

        // Log currency comparison
        console.log(`Comparing currencies: globalCurrency=${globalCurrency}, effectiveCurrency=${effectiveCurrency}`);
        console.log("amount",amount)

        if (globalCurrency !== effectiveCurrency) {
            if (effectiveCurrency === 'AUD' && globalCurrency === 'NPR') {
                console.log(`Converting ${parsedAmount} AUD to NPR with rate ${validExchangeRate}`);
                return { amount: parsedAmount * validExchangeRate, currency: 'NPR', symbol: 'रु' };
            } else if (effectiveCurrency === 'NPR' && globalCurrency === 'AUD') {
                console.log(`Converting ${parsedAmount} NPR to AUD with rate ${validExchangeRate}`);
                return { amount: parsedAmount / validExchangeRate, currency: 'AUD', symbol: 'AUD' };
            } else {
                console.warn(`Unsupported currency pair: ${effectiveCurrency} to ${globalCurrency}. Defaulting to ${globalCurrency}.`);
                return {
                    amount: parsedAmount,
                    currency: globalCurrency,
                    symbol: globalCurrency === 'AUD' ? 'AUD' : 'रु'
                };
            }
        } else {
            console.log('No conversion needed, currencies are the same');
            return {
                amount: parsedAmount,
                currency: effectiveCurrency,
                symbol: effectiveCurrency === 'AUD' ? 'AUD' : effectiveCurrency === 'NPR' ? 'रु' : propSymbol
            };
        }
    };

    // Format the number based on the currency symbol
    const formatNumberWithCondition = (
        number: number,
        symbol: string | undefined
    ): string => {
        if (symbol === 'रु') {
            return number.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        } else if (symbol === 'AU$') {
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        } else {
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        }
    };

    // Combine conversion and formatting
    const convertAndFormat = (
        amount: number | string | undefined,
        globalCurrency: string,
        currency: string | undefined,
        exchangeRate: number
    ): string => {
        const { amount: convertedAmount, symbol: convertedSymbol } = convertCurrency(
            amount,
            globalCurrency,
            currency,
            exchangeRate
        );
        const formattedAmount = formatNumberWithCondition(convertedAmount, convertedSymbol);
        return `${convertedSymbol || ''} ${formattedAmount}`;
    };

    return <>{convertAndFormat(number, globalCurrency, currency, exchangeRate)}</>;
};

export default ConvertAndFormat;

export const convertCurrency = (
    amount: number | string | undefined,
    globalCurrency: string,
    currency: string | undefined,
    exchangeRate: number
): { amount: number; currency: string; symbol: string | undefined } => {
    // Log inputs for debugging
    console.log('convertCurrency inputs:', { amount, globalCurrency, currency, exchangeRate });

    // Handle invalid or missing amount
    if (amount === undefined || amount === null || amount === '') {
        console.warn('Invalid amount, defaulting to 0');
        return { amount: 0, currency: globalCurrency, symbol: globalCurrency === 'AUD' ? 'AUD' : 'रु' };
    }

    const stringAmount = amount.toString().trim(); // Ensure string and remove whitespace
    const numericAmount = parseFloat(stringAmount);
    const parsedAmount = isNaN(numericAmount) ? 0 : parseFloat(numericAmount.toFixed(2));
    if (isNaN(parsedAmount)) {
        console.warn('Failed to parse amount, defaulting to 0');
        return { amount: 0, currency: globalCurrency, symbol: globalCurrency === 'AUD' ? 'AUD' : 'रु' };
    }

    // Default to globalCurrency if currency is undefined
    const effectiveCurrency = currency || globalCurrency;

    // Validate exchangeRate
    const validExchangeRate = isNaN(exchangeRate) || exchangeRate <= 0 ? 1 : exchangeRate;

    // Log currency comparison
    console.log(`Comparing currencies: globalCurrency=${globalCurrency}, effectiveCurrency=${effectiveCurrency}`);
    console.log("amount",amount)

    if (globalCurrency !== effectiveCurrency) {
        if (effectiveCurrency === 'AUD' && globalCurrency === 'NPR') {
            console.log(`Converting ${parsedAmount} AUD to NPR with rate ${validExchangeRate}`);
            return { amount: parsedAmount * validExchangeRate, currency: 'NPR', symbol: 'रु' };
        } else if (effectiveCurrency === 'NPR' && globalCurrency === 'AUD') {
            console.log(`Converting ${parsedAmount} NPR to AUD with rate ${validExchangeRate}`);
            return { amount: parsedAmount / validExchangeRate, currency: 'AUD', symbol: 'AUD' };
        } else {
            console.warn(`Unsupported currency pair: ${effectiveCurrency} to ${globalCurrency}. Defaulting to ${globalCurrency}.`);
            return {
                amount: parsedAmount,
                currency: globalCurrency,
                symbol: globalCurrency === 'AUD' ? 'AUD' : 'रु'
            };
        }
    } else {
        console.log('No conversion needed, currencies are the same');
        return {
            amount: parsedAmount,
            currency: effectiveCurrency,
            symbol: effectiveCurrency === 'AUD' ? 'AUD' : effectiveCurrency === 'NPR' ? 'रु' : ""
        };
    }
};
