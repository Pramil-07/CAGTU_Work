"use client";

import React, { useState } from "react";
import Image from "next/image";
import apiClient from "../../axiosConfig";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Center, Flex } from "@mantine/core";
import { toast } from "react-toastify";
import Google from "@/components/GoogleAuth/Google";
import GoogleLogo from "@/public/svgs/GoogleLogo";
import MithoSweetsLoader from "../../components/Loader/MithoSweetsLoader";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import logo from "@/images/logo-bg.png"

interface FormData {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone: string;
}

interface Field {
    name: keyof FormData;
    label: string;
    type: "text" | "email" | "password";
}

const SignUpPage = () => {
    const [formData, setFormData] = useState<FormData>({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        phone: "",
    });

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [verify, setVerify] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const router = useRouter();

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Validate password
        if (name === "password" || name === "confirm_password") {
            setPasswordValidation({
                minLength: formData.password.length >= 8 || (name === "password" && value.length >= 8),
                hasUppercase: /[A-Z]/.test(name === "password" ? value : formData.password),
                hasLowercase: /[a-z]/.test(name === "password" ? value : formData.password),
                hasNumber: /\d/.test(name === "password" ? value : formData.password),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(name === "password" ? value : formData.password),
                passwordsMatch: name === "confirm_password"
                    ? value === formData.password
                    : formData.confirm_password === (name === "password" ? value : formData.password),
            });
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // 1️⃣ Check empty fields
        const newFieldErrors: Partial<Record<keyof FormData, string>> = {};
        (Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
            if (!formData[key].trim()) {
                newFieldErrors[key] = `${key.replace("_", " ")} is required`;
            }
        });
        setFieldErrors(newFieldErrors);

        // If there are empty fields, stop here
        if (Object.keys(newFieldErrors).length > 0) {
            setLoading(false);
            toast.error("Please fill all required fields"); // toast for empty fields
            return;
        }

        // 2️⃣ Check password validation
        if (
            !passwordValidation.minLength ||
            !passwordValidation.hasUppercase ||
            !passwordValidation.hasLowercase ||
            !passwordValidation.hasNumber ||
            !passwordValidation.hasSpecialChar ||
            !passwordValidation.passwordsMatch
        ) {
            setError("Password does not meet all requirements or passwords do not match");
            setLoading(false);
            toast.error("Password does not meet all requirements or passwords do not match");
            return;
        }

        // 3️⃣ Submit form to API
        try {
            await apiClient.post("/account/customer/registration/", formData);
            setVerify(true);
            toast.success("A link has been sent to your email for verification");
        } catch (err: any) {
            const errorMessage = err.response.data.username|| "Signup failed2";
            setError(errorMessage);
            toast.error(errorMessage); // toast for API error
        } finally {
            setLoading(false);
        }
    };


    console.log("error msg", error);

    const groupedFields: Field[][] = [
        [
            { name: "username", label: "Username", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
        ],
        [
            { name: "first_name", label: "First Name", type: "text" },
            { name: "last_name", label: "Last Name", type: "text" },
        ],
        [{ name: "email", label: "Email", type: "email" }],
        [
            { name: "password", label: "Password", type: "password" },
            { name: "confirm_password", label: "Confirm Password", type: "password" },
        ],
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <MithoSweetsLoader />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-red-100 via-white to-orange-200">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden">
                {/* Left - Brand */}
                <div className="hidden md:flex flex-col justify-center items-center bg-orange-100 p-6 md:w-1/2">
                    <Image src={logo} alt="logo" width={100} height={100} />
                    <h2 className="text-2xl font-bold mt-4 text-center text-gray-800">
                        Welcome to Mitho Sweets
                    </h2>
                    <p className="text-gray-600 text-center mt-2 px-6">
                        Sign up to enjoy personalized sweet experiences!
                    </p>
                </div>

                {/* Right - Form */}
                {verify ? (
                    <div className="flex justify-center items-center min-vh-100">
                        <h4 className="text-xl font-semibold text-gray-800 text-center mb-6">
                            A Link has been sent to your Email for Verification
                        </h4>
                    </div>
                ) : (
                    <div className="p-8 md:w-1/2 w-full">
                        <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">
                            Create Your Account
                        </h3>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-100 rounded p-2 mb-4 text-center">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleSignUp} className="space-y-4">
                            {groupedFields.map((group, idx) => (
                                <div
                                    key={idx}
                                    className={`grid grid-cols-1 ${
                                        group.length === 2 ? "sm:grid-cols-2" : ""
                                    } gap-4`}
                                >
                                    {group.map((field) => (
                                        <div key={field.name}>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                {field.label}
                                            </label>
                                            <div className="flex items-center justify-content-center relative">
                                                <input

                                                    type={
                                                        field.name === "password"
                                                            ? showPassword
                                                                ? "text"
                                                                : "password"
                                                            : field.name === "confirm_password"
                                                                ? showConfirmPassword
                                                                    ? "text"
                                                                    : "password"
                                                                : field.type
                                                    }
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                />
                                                {(field.name === "password" || field.name === "confirm_password") && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            field.name === "password"
                                                                ? setShowPassword(!showPassword)
                                                                : setShowConfirmPassword(!showConfirmPassword)
                                                        }
                                                        className="absolute right-6 top-1/2 mt-5 transform -translate-y-1/2  text-gray-500 hover:text-gray-700"
                                                        styles={{
                                                            root: {
                                                                border:"none",
                                                            color:"grey",
                                                                padding: 0,
                                                                height: "auto",
                                                                minWidth: "auto",
                                                            },
                                                        }}
                                                    >
                                                        {field.name === "password" ? (
                                                            showPassword ? (
                                                                <IconEyeOff  size={20} />
                                                            ) : (
                                                                <IconEye size={20} />
                                                            )
                                                        ) : showConfirmPassword ? (
                                                            <IconEyeOff size={20} />
                                                        ) : (
                                                            <IconEye size={20} />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Field error message */}
                                            {fieldErrors[field.name] && (
                                                <p className="text-sm text-red-600 mt-1">{fieldErrors[field.name]}</p>
                                            )}

                                            {/* Password validation list */}
                                            {field.name === "password" && (
                                                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                                    <li className={passwordValidation.minLength ? "text-green-600" : ""}>
                                                        {passwordValidation.minLength ? "✓" : "✗"} Minimum 8 characters
                                                    </li>
                                                    <li className={passwordValidation.hasUppercase ? "text-green-600" : ""}>
                                                        {passwordValidation.hasUppercase ? "✓" : "✗"} At least one uppercase letter
                                                    </li>
                                                    <li className={passwordValidation.hasLowercase ? "text-green-600" : ""}>
                                                        {passwordValidation.hasLowercase ? "✓" : "✗"} At least one lowercase letter
                                                    </li>
                                                    <li className={passwordValidation.hasNumber ? "text-green-600" : ""}>
                                                        {passwordValidation.hasNumber ? "✓" : "✗"} At least one number
                                                    </li>
                                                    <li className={passwordValidation.hasSpecialChar ? "text-green-600" : ""}>
                                                        {passwordValidation.hasSpecialChar ? "✓" : "✗"} At least one special character
                                                    </li>
                                                    <li className={passwordValidation.passwordsMatch ? "text-green-600" : ""}>
                                                        {passwordValidation.passwordsMatch ? "✓" : "✗"} Passwords match
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            <Button
                                type="submit"
                                styles={{
                                    root: {
                                        width: "100%",
                                    },
                                }}
                                disabled={loading}
                            >
                                {loading ? "Signing up..." : "Sign Up"}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already have an account?{" "}
                            <Link href="/login?from=signup" className="text-red-600 hover:underline">
                                Login
                            </Link>
                        </p>

                        <Center mt={40} mb={4} pos="relative">

                            <Button
                                variant="outline"
                                styles={(theme) => ({
                                    root: {
                                        height: 40,
                                        width: 200,
                                        border: `none`,
                                        fontSize: 14,
                                        fontFamily: "Inter",
                                        "&:hover": {
                                            color: "white",
                                            backgroundColor: theme.colors.gray[7] || "#4A4A4A",
                                        },
                                    },
                                })}
                            >
                                <Flex align="center" gap={10}>
                                    <Google /> <GoogleLogo  />
                                    Login with Google
                                </Flex>
                            </Button>
                        </Center>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignUpPage;