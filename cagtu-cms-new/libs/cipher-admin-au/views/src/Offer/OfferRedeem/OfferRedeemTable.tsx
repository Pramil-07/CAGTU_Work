import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, TableColumnsProps, OfferRedeemResult, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Box, Group, HoverCard, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal } from '@tabler/icons';
import * as _ from 'lodash';

interface OfferRedeemTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    onShowFilterForm: () => void;
    isfetching: boolean;
    query: string;
}

const OfferRedeemTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    limitChange,
    handleLimitChange,
    onShowFilterForm,
    isfetching,
    query,
}: OfferRedeemTableProps) => {
    const columns: TableColumnsProps[] = [
        {
            path: 'redeem_by',
            label: 'Redeem By',
            content: (object: OfferRedeemResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.redeem_by?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Text weight={500} component="span" sx={{ maxWidth: '80%' }}>
                        {object?.redeem_by?.full_name}
                    </Text>
                </Group>
            ),
            style: {
                width: 500,
            },
        },
        {
            path: 'redeem_date',
            label: 'Redeem on',
            content: (object: OfferRedeemResult) => (_.isNull(object?.redeem_date) ? '-' : converDateFromIsonString(object?.redeem_date)),
            style: {
                width: 140,
            },
        },
        {
            path: 'redeemed',
            label: 'Redeemed Offer',
            content: (object: OfferRedeemResult) => (
                <HoverCard width={300} shadow="md" withArrow openDelay={100} withinPortal>
                    <Group spacing={5}>
                        <HoverCard.Target>
                            <Avatar src={object?.offer?.image} alt="" sx={{ height: 50, width: 50 }} />
                        </HoverCard.Target>
                        {object?.offer?.title ? <Badge name={object?.offer?.title} color="gray" /> : null}
                        {object?.booking?.entity_service?.title ? <Badge name={object?.booking?.entity_service?.title} color="gray" /> : null}
                    </Group>
                    <HoverCard.Dropdown>
                        <Stack>
                            {<Avatar src={object?.offer?.image} alt="" sx={{ height: 200, width: '100%' }} />}
                            {object?.offer?.title ? <Text>{object?.offer?.title}</Text> : ''}
                            {object?.booking?.entity_service?.title ? <Text>{object?.booking?.entity_service?.title}</Text> : ''}
                        </Stack>
                    </HoverCard.Dropdown>
                </HoverCard>
            ),
            style: {
                width: 500,
            },
        },
        {
            path: 'start_date',
            label: 'Offer Started On',
            content: (object: OfferRedeemResult) => (
                <Text component="span" sx={{ maxWidth: '80%' }}>
                    {object?.offer?.start_date ? converDateFromIsonString(object?.offer?.start_date) : '-'}
                </Text>
            ),
            style: {
                width: 300,
            },
        },
        {
            path: 'end_date',
            label: 'Offer Ends On',
            content: (object: OfferRedeemResult) => (
                <Text component="span" sx={{ maxWidth: '80%' }}>
                    {object?.offer?.end_date ? converDateFromIsonString(object?.offer?.end_date) : '-'}
                </Text>
            ),
            style: {
                width: 300,
            },
        },
        {
            path: 'offer_type',
            label: 'Offer Type',
            content: (object: OfferRedeemResult) => (
                <Text component="span" sx={{ maxWidth: '80%' }}>
                    {object?.offer?.offer_type?.replace('_', ' ') ?? '-'}
                </Text>
            ),
            style: {
                width: 300,
            },
        },
        {
            path: 'redeem_points',
            label: 'Offer Redeem Points',
            content: (object: OfferRedeemResult) => (
                <Text component="span" sx={{ maxWidth: '80%' }}>
                    {object?.offer?.redeem_points ?? '-'}
                </Text>
            ),
            style: {
                width: 300,
            },
        },
        {
            path: 'is_redeemed',
            label: 'Is Redeemed',
            content: (object: OfferRedeemResult) => <Badge name={object?.is_redeemed ? 'Yes' : 'No'} color={object?.is_redeemed ? 'green' : 'red'} />,
            style: {
                width: 140,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: OfferRedeemResult) => <Badge name={object?.is_active ? 'Yes' : 'No'} color={object?.is_active ? 'green' : 'red'} />,
            style: {
                width: 100,
            },
        },
    ];
    return (
        <>
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={'apart'} spacing={10} align="normal">
                    {isSuccess && (
                        <>
                            <TableTopBar onHandleSearch={onHandleSearch} loading={isfetching} query={query} />
                            <UnstyledButton component="div" onClick={onShowFilterForm}>
                                <Group position="right" spacing={10}>
                                    <Text weight={500} component="span">
                                        Filter
                                    </Text>
                                    <ActionIcon
                                        variant="light"
                                        radius="xl"
                                        size={40}
                                        color="blue"
                                        sx={{
                                            cursor: 'pointer',
                                        }}>
                                        <IconAdjustmentsHorizontal size={22} stroke={1.75} />
                                    </ActionIcon>
                                </Group>
                            </UnstyledButton>
                        </>
                    )}
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    columns={columns}
                    page={page}
                    total={total}
                    onSetPage={onSetPage}
                    isCheckbox={false}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default OfferRedeemTable;
