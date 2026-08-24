import React, { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import {Card, CardSection, Select} from '@mantine/core';
import { useRouter } from 'next/router';
import Layout from "@/components/Layout/Layout";
import { IconRepeat } from "@tabler/icons-react";
import axios from "axios";
import urls from "@/constants/urls";
import {axiosClient} from "@/utils/axiosClient";
import {useProfile} from "@/hooks/useProfile";

interface StaffInfo {
    id?: string;
    avatar: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    about: string;
    country: string;
    address1: string;
    address2: string;
    language: string;
    currency: string;
    primarySkills: string;
    primaryExperience: string;
    primaryBaseRate: string;
    secondarySkills: string;
    secondaryExperience: string;
    secondaryBaseRate: string;
    job_type?: string;
    is_active?: boolean;
    is_maintainer?: boolean;
    is_tasker?: boolean;
    profile_image?: string;
}
interface JobType {
    key: string;
    label: string;
}
interface Role {
    id: string | number;
    name: string;
}
interface RequestStatus {
    key: string;
    label: string;
}
const StaffInfoForm: React.FC = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(true); const
        [jobTypeFilter, setJobTypeFilter] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const {data: profileData} = useProfile();
    const merchantId = profileData?.user.id
    const [filterOptions, setFilterOptions] = useState<{
        roles: Role[];
        job_types: JobType[];
        request_status: RequestStatus[];
    }>({
        roles: [],
        job_types: [],
        request_status: []
    });
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM3OTEyODU5LCJpYXQiOjE3Mzc2OTY4NTksImp0aSI6Ijk3NTgxNGI5ZmEyMjRhYWY5Mzk1MWE2MmRjMWNiZjdlIiwidXNlcl9pZCI6Ijc1NWZkZWFhLWIxNzctNDM4ZS1hYjY0LWI4NTE5MzA2MGEzNiJ9.Nvy-3hRDnrmZ3Q_MXzwl6eUfINwa7gwYuV_DiL3zkAw";
    const [staffInfo, setStaffInfo] = useState<StaffInfo>({
        avatar: null,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: 'Male',
        about: "",
        country: "Nepal",
        address1: "",
        address2: "",
        language: "English",
        currency: "",
        primarySkills: "",
        primaryExperience: "",
        primaryBaseRate: "",
        secondarySkills: "",
        secondaryExperience: "",
        secondaryBaseRate: ""
    });

    useEffect(() => {
        const staffData = router.query.staffData;
        if (staffData) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(staffData as string));
                setIsEditing(!!parsedData.id);
                setStaffInfo({
                    id: parsedData.id || null,
                    avatar: parsedData.profile_image || null,
                    first_name: parsedData.user?.full_name?.split(' ')[0] || "",
                    last_name: parsedData.user?.full_name?.split(' ')[1] || "",
                    email: parsedData.user?.email || "",
                    phone: parsedData.user?.phone || "",
                    gender: parsedData.gender || 'Male',
                    about: parsedData.about || "",
                    country: parsedData.country || "Nepal",
                    address1: parsedData.address1 || "",
                    address2: parsedData.address2 || "",
                    language: parsedData.language || "English",
                    currency: parsedData.currency || "",
                    primarySkills: parsedData.primarySkills || "",
                    primaryExperience: parsedData.primaryExperience || "",
                    primaryBaseRate: parsedData.primaryBaseRate || "",
                    secondarySkills: parsedData.secondarySkills || "",
                    secondaryExperience: parsedData.secondaryExperience || "",
                    secondaryBaseRate: parsedData.secondaryBaseRate || "",
                    job_type: parsedData.job_type || "full_time",
                    is_active: parsedData.is_active || true,
                    is_maintainer: parsedData.is_maintainer || false,
                    is_tasker: parsedData.is_tasker || false
                });
                setPreviewUrl(parsedData.profile_image);
                setEditingId(parsedData.id || null);
            } catch (error) {
                console.error("Error parsing staff data:", error);
            }
        }else{
            setIsEditing(false);
            setEditingId(null);
        }
    }, [router.query]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing && editingId
                ? `${urls.addStaff.putStaff}${editingId}/`
                : `${urls.addStaff.postStaff}`;

            const method = isEditing && editingId ? 'put' : 'post';
            console.log("url",editingId)
            const requestBody = {
                email: staffInfo.email,
                first_name: staffInfo.first_name,
                last_name: staffInfo.last_name,
                phone: staffInfo.phone,
                merchant: merchantId,
                is_maintainer: staffInfo.is_maintainer || true,
                is_tasker: staffInfo.is_tasker || true,
                roles: [2],
                permissions: [3],
                job_type: staffInfo.job_type || "full_time",
                is_active: staffInfo.is_active || true,
                about: staffInfo.about,
                country: staffInfo.country,
                address1: staffInfo.address1,
                address2: staffInfo.address2,
                language: staffInfo.language,
                currency: staffInfo.currency
            };

            console.log("Merchant ID being sent:", requestBody.merchant);
            const response = await axiosClient({
                method,
                url,
                data: requestBody,
                // headers: {
                //     'Authorization': `Bearer ${token}`,
                //     'Content-Type': 'application/json'
                // }
            });

            // console.log("API Response:", response.data);
            router.push('/StaffList');
        } catch (error) {
            console.error("API Request Error:", error);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setStaffInfo({ ...staffInfo, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await axiosClient.get(`${urls.members.staffOptions}`);
                setFilterOptions(response.data);
                console.log('Filter options:', response.data);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };
        fetchFilterOptions();
    }, []);
    return (
        <Layout currentTitle="Merchant Profile / Add Staff">
            <Card>
                <CardSection className="p-6">
                    {/* Personal Information Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">General Information</h2>
                        <button
                            onClick={handleSubmit}
                            type="submit"
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 float-end"
                        >
                            Submit
                        </button>
                        <div className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex items-start gap-10">
                                <label className="w-48 text-sm font-medium">Avatar</label>
                                <div className="relative">
                                    <div
                                        className="relative w-36 h-36 rounded-full overflow-hidden bg-gray-100 cursor-pointer"
                                        onClick={handleImageClick}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Avatar Preview"
                                                 className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-gray-400"/>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleImageClick}
                                        className="absolute bottom-0 right-0 rounded-full p-2 bg-black bg-opacity-40"
                                    >
                                        <IconRepeat className="w-5 h-5"/>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setPreviewUrl(url);
                                            }
                                        }}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Personal Information Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-10">
                                    <label className="w-48 text-sm font-medium">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={staffInfo.first_name}
                                        onChange={handleInputChange}
                                        className="flex-1 p-2 border rounded"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="w-48 text-sm font-medium ps-14">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={staffInfo.last_name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                                <div className="flex items-start gap-10">
                                    <label className="w-48 text-sm font-medium pt-2">Email</label>
                                    <div className="flex-1">
                                        <input
                                            type="email"
                                            name="email"
                                            value={staffInfo.email}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <label className="w-48 text-sm font-medium">Contact</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={staffInfo.phone}
                                        onChange={handleInputChange}
                                        className="flex-1 p-2 border rounded"
                                    />
                                </div>

                                <div className="flex items-center gap-10">
                                    <label className="w-48 text-sm font-medium">Gender</label>
                                    <div className="flex gap-6">
                                        {['Male', 'Female', 'Other'].map((option) => (
                                            <label key={option} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option}
                                                    checked={staffInfo.gender === option}
                                                    onChange={handleInputChange}
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-10">
                                    <label className="w-48 text-sm font-medium pt-2">About</label>
                                    <textarea
                                        name="about"
                                        value={staffInfo.about}
                                        onChange={handleInputChange}
                                        className="flex-1 p-2 border rounded h-24"
                                        placeholder="Example: A professional gardener with over 10 years of experience..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-6">Address Information</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-10">
                                <label className="w-48 text-sm font-medium">Country</label>
                                <select
                                    name="country"
                                    value={staffInfo.country}
                                    onChange={handleInputChange}
                                    className="flex-1 p-2 border rounded"
                                >
                                    <option value="Nepal">Nepal</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-10">
                                <label className="w-48 text-sm font-medium">Address Line 1</label>
                                <input
                                    type="text"
                                    name="address1"
                                    value={staffInfo.address1}
                                    onChange={handleInputChange}
                                    className="flex-1 p-2 border rounded"
                                    placeholder="Your Address"
                                />
                            </div>

                            <div className="flex items-center gap-10">
                                <label className="w-48 text-sm font-medium">Address Line 2</label>
                                <input
                                    type="text"
                                    name="address2"
                                    value={staffInfo.address2}
                                    onChange={handleInputChange}
                                    className="flex-1 p-2 border rounded"
                                    placeholder="Optional Address"
                                />
                            </div>

                            <div className="flex items-center gap-10">
                                <label className="w-48 text-sm font-medium">Language</label>
                                <select
                                    name="language"
                                    value={staffInfo.language}
                                    onChange={handleInputChange}
                                    className="flex-1 p-2 border rounded"
                                >
                                    <option value="English">English</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-10">
                                <label className="w-48 text-sm font-medium">Currency</label>
                                <select
                                    name="currency"
                                    value={staffInfo.currency}
                                    onChange={handleInputChange}
                                    className="flex-1 p-2 border rounded"
                                >
                                    <option value="">Choose Suitable Currency</option>
                                    <option value="NPR">NPR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* assign Role and job type */}
            <div>
                <h2 className="text-lg font-semibold mb-4"> Assign Role</h2>
                <div>
                    {/* Role */}
                    <Select
                        placeholder="Staff by role"
                        data={filterOptions.roles.map((role: Role) => ({value: role.id.toString(), label: role.name}))}
                        value={roleFilter}
                        // onChange={setRoleFilter}
                        // className={classes.input}
                        radius={20}
                        clearable
                        miw={150}
                        w={"10%"}
                    />
                    <div className="flex gap-6">
                        {['Superuser', 'Admin', 'Staff', 'Tasker', 'Merchant', 'Finance', "Legal"].map((option) => (
                            <label key={option} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="roles"
                                    value={option}
                                    // checked={staffInfo.roles === option}
                                    onChange={handleInputChange}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                    <h2 className="text-lg font-semibold mb-4"> Assign job</h2>
                    {/*job type*/}
                    <Select
                        placeholder="Staff by job type"
                        data={filterOptions.job_types.map((job: JobType) => ({value: job.key, label: job.label}))}
                        value={jobTypeFilter}
                        // onChange={setJobTypeFilter}
                        // className={classes.input}
                        radius={20}
                        clearable
                        miw={150}
                        w={"10%"}
                    />
                </div>
            </div>
                    {/* Professional Information Section */}
                    {/*<div>*/}
                    {/*    <h2 className="text-lg font-semibold mb-4">Professional Information</h2>*/}
                    {/*    <div className="space-y-6">*/}
                    {/*        <div className="flex items-center gap-10">*/}
                    {/*            <label className="w-48 text-sm font-medium">Primary Skills</label>*/}
                    {/*            <input*/}
                    {/*                type="text"*/}
                    {/*                name="primarySkills"*/}
                    {/*                value={staffInfo.primarySkills}*/}
                    {/*                onChange={handleInputChange}*/}
                    {/*                className="flex-1 p-2 border rounded"*/}
                    {/*                placeholder="Your Primary Skills"*/}
                    {/*            />*/}
                    {/*        </div>*/}

                    {/*        <div className="grid grid-cols-2 gap-4">*/}
                    {/*            <div>*/}
                    {/*                <label className="block text-sm font-medium mb-2">Experience</label>*/}
                    {/*                <input*/}
                    {/*                    name="primaryExperience"*/}
                    {/*                    value={staffInfo.primaryExperience}*/}
                    {/*                    onChange={handleInputChange}*/}
                    {/*                    className="w-full p-2 border rounded"*/}
                    {/*                    placeholder="Your Experience"*/}
                    {/*                />*/}
                    {/*            </div>*/}

                    {/*            <div>*/}
                    {/*                <label className="block text-sm font-medium mb-2">Base Rate Per Hour</label>*/}
                    {/*                <input*/}
                    {/*                    name="primaryBaseRate"*/}
                    {/*                    value={staffInfo.primaryBaseRate}*/}
                    {/*                    onChange={handleInputChange}*/}
                    {/*                    className="w-full p-2 border rounded"*/}
                    {/*                    placeholder="Your Base Rate"*/}
                    {/*                />*/}
                    {/*            </div>*/}
                    {/*        </div>*/}

                    {/*        <div className="flex items-center gap-10">*/}
                    {/*            <label className="w-48 text-sm font-medium">Secondary Skills</label>*/}
                    {/*            <input*/}
                    {/*                type="text"*/}
                    {/*                name="secondarySkills"*/}
                    {/*                value={staffInfo.secondarySkills}*/}
                    {/*                onChange={handleInputChange}*/}
                    {/*                className="flex-1 p-2 border rounded"*/}
                    {/*                placeholder="Your Secondary Skills"*/}
                    {/*            />*/}
                    {/*        </div>*/}

                    {/*        <div className="grid grid-cols-2 gap-4">*/}
                    {/*            <div>*/}
                    {/*                <label className="block text-sm font-medium mb-2">Experience</label>*/}
                    {/*                <input*/}
                    {/*                    name="secondaryExperience"*/}
                    {/*                    value={staffInfo.secondaryExperience}*/}
                    {/*                    onChange={handleInputChange}*/}
                    {/*                    className="w-full p-2 border rounded"*/}
                    {/*                    placeholder="Your Experience"*/}
                    {/*                />*/}
                    {/*                </div>*/}

                    {/*                <div>*/}
                    {/*                    <label className="block text-sm font-medium mb-2">Base Rate Per Hour</label>*/}
                    {/*                    <input*/}
                    {/*                        name="secondaryBaseRate"*/}
                    {/*                        value={staffInfo.secondaryBaseRate}*/}
                    {/*                        onChange={handleInputChange}*/}
                    {/*                        className="w-full p-2 border rounded"*/}
                    {/*                        placeholder="Your Base Rate"*/}
                    {/*                    />*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    </CardSection>
                </Card>
            {/*</form>*/}
        </Layout>
    );
};

export default StaffInfoForm;
