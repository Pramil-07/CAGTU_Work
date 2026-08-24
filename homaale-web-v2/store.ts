import { configureStore } from "@reduxjs/toolkit";
import authReducer from "features/auth/authSlice";
import filterReducer from "features/utils/filterSlice";
import locationReducer from "features/utils/locationSlice";
import modalReducer from "features/utils/modalSlice";

// const createNoopStorage = () => {
//     return {
//         getItem(_key: any) {
//             return Promise.resolve(null);
//         },
//         setItem(_key: any, value: any) {
//             return Promise.resolve(value);
//         },
//         removeItem(_key: any) {
//             return Promise.resolve();
//         },
//     };
// };
// const storage =
//     typeof window !== "undefined"
//         ? createWebStorage("local")
//         : createNoopStorage();

/**
 * Use your reducers in the configureStore
 */

export const store = configureStore({
    reducer: {
        authReducer,
        filterReducer,
        modalReducer,
        locationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
