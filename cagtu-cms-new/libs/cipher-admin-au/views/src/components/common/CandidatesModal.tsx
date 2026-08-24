import { CandidatesSchema, getFileName, useIconColorMode } from '@cagtu-cms/util-formatter';
import { Box, Center, Avatar, Grid, Group, Loader, Modal, ModalProps, Text, Title, useMantineTheme, Divider, ActionIcon } from '@mantine/core';
import { IconFileDescription, IconMail, IconMapPin, IconPhone } from '@tabler/icons';
import * as _ from 'lodash';

export interface CandidatesModalProps {
    opened: boolean;
    onClose: () => void;
    title?: string;
    data: CandidatesSchema;
    isLoading: boolean;
}

const CandidatesModal = ({ onClose, opened, title, isLoading, data, ...restProps }: CandidatesModalProps & Partial<ModalProps>) => {
    const theme = useMantineTheme();
    const [iconColorMode] = useIconColorMode();

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
            {isLoading ? (
                <Center>
                    <Loader size="xs" variant="dots" />
                </Center>
            ) : (
                <>
                    <Group position="left" spacing={15} align="normal" mb={20}>
                        <Avatar size={100} radius="md" color="blue">
                            {_.first(data?.full_name.split(' '))?.toUpperCase().charAt(0)}
                            {_.last(data?.full_name.split(' '))?.toUpperCase().charAt(0)}
                        </Avatar>
                        <Box>
                            <Title order={5} weight={600} mb={5}>
                                {data?.full_name}
                            </Title>
                            <Group spacing={5} mb={3}>
                                <IconMail size={16} color={iconColorMode} />
                                <Text color="dimmed">{data?.email ?? '-'}</Text>
                            </Group>
                            <Group spacing={5} mb={3}>
                                <IconPhone size={16} color={iconColorMode} />
                                <Text color="dimmed">{data?.phone ?? '-'}</Text>
                            </Group>
                            <Group spacing={5} mb={3}>
                                <IconMapPin size={16} color={iconColorMode} />
                                <Text color="dimmed">{data?.location ?? '-'}</Text>
                            </Group>
                        </Box>
                    </Group>
                    <Divider mb={20} variant="dashed" />
                    <Grid gutter="md">
                        <Grid.Col span={4}>
                            <Box sx={{ border: '1px solid', borderStyle: 'dashed', borderColor: `${theme.colors.gray[5]}` }} p="sm">
                                <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                                    Experience
                                </Text>
                                <Title order={6} sx={{ fontWeight: 600 }}>
                                    {data?.experience ?? `-`}
                                </Title>
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Box sx={{ border: '1px solid', borderStyle: 'dashed', borderColor: `${theme.colors.gray[5]}` }} p="sm">
                                <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                                    Current Salary
                                </Text>
                                <Title order={6} sx={{ fontWeight: 600 }}>
                                    {data?.current_salary ?? `-`}
                                </Title>
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Box sx={{ border: '1px solid', borderStyle: 'dashed', borderColor: `${theme.colors.gray[5]}` }} p="sm">
                                <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                                    Expected Salary
                                </Text>
                                <Title order={6} sx={{ fontWeight: 600 }}>
                                    {data?.expected_salary ?? `-`}
                                </Title>
                            </Box>
                        </Grid.Col>
                        <Grid.Col>
                            <Box sx={{ border: '1px solid', borderStyle: 'dashed', borderColor: `${theme.colors.gray[5]}` }} p="sm">
                                <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                                    Appy For
                                </Text>
                                <Title order={6} sx={{ fontWeight: 600 }}>
                                    {`${data?.vacancy?.title ?? `-`} (${data?.vacancy?.designation ?? `-`})`}
                                </Title>
                            </Box>
                        </Grid.Col>
                        <Grid.Col>
                            <Box sx={{ border: '1px solid', borderStyle: 'dashed', borderColor: `${theme.colors.gray[5]}` }} p="sm">
                                <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                                    Notice Period
                                </Text>
                                <Title order={6} sx={{ fontWeight: 600 }}>
                                    {data?.notice_period ?? `-`}
                                </Title>
                            </Box>
                        </Grid.Col>
                        <Grid.Col>
                            <Box sx={{ border: '1px solid', borderStyle: 'dashed', borderColor: `${theme.colors.gray[5]}` }} p="sm">
                                <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                                    Resume/CV
                                </Text>
                                <Text
                                    component="a"
                                    href={data?.cv}
                                    target="_blank"
                                    sx={{
                                        '&:hover': {
                                            color: theme.colors.blue['6'],
                                        },
                                    }}>
                                    <Group spacing={8} align="center">
                                        <ActionIcon component="span" variant="light" radius="xl" color="blue">
                                            <IconFileDescription size={18} stroke={1.75} />
                                        </ActionIcon>
                                        <Text weight={500} size="xs" component="span" sx={{ maxWidth: '80%' }}>
                                            {getFileName(data?.cv)}
                                        </Text>
                                    </Group>
                                </Text>
                            </Box>
                        </Grid.Col>
                    </Grid>
                    <Group position="apart" mb={15}></Group>
                    <Text weight={500} color={theme.colors.gray[6]} size="xs" pb={5}>
                        Cover Letter
                    </Text>
                    <Text>{_.upperFirst(data?.cover_letter) ?? `-`}</Text>
                </>
            )}
        </Modal>
    );
};

export default CandidatesModal;
