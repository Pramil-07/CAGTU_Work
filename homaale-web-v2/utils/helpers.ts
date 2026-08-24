import { useMantineColorScheme } from "@mantine/core";
import { compareAsc, fromUnixTime } from "date-fns";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";
import NepaliDate from "nepali-date-converter";
import type { NextRouter } from "next/router";
import {format, formatDistanceToNowStrict} from "date-fns";

import { ENTITY_FILTER } from "@/constants/EntityFilterTypes";
import { store } from "@/store";

// Get current Year
export const getCurrentYear = () => {
    return new Date().getFullYear();
};

// To check active menu page
export const handleMenuActive = (path: string, router: NextRouter) => {
    const defaultClass = "nav-item";
    const activeClass = defaultClass + " nav-item--active";
    return router.pathname == path ? activeClass : defaultClass;
};

// form-group validate
export const checkFormGroup = (error: any) => {
    const currentClass = "form-group";
    const errorClass = "validate";
    return error ? `${currentClass} ${errorClass}` : currentClass;
};

// form-control validate
export const checkFormControl = (error: any, touched: any) => {
    const currentClass = "form-control";
    const errorClass = "is-invalid";
    return error && touched ? `${currentClass} ${errorClass}` : currentClass;
};

// Form Button Submitting
export const isSubmittingClass = (isSubmitting: boolean) => {
    const defaultClass = `btn site-btn`;
    const submittingClass = `btn site-btn cf-spinner cf-spinner--center cf-spinner--sm isSubmitting`;
    return isSubmitting ? submittingClass : defaultClass;
};

// Date formatter
export const formatMonthDate = (dateString: any) => {
    const dateArray = new Date(String(dateString)).toDateString().split(" ");
    return `${dateArray[2]} ${dateArray[1]}, ${dateArray[3]}`;
};

export const phoneRegExp =
    /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

// Blog API Links
export const BLOG_BASE_URL = "https://blog.api.cagtu.io/";
export const blogListAPI = `${BLOG_BASE_URL}blog/list`;
export const blogDetailAPI = `${BLOG_BASE_URL}blog/detail/`;

export const getPageUrl = () => {
    return typeof window != "undefined" ? window.location.href : "";
};

export const getFCMTOKEN = async () => {
    const token = Cookies.get("fcm_token");
    return token;
};

export const getApiEndpoint = () => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (url === undefined)
        throw new Error(
            "Please specify an API endpoint in the environment variable NEXT_PUBLIC_API_URL"
        );
    return url;
};
export function formatNumberWithCondition(number: number, symbol: any ): string {
    if (symbol === "रु") {
        // Custom format for Nepali style
        return number.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    } else {
        // Default English format
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    }
}
export const getAESEndpoint = () => {
    const url = process.env.NEXT_PUBLIC_AES_KEY;
    if (url === undefined)
        throw new Error(
            "Please specify an AES endpoint in the environment variable NEXT_PUBLIC_AES_KEY"
        );
    return url;
};

export const isValidURL = (str: any) => {
    const regex =
        /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-/]))?/;
    if (!regex.test(str)) {
        return false;
    } else {
        return true;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const { exp } = jwtDecode<{ exp: number }>(token);
    const tokenExpirationDate = fromUnixTime(exp);
    const currentTime = new Date();
    return compareAsc(tokenExpirationDate, currentTime) === -1;
};

export const isLoggedIn = () => {
    const access = Cookies.get("access");
    if (access && !isTokenExpired(access)) {
        return true;
    } else {
        return false;
    }
};

export const useDark = () => {
    const { colorScheme } = useMantineColorScheme();
    const dark = colorScheme === "dark";
    return dark;
};

export const scrollToView = (id: string) => {
    const element = document.getElementById(id);
    element && element.scrollIntoView({ behavior: "smooth" });
};

export const advancedFilter = (options: string) => {
    switch (options) {
        case ENTITY_FILTER.rating:
            return `&ordering=-${ENTITY_FILTER.rating}`;
        case ENTITY_FILTER.trending:
            return `&ordering=-${ENTITY_FILTER.trending},${
                store.getState().filterReducer.date
                    ? store.getState().filterReducer.date.split("=")[1]
                    : ""
            }`;
        case ENTITY_FILTER.mostly_booked:
            return `&ordering=-${ENTITY_FILTER.mostly_booked}`;
        case ENTITY_FILTER.top:
            return `&ordering=-${ENTITY_FILTER.top}`;
        case ENTITY_FILTER.interested:
            return `&interested=true`;
        case ENTITY_FILTER.near_by:
            return `&near_by=true&latitude=${
                store.getState().locationReducer.data.latitude
            }&longitude=${
                store.getState().locationReducer.data.longitude
            }&radius=${store.getState().locationReducer.radius}`;
        case "price":
                return `&ordering=price`; // Ascending order for products
         case "-price":
                return `&ordering=-price`;
        default:
            return "";
    }
};

export const getHoroscopeName = (id: number, is_nepali: boolean) => {
    switch (id) {
        case 0:
            if (is_nepali === true) {
                return "मेष ( चु, चे, चो, ला, लि, लु, ले, लो, अ )";
            } else {
                return "Aries";
            }
        case 1:
            if (is_nepali === true) {
                return "वृष ( इ, उ, ए, ओ, वा, वि, वु, वे, वो )";
            } else {
                return "Taurus";
            }
        case 2:
            if (is_nepali === true) {
                return "मिथुन ( का, कि, कु, घ, ङ, छ, के, को, हा )";
            } else {
                return "Gemini";
            }
        case 3:
            if (is_nepali === true) {
                return "कर्कट ( हि, हु, हे, हो, डा, डि, डु, डे, डो )";
            } else {
                return "Cancer";
            }
        case 4:
            if (is_nepali === true) {
                return "सिंह ( मा, मि, मु, मे, मो, टा, टि, टु, टे )";
            } else {
                return "Leo";
            }
        case 5:
            if (is_nepali === true) {
                return "कन्या ( टो, पा, पि, पु, ष, ण, ठ, पे, पो )";
            } else {
                return "Virgo";
            }
        case 6:
            if (is_nepali === true) {
                return "तुला ( रा, रि, रु, रे, रो, ता, ति, तु, ते )";
            } else {
                return "Libra";
            }
        case 7:
            if (is_nepali === true) {
                return "वृश्चिक ( तो, ना, नि, नु, ने, नो, या, यि, यु )";
            } else {
                return "Scorpio";
            }
        case 8:
            if (is_nepali === true) {
                return "धनु ( ये, यो, भा, भि, भु, धा, फा, ढा, भे )";
            } else {
                return "Sagittarius";
            }
        case 9:
            if (is_nepali === true) {
                return "मकर ( भो, जा, जि, जु, जे, जो, ख, खि, खु, खे, खो, गा, गि )";
            } else {
                return "Capricorn";
            }
        case 10:
            if (is_nepali === true) {
                return "कुम्भ ( गु, गे, गो, सा, सि, सु, से, सो, दा )";
            } else {
                return "Aquarius";
            }
        case 11:
            if (is_nepali === true) {
                return "मीन ( दि, दु, थ, झ, ञ, दे, दो, चा, चि )";
            } else {
                return "Pisces";
            }
        default:
            return "";
    }
};

export const getNepaliDate = (date: any) => {
    const nepaliDate = new NepaliDate(date).format("ddd DD, MMMM YYYY", "np");
    return nepaliDate;
};

export const getCommisionMultiplier = (commission: number) => {
    const vat = 1.13;
    return 1 - (commission + 0.02) * vat;
};

// Get payable amount for a given amount by adding commission and service charge
export const getPayableAmount = (amount: string, commission: string) => {
    return Math.ceil(
        parseFloat(amount) / getCommisionMultiplier(parseFloat(commission))
    );
};

// Get receivable amount for a given amount from payable by subtracting commission and service charge
export const getReceivableAmount = (payable: string, commission: string) => {
    return Math.ceil(
        parseFloat(payable) * getCommisionMultiplier(parseFloat(commission))
    );
};

/**
 * Scroll to the respective element by providing it's Id
 * @param elementId string
 */
export const scrollToElement = (
    elementId: string,
    behavior: ScrollBehavior
) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: behavior, block: "center" });
    }
};
export const getBrand = () => {
    if (typeof window === "undefined") return "homaale";

    const hostname = window.location.hostname;
    return hostname.includes("localhost") ? "cagtu" : "homaale";
  };

export const formatDateBasedOnAge = (date: Date | number) => {
    const now = new Date();
    const diffInDays = Math.floor(
        (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays <= 6) {
        return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
    } else {
        return format(new Date(date), "MMMM dd, yyyy"); // e.g., "June 09, 2025"
    }
};
