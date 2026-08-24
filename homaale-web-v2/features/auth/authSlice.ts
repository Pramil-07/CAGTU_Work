import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

import { toast } from "@/components/common/Toast";
import type {
    FacebookLoginProps,
    GoogleLoginProps,
    LoginInputProps,
} from "@/types/LoginInputProps";
import type { LoginResponseProps } from "@/types/LoginResponseProps";
import type { ReduxStateProps } from "@/types/ReduxStateProps";

import authService from "./authService";

export interface AuthProps extends ReduxStateProps {
    user: LoginResponseProps | null | undefined;
}

const initialState: AuthProps = {
    user: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

export const login = createAsyncThunk(
    "auth/login",
    async (value: LoginInputProps, thunkAPI) => {
        try {
            return await authService.login(value);
        } catch (error: any) {
            const message =
                (error.response && error.response.data) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (value: GoogleLoginProps, thunkAPI) => {
        try {
            return await authService.googleLogin(value);
        } catch (error: any) {
            const message =
                (error.response && error.response.data) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const facebookLogin = createAsyncThunk(
    "auth/facebookLogin",
    async (value: FacebookLoginProps, thunkAPI) => {
        try {
            return await authService.facebookLogin(value);
        } catch (error: any) {
            const message =
                (error.response && error.response.data) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// export const refresh = createAsyncThunk(
//     "auth/refresh",
//     async (value: string, thunkAPI) => {
//         try {
//             return await authService.refresh(value);
//         } catch (error: any) {
//             const message =
//                 (error.response &&
//                     error.response.data &&
//                     error.response.data.message) ||
//                 error.message ||
//                 error.toString();
//             return thunkAPI.rejectWithValue(message);
//         }
//     }
// );

export const logout = createAsyncThunk("auth/logout", async () => {
    authService.logout();
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.user = null;
            state.message = "";
            Cookies.remove("access");
            Cookies.remove("refresh");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = payload;
                Cookies.set("access", payload.access);
                Cookies.set("refresh", payload.refresh);
                toast.success("Login Successfull");
            })
            .addCase(login.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
                state.user = null;
            })
            .addCase(googleLogin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(googleLogin.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = payload;
                Cookies.set("access", payload.access);
                Cookies.set("refresh", payload.refresh);
                toast.success("Login Successfull");
            })
            .addCase(googleLogin.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
                state.user = null;
            })
            .addCase(facebookLogin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(facebookLogin.fulfilled, (state, { payload }) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = payload;
                Cookies.set("access", payload.access);
                Cookies.set("refresh", payload.refresh);
                toast.success("Login Successfull");
            })
            .addCase(facebookLogin.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
                state.user = null;
            })
            // .addCase(refresh.pending, (state) => {
            //     state.isLoading = true;
            // })
            // .addCase(refresh.fulfilled, (state, { payload }) => {
            //     state.isLoading = false;
            //     state.isSuccess = true;
            //     if (payload.code === "token_not_valid") {
            //         toast.success("Login Expired");
            //         Cookies.remove("access");
            //         Cookies.remove("refresh");
            //     } else {
            //         Cookies.set("access", payload.access);
            //         Cookies.set("refresh", payload.refresh);
            //     }
            // })
            // .addCase(refresh.rejected, (state, { payload }) => {
            //     state.isLoading = false;
            //     state.isError = true;
            //     state.message = payload;
            //     state.user = null;
            //     toast.success("Invalid token");
            //     Cookies.remove("access");
            //     Cookies.remove("refresh");
            // })
            .addCase(logout.fulfilled, () => {
                initialState;
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
