import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { LocationProps } from "@/types/LocationProps";

import utilsService from "./services";

let storageLocation!: LocationProps;

if (typeof window !== "undefined") {
    const local = localStorage.getItem("location");
    if (local) {
        storageLocation = JSON.parse(local);
    }
}

const initialState: LocationProps = {
    status: storageLocation?.status ?? "",
    radius: storageLocation?.radius ?? 25000,
    data: storageLocation?.data ?? {
        city: "",
        country: "",
        latitude: null,
        longitude: null,
    },
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

export const getLocation = createAsyncThunk(
    "get/location",
    async (_, thunkAPI) => {
        try {
            return await utilsService.location();
        } catch (error: any) {
            const message =
                (error.response && error.response.data) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const LocationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        reset: (state) => {
            (state.status = ""),
                (state.data = {
                    city: "",
                    country: "",
                    latitude: null,
                    longitude: null,
                }),
                (state.isError = false),
                (state.isSuccess = false),
                (state.isLoading = false),
                (state.message = "");
        },

        update: (state, { payload }: { payload: LocationProps }) => {
            state.data = payload.data;
            state.radius = payload.radius;
            localStorage.setItem("location", JSON.stringify(payload));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getLocation.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(
                getLocation.fulfilled,
                (state, { payload }: { payload: LocationProps }) => {
                    state.isLoading = false;
                    state.isSuccess = true;
                    state.data = payload.data;
                    state.status = payload.status;
                    localStorage.setItem("location", JSON.stringify(payload));
                }
            )
            .addCase(getLocation.rejected, (state, { payload }) => {
                state.isLoading = false;
                state.isError = true;
                state.message = payload;
            });
    },
});

export const { reset, update } = LocationSlice.actions;

export default LocationSlice.reducer;
