import {
    Alert,
    Box,
    Button,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    ScrollArea,
    Table,
    Text,
} from "@mantine/core";
import { Form, Formik } from "formik";
import React, { useState } from "react";

import NumberField from "@/components/common/form/NumberField";
import SelectField from "@/components/common/form/SelectField";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import { toast } from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import TaxCalculatorInfo from "@/components/TaxCalculatorInfo";
import { useTaxCalculator } from "@/hooks/useTaxCalculator";
import { useTaxCalculatorStyles } from "@/styles/pages/TaxCalculatorStyles";
import { TaxCalculatorFormData } from "@/utils/formData/TaxCalculatorFormData";
import taxCalculatorSchema from "@/utils/validation/TaxCalculatorFormValidation";

export interface TaxCalculatorValueProps {
    marital_status: string;
    gender: string;
    salary: number | null | string;
    income_time: string;
    festival_bonus: number | null | string;
    allowance: number | null | string;
    others: number | null | string;
    pf: number | null | string;
    cit: number | null | string;
    life_insurance: number | null | string;
    medical_insurance: number | null | string;
}

const TaxCalculator = () => {
    const { classes, theme } = useTaxCalculatorStyles();
    const { mutate, data: TaxData, isLoading } = useTaxCalculator();

    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    const taxDetailResponse = [
        {
            id: "0",
            name: "Annual Gross Salary",
            amount: `${TaxData?.details["annual gross salary"]}`,
        },
        {
            id: "1",
            name: "Taxable Income",
            amount: `${TaxData?.details["net taxable income"]}`,
        },
        {
            id: "2",
            name: "Net Payable Tax",
            amount: `${TaxData?.details["net payable tax yearly"]}`,
        },
    ];

    const table = [
        {
            id: "0",
            heading: [
                {
                    id: "0",
                    name: "Taxable Salary",
                },
                {
                    id: "1",
                    name: "Taxable Amount",
                },
                {
                    id: "2",
                    name: "Tax Rate",
                },
                {
                    id: "3",
                    name: "Tax Liability",
                },
            ],
            data: [
                {
                    id: "0",
                    salary: "First Slab",
                    amount: `${
                        TaxData?.data[0] ? TaxData?.data[0].taxable_amount : "-"
                    }`,
                    rate: `${
                        TaxData?.data[0] ? TaxData?.data[0].tax_rate : "-"
                    }`,
                    liability: `${
                        TaxData?.data[0] ? TaxData?.data[0].tax_liability : "-"
                    }`,
                },
                {
                    id: "1",
                    salary: "Second Slab",
                    amount: `${
                        TaxData?.data[1] ? TaxData?.data[1].taxable_amount : "-"
                    }`,
                    rate: `${
                        TaxData?.data[1] ? TaxData?.data[1].tax_rate : "-"
                    }`,
                    liability: `${
                        TaxData?.data[1] ? TaxData?.data[1].tax_liability : "-"
                    }`,
                },
                {
                    id: "2",
                    salary: "Third Slab",
                    amount: `${
                        TaxData?.data[2] ? TaxData?.data[2].taxable_amount : "-"
                    }`,
                    rate: `${
                        TaxData?.data[2] ? TaxData?.data[2].tax_rate : "-"
                    }`,
                    liability: `${
                        TaxData?.data[2] ? TaxData?.data[2].tax_liability : "-"
                    }`,
                },
                {
                    id: "3",
                    salary: "Fourth Slab",
                    amount: `${
                        TaxData?.data[3] ? TaxData?.data[3].taxable_amount : "-"
                    }`,
                    rate: `${
                        TaxData?.data[3] ? TaxData?.data[3].tax_rate : "-"
                    }`,
                    liability: `${
                        TaxData?.data[3] ? TaxData?.data[3].tax_liability : "-"
                    }`,
                },
                {
                    id: "4",
                    salary: "Fifth Slab",
                    amount: `${
                        TaxData?.data[4] ? TaxData?.data[4].taxable_amount : "-"
                    }`,
                    rate: `${
                        TaxData?.data[4] ? TaxData?.data[4].tax_rate : "-"
                    }`,
                    liability: `${
                        TaxData?.data[4] ? TaxData?.data[4].tax_liability : "-"
                    }`,
                },
                {
                    id: "5",
                    salary: "Rebate for female tax payers (10%)",
                    amount: ``,
                    rate: ``,
                    liability: `${
                        TaxData?.details["rebate for female tax payers (10%)"]
                            ? TaxData?.details[
                                  "rebate for female tax payers (10%)"
                              ]
                            : "0"
                    }`,
                },
                {
                    id: "6",
                    salary: "Net Tax Liability(yearly)",
                    amount: ``,
                    rate: ``,
                    liability: `${
                        TaxData?.details["net tax liability yearly"]
                            ? TaxData?.details["net tax liability yearly"]
                            : "0"
                    }`,
                },
                {
                    id: "7",
                    salary: "Net Tax Liability(monthly)",
                    amount: ``,
                    rate: ``,
                    liability: `${
                        TaxData?.details["net tax liability monthly"]
                            ? TaxData?.details["net tax liability monthly"]
                            : "0"
                    }`,
                },
            ],
        },
    ];
    return (
        <Layout
            currentTitle="tax-calculator"
            heading="Tax Calculator"
            title="Tax Calculator | Homaale"
        >
            <LoadingOverlay
                loader={<HomaaleLoader />}
                visible={isLoading}
                sx={{ position: "fixed", inset: 0 }}
            />
            <div className={classes.wrapper} id="wrapper">
                <Grid gutter={90}>
                    <Grid.Col md={5} className={"col-left"}>
                        <Box>
                            <h4 className="heading">
                                Calculate your Personal Income TAX
                                <br />
                                For Remuneration Only
                            </h4>
                            <Text component="p" className="sub-heading">
                                This tax calculator tool is designed as per the
                                new salary tax which was announced during Budget
                                Announcement of 2077/2078.
                            </Text>

                            <Formik
                                initialValues={TaxCalculatorFormData}
                                validationSchema={taxCalculatorSchema}
                                onSubmit={async (values, actions) => {
                                    const newValues = {
                                        ...values,
                                        allowance: values.allowance ?? 0,
                                        festival_bonus:
                                            values.festival_bonus ?? 0,
                                        cit: values.cit ?? 0,
                                        life_insurance:
                                            values.life_insurance ?? 0,
                                        medical_insurance:
                                            values.medical_insurance ?? 0,
                                        others: values.others ?? 0,
                                        pf: values.pf ?? 0,
                                    };

                                    mutate(newValues, {
                                        onSuccess: async () => {
                                            setIsFormSubmitted(true);
                                            actions.resetForm();
                                        },
                                        onError: async (error) => {
                                            toast.error(error.message);
                                            actions.resetForm();
                                        },
                                    });
                                }}
                            >
                                {({ errors, touched }) => (
                                    <Form>
                                        <Group spacing={"xl"} mb={24} grow>
                                            <SelectField
                                                id="gender"
                                                name={"gender"}
                                                label="Gender"
                                                placeholder="Select your gender"
                                                data={[
                                                    {
                                                        value: "Male",
                                                        label: "Male",
                                                    },
                                                    {
                                                        value: "Female",
                                                        label: "Female",
                                                    },
                                                ]}
                                                touch={touched.gender}
                                                error={errors.gender}
                                                withAsterisk
                                                marginIgnore
                                            />
                                            <SelectField
                                                id="marital_status"
                                                name={"marital_status"}
                                                label="Marital Status"
                                                placeholder="Select your marital status"
                                                data={[
                                                    {
                                                        value: "Married",
                                                        label: "Married",
                                                    },
                                                    {
                                                        value: "Unmarried",
                                                        label: "Unmarried",
                                                    },
                                                ]}
                                                touch={touched.marital_status}
                                                error={errors.marital_status}
                                                withAsterisk
                                                marginIgnore
                                            />
                                        </Group>
                                        <Divider mb={16} />
                                        <Text className="block-title">
                                            Income
                                        </Text>
                                        <Group spacing={"xl"} grow>
                                            <NumberField
                                                id="salary"
                                                name={"salary"}
                                                label="Salary"
                                                placeholder="Enter your salary"
                                                touch={touched.salary}
                                                error={errors.salary}
                                                hideControls
                                                withAsterisk
                                                marginIgnore
                                            />
                                            <SelectField
                                                id="income_time"
                                                name={"income_time"}
                                                placeholder="Monthly"
                                                touch={touched.income_time}
                                                error={errors.income_time}
                                                data={[
                                                    {
                                                        value: "Monthly",
                                                        label: "Monthly",
                                                    },
                                                    {
                                                        value: "Yearly",
                                                        label: "Yearly",
                                                    },
                                                ]}
                                                marginIgnore
                                            />
                                        </Group>
                                        <NumberField
                                            id="festival_bonus"
                                            name={"festival_bonus"}
                                            label="Festival Bonus"
                                            placeholder="Festival bonuses (if any)"
                                            touch={touched.festival_bonus}
                                            error={errors.festival_bonus}
                                            hideControls
                                            marginIgnore
                                        />
                                        <NumberField
                                            id="allowance"
                                            name={"allowance"}
                                            label="Allowance"
                                            placeholder="Allowances (if any)"
                                            touch={touched.allowance}
                                            error={errors.allowance}
                                            hideControls
                                            marginIgnore
                                        />
                                        <NumberField
                                            id="others"
                                            name={"others"}
                                            label="Others"
                                            placeholder="Miscellaneous benefits (if any)"
                                            touch={touched.others}
                                            error={errors.others}
                                            hideControls
                                            marginIgnore
                                        />
                                        <Divider mb={16} />
                                        <Text className="block-title">
                                            Deduction
                                        </Text>
                                        <NumberField
                                            id="pf"
                                            name={"pf"}
                                            label="Provident Fund"
                                            placeholder="Provident fund deposits (if any)"
                                            touch={touched.pf}
                                            error={errors.pf}
                                            hideControls
                                            marginIgnore
                                        />
                                        <NumberField
                                            id="cit"
                                            name={"cit"}
                                            label="Citizen Investment Trust"
                                            placeholder="Citizen Investment Fund deposits (if any)"
                                            touch={touched.pf}
                                            error={errors.pf}
                                            hideControls
                                            marginIgnore
                                        />
                                        <NumberField
                                            id="life_insurance"
                                            name={"life_insurance"}
                                            label="Life Insurance"
                                            placeholder="Life insurance deposits (if any)"
                                            touch={touched.cit}
                                            error={errors.cit}
                                            hideControls
                                            marginIgnore
                                        />
                                        <NumberField
                                            id="medical_insurance"
                                            name={"medical_insurance"}
                                            label="Medical Insurance"
                                            placeholder="Medical insurance deposits (if any)"
                                            touch={touched.medical_insurance}
                                            error={errors.medical_insurance}
                                            hideControls
                                            marginIgnore
                                        />
                                        <Group grow>
                                            <Button variant="outline">
                                                Reset
                                            </Button>
                                            <Button type="submit">
                                                Calculate
                                            </Button>
                                        </Group>
                                        <Alert
                                            sx={{
                                                marginTop: 16,
                                                backgroundColor:
                                                    theme.colorScheme === "dark"
                                                        ? "rgba(240, 140, 0, 0.2)"
                                                        : "#FFF5E5 !important",
                                                ".mantine-Alert-message": {
                                                    color: "orange",
                                                },
                                            }}
                                        >
                                            Note: This tool is made for general
                                            tax calculation only. Information
                                            from this tool should not be used
                                            for any other purpose.
                                        </Alert>
                                    </Form>
                                )}
                            </Formik>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={6} className="col-right" id="col-right">
                        <Box pos={"sticky"} top={50}>
                            <Grid>
                                {taxDetailResponse.map((tax) => (
                                    <Grid.Col xl={4} key={tax.id}>
                                        <Box className="box">
                                            <Text
                                                component="p"
                                                className="box__title"
                                                truncate
                                                align="center"
                                            >
                                                {tax?.name}
                                            </Text>
                                            <Text
                                                component="p"
                                                className="box__amount"
                                                align="center"
                                                truncate
                                            >
                                                {isFormSubmitted
                                                    ? tax?.amount
                                                    : `0.00`}
                                            </Text>
                                        </Box>
                                    </Grid.Col>
                                ))}
                            </Grid>
                            <Box className="tax-slab-container">
                                <p>Your Tax Slab is</p>
                                <h1>
                                    Upto{" "}
                                    <span>
                                        {isFormSubmitted
                                            ? TaxData?.details["tax rate"]
                                            : `0%`}{" "}
                                    </span>
                                </h1>
                            </Box>
                            <Box className="tax-slab-table">
                                <ScrollArea>
                                    {TaxData ? (
                                        table.map((info) => (
                                            <Table
                                                key={info.id}
                                                verticalSpacing="sm"
                                                highlightOnHover
                                            >
                                                <thead>
                                                    <tr className="table-heading">
                                                        {info.heading.map(
                                                            (th) => (
                                                                <th key={th.id}>
                                                                    {th.name}
                                                                </th>
                                                            )
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {info.data.map((td) => (
                                                        <tr key={td.id}>
                                                            <td>{td.salary}</td>
                                                            <td>{td.amount}</td>
                                                            <td>{td.rate}</td>
                                                            <td>
                                                                {td.liability}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        ))
                                    ) : (
                                        <Alert
                                            sx={{
                                                textAlign: "center",
                                            }}
                                        >
                                            Please make a calculation to view
                                            your income data.
                                        </Alert>
                                    )}
                                </ScrollArea>
                            </Box>
                        </Box>
                    </Grid.Col>
                </Grid>
            </div>
            <TaxCalculatorInfo />
        </Layout>
    );
};

export default TaxCalculator;
