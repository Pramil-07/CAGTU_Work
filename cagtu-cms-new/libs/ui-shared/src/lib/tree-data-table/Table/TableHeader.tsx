import { Checkbox } from '@mantine/core';

interface TableHeaderProps {
    columns: any;
    isAllCheckboxSelected?: any;
    onSelectAll?: () => void;
    isInterminate?: boolean;
    isCheckbox?: boolean;
}

const TableHeader = ({ columns, isAllCheckboxSelected, onSelectAll, isInterminate, isCheckbox }: TableHeaderProps) => {
    return (
        <thead>
            <tr>
                {isCheckbox && (
                    <th style={{ fontWeight: 600, width: 34 }}>
                        <Checkbox
                            checked={isAllCheckboxSelected()}
                            indeterminate={isInterminate}
                            onChange={onSelectAll}
                            styles={{ inner: { width: 18, height: 18 }, input: { cursor: 'pointer', width: 18, height: 18 } }}
                        />
                    </th>
                )}
                {columns?.map((column: any) => (
                    <th key={column.path || column.key} style={{ fontWeight: 500, ...column?.style }}>
                        {column.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default TableHeader;
