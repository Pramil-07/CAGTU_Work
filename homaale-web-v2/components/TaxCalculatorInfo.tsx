import { Box, Grid } from "@mantine/core";

import { useTaxCalculatorStyles } from "@/styles/pages/TaxCalculatorStyles";

const TaxIncomeData = [
    "Salary(with Grade)",
    "Bonus",
    "Over Time Payment",
    "Entertainment and Transportation Allowance",
    "Leave Pay",
    "Prizes, Gifts",
    "Payment and Other Facilitations",
    "Dearness Allowances",
    "Cost of Living Allowances",
    "Rent Allowances",
];
const TaxSavingData = [
    "Provident Fund",
    "Citizen Investment Trust",
    "Social Security Fund",
    "Life Insurance",
    "Donations",
];

const TaxCalculatorInfo = () => {
    const { classes } = useTaxCalculatorStyles();
    return (
        <Box className={classes.taxInfoWrapper}>
            <Grid>
                <Grid.Col md={6}>
                    <h2>Taxable Income Source</h2>
                    {TaxIncomeData.map((info, i) => (
                        <p key={i}>{info}</p>
                    ))}
                </Grid.Col>
                <Grid.Col md={6}>
                    <h2>Tax Saving Component</h2>
                    {TaxSavingData.map((info, i) => (
                        <p key={i}>{info}</p>
                    ))}
                </Grid.Col>
            </Grid>
        </Box>
    );
};
export default TaxCalculatorInfo;
