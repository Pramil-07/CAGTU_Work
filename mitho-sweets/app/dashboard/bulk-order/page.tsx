"use client";
import React, { useEffect, useState } from "react";
import {MultiSelect, Button, useMantineTheme, Pagination} from "@mantine/core";
import apiClient from "@/axiosConfig";
import DataTable from "@/components/DataTable/DataTable";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { notifications } from "@mantine/notifications";
import { User, Building2, Phone, Mail, MapPin, MessageSquare, Star, Candy  } from "lucide-react";

interface BulkOrder {
  id: string;
  name: string;
  company: string;
  contact_no: string;
  contact_email: string;
  address: string;
  description: string;
  products: string[];
  extra_data: Record<string, string>;
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useMantineTheme();
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewFormData, setViewFormData] = useState<Partial<BulkOrder>>({});
  const [sweetsList, setSweetsList] = useState<{ label: string; value: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [totalPage , setTotalPage] =useState(1)
  const [currentPage , setCurrentPage] =useState(1)
  const [submitting, setSubmitting] = useState(false);

  const initialFormData: Partial<BulkOrder> = {
    id: "",
    name: "",
    company: "",
    contact_no: "",
    contact_email: "",
    address: "",
    description: "",
    products: [],
    extra_data: {},
  };
  const [formData, setFormData] = useState<Partial<BulkOrder>>({ ...initialFormData });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span>{name ? name : "N/A"}</span>,
    },
    {
      title: "Company Name",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Contact Number",
      dataIndex: "contact_no",
      key: "contact_no",
    },
    {
      title: "Contact Email",
      dataIndex: "contact_email",
      key: "contact_email",
    },
    {
      title: "Orders",
      dataIndex: "extra_data",
      key: "extra_data",
      render: (extra_data: Record<string, string>) => (
        <span>
          {extra_data
            ? Object.entries(extra_data)
                .filter(([key]) => key.endsWith("_boxes"))
                .map(([key, value]) => {
                  const productName = key.replace("_boxes", "");
                  const itemsPerBox = extra_data[`${productName}_items_per_box`];
                  return `${productName}: ${value} boxes (${itemsPerBox || "N/A"} items per box)`;
                })
                .join(", ")
            : "N/A"}
        </span>
      ),
    },
  ];
  const customerDetails = [
    {
      icon: User,
      label: "Name",
      value: viewFormData.name || "N/A",
      color: "text-primary",
    },
    {
      icon: Building2,
      label: "Company/Shop",
      value: viewFormData.company || "N/A",
      color: "text-accent",
    },
    {
      icon: Phone,
      label: "Phone",
      value: viewFormData.contact_no || "N/A",
      color: "text-primary",
    },
    {
      icon: Mail,
      label: "Email",
      value: viewFormData.contact_email || "N/A",
      color: "text-accent",
    },
    {
      icon: MapPin,
      label: "Location",
      value: viewFormData.address || "N/A",
      color: "text-primary",
      isMultiline: true,
    },
    {
      icon: MessageSquare,
      label: "Comments",
      value: viewFormData.description || "N/A",
      color: "text-accent",
      isMultiline: true,
    },
  ]

  const listBulkOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/product/bulk");
      const normalizedOrders = response.data.result.map((order: BulkOrder) => ({
        ...order,
        products: order.products.map(String),
      }));
      setBulkOrders(response.data.result);
      setTotalPage(response.data.total_pages);
      setCurrentPage(response.data.current);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Bulk Order Fetching Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (row: BulkOrder) => {
    setViewModal(true);
    setViewFormData(row);
  };

  const handleEdit = (row: BulkOrder) => {
    console.log("edit bulk order", row)
    // Map product IDs to sweetsList labels to ensure correct extra_data keys
    const normalizedExtraData = { ...row.extra_data };
    const products = row.products.map(String);
    
    // Ensure extra_data keys match sweetsList labels
    const updatedExtraData: Record<string, string> = {};
    products.forEach((productId) => {
      const product = sweetsList.find((s) => s.value === productId);
      const productName = product?.label || `Product_${productId}`;
      updatedExtraData[`${productName}_boxes`] = row.extra_data[`${productName}_boxes`] || "";
      updatedExtraData[`${productName}_items_per_box`] = row.extra_data[`${productName}_items_per_box`] || "";
    });

    setFormData({
      id: row.id,
      name: row.name,
      company: row.company,
      contact_no: row.contact_no,
      contact_email: row.contact_email,
      address: row.address,
      description: row.description,
      products: products,
      extra_data: updatedExtraData,
    });
    setEditModal(true);
  };

  const listProducts = async () => {
    setLoadingProducts(true);
    const fallbackSweetsList = [
      { label: "Default Sweet 1", value: "1" },
      { label: "Default Sweet 2", value: "2" },
      { label: "Default Sweet 3", value: "3" },
    ];
    try {
      const response = await apiClient.get("/product/list/");
      const productList = response.data.result;
      const formattedSweetsList = productList?.length
        ? productList.map((product: any) => ({
            label: product.name,
            value: String(product.id),
          }))
        : fallbackSweetsList;
      setSweetsList(formattedSweetsList);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Product Fetching Failed");
      setSweetsList(fallbackSweetsList);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    listBulkOrders();
    listProducts();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.address) {
      newErrors.address = "Address is required";
    }
    if (!formData.contact_no) {
      newErrors.contact_no = "Contact Number is required";
    }
    if (!formData.contact_email) {
      newErrors.contact_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.products || formData.products.length === 0) {
      newErrors.products = "Please select at least one product";
    }
    const boxes = formData.products?.every((sweetId) => {
      const productName = sweetsList.find((s) => s.value === String(sweetId))?.label || "";
      return formData.extra_data?.[`${productName}_boxes`];
    });
    const itemsPerBox = formData.products?.every((sweetId) => {
      const productName = sweetsList.find((s) => s.value === String(sweetId))?.label || "";
      return formData.extra_data?.[`${productName}_items_per_box`];
    });
    if (!boxes || !itemsPerBox) {
      newErrors.quantity = "Please provide both boxes and items per box for all selected products";
    } else if (
      formData.products?.some((sweetId) => {
        const productName = sweetsList.find((s) => s.value === String(sweetId))?.label || "";
        const boxes = formData.extra_data?.[`${productName}_boxes`];
        const items = formData.extra_data?.[`${productName}_items_per_box`];
        return (
          !boxes ||
          !items ||
          isNaN(Number(boxes)) ||
          isNaN(Number(items)) ||
          Number(boxes) <= 0 ||
          Number(items) <= 0
        );
      })
    ) {
      newErrors.quantity = "All quantities must be valid positive numbers";
    }
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!validateForm()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill all the required fields",
        color: "red",
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        company: formData.company,
        contact_no: formData.contact_no,
        contact_email: formData.contact_email,
        address: formData.address,
        description: formData.description,
        products: formData.products?.map(String),
        extra_data: formData.extra_data,
      };

      if (formData.id) {
        await apiClient.put(`/product/bulk/${formData.id}`, payload);
        notifications.show({
          title: "Order Updated",
          message: "Bulk order updated successfully",
          color: "green",
        });
      } else {
        await apiClient.post("/product/bulk/", payload);
        notifications.show({
          title: "Order Created",
          message: "Bulk order created successfully",
          color: "green",
        });
      }
      setEditModal(false);
      setFormData({ ...initialFormData });
      listBulkOrders();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Submission failed");
      notifications.show({
        title: "Submission Error",
        message: err.response?.data?.detail || "Submission failed",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
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
        <div className="flex justify-between mb-4">
        <h1 className="text-2xl text-orange-500 font-bold" style={{ color: theme.colors.brand[6] }}>
          Bulk Orders
        </h1>
        <Button
          color="orange"
          onClick={() => {
            setFormData({ ...initialFormData });
            setEditModal(true);
          }}
        >
          Add Bulk Order
        </Button>
      </div>
      <BreadCrumbs
        currentTitle="Bulk Orders"
        items={[{ name: "Dashboard", href: "/dashboard" }]}
        className="hover:text-red-500 cursor-pointer py-2"
      />
      {error && <p className="text-red-600">{error}</p>}
      <DataTable columns={columns} data={bulkOrders} handleView={handleView}
      //  handleEdit={handleEdit}
       />
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
      {/* Add/Edit Bulk Order Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-10 md:p-8  rounded-xl shadow-lg w-full max-w-3xl md:max-w-4xl min-h-[96vh] max-h-[100vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.brand[6] }}>
                {formData.id ? "Edit Bulk Order" : "Add Bulk Order"}
              </h2>
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
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
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Your Sweets</h3>
                <MultiSelect
                  label="Choose from our delicious options"
                  placeholder="Pick sweets"
                  nothingFoundMessage="Nothing Found"
                  value={formData.products?.map(String) || []}
                  required
                  onChange={(selected: string[]) => {
                    // Preserve existing quantities for unchanged products
                    const newExtraData: Record<string, string> = {};
                    selected.forEach((sweetId) => {
                      const product = sweetsList.find((s) => s.value === String(sweetId));
                      const productName = product?.label || `Product_${sweetId}`;
                      newExtraData[`${productName}_boxes`] =
                        formData.extra_data?.[`${productName}_boxes`] || "";
                      newExtraData[`${productName}_items_per_box`] =
                        formData.extra_data?.[`${productName}_items_per_box`] || "";
                    });
                    setFormData({
                      ...formData,
                      products: selected,
                      extra_data: newExtraData,
                    });
                  }}
                  data={sweetsList}
                  searchable
                  classNames={{
                    label: "text-sm font-medium mb-1 text-gray-700",
                    input: "rounded-lg border-gray-300 focus:ring-orange-400",
                  }}
                />
              </div>

              {formData.products && formData.products.length > 0 && (
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity Details for Order</h3>
                  <div className="space-y-4">
                    {formData.products.map((sweetId, index) => {
                      const productName = sweetsList.find((s) => s.value === String(sweetId))?.label || `Product ${index + 1}`;
                      return (
                        <div
                          key={sweetId}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                              {productName} Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.extra_data?.[`${productName}_boxes`] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  extra_data: {
                                    ...formData.extra_data,
                                    [`${productName}_boxes`]: e.target.value,
                                  },
                                })
                              }
                              placeholder="Enter boxes"
                              className="w-full px-3.5 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors duration-200 placeholder-gray-400"
                            />
                          </div>
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                              Items per Box
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.extra_data?.[`${productName}_items_per_box`] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  extra_data: {
                                    ...formData.extra_data,
                                    [`${productName}_items_per_box`]: e.target.value,
                                  },
                                })
                              }
                              placeholder="Enter items per box"
                              className="w-full px-3.5 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors duration-200 placeholder-gray-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full p-2 border rounded-md focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Company/Shop Name</label>
                    <input
                      type="text"
                      value={formData.company || ""}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company or shop name"
                      className="w-full p-2 border rounded-md focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_no || ""}
                      onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                      placeholder="Phone number"
                      className="w-full p-2 border rounded-md focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email || ""}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="Email address"
                      className="w-full p-2 border rounded-md focus:ring-orange-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Delivery location"
                      className="w-full p-2 border rounded-md focus:ring-orange-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-medium text-gray-700 mb-1">Comments</label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add your notes or requests"
                      rows={4}
                      className="w-full p-2 border rounded-md focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  style={{ color: "black", backgroundColor: "white", borderColor: "gray" }}
                  onClick={() => setEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="orange"
                  className="font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : formData.id ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.brand[6] }}>
                View Bulk Order
              </h2>
              <button
                type="button"
                onClick={() => setViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <div className="space-y-6">
               <div className="bg-card rounded-xl  border border-border/50 overflow-hidden  ">
      {/* Header with gradient background */}
      <div className="bg-red-600 px-6 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold text-primary-foreground">Customer Details</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {customerDetails.map((detail, index) => {
    const IconComponent = detail.icon
    return (
      <div
        key={index}
        className="group bg-muted/30 rounded-lg p-4 border border-border/30 transition-all duration-200 hover:bg-muted/50 hover:border-border/60 hover:shadow-sm"
      >
        <div className={`flex ${detail.isMultiline ? "items-start" : "items-center"} gap-4`}>
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-${detail.color.replace("text-", "")}/10 to-${detail.color.replace("text-", "")}/20 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
          >
            <IconComponent className={`w-5 h-5 ${detail.color} transition-colors duration-200`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">{detail.label}</p>
            <p
              className={`font-semibold text-card-foreground break-words ${detail.isMultiline ? "leading-relaxed" : ""}`}
            >
              {detail.value}
            </p>
          </div>
        </div>
      </div>
    )
  })}
</div>

        {/* Action buttons */}
       
      </div>
    </div>
             <div className="border  rounded-t-xl">
  <div className="bg-red-600 px-4 py-2 rounded-t-xl">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
        <Candy className="w-5 h-5 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-bold text-primary-foreground">Ordered Sweets</h3>
    </div>
  </div>
  {viewFormData.extra_data && Object.keys(viewFormData.extra_data).length > 0 ? (
    <div className="border-x border-gray-200 bg-white">
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-800 border-b border-gray-200">
        <span>Product</span>
        <span>Boxes</span>
        <span>Items/Box</span>
      </div>
      {Object.entries(viewFormData.extra_data)
        .filter(([key]) => key.endsWith("_boxes"))
        .map(([key], index) => {
          const productName = key.replace("_boxes", "");
          const boxes = viewFormData.extra_data?.[`${productName}_boxes`];
          const itemsPerBox = viewFormData.extra_data?.[`${productName}_items_per_box`];
          return (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 p-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="font-medium">{productName}</span>
              <span>{boxes || "N/A"}</span>
              <span>{itemsPerBox || "N/A"}</span>
            </div>
          );
        })}
    </div>
  ) : (
    <p className="text-gray-500 text-sm italic mt-2 px-4 pb-4">No products selected</p>
  )}
</div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
