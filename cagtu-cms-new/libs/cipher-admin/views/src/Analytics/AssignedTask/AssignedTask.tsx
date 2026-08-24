import { useContext, useState } from 'react';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, PaperBox, SkeletonUserAnalytics, PieChart, PageHeader } from '@cagtu-cms/ui-shared';
import { CipherUserContext, abbreviateNumber } from '@cagtu-cms/util-formatter';
import { Box, Grid, Group, ThemeIcon, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconListDetails, IconTool } from '@tabler/icons';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';

interface TaskStatusResult {
    status: string;
    count: number;
}

interface PieChartResult {
    id: string;
    label: string;
    value: number;
}

const urlsPath = urls?.cipher?.analytics;

const AssignedTaskAnalytics = () => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const assignedTaskAnalyticsAPI = new CipherAPI(urlsPath?.assignedTask);
    const [taskStatus, setTaskStatus] = useState<PieChartResult[]>([]);
    const [serviceStatus, setServiceStatus] = useState<PieChartResult[]>([]);

    const { isLoading, isError, isSuccess, data } = useQuery(['assignedTask-analytics'], () => assignedTaskAnalyticsAPI.list(), {
        onSuccess: (data) => {
            const taskStatusData = data?.data?.task_status.map((val: TaskStatusResult) => {
                return {
                    id: val?.status,
                    label: val?.status,
                    value: val?.count,
                };
            });
            const serviceStatusData = data?.data?.service_status.map((val: TaskStatusResult) => {
                return {
                    id: val?.status,
                    label: val?.status,
                    value: val?.count,
                };
            });
            setTaskStatus(taskStatusData);
            setServiceStatus(serviceStatusData);
        },
    });

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_task_analytics')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            {isLoading && <SkeletonUserAnalytics />}
            {isSuccess && (
                <>
                    <PageHeader pageTitle="Assigned Task Analytics" />
                    <Grid gutter="md" mb="xs">
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Task
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.task_count)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="teal">
                                        <IconListDetails size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col xl={2} md={4}>
                            <PaperBox>
                                <Group position="apart" spacing={15}>
                                    <Box>
                                        <Title order={5} weight={500} color="dimmed" size={13} mb={5}>
                                            Total Service
                                        </Title>
                                        <Title weight={500}>{abbreviateNumber(data?.data?.service_count)}</Title>
                                    </Box>
                                    <ThemeIcon variant="light" size={40} radius="xl" color="indigo">
                                        <IconTool size={24} stroke={1.75} />
                                    </ThemeIcon>
                                </Group>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                    <Grid gutter="lg">
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Task Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={taskStatus} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                        <Grid.Col md={4}>
                            <PaperBox>
                                <Title order={5} weight={600} mb={15}>
                                    Service Status
                                </Title>
                                <Box sx={{ height: 300 }}>
                                    <PieChart data={serviceStatus} />
                                </Box>
                            </PaperBox>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    );
};

export default AssignedTaskAnalytics;
