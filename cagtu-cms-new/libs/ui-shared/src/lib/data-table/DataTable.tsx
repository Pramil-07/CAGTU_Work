import { DataTableProps, getPageLimit, storePageLimit } from '@cagtu-cms/util-formatter';
import { Group, Pagination, ScrollArea, Select, Table, useMantineTheme } from '@mantine/core';
import DeleteModal from '../delete-modal/DeleteModal';
import TableBody from './TableBody';
import TableHeader from './TableHeader';
import RejectModel from '../delete-modal/RejectModel';

const DataTable = ({
    data,
    columns,
    page,
    total,
    isDeleteModalOpened,
    isRejectModalOpened,
    isMultiDeleteModalOpened,
    isSingleDeleteMutationLoading,
    isSingleRejectMutationLoading,
    isMultiDeleteMutationLoading,
    isAllCheckboxSelected,
    isCheckboxSelect,
    handleSelect,
    onSelectAll,
    onSetPage,
    onConfirmSingleDelete,
    onConfirmSingleReject,
    onConfirmMultiDelete,
    handleSingleDeleteCloseModal,
    handleSingleRejectCloseModal,
    handleMultiDeleteCloseModal,
    isCheckbox,
    limitChange,
    handleLimitChange,
    withPaginaton = true,
}: DataTableProps) => {
    const theme = useMantineTheme();

    return (
        <>
            <ScrollArea scrollbarSize={6} mb={withPaginaton ? theme.spacing.md : 0}>
                <Table verticalSpacing={6} horizontalSpacing={6}>
                    <TableHeader columns={columns} isAllCheckboxSelected={isAllCheckboxSelected} onSelectAll={onSelectAll} isCheckbox={isCheckbox} />
                    <TableBody
                        data={data}
                        columns={columns}
                        isCheckboxSelect={isCheckboxSelect}
                        handleSelect={handleSelect}
                        isCheckbox={isCheckbox}
                    />
                </Table>
            </ScrollArea>
            {withPaginaton && (
                <Group position="apart">
                    <Select
                        placeholder="e.g. 10"
                        value={limitChange}
                        data={['10', '20', '30', '40', '50', '60', '70', '80', '90', '100']}
                        onChange={(e: string) => {
                            if (onSetPage) onSetPage(1);
                            storePageLimit(e);
                            handleLimitChange?.(e);
                        }}
                        sx={{ width: 70 }}
                    />
                    <Pagination position="right" size={'md'} total={total} page={page} onChange={onSetPage} withEdges />
                </Group>
            )}
            <DeleteModal
                opened={isDeleteModalOpened as boolean}
                onClose={handleSingleDeleteCloseModal}
                title="Are you sure?"
                description="Do you really want to delete this?"
                loading={isSingleDeleteMutationLoading as boolean}
                onConfirm={onConfirmSingleDelete}
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
            />
            <RejectModel
                opened={isRejectModalOpened as boolean}
                onClose={handleSingleRejectCloseModal}
                title="Are you sure?"
                description="Do you really want to reject this?"
                loading={isSingleRejectMutationLoading as boolean}
                onConfirm={onConfirmSingleReject}
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
            />
            <DeleteModal
                opened={isMultiDeleteModalOpened as boolean}
                onClose={handleMultiDeleteCloseModal}
                title="Are you sure?"
                description="Do you really want to delete these selected list?"
                loading={isMultiDeleteMutationLoading as boolean}
                onConfirm={onConfirmMultiDelete}
                overlayBlur={3}
                overlayOpacity={0.2}
                closeOnClickOutside={false}
            />
        </>
    );
};

export default DataTable;
