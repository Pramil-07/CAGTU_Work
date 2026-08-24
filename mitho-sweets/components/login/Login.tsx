"use client";
import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import banner from "../../images/logo.png";
import apiClient from "../../axiosConfig";
import Link from "next/link";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import {useAuth} from "@/lib/AuthContext";
import {useRouter, useSearchParams} from "next/navigation";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import {Box, Button, Center, Flex, Tooltip, useMantineTheme} from "@mantine/core";
import {IconEye, IconEyeClosed} from "@tabler/icons-react";
import { toast } from "@/components/common/Toast";
import Google from "@/components/GoogleAuth/Google";
import GoogleLogo from "@/public/svgs/GoogleLogo";
import logo from "@/images/logo-bg.png"

interface ErrorResponse {
    detail?: string;
}

const LoginPage = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoginSuccess, setIsLoginSuccess] = useState<boolean>(false);
    const [emailSentSucess, setEmailSentSucess] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const[showPassword,setShowPassword] = useState(false)
    const { login } = useAuth();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const theme = useMantineTheme()
    const searchParams = useSearchParams();

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {

            if(forgotPassword){
                await apiClient.post("/account/customer/forgot-password/",{email})
                setEmailSentSucess(true)
                setLoading(false)

            }else{
                const response =  await apiClient.post("/account/customer/login/", {
                    email,
                    password,
                });
                {
                    const {access} = response.data;
                    const {refresh}= response.data
                    // Cookies.set("msaccessToken", access);
                    Cookies.set("msaccessToken", access);
                    Cookies.set("refreshToken",refresh)

                    // window.location.reload();
                    login(access);}
                setIsLoginSuccess(true);

            }

        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            setError(axiosError.response?.data?.detail || "Login failed");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoginSuccess) {
            const fetchProfile = async () => {
                try {
                    const response = await apiClient.get("/account/customer/profile/");
                    const userRole = response.data.data.role;
                    setRole(userRole);

                    if (userRole.includes("Admin")) {
                        toast.success("Welcome to the Admin Dashboard", "Success");
                        router.push("/dashboard");
                    } else {
                        const from = searchParams.get("from");
                        const timer = setTimeout(() => {
                            // toast.success("Welcome to Mitho Sweets, we are glad to have you back", "Success");
                            toast.success("Login successful, welcome to Mitho Sweets", "Success");
                            if (from === "signup" || from === "email" || from === "resetPassword") {
                                router.push("/");
                            } else {
                                router.back();
                            }
                        }, 1000);

                        return () => clearTimeout(timer);
                    }
                } catch (err) {
                    const axiosError = err as AxiosError<ErrorResponse>;
                    setError(axiosError.response?.data?.detail || "Failed to fetch profile");
                    toast.error("Failed to fetch profile", "Error");
                    // router.push("/");
                }
            };

            fetchProfile();
        }
    }, [isLoginSuccess, router]);


    if (isLoginSuccess) {
        return (
            <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
                <MithoSweetsLoader/>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-red-100 via-white to-orange-200 ">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden">
                {/* Left side (brand info) */}
                <div className="hidden md:flex flex-col justify-center items-center bg-orange-100 p-6 md:w-1/2">
                    <Image src={logo} alt="logo" width={100} height={100} />
                    <h2 className="text-2xl font-bold mt-4 text-center text-gray-800">
                        Welcome to Mitho Sweets 🍬
                    </h2>
                    <p className="text-gray-600 text-center mt-2 px-6">
                        Login to continue ordering your favorite sweets!
                    </p>
                </div>

                {/* Right side (login form) */}
                <div className="p-8 md:w-1/2 w-full">
                    <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">
                        {forgotPassword?"":"Login to Your Account"}
                    </h3>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-100 rounded p-2 mb-4 text-center">
                            {error}
                        </p>
                    )}

                    {emailSentSucess ? (
                        <div className="flex justify-center items-center ">
                            <h4 className="text-xl font-semibold text-gray-800 text-center mb-6">
                                A Link has been sent to your email to change your password
                            </h4>
                        </div>
                    ) : forgotPassword ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                    placeholder="you@example.com"
                                    required
                                />
                                <Button
                                    type="submit"
                                    style={{
                                        width:"100%"
                                    }}
                                    disabled={loading}
                                    className="w-full py-3 mt-5  text-white font-semibold rounded-lg transition disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "Send Email"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <Flex style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                                        placeholder="••••••••"
                                        required
                                    />

                                    <Tooltip label={ showPassword?"Hide ":"Show"}>

                                        <button
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                            }}
                                            type={"button"}
                                            onClick={()=>{ setShowPassword( !showPassword)}}
                                        >
                                            {showPassword ? <IconEye size={16}/> : <IconEyeClosed size={16}/>}

                                        </button>
                                    </Tooltip>

                                </Flex>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width:"100%"

                                }}
                                className="w-full py-3  text-white font-semibold rounded-lg hover:bg-orange-400 transition disabled:opacity-50"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    )}
                    {!forgotPassword?(<Box>


                            <p className="text-center text-gray-600 text-sm mt-6">
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up" className="text-red-600 hover:underline">
                                    Sign up
                                </Link>
                            </p>
                            <Center mt={40}  mb={4} pos={"relative"}>

                                <Button
                                    variant="outline"
                                    styles={{
                                        root: {
                                            height: 40,
                                            width: 200,
                                            border: "none",
                                            // color: theme.colors.dark[8],
                                            fontSize: 14,
                                            fontFamily: "Inter",
                                            zIndex:101


                                        },
                                    }}
                                >
                                    <Flex align={"center"} gap={10}>
                                        <Google /> 
                                    </Flex>


                                </Button>
                            </Center>
                            <p className="text-center text-gray-600 text-sm mt-6">

                                <Link onClick={() => {
                                    setForgotPassword(true)
                                }} href="" className="text-red-600 hover:underline">
                                    Forgot Password?
                                </Link>
                            </p>
                        </Box>)
                        :
                        <Box>
                            <p className="text-center text-gray-600 text-sm mt-6">

                                <Link onClick={() => {
                                    setForgotPassword(false)
                                }} href="" className="text-red-600 hover:underline">
                                    Login
                                </Link>
                            </p>
                        </Box>
                    }

                </div>


            </div>
        </div>
    );
};

export default LoginPage;
