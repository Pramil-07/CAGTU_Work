import { TreeTableContext } from '@cagtu-cms/util-formatter';
import { ActionIcon, Checkbox, Group } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons';
import _ from 'lodash';
import { Fragment, useContext } from 'react';
interface TableBodyProps {
    data: any;
    columns: any;
    isCheckboxSelect?: (id: number) => boolean;
    handleSelect?: (id: number) => void;
    isCheckbox?: boolean;
}

const TableBody = ({ data, columns, isCheckboxSelect, handleSelect, isCheckbox }: TableBodyProps) => {
    const { openRows, setOpenRows } = useContext(TreeTableContext);

    const renderCell = (item: any, column: any) => {
        if (column.content) return column.content(item);

        return _.get(item, column.path);
    };

    const createKey = (item: any, column: any) => {
        return item.id + (column.path || column.key);
    };

    // Display child row element on toggle arrow down button in table row
    const handleRowToggle = (id: number) => {
        if (setOpenRows) {
            setOpenRows((prev) => {
                if (prev.includes(id)) {
                    return prev.filter((value) => value !== id);
                } else {
                    const newValues = Array.from(new Set([...prev, id]));
                    return newValues;
                }
            });
        }
    };

    // Generate table row if it has child data using recursion
    const renderChildren = (itemChild: any) => {
        if (itemChild?.child) {
            return itemChild?.child.map((value: any, key: number) => {
                return (
                    <Fragment key={value?.id ? value?.id : key}>
                        <tr>
                            {isCheckbox && (
                                <td>
                                    <Checkbox
                                        checked={isCheckboxSelect?.(value.id)}
                                        onChange={() => handleSelect?.(value.id)}
                                        styles={{ inner: { width: 18, height: 18 }, input: { cursor: 'pointer', width: 18, height: 18 } }}
                                    />
                                </td>
                            )}
                            {columns.map((column: any, index: number) => (
                                <td key={createKey(value, column)}>
                                    {index === 0 && value?.child?.length ? (
                                        <Group position="left" spacing={8}>
                                            {/* Empty span inline element to create space from the begiining if it is a child row */}
                                            <span style={{ paddingLeft: `${value?.level ? value?.level * 15 : 0}px` }}></span>
                                            <ActionIcon
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleRowToggle(value?.id)}
                                                sx={{
                                                    cursor: 'pointer',
                                                }}>
                                                {openRows.includes(value?.id) ? (
                                                    <IconChevronUp size={16} stroke={1.75} />
                                                ) : (
                                                    <IconChevronDown size={16} stroke={1.75} />
                                                )}
                                            </ActionIcon>
                                            {renderCell(value, column)}
                                        </Group>
                                    ) : (
                                        <>
                                            {/* Generate Empty span inline element at first index of column to create space from the begiining if it is a child row */}
                                            {index === 0 && <span style={{ paddingLeft: `${value?.level ? value?.level * 15 + 25 : 0}px` }}></span>}
                                            {renderCell(value, column)}
                                        </>
                                    )}
                                </td>
                            ))}
                        </tr>
                        {openRows.includes(value?.id) ? renderChildren(value) : null}
                    </Fragment>
                );
            });
        } else {
            return null;
        }
    };

    return (
        <tbody>
            {data.map((item: any, key: number) => (
                <Fragment key={item?.id ? item?.id : key}>
                    <tr>
                        {isCheckbox && (
                            <td>
                                <Checkbox
                                    checked={isCheckboxSelect?.(item.id)}
                                    onChange={() => handleSelect?.(item.id)}
                                    styles={{ inner: { width: 18, height: 18 }, input: { cursor: 'pointer', width: 18, height: 18 } }}
                                />
                            </td>
                        )}
                        {columns.map((column: any, index: number) => (
                            <td key={createKey(item, column)}>
                                {index === 0 && item?.child?.length ? (
                                    <Group position="left" spacing={8}>
                                        <ActionIcon
                                            variant="default"
                                            size={18}
                                            onClick={() => handleRowToggle(item?.id)}
                                            sx={{
                                                cursor: 'pointer',
                                            }}>
                                            {openRows.includes(item?.id) ? (
                                                <IconChevronUp size={16} stroke={1.75} />
                                            ) : (
                                                <IconChevronDown size={16} stroke={1.75} />
                                            )}
                                        </ActionIcon>
                                        {renderCell(item, column)}
                                    </Group>
                                ) : (
                                    renderCell(item, column)
                                )}
                            </td>
                        ))}
                    </tr>
                    {openRows.includes(item?.id) ? renderChildren(item) : null}
                </Fragment>
            ))}
        </tbody>
    );
};

export default TableBody;
