import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, SkeletonUserAnalytics, PieChart, LineChart, PageHeader } from '@cagtu-cms/ui-shared';
import { abbreviateNumber, CipherUserContext, StatusType, useDark } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, ThemeIcon, Title, useMantineTheme, Text, Tooltip } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import {
    IconArrowsExchange2,
    IconChartBar,
    IconChartInfographic,
    IconReportAnalytics,
    IconReceiptTax,
    IconReceipt2,
    IconBrowser,
    IconHammer,
    IconRotateRectangle,
    IconPercentage,
    IconTag,
    IconDiscount2,
    IconCoins,
    IconCreditCard,
    IconPoint,
} from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface SenderResult {
    sender__user_profile__gender: string;
    count: number;
}

interface ReceiverResult {
    receiver__user_profile__gender: string;
    receiver_count: number;
}

interface CurrencyUsedResult {
    currency: string;
    total: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

interface LineResult {
    id: string;
    data: {
        x: string | number;
        y: string | number;
    }[];
}

interface PaymentMethodResult {
    payment_method__name: string;
    count: number;
    amount: number;
}
interface PaymentStatusResult {
    status: string;
    count: number;
    amount: number;
}

const urlsPath = urls?.cipher?.analytics;

const PaymentAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const [dark] = useDark();
    const theme = useMantineTheme();
    const paymentAnalyticsAPI = new CipherAPI(urlsPath?.payment);
    const [senderData, setSenderData] = useState<PieChartResult[]>([]);
    const [receiverData, setReceiverData] = useState<PieChartResult[]>([]);
    const [currencyUsedData, setCurrencyUsedData] = useState<LineResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['payment-analytics'], () => paymentAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const senderData = data?.data?.gender?.sender.map((val: SenderResult) => {
                return {
                    id: val?.sender__user_profile__gender,
                    label: val?.sender__user_profile__gender,
                    value: val?.count,
                };
            });
            const receiverData = data?.data?.gender?.receiver.map((val: ReceiverResult) => {
                return {
                    id: val?.receiver__user_profile__gender,
                    label: val?.receiver__user_profile__gender,
                    value: val?.receiver_count,
                };
            });
            const currencyDataValue = data?.data?.currency_used.map((val: CurrencyUsedResult) => {
                return {
                    x: val?.currency,
                    y: val?.total,
                };
            });

            const currencyUsedData: LineResult[] = [
                {
                    id: 'Total -',
                    data: currencyDataValue,
                },
            ];

            setSenderData(senderData);
            setReceiverData(receiverData);
            setCurrencyUsedData(currencyUsedData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_payment_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Payment Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Sales Amt.
                                        </Title>
                                        <Title weight={500}>
                                            {data?.data?.order_sales?.amount
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.amount).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconChartBar size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Max. Sales
                                        </Title>
                                        <Title weight={500}>
                                            {data?.data?.sales?.max
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.sales?.max).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="violet">
                                        <IconReportAnalytics size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Min. Sales
                                        </Title>
                                        <Title weight={500}>
                                            {data?.data?.sales?.min
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.sales?.min).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="yellow">
                                        <IconReportAnalytics size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Average Sales
                                        </Title>
                                        <Title weight={500}>
                                            {data?.data?.sales?.avg
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.sales?.avg).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl">
                                        <IconChartInfographic size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            No. of Transaction
                                        </Title>
                                        <Title weight={500}>
                                            {data?.data?.order_sales?.no_of_transaction
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.no_of_transaction).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="green">
                                        <IconArrowsExchange2 size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <PaperBox mb="lg">
                        <Title order={5} weight={600} mb={15}>
                            Order Summary
                        </Title>
                        <Grid gutter="sm">
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconReceiptTax size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Tax
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.tax
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.tax).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconReceipt2 size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            VAT
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.tax
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.tax).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconBrowser size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Platform Charge
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.platform_charge
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.platform_charge).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconHammer size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Equipment Charges
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.equipment_charges
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.equipment_charges).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconRotateRectangle size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Revision Charges
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.revision_charges
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.revision_charges).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconPercentage size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Discount
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.discount
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.discount).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconTag size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Offer Discount
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.offer_discount
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.offer_discount).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconDiscount2 size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Platform Chrg. Discount
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.platform_charge_discount
                                                ? abbreviateNumber(
                                                      Number(Number.parseFloat(data?.data?.order_sales?.platform_charge_discount).toFixed(2))
                                                  )
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                            <Grid.Col xl={2} md={4}>
                                <Group
                                    position="left"
                                    spacing={15}
                                    sx={{
                                        border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                        borderRadius: theme.radius.md,
                                    }}
                                    py="xs"
                                    px="sm">
                                    <ThemeIcon variant="light" size={44} color="gray" radius="md">
                                        <IconCoins size={24} stroke={1.75} color={dark ? theme.white : theme.colors.gray['8']} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text weight={500} color="dimmed" size={13}>
                                            Other Discount
                                        </Text>
                                        <Title order={4} weight={500}>
                                            {data?.data?.order_sales?.other_discounts
                                                ? abbreviateNumber(Number(Number.parseFloat(data?.data?.order_sales?.other_discounts).toFixed(2)))
                                                : '-'}
                                        </Title>
                                    </Box>
                                </Group>
                            </Grid.Col>
                        </Grid>
                    </PaperBox>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Currency Used
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <LineChart data={currencyUsedData} yFormat=" >-,.2f" />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Sender
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={senderData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Receiver
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={receiverData} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Payment Method
                                </Title>
                                {data?.data?.payment_method.map((val: PaymentMethodResult, key: number) => (
                                    <Group
                                        key={key}
                                        position="apart"
                                        spacing={10}
                                        sx={{
                                            border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                            borderRadius: theme.radius.md,
                                        }}
                                        py="xs"
                                        px="sm"
                                        mt={10}>
                                        <Group position="left" spacing={15}>
                                            <ThemeIcon variant="light" size={34}>
                                                <IconCreditCard size={24} stroke={1.75} />
                                            </ThemeIcon>
                                            <Box>
                                                <Title order={6} weight={500}>
                                                    {val?.payment_method__name}
                                                </Title>
                                                <Text weight={500} size="xs" color="dimmed">
                                                    TXN. Count:{' '}
                                                    <Text component="span" weight={500} size="xs" color={dark ? theme.white : theme.colors.dark['6']}>
                                                        {abbreviateNumber(val?.count)}
                                                    </Text>
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Box>
                                            <Text weight={500} size="xs" color="dimmed" sx={{ fontStyle: 'italic', textAlign: 'right' }}>
                                                Amt.
                                            </Text>
                                            <Tooltip
                                                label={`Rs. ${val?.amount.toLocaleString()}`}
                                                withArrow
                                                position="bottom"
                                                styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                <Text weight={500} size="sm">
                                                    Rs. {abbreviateNumber(val?.amount)}
                                                </Text>
                                            </Tooltip>
                                        </Box>
                                    </Group>
                                ))}
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Payment Status
                                </Title>
                                {data?.data?.payment_status.map((val: PaymentStatusResult, key: number) => (
                                    <Group
                                        key={key}
                                        position="apart"
                                        spacing={10}
                                        sx={{
                                            border: `1px solid ${dark ? theme.colors.dark['4'] : theme.colors.gray['2']}`,
                                            borderRadius: theme.radius.md,
                                        }}
                                        py="xs"
                                        px="sm"
                                        mt={10}>
                                        <Group position="left" spacing={15}>
                                            <ThemeIcon
                                                variant="light"
                                                color={
                                                    val?.status === StatusType.COMPLETED
                                                        ? 'green'
                                                        : val?.status === StatusType.INITIATED
                                                        ? 'blue'
                                                        : 'yellow'
                                                }>
                                                <IconPoint size={24} stroke={1.75} />
                                            </ThemeIcon>
                                            <Box>
                                                <Title
                                                    order={6}
                                                    weight={500}
                                                    color={
                                                        val?.status === StatusType.COMPLETED
                                                            ? 'green'
                                                            : val?.status === StatusType.INITIATED
                                                            ? 'blue'
                                                            : 'yellow'
                                                    }>
                                                    {_.upperFirst(val?.status)}
                                                </Title>
                                                <Text weight={500} size="xs" color="dimmed">
                                                    TXN. Count:{' '}
                                                    <Text component="span" weight={500} size="xs" color={dark ? theme.white : theme.colors.dark['6']}>
                                                        {abbreviateNumber(val?.count)}
                                                    </Text>
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Box>
                                            <Text weight={500} size="xs" color="dimmed" sx={{ fontStyle: 'italic', textAlign: 'right' }}>
                                                Amt.
                                            </Text>
                                            <Tooltip
                                                label={`Rs. ${val?.amount.toLocaleString()}`}
                                                withArrow
                                                position="bottom"
                                                styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                                                <Text weight={500} size="sm">
                                                    Rs. {abbreviateNumber(val?.amount)}
                                                </Text>
                                            </Tooltip>
                                        </Box>
                                    </Group>
                                ))}
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default PaymentAnalytics;
