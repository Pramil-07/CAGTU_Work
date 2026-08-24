import { Box, Container, Divider, Grid, Group, Skeleton, Table, Timeline } from '@mantine/core';
import PaperBox from '../paper-box/PaperBox';

export const SkeletonTableList = () => {
    const rowlengths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const colLengths = [1, 2, 3, 4, 5, 6, 7];

    return (
        <Table verticalSpacing={12}>
            <thead>
                <tr>
                    {colLengths.map((index) => (
                        <th key={index}>
                            <Skeleton height={8} radius={4} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rowlengths.map((index) => (
                    <tr key={index}>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                        <td>
                            <Skeleton height={8} radius={4} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export const SkeletonForm = () => {
    const colLengths = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <Container size="sm">
            <Grid gutter={30}>
                <Grid.Col md={12} py={0}>
                    <Skeleton height={120} width={120} radius={120} mb={20} />
                </Grid.Col>
                {colLengths.map((index) => (
                    <Grid.Col key={index} md={6} py={0}>
                        <Skeleton height={44} radius={4} mb={20} />
                    </Grid.Col>
                ))}
                <Grid.Col md={12} py={0}>
                    <Skeleton height={44} radius={4} mb={20} />
                </Grid.Col>
                <Grid.Col md={12} py={0}>
                    <Skeleton height={44} radius={4} mb={20} />
                </Grid.Col>
                <Grid.Col md={12} py={0}>
                    <Skeleton height={44} radius={4} mb={20} />
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export const SkeletonBlogForm = () => {
    return (
        <Grid gutter={30}>
            <Grid.Col xl={9} md={8}>
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={500} radius={4} />
            </Grid.Col>
            <Grid.Col xl={3} md={4}>
                <Skeleton height={160} radius={4} mb={20} />
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={10} radius={4} />
            </Grid.Col>
        </Grid>
    );
};

export const SkeletonVacancyForm = () => {
    return (
        <Grid gutter={30}>
            <Grid.Col xl={9} md={8}>
                <Skeleton height={500} radius={4} />
            </Grid.Col>
            <Grid.Col xl={3} md={4}>
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={160} radius={4} mb={20} />
                <Grid gutter={30}>
                    <Grid.Col md={6}>
                        <Skeleton height={44} radius={4} mb={20} />
                    </Grid.Col>
                    <Grid.Col md={6}>
                        <Skeleton height={44} radius={4} mb={20} />
                    </Grid.Col>
                </Grid>
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={44} radius={4} mb={20} />
                <Skeleton height={44} radius={4} mb={20} />
                <Grid gutter={30}>
                    <Grid.Col md={6}>
                        <Skeleton height={44} radius={4} mb={20} />
                    </Grid.Col>
                    <Grid.Col md={6}>
                        <Skeleton height={44} radius={4} mb={20} />
                    </Grid.Col>
                </Grid>
                <Divider my="sm" mb={20} mt={10} />
                <Skeleton height={10} radius={4} />
            </Grid.Col>
        </Grid>
    );
};

export const SkeletonUserForm = () => {
    return (
        <>
            <Skeleton height={44} radius={4} mb={20} />
            <Grid>
                <Grid.Col md={4}>
                    <Skeleton height={44} radius={4} mb={20} />
                </Grid.Col>
                <Grid.Col md={4}>
                    <Skeleton height={44} radius={4} mb={20} />
                </Grid.Col>
                <Grid.Col md={4}>
                    <Skeleton height={44} radius={4} mb={20} />
                </Grid.Col>
            </Grid>
            <Skeleton height={44} radius={4} mb={20} />
            <Skeleton height={44} radius={4} mb={20} />
            <Skeleton height={44} radius={4} mb={20} />
            <Skeleton height={44} radius={4} />
        </>
    );
};

export const SkeletonKYCDetail = () => {
    return (
        <>
            <Group position="apart" align="normal" mb={30}>
                <Box sx={{ width: '50%' }}>
                    <Group position="left" spacing={15} align="normal">
                        <Skeleton height={100} width={100} radius="md" />
                        <Box sx={{ width: '50%' }}>
                            <Group position="left" spacing={8}>
                                <Skeleton height={8} width="50%" radius="xl" />
                                <Skeleton height={8} radius="xl" />
                                <Skeleton height={8} radius="xl" />
                                <Skeleton height={8} radius="xl" />
                            </Group>
                        </Box>
                    </Group>
                </Box>
                <Box sx={{ width: '10%' }}>
                    <Group position="right" align="self-start" spacing={8}>
                        <Skeleton height={6} width="50%" radius="xl" />
                        <Skeleton height={6} radius="xl" />
                        <Skeleton height={6} radius="xl" />
                    </Group>
                </Box>
            </Group>
            <Grid gutter={30} mb={15}>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
            </Grid>
            <Divider mb={30} variant="dashed" />
            <Grid gutter={30} mb={15}>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
                <Grid.Col md={3}>
                    <Skeleton height={6} width="50%" radius="xl" mb={5} />
                    <Skeleton height={6} radius="xl" />
                </Grid.Col>
            </Grid>
            <Divider mb={30} variant="dashed" />
            <Skeleton height={30} radius={8} mb={8} />
            <Skeleton height={30} radius={8} mb={30} />
            <Divider mb={30} variant="dashed" />
            <Skeleton height={6} radius="xl" mb={5} />
            <Skeleton height={6} radius="xl" />
        </>
    );
};

export const SkeletonUserAnalytics = () => {
    const cardLengths = [1, 2, 3, 4, 5, 6];
    const cardRowLengths = [1, 2];
    return (
        <>
            <Grid gutter="md" mb="md">
                {cardLengths.map((index: number) => (
                    <Grid.Col xl={2} md={4} key={index}>
                        <PaperBox>
                            <Group position="apart" spacing={15}>
                                <Box sx={{ width: '70%' }}>
                                    <Skeleton height={6} width="40%" radius="xl" mb="xs" />
                                    <Skeleton height={8} radius="xl" />
                                </Box>
                                <Box>
                                    <Skeleton height={28} width={28} radius="xl" />
                                </Box>
                            </Group>
                        </PaperBox>
                    </Grid.Col>
                ))}
            </Grid>
            {cardRowLengths.map((index: number) => (
                <Grid key={index} gutter="md" mb="md">
                    <Grid.Col md={4}>
                        <PaperBox>
                            <Skeleton height={10} width="50%" radius="xl" mb="lg" />
                            <Skeleton height={300} radius={4} />
                        </PaperBox>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <PaperBox>
                            <Skeleton height={10} width="50%" radius="xl" mb="lg" />
                            <Skeleton height={300} radius={4} />
                        </PaperBox>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <PaperBox>
                            <Skeleton height={10} width="50%" radius="xl" mb="lg" />
                            <Skeleton height={300} radius={4} />
                        </PaperBox>
                    </Grid.Col>
                </Grid>
            ))}
        </>
    );
};

export const SkeletonLgalVersionHistory = () => {
    const timelineLengths = [1, 2, 3, 4, 5];
    return (
        <Grid gutter="lg">
            <Grid.Col md={9}>
                <Skeleton height={8} radius="xl" />
                <Skeleton height={8} mt="xs" radius="xl" />
                <Skeleton height={8} mt="xs" radius="xl" />
                <Skeleton height={8} mt="xs" radius="xl" />
                <Skeleton height={8} mt="xs" radius="xl" />
                <Skeleton height={8} mt="xs" width="70%" radius="xl" />
            </Grid.Col>
            <Grid.Col md={3}>
                <Group spacing="xs" mb="lg">
                    <Skeleton height={32} circle />
                    <Skeleton height={15} width="60%" radius="xl" />
                </Group>
                {
                    <Timeline lineWidth={2} bulletSize={16} ml={5}>
                        {timelineLengths.map((key: number) => (
                            <Timeline.Item key={key} title={<Skeleton height={10} width="50%" radius="xl" />}>
                                <Skeleton height={5} width="30%" mt="xs" radius="xl" />
                                <Skeleton height={5} width="30%" mt={6} radius="xl" />
                                <Skeleton height={5} width="30%" mt={6} radius="xl" />
                            </Timeline.Item>
                        ))}
                    </Timeline>
                }
            </Grid.Col>
        </Grid>
    );
};
