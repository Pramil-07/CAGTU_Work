import { Box } from "@mantine/core";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import apiClient from "@/axiosConfig";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { AxiosError } from "axios";

interface GoogleLoginProps {
  credential?: string;
  access_token?: string;
  [key: string]: any;
}

const Google = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const handleGoogleLogin = async (credentialResponse: GoogleLoginProps) => {
    if (credentialResponse.credential) {
      Cookies.set("credentials", credentialResponse.credential);
      console.log("id_token", credentialResponse);
      try {
        const response = await apiClient.post(
          "/social_app/register/social/google-oauth2/",
          { credential: credentialResponse.credential }
        );

        const { access, refresh, user } = response.data;

        if (!access) {
          throw new Error("Access token not received from server");
        }

        // Save access_token to cookies
        Cookies.set("msaccessToken", access, {
          secure: true,
          sameSite: "Strict",
          expires: 4/ 24, // Expires in 1 hour
        });

        // Save refresh_token to cookies if provided
        if (refresh) {
          Cookies.set("refreshToken", refresh, {
            secure: true,
            sameSite: "Strict",
            expires: 7, // Expires in 7 days
          });
        }

        console.log("logged in user", user);

        // Update authentication context
        login(access);

        // Set login success state
        setIsLoginSuccess(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  useEffect(() => {
    if (isLoginSuccess) {
      const fetchProfile = async () => {
        try {
          const response = await apiClient.get("/account/customer/profile/");
          const userRole = response.data.data.role;

          if (userRole.includes("Admin")) {
            toast.success("Welcome to the Admin Dashboard");
            router.push("/dashboard");
          } else {
            const from = searchParams.get("from");
            toast.success("Login successful, welcome to Mitho Sweets");
            if (from === "signup" || from === "email" || from === "resetPassword") {
              router.push("/");
            } else {
              router.back();
            }
          }
        } catch (err) {
          const axiosError = err as AxiosError<{ detail?: string }>;
          const errorMessage = axiosError.response?.data?.detail || "Failed to fetch profile";
          setError(errorMessage);
          toast.error(errorMessage);
          router.push("/");
        }
      };

      fetchProfile();
    }
  }, [isLoginSuccess, router, searchParams]);

  if (isLoginSuccess) {
    return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
  <Box style={{transform: "scale(0.5)"}}>
    <MithoSweetsLoader />
  </Box>
</div>
    );
  }

  return (
    <Box
      style={{
        zIndex: 100,
        opacity: 1,
        position: "absolute",
        top: 4,
        left: 14,
      }}
    >
   
      
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          console.log("Login Failed");
          toast.error("Google login failed");
        }}
        size="medium"
      />
    </Box>
  );
};

export default Google;