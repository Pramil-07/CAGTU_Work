import { VacancySchema } from '@cagtu-cms/util-formatter';
import { Badge, Box, Divider, Grid, Group, Modal, ModalProps, Stack, Text, Title } from '@mantine/core';

interface CareerDetailModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    data: VacancySchema | undefined;
}

const CareerDetailModal = ({ onClose, opened, title, data, ...restProps }: CareerDetailModalProps & Partial<ModalProps>) => {
    return (
        <Modal
            {...restProps}
            opened={opened}
            onClose={onClose}
            centered
            title={
                title && (
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        {title}
                    </Title>
                )
            }>
            <>
                {title && <Divider mb={20} />}
                <Grid gutter="md" mb={20}>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Title
                        </Text>
                        <Text color="dimmed">{data?.title ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Stack spacing={0}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Status
                            </Text>
                            <Box>
                                <Badge
                                    size="lg"
                                    color={`${data?.is_active ? 'green' : 'red'}`}
                                    radius="xs"
                                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                                    {data?.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </Box>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Deadline
                        </Text>
                        <Text color="dimmed">{data?.deadline ?? 'N/A'}</Text>
                    </Grid.Col>

                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Department/Category
                        </Text>
                        <Text color="dimmed">{data?.category ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Designation/Position
                        </Text>
                        <Text color="dimmed">{data?.designation ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Experience
                        </Text>
                        <Text color="dimmed">{data?.experience ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            No Of Openings
                        </Text>
                        <Text color="dimmed">{data?.no_of_opening ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Job Type
                        </Text>
                        <Text color="dimmed">{data?.job_type ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Salary Range
                        </Text>
                        <Text color="dimmed">{data?.salary_range ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={4}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Location
                        </Text>
                        <Text color="dimmed">{data?.location ?? 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Group spacing={5}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Skills :
                            </Text>
                            {data?.skills
                                ? JSON.parse(data?.skills as string).map((skill: string) => (
                                      <Badge size="lg" sx={{ fontWeight: 600, fontSize: 12 }} m={2}>
                                          {skill}
                                      </Badge>
                                  ))
                                : 'N/A'}
                        </Group>
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Divider variant="dashed" />
                    </Grid.Col>
                    <Grid.Col md={12}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={2}>
                            Description :
                        </Text>
                        <Text color="dimmed" dangerouslySetInnerHTML={{ __html: data?.description ?? 'N/A' }} />
                    </Grid.Col>
                </Grid>
            </>
        </Modal>
    );
};

export default CareerDetailModal;
