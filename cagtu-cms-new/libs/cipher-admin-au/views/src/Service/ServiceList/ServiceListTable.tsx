import { Badge, Button, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { CipherUserContext, converDateFromIsonString, DataTableProps, ServicesResult, TableColumnsProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Text, Tooltip, useMantineTheme, UnstyledButton, Select } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconDiscountCheck, IconEdit, IconEye, IconSelector, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ServiceListTableProps extends DataTableProps {
    handleSingleDelete: (id: string) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: ServicesResult) => void;
    checked: string[];
    handleUserVerify: () => void;
    onShowFilterForm: () => void;
    query: string;
    isFetching: boolean;
    onShowFilterFormClose: () => void;
    ordering: string;
    setOrdering: (ordering: string) => void;
}

const ServiceListTable = ({
    query,
    data,
    page,
    checked,
    isLoading,
    isSuccess,
    isFetching,
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
    handleUserVerify,
    limitChange,
    handleLimitChange,
    onShowFilterForm,
    onShowFilterFormClose,
    ordering,
    setOrdering,
}: ServiceListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const theme = useMantineTheme();
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryCategory = state?.queryCategory ?? '';
    const columns: TableColumnsProps[] = [
        {
            path: 'title',
            label: 'Title',
        },
        {
            path: 'category',
            label: 'Category',
            content: (object: ServicesResult) => <Badge name={object?.category?.name} />,
        },
        // {
        //     path: 'created_by',
        //     label: 'Created By',
        //     content: (object: ServicesResult) => (
        //         <Group position="left" spacing={8}>
        //             <Avatar src={`${object?.created_by?.profile_image ?? ''}`} alt="user-profile" size={28} radius={'xl'} />
        //             {object?.created_by?.username === 'admin' ? (
        //                 <Text weight={500} size={13} component="span">
        //                     {_.upperFirst(object?.created_by?.username)}
        //                 </Text>
        //             ) : (
        //                 <Text weight={500} size={13} component="span" sx={{ maxWidth: '80%' }}>{`${object?.created_by?.first_name ?? ''} ${
        //                     object?.created_by?.middle_name ?? ''
        //                 } ${object?.created_by?.last_name ?? ''}`}</Text>
        //             )}
        //         </Group>
        //     ),
        //     style: {
        //         width: 220,
        //     },
        // },
        {
            path: 'created_at',
            label: 'Created On',
            content: (object: ServicesResult) => <span>{converDateFromIsonString(object?.created_at)}</span>,
            style: {
                width: 150,
            },
        },
        {
            path: 'updated_at',
            label: 'Upated On',
            content: (object: ServicesResult) => <span>{dayjs(object?.updated_at).fromNow()}</span>,
            style: {
                width: 150,
            },
        },
        {
            path: 'views_count',
            label: 'Views',
            content: (object: ServicesResult) => (
                <Group spacing={4}>
                    <IconEye size={16} stroke={1.75} color={`${theme.colors['teal'][6]}`} />
                    <Text component="span">{object?.views_count}</Text>
                </Group>
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'is_verified',
            label: 'Is Verified',
            content: (object: ServicesResult) => <Badge name={object?.is_verified ? 'Yes' : 'No'} color={object?.is_verified ? 'green' : 'red'} />,
            style: {
                width: 100,
            },
        },
        {
            path: 'is_active',
            label: 'Is Active',
            content: (object: ServicesResult) => <Badge name={object?.is_active ? 'Yes' : 'No'} color={object?.is_active ? 'green' : 'red'} />,
            style: {
                width: 80,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ServicesResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('change_service')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_service')) && (
                        <Tooltip label="Delete" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleSingleDelete(object.id)}
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
                        <>
                            <Group position="left" spacing={10} align="normal">
                                <TableTopBar
                                    checked={checked}
                                    deleteModal={onClickDeleteAll}
                                    onHandleSearch={onHandleSearch}
                                    query={query}
                                    loading={isFetching}>
                                    <Tooltip
                                        label="Verify"
                                        position="bottom"
                                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                                        <ActionIcon
                                            variant="light"
                                            radius="xl"
                                            size={40}
                                            color="gray"
                                            sx={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={handleUserVerify}>
                                            <IconDiscountCheck size={22} stroke={1.75} />
                                        </ActionIcon>
                                    </Tooltip>
                                </TableTopBar>
                                <Select
                                    name="ordering"
                                    placeholder="Order by"
                                    value={ordering !== '' ? ordering : null}
                                    maw={180}
                                    size="md"
                                    data={[
                                        { value: '', label: 'None' },
                                        { value: 'created_at', label: 'Last to Latest' },
                                        { value: '-created_at', label: 'Latest to Last' },
                                        { value: 'title', label: 'Ascending' },
                                        { value: '-title', label: 'Descending' },
                                    ]}
                                    onChange={(value) => {
                                        setOrdering(value as string);
                                    }}
                                    icon={<IconSelector size={18} stroke={1.75} />}
                                    clearable
                                    style={{ marginBottom: 0 }}
                                />
                                {queryCategory && (
                                    <Button
                                        mt={3}
                                        name={'All Services'}
                                        onClick={() => {
                                            onShowFilterFormClose();
                                            navigate('/services');
                                        }}
                                    />
                                )}
                            </Group>
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
                    isCheckbox={is_superuser || user_permissions?.includes('delete_service')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default ServiceListTable;
