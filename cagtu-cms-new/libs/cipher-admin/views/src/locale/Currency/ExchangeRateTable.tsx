import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import {
    CipherUserContext,
    converDateFromIsonString,
    DataTableProps,
    ExchangeRateResult,
    getFormatedTimeAmPm,
    TableColumnsProps,
    useDark,
} from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useContext } from 'react';

dayjs.extend(relativeTime);

interface ExchangeRateTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: ExchangeRateResult) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const ExchangeRateTable = ({
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
}: ExchangeRateTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const theme = useMantineTheme();
    const [dark] = useDark();
    const columns: TableColumnsProps[] = [
        {
            path: 'currency',
            label: 'Currency',
            content: (object: ExchangeRateResult) => <Text component="span">{object?.currency?.name}</Text>,
        },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: ExchangeRateResult) => (
                <>
                    <Text component="span">{converDateFromIsonString(object?.created_at)} -</Text>
                    <Badge
                        name={getFormatedTimeAmPm(object?.created_at)}
                        radius="xl"
                        ml={5}
                        styles={{
                            root: {
                                background: dark ? theme.colors['dark'][3] : theme.colors['gray'][2],
                                color: dark ? theme.colors['gray'][4] : theme.colors['dark'][4],
                            },
                        }}
                    />
                </>
            ),
            style: {
                width: 220,
            },
        },
        {
            path: 'updated_at',
            label: 'Updated On',
            content: (object: ExchangeRateResult) => <Text component="span">{dayjs(object?.updated_at).fromNow()}</Text>,
            style: {
                width: 160,
            },
        },
        {
            path: 'value',
            label: 'Current Value',
            content: (object: ExchangeRateResult) => <Badge name={Number(object?.value) ?? 0} radius="xl" />,
            style: {
                width: 140,
            },
        },
        {
            path: 'configuration',
            label: 'Configuration',
            content: (object: ExchangeRateResult) => (
                <Badge
                    name={object?.enable_currency_configuration ? 'Enabled' : 'Disabled'}
                    color={object?.enable_currency_configuration ? 'indigo' : 'gray'}
                />
            ),
            style: {
                width: 150,
            },
        },
        {
            path: 'is_default',
            label: 'Is Default',
            content: (object: ExchangeRateResult) => <Badge name={object?.is_default ? 'Yes' : 'No'} color={object?.is_default ? 'green' : 'red'} />,
            style: {
                width: 120,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: ExchangeRateResult) => (
                <Badge name={object?.is_active ? 'Active' : 'Inactive'} color={object?.is_active ? 'green' : 'red'} />
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ExchangeRateResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_exchangerate')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_exchangerate')) && (
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
                            isCheckbox={is_superuser || user_permissions?.includes('delete_exchangerate')}
                        />
                    )}
                </>
            )}
            {isSuccess && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default ExchangeRateTable;
