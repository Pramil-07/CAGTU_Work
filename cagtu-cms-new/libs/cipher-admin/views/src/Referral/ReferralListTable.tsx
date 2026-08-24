import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, ReferralSchema, converDateFromIsonString } from '@cagtu-cms/util-formatter';
import { Avatar, Badge, Group, Stack, Text, } from '@mantine/core';
import _ from 'lodash';


interface ReferralListTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    isFetching: boolean;
    query: string;
}

const ReferralListTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: ReferralListTableProps) => {
    const columns = [
        {
            path: 'referred_by',
            label: 'Referred By',
            // style: {
            //     width: 250,
            // },
            content: (object: ReferralSchema) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.referred_by?.profile_image ?? ''}`} alt="receiver-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.referred_by?.full_name ?? ''}
                            </Text>
                        </Group>
                        <Group position="left" spacing={5}>
                            <Text color="dimmed" size={'xs'}>
                                {`@${object?.referred_by.username}`}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'referred_to',
            label: 'Referred To',
            // style: {
            //     width: 250,
            // },
            content: (object: ReferralSchema) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.referred_to?.profile_image ?? ''}`} alt="receiver-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.referred_to?.full_name ?? ''}
                            </Text>
                        </Group>
                        <Group position="left" spacing={5}>
                            <Text color="dimmed" size={'xs'}>
                                {`@${object?.referred_to.username}`}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'referred_by_user_reward',
            label: 'Referred by reward',
            content: (object: ReferralSchema) => <Text component="span">{object?.referred_by_user_reward ?? ''}</Text>,
        },
        {
            path: 'referred_to_user_discount',
            label: 'Referred to discount',
            content: (object: ReferralSchema) => (
                <Text component="span">{object?.referred_to_user_discount ? _.ceil(Number(object?.referred_to_user_discount), 2) : ''}</Text>
            ),
        },
        {
            path: 'referred_date',
            label: 'Referred At',
            content: (object: ReferralSchema) => <Text component="span">{converDateFromIsonString(object?.referred_date)}</Text>,
        },
        {
            path: 'refer_status',
            label: 'Status',
            content: (object: ReferralSchema) => (
                <Badge
                    size="lg"
                    color={`${object?.refer_status ? 'green' : 'red'}`}
                    radius="xs"
                    sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                    {object?.refer_status}
                </Badge>
            ),
            style: {
                width: 100,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    {data?.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
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

export default ReferralListTable;
