import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    KYCResult,
    TableColumnsProps,
    useIconColorMode,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEye, IconMapPin } from '@tabler/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as _ from 'lodash';
import { useContext } from 'react';

dayjs.extend(relativeTime);

interface KYCListTableProps extends DataTableProps {
    onHandleSearch: (query: string) => void;
    handleKYCDetail: (id: number) => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const KYCListTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    onSetPage,
    onHandleSearch,
    handleKYCDetail,
    limitChange,
    handleLimitChange,
    onShowFilterForm,
    isFetching,
    query,
}: KYCListTableProps) => {
    const [iconColorMode] = useIconColorMode();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);

    const columns: TableColumnsProps[] = [
        {
            path: 'full_name',
            label: 'Full Name',
            content: (object: KYCResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.user?.profile_image ?? ''}`} alt="user-profile" radius="xl" size={30} />
                    <Text weight={500} component="span">
                        {_.startCase(object?.full_name)}
                    </Text>
                </Group>
            ),
        },
        {
            path: 'user.username',
            label: 'Username',
            style: {
                width: 140,
            },
        },
        {
            path: 'user.email',
            label: 'Email',
            content: (object: KYCResult) => object?.user.email ?? ' -',
            style: {
                width: 140,
            },
        },
        {
            path: 'user.phone',
            label: 'Phone',
            content: (object: KYCResult) => object?.user.phone ?? ' -',
            style: {
                width: 120,
            },
        },
        {
            path: 'country',
            label: 'Country',
            content: (object: KYCResult) => {
                return (
                    <Group spacing={4}>
                        <IconMapPin size={16} stroke={1.75} color={iconColorMode} />
                        <Text component="span" weight={500} size={13}>
                            {object?.country?.name}
                        </Text>
                    </Group>
                );
            },
            style: {
                width: 180,
            },
        },
        {
            path: 'created_at',
            label: 'Submitted On',
            content: (object: KYCResult) => {
                return converDateFromIsonString(object?.created_at);
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: KYCResult) => {
                return dayjs(object?.updated_at).from(new Date());
            },
            style: {
                width: 130,
            },
        },
        {
            path: 'is_kyc_verified',
            label: 'KYC Verified',
            content: (object: KYCResult) => <Badge name={object?.is_kyc_verified ? 'Yes' : 'No'} color={object?.is_kyc_verified ? 'green' : 'red'} />,
            style: {
                width: 100,
            },
        },
        {
            path: 'is_address_verified',
            label: 'Address Verified',
            content: (object: KYCResult) => (
                <Badge name={object?.is_address_verified ? 'Yes' : 'No'} color={object?.is_address_verified ? 'green' : 'red'} />
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: KYCResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_kyc')) && (
                        <Tooltip label="View detail" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleKYCDetail(Number(object?.id))}
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
                width: 50,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <Group position={'apart'} spacing={10} align="normal">
                        <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
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
                    </Group>
                    {data.length > 0 && (
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
                </>
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default KYCListTable;
