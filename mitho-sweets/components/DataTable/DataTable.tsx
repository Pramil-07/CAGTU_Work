"use client";
import React, { useState } from "react";
import {FaEdit, FaRegEye, FaTrash} from "react-icons/fa";
import {
    Table,
    Group,
    ScrollArea,
    Text,
    useMantineTheme,
    Center,
    Checkbox,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";

type Column = {
    title: string | React.ReactNode;
    dataIndex: string;
    key: string;
    render?: (value: any, row: any) => React.ReactNode;
};

type TableComponentProps = {
    columns: Column[];
    data?: any[];
    handleEdit?: (row: any) => void;
    handleDelete?: (row: any) => void;
    handleView?: (row: any) => void;
    isCategoryPage?: boolean;
    isTagPage? : boolean;
    loading?: boolean;
};

const DataTable: React.FC<TableComponentProps> = ({
                                                      columns,
                                                      data = [],
                                                      handleEdit,
                                                      handleDelete,
                                                      handleView,
                                                      isCategoryPage = false,
                                                      isTagPage = false,
                                                      loading = false,
                                                  }) => {
    const pathname = usePathname();
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const theme = useMantineTheme();
    const isOrder = pathname.includes("/Orders")
    const isOffer=pathname.includes("/offers");
    const isBulkOrder = pathname.includes("/bulk-order")
    const isUserPage = pathname.includes("/user-List")
    const isTransactionHistory = pathname.includes("/Transaction-history")
    const showCheckbox = !isOrder && !isTransactionHistory;
    const showActions = !isTransactionHistory;
    const colSpan = columns.length + (showCheckbox ? 1 : 0) + (showActions ? 1 : 0);

    const toggleRow = (index: number) => {
        const newSet = new Set(selectedRows);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setSelectedRows(newSet);
    };

    const toggleAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map((_, i) => i)));
        }
    };
   const handleVieww = (row: any) => {
        console.log("row",row)
        setSelectedProduct(row);
        if (handleEdit) {
            handleEdit(row);
        }
    };
    return (
        <ScrollArea>
            <Table
                highlightOnHover
                striped
                verticalSpacing="sm"
                horizontalSpacing="md"
            > 
                <Table.Thead>
                    <Table.Tr>
                        {/* Checkbox Column Header */}
                        {!isOrder && !isTransactionHistory && !isUserPage && (
                        <Table.Th style={{ width: 40, textAlign: "center" }}>
                            <Checkbox
                                checked={selectedRows.size === data.length && data.length > 0}
                                indeterminate={
                                    selectedRows.size > 0 && selectedRows.size < data.length
                                }
                                onChange={toggleAll}
                                size="14px"
                                styles={{
                                    input: { width: 14, height: 14 }, // shrink the actual checkbox
                                    icon: { width: 10, height: 10 },  // shrink the checkmark
                                }}
                            />
                        </Table.Th>
                        )}
                        {columns.map((col) => (
                            <Table.Th
                                key={col.key}
                                style={{
                                    width: isCategoryPage && col.dataIndex === "icon" ? "100px" : "auto",
                                    textAlign: isCategoryPage && col.dataIndex === "icon" ? "center" : isCategoryPage && col.dataIndex === "status"? "right":  "left",
                                }}
                            >
                                {col.title}
                            </Table.Th>
                        ))}
                        {!isTransactionHistory && !isUserPage && (
                        <Table.Th
                            style={{
                                width: isCategoryPage || isTagPage ? "100px" : "auto",
                            }}
                        >
                            Actions
                        </Table.Th>
                        )}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {loading ? (
                        <Table.Tr>
                            <Table.Td colSpan={colSpan}>
                                <Center py="md">
                                    <MithoSweetsLoader />
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    ) : data.length > 0 ? (
                        data.map((row: any, idx: number) => (
                            <Table.Tr key={idx}>
                                {/* Checkbox Column */}
                                {!isOrder && !isUserPage && !isTransactionHistory && (
                                <Table.Td style={{ width: 40, textAlign: "center" }}>
                                    <Checkbox
                                        checked={selectedRows.has(idx)}
                                        onChange={() => toggleRow(idx)}
                                        size="14px"
                                        styles={{
                                            input: { width: 14, height: 14 }, // shrink the actual checkbox
                                            icon: { width: 10, height: 10 },  // shrink the checkmark
                                        }}
                                    />
                                </Table.Td>
                                )}
                                {columns.map((col) => (
                                    <Table.Td
                                        key={col.key}
                                        style={{
                                            width:
                                                isCategoryPage && col.dataIndex === "name"
                                                    ? "100%"
                                                    : isCategoryPage && col.dataIndex === "icon"
                                                        ? "100px" : isTagPage && col.dataIndex=== "slug" ? "100px"
                                                        : "auto",
                                        }}
                                    >
                                        {col.dataIndex === "icon" && isCategoryPage ? (
                                            <Center>
                                                {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                                            </Center>
                                        ) : (
                                            col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]
                                        )}
                                    </Table.Td>
                                ))}

                                {/* Actions */}
                              <Table.Td
  style={{
    textAlign: "center",
    width: isCategoryPage ? "100px" : "auto",
  }}
>
  <Group gap="sm" justify="start">
    {/* Edit */}
    {(!isOrder && !isBulkOrder && !isTransactionHistory && !isUserPage ) && (
      <FaEdit
        size={16}
        style={{ cursor: "pointer", color: "gray" }}
        onClick={() => handleEdit && handleEdit(row)}
      />
    )}
  {/* View */}
    {(isOrder) && (
      <FaRegEye
        size={16}
        style={{ cursor: "pointer", color: "gray" }}
        onClick={() => handleVieww && handleVieww(row)}
      />
    )}
    
    {( isBulkOrder||isOffer ) && (
      <FaRegEye
        size={16}
        style={{ cursor: "pointer", color: "gray" }}
        onClick={() => handleView && handleView(row)}
      />
    )}
    {/* Delete */}
    {(!isOrder && !isUserPage && !isTransactionHistory || isBulkOrder ) && (
      <FaTrash
        size={16}
        style={{ cursor: "pointer", color: "gray" }}
        onClick={() => handleDelete && handleDelete(row)}
      />
    )}

  
  </Group>
</Table.Td>

                            </Table.Tr>
                        ))
                    ) : (
                        <Table.Tr>
                            <Table.Td colSpan={columns.length + 2}>
                                <Center>
                                    <Text c="dimmed" py="md">
                                        No data available
                                    </Text>
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
};

export default DataTable;
