"use client";
import apiClient from "@/axiosConfig";
import React, { useEffect, useState } from "react";
import {Title, Button, TextInput, Textarea, Group, ThemeIcon, Select, Pagination, useMantineTheme} from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import DataTable from "@/components/DataTable/DataTable";
import { toast } from "@/components/common/Toast";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import { Status, Type } from "@/components/enums/Status";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  product_count: number;
  status: string;
  type: string;
  sub_category: Category[];
}


export default function Page() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "", status: "", type: "" });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Add temp states
  const [tempType, setTempType] = useState<string | null>(null);
  const [tempSearch, setTempSearch] = useState("");




  const theme = useMantineTheme();

  // Columns for DataTable
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: string, row: any) => (
          <span style={{ paddingLeft: `${row.level * 20}px` }}>{value}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: string, row: any) => (
          <span style={{ paddingLeft: `${row.level * 20}px` }}>{value}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value: string, row: any) => (
          <span style={{ paddingLeft: `${row.level * 20}px` }}>{value || ""}</span>
      ),
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      render: (value: string | null) => {
        if (!value || value.trim() === '""') {
          return <span className="text-gray-500">N/A</span>;
        }
        const cleanedSvg = value
            .replace(/width="[^"]*"/, 'width="32"')
            .replace(/height="[^"]*"/, 'height="32"');
        return (
            <span
                dangerouslySetInnerHTML={{ __html: cleanedSvg }}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
            />
        );
      },
    },
  ];

  const statusOptions = [
    { value: Status.Active, label: "Active" },
    { value: Status.Disabled, label: "Inactive" },
  ];

  const TypeOptions = [
    { value: Type.Product, label: "Product" },
    { value: Type.Blog, label: "Blog" },
  ];

  // Flatten categories and sub-categories for table display
  const flattenCategories = (categories: Category[] = [], level: number = 0): any[] => {
    if (!Array.isArray(categories)) return [];
    let result: any[] = [];
    categories.forEach((category) => {
      result.push({ ...category, level });
      if (Array.isArray(category.sub_category) && category.sub_category.length > 0) {
        result = result.concat(flattenCategories(category.sub_category, level + 1));
      }
    });
    return result;
  };

  // Fetch categories
  const listCategories = async (type: string | null = null, name: string = "") => {
    setLoading(true);
    setError("");
    try {
      let url = `/product/category/?page=${currentPage}`;
      if (type) url += `&type=${type}`;
      if (name) url += `&name=${encodeURIComponent(name)}`;

      const response = await apiClient.get(url);
      setCategories(response?.data.result || []);
      setTotalPage(response?.data.total_pages || 1);
      setCurrentPage(response?.data.current || 1);
      setPageSize(response.data.page_size);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Category Fetching Failed";
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleTypeChange = async (value: string | null) => {
    setSelectedType(value);
    setCurrentPage(1);
    await listCategories(value);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    listCategories(selectedType, searchTerm);
  }, [currentPage, selectedType, searchTerm]);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedIcon = formData.icon
        .replace(/\s+/g, ' ')
        .replace(/> </g, '><')
        .trim();

    try {
      if (editingCategory) {
        await apiClient.put(`/product/category/create/`, {
          id: editingCategory.id,
          name: formData.name,
          icon: cleanedIcon,
          status: formData.status,
          type: formData.type,
        });
        notifications.show({
          title: "Success",
          message: "Category updated successfully",
          color: "green",
        });
      } else {
        await apiClient.post("/product/category/create/", {
          name: formData.name,
          icon: cleanedIcon,
          status: formData.status,
          type: formData.type,
        });
        notifications.show({
          title: "Success",
          message: "Category created successfully",
          color: "green",
        });
      }

      setOpenModal(false);
      setFormData({ name: "", icon: "", status: "", type: "" });
      listCategories(selectedType);
      setEditingCategory(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Failed to save category";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  // Handle delete category
  const handleDelete = (category: Category) => {
    toast.confirm(
        `Are you sure you want to delete the category "${category.name}"?`,
        async () => {
          try {
            await apiClient.delete(`/product/category/create/`, {
              data: { id: category.id },
            });
            toast.success("Category deleted successfully");
            listCategories(selectedType);
          } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to delete category");
          }
        }
    );
  };
  const applyFilters = () => {
    setSelectedType(tempType);
    setSearchTerm(tempSearch);
    setCurrentPage(1);
    listCategories(tempType, tempSearch);
  };

  const clearFilters = () => {
    setTempType(null);
    setTempSearch("");
    setSelectedType(null);
    setSearchTerm("");
    setCurrentPage(1);
    listCategories(null, "");
  };


  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || "",
      status: category.status || Status.Active,
      type: category.type || Type.Product,
    });
    setOpenModal(true);
  };

  useEffect(() => {
    listCategories(selectedType, searchTerm);
  }, [currentPage, selectedType, searchTerm]);


  if (loading) {
    return (
        <div className="min-h-screen items-center flex justify-center">
          <MithoSweetsLoader />
        </div>
    );
  }

  return (
<div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative">
          <div className="flex justify-between mb-4 ">
          <h1 className="text-2xl text-orange-500 font-bold" style={{ color: theme.colors.brand[6] }}>Categories</h1>
          <div className="flex gap-2">
            {/*<Select*/}
            {/*    placeholder="Filter by Type"*/}
            {/*    data={TypeOptions}*/}
            {/*    value={selectedType}*/}
            {/*    onChange={handleTypeChange}*/}
            {/*    clearable*/}
            {/*    // styles={{ input: { height: "100px !important", width: "170px !important"  } }}*/}
            {/*/>*/}
            <Button
                color={theme.colors.brand[6]}
                onClick={() => {
                  setFormData({ name: "", icon: "", status: Status.Active, type: Type.Product });
                  setEditingCategory(null);
                  setOpenModal(true);
                }}
            >
              Add Category
            </Button>
          </div>
        </div>

        <BreadCrumbs
            currentTitle="Categories"
            items={[{ name: "Dashboard", href: "/dashboard" }]}
            className="hover:text-red-500 cursor-pointer py-2"
        />

        <div className="bg-white mt-5 overflow-x-auto relative">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex flex-end  gap-2">
            <TextInput
                placeholder="Search by name"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.currentTarget.value)}
                style={{ minWidth: 250 }}
                size="md"
            />
            <Select
                placeholder="Filter by Type"
                data={TypeOptions}
                value={tempType}
                onChange={setTempType}
                clearable
            />
            <Button
                onClick={applyFilters}
                size="md"
            >
              Apply Filters
            </Button>
            <Button
                onClick={clearFilters}
                size="md"
                variant="outline"
            >
              Clear Filters
            </Button>
          </div>
          <DataTable
              columns={columns}
              data={flattenCategories(categories)}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              isCategoryPage={true}
          />

          {categories?.length > 0 && (
              <div className="flex justify-center mt-5">
                <Pagination
                    total={totalPage} 
                    value={currentPage}
                    onChange={setCurrentPage}
                    color={theme.colors.brand[6]}
                    radius="lg"
                />
              </div>
          )}

          {openModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl shadow-lg border max-w-2xl w-full max-h-[92vh] overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <Title order={2} className="text-3xl font-bold text-red-600">
                      {editingCategory ? "Edit Category" : "Add Category"}
                    </Title>
                    <button
                        type="button"
                        onClick={() => setOpenModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="mt-4 mb-2">
                    <TextInput
                        label="Category Name"
                        placeholder="Enter category name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        withAsterisk
                        mb="md"
                    />
                    <Textarea
                        label="Category Icon"
                        placeholder="We only support SVG code"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        withAsterisk
                        autosize
                        minRows={4}
                        mb="md"
                        style={{
                          maxHeight: "15rem",
                          overflowY: "auto",
                        }}
                    />
                    {formData.icon && (
                        <Group mb="md">
                          <ThemeIcon variant="light" size="lg" color="gray" style={{ width: 40, height: 40 }}>
                            <div
                                dangerouslySetInnerHTML={{
                                  __html: formData.icon
                                      .replace(/width="[^"]*"/g, '')
                                      .replace(/height="[^"]*"/g, '')
                                      .trim(),
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                            />
                          </ThemeIcon>
                        </Group>
                    )}
                    <Select
                        label="Type"
                        placeholder="Select Type"
                        name="type"
                        data={TypeOptions}
                        value={formData.type}
                        onChange={(value) => setFormData((prev) => ({ ...prev, type: value || Type.Product }))}
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
                        label="Category Status"
                        placeholder="Select status"
                        name="status"
                        data={statusOptions}
                        value={formData.status}
                        onChange={(value) => setFormData((prev) => ({...prev, status: value || Status.Disabled}))}
                        withAsterisk
                        mb="md"
                        styles={{
                          input: {
                            width: '100%',
                            minWidth: '100%',
                          },
                        }}
                    />
                    <Group justify="flex-end">
                      <Button
                          type="button"
                          variant="outline"
                          style={{
                            color: "black",
                            backgroundColor: "white",
                            borderColor: "gray",
                          }}
                          onClick={() => setOpenModal(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                          type="submit"
                          variant="filled"
                      >
                        Save Category
                      </Button>
                    </Group>

                  </form>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}