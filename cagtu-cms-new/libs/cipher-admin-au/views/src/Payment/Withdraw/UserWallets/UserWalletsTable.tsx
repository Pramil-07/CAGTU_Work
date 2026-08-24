import { CipherAPI, http, urls } from '@cagtu-cms/data-access';
import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar, Button as CustomButton } from '@cagtu-cms/ui-shared';
import { CipherUserContext, DataTableProps, TableColumnsProps, UserWalletResult } from '@cagtu-cms/util-formatter';
import { ActionIcon, Avatar, Button, FileButton, Group, Stack, Text, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconArrowRight, IconCheck, IconFileImport, IconFileSpreadsheet, IconX } from '@tabler/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';

interface UserWalletsTableProps extends DataTableProps {
    isFetching: boolean;
    onHandleSearch: (query: string) => void;
    handleDetailModalOpen: (value: UserWalletResult) => void;
    query: string;
}

const paymentUrlsPath = urls?.cipher?.payment;

const UserWalletTable = ({
    isLoading,
    isSuccess,
    isFetching,
    onHandleSearch,
    query,
    data,
    total,
    page,
    onSetPage,
    limitChange,
    handleLimitChange,
    handleDetailModalOpen,
}: UserWalletsTableProps) => {
    const queryClient = useQueryClient();
    const { user_permissions, is_superuser } = useContext(CipherUserContext);

    //function to fetch and export excel data from server by defining response type to blob
    const exportWalletHistory = async () => {
        await http
            .get(paymentUrlsPath?.userWalletExport, {
                responseType: 'blob',
            })
            .then((res) => {
                const file = new File([res.data], `wallet_history_${new Date().toLocaleDateString()}.xlsx`);
                const url = window.URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wallet_history_${new Date().toLocaleDateString()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    };

    // User wallet import mutation query
    const userWalletImportAPI = new CipherAPI(paymentUrlsPath?.userWalletImport);
    const userWalletImportMutation = useMutation((data: FormData) => userWalletImportAPI.store(data));
    const onImport = (formData: FormData) => {
        userWalletImportMutation.mutate(formData, {
            onSuccess: () => {
                showNotification({
                    title: `Congrats! your file has been imported`,
                    message: '',
                    color: 'green',
                    icon: <IconCheck size={18} />,
                });
                queryClient.invalidateQueries(['user-wallet-list']);
            },
            onError: (error: any) => {
                const {
                    data: { non_field_error, message },
                } = error.response;
                showNotification({
                    title: 'Uh oh! something went wrong',
                    message: (non_field_error || message) ?? 'Sorry! something went wrong while importing file',
                    color: 'red',
                    icon: <IconX size={18} />,
                });
            },
        });
    };

    const columns: TableColumnsProps[] = [
        {
            path: 'user',
            label: 'User',
            content: (object: UserWalletResult) => (
                <Group position="left" spacing={10}>
                    <Avatar src={`${object?.user.profile_image ?? ''}`} alt="receiver-profile" size={30} radius={'xl'} />
                    <Stack spacing={1}>
                        <Group position="left" spacing={5}>
                            <Text weight={500} component="span">
                                {object?.user.full_name}
                            </Text>
                        </Group>
                    </Stack>
                </Group>
            ),
        },
        {
            path: 'frozen_amount',
            label: 'Frozen Amount',
            content: (object: UserWalletResult) => (
                <Group position="left" spacing={5}>
                    <Text component="span">{object?.currency}</Text>
                    <Text weight={600} component="span">
                        {_.ceil(Number(object?.frozen_amount), 2)}
                    </Text>
                </Group>
            ),
        },
        {
            path: 'available_balance',
            label: 'Available Balance',
            content: (object: UserWalletResult) => (
                <Group position="left" spacing={5}>
                    <Text component="span">{object?.currency}</Text>
                    <Text weight={600} component="span">
                        {_.ceil(Number(object?.available_balance), 2)}
                    </Text>
                </Group>
            ),
        },
        {
            path: 'actions',
            label: '',
            content: (object: UserWalletResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('view_withdraw')) &&
                        object?.available_balance &&
                        Number(object?.available_balance) > 0 && (
                            <Button
                                onClick={() => {
                                    handleDetailModalOpen(object);
                                }}
                                variant="subtle"
                                size="xs"
                                sx={{ fontWeight: 500, fontSize: 12 }}
                                rightIcon={<IconArrowRight size={15} />}>
                                Create Withdraw Request
                            </Button>
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
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position={'apart'} spacing={10} align="normal">
                    {isSuccess && (
                        <Group position="left" spacing={10} align="normal">
                            <TableTopBar onHandleSearch={onHandleSearch} showDelete={false} loading={isFetching} query={query} />
                            {/* <Tooltip label="Import CSV" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                <ActionIcon
                                    variant="light"
                                    radius="xl"
                                    size={40}
                                    color="gray"
                                    onClick={() => {
                                        exportWalletHistory();
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                    }}>
                                    <IconFileImport size={22} stroke={1.75} />
                                </ActionIcon>
                            </Tooltip> */}
                            <Tooltip label="Export CSV" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                <ActionIcon
                                    variant="light"
                                    radius="xl"
                                    size={40}
                                    color="gray"
                                    onClick={() => {
                                        exportWalletHistory();
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                    }}>
                                    <IconFileSpreadsheet size={22} stroke={1.75} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    )}
                    {isSuccess && (
                        <Group>
                            <FileButton
                                onChange={(file) => {
                                    const formdata = new FormData();
                                    formdata.append('file', file as File);
                                    onImport(formdata);
                                }}
                                accept=".xlsx">
                                {(props) => <CustomButton name={'Upload excel file'} loading={userWalletImportMutation.isLoading} {...props} />}
                            </FileButton>
                        </Group>
                    )}
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
                <DataTable
                    data={data}
                    total={total}
                    columns={columns}
                    page={page}
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

export default UserWalletTable;
