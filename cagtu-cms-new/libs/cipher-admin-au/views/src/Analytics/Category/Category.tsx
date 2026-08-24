import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, Badge as MantineBadge, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconCategory } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface CategoryStatusResult {
    is_active: boolean;
    count: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

interface CatgeoryByEntityServiceResult {
    service__category__name: string;
    count: number;
}

interface CatgeoryByApprovedTaskResult {
    entity_service__service__category__name: string;
    count: number;
}

const urlsPath = urls?.cipher?.analytics;

const CategoryAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const categoryAnalyticsAPI = new CipherAPI(urlsPath?.category);
    const [categoryStatus, setCategoryStatus] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['category-analytics'], () => categoryAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const categoryStatusData = data?.data?.category_is_active.map((val: CategoryStatusResult) => {
                return {
                    id: val?.is_active ? 'Active' : 'Inactive',
                    label: val?.is_active ? 'Active' : 'Inactive',
                    value: val?.count,
                };
            });
            setCategoryStatus(categoryStatusData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_category_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Category Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Categories
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.category_count)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconCategory size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Catgeory Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={categoryStatus} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Popular Category by Entity Service
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Name</th>
                                            <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.category_by_entity_service.map((cat: CatgeoryByEntityServiceResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.service__category__name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={cat?.count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Popular Category by Approved Task
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Name</th>
                                            <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.category_by_approved_task.map((cat: CatgeoryByApprovedTaskResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.entity_service__service__category__name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={cat?.count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Popular Category by Approved Service
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Name</th>
                                            <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.category_by_approved_service.map((cat: CatgeoryByApprovedTaskResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {cat?.entity_service__service__category__name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={cat?.count} radius="xl" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default CategoryAnalytics;
