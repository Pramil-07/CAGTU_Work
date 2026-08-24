import {createSlice} from "@reduxjs/toolkit";
import _ from "lodash";

// Defining a type for the slice state
interface Query {
    amount: string;
    search: string;
    service: string;
    city: string;
    date: string;
    budget: string;
    status: string;
    payment_method: string;
    date_after: string;
    date_before: string;
    budget_from: string;
    budget_to: string;
    top_tasker: string;
    query: string;
    category: string;
    ordering:string
    searchType: "tasks" | "services" | "products" | "shops" | "taskers" | "";
}

// Defining the initial state using that type
const initialState: Query = {
    amount: "",
    search: "",
    service: "",
    city: "",
    date: "",
    budget: "",
    status: "",
    payment_method: "",
    date_after: "",
    date_before: "",
    budget_from: "",
    budget_to: "",
    top_tasker: "",
    query: "",
    category: "",
    searchType: "",
    ordering:""
};

export enum PriceFilterTypes {
    amount = "amount",
    budget = "budget",
    payable = "payable",
    price = "price",
    earning = "earning",
}

export type PayloadTypes = {
    key: | "category"
        | "service"
        | "city"
        | "date"
        | "budget"
        | "status"
        | "payment_method"
        | "date_after"
        | "date_before"
        | "budget_from"
        | "budget_to"
        | "top_tasker"
        | "amount"
        | "searchType";
    value: string | null;
    additional_keys?:
        | PriceFilterTypes.amount
        | PriceFilterTypes.budget
        | PriceFilterTypes.earning
        | PriceFilterTypes.payable
        | PriceFilterTypes.price;
};

export enum SortTypes {
    amount = "amount",
    service = "service",
    city = "city",
    date = "date",
    budget = "budget",
    status = "status",
    payment_method = "payment_method",
    date_after = "date_after",
    date_before = "date_before",
    budget_from = "budget_from",
    budget_to = "budget_to",
    top_tasker = "top_tasker",
    category = "category",
    searchType = "searchType",
}

export const filterSlice = createSlice({
    name: "filter" || "category",
    initialState,
    reducers: {
        setSearch: (state, {payload}) => {
            // Set search term based on searchType: use &name= for products/shops, &search= for others
            if (state.searchType === "products" || state.searchType === "shops") {
                state.search = payload ? `&name=${payload}` : "";
            } else {
                state.search = payload ? `&search=${payload}` : "";
            }
            state.search = payload ? `&search=${payload}` : "";
            state.query = _.values(_.omit({...state}, "query")).join("");
        },

        setQuery: (state, {payload}: { payload: PayloadTypes }) => {
            switch (payload.key) {
                case SortTypes.searchType:
                    state.searchType = payload.value as Query["searchType"];
                    if (state.search) {
                        const searchValue = state.search.includes("&name=")
                            ? state.search.replace("&name=", '') : state.search.replace("&search=", '');
                        state.search = state.searchType === "products" || state.searchType === 'shops' ? searchValue ? `&name=${searchValue}` : '' : searchValue ? `&search=${searchValue}` : '';
                    }
                    break;
                case SortTypes.service:
                    state.service = payload.value
                        ? `&service=${payload.value}`
                        : "";

                    state.query = state.query + `&service=${payload.value}`;

                    break;
                case SortTypes.category:
                    state.category = payload.value
                        ? `&category=${payload.value}`
                        : "";

                    state.query = state.query + `&category=${payload.value}`;

                    break;
                case SortTypes.city:
                    state.city = payload.value ? `&city=${payload.value}` : "";
                    state.query = payload.value
                        ? state.query + `&city=${payload.value}`
                        : state.query;
                    break;
                case SortTypes.date:
                    if (payload.value === state.date) {
                        state.date = "&ordering=created_at";
                    } else {
                        state.date = payload.value ?? "";
                    }
                    break;
                case SortTypes.amount:
                    if (payload.value === state.amount) {
                        state.amount = "&ordering=amount";
                    } else {
                        state.amount = payload.value ?? "";
                    }
                    break;
                case SortTypes.budget:
                    if (payload.value === state.budget) {
                        state.budget = "&ordering=budget_to";
                    } else {
                        state.budget = payload.value ?? "";
                    }
                    break;
                case SortTypes.top_tasker:
                    if (payload.value === state.top_tasker) {
                        state.top_tasker = "&ordering=top";
                    } else {
                        state.top_tasker = payload.value ?? "";
                    }
                    break;
                case SortTypes.status:
                    state.status = payload.value
                        ? `&status=${payload.value}`
                        : "";
                    break;
                case SortTypes.payment_method:
                    state.payment_method = payload.value
                        ? `&payment_method=${payload.value}`
                        : "";
                    break;
                case SortTypes.date_after:
                    state.date_after = payload.value
                        ? `&date_after=${payload.value}`
                        : "";
                    break;
                case SortTypes.date_before:
                    state.date_before = payload.value
                        ? `&date_before=${payload.value}`
                        : "";
                    break;
                case SortTypes.budget_from:
                    switch (payload.additional_keys) {
                        case PriceFilterTypes.amount:
                            state.budget_from = payload.value
                                ? `&amount_min=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.budget:
                            state.budget_from = payload.value
                                ? `&budget_from=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.earning:
                            state.budget_from = payload.value
                                ? `&earning_min=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.payable:
                            state.budget_from = payload.value
                                ? `&payable_from=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.price:
                            state.budget_from = payload.value
                                ? `&price_min=${payload.value}`
                                : "";
                            break;
                        default:
                            state.budget_from = "";
                            break;
                    }
                    break;

                case SortTypes.budget_to:
                    switch (payload.additional_keys) {
                        case PriceFilterTypes.amount:
                            state.budget_to = payload.value
                                ? `&amount_max=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.budget:
                            state.budget_to = payload.value
                                ? `&budget_to=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.earning:
                            state.budget_to = payload.value
                                ? `&earning_max=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.payable:
                            state.budget_to = payload.value
                                ? `&payable_to=${payload.value}`
                                : "";
                            break;
                        case PriceFilterTypes.price:
                            state.budget_to = payload.value
                                ? `&price_max=${payload.value}`
                                : "";
                            break;
                        default:
                            state.budget_to = "";
                            break;
                    }
                    break;
                default:
                    break;
            }
            state.query = _.values(_.omit({...state}, "query")).join("");
        },
        reset: () => {
            return {
                ...initialState,
            };
        },
    },
});

export const {setSearch, reset, setQuery} = filterSlice.actions;

export default filterSlice.reducer;
