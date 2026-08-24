import { CipherAPI, urls } from '@cagtu-cms/data-access';
import { Badge, DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { useThemeIconStyles } from '@cagtu-cms/ui-styles';
import { CipherUserContext, DataTableProps, TableColumnsProps, TopCategoriesResult } from '@cagtu-cms/util-formatter';
import { ActionIcon, Group, Menu, ThemeIcon, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconArrowsMoveVertical, IconBan, IconTrash, IconX } from '@tabler/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useContext } from 'react';

const urlsPath = urls?.cipher?.topCategories;
interface TopCategoriesTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    checked: string[];
    isFetching: boolean;
    query: string;
}

const TopCategoriesTable = ({
    data,
    page,
    checked,
    isLoading,
    isFetching,
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
    limitChange,
    handleLimitChange,
    query,
}: TopCategoriesTableProps) => {
    const { user_permissions, is_superuser } = useContext(CipherUserContext);
    const { classes } = useThemeIconStyles();
    const queryClient = useQueryClient();

    const topCategoriesAPI = new CipherAPI(urlsPath?.update);

    const topCategoriesMutation = useMutation((data: { priority: number; id: number }) => topCategoriesAPI.store(data, data?.id));

    const columns: TableColumnsProps[] = [
        {
            path: 'categories',
            label: 'Categories',
            content: (object: TopCategoriesResult) => <Badge name={object.category} color="dark" radius="xl" />,
        },
        {
            path: 'icon',
            label: 'Icon',
            content: (object: TopCategoriesResult) => {
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
                width: 120,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: TopCategoriesResult) => (
                <Group position="right" spacing={5}>
                    {(is_superuser || user_permissions?.includes('delete_topcategory')) && (
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
                    <Menu shadow="md" width={150} withArrow withinPortal>
                        <Menu.Target>
                            {/* <Tooltip label="re-arrange" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}> */}
                            <ActionIcon
                                variant="light"
                                radius="xl"
                                size={30}
                                color="gray"
                                sx={{
                                    cursor: 'pointer',
                                }}>
                                <IconArrowsMoveVertical size={18} stroke={1.75} />
                            </ActionIcon>
                            {/* </Tooltip> */}
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Rearrange postition</Menu.Label>
                            {new Array(12).fill('').map((val, index) => (
                                <Menu.Item
                                    onClick={() => {
                                        topCategoriesMutation.mutate(
                                            {
                                                priority: index + 1,
                                                id: Number(object.id),
                                            },
                                            {
                                                onSuccess: () => {
                                                    queryClient.invalidateQueries(['top-categories', page, limitChange]);
                                                },
                                                onError: (error: any) => {
                                                    const {
                                                        data: { message },
                                                    } = error.response;
                                                    showNotification({
                                                        title: 'Uh oh! something went wrong',
                                                        message: message ?? 'Sorry! There was a problem with your request.',
                                                        color: 'red',
                                                        icon: <IconX size={18} />,
                                                    });
                                                },
                                            }
                                        );
                                    }}>
                                    Go to position {index + 1}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
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
            {isSuccess && !isLoading && (
                <>
                    <TableTopBar
                        checked={checked}
                        deleteModal={onClickDeleteAll}
                        onHandleSearch={onHandleSearch}
                        loading={isFetching}
                        query={query}
                    />
                    {data.length >= 1 && (
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
                            isCheckbox={is_superuser || user_permissions?.includes('delete_topcategory')}
                        />
                    )}
                    {data && data.length < 1 && <NoDataMessage />}
                </>
            )}
        </>
    );
};

export default TopCategoriesTable;
