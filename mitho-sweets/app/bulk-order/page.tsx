"use client";
import { useEffect, useState } from "react";
import { MultiSelect, Button, useMantineTheme } from "@mantine/core";
import apiClient from "@/axiosConfig";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/lib/AuthContext";
import  { useRouter } from "next/navigation";

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

export default function BulkOrderForm() {
  const theme = useMantineTheme();
  const [editModal, setEditModal] = useState(false);
      const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const [sweetsList, setSweetsList] = useState<{ label: string; value: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    listProducts();
  }, []);
  
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login"); 
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null; 

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
    if (!formData.products || formData.products?.length === 0) {
      newErrors.products = "Please select at least one product";
    }
    const boxes = formData.products?.every((sweetId) => {
      const productName = sweetsList.find((s) => s.value === sweetId)?.label || "";
      return formData.extra_data?.[`${productName}_boxes`];
    });
    const itemsPerBox = formData.products?.every((sweetId) => {
      const productName = sweetsList.find((s) => s.value === sweetId)?.label || "";
      return formData.extra_data?.[`${productName}_items_per_box`];
    });
    if (!boxes || !itemsPerBox) {
      newErrors.quantity = "Please provide both boxes and items per box for all selected products";
    } else if (
      formData.products?.some((sweetId) => {
        const productName = sweetsList.find((s) => s.value === sweetId)?.label || "";
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
    return Object.keys(newErrors)?.length === 0;
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
        products: formData.products,
        extra_data: formData.extra_data,
      };

      await apiClient.post("/product/bulk/", payload);
      notifications.show({
        title: "Order Created",
        message: "Bulk order created successfully",
        color: "green",
      });
      setEditModal(false);
      setFormData({ ...initialFormData });
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

  return (
    <>
     
        <div className="m-8 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl  flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.brand[6] }}>
                Add Bulk Order
              </h2>
            
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Your Sweets</h3>
                <MultiSelect
                  label="Choose from our delicious options"
                  placeholder="Pick sweets"
                  nothingFoundMessage="Nothing Found"
                  value={formData.products || []}
                  required
                  onChange={(selected: string[]) => {
                    const newExtraData = selected.reduce((acc, sweetId) => {
                      const product = sweetsList.find((s) => s.value === sweetId);
                      const productName = product?.label || "";
                      return {
                        ...acc,
                        [`${productName}_boxes`]: formData.extra_data?.[`${productName}_boxes`] || "",
                        [`${productName}_items_per_box`]: formData.extra_data?.[`${productName}_items_per_box`] || "",
                      };
                    }, {});
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

              {formData.products && formData.products?.length > 0 && (
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity Details for Order</h3>
                  <div className="space-y-4">
                    {formData.products.map((sweetId, index) => {
                      const productName = sweetsList.find((s) => s.value === sweetId)?.label || `Product ${index + 1}`;
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
                  type="submit"
                  color="orange"
                  className="font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      
    </>
  );
}