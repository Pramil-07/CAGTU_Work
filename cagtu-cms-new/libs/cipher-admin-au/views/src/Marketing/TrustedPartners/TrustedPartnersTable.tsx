import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    TableColumnsProps,
    TrustedPartnersFormValuesProps,
    TrustedPartnersResult,
    useDark,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Box, Group, Image, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import { useContext } from 'react';

interface TrustedPartnersTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: TrustedPartnersFormValuesProps) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const TrustedPartnersTable = ({
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    total,
    isDeleteModalOpened,
    isMultiDeleteModalOpened,
    isSingleDeleteMutationLoading,
    isMultiDeleteMutationLoading,
    isAllCheckboxSelected,
    isCheckboxSelect,
    handleSelect,
    handleSingleDelete,
    onSelectAll,
    onSetPage,
    onClickDeleteAll,
    onConfirmSingleDelete,
    onConfirmMultiDelete,
    handleSingleDeleteCloseModal,
    handleMultiDeleteCloseModal,
    onHandleSearch,
    handleFormModalEdit,
    limitChange,
    handleLimitChange,
    isFetching,
    query,
}: TrustedPartnersTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const theme = useMantineTheme();
    const [dark] = useDark();

    const columns: TableColumnsProps[] = [
        {
            path: 'logo',
            label: 'Partner',
            content: (object: TrustedPartnersResult) => (
                <Group spacing="sm">
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            background: dark ? theme.colors['dark'][4] : theme.colors['gray'][1],
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        p={5}>
                        <Image src={`${object?.logo}`} fit="contain" alt="" withPlaceholder />
                    </Box>
                    <Text component="span" weight={500}>
                        {object?.alt_text}
                    </Text>
                </Group>
            ),
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: TrustedPartnersResult) => <span>{converDateFromIsonString(object?.created_at)}</span>,
            style: {
                width: 160,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: TrustedPartnersResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: TrustedPartnersFormValuesProps) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_trustedpartner')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_trustedpartner')) && (
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
                width: 90,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess && (
                <>
                    <TableTopBar
                        checked={checked}
                        deleteModal={onClickDeleteAll}
                        onHandleSearch={onHandleSearch}
                        loading={isFetching}
                        query={query}
                    />
                    {data?.length > 0 && (
                        <DataTable
                            data={data}
                            columns={columns}
                            page={page}
                            total={total}
                            isDeleteModalOpened={isDeleteModalOpened}
                            isMultiDeleteModalOpened={isMultiDeleteModalOpened}
                            isSingleDeleteMutationLoading={isSingleDeleteMutationLoading}
                            isMultiDeleteMutationLoading={isMultiDeleteMutationLoading}
                            isAllCheckboxSelected={isAllCheckboxSelected}
                            isCheckboxSelect={isCheckboxSelect}
                            handleSelect={handleSelect}
                            onSelectAll={onSelectAll}
                            onSetPage={onSetPage}
                            onClickDeleteAll={onClickDeleteAll}
                            onConfirmSingleDelete={onConfirmSingleDelete}
                            onConfirmMultiDelete={onConfirmMultiDelete}
                            handleSingleDeleteCloseModal={handleSingleDeleteCloseModal}
                            handleMultiDeleteCloseModal={handleMultiDeleteCloseModal}
                            limitChange={limitChange}
                            handleLimitChange={handleLimitChange}
                            isCheckbox={is_superuser || user_permissions?.includes('delete_trustedpartner')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default TrustedPartnersTable;
