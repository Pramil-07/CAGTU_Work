import { DataTable, NoDataMessage, SkeletonTableList, TableTopBar } from '@cagtu-cms/ui-shared';
import { DataTableProps, ProductResult, TableColumnsProps, useDark } from '@cagtu-cms/util-formatter';
import { ActionIcon, Badge, Group, Image, Tooltip, useMantineTheme, Text } from '@mantine/core';
import { IconEdit, IconHelp, IconStar, IconTrash } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';

interface ProductListTableProps extends DataTableProps {
    handleSingleDelete: (id: number) => void;
    onHandleSearch: (query: string) => void;
    checked: string[];
}

const ProductListTable = ({
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
}: ProductListTableProps) => {
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const [dark] = useDark();

    const columns: TableColumnsProps[] = [
        {
            path: 'thumbnail_image',
            label: 'Product',
            content: (object: ProductResult) => {
                return (
                    <Group position="left" spacing={10}>
                        <Image
                            width={40}
                            height={40}
                            src={`${eval(object?.thumbnail_image)[0]}`}
                            fit="contain"
                            alt="Product"
                            withPlaceholder
                            sx={{ background: dark ? theme.colors.dark[4] : theme.colors.gray[1], width: 40, height: 40, borderRadius: 4 }}
                            p={5}
                        />
                        <Text component="span">{object?.name}</Text>
                    </Group>
                );
            },
        },
        {
            path: 'model_no',
            label: 'Model Number',
            content: (object: ProductResult) => <span>{!object?.model_no ? '_' : object?.model_no}</span>,
            style: {
                width: 180,
            },
        },
        {
            path: 'stock_count',
            label: 'Stock',
            style: {
                width: 120,
            },
        },
        {
            path: 'quantity_count',
            label: 'Qty',
            content: (object: ProductResult) => {
                const checkQtyCount = object?.quantity_count <= 5;

                return (
                    <>
                        <span style={{ fontWeight: 600, color: `${checkQtyCount ? theme.colors.red[6] : ''}` }}>{object?.quantity_count}</span>
                        {checkQtyCount && (
                            <Badge
                                radius="xs"
                                sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 10, letterSpacing: 'revert', padding: '0 6px' }}
                                color="red"
                                ml={10}>
                                Low Stock
                            </Badge>
                        )}
                    </>
                );
            },
            style: {
                width: 120,
            },
        },
        {
            path: 'price',
            label: (
                <Group position="left" spacing={3} align="baseline">
                    <span>Price</span>
                    <Tooltip
                        label="Default stock price."
                        position="bottom"
                        transition="fade"
                        withArrow
                        styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500, textAlign: 'center' } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={24}
                            color="gray"
                            ml={2}
                            sx={{
                                cursor: 'pointer',
                                position: 'relative',
                                top: 2,
                            }}>
                            <IconHelp size={14} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
            content: (object: ProductResult) => <span style={{ fontWeight: 600 }}>{object?.stock?.price ?? '_'}</span>,
            style: {
                width: 100,
            },
        },
        {
            path: 'rating',
            label: 'Rating',
            content: (object: ProductResult) => (
                <>
                    <span style={{ marginRight: 4, position: 'relative', top: 1 }}>{object?.rating?.rating__avg ?? 0}</span>
                    <IconStar color="#FAB005" /> {`(${object?.rating?.count})`}
                </>
            ),
            style: {
                width: 90,
            },
        },
        {
            path: 'added_by',
            label: 'Added By',
            content: (object: ProductResult) => (
                <Badge radius="sm" size="lg" sx={{ fontWeight: 600, fontSize: 12 }} color={object?.added_by === 'BUZZ Mall' ? 'cyan' : 'blue'}>
                    {object?.added_by}
                </Badge>
            ),
            style: {
                width: 120,
            },
        },
        {
            path: 'status',
            label: 'Status',
            content: (object: ProductResult) => (
                <Badge radius="sm" size="lg" sx={{ fontWeight: 600, fontSize: 12 }} color={object?.status === 'Active' ? 'green' : 'yellow'}>
                    {object?.status}
                </Badge>
            ),
            style: {
                width: 100,
            },
        },
        {
            path: 'actions',
            label: '',
            content: (object: ProductResult) => (
                <Group position="right" spacing={5}>
                    <Tooltip label="Edit" position="bottom" styles={{ tooltip: { fontSize: 12, padding: '3px 8px', fontWeight: 500 } }}>
                        <ActionIcon
                            variant="light"
                            radius="xl"
                            size={30}
                            color="gray"
                            sx={{
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate(`/products/${object.id}/edit`)}>
                            <IconEdit size={15} />
                        </ActionIcon>
                    </Tooltip>
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
                            <IconTrash size={15} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
            style: {
                width: 80,
            },
        },
    ];
    return (
        <>
            {isLoading && <SkeletonTableList />}
            {isSuccess &&
                (data.length < 1 ? (
                    <NoDataMessage />
                ) : (
                    <>
                        <TableTopBar checked={checked} deleteModal={onClickDeleteAll} onHandleSearch={onHandleSearch} />
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
                        />
                    </>
                ))}
        </>
    );
};

export default ProductListTable;
