"use client";

import React, { useState, useEffect } from "react";
import {
  Title,
  useMantineTheme,
  Select,
  Button,
  Group,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import DataTable from "@/components/DataTable/DataTable";
import { Editor } from "primereact/editor";
import { EditorTextChangeEvent } from "primereact/editor";
import apiClient from "@/axiosConfig";

// Define interfaces for data structures
interface PolicyData {
  id: number;
  Content: string;
  type: "Privacy" | "Terms";
  status: "Pending" | "Active" | "Disabled";
  Effective_Date: string;
  created_at: string;
  updated_at: string;
  slug: string;
}

interface FormData {
  id: number | null;
  Content: string;
  type: "Privacy" | "Terms";
  status: "Pending" | "Active" | "Disabled";
  Effective_Date: string;
  slug?: string;
}

// Define interface for DataTable props
interface DataTableProps {
  columns: {
    title: string;
    dataIndex: keyof PolicyData;
    key: string;
    render?: (value: any, record: PolicyData) => React.ReactNode;
  }[];
  data: PolicyData[];
  handleEdit: (record: PolicyData) => void;
  handleDelete: (id: number) => void;
}

export default function DashboardHome() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [data, setData] = useState<PolicyData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    id: null,
    Content: "",
    type: "Privacy",
    status: "Active",
    Effective_Date: new Date().toISOString().split("T")[0],
  });
  const [selectedType, setSelectedType] = useState<"Privacy" | "Terms">("Privacy");
  const [date, setDate] = useState("");

  const typeOptions = [
    { value: "Privacy", label: "Privacy Policy" },
    { value: "Terms", label: "Terms of Condition" },
    {value: "Privacy&Terms", label: "All"}
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
    { value: "Disabled", label: "Disabled" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{data: PolicyData[]}>(`/locale/terms-and-policy/?type=${selectedType}`);
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const handleEditorChange = (e: EditorTextChangeEvent) => {
    setFormData((prev) => ({ ...prev, Content: e.htmlValue || "" }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("type", value);
  };

  const handleTypeFilterChange = (value: string | null) => {
    setSelectedType((value as "Privacy" | "Terms") || "Privacy");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
  Content: formData.Content,
  type: formData.type,
  Effective_Date: formData.Effective_Date,
  status: formData.status,
};

      console.log("payload", payload);
      if (formData.id) {
        await apiClient.put(`/locale/terms-and-policy/?type=${formData.type}/${formData.id}/`, payload);
      } else {
        console.log("payload inside api call", payload);
        await apiClient.post(`/locale/terms-and-policy/?type=${formData.type}`, payload);
      }
      fetchData();
      setOpenModal(false);
      setFormData({
        id: null,
        Content: "",
        type: selectedType,
        status: "Active",
        Effective_Date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Error saving data:", err);
    }
    setLoading(false);
  };

  const handleEdit = (record: PolicyData) => {
    console.log("effective date", record.Effective_Date)
    setFormData({
      id: record.id,
      Content: record.Content,
      type: record.type,
      status: record.status,
      Effective_Date: record.Effective_Date,
      slug: record.slug,
    });
    setOpenModal(true);
  };

  // const handleDelete = async (id: number) => {
  //   if (confirm("Are you sure you want to delete this item?")) {
  //     setLoading(true);
  //     try {
  //       await apiClient.delete(`/locale/terms-and-policy/${id}`);
  //       fetchData();
  //     } catch (err) {
  //       console.error("Error deleting data:", err);
  //     }
  //     setLoading(false);
  //   }
  // };

  const columns = [
    {
      title: "Type",
      dataIndex: "type" as keyof PolicyData,
      key: "type",
      render: (value: PolicyData["type"]) =>
        value === "Privacy" ? "Privacy Policy" : "Terms of Condition",
    },
    {
      title: "Status",
      dataIndex: "status" as keyof PolicyData,
      key: "status",
    },
    {
      title: "Effective Date",
      dataIndex: "Effective_Date" as keyof PolicyData,
      key: "Effective_Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
   {
  title: "Content",
  dataIndex: "Content" as keyof PolicyData,
  key: "Content",
  render: (value: string) => (
    <div
      dangerouslySetInnerHTML={{ __html: value }}
      className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] text-gray-700"
    />
  ),
}
,
    {
      title: "Created At",
      dataIndex: "created_at" as keyof PolicyData,
      key: "created_at",
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

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
        <h1
          className="text-2xl text-orange-500 font-bold"
          style={{ color: theme.colors.brand[6] }}
        >
          Legal
        </h1>
        <div className="flex gap-2">
          <Select
            placeholder="Select Type"
            data={typeOptions}
            value={selectedType}
            onChange={handleTypeFilterChange}
            styles={{
              input: {
                width: "150px",
                minWidth: "150px",
              },
            }}
            
          />
          <Button
            color={theme.colors.brand[6]}
            onClick={() => {
              setFormData({
                id: null,
                Content: "",
                type: selectedType,
                status: "Active",
                Effective_Date: new Date().toISOString().split("T")[0],
              });
              setOpenModal(true);
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <BreadCrumbs
        currentTitle="Legal"
        items={[{ name: "Dashboard", href: "/dashboard" }]}
        className="hover:text-red-500 cursor-pointer py-2"
      />

      <div className="bg-white mt-5 overflow-x-auto relative">
        <DataTable
          columns={columns}
          data={data}
          handleEdit={handleEdit}
          // handleDelete={handleDelete}
        />

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 max-w-80 rounded-xl shadow-lg w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <Title order={4}>
                  {formData.id ? "Edit Item" : "Add Item"}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 mb-2">
                <label className="font-medium">
                  Enter Content<span className="text-red-600">*</span>
                </label>
                <Editor
                  style={{ height: "200px" }}
                  value={formData.Content}
                  onTextChange={handleEditorChange}
                />

                <Select
                  label="Type"
                  placeholder="Select Type"
                  name="type"
                  data={typeOptions}
                  value={formData.type}
                  onChange={(value) => handleSelectChange("type", value || "Privacy")}
                  withAsterisk
                  mb="md"
                  styles={{
                    input: {
                      width: "100%",
                      minWidth: "100%",
                    },
                  }}
                />

                <Select
                  label="Status"
                  placeholder="Select Status"
                  name="status"
                  data={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleSelectChange("status", value || "Active")}
                  withAsterisk
                  mb="md"
                  styles={{
                    input: {
                      width: "100%",
                      minWidth: "100%",
                    },
                  }}
                />

             
                <label className="block mb-2">
                  Choose effective date<span className="text-red-600 ml-1">*</span>
       <input
  type="date"
  value={formData.Effective_Date}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, Effective_Date: e.target.value }))
  }
  className="border p-2 rounded ml-2"
/>

      </label>

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
                  <Button type="submit" variant="filled">
                    Save
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