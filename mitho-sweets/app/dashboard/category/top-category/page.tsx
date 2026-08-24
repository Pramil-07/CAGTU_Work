"use client";
import apiClient from "@/axiosConfig";
import React, { useEffect, useState } from "react";
import {Title, Button, Select, Group, useMantineTheme, TextInput} from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import DataTable from "@/components/DataTable/DataTable";
import { toast } from "@/components/common/Toast";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {Status, Type} from "@/components/enums/Status";

interface Category {
    id: number;
    name: string;
    status: Status;
    icon: string;
    slug: string;
}

interface TopCategory {
    id: number;
    category: Category;
    status: string;
}

const Page = () => {
    const [loading, setLoading] = useState(true);
    const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({ id: 0, status: "" });
    const [editingCategory, setEditingCategory] = useState<TopCategory | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const theme = useMantineTheme();
    const categoryId = editingCategory?.id;

    const statusOptions = [
        { value: Status.Active, label: "Active" },
        { value: Status.Disabled, label: "Inactive" },
    ];

    const columns = [
        {
            title: "Name",
            dataIndex: "category",
            key: "name",
            render: (value: Category , row: any) => <span style={{ paddingLeft: `${row.level * 20}px` }}>{value?.name || "N/A"}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value: string , row: any) => <span className={`font-semibold ${value === Status.Active ? "text-green-600" : "text-red-600"} float-right`} style={{textAlign: "right"}}>{value || "N/A"}</span>,
        },
        {
            title: "Icon",
            dataIndex: "icon",
            key: "icon",
            render: (value: string | null) => {
                if (!value || value.trim() === "") {
                    return <span className="text-gray-500">N/A</span>;
                }
                const cleanedSvg = value
                    .replace(/width="[^"]*"/, 'width="32"')
                    .replace(/height="[^"]*"/, 'height="32"');
                return (
                    <span
                        dangerouslySetInnerHTML={{ __html: cleanedSvg }}
                        style={{ display: "inline-block", verticalAlign: "middle" }}
                    />
                );
            },
        },
    ];


    const fetchCategories = async () => {
        try {
            const response = await apiClient.get("/product/category/?page=1");
            setCategories(response.data.result || []);
        } catch (err: any) {
            notifications.show({
                title: "Error",
                message: err.response?.data?.detail || "Failed to fetch categories",
                color: "red",
                icon: <IconX size={16} />,
            });
        }
    };

    const handleEdit = (topCategory: TopCategory) => {
        setEditingCategory(topCategory);
        setFormData({
            id: topCategory.category?.id || 0,
            status: topCategory.status || Status.Active,
        });
        setOpenModal(true);
    };

    const fetchTopCategories = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/product/top-category/list/",{
                params: {
                    ...(searchTerm ? { name: searchTerm } : {}),
                },
            });
            const raw = response.data.data || [];

            const normalized = raw.map((item: any) => {
                // try to find matching category object by name
                const found = categories.find(c => c.name === item.category);
                return {
                    ...item,
                    category: found || { id: 0, name: item.category, status: Status.Active, icon: "", slug: "" }
                };
            });

            setTopCategories(normalized);
        } catch (err: any) {
            notifications.show({
                title: "Error",
                message: err.response?.data?.detail || "Failed to fetch top categories",
                color: "red",
                icon: <IconX size={16} />,
            });
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await apiClient.put(`/product/create-category/create/${categoryId}/`, {
                    category: formData.id,
                    status: formData.status,
                });
                notifications.show({
                    title: "Success",
                    message: "Category updated successfully",
                    color: "green",
                });
                setOpenModal(false);
                setFormData({id: 0, status: Status.Active});
                fetchTopCategories();
            } else {
                await apiClient.post("/product/create-category/create/", {
                    category: formData.id,
                    status: formData.status,
                });
                notifications.show({
                    title: "Success",
                    message: "Top category created successfully",
                    color: "green",
                });
                setOpenModal(false);
                setFormData({id: 0, status: Status.Active});
                fetchTopCategories();
            }
        } catch (err: any) {
            notifications.show({
                title: "Error",
                message: err.response?.data?.detail || "Failed to create top category",
                color: "red",
                icon: <IconX size={16} />,
            });
        }
    };

    const handleDelete = (topCategory: TopCategory) => {
        toast.confirm(
            `Are you sure you want to delete "${topCategory.category.name}" from top categories?`,
            async () => {
                try {
                    await apiClient.delete(`/product/create-category/create/${topCategory.id}/`,
                    //     {
                    //     data: { id: topCategory.id },
                    // }
                    );
                    toast.success("Top category deleted successfully");
                    fetchTopCategories();
                } catch (err: any) {
                    toast.error(err.response?.data?.detail || "Failed to delete top category");
                }
            }
        );
    };

    // useEffect(() => {
    //     fetchCategories();
    //     fetchTopCategories();
    // }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            fetchTopCategories();
        }
    }, [categories, searchTerm]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <MithoSweetsLoader />
            </div>
        );
    }

    return (
<div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative">
                <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold" style={{ color: theme.colors.brand[6] }}>
                    Top Categories
                </h1>
                <Button color={theme.colors.brand[6]} onClick={() => {
                    setEditingCategory(null);
                    setOpenModal(true);
                    setFormData({ id: 0, status: Status.Active });
                }}>
                    Add Top Category
                </Button>
            </div>

            <BreadCrumbs
                currentTitle="Top Categories"
                items={[{ name: "Dashboard", href: "/dashboard" }]}
                className="hover:text-red-500 cursor-pointer py-2"
            />
    <TextInput
        placeholder="Search by name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.currentTarget.value)}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
                setSearchTerm(searchInput);
            }
        }}
        style={{
            width: "18rem"
        }}
    />
            <DataTable
                columns={columns}
                data={topCategories}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isCategoryPage={true}
                // isTopCategoryPage={true}
            />


            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg border max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <Title order={2} className="text-2xl font-bold text-red-600">
                                {editingCategory ? "Edit Top Category" : "Add Top Category"}
                            </Title>
                            <button
                                type="button"
                                onClick={() => {
                                setOpenModal(false);
                                setEditingCategory(null);
                                setFormData({ id: 0, status: Status.Active });
                            }}
                                className="text-gray-500 hover:text-gray-700">
                                <IconX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-4">
                            <Select
                                label="Category"
                                placeholder="Select category"
                                data={categories.map((c) => ({
                                    value: c.id.toString(),
                                    label: c.name,
                                }))}
                                value={formData.id ? formData.id.toString() : ""}
                                onChange={(value) =>
                                    setFormData((prev) => ({ ...prev, id: Number(value) || 0 }))
                                }
                                withAsterisk
                                mb="md"
                                styles={{
                                    input: {
                                        width: '100%',
                                        minWidth: '100%',
                                    },
                                }}
                            />

                            <Select
                                label="Status"
                                placeholder="Select status"
                                data={statusOptions}
                                value={formData.status}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, status: (value as Status) || Status.Active }))}
                                withAsterisk
                                clearable
                                mb="md"
                                styles={{
                                    input: {
                                        width: '100%',
                                        minWidth: '100%',
                                    },
                                }}
                            />
                            <form onSubmit={handleSubmit}>
                                <Group justify="flex-end">
                                    <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
                                    {editingCategory
                                        ? <Button type="submit">Update Category</Button>
                                        : <Button type="submit">Save Category</Button>
                                    }
                                </Group>
                            </form>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Page;