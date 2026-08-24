import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, Badge as MantineBadge, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconListDetails } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface EntityServiceResult {
    is_requested: boolean;
    count: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

interface PopularServicesResult {
    service_id: string;
    service__title: string;
    count: number;
}

const urlsPath = urls?.cipher?.analytics;

const EntityServiceAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const entityServiceAnalyticsAPI = new CipherAPI(urlsPath?.entityService);
    const [entityService, setEntityService] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['entityService-analytics'], () => entityServiceAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const entityServiceData = data?.data?.entity_service.map((val: EntityServiceResult) => {
                return {
                    id: val?.is_requested ? 'Requested' : 'Provided',
                    label: val?.is_requested ? 'Requested' : 'Provided',
                    value: val?.count,
                };
            });

            setEntityService(entityServiceData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_entity_service_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Entity Service Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Available Tasks
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.avialable_tasks_count)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconListDetails size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Entity Service
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={entityService} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox sx={{ minHeight: 379 }}>
                                <Title order={5} weight={600} mb={15}>
                                    Most Popular Service Category
                                </Title>
                                <Table verticalSpacing={8} fontSize={13} horizontalSpacing={0}>
                                    <thead>
                                        <tr>
                                            <th style={{ fontWeight: 600 }}>Service</th>
                                            <th style={{ width: 50, fontWeight: 600 }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.service_count.map((service: PopularServicesResult, key: number) => (
                                            <tr key={key}>
                                                <td>
                                                    <Text component="span" sx={{ maxWidth: '95%', display: 'inline-block' }}>
                                                        {service?.service__title}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <MantineBadge name={service?.count} radius="xl" />
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

export default EntityServiceAnalytics;
