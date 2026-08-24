import { ErrorAlert, PageHeader, PaperBox } from '@cagtu-cms/ui-shared';
import OrdersListTable from './OrdersListTable';
import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { CipherUserContext, OrderResult, converDateFromIsonString, getPageLimit, useDataLimit } from '@cagtu-cms/util-formatter';
import BlockedPageMessage from '../../components/common/BlockedPageMessage';
import { Accordion, Avatar, Badge, Box, Divider, Grid, Group, Modal, Text, ThemeIcon, Title } from '@mantine/core';
import { IconGift } from '@tabler/icons';
import _ from 'lodash';
import { useLocation } from 'react-router-dom';

const urlsPath = urls?.cipher?.payment;

const OrdersList = () => {
    const { state } = useLocation();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<string>(state?.orderId ?? '');
    const [page, setPage] = useState(1);
    const { limitChange, handleLimitChange } = useDataLimit(getPageLimit() ?? '10');
    const [detailModal, setDetailModal] = useState<boolean>(false);
    const [orderDetail, setOrderDetail] = useState<OrderResult | null>();

    //orders list api and query
    const orderListApi = new CipherAPI(urlsPath?.order);
    const { isLoading, isError, isSuccess, data, isFetching } = useQuery(['orders', page, limitChange], () =>
        orderListApi.list({ search: query, page, page_size: limitChange })
    );

    //search function
    const onHandleSearch = (query: string) => {
        queryClient.prefetchQuery(['orders', page, limitChange], () => orderListApi.list({ search: query, page_size: limitChange }));
        setQuery(query);
        setPage(1);
    };

    //Order detail handle function
    const handleDetailModalOpen = (value: OrderResult) => {
        setOrderDetail(value);
        setDetailModal(true);
    };

    if (isError) {
        return <ErrorAlert />;
    }

    if (!is_superuser && !user_permissions?.includes('view_order')) {
        return <BlockedPageMessage />;
    }

    return (
        <>
            <PageHeader pageTitle="Orders" />
            <PaperBox>
                <OrdersListTable
                    isFetching={isFetching}
                    data={data?.data?.result}
                    query={query}
                    total={data?.data?.total_pages}
                    isLoading={isLoading}
                    limitChange={limitChange}
                    onHandleSearch={onHandleSearch}
                    handleLimitChange={handleLimitChange}
                    isSuccess={isSuccess}
                    page={page}
                    onSetPage={setPage}
                    handleDetailModalOpen={handleDetailModalOpen}
                />
            </PaperBox>
            <Modal
                size={'60%'}
                opened={detailModal}
                onClose={() => {
                    setOrderDetail(null);
                    setDetailModal(false);
                }}
                centered
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
                title={
                    <Title order={5} sx={{ fontWeight: 600 }}>
                        Order Detail
                    </Title>
                }>
                <Grid align="center">
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Ordered BY
                        </Text>
                        <Box>
                            <Group position="left" spacing={10}>
                                <Avatar src={`${orderDetail?.user.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                                <Box>
                                    <Text fw={500}>{orderDetail?.user.full_name ?? ''}</Text>
                                    <Text color="dimmed">
                                        {!_.isEmpty(orderDetail?.user.email) ? orderDetail?.user.email : '@' + orderDetail?.user.username}
                                    </Text>
                                </Box>
                            </Group>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Status
                        </Text>
                        <Box>
                            <Badge>{orderDetail?.status}</Badge>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Currency
                        </Text>
                        <Box>
                            <Text>{orderDetail?.currency}</Text>
                        </Box>
                    </Grid.Col>
                    <Grid.Col md={3}>
                        <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                            Total
                        </Text>
                        <Box>
                            <Text size={20} fw={600}>
                                {_.ceil(Number(orderDetail?.grand_total), 2)}
                            </Text>
                        </Box>
                    </Grid.Col>
                </Grid>
                <Text mt={20} fw={500} size={15}>
                    Order Items or Products
                </Text>
                <Divider my={10} variant="dotted" />
                <Accordion chevronPosition="right" variant="contained">
                    {orderDetail?.order_items?.map((val, index) => {
                        return (
                            <Accordion.Item value={val.id} key={val.id}>
                                <Accordion.Control>
                                    <Group position="apart">
                                        <Group noWrap spacing={10}>
                                            <ThemeIcon variant="light" radius="lg">
                                                {index + 1}
                                            </ThemeIcon>
                                            <Box>
                                                <Text fw={500}>{val?.task ?? ''}</Text>
                                                {val?.offer?.id ? (
                                                    <Group spacing={5} align="center">
                                                        <IconGift size={20} />
                                                        <Text color="dimmed">Offer has been used</Text>
                                                    </Group>
                                                ) : (
                                                    ''
                                                )}
                                            </Box>
                                        </Group>
                                        <Badge size="sm" variant="outline">
                                            {val?.currency} {_.ceil(Number(val?.amount), 2)}
                                        </Badge>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Divider variant="dotted" mb={'md'} />
                                    <Grid gutter="md">
                                        <Grid.Col md={12}>
                                            <Text size={15} fw={500}>
                                                Item Details :
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col md={4}>
                                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                Task
                                            </Text>
                                            <Box>
                                                <Text>{val?.task ?? ''}</Text>
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col md={4}>
                                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                Amount
                                            </Text>
                                            <Box>
                                                <Badge>
                                                    {val.currency ?? ''} {_.ceil(Number(val?.amount), 2) ?? ''}
                                                </Badge>
                                            </Box>
                                        </Grid.Col>
                                        <Grid.Col md={4}>
                                            <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                Offer Value
                                            </Text>
                                            <Box>
                                                <Badge>
                                                    {val.currency ?? ''} {_.ceil(Number(val?.offer_value), 2) ?? ''}
                                                </Badge>
                                            </Box>
                                        </Grid.Col>
                                        {val?.offer?.id && (
                                            <>
                                                <Grid.Col md={12}>
                                                    <Divider variant="dotted" my={10} />
                                                    <Text size={15} fw={500}>
                                                        Offer Used :
                                                    </Text>
                                                </Grid.Col>
                                                <Grid.Col md={12}>
                                                    <Avatar
                                                        src={`${val?.offer.image ?? ''}`}
                                                        variant="light"
                                                        alt="offer-image"
                                                        radius="sm"
                                                        size={200}
                                                    />
                                                </Grid.Col>
                                                <Grid.Col md={4}>
                                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                        Offer Title
                                                    </Text>
                                                    <Box>
                                                        <Text>{val?.offer?.title ?? ''}</Text>
                                                    </Box>
                                                </Grid.Col>
                                                <Grid.Col md={4}>
                                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                        Code
                                                    </Text>
                                                    <Box>
                                                        <Text>{val?.offer?.code ?? ''}</Text>
                                                    </Box>
                                                </Grid.Col>
                                                <Grid.Col md={4}>
                                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                        Offer Type
                                                    </Text>
                                                    <Box>
                                                        <Text>{val?.offer?.offer_type ?? ''}</Text>
                                                    </Box>
                                                </Grid.Col>
                                                <Grid.Col md={4}>
                                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                        Start Date
                                                    </Text>
                                                    <Box>
                                                        <Text>{converDateFromIsonString(val?.offer?.start_date) ?? ''}</Text>
                                                    </Box>
                                                </Grid.Col>
                                                <Grid.Col md={4}>
                                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                        End Date
                                                    </Text>
                                                    <Box>
                                                        <Text>{converDateFromIsonString(val?.offer?.end_date) ?? ''}</Text>
                                                    </Box>
                                                </Grid.Col>
                                                <Grid.Col md={4}>
                                                    <Text weight={500} sx={{ display: 'inline-block' }} mb={3}>
                                                        Description
                                                    </Text>
                                                    <Box>
                                                        <Text>{val?.offer?.description ?? ''}</Text>
                                                    </Box>
                                                </Grid.Col>
                                            </>
                                        )}
                                    </Grid>
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            </Modal>
        </>
    );
};

export default OrdersList;
