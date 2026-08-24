import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { ErrorAlert, StatusBadge } from '@cagtu-cms/ui-shared';
import { converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { Alert, Avatar, Badge, Box, Divider, Grid, Group, List, Loader, RingProgress, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Fragment } from 'react';

type Props = {
    id: string;
};

const urlsPath = urls?.cipher?.task?.bookingDetail;

const BookingDetail = ({ id }: Props) => {
    const bookingDetailAPI = new CipherAPI(urlsPath);
    const { isLoading, isError, data } = useQuery(['booking-detail', id], () => bookingDetailAPI.get(id));

    if (isLoading) {
        return (
            <Stack p={20} justify="center" align="center">
                <Loader variant="bars" />
            </Stack>
        );
    }
    if (isError) {
        return <ErrorAlert />;
    }
    return (
        <Grid align="start">
            <Grid.Col md={12}>
                <Group position="apart" spacing={10}>
                    <Stack spacing={0}>
                        <Group spacing={5}>
                            <Text size="lg">{data?.data?.entity_service?.title ?? ''}</Text>
                            <StatusBadge name={_.toLower(data?.data?.status) ?? ''} />
                        </Group>
                        <Group spacing={5}>
                            <Text size="lg" fw={600} mb={5}>
                                Price :
                            </Text>
                            <Text size="lg" fw={600} mb={5}>
                                {data?.data?.price
                                    ? `${data?.data?.entity_service?.currency?.symbol ?? ''} ${_.ceil(Number(data?.data?.price), 2)}`
                                    : ''}
                            </Text>
                        </Group>
                        <Group spacing={5}>
                            <Text size="lg" fw={600} mb={5}>
                                Earning :
                            </Text>
                            <Text size="lg" fw={600} mb={5}>
                                {data?.data?.earning
                                    ? `${data?.data?.entity_service?.currency?.symbol ?? ''} ${_.ceil(Number(data?.data?.earning), 2)}`
                                    : ''}
                            </Text>
                        </Group>
                    </Stack>
                    <RingProgress
                        sections={[{ value: data?.data?.progress_percentage ?? 0, color: 'blue' }]}
                        label={
                            <Text color="blue" weight={700} align="center" size="xl">
                                {data?.data?.progress_percentage ?? 0}%
                            </Text>
                        }
                    />
                </Group>
            </Grid.Col>
            <Grid.Col md={12}>
                <Divider variant="dashed" />
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    1. Booking Created BY
                </Text>
                <Box>
                    <Group position="left" spacing={10}>
                        <Avatar src={`${data?.data?.created_by?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                        <Box>
                            <Text fw={500}>{data?.data?.created_by?.user?.full_name ?? ''}</Text>
                            <Text color="dimmed">
                                {!_.isEmpty(data?.data?.created_by?.user?.email)
                                    ? data?.data?.created_by?.user?.email
                                    : '@' + data?.data?.created_by?.user?.username}
                            </Text>
                        </Box>
                    </Group>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    2. Booking Created On
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        {!_.isNull(data?.data?.created_at) ? converDateFromIsonString(new Date(String(data?.data?.created_at))) : '-'}
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    3. Booking Ended On
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        <Text component="span" color="dimmed">
                            {!_.isNull(data?.data?.end_date) ? converDateFromIsonString(new Date(String(data?.data?.end_date))) : '-'}
                        </Text>
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={12}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    4. Description
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        <Text component="span" color="dimmed">
                            {data?.data?.description ?? '-'}
                        </Text>
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={12}>
                <Divider variant="dashed" />
            </Grid.Col>
            <Grid.Col md={12}>
                <Text>Booked Service Detail :</Text>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    1. Service Name
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        <Text component="span" color="dimmed">
                            {data?.data?.entity_service?.title}
                        </Text>
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    2. Budget
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        <Text component="span" color="dimmed">
                            {data?.data?.entity_service?.is_range
                                ? `${data?.data?.entity_service?.currency?.symbol ?? ''} ${
                                      data?.data?.entity_service?.budget_from ? _.ceil(Number(data?.data?.entity_service?.budget_from), 2) : '-'
                                  } - ${data?.data?.entity_service?.currency?.symbol ?? ''} ${
                                      data?.data?.entity_service?.budget_to ? _.ceil(Number(data?.data?.entity_service?.budget_to), 2) : '-'
                                  }`
                                : `${data?.data?.entity_service?.currency?.symbol ?? ''} ${
                                      data?.data?.entity_service?.budget_from ? _.ceil(Number(data?.data?.entity_service?.budget_from), 2) : '-'
                                  }`}
                        </Text>
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    3. Payable
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        <Text component="span" color="dimmed">
                            {data?.data?.entity_service?.is_range
                                ? `${data?.data?.entity_service?.currency?.symbol ?? ''} ${
                                      data?.data?.entity_service?.payable_from ? _.ceil(Number(data?.data?.entity_service?.payable_from), 2) : '-'
                                  } - ${data?.data?.entity_service?.currency?.symbol ?? ''} ${
                                      data?.data?.entity_service?.payable_to ? _.ceil(Number(data?.data?.entity_service?.payable_to), 2) : '-'
                                  }`
                                : `${data?.data?.entity_service?.currency?.symbol ?? ''} ${
                                      data?.data?.entity_service?.payable_from ? _.ceil(Number(data?.data?.entity_service?.payable_from), 2) : '-'
                                  }`}
                        </Text>
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    4. Budget Type
                </Text>
                <Box>
                    {data?.data?.entity_service?.budget_type ? (
                        <StatusBadge name={String(_.toLower(data?.data?.entity_service?.budget_type)) ?? ''} />
                    ) : (
                        '-'
                    )}
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    5. Service Created BY
                </Text>
                <Box>
                    <Group position="left" spacing={10}>
                        <Avatar src={`${data?.data?.entity_service?.created_by?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                        <Box>
                            <Text fw={500}>{data?.data?.entity_service?.created_by?.full_name ?? ''}</Text>
                            <Text color="dimmed">
                                {!_.isEmpty(data?.data?.entity_service?.created_by?.email)
                                    ? data?.data?.entity_service?.created_by?.email
                                    : '@' + data?.data?.entity_service?.created_by?.username}
                            </Text>
                        </Box>
                    </Group>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    6. Service Created On
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        {!_.isNull(data?.data?.entity_service?.created_at)
                            ? converDateFromIsonString(new Date(String(data?.data?.entity_service?.created_at)))
                            : '-'}
                    </Text>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    7. Is Active?
                </Text>
                <Box>
                    <Badge color={data?.data?.entity_service?.is_active ? '' : 'red'}>{data?.data?.entity_service?.is_active ? 'Yes' : 'No'}</Badge>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    8. Is Negotiable?
                </Text>
                <Box>
                    <Badge color={data?.data?.entity_service?.is_negotiable ? '' : 'red'}>
                        {data?.data?.entity_service?.is_negotiable ? 'Yes' : 'No'}
                    </Badge>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    9. Is Endorsed?
                </Text>
                <Box>
                    <Badge color={data?.data?.entity_service?.is_endorsed ? '' : 'red'}>
                        {data?.data?.entity_service?.is_endorsed ? 'Yes' : 'No'}
                    </Badge>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    10. Need Approval?
                </Text>
                <Box>
                    <Badge color={data?.data?.entity_service?.needs_approval ? '' : 'red'}>
                        {data?.data?.entity_service?.needs_approval ? 'Yes' : 'No'}
                    </Badge>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    11. Is Professional?
                </Text>
                <Box>
                    <Badge color={data?.data?.entity_service?.is_professional ? '' : 'red'}>
                        {data?.data?.entity_service?.is_professional ? 'Yes' : 'No'}
                    </Badge>
                </Box>
            </Grid.Col>
            <Grid.Col md={3}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    12. Is Requested?
                </Text>
                <Box>
                    <Badge color={data?.data?.entity_service?.is_requested ? '' : 'red'}>
                        {data?.data?.entity_service?.is_requested ? 'Yes' : 'No'}
                    </Badge>
                </Box>
            </Grid.Col>
            <Grid.Col md={12}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    13. Highlights
                </Text>
                <Box sx={{ display: 'flex' }}>
                    {data?.data?.entity_service?.highlights?.length > 0 ? (
                        <List withPadding>
                            {data?.data?.entity_service?.highlights?.map((highlightVal: string, index: number) => (
                                <List.Item key={index}>{highlightVal}</List.Item>
                            ))}
                        </List>
                    ) : (
                        <Alert color="red" icon={<IconAlertCircle />}>
                            No Highlights available
                        </Alert>
                    )}
                </Box>
            </Grid.Col>
            <Grid.Col md={12}>
                <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                    14. Description
                </Text>
                <Box>
                    <Text component="span" color="dimmed">
                        <Text component="span" color="dimmed">
                            {data?.data?.entity_service?.description ?? '-'}
                        </Text>
                    </Text>
                </Box>
            </Grid.Col>
            {data?.data?.entity_service?.images?.length > 0 && (
                <Grid.Col md={12}>
                    <Text weight={500} sx={{ display: 'inline-block' }} mb={10}>
                        15. Images
                    </Text>
                    <Box>
                        <Grid align="start" gutter={2}>
                            {data?.data?.entity_service?.images?.map((val: { media: string }, index: number) => (
                                <Grid.Col md={3} key={index}>
                                    <Avatar
                                        src={val.media}
                                        alt=""
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                        }}
                                    />
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Box>
                </Grid.Col>
            )}
        </Grid>
    );
};

export default BookingDetail;
