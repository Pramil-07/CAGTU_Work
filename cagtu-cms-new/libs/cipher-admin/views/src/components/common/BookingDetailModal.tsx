import { converDateFromIsonString, ServiceBookingResult, useIconColorMode } from '@cagtu-cms/util-formatter';
import { Avatar, Box, Divider, Grid, Group, Modal, ModalProps, Text, Title } from '@mantine/core';
import { IconMail, IconPhone } from '@tabler/icons';

interface BookingDetailModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    data: ServiceBookingResult;
}

const BookingDetailModal = ({ onClose, opened, title, data, ...restProps }: BookingDetailModalProps & Partial<ModalProps>) => {
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
            <>
                {title && <Divider mb={20} />}
                <Group position="apart" align="normal" mb={20}>
                    <Group position="left" spacing={15} align="normal">
                        <Avatar src={`${data?.entity_service?.created_by?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                        <Box>
                            <Title order={5} weight={600} mb={5}>
                                {`${data?.entity_service?.created_by?.first_name} ${data?.entity_service?.created_by?.middle_name ?? ''} ${
                                    data?.entity_service?.created_by?.last_name
                                }`}
                                <Text color="dimmed" size={13} weight={400}>
                                    @{data?.entity_service?.created_by?.username}
                                </Text>
                            </Title>
                            <Group spacing={5} mb={3}>
                                <IconMail size={16} stroke={1.72} color={iconColorMode} />
                                <Text color="dimmed">{data?.entity_service?.created_by?.email ? data?.entity_service?.created_by?.email : '-'}</Text>
                            </Group>
                            <Group spacing={5}>
                                <IconPhone size={16} stroke={1.72} color={iconColorMode} />
                                <Text color="dimmed">{data?.entity_service?.created_by?.phone ? data?.entity_service?.created_by?.phone : '-'}</Text>
                            </Group>
                        </Box>
                    </Group>
                    <Box>
                        <Group position="right" mb={4} spacing={5}>
                            <Text size="xs" weight={500}>
                                Created On:
                            </Text>
                            <Text size="xs" color="dimmed">
                                {converDateFromIsonString(data?.created_at)}
                            </Text>
                        </Group>
                        <Group position="right" mb={4} spacing={5}>
                            <Text size="xs" weight={500}>
                                Updated On:{' '}
                            </Text>
                            <Text size="xs" color="dimmed">
                                {/* {dayjs(data?.updated_at).fromNow()} */}
                            </Text>
                        </Group>
                        <Group position="right" spacing={5}>
                            <Text size="xs" weight={500}>
                                Rewards Point:
                            </Text>
                            {/* <Badge size="sm" name={data?.profile?.points ?? '0'} color={data?.profile?.points ? 'green' : 'red'} /> */}
                        </Group>
                    </Box>
                </Group>
                <Title order={6} weight={600} mb={10}>
                    Basic Information
                </Title>
                <Divider mb={20} variant="dashed" />
                <Grid gutter="md" mb={20}>
                    <Grid.Col>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Bio
                        </Text>
                        {/* <Text color="dimmed">{data?.profile?.bio ? _.upperFirst(data?.profile?.bio) : '-'}</Text> */}
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Designation
                        </Text>
                        {/* <Text color="dimmed">{data?.profile?.designation ? data?.profile?.designation : '-'}</Text> */}
                    </Grid.Col>
                </Grid>
            </>
        </Modal>
    );
};

export default BookingDetailModal;
