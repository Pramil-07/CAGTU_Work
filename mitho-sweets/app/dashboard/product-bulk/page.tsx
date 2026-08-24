"use client"
import React, { useState } from "react";
import apiClient from "@/axiosConfig";
import { notifications } from "@mantine/notifications";
import { useMantineTheme } from "@mantine/core";

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const theme = useMantineTheme()
  // 🔹 Download sample file
  const importProductSampleFile = async () => {
    try {
      const res = await apiClient.get("/product-bulk/", {
        responseType: "blob",
      });

      const file = new File(
        [res.data],
        `product_sample_upload_${new Date().toLocaleDateString()}.xlsx`
      );
      const url = window.URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      setMessage("Error downloading sample file.");
    }
  };

  // 🔹 Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
    }
  };

  // 🔹 Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 🔹 Upload file to API
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await apiClient.post("/product-bulk/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
       notifications.show({
              message:" File uploaded successfully!",
              color: "red",
            });
    } catch (err) {
       notifications.show({
              message: message || "Error uploading file.",
              color: "red",
            });
      console.error(err);
      setMessage(" Error uploading file.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-2xl shadow-md w-full max-w-md mx-auto bg-white">
      <h2 className="text-xl font-semibold">Import Product File</h2>

      {/* 🔹 Download sample file button */}
      <button
        onClick={importProductSampleFile}
        className="w-full  text-white py-2 rounded-sm transition"
        style={{backgroundColor: theme.colors.brand[7]}}
      >
        Download Sample File
      </button>

      {/* 🔹 Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer ${
          file ? "border-green-400 bg-green-50" : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <p className="text-gray-600 text-sm">
          Drag and drop your CSV or Excel file here
        </p>
        <p className="text-gray-400 text-xs mt-1">or</p>

        <label className="text-gray-600 px-4 py-2 text-sm rounded cursor-pointer  transition">
          Browse File
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <p className="text-sm text-gray-700 mt-2">
          Selected File: <strong>{file.name}</strong>
        </p>
      )}

      {/* 🔹 Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full py-2 rounded-sm text-white transition ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#e62e4d] hover:bg-red-500"
        }`}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {/* 🔹 Message */}
      {message && (
        <p
          className={`text-sm mt-2 ${
            message.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Page;
