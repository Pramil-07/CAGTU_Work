import {
    IconCalendarTime,
    IconCategory,
    IconHistory,
    IconKey,
    IconLink,
    IconListDetails,
    IconNotes,
    IconTool,
    IconUserCircle,
    IconUserSearch,
    IconWorld,
    IconUser,
    IconMan
} from "@tabler/icons-react";
import {IconSmartHome} from "@tabler/icons-react";
import type React from "react";
import {RiShoppingBasket2Line} from "react-icons/ri";

import {isLoggedIn} from "@/utils/helpers";
import {AiOutlineStock, AiTwotoneShop} from "react-icons/ai";
import {FaUserTie} from "react-icons/fa";
import {useProfile} from "@/hooks/useProfile";

interface NavbarLinkProps {
    icon: React.FC<any>;
    label: string;
    active?: boolean;

    onClick?(): void;

    link: string;
    id: string;
}

export const HOME_SIDE_NAV_DATA = (): NavbarLinkProps[] => {
    return [
        {
            icon: IconSmartHome,
            label: "Home",
            link: "/",
            id: "/",
        },
    ];
};
export const TASK_SIDE_NAV_DATA = (): NavbarLinkProps[] => {
    if (isLoggedIn()) {
        return [
            {
                icon: IconWorld,
                label: "Explore",
                link: "/explore",
                id: "/explore",
            },
            {
                icon: IconUser,
                label: "My List",
                link: "/myList",
                id: "/myList",
            },
            // {
            //     icon: IconListDetails,
            //     label: "Tasks",
            //     link: "/tasks",
            //     id: "/tasks",
            // },
            // {
            //     icon: IconTool,
            //     label: "Services",
            //     link: "/services",
            //     id: "/tasks",
            // },
            {
                icon: IconUserSearch,
                label: "Tasker",
                link: "/tasker",
                id: "/tasker",
            },
            {
                icon: IconCategory,
                label: "Category",
                link: "/category",
                id: "/category",
            },
            {
                icon: IconCalendarTime,
                label: "Bookings",
                link: "/bookings",
                id: "/bookings",
            },
            {
                icon: RiShoppingBasket2Line,
                label: "Products",
                link: "/products",
                id: "/products",
            },
            {
                icon: AiTwotoneShop,
                label: "Shop List",
                link: "/shops",
                id: "/shops",
            },
            {
                icon: IconMan,
                label: "Merchants",
                link: "/merchants",
                id: "/merchants",
            },
        ];
    } else {
        return [

            {
                icon: IconWorld,
                label: "Explore",
                link: "/explore",
                id: "/explore",
            },
            // {
            //     icon: IconListDetails,
            //     label: "Tasks",
            //     link: "/tasks",
            //     id: "/tasks",
            // },
            // {
            //     icon: IconTool,
            //     label: "Services",
            //     link: "/services",
            //     id: "/tasks",
            // },
            // {
            //     icon: IconUserSearch,
            //     label: "Tasker",
            //     link: "/tasker",
            //     id: "/tasker",
            // },
            {
                icon: IconUserSearch,
                label: "Tasker",
                link: "/tasker",
                id: "/tasker",
            },
            {
                icon: IconCategory,
                label: "Category",
                link: "/category",
                id: "/category",
            },
            {
                icon: AiTwotoneShop,
                label: "Shop List",
                link: "/shops",
                id: "/shops",
            },
            {
                icon: RiShoppingBasket2Line,
                label: "Products",
                link: "/products",
                id: "/products",
            },
            {
                icon: IconMan,
                label: "Merchants",
                link: "/merchants",
                id: "/merchants",
            },
        ];
    }
};

export const PAYMENT_SIDE_NAV_DATA = (): NavbarLinkProps[] => {
    return [
        {
            icon: IconHistory,
            label: "Transaction History",
            link: "/payment/history",
            id: "/payment/history",
        },
        {
            icon: IconNotes,
            label: "My Earnings",
            link: "/payment/earnings",
            id: "/payment/earnings",
        },
    ];
};
export const SETTINGS_SIDE_NAV_DATA = (): NavbarLinkProps[] => {
    return [
        {
            icon: IconUserCircle,
            label: "Account Settings",
            link: "/settings/account",
            id: "/settings/account",
        },
        {
            icon: IconKey,
            label: "Password & Security",
            link: "/settings/security",
            id: "/settings/security",
        },
        {
            icon: IconLink,
            label: "Connected Accounts",
            link: "/settings/connected-accounts",
            id: "/settings/connected-accounts",
        },
        // {
        //     icon: IconHelp,
        //     label: "Help & Legal",
        //     link: "/homaale-privacy-policy",
        // },
    ];
};

export const MERCHANT_SIDE_NAV_DATA = (): NavbarLinkProps[] => {
    const {data: profileData} = useProfile();
    const isPremium = profileData?.merchant_data?.[0]?.is_premium;

    if(isPremium && isLoggedIn()) {
        return [
            {
                icon: FaUserTie,
                label: "Merchant Profile",
                link: "/merchant/profile",
                id: "/merchant/profile",
            },
            {
                icon: AiOutlineStock,
                label: "Sales Overview",
                link: "/merchant/sales",
                id: "/merchant/sales",
            },
        ];
    }else {
        return []
    }
};
