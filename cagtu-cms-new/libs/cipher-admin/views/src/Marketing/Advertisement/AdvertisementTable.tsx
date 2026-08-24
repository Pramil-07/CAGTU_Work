import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    AdvertisementResult,
    CipherUserContext,
    DataTableProps,
    TableColumnsProps,
    getBehaviour,
    getPriority,
    getShape,
    getSource,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Anchor, Avatar, Group, HoverCard, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconEdit, IconEye, IconTrash } from '@tabler/icons';
import { useContext } from 'react';
interface AdvertisementTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: AdvertisementResult) => void;
    handleDetailModalOpen: (value: AdvertisementResult) => void;
    onShowFilterForm: () => void;
    isFetching: boolean;
    query: string;
}

const AdvertisementTable = ({
    data,
    page,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isSingleDeleteMutationLoading,
    handleSingleDelete,
    onSetPage,
    onConfirmSingleDelete,
    handleSingleDeleteCloseModal,
    onHandleSearch,
    handleFormModalEdit,
    handleDetailModalOpen,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
    onShowFilterForm,
}: AdvertisementTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);

    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Title',
            content: (object: AdvertisementResult) => <Text weight={500}>{object?.title}</Text>,
        },
        {
            path: 'description',
            label: 'Description',
            content: (object: AdvertisementResult) => <Text>{object?.content}</Text>,
        },
        {
            path: 'image',
            label: 'Image',
            content: (object: AdvertisementResult) => (
                <HoverCard width={300} shadow="md" withArrow openDelay={100} withinPortal>
                    <Group spacing={5}>
                        <HoverCard.Target>
                            <Avatar src={object?.image as unknown as string} alt="" sx={{ height: 50, width: 50 }} />
                        </HoverCard.Target>
                    </Group>
                    <HoverCard.Dropdown>
                        <Stack>{<Avatar src={object?.image as unknown as string} alt="" sx={{ height: 'auto', width: '100%' }} />}</Stack>
                    </HoverCard.Dropdown>
                </HoverCard>
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'web_shape',
            label: 'Web Shape',
            content: (object: AdvertisementResult) => <Text>{getShape(object?.web_shape)}</Text>,
            style: {
                width: 120,
            },
        },
        {
            path: 'mobile_shape',
            label: 'Mobile Shape',
            content: (object: AdvertisementResult) => <Text>{getShape(object?.mobile_shape)}</Text>,
            style: {
                width: 110,
            },
        },
        {
            path: 'priority',
            label: 'Display Priority',
            content: (object: AdvertisementResult) => <Text>{getPriority(String(object?.priority))}</Text>,
            style: {
                width: 120,
            },
        },
        {
            path: 'behaviour',
            label: 'Behaviour',
            content: (object: AdvertisementResult) => <Text>{getBehaviour(object?.behaviour)}</Text>,
        },
        {
            path: 'source',
            label: 'Source',
            content: (object: AdvertisementResult) => <Text>{getSource(String(object?.source))}</Text>,
        },
        {
            path: 'type',
            label: 'Type',
            content: (object: AdvertisementResult) => <Text>{object?.type ?? ''}</Text>,
        },
        {
            path: 'page_url',
            label: 'Page URL',
            content: (object: AdvertisementResult) => <Text>{object.page_url}</Text>,
            style: {
                width: 100,
            },
        },
        {
            path: 'redirect_url',
            label: 'Redirect URL',
            content: (object: AdvertisementResult) => (
                <Anchor href={object.redirect_url} target="_blank">
                    {object.redirect_url}
                </Anchor>
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: AdvertisementResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_advertisement')) && (
                        <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleFormModalEdit(object)}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconEdit size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('view_advertisement')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_advertisement')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(Number(object.id))}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconTrash size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
            style: {
                width: 150,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <Group position={'apart'} spacing={10} align="normal">
                    <TableTopBar onHandleSearch={onHandleSearch} loading={isFetching} query={query} />
                    <Group position="right" align="normal">
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
                                    <IconAdjustmentsHorizontal size={24} stroke={1.75} />
                                </ActionIcon>
                            </Group>
                        </UnstyledButton>
                    </Group>
                </Group>
            )}
            {data?.length > 0 && (
                <DataTable
                    data={data}
                    columns={columns}
                    page={page}
                    total={total}
                    isDeleteModalOpened={isDeleteModalOpened}
                    isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                    onSetPage={onSetPage}
                    onConfirmSingleDelete={onConfirmSingleDelete}
                    handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                    limitChange={limitChange}
                    handleLimitChange={handleLimitChange}
                    isCheckbox={false}
                />
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default AdvertisementTable;
