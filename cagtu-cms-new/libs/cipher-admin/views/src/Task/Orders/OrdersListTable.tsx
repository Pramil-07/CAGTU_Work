import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, OrderResult, TableColumnsProps, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { Group, Text, Badge, Box, Accordion, ThemeIcon, Tooltip, ActionIcon, Divider, List, Avatar, Stack } from '@mantine/core';
import { IconEye, IconGift } from '@tabler/icons';
import _ from 'lodash';
import { useContext } from 'react';

interface OrdersListTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    handleDetailModalOpen: (value: OrderResult) => void;
    query: string;
}

const OrdersListTable = ({
    data,
    isLoading,
    isSuccess,
    isFetching,
    query,
    onHandleSearch,
    page,
    total,
    limitChange,
    handleLimitChange,
    handleDetailModalOpen,
    onSetPage,
}: OrdersListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);

    const columns: TableColumnsProps[] = [
        {
            path: 'user',
            label: 'Ordered By',
            content: (object: OrderResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.user.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Box>
                        <Text fw={500}>{object?.user.full_name ?? ''}</Text>
                        <Text color="dimmed">{!_.isEmpty(object?.user.email) ? object?.user.email : '@' + object?.user.username}</Text>
                    </Box>
                </Group>
            ),
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: OrderResult) => <Badge>{object?.status}</Badge>,
            style: {
                width: 150,
            },
        },
        {
            path: 'currency',
            label: 'Currency',
            content: (object: OrderResult) => <Text>{object?.currency}</Text>,
        },
        {
            path: 'grand_total',
            label: 'Total',
            content: (object: OrderResult) => <Text fw={600}>{_.ceil(Number(object?.grand_total), 2)}</Text>,
        },
        {
            path: 'order_items',
            label: 'Order Items',
            content: (object: OrderResult) => {
                return (
                    <Accordion chevronPosition="right" variant="contained">
                        {object?.order_items?.map((val, index) => {
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
                                        <Text fw={500}>Item Details :</Text>
                                        <Divider variant="dotted" mb={'xs'} mt={2} />
                                        <List withPadding mb={'xs'}>
                                            <List.Item>
                                                <Text>Task : {val?.task ?? ''}</Text>
                                            </List.Item>
                                            <List.Item>
                                                <Text>
                                                    Amount : {val.currency ?? ''} {_.ceil(Number(val?.amount), 2) ?? ''}
                                                </Text>
                                            </List.Item>
                                            <List.Item>
                                                <Text>
                                                    Offer Applied : {val.currency ?? ''} {_.ceil(Number(val?.offer_value), 2) ?? ''}
                                                </Text>
                                            </List.Item>
                                        </List>
                                        {val?.offer?.id && (
                                            <>
                                                <Text fw={500}>Offer Used :</Text>
                                                <Divider variant="dotted" mb={'xs'} mt={2} />
                                                <Group>
                                                    <Avatar
                                                        src={`${val?.offer.image ?? ''}`}
                                                        variant="light"
                                                        alt="offer-image"
                                                        radius="sm"
                                                        size={200}
                                                    />
                                                    <Stack spacing={2}>
                                                        <Group>
                                                            <Text>Offer Title :</Text>
                                                            <Badge>{val?.offer.title ?? ''}</Badge>
                                                        </Group>
                                                        <Group>
                                                            <Text>Code :</Text>
                                                            <Badge>{val?.offer.code ?? ''}</Badge>
                                                        </Group>
                                                        <Group>
                                                            <Text>Offer Type :</Text>
                                                            <Badge>{val?.offer.offer_type ?? ''}</Badge>
                                                        </Group>
                                                        <Group>
                                                            <Text>Start Date :</Text>
                                                            <Badge>{converDateFromIsonString(val?.offer.start_date)}</Badge>
                                                        </Group>
                                                        <Group>
                                                            <Text>End Date :</Text>
                                                            <Badge>{converDateFromIsonString(val?.offer.end_date)}</Badge>
                                                        </Group>
                                                        <Group>
                                                            <Text>Description :</Text>
                                                            <Text>{val?.offer.description ?? ''}</Text>
                                                        </Group>
                                                    </Stack>
                                                </Group>
                                            </>
                                        )}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                );
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: OrderResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_order')) && (
                        <Tooltip label="View Detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => {
                                    handleDetailModalOpen(object);
                                }}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEye size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 80,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    {data.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            isLoading={isLoading}
                            isSuccess={isSuccess}
                            total={total}
                            onSetPage={onSetPage}
                            limitChange={limitChange}
                            handleLimitChange={handleLimitChange}
                            isCheckbox={false}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default OrdersListTable;
