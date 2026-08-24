"use client";
import apiClient from "@/axiosConfig";
import React,{ useEffect, useState, useMemo } from "react";
import { debounce } from "lodash";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import DataTable from "@/components/DataTable/DataTable";
import { FileInput, useMantineTheme, Button, Avatar, Pagination, Select, MultiSelect, TextInput, Paper, Group } from "@mantine/core";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import {Editor} from "primereact/editor";

// Define the Tags interface
interface Tag {
  id: string;
  name: string;
}

// Extend BlogPost interface to include tags
export interface BlogPost {
  id: string;
  title: string;
  author_name: string;
  published_at: string;
  category_name: string;
  content: string;
  image: string | File | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  author: string;
  category: number;
  tags: number[];
  views?: number;
  readTime?: string;
  slug: string;
}

export default function Page() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [totalPage, setTotalPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [blogCategory, setBlogCategory] = useState<{ id: number; name: string }[]>([]);
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    id: "",
    title: "",
    author_name: "",
    category: 0,
    content: "",
    published_at: "",
    is_published: false,
    tags: [],
    image: null,
    slug: "",
  });

  const theme = useMantineTheme();

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Author",
      dataIndex: "author_name",
      key: "author_name",
    },
    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      render: (category_name: string) => <span>{category_name || "N/A"}</span>,
    },
    {
      title: "Published Date",
      dataIndex: "published_at",
      key: "published_at",
      render: (dateString: string) => {
        if (!dateString) return <span>N/A</span>;
        const date = new Date(dateString);
        return (
          <span>
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      title: "Published",
      dataIndex: "is_published",
      key: "is_published",
      render: (is_published: boolean) => <span>{is_published ? "Yes" : "No"}</span>,
    },
  ];

  // Fetch blogs with pagination and filters
 const listBlogs = async (page: number = 1) => {
  setLoading(true);
  setError("");
  try {
            const queryParams = new URLSearchParams();
                queryParams.append("page", currentPage.toString());
console.log("filtercategory", filterCategory)
    if (searchTerm) queryParams.append("title", searchTerm)
    if (filterCategory)  queryParams.append("category", filterCategory)
        const response = await apiClient.get(`/blogs/?${queryParams.toString()}`);
    setTotalPage(response.data.total_pages);
    setCurrentPage(response.data.current);
    setBlogs(response.data.result);
  } catch (err: any) {
    setError(err.response?.data?.detail || "Blog Fetching Failed");
    notifications.show({
      title: "Error",
      message: err.response?.data?.detail || "Blog Fetching Failed",
      color: "red",
    });
  } finally {
    setLoading(false);
  }
};

  // Debounced version of listBlogs
  const debouncedListBlogs = useMemo(() => debounce(listBlogs, 500), []);

  useEffect(() => {
    debouncedListBlogs(currentPage);
    return () => debouncedListBlogs.cancel();
  }, [currentPage, searchTerm, filterCategory, debouncedListBlogs]);

  // Fetch tags and categories
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiClient.get("/tags/");
        setPopularTags(response.data);
      } catch (e) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch tags",
          color: "red",
        });
      }
    };

    const fetchCategory = async () => {
      try {
        const response = await apiClient.get(`product/category/?type=blog`);
        setBlogCategory(response.data.result);
      } catch (e) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch categories",
          color: "red",
        });
      }
    };

    fetchCategory();
    fetchTags();
  }, []);

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Cleanup on unmount
    } else {
      setFormData((prev) => ({ ...prev, image: null }));
      setAvatarPreview("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.author_name) newErrors.author_name = "Author Name is required";
    if (!formData.content) newErrors.content = "Content is required";
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.image && !formData.id) newErrors.image = "Blog Image is required"; // Only require image for new blogs
    if (!formData.category) newErrors.category = "Category is required";
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill all required fields correctly",
        color: "red",
      });
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "image" && value instanceof File) {
            fd.append("image", value);
          } else if (key === "tags") {
            (value as number[]).forEach((tagId) => fd.append("tags", tagId.toString()));
          } else if (key !== "image") {
            fd.append(key, value.toString());
          }
        }
      });

      if (formData.id) {
        await apiClient.put(`/blogs/${formData.slug}/update/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notifications.show({
          title: "Success",
          message: "Blog updated successfully",
          color: "green",
        });
      } else {
        await apiClient.post("/blogs/create/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notifications.show({
          title: "Success",
          message: "Blog created successfully",
          color: "green",
        });
      }

      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview("");
      setEditModal(false);
      listBlogs(currentPage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Failed to save blog";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      author_name: blog.author_name,
      category: blog.category,
      content: blog.content,
      published_at: blog.published_at,
      is_published: blog.is_published,
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      image: blog.image,
      slug: blog.slug,
    });
    setAvatarPreview(typeof blog.image === "string" ? blog.image : "");
    setEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen items-center flex justify-center">
        <MithoSweetsLoader />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative">
      {/* Filter Section */}
      {showFilters && (
        <Paper shadow="xs" p="md" withBorder className="mb-6">
          <div className="flex justify-end items-center mb-2">
            <Button
              variant="outline"
              color="gray"
              size="xs"
              onClick={() => {
                setSearchTerm("");
                setFilterCategory(null);
                setCurrentPage(1);
                listBlogs(1); // Reset to fetch all blogs
              }}
            >
              Clear Filter
            </Button>
          </div>
          <Group grow>
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Filter by Title</label>
              <TextInput
                placeholder="Enter blog title"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.currentTarget.value);
                  setCurrentPage(1);
                }}
                classNames={{
                  input:
                    "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
                }}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Filter by Category</label>
              <Select
                value={filterCategory}
                onChange={(value) => {
                  setFilterCategory(value);
                  setCurrentPage(1);
                }}
                data={[
                  { value: "", label: "All Categories" },
                  ...blogCategory.map((cat) => ({
                    value: cat.id.toString(),
                    label: cat.name,
                  })),
                ]}
                placeholder="Select Category"
                searchable
                clearable
                disabled={loading || blogCategory.length === 0}
                styles={{
                  input: {
                    width: "100%",
                    minWidth: "100%",
                  },
                }}
                classNames={{
                  input:
                    "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
                }}
              />
            </div>
          </Group>
        </Paper>
      )}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl text-orange-500 font-bold" style={{ color: theme.colors.brand[6] }}>
          Blogs
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-orange-500 text-orange-500 px-4 py-1 rounded-md mb-1 hover:bg-orange-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filter" : "Filters"}
          </Button>
          <Button
            color="orange"
            onClick={() => {
              setFormData({
                id: "",
                title: "",
                author_name: "",
                category: 0,
                content: "",
                published_at: "",
                is_published: false,
                tags: [],
                image: null,
                slug: "",
              });
              setAvatarPreview("");
              setValidationErrors({});
              setEditModal(true);
            }}
          >
            Add Blog
          </Button>
        </div>
      </div>
      <BreadCrumbs
        currentTitle="Blogs"
        items={[{ name: "Dashboard", href: "/dashboard" }]}
        className="hover:text-red-500 cursor-pointer py-2"
      />
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <DataTable columns={columns} data={blogs} handleEdit={handleEdit} />
      </div>
      <div className="flex mt-2 items-center justify-center">
        {totalPage >= 1 && (
          <Pagination
            value={currentPage}
            onChange={(page) => setCurrentPage(page)}
            total={totalPage}
            radius="lg"
          />
        )}
      </div>

      {/* Edit/Add Blog Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl md:max-w-2xl min-h-[78vh] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.brand[6] }}>
                {formData.id ? "Edit Blog" : "Add Blog"}
              </h2>
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="text-gray-500 mr-4 md:mr-0 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="block font-semibold">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  placeholder="Enter blog title"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full border p-2 rounded ${validationErrors.title ? "border-red-500" : ""}`}
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm">{validationErrors.title}</p>
                )}
              </div>
              <div>
                <label className="block font-semibold">
                  Blog Image <span className="text-red-500">*</span>
                </label>
                {avatarPreview && (
                  <div className="mt-2 mb-2">
                    <Avatar
                      src={avatarPreview}
                      size={120}
                      alt="Image preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                )}
                <FileInput
                  placeholder="Choose Blog Image"
                  accept="image/*"
                  leftSection={<IconUpload size={16} />}
                  onChange={handleAvatarChange}
                  clearable
                  radius="md"
                  style={{ width: "100%" }}
                  error={validationErrors.image}
                />
              </div>
              <div className="flex md:flex-row flex-col gap-6">
                <div>
                  <Select
                    label="Category"
                    placeholder="Select blog category"
                    data={blogCategory.map((cat) => ({
                      value: cat.id.toString(),
                      label: cat.name,
                    }))}
                    value={formData.category?.toString() || ""}
                    onChange={(value) => setFormData({ ...formData, category: Number(value) })}
                    searchable
                    required
                    nothingFoundMessage="No Category Available"
                    error={validationErrors.category}
                  />
                </div>
                <div>
                  <label className="block font-semibold">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter author's name"
                    value={formData.author_name || ""}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className={`w-full border p-2 rounded ${validationErrors.author_name ? "border-red-500" : ""}`}
                  />
                  {validationErrors.author_name && (
                    <p className="text-red-500 text-sm">{validationErrors.author_name}</p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold">Published Date</label>
                  <input
                    type="date"
                    value={formData.published_at ? formData.published_at.split("T")[0] : ""}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full border p-2 px-6 rounded"
                  />
                </div>
              </div>
              <div>
                <MultiSelect
                  label="Tags"
                  placeholder="Select tags"
                  data={popularTags.map((tag) => ({
                    value: tag.id.toString(),
                    label: tag.name,
                  }))}
                  value={formData.tags?.map((tagId) => String(tagId)) || []}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      tags: selected.map(Number).filter((id) => !isNaN(id)),
                    })
                  }
                  searchable
                  clearable
                  disabled={popularTags.length === 0}
                />
              </div>
              <div>
                <label className="block font-semibold">
                  Content <span className="text-red-500">*</span>
                </label>
                {/*<textarea*/}
                {/*  value={formData.content || ""}*/}
                {/*  onChange={(e) => setFormData({ ...formData, content: e.target.value })}*/}
                {/*  placeholder="Enter blog content"*/}
                {/*  className={`w-full border p-2 rounded ${validationErrors.content ? "border-red-500" : ""}`}*/}
                {/*  rows={4}*/}
                {/*/>*/}

                <Editor
                    style={{height: '200px'}}
                    value={formData.content || ""} // initial content
                    onTextChange={(e) => setFormData({ ...formData, content: e.htmlValue || ""})}
                    placeholder="Enter blog content"
                    className={`w-full p-2 rounded ${validationErrors.content ? "border-red-500" : ""}`}
                />
                {validationErrors.content && (
                    <p className="text-red-500 text-sm">{validationErrors.content}</p>
                )}
              </div>

              <div className="flex items-center cursor-pointer gap-2">
                <input
                    type="checkbox"
                    checked={formData.is_published || false}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                />
                <label>Published</label>
              </div>
              <div className="flex justify-end mr-4 md:mr-0  gap-4">
                <Button
                    type="button"
                    variant="outline"
                    style={{color: "black", backgroundColor: "white", borderColor: "gray"}}
                    onClick={() => setEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" color="orange" className="font-semibold">
                  {formData.id ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
