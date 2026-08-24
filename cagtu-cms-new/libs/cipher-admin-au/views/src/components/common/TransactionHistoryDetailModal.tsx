import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { SkeletonKYCDetail } from '@cagtu-cms/ui-shared';
import { useIconColorMode } from '@cagtu-cms/util-formatter';
import { Avatar, Badge, Box, Divider, Grid, Group, Modal, ModalProps, Text, Title } from '@mantine/core';
import { IconMail, IconPhone } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    title: string;
    transactionId: string;
};

const urlsPath = urls?.cipher?.transaction;
const transactionHistoryDetailAPI = new CipherAPI(urlsPath?.path);

const TransactionHistoryDetailModal = (props: Props & Partial<ModalProps>) => {
    const { open, setOpen, title, transactionId, ...restProps } = props;
    const [iconColorMode] = useIconColorMode();
    const { isLoading, data: transactionHistoryDetail } = useQuery(
        ['transaction-history-detail', transactionId],
        () => transactionHistoryDetailAPI.get(transactionId),
        {
            enabled: !!transactionId,
        }
    );

    return (
        <Modal
            {...restProps}
            opened={open}
            onClose={() => {
                setOpen(false);
            }}
            centered
            title={
                title && (
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        {title}
                    </Title>
                )
            }>
            {isLoading ? (
                <SkeletonKYCDetail />
            ) : (
                <>
                    <Box my={20}>
                        <Divider variant="dashed" />
                        <Text weight={500} color="dimmed" my={5}>
                            Sender Information :
                        </Text>
                        <Divider variant="dashed" />
                    </Box>
                    <Group position="apart" align="normal">
                        <Group position="left" spacing={15} align="normal">
                            <Avatar
                                src={`${transactionHistoryDetail?.data?.sender?.profile_image ?? ''}`}
                                alt="user-profile"
                                size={100}
                                radius="md"
                            />
                            <Box>
                                <Title order={6} weight={600}>
                                    {transactionHistoryDetail?.data?.sender?.full_name}
                                </Title>
                                <Text color="dimmed" size={13} weight={400} mb={5}>
                                    @ {transactionHistoryDetail?.data?.sender?.username}
                                </Text>
                                <Group spacing={5} mb={3}>
                                    <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">
                                        {transactionHistoryDetail?.data?.sender?.email ? transactionHistoryDetail?.data?.email : '-'}
                                    </Text>
                                </Group>
                                <Group spacing={5}>
                                    <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                    <Text color="dimmed">
                                        {transactionHistoryDetail?.data?.sender?.phone ? transactionHistoryDetail?.data?.phone : '-'}
                                    </Text>
                                </Group>
                            </Box>
                        </Group>
                    </Group>
                    <Box my={20}>
                        <Divider variant="dashed" />
                        <Text weight={500} color="dimmed" my={5}>
                            Receiver Information :
                        </Text>
                        <Divider variant="dashed" />
                    </Box>
                    <Group position="left" spacing={15} align="normal">
                        <Avatar src={`${transactionHistoryDetail?.data?.receiver?.profile_image ?? ''}`} alt="user-profile" size={100} radius="md" />
                        <Box>
                            <Title order={6} weight={600}>
                                {transactionHistoryDetail?.data?.receiver?.full_name}
                            </Title>
                            <Text color="dimmed" size={13} weight={400} mb={5}>
                                @ {transactionHistoryDetail?.data?.receiver?.username}
                            </Text>
                            <Group spacing={5} mb={3}>
                                <IconMail size={16} stroke={1.75} color={iconColorMode} />
                                <Text color="dimmed">
                                    {transactionHistoryDetail?.data?.receiver?.email ? transactionHistoryDetail?.data?.email : '-'}
                                </Text>
                            </Group>
                            <Group spacing={5}>
                                <IconPhone size={16} stroke={1.75} color={iconColorMode} />
                                <Text color="dimmed">
                                    {transactionHistoryDetail?.data?.receiver?.phone ? transactionHistoryDetail?.data?.phone : '-'}
                                </Text>
                            </Group>
                        </Box>
                    </Group>
                    <Box my={20}>
                        <Divider variant="dashed" />
                        <Text weight={500} color="dimmed" my={5}>
                            Other Information :
                        </Text>
                        <Divider variant="dashed" />
                    </Box>
                    <Grid gutter="md">
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Status
                            </Text>
                            <Box>
                                <Badge
                                    size="lg"
                                    radius="sm"
                                    color={
                                        transactionHistoryDetail?.data?.status.toUpperCase() === 'INITIATED'
                                            ? ''
                                            : transactionHistoryDetail?.data?.status.toUpperCase() === 'PENDING'
                                            ? 'yellow'
                                            : 'green'
                                    }
                                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                                    {transactionHistoryDetail?.data?.status}
                                </Badge>
                            </Box>
                        </Grid.Col>
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Payment Method
                            </Text>
                            <Group position="left" spacing={10}>
                                <Avatar
                                    src={`${transactionHistoryDetail?.data?.payment_method?.logo ?? ''}`}
                                    alt="payment_method-profile"
                                    size={30}
                                    radius={'xl'}
                                />
                                <Text color={'dimmed'}>{transactionHistoryDetail?.data?.payment_method?.name}</Text>
                            </Group>
                        </Grid.Col>
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Transaction Type
                            </Text>
                            <Text color={'dimmed'}>{transactionHistoryDetail?.data?.transaction_type?.split('_').join(' ')}</Text>
                        </Grid.Col>
                        <Grid.Col md={3}>
                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                Amount
                            </Text>
                            <Group spacing={5}>
                                <Text weight={600} fz="xl">
                                    {transactionHistoryDetail?.data?.currency?.symbol ?? '-'}
                                </Text>
                                <Text weight={600} fz="xl">
                                    {_.ceil(Number(transactionHistoryDetail?.data?.amount), 2) ?? '-'}
                                </Text>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </Modal>
    );
};

export default TransactionHistoryDetailModal;
