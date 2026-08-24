import { Checkbox } from '@mantine/core';
import _ from 'lodash';
interface TableBodyProps {
    data: any;
    columns: any;
    isCheckboxSelect?: (id: number | string) => boolean;
    handleSelect?: (id: number | string) => void;
    isCheckbox?: boolean;
}

const TableBody = ({ data, columns, isCheckboxSelect, handleSelect, isCheckbox = true }: TableBodyProps) => {
    const renderCell = (item: any, column: any) => {
        if (column.content) return column.content(item);
        return _.get(item, column.path);
    };

    const createKey = (item: any, column: any) => {
        return item.id + (column.path || column.key);
    };


    return (
        <tbody>
            {data.map((item: any, key: number) => (
                <tr key={item?.id ? item?.id : key}>
                    {isCheckbox && (
                        <td>
                            <Checkbox
                                checked={isCheckboxSelect?.(item?.id || item?.code)}
                                onChange={() => handleSelect?.(item?.id || item?.code)}
                                styles={{ inner: { width: 18, height: 18 }, input: { cursor: 'pointer', width: 18, height: 18 } }}
                            />
                        </td>
                    )}
                    {columns.map((column: any) => (
                        <td key={createKey(item, column)}>{renderCell(item, column)}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};

export default TableBody;
