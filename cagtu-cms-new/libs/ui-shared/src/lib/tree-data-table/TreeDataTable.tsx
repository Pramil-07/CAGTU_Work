import { TreeDataTableProps } from '@cagtu-cms/util-formatter';
import { Group, Pagination, Select, Table, useMantineTheme } from '@mantine/core';
import DeleteModal from '../delete-modal/DeleteModal';
import TableBody from './Table/TableBody';
import TableHeader from './Table/TableHeader';

const TreeDataTable = ({
    data,
    columns,
    page,
    total,
    isAllCheckboxSelected,
    isCheckboxSelect,
    onSelectAll,
    onSetPage,
    handleSelect,
    isDeleteModalOpened,
    handleSingleDeleteCloseModal,
    isSingleDeleteMutationLoading,
    onConfirmSingleDelete,
    isMultiDeleteModalOpened,
    handleMultiDeleteCloseModal,
    isMultiDeleteMutationLoading,
    onConfirmMultiDelete,
    limitChange,
    handleLimitChange,
    isInterminate,
    isCheckbox = true,
}: TreeDataTableProps) => {
    const theme = useMantineTheme();
    return (
        <>
            <Table verticalSpacing={6} horizontalSpacing={6} mb={theme.spacing.md}>
                <TableHeader
                    columns={columns}
                    isAllCheckboxSelected={isAllCheckboxSelected}
                    onSelectAll={onSelectAll}
                    isInterminate={isInterminate}
                    isCheckbox={isCheckbox}
                />
                <TableBody data={data} columns={columns} isCheckboxSelect={isCheckboxSelect} handleSelect={handleSelect} isCheckbox={isCheckbox} />
            </Table>
            <Group position="apart">
                <Select
                    placeholder="e.g. 10"
                    value={limitChange}
                    data={['10', '20', '30', '40', '50']}
                    onChange={(e: string) => handleLimitChange?.(e)}
                    sx={{ width: 70 }}
                />
                <Pagination position="right" size={'md'} total={total} page={page} onChange={onSetPage} withEdges />
            </Group>
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

export default TreeDataTable;
