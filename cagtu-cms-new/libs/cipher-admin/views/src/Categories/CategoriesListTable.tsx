import { NoDataMessage, SkeletonTableList, TableTopBar, TreeDataTable } from '@cagtu-cms/ui-shared';
import { useThemeIconStyles } from '@cagtu-cms/ui-styles';
import { CipherCategoryResult, CipherUserContext, TableColumnsProps, TreeDataTableProps } from '@cagtu-cms/util-formatter';
import { ActionIcon, Badge, Group, ThemeIcon, Tooltip, Avatar, Text, Select } from '@mantine/core';
import { IconBan, IconEdit, IconPlus, IconSelector, IconTrash } from '@tabler/icons';
import * as _ from 'lodash';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface CategoriesListTableProps extends TreeDataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    handleFormModalEdit: (object: CipherCategoryResult) => void;
    checked: string[];
    handleCategoryCreate: (id: number) => void;
    ordering: string;
    setOrdering: (ordering: string) => void;
    isFetching: boolean;
    query: string;
}

const CategoriesListTable = ({
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
    handleCategoryCreate,
    limitChange,
    handleLimitChange,
    isInterminate,
    ordering,
    setOrdering,
    isFetching,
    query,
}: CategoriesListTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { classes } = useThemeIconStyles();
    const navigate = useNavigate();

    //filters category to send as a state for service query
    const filterCategories = (value: CipherCategoryResult) => {
        if (value?.level === 0) {
            return data?.filter((f1Val) => f1Val?.id === value?.id);
        }
        if (value?.level === 1) {
            return data?.filter((f1Val) =>
                f1Val?.child?.filter((f2Val: CipherCategoryResult) => f2Val.id === value?.id)?.length > 0 ? true : false
            );
        }
        if (value?.level === 2) {
            return data?.filter((f1Val) =>
                f1Val?.child?.filter((f2Val: { id: number; child: [] }) =>
                    f2Val?.child?.filter((f3Val: { id: number }) => f3Val.id === value?.id)?.length > 0 ? true : false
                )?.length > 0
                    ? true
                    : false
            );
        } else {
            return [];
        }
    };

    const columns: TableColumnsProps[] = [
        {
            path: 'name',
            label: 'Name',
            content: (object: CipherCategoryResult) => (
                <Text
                    component="span"
                    className={classes.name}
                    onClick={() => {
                        navigate(`/services`, {
                            state: {
                                queryCategory: object,
                                queryNestedCategory: filterCategories(object),
                            },
                        });
                    }}>
                    {object.name}
                </Text>
            ),
        },
        {
            path: 'commission',
            label: 'Commission',
            content: (object: CipherCategoryResult) => <Text>{Number(Number.parseFloat((object?.commission ?? 0) as string)).toFixed(2)}</Text>,
        },
        {
            path: 'avatar',
            label: 'Avatars',
            content: (object: CipherCategoryResult) => (
                <Avatar.Group spacing="sm">
                    {object?.avatars.map((val) => (
                        <Tooltip
                            key={val?.id}
                            withArrow
                            label={_.last(_.split(val?.name, '/'))}
                            position="bottom"
                            styles={{ tooltip: { fontSize: 10, padding: '2px 8px', fontWeight: 500 } }}>
                            <Avatar src={val?.image} radius="xl" size={30} />
                        </Tooltip>
                    ))}
                </Avatar.Group>
            ),
            style: {
                width: 200,
            },
        },
        {
            path: 'icon',
            label: 'Icon',
            content: (object: CipherCategoryResult) => {
                if (_.has(object, 'icon')) {
                    return (
                        <ThemeIcon variant="light" size={'lg'} color="gray">
                            {object.icon && object.icon !== 'string' ? (
                                <div className={classes.ct_theme_icon} dangerouslySetInnerHTML={{ __html: String(object.icon) }} />
                            ) : (
                                <IconBan size={18} stroke={1.75} />
                            )}
                        </ThemeIcon>
                    );
                } else {
                    return null;
                }
            },
            style: {
                width: 80,
            },
        },
        {
            path: 'is_active',
            label: 'Status',
            content: (object: CipherCategoryResult) => {
                return (
                    <Badge
                        variant="light"
                        radius="xs"
                        size="lg"
                        color={`${object?.is_active ? 'blue' : 'red'}`}
                        sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 12 }}>
                        {object?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: CipherCategoryResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('add_category')) && (
                        <Tooltip label="Add" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                onClick={() => handleCategoryCreate(Number(object?.id))}
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconPlus size={18} stroke={1.75} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    {(is_superuser || user_permissions?.includes('change_category')) && (
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
                    {(is_superuser || user_permissions?.includes('delete_category')) && (
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
                width: 120,
            },
        },
    ];
    return (
        <>
            {isLoading ? (
                <SkeletonTableList />
            ) : (
                <Group position="apart" spacing={10} align="normal">
                    {isSuccess && (
                        <Group position="left" spacing={10} align="normal">
                            <TableTopBar
                                checked={checked}
                                deleteModal={onClickDeleteAll}
                                onHandleSearch={onHandleSearch}
                                loading={isFetching}
                                query={query}
                            />
                            <Select
                                name="ordering"
                                placeholder="Order by"
                                value={ordering !== '' ? ordering : null}
                                maw={180}
                                size="md"
                                data={[
                                    { value: '', label: 'None' },
                                    { value: 'name', label: 'Ascending' },
                                    { value: '-name', label: 'Descending' },
                                ]}
                                onChange={(value) => {
                                    setOrdering(value as string);
                                }}
                                icon={<IconSelector size={18} stroke={1.75} />}
                                clearable
                                style={{ marginBottom: 0 }}
                            />
                        </Group>
                    )}
                </Group>
            )}
            {isSuccess && data.length >= 1 && (
                <TreeDataTable
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
                    isInterminate={isInterminate}
                    isCheckbox={is_superuser || user_permissions?.includes('delete_category')}
                />
            )}
            {data && data.length < 1 && <NoDataMessage />}
        </>
    );
};

export default CategoriesListTable;
