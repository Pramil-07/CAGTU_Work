"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import DataTable from "@/components/DataTable/DataTable";
import apiClient from "@/axiosConfig";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import { Avatar, Button, FileInput, useMantineTheme, Switch, Tabs, Select, Paper, Group, TextInput } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { toast } from "@/components/common/Toast";
import { notifications } from "@mantine/notifications";
import { Editor } from "primereact/editor";

// Types
interface Address {
  street_address: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  status: string;
}

interface Banner {
  banner_type: "CAR" | "ANN" | "HDR" | "FTR";
  title: string;
  quotes?: string;
  category_badge?: string;
  description?: string;
  image?: File | string | null;
  header_banner_image?: File | string | null;
  footer_banner_image?: File | string | null;
  order: string;
}

interface Profile {
  id?: number;
  profile_name: string;
  phone: string;
  email: string;
  hotline_number: string;
  address: Address;
  opening_day: string;
  closing_day: string;
  opening_time: string;
  closing_time: string;
  status: string;
  profile_logo: File | string | null;
  banners: Banner[];
  created_at?: string;
  is_default: boolean;
}

interface Column {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any, record?: Profile) => JSX.Element;
}

// DataTable columns
const columns: Column[] = [
  {
    title: "Profile Name",
    dataIndex: "profile_name",
    key: "profile_name",
    render: (profile_name: string) => <span>{profile_name || "N/A"}</span>,
  },
  {
    title: "Profile Logo",
    dataIndex: "profile_logo",
    key: "profile_logo",
    render: (profile_logo: string | null) =>
      profile_logo ? (
        <Image
          alt="Profile Logo"
          src={profile_logo}
          width={35}
          height={35}
          style={{ objectFit: "contain" }}
        />
      ) : (
        <span className="text-gray-500">N/A</span>
      ),
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    render: (address: Address) => <span>{address.street_address || "N/A"}</span>,
  },
  {
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    render: (dateString: string) =>
      dateString ? (
        <span>
          {new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ) : (
        <span>N/A</span>
      ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (email: string) => <span>{email || "N/A"}</span>,
  },
  {
    title: "Profile Active",
    dataIndex: "is_default",
    key: "is_default",
    render: (is_default: boolean) => (
      is_default ? <strong>true</strong> : <span>false</span>
    ),
  },
];

// Main Component
export default function MasterProfile() {
  const theme = useMantineTheme();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileLogoPreview, setProfileLogoPreview] = useState<string>("");
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
      const [showFilters, setShowFilters] = useState(false);
      const [searchTerm, setSearchTerm] = useState("");
const [filterAddress, setFilterAddress] = useState("");
const [filterEmail, setFilterEmail] = useState("");
  const [form, setForm] = useState<Profile>({
    profile_name: "",
    phone: "",
    email: "",
    hotline_number: "",
    address: { street_address: "", suburb: "", state: "", postcode: "", country: "", status: "Active" },
    opening_day: "",
    closing_day: "",
    opening_time: "09:00",
    closing_time: "17:00",
    status: "Active",
    profile_logo: null,
    banners: [],
    is_default: false,
  });
 
  // Fetch profiles
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append("profileName", searchTerm);
            if (filterAddress) queryParams.append("address", filterAddress);
            if (filterEmail) queryParams.append("email", filterEmail);
const response = await apiClient.get(`/master/all/?${queryParams.toString()}`
//   , {
//   params: {
//     profileName: searchTerm || undefined,
//     address: filterAddress || undefined,
//     email: filterEmail || undefined,
//   },
// }
);
      setProfiles(response.data.data || []);
      console.log("profile logo list master", response.data.data)
      console.log("profile response", response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Profile Fetching Failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchProfiles();
}, [searchTerm, filterAddress, filterEmail]);

  console.log("profiles", profiles[0]);

  // Handle input changes
  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    section: "profile" | "address" | "banners",
    field: string,
    bannerIndex?: number
  ) => {
    const value = e.target.value;
    if (section === "address") {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (section === "banners" && bannerIndex !== undefined) {
      setForm((prev) => {
        const newBanners = [...prev.banners];
        newBanners[bannerIndex] = { ...newBanners[bannerIndex], [field]: value };
        return { ...prev, banners: newBanners };
      });
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle switch changes
  const handleSwitch = (
    value: boolean,
    section: "profile" | "address",
    field: "status" | "is_default"
  ) => {
    if (section === "address") {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value ? "Active" : "Inactive" },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: field === "status" ? (value ? "Active" : "Inactive") : value,
      }));
    }
  };

  // Handle file input
  const handleFile = (
    file: File | null,
    field: "profile_logo" | "image" | "header_banner_image" | "footer_banner_image",
    bannerIndex?: number
  ) => {
    if (bannerIndex !== undefined) {
      setForm((prev) => {
        const newBanners = [...prev.banners];
        newBanners[bannerIndex] = { ...newBanners[bannerIndex], [field]: file };
        return { ...prev, banners: newBanners };
      });
      setBannerPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[bannerIndex] = file ? URL.createObjectURL(file) : "";
        return newPreviews;
      });
    } else {
      setForm((prev) => ({ ...prev, profile_logo: file }));
      setProfileLogoPreview(file ? URL.createObjectURL(file) : "");
    }
  };

  // Add banner by type
  const addBanner = (type: "CAR" | "ANN" | "HDR" | "FTR") => {
    setForm((prev) => ({
      ...prev,
      banners: [
        ...prev.banners,
        {
          banner_type: type,
          title: "",
          order: "",
          ...(type === "CAR" ? { quotes: "", category_badge: "", image: null, description: "" } : {}),
          ...(type === "HDR" ? { header_banner_image: null } : {}),
          ...(type === "FTR" ? { footer_banner_image: null } : {}),
        },
      ],
    }));
    setBannerPreviews((prev) => [...prev, ""]);
  };

  // Remove banner
  const removeBanner = (index: number) => {
    setForm((prev) => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index),
    }));
    setBannerPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle edit
  const handleEdit = async (record: Profile) => {
    console.log("edit record brand", record);
    setEditingId(record.id || null);

    try {
      let profileLogoBase64 = "";
      if (typeof record.profile_logo === "string") {
        profileLogoBase64 = (await convertImageUrlToBase64(record.profile_logo)) || "";
      } else if (record.profile_logo instanceof File) {
        profileLogoBase64 = await fileToBase64(record.profile_logo);
      }
      setProfileLogoPreview(profileLogoBase64 || "");

      const newBannerPreviews = await Promise.all(
        record.banners.map(async (banner) => {
          if (banner.banner_type === "CAR" && banner.image) {
            if (typeof banner.image === "string") {
              return (await convertImageUrlToBase64(banner.image)) || "";
            } else if (banner.image instanceof File) {
              return await fileToBase64(banner.image);
            }
          } else if (banner.banner_type === "HDR" && banner.header_banner_image) {
            if (typeof banner.header_banner_image === "string") {
              return (await convertImageUrlToBase64(banner.header_banner_image)) || "";
            } else if (banner.header_banner_image instanceof File) {
              return await fileToBase64(banner.header_banner_image);
            }
          } else if (banner.banner_type === "FTR" && banner.footer_banner_image) {
            if (typeof banner.footer_banner_image === "string") {
              return (await convertImageUrlToBase64(banner.footer_banner_image)) || "";
            } else if (banner.footer_banner_image instanceof File) {
              return await fileToBase64(banner.footer_banner_image);
            }
          }
          return "";
        })
      );

      setBannerPreviews(newBannerPreviews);
      setIsModalOpen(true);

      const updatedBanners = record.banners.map((banner, index) => ({
        ...banner,
        image: banner.banner_type === "CAR" ? newBannerPreviews[index] : banner.image,
        header_banner_image: banner.banner_type === "HDR" ? newBannerPreviews[index] : banner.header_banner_image,
        footer_banner_image: banner.banner_type === "FTR" ? newBannerPreviews[index] : banner.footer_banner_image,
      }));

      setForm({
        ...record,
        profile_logo: profileLogoBase64 || record.profile_logo,
        banners: updatedBanners,
        is_default: record.is_default || false,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load profile for editing");
    }
  };

  // Handle delete
  const handleDelete = async (record: Profile) => {
    toast.confirm(`Are you sure you want to delete profile ${record.id}?`, async () => {
      try {
        await apiClient.delete(`/master/${record.id}/`);
        toast.success("Profile deleted successfully");
        fetchProfiles();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to delete profile");
      }
    });
  };

  // Convert File to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convertImageUrlToBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image URL to base64:', error);
      return null;
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!form.profile_name?.trim()) {
      newErrors.profile_name = "Profile name is required";
    }

    if (!form.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+\d{7,15}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone number format. Must start with '+' followed by 7 to 15 digits.";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.address?.postcode?.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (form.address.postcode.length > 8) {
      newErrors.postcode = "Ensure postcode field has no more than 8 characters.";
    }

    if (form.address?.status?.trim() === "Inactive") {
      newErrors.status = "Address status cannot be inactive";
    }
    if (form.status === "Inactive") {
      newErrors.email = "Profile Status cannot be inactive";
    }

    return newErrors;
  };

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        notifications.show({
          title: "Validation Error",
          message: message,
          color: "red",
        });
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const validBanners = form.banners.filter((banner) => banner.title && banner.order);

      const submitData: any = {
        profile_name: form.profile_name,
        phone: form.phone,
        email: form.email || "",
        hotline_number: form.hotline_number || "",
        address: form.address,
        opening_day: form.opening_day,
        closing_day: form.closing_day,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        status: form.status,
        is_default: form.is_default,
        banners: await Promise.all(
          validBanners.map(async (banner, index) => {
            const bannerData: any = {
              title: banner.title,
              order: banner.order.toString(),
              banner_type: banner.banner_type,
              description: banner.description,
            };

            if (banner.banner_type === "CAR") {
              if (banner.quotes) bannerData.quotes = banner.quotes;
              if (banner.description) bannerData.description = banner.description;
              if (banner.category_badge) bannerData.category_badge = banner.category_badge;
              if (banner.image instanceof File) {
                bannerData.image = await fileToBase64(banner.image);
              } else if (typeof banner.image === "string") {
                bannerData.image = banner.image;
              }
            } else if (banner.banner_type === "HDR" && banner.header_banner_image instanceof File) {
              bannerData.header_banner_image = await fileToBase64(banner.header_banner_image);
            } else if (banner.banner_type === "HDR" && typeof banner.header_banner_image === "string") {
              bannerData.header_banner_image = banner.header_banner_image;
            } else if (banner.banner_type === "FTR" && banner.footer_banner_image instanceof File) {
              bannerData.footer_banner_image = await fileToBase64(banner.footer_banner_image);
            } else if (banner.banner_type === "FTR" && typeof banner.footer_banner_image === "string") {
              bannerData.footer_banner_image = banner.footer_banner_image;
            }

            return bannerData;
          })
        ),
      };

      if (form.profile_logo instanceof File) {
        submitData.profile_logo = await fileToBase64(form.profile_logo);
      } else if (typeof form.profile_logo === "string") {
        submitData.profile_logo = form.profile_logo;
      }

      console.log("submit data", submitData);

      const response = await apiClient[editingId ? "put" : "post"](
        editingId ? `/master/${editingId}/` : "/master/",
        submitData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.Status === "success") {
        notifications.show({
          title: "Success",
          message: editingId ? "Master Profile Updated" : "Master Profile Created",
          color: "green",
        });
        fetchProfiles();
        resetForm();
        setIsModalOpen(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred";
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      profile_name: "",
      phone: "",
      email: "",
      hotline_number: "",
      address: { street_address: "", suburb: "", state: "", postcode: "", country: "", status: "Active" },
      opening_day: "",
      closing_day: "",
      opening_time: "09:00",
      closing_time: "17:00",
      status: "Active",
      profile_logo: null,
      banners: [],
      is_default: false,
    });
    setEditingId(null);
    setProfileLogoPreview("");
    setBannerPreviews([]);
  };

  // Render banner fields
  const renderBannerFields = (banner: Banner, globalIndex: number, labelIndex: number) => {
    const bannerTypeLabel = {
      CAR: "Carousel",
      ANN: "Announcement",
      HDR: "Header",
      FTR: "Footer",
    }[banner.banner_type];

    return (
      <div key={globalIndex} className="border p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">{`${bannerTypeLabel} ${labelIndex + 1}`}</span>
          <Button
            onClick={() => removeBanner(globalIndex)}
            color="red"
            variant="outline"
            size="xs"
          >
            Remove
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold w-32">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={banner.title || ""}
              onChange={(e) => handleInput(e, "banners", "title", globalIndex)}
              placeholder="Enter banner title"
              className="flex-1 border p-2 rounded"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="font-semibold w-32">Order <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={banner.order || ""}
              onChange={(e) => handleInput(e, "banners", "order", globalIndex)}
              placeholder="e.g., 1"
              className="flex-1 border p-2 rounded"
              required
            />
          </div>
          {banner.banner_type === "CAR" && (
            <>
              <div className="flex items-center gap-4">
                <label className="font-semibold w-32">Quotes</label>
                <input
                  type="text"
                  value={banner.quotes || ""}
                  onChange={(e) => handleInput(e, "banners", "quotes", globalIndex)}
                  placeholder="e.g., Great deals!"
                  className="flex-1 border p-2 rounded"
                />
              </div>
              <div className="flex items-start gap-4">
                <label className="font-semibold w-32">Product Description</label>
                <Editor
                  style={{ height: "200px" }}
                  value={banner.description || ""}
                  onTextChange={(e) =>
                    handleInput({ target: { value: e.htmlValue } } as any, "banners", "description", globalIndex)
                  }
                  placeholder="Add a Description"
                  className="flex-1 border p-2 rounded"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="font-semibold w-32">Category Badge</label>
                <input
                  type="text"
                  value={banner.category_badge || ""}
                  onChange={(e) => handleInput(e, "banners", "category_badge", globalIndex)}
                  placeholder="e.g., Feature"
                  className="flex-1 border p-2 rounded"
                />
              </div>
              <div className="flex items-start gap-4">
                <label className="font-semibold w-32">Carousel Image <span className="text-red-500">*</span></label>
                <div className="flex-1">
                  {bannerPreviews[globalIndex] && (
                    <Avatar
                      src={bannerPreviews[globalIndex]}
                      alt="Carousel Image Preview"
                      size={120}
                      className="mt-2 mb-2 object-cover rounded"
                    />
                  )}
                  <FileInput
                    placeholder="Choose Carousel Image"
                    accept="image/png,image/jpeg,image/jpg"
                    leftSection={<IconUpload size={16} />}
                    onChange={(file) => {
                      if (file && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                        toast.error("Please select a valid image file (PNG, JPEG, or JPG).");
                        return;
                      }
                      handleFile(file, "image", globalIndex);
                    }}
                    clearable
                    radius="md"
                    style={{ width: "100%", maxWidth: "300px" }}
                  />
                </div>
              </div>
            </>
          )}
          {banner.banner_type === "HDR" && (
            <div className="flex items-start gap-4">
              <label className="font-semibold w-32">Header Banner Image <span className="text-red-500">*</span></label>
              <div className="flex-1">
                {bannerPreviews[globalIndex] && (
                  <Avatar
                    src={bannerPreviews[globalIndex]}
                    alt="Header Banner Image Preview"
                    size={120}
                    className="mt-2 mb-2 object-cover rounded"
                  />
                )}
                <FileInput
                  placeholder="Choose Header Banner Image"
                  accept="image/png,image/jpeg,image/jpg"
                  leftSection={<IconUpload size={16} />}
                  onChange={(file) => {
                    if (file && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                      toast.error("Please select a valid image file (PNG, JPEG, or JPG).");
                      return;
                    }
                    handleFile(file, "header_banner_image", globalIndex);
                  }}
                  clearable
                  radius="md"
                  style={{ width: "100%", maxWidth: "300px" }}
                />
              </div>
            </div>
          )}
          {banner.banner_type === "FTR" && (
            <div className="flex items-start gap-4">
              <label className="font-semibold w-32">Footer Banner Image <span className="text-red-500">*</span></label>
              <div className="flex-1">
                {bannerPreviews[globalIndex] && (
                  <Avatar
                    src={bannerPreviews[globalIndex]}
                    alt="Footer Banner Image Preview"
                    size={120}
                    className="mt-2 mb-2 object-cover rounded"
                  />
                )}
                <FileInput
                  placeholder="Choose Footer Banner Image"
                  accept="image/png,image/jpeg,image/jpg"
                  leftSection={<IconUpload size={16} />}
                  onChange={(file) => {
                    if (file && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                      toast.error("Please select a valid image file (PNG, JPEG, or JPG).");
                      return;
                    }
                    handleFile(file, "footer_banner_image", globalIndex);
                  }}
                  clearable
                  radius="md"
                  style={{ width: "100%", maxWidth: "300px" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          setFilterAddress("");
          setFilterEmail("");
          fetchProfiles(); // Reset to fetch all profiles
        }}
      >
        Clear Filter
      </Button>
    </div>
    <Group grow>
      <div>
        <label className="block font-semibold text-gray-800 mb-2">Filter by Profile Name</label>
        <TextInput
          placeholder="Enter profile name"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.currentTarget.value);
          }}
          classNames={{
            input:
              "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
          }}
        />
      </div>
      <div>
        <label className="block font-semibold text-gray-800 mb-2">Filter by Address</label>
        <TextInput
          placeholder="Enter street address"
          value={filterAddress}
          onChange={(e) => {
            setFilterAddress(e.currentTarget.value);
          }}
          classNames={{
            input:
              "px-3 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-400",
          }}
        />
      </div>
      <div>
        <label className="block font-semibold text-gray-800 mb-2">Filter by Email</label>
        <TextInput
          placeholder="Enter email"
          value={filterEmail}
          onChange={(e) => {
            setFilterEmail(e.currentTarget.value);
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
      <div className="flex lg:justify-between gap-2 items-center mb-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.brand[6] }}>
          Master Profile
        </h1>
        <div className="flex justify-end gap-3">
 <Button
                                variant="outline"
                                className="border-orange-500 text-orange-500 px-4 py-1 rounded-md mb-1 hover:bg-orange-50"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? "Hide Filter" : " Filters"}
                            </Button>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          color="orange"
        >
          Add Profile
        </Button>
        </div>
        
      </div>
      <BreadCrumbs
        currentTitle="Master Profile"
        items={[{ name: "Dashboard", href: "/dashboard" }]}
        className="hover:text-red-500 cursor-pointer py-2"
      />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div className="items-center flex justify-center">
          <MithoSweetsLoader />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={profiles}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl md:max-w-4xl min-h-[96vh] max-h-[100vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: theme.colors.brand[6] }}>
                {editingId ? "Edit Profile" : "Add Profile"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 mr-3 md:mr-0 hover:text-gray-700"
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
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Profile Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.profile_name}
                    onChange={(e) => handleInput(e, "profile", "profile_name")}
                    placeholder="Enter profile name"
                    className="flex-1 border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleInput(e, "profile", "phone")}
                    placeholder="Enter phone number"
                    className="flex-1 border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInput(e, "profile", "email")}
                    placeholder="Enter email"
                    className="flex-1 border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Hotline Number</label>
                  <input
                    type="number"
                    value={form.hotline_number}
                    onChange={(e) => handleInput(e, "profile", "hotline_number")}
                    placeholder="Enter hotline number"
                    className="flex-1 border p-2 rounded"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Street Address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.address.street_address}
                    onChange={(e) => handleInput(e, "address", "street_address")}
                    placeholder="Enter street address"
                    className="flex-1 border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">State</label>
                  <input
                    type="text"
                    value={form.address.state}
                    onChange={(e) => handleInput(e, "address", "state")}
                    placeholder="Enter state"
                    className="flex-1 border p-2 rounded"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Country <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.address.country}
                    onChange={(e) => handleInput(e, "address", "country")}
                    placeholder="Enter country"
                    className="flex-1 border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Postcode <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.address.postcode}
                    onChange={(e) => handleInput(e, "address", "postcode")}
                    placeholder="Enter postcode"
                    className="flex-1 border p-2 rounded"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Opening Day</label>
                  <select
                    value={form.opening_day}
                    onChange={(e) => handleInput(e, "profile", "opening_day")}
                    className="flex-1 border p-2 rounded"
                  >
                    <option value="">Select Opening Day</option>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Closing Day</label>
                  <select
                    value={form.closing_day}
                    onChange={(e) => handleInput(e, "profile", "closing_day")}
                    className="flex-1 border p-2 rounded"
                  >
                    <option value="">Select Closing Day</option>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Opening Time</label>
                  <input
                    type="time"
                    value={form.opening_time}
                    onChange={(e) => handleInput(e, "profile", "opening_time")}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Closing Time</label>
                  <input
                    type="time"
                    value={form.closing_time}
                    onChange={(e) => handleInput(e, "profile", "closing_time")}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
              </div>
              <div className="flex md:justify-between md:gap-9 gap-8 md:mx-5">
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Profile Status</label>
                  <Switch
                    checked={form.status === "Active"}
                    onChange={(event) => handleSwitch(event.currentTarget.checked, "profile", "status")}
                    label={form.status === "Active" ? "Active" : "Inactive"}
                    color="red"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Address Status</label>
                  <Switch
                    checked={form.address.status === "Active"}
                    onChange={(event) => handleSwitch(event.currentTarget.checked, "address", "status")}
                    label={form.address.status === "Active" ? "Active" : "Inactive"}
                    color="red"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-semibold w-32">Profile Active?</label>
                  <Switch
                    checked={form.is_default}
                    onChange={(event) => handleSwitch(event.currentTarget.checked, "profile", "is_default")}
                    label={form.is_default ? "Yes" : "No"}
                    color="red"
                  />
                </div>
              </div>
              <div className="flex items-start gap-4">
                <label className="font-semibold w-32">Profile Logo</label>
                <div className="flex-1">
                  {profileLogoPreview && (
                    <Avatar
                      src={profileLogoPreview}
                      alt="Profile Logo Preview"
                      size={120}
                      className="mt-2 mb-2 object-cover rounded"
                    />
                  )}
                  <FileInput
                    placeholder="Choose Profile Logo"
                    accept="image/png,image/jpeg,image/jpg"
                    leftSection={<IconUpload size={16} />}
                    onChange={(file) => {
                      if (file && !["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                        toast.error("Please select a valid image file (PNG, JPEG, or JPG).");
                        return;
                      }
                      handleFile(file, "profile_logo");
                    }}
                    clearable
                    radius="md"
                    style={{ width: "100%", maxWidth: "1000px" }}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.brand[6] }}>
                  Banners
                </h3>
                <Tabs defaultValue="carousel">
                  <Tabs.List>
                    <Tabs.Tab value="carousel">Carousel</Tabs.Tab>
                    <Tabs.Tab value="announcement">Announcement</Tabs.Tab>
                    <Tabs.Tab value="header">Header</Tabs.Tab>
                    <Tabs.Tab value="footer">Footer</Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value="carousel" pt="xs">
                    <Button
                      onClick={() => addBanner("CAR")}
                      color="orange"
                      variant="outline"
                      className="my-4"
                    >
                      Add Carousel
                    </Button>
                    {form.banners.filter(banner => banner.banner_type === "CAR").map((banner, localIndex) => {
                      const globalIndex = form.banners.indexOf(banner);
                      return renderBannerFields(banner, globalIndex, localIndex);
                    })}
                  </Tabs.Panel>
                  <Tabs.Panel value="announcement" pt="xs">
                    <Button
                      onClick={() => addBanner("ANN")}
                      color="orange"
                      variant="outline"
                      className="my-4"
                    >
                      Add Announcement
                    </Button>
                    {form.banners.filter(banner => banner.banner_type === "ANN").map((banner, localIndex) => {
                      const globalIndex = form.banners.indexOf(banner);
                      return renderBannerFields(banner, globalIndex, localIndex);
                    })}
                  </Tabs.Panel>
                  <Tabs.Panel value="header" pt="xs">
                    <Button
                      onClick={() => addBanner("HDR")}
                      color="orange"
                      variant="outline"
                      className="my-4"
                    >
                      Add Header
                    </Button>
                    {form.banners.filter(banner => banner.banner_type === "HDR").map((banner, localIndex) => {
                      const globalIndex = form.banners.indexOf(banner);
                      return renderBannerFields(banner, globalIndex, localIndex);
                    })}
                  </Tabs.Panel>
                  <Tabs.Panel value="footer" pt="xs">
                    <Button
                      onClick={() => addBanner("FTR")}
                      color="orange"
                      variant="outline"
                      className="my-4"
                    >
                      Add Footer
                    </Button>
                    {form.banners.filter(banner => banner.banner_type === "FTR").map((banner, localIndex) => {
                      const globalIndex = form.banners.indexOf(banner);
                      return renderBannerFields(banner, globalIndex, localIndex);
                    })}
                  </Tabs.Panel>
                </Tabs>
              </div>
              <div className="flex justify-end gap-4 mr-4 md:mr-0">
                <Button
                  type="button"
                  variant="outline"
                  style={{ color: "black", backgroundColor: "white", borderColor: "gray" }}
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="orange"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : editingId ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
