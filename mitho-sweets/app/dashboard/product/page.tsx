"use client";
import apiClient from "@/axiosConfig";
import React, { useEffect, useRef, useState } from "react";
import { Title, Select, Button, useMantineTheme, Box, Avatar, Switch, Pagination, MultiSelect, TextInput, Paper, Group } from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { IconTrash, IconX } from '@tabler/icons-react';
import { useCategories } from "@/lib/hooks/useCategory";
import { notifications } from "@mantine/notifications";
import DataTable from "@/components/DataTable/DataTable";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import { ListField } from "@/components/common/ListField";
import { ColorPicker } from "@mantine/core";
import { Field, FieldProps } from "formik";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Editor } from "primereact/editor";
import { Tags } from "@/components/Blog";
import { toast } from "@/components/common/Toast";
import { useTags } from "@/lib/hooks/useProductTag";

type Stock = {
    sku:string;
    mrp: number | string;
    price: string;
    color: string;
    availability: boolean;
    size_unit: string;
    size: string;
    quantity: string;
    is_default: boolean;
    status: string;
};

interface Currency {
    code: string;
    name: string;
    symbol: string;
}
export interface ProductUploadData {
    id: string;
    name: string;
    price: string;
    category: string;
    description: string;
    status: boolean ;
    product_status: string | null;
    images: string[];
    meta_description: string;
    extra_data: string[];
    currency: string;
    tags: number[];
    _files?: File[];
    stocks: Stock[];
}

const columns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Price",
        dataIndex: "stock",
        key: "price",
        render: (stock: Stock) => <span>{stock ? stock.price : "0"}</span>,
    },
    {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: (category: any) => <span>{category ? category.name : "N/A"}</span>,
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
    },
    {
        title: "Product Status",
        dataIndex: "product_status",
        key: "product_status",
    },
    {
        title: "Added By",
        dataIndex: "added_by",
        key: "added_by",
    },
];

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Page() {
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const { categories, isLoading } = useCategories();
    const modalRef = useRef<HTMLDivElement>(null);
    const theme = useMantineTheme();

    const [productUploadData, setProductUploadData] = useState<ProductUploadData>({
        id: "",
        name: "",
        price: "",
        category: "",
        description: "",
        status: true,
        product_status: "",
        meta_description: "",
        tags: [],
        currency: "",
        images: [],
        extra_data: [],
        stocks: [
            {
                sku:"",
                mrp: "",
                price: "",
                color: "",
                availability: false,
                size_unit: "",
                size: "",
                quantity: "",
                is_default: true,
                status: "Active",
            },
        ],
    });

    const status = [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
    ];
    const defaultData = [
        { value: "True", label: "True" },
        { value: "False", label: "False" },
    ];
    const product_status = [
        { value: "General", label: "General" },
        { value: "Sale", label: "Sale" },
        { value: "Featured", label: "Featured" },
        { value: "Hot Deals", label: "Hot Deals" },
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [pageSize, setPageSize] = useState(1);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [popularTags, setPopularTags] = useState<Tags[] | string[]>([]);
    const { tags } = useTags();
    const [currency, setCurrency] = useState<string[]>([]);
    const [tempColor, setTempColor] = useState<string>("");

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filterName, setFilterName] = useState("");
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    useEffect(() => {
        if (tags) {
            setPopularTags(tags);
        }
    }, [tags]);

    console.log("Currency",currency)
    useEffect(()=>{
 if(tags){
        setPopularTags(tags)
    }
    },[tags])

    const [showColorPicker, setShowColorPicker] = useState<number | null>(null);

    const sizeUnitOptions = [
        { label: "Gram", value: "gm" },
        { label: "Kilogram", value: "kg" },
        { label: "Pound", value: "lb" },
        { label: "Ounce", value: "oz" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (modalRef.current?.contains(target)) {
                return;
            }
            const colorPickerElements = document.querySelectorAll(`[id^="color-"]`);
            for (const el of Array.from(colorPickerElements)) {
                if (el.contains(target)) {
                    return;
                }
            }
            setShowColorPicker(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // useEffect(() => {
    //     const fetchTags = async () => {
    //         try {
    //             const response = await apiClient.get("/product/tags/");
    //             setPopularTags(response.data);
    //             console.log("popular tags data",response.data);
    //         }catch (e){
    //             console.log("Error in tags",e);
    //         }
    //     }
    //     fetchTags();
    // }, []);

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const response = await apiClient.get("/locale/currency/options/");
                setCurrency(response.data);
            } catch (e) {
                console.log("Error in currency", e);
            }
        };
        fetchCurrency();
    }, []);

    useEffect(() => {
        setFilterName(debouncedSearchTerm);
        if (debouncedSearchTerm !== filterName) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm]);

    const listProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("page", currentPage.toString());
            if (filterName) queryParams.append("name", filterName);
            if (filterCategory) queryParams.append("category", filterCategory);
            if (filterStatus) queryParams.append("status", filterStatus);

        const response = await apiClient.get(`/product/list/?${queryParams.toString()}`);
            setTotalPage(response.data.total_pages);
            setCurrentPage(response.data.current);
            setPageSize(response.data.page_size);
            setProducts(response.data.result);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Product Fetching Failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        listProducts();
    }, [currentPage, filterName, filterCategory, filterStatus]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, files, value } = event.target;
        if (type === "file" && name === "images" && files) {
            const fileArray = Array.from(files);
            const fileNames = fileArray.map((file) => file.name);
            const urls = fileArray.map((file) => URL.createObjectURL(file));
            setProductUploadData((prev) => ({
                ...prev,
                images: fileNames,
                _files: fileArray,
            }));
            setImageUrls((prevUrls) => {
                prevUrls.forEach((url) => URL.revokeObjectURL(url));
                return urls;
            });
        } else {
            setProductUploadData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const updateStockField = (index: number, key: string, value: any) => {
        const updatedStocks = [...productUploadData.stocks];
        updatedStocks[index] = {
            ...updatedStocks[index],
            [key]: value,
        };
        setProductUploadData({
            ...productUploadData,
            stocks: updatedStocks,
        });
    };

    const handleAddStock = () => {
        const newStock = {
            mrp: "",
            price: "",
            quantity: "",
            color: "",
            size_unit: "",
            size: "",
            availability: false,
            is_default: false,
            status: "Active",
        };
        setProductUploadData((prev: any) => ({
            ...prev,
            stocks: [...prev.stocks, newStock],
        }));
    };

    const handleRemoveStock = (index: any) => {
        setProductUploadData((prev) => ({
            ...prev,
            stocks: prev.stocks.filter((_, i) => i !== index),
        }));
    };

    const handleEdit = (product: any) => {
        const stocks = Array.isArray(product.stock)
            ? product.stock.map((stock: any) => ({
                sku:stock.sku?.toString() || "",
                  mrp: stock.mrp?.toString() || "",
                  price: stock.price?.toString() || "",
                  color: stock.color || "",
                  availability: stock.availability ?? false,
                  size_unit: stock.size_unit || "",
                  size: stock.size?.toString() || "",
                  quantity: stock.quantity?.toString() || "",
                  is_default: stock.is_default ?? false,
                  status: stock.status || "",
              }))
            : product.stock
            ? [{
                sku:product.stock.sku?.toString() || "",
                  mrp: product.stock.mrp?.toString() || "",
                  price: product.stock.price?.toString() || "",
                  color: product.stock.color || "",
                  availability: product.stock.availability ?? false,
                  size_unit: product.stock.size_unit || "",
                  size: product.stock.size?.toString() || "",
                  quantity: product.stock.quantity?.toString() || "",
                  is_default: product.stock.is_default ?? false,
                  status: product.stock.status || "",
              }]
            : [];
        setProductUploadData({
            id: product.id,
            name: product.name || "",
            price: product.stock?.price?.toString() || "",
            description: product.description || "",
            category: product.category?.id.toString() || "",
            status: product.status === "Active",
            meta_description: product.meta_description || "",
            product_status: product.product_status || null,
            tags: Array.isArray(product.tags) ? product.tags.map((tag: any) => tag.name) : [],
            currency: product.currency?.code || "",
            images: product.images?.map((image: any) => image.image) || [],
            extra_data: product.extra_data || [],
            stocks: stocks,
        });
        setEditModal(true);
    };

    const handleDelete = async (row: any) => {
        const deleteId = row.id;
        toast.confirm(
            `Are you sure you want to delete product ${row.id}?`,
            async () => {
                try {
                    await apiClient.delete(`/product/${deleteId}/delete`);
                    toast.success("Product deleted successfully");
                    listProducts();
                } catch (err: any) {
                    console.error("Delete error:", err.response || err);
                    toast.error(err.response?.data?.detail || "Failed to delete product");
                }
            }
        );
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!productUploadData.name.trim()) {
            newErrors.name = "Product name is required";
        }
         if (productUploadData.name.length < 6) {
            newErrors.name = "Product name should be more than 5 characters";
        }
        if (!productUploadData.product_status) {
            newErrors.product_status = "Product status is required";
        }
        if (!productUploadData.category) {
            newErrors.category = "Product category is required";
        }
        if(!productUploadData.stocks){
        newErrors.stocks = "Fill all required stocks information";

            if(!productUploadData.status ){
                        newErrors.status = "Status inactive is not a valid choice";

            }
             if(productUploadData.images.length == 0){
                        newErrors.images = "Product Image is required";

            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
                    console.log("form data products", productUploadData)

       if (!validateForm()) {
  const errorMessages = Object.values(errors).join("\n");

  notifications.show({
    title: "Validation Error",
    message: errorMessages || "Fill all required fields", 
    color: "red",
    icon: <IconX size={16} />,
  });
  return;
}

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", productUploadData.name);
            formData.append("category", productUploadData.category);
            formData.append("description", productUploadData.description);
            formData.append("status", productUploadData.status ? "Active" : "Inactive");
            formData.append("product_status", productUploadData.product_status ?? "");
            formData.append("meta_description", productUploadData.meta_description ?? "");
            productUploadData.tags.forEach((tagId, index) => {
                formData.append(`tags`, String(Number(tagId)));
            });
            formData.append("extra_data", JSON.stringify(productUploadData.extra_data));
            formData.append("currency", productUploadData.currency);
            formData.append("stocks", JSON.stringify(productUploadData.stocks));
            if (productUploadData._files?.length) {
                productUploadData._files.forEach((file) => {
                    formData.append("images", file);
                });
            }
            const response = productUploadData.id
                ? await apiClient.put(`/product/${productUploadData.id}/update/`, formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                  })
                : await apiClient.post(`/product/`, formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                  });
            if (response.data.status === "success") {
                notifications.show({
                    title: response.data.message,
                    message: "Form submitted successfully",
                    color: "green",
                });
            }
            setEditModal(false);
            listProducts();
        } catch (err: any) {
            console.error(err.response?.data?.detail || "Product operation failed");
            setError(err.response?.data?.detail || "Product operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterName("");
        setFilterCategory(null);
        setFilterStatus(null);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen items-center flex justify-center">
                <MithoSweetsLoader />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 lg:max-w-full overflow-x-auto relative">
            {/* Filter Section */}
            {showFilters && (
                <Paper shadow="xs" p="md" withBorder className="mb-6">
                    <div className="flex justify-end items-center mb-2">
                        <Button
                            variant="outline"
                            color="gray"
                            size="xs"
                            onClick={handleClearFilters}
                        >
                            Clear Filter
                        </Button>
                    </div>
                    <Group grow>
                        <div className="">
                            <label className="block font-semibold text-gray-800 mb-2">Filter by Name</label>
                            <TextInput
                                placeholder="Enter product name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.currentTarget.value)}
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
                                data={[{ value: "", label: "All Categories" }, ...categories?.map((cat) => ({
                                    value: cat.id.toString(),
                                    label: cat.name,
                                })) || []]}
                                placeholder="Select Category"
                                searchable
                                clearable
                                disabled={isLoading}
                                  styles={{
                                    input: {
                                        width: '100%',
                                        minWidth: '100%',
                                    },
                                }}
                                classNames={{
                                    input:
                                        "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
                                }}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-800 mb-2">Filter by Status</label>
                            <Select
                                value={filterStatus}
                                onChange={(value) => {
                                    setFilterStatus(value);
                                    setCurrentPage(1);
                                }}
                                  styles={{
                                    input: {
                                        width: '100%',
                                        minWidth: '100%',
                                    },
                                }}
                                data={[{ value: "", label: "All Statuses" }, ...status]}
                                placeholder="Select Status"
                                searchable
                                clearable
                                classNames={{
                                    input:
                                        "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
                                }}
                            />
                        </div>
                    </Group>
                </Paper>
            )}
            <div className="flex gap-2 justify-between">
                
                <h1 className="text-2xl text-orange-500 font-bold mb-3" style={{ color: theme.colors.brand[6] }}>
                    Products
                </h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-orange-500 text-orange-500 px-4 py-1 rounded-md mb-1 hover:bg-orange-50"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? "Hide Filter" : " Filters"}
                    </Button>
                    <Button
                        className="bg-orange-500 text-white px-4 py-1 rounded-md mb-1"
                        onClick={() => {
                            setEditModal(true);
                            setProductUploadData({
                                id: "",
                                name: "",
                                price: "",
                                category: "",
                                description: "",
                                status: true,
                                product_status: "",
                                meta_description: "",
                                tags: [],
                                images: [],
                                currency: "",
                                extra_data: [],
                                stocks: [
                                    {
                                        sku:"",
                                        mrp: "",
                                        price: "",
                                        color: "",
                                        availability: false,
                                        size_unit: "",
                                        size: "",
                                        quantity: "",
                                        is_default: true,
                                        status: "Active",
                                    },
                                ],
                            });
                        }}
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            <BreadCrumbs
                currentTitle="Products"
                items={[{ name: "Dashboard", href: "/dashboard" }]}
                className="hover:text-red-500 cursor-pointer py-2"
            />

            

            {error && <p className="text-red-500">{error}</p>}
            <DataTable columns={columns} data={products} handleDelete={handleDelete} handleEdit={handleEdit} />

            <div className="flex mt-2 items-center justify-center">
                {totalPage >= 1 && (
                    <Pagination
                        value={currentPage}
                        onChange={setCurrentPage}
                        total={totalPage}
                        radius="lg"
                    />
                )}
            </div>

            {editModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={modalRef} className="bg-white md:p-8 p-6 mx-1 shadow-lg border max-w-8xl w-full max-h-[100vh] overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-between items-center">
                                <Title order={2} className="text-3xl font-bold" style={{ color: theme.colors.brand[6] }}>
                                    {productUploadData.id ? "Edit Product" : "Add Product"}
                                </Title>
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    className="text-gray-500 mr-5 md:mr-0 hover:text-gray-700"
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

                            <div className="text-md">
                                {productUploadData.id
                                    ? "Edit the product details below"
                                    : "Fill in the form below to add a new product to your catalog."}
                            </div>

                            <div className="grid gap-6 p-6 bg-white rounded-xl">
                                <div>
                                    <label className="block font-semibold text-gray-800 mb-2">
                                        Product Name<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter Product's Name"
                                        className="w-full border border-gray-300 rounded-md p-2  focus:outline-none focus:ring-2 focus:ring-orange-400 "
                                        value={productUploadData.name}
                                        onChange={(e) =>
                                            setProductUploadData({...productUploadData, name: e.target.value})
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div >
                                        <label className="block font-semibold text-gray-800 mb-2">
                                            Product Category<span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={productUploadData.category}
                                            onChange={(value) =>
                                                setProductUploadData({ ...productUploadData, category: value ?? "" })
                                            }
                                            data={categories?.map((cat) => ({
                                                value: cat.id.toString(),
                                                label: cat.name,
                                            })) || []}
                                            placeholder="Select Category"
                                            searchable
                                            disabled={isLoading}
                                             styles={{
                          input: {
                            width: '100%',
                            minWidth: '100%',
                          },
                        }}
                                            classNames={{
                                                input:
                                                    "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <label className="block font-semibold text-gray-800 mb-2">
                                            Product Status<span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={productUploadData.product_status}
                                            onChange={(value) =>
                                                setProductUploadData({ ...productUploadData, product_status: value })
                                            }
                                            data={product_status}
                                            placeholder="Add Product Status"
                                            searchable
                                            disabled={isLoading}
                                             styles={{
                          input: {
                            width: '100%',
                            minWidth: '100%',
                          },
                        }}
                                            classNames={{
                                                input:
                                                    "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <label className="block font-semibold text-gray-800 mb-2">
                                            Select Currency
                                        </label>
                                        <Select
                                            data={currency?.map((item: any) => ({
                                                value: item.code,
                                                label: `${item.symbol} - ${item.name}`,
                                            })) || []}
                                            value={productUploadData.currency}
                                            onChange={(selected) =>
                                                setProductUploadData({ ...productUploadData, currency: selected || "" })
                                            }
                                            placeholder="Select currency"
                                            searchable
                                            clearable
                                            styles={{
                                                input: {
                                                    width: '100%',
                                                    minWidth: '100%',
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-800 mb-2">
                                        Product Description
                                    </label>
                                    <Editor
                                        style={{ height: '200px' }}
                                        value={productUploadData.description}
                                        onTextChange={(e) => {
                                            setProductUploadData({
                                                ...productUploadData,
                                                description: e.htmlValue || '',
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-800 mb-2">
                                        Meta Description
                                    </label>
                                    <Editor
                                        style={{height: "200px"}}
                                        value={productUploadData.meta_description}
                                        onTextChange={(e) => {
                                            const text = e.htmlValue || "";
                                            const plainText = text.replace(/<[^>]+>/g, ""); // remove HTML
                                            const words = plainText.trim().split(/\s+/).filter(Boolean);

                                            const limitedText = words.slice(0, 35).join(" ");

                                            setProductUploadData({
                                                ...productUploadData,
                                                meta_description: limitedText,
                                            });
                                        }}
                                    />

                                    <p className="text-sm text-gray-500 mt-1">
                                        {
                                            productUploadData.meta_description
                                                .replace(/<[^>]+>/g, "")
                                                .trim()
                                                .split(/\s+/)
                                                .filter(Boolean).length
                                        }
                                        / 35 words will only be posted
                                    </p>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-800 mb-2">
                                        Tags
                                    </label>
                                    <MultiSelect
                                        data={popularTags.map((tag: any) => ({
                                            value: tag.id.toString(),
                                            label: tag.name,
                                        }))}
                                        value={productUploadData.tags.map((tagId) => String(tagId))}
                                        onChange={(selected) =>
                                            setProductUploadData({
                                                ...productUploadData,
                                                tags: selected.map(Number).filter((id) => !isNaN(id)),
                                            })
                                        }
                                        placeholder="Select tags"
                                        searchable
                                        clearable
                                        disabled={popularTags.length === 0}
                                    />
                                </div>
                                <div>
                                    <ListField
                                        id="extra_data"
                                        name="extra_data"
                                        initialLists={productUploadData.extra_data}
                                        onListChange={(lists) =>
                                            setProductUploadData({ ...productUploadData, extra_data: lists })
                                        }
                                        error={errors.extra_data as string}
                                        labelName="Key Features"
                                        withAsterisk
                                    />
                                </div>
                                <div className="cursor-pointer">
                                    <label className="block font-semibold text-gray-800 mb-2">Product Images<span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        name="images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                                    />
                                    {productUploadData.images.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm font-semibold">Selected Images:</p>
                                            <ul className="flex gap-3 pl-5">
                                                {productUploadData.id
                                                    ? productUploadData.images.map((name, index) => (
                                                          <li key={index} className="text-sm text-gray-600">
                                                              <Avatar
                                                                  src={name || "404"}
                                                                  alt={`Product Image ${index + 1}`}
                                                                  size="xl"
                                                                  radius="xl"
                                                                  className="w-24 h-24 flex-shrink-0 object-cover"
                                                              />
                                                          </li>
                                                      ))
                                                    : imageUrls.map((url, index) => (
                                                          <li key={index} className="text-sm text-gray-600">
                                                              <Avatar
                                                                  src={url || "404"}
                                                                  alt={`Uploaded Image ${index + 1}`}
                                                                  size="xl"
                                                                  radius="xl"
                                                                  className="w-24 h-24 flex-shrink-0 object-cover"
                                                              />
                                                          </li>
                                                      ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="">
                                    {productUploadData.stocks.length > 0 && (
                                        <h1 className="font-semibold text-black">Add details for product variants</h1>
                                    )}
                                  <div className="space-y-6">
  {productUploadData.stocks.map((stock, i) => (
    <div key={i} className="p-6 border rounded-lg shadow-sm bg-white">
      <div className="grid md:grid-cols-8 gap-4 text-black">
        <div className="flex items-center">
    <label htmlFor={`sku-${i}`} className=" font-medium text-sm">SKU<span className="text-red-500">*</span></label>
    <input
      id={`sku-${i}`}
      type="text"
      value={stock.sku}
      placeholder="Enter SKU"
      onChange={(e) => updateStockField(i, "sku", e.target.value)}
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
  {/* MRP */}
  <div className="flex items-center ">
    <label htmlFor={`mrp-${i}`} className=" font-medium text-sm">MRP<span className="text-red-500">*</span></label>
    <input
      id={`mrp-${i}`}
      type="number"
      value={stock.mrp}
      placeholder="Enter MRP"
      onChange={(e) => updateStockField(i, "mrp", e.target.value)}
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>

  {/* Selling Price */}
  <div className="flex items-center">
    <label htmlFor={`price-${i}`} className=" font-medium text-sm">SP<span className="text-red-500">*</span></label>
    <input
      id={`price-${i}`}
      type="number"
      value={stock.price}
      placeholder="Enter Price"
      onChange={(e) => updateStockField(i, "price", e.target.value)}
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>

  {/* Quantity */}
  <div className="flex items-center ">
    <label htmlFor={`quantity-${i}`} className="w-24 font-medium text-sm">Quantity</label>
    <input
      id={`quantity-${i}`}
      type="number"
      value={stock.quantity}
      placeholder="Enter Quantity"
      onChange={(e) => updateStockField(i, "quantity", e.target.value)}
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>

  {/* Color */}
  <div className="flex items-center  relative">
    <label htmlFor={`color-${i}`} className="w-18 font-medium text-sm">Color</label>
    <input
      id={`color-${i}`}
      type="text"
      value={stock.color || ""}
      onChange={(e) => updateStockField(i, "color", e.target.value)}
      onClick={(e) => { e.stopPropagation(); setShowColorPicker(i); }}
      placeholder="Click to select color"
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
      style={{ backgroundColor: stock.color || "transparent" }}
    />
    {showColorPicker === i && (
      <div
        className="absolute z-20 w-60 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-2"
        style={{ top: "100%", left: "6rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <ColorPicker
          value={stock.color || "#000000"}
          onChange={(value) => setTempColor(value)}
          format="hex"
          className="w-full"
        />
        <div className="flex justify-between mt-2 gap-2">
          <Button
            color="green"
            size="xs"
            onClick={() => {
              updateStockField(i, "color", tempColor);
              setShowColorPicker(null);
            }}
          >
            Confirm
          </Button>
          <Button size="xs" onClick={() => setShowColorPicker(null)}>
            Cancel
          </Button>
        </div>
      </div>
    )}
  </div>

  {/* Size Unit */}
  <div className="flex items-center ">
    <label htmlFor={`size_unit-${i}`} className="w-24 font-medium text-sm">Size Unit</label>
    <select
      id={`size_unit-${i}`}
      value={stock.size_unit}
      onChange={(e) => updateStockField(i, "size_unit", e.target.value)}
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      {sizeUnitOptions.map((unit) => (
        <option key={unit.value} value={unit.value}>{unit.label}</option>
      ))}
    </select>
  </div>

  {/* Size */}
  <div className="flex items-center">
    <label htmlFor={`size-${i}`} className=" font-medium text-sm">Size<span className="text-red-500">*</span></label>
    <input
      id={`size-${i}`}
      type="number"
      value={stock.size}
      placeholder="Enter Size"
      onChange={(e) => updateStockField(i, "size", e.target.value)}
      className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>

  {/* Default */}
  <div className="flex items-center ">
    {/* <label htmlFor={`is_default-${i}`} className="w-24 font-medium text-sm">Default</label> */}
    {/* <Select
      id={`is_default-${i}`}
      value={stock.is_default}
      onChange={(selected) => updateStockField(i, "is_default", selected)}
      data={defaultData}
      placeholder="Default"
      searchable
      disabled={isLoading}
      className="w-full"
      styles={{ input: { width: "100%", minWidth: "100%" } }}
    /> */}
     <Switch
                                            label="Default"
                                            size="md"
                                                  id={`is_default-${i}`}

                                            checked={stock.is_default}
                                                  onChange={(selected) => updateStockField(i, "is_default", selected)}

                                        />
                                          {productUploadData.stocks.length > 1 && (
        <div className="flex justify-end ml-3">
          <p 
            onClick={() => handleRemoveStock(i)}
            className="cursor-pointer text-red-600"
          >
            <IconTrash/>
          </p>
        </div>
      )}
  </div>
  
</div>

      {/* Remove button */}
    
    </div>
  ))}
</div>

                                    <Button mt="7"
                                        color="orange"
                                        type="button"
                                        onClick={handleAddStock}
                                        className="px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                                    >
                                        Add product variant
                                    </Button>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex justify-start items-center gap-3 font-medium">
                                       
                                        <Switch
                                            label="Status"
                                            size="md"
                                            checked={productUploadData.status}
                                            onChange={(event) =>
                                                setProductUploadData({
                                                    ...productUploadData,
                                                    status: event.currentTarget.checked,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-end gap-4 md:items-center">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            color="orange"
                                            className="px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                            {loading
                                                ? productUploadData.id
                                                    ? "Updating Product"
                                                    : "Adding Product"
                                                : productUploadData.id
                                                ? "Update Product"
                                                : "Add Product"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            style={{
                                                color: "black",
                                                backgroundColor: "white",
                                                borderColor: "gray",
                                            }}
                                            onClick={() => setEditModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}