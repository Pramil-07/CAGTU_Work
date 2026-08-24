"use client";
import React, { useState } from "react";
import {Box, Button, MultiSelect, Select, useMantineTheme} from "@mantine/core";
import { CategoryStatus } from "@/components/enums/CategoryStatusForFeedback";
import apiClient from "@/axiosConfig";
import { toast } from "@/components/common/Toast";
import {useMaster} from "@/hooks/useMaster";
import BreadCrumbs from "@/components/common/BreadCrumbs";

interface feedback {
  first_name: string;
  last_name: string;
  email: string;
  description: string;
  category: string;
  file?: File;
}

export default function Contact() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [post, setPost] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    category?: string;
    description?: string;
    file?: string;
  }>({});
const theme = useMantineTheme()
  const { profiles} =useMaster();

  const categoryOptions = Object.values(CategoryStatus).map((value) => ({
    value,
    label: value,
  }));

  const validateFirstName = (value: string) => {
    if (!value || value.trim()?.length < 2) {
      return "First name is required and must be at least 2 characters.";
    }
    return undefined;
  };

  const validateLastName = (value: string) => {
    if (!value || value.trim()?.length < 2) {
      return "Last name is required and must be at least 2 characters.";
    }
    return undefined;
  };

  const validateEmail = (value: string) => {
    if (!value) {
      return "Email is required.";
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
      return "Please enter a valid email address.";
    }
    return undefined;
  };

  const validateCategory = (value: string | null) => {
    if (!value) {
      return "Please select a category.";
    }
    return undefined;
  };

  const validateDescription = (value: string) => {
    if (!value) {
      return "Description is required.";
    }
    return undefined;
  };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFile = event.target.files?.[0];
  //   if (selectedFile) {
  //     const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];
  //     const maxFileSize = 5 * 1024 * 1024; // 5MB
  //     if (!validFileTypes.includes(selectedFile.type)) {
  //       setErrors((prev) => ({
  //         ...prev,
  //         file: "Please upload a valid file type (JPEG, PNG, or PDF).",
  //       }));
  //       setFile(null);
  //       return;
  //     }
  //     if (selectedFile.size > maxFileSize) {
  //       setErrors((prev) => ({ ...prev, file: "File size exceeds 5MB limit." }));
  //       setFile(null);
  //       return;
  //     }
  //     setErrors((prev) => ({ ...prev, file: undefined }));
  //     setFile(selectedFile);
  //   } else {
  //     setErrors((prev) => ({ ...prev, file: undefined }));
  //     setFile(null);
  //   }
  // };

  const handleFeedback = async () => {
    // Reset errors
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};
    const firstNameError = validateFirstName(firstName);
    if (firstNameError) newErrors.firstName = firstNameError;
    const lastNameError = validateLastName(lastName);
    if (lastNameError) newErrors.lastName = lastNameError;
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    const categoryError = validateCategory(category);
    if (categoryError) newErrors.category = categoryError;
    const descriptionError = validateDescription(description);
    if (descriptionError) newErrors.description = descriptionError;

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("description", description);
      if (category) {
        formData.append("category", category);
      }
      if (file) {
        formData.append("file", file);
      }

      const response = await apiClient.post("/support/contact/form/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response data:", response.data);
      setPost(response.data.message);
      toast.success(response.data.message);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCategory(null);
      setDescription("");
      // setFile(null);
      setErrors({});
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  return (
      <>
        <div className=" item-center justify-center bg-white rounded-lg">
          <div className="w-full bg-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-5">
            <BreadCrumbs
                currentTitle="Contact page"
                items={[{name: "Contact", href: "/contact"}]}
            />
          </div>
          </div>
          <Box className="page-container text-gray-600 body-font relative">
            <div className="container py-24 mx-auto flex sm:flex-nowrap flex-wrap">
              <div
                  className="lg:w-2/3 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
                <iframe
                    width="100%"
                    height="100%"
                    className="absolute inset-0"
                    title="map"
                    marginHeight={0}
                    marginWidth={0}
                    src="https://maps.google.com/maps?q=-33.8886,151.1254&t=&z=15&ie=UTF8&iwloc=near&output=embed"
                    style={{filter: "contrast(1.2) opacity(0.6)"}}
                ></iframe>
                {profiles?.map((profile) => (
                    <div
                        key={profile.id}
                        style={{
                          background: theme.colors.brand[1]
                        }}
                        className="relative flex flex-wrap py-6 rounded shadow-md">
                      <div className="lg:w-1/2 px-2">

                        <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">ADDRESS:</h2>
                        <p className="mt-1">
                          {profile?.address?.country}<br/>
                          <a>
                            Mitho Sweets & Snacks,<br/>
                            {profile?.address?.street_address} {profile?.address?.suburb} {profile?.address?.postcode} {profile?.address?.state}
                            <br/>
                            ABN: 81903313582
                          </a>
                        </p>
                      </div>
                      <div className="lg:w-1/2 px-6 mt-4 lg:mt-0">
                        <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">EMAIL:</h2>
                        <a style={{
                          color: theme.colors.brand[6]
                        }}
                           className="leading-relaxed">{profile?.email}</a>
                        <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">PHONE:</h2>
                        <p className="leading-relaxed">{profile?.phone}</p>
                      </div>
                    </div>
                ))}
              </div>
              <Box
                  style={{
                    background: theme.colors.brand[1],
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                  }}
                  className="lg:w-1/3 md:w-1/2 flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0 p-5">
                <h2 className="text-gray-900 text-2xl mb-1 font-medium title-font">Feedback</h2>
                <p className="leading-relaxed mb-5 text-gray-600">
                  Please Add your Feedback Here. This helps us to provide better services and Quality Desserts.
                </p>
                <div className="flex gap-4">
                  <div className="w-1/2 relative mb-4">
                    {/*firstname*/}
                    <label htmlFor="first_name" className="leading-7 text-sm text-gray-600">First Name</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setErrors((prev) => ({...prev, firstName: validateFirstName(e.target.value)}));
                        }}
                        className={`w-full bg-white rounded border ${errors.firstName ? "border-red-500" : "border-gray-300"} focus:orangeLite-400 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  {/*lastname*/}
                  <div className="w-1/2 relative mb-4">
                    <label htmlFor="last_name" className="leading-7 text-sm text-gray-600">Last Name</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setErrors((prev) => ({...prev, lastName: validateLastName(e.target.value)}));
                        }}
                        className={`w-full bg-white rounded border ${errors.lastName ? "border-red-500" : "border-gray-300"} focus:orangeLite-400 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="w-1/2">
                    {/*email*/}
                    <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prev) => ({...prev, email: validateEmail(e.target.value)}));
                        }}
                        className={`w-full bg-white rounded border ${
                            errors.email ? "border-red-500" : "border-gray-300"
                        } focus:orangeLite-400 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-6 leading-8 transition-colors duration-200 ease-in-out`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  {/*category*/}
                  <div className="w-1/2">
                    <Select
                        label="Category"
                        placeholder="Select a category"
                        searchable
                        nothingFoundMessage="No category found"
                        data={categoryOptions}
                        value={category}
                        onChange={setCategory}
                        error={errors.category}
                        styles={{
                          input: {
                            width: '100%',
                            minWidth: '100%',
                          },
                        }}
                    />
                  </div>
                </div>


                <div className="relative mb-4">
                  <label htmlFor="message" className="leading-7 text-sm text-gray-600">Message</label>
                  <textarea
                      id="message"
                      name="message"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setErrors((prev) => ({...prev, description: validateDescription(e.target.value)}));
                      }}
                      className={`w-full bg-white rounded border ${errors.description ? "border-red-500" : "border-gray-300"} focus:orangeLite-400 focus:ring-2 focus:ring-red-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out`}
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                {/*<div className="relative mb-4">*/}
                {/*  <label htmlFor="file" className="leading-7 text-sm text-gray-600">Upload File</label>*/}
                {/*  <input*/}
                {/*      type="file"*/}
                {/*      id="file"*/}
                {/*      name="file"*/}
                {/*      onChange={handleFileChange}*/}
                {/*      className={`w-full bg-white rounded border ${errors.file ? "border-red-500" : "border-gray-300"} focus:orangeLite-400 focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}*/}
                {/*  />*/}
                {/*  {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}*/}
                {/*</div>*/}
                <Button
                    onClick={handleFeedback}
                    color={theme.colors.brand[6]}
                    className="px-4 py-2 text-white rounded-md shadow-lg bg-gray-50 transition-all text-lg font-normal tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-999"
                >
                  Submit
                </Button>
                {post && (
                    <p className="mt-3 text-green-600">
                      {post}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-3">Mitho-Sweets Sydney, Australia</p>
              </Box>
              {/* --------------------FeedBack Form end-------------------- */}
            </div>
          </Box>
        </div>
      </>
  );
}
