import {
    IconAlertCircle,
    IconCalendarTime,
    IconCategory,
    IconHistory,
    IconKey,
    IconLink,
    IconMessage2Code,
    IconMessages,
    IconNotes,
    IconPhone,
    IconReceipt,
    IconStepInto,
    IconUserCircle,
    IconUser,
    IconWorld,
    IconMan,
    IconUserSearch
} from "@tabler/icons-react";


import React from "react";

import type {NavLinkProps} from "@/types/NavLinkProps";
import {isLoggedIn} from "@/utils/helpers";
import {link} from "fs";
import {RiShoppingBasket2Line} from "react-icons/ri";
import {AiOutlineStock, AiTwotoneShop} from "react-icons/ai";
import {FaUserTie} from "react-icons/fa";
import {FcSalesPerformance} from "react-icons/fc";

export const TASK_SIDE_NAV_DATA = (): NavLinkProps[] => {
    if (isLoggedIn()) {
        return [
            {
                title: "Explore",
                icon: <IconWorld size={20}/>,
                link: "/explore",
                id: "/explore",
            },
            {
                title: "My List",
                icon: <IconUser size={20}/>,
                link: "/myList",
                id: "/myList",
            },
            // {
            //     title: "Tasks",
            //     icon: < IconListDetails size={20} />,
            //     link: `/tasks`,
            //     id: "/tasks",
            // },
            //
            // {
            //     title: "Services",
            //     icon: < IconTool size={20} />,
            //     link: `/services`,
            //     id: "/services",
            // },
            {
                title: "Tasker",
                icon: <IconUserSearch size={20} />,
                link: "/tasker",
                id: "/tasker",
            },
            {
                title: "Category",
                icon: <IconCategory size={20}/>,
                link: "/category",
                id: "/category",
            },
            {
                title: "Bookings",
                icon: <IconCalendarTime size={20}/>,
                link: "/bookings",
                id: "/bookings",
            },
            {
                title: "Products",
                icon: <RiShoppingBasket2Line size={20}/>,
                link: "/products",
                id: "/products",
            },
            {
                title: "Shop List",
                icon: <AiTwotoneShop size={20}/>,
                link: "/shops",
                id: "/shops",
            },
            {
                title: "Merchants",
                icon: <IconMan size={20}/>,
                link: "/merchants",
                id: "/merchants",
            },
        ];
    } else {
        return [
            {
                title: "Explore",
                icon: <IconWorld size={20}/>,
                link: "/explore",
                id: "/explore",
            },
            // {
            //     title: "Tasks",
            //     icon: < IconListDetails size={20} />,
            //     link: `/tasks`,
            //     id: "/tasks",
            // },
            //
            // {
            //     title: "Services",
            //     icon: < IconTool size={20} />,
            //     link: `/services`,
            //     id: "/services",
            // },
            // {
            //     title: "Tasker",
            //     icon: <IconUserSearch  size={20} />,
            //     link: "/tasker",
            //     id: "/tasker",
            // },
            {
                title: "Tasker",
                icon: <IconUserSearch size={20} />,
                link: "/tasker",
                id: "/tasker",
            },
            {
                title: "Category",
                icon: <IconCategory size={20}/>,
                link: "/category",
                id: "/category",
            },
            {
                title: "Products",
                icon: <RiShoppingBasket2Line size={20}/>,
                link: "/products",
                id: "/products",
            },
            {
                title: "Shop List",
                icon: <AiTwotoneShop size={20}/>,
                link: "/shops",
                id: "/shops",
            },
            {
                title: "Merchants",
                icon: <IconMan size={20}/>,
                link: "/merchants",
                id: "/merchants",
            },
        ];
    }
};


export const MERCHANT_SIDE_NAV_DATA = (): NavLinkProps[] => {
    return [
        {
            title: "Profile",
            icon: <FaUserTie  size={20}/>,
            link: "/merchant/profile",
            id: "/merchant/profile",
        },
        {
            title: "Sales Overview",
            icon: <AiOutlineStock   size={20}/>,
            link: "/merchant/sales",
            id: "/merchant/sales",
        },
    ];
};

export const PAYMENT_SIDE_NAV_DATA = (): NavLinkProps[] => {
    return [
        {
            title: "Transaction History",
            icon: <IconHistory size={20}/>,
            link: "/payment/history",
            id: "/payment/history",
        },
        {
            title: "My Earnings",
            icon: <IconNotes size={20}/>,
            link: "/payment/earnings",
            id: "/payment/earnings",
        },
        // {
        //     title: "Pay & Get Paid",
        //     icon: <IconCreditCard size={20} />,
        //     link: "/payment/pay",
        // },
        // {
        //     title: "Make Payment",
        //     icon: <IconCash size={20} />,
        //     link: "/payment/make-payment",
        // },
        {
            title: "Withdraw Fund",
            icon: <IconStepInto size={20}/>,
            link: "/payment/withdraw",
            id: "/payment/withdraw",
        },
        // {
        //     title: "Order List",
        //     icon: <IconChecklist size={20} />,
        //     link: "/payment/oder-list",
        // },
    ];
};
export const SETTINGS_SIDE_NAV_DATA = (): NavLinkProps[] => {
    return [
        {
            title: "Account",
            icon: <IconUserCircle size={20}/>,
            link: "/settings/account",
            id: "/settings/account",
        },
        {
            title: "Password & Security",
            icon: <IconKey size={20}/>,
            link: "/settings/security",
            id: "/settings/security",
        },
        {
            title: "Billing & Payments",
            icon: <IconReceipt size={20}/>,
            link: "/settings/billing",
            id: "/settings/billing",
        },
        // {
        //     title: "Membership",
        //     icon: <IconId size={20} />,
        //     link: "/settings/membership",
        // },
        // {
        //     title: "Notifications",
        //     icon: <IconNotification size={20} />,
        //     link: "/settings/notifications",
        // },
        // {
        //     title: "Languages",
        //     icon: <IconWorld size={20} />,
        //     link: "/settings/languages",
        // },
        {
            title: "Connected Accounts",
            icon: <IconLink size={20}/>,
            link: "/settings/connected-accounts",
            id: "/settings/connected-accounts",
        },
        // {
        //     title: "Help & Legal",
        //     icon: <IconHelp size={20} />,
        //     link: "/settings/homaale-privacy-policy",
        // },
    ];
};
export const HELP_SIDE_NAV_DATA = (): NavLinkProps[] => {
    return [
        {
            title: "FAQ’s",
            icon: <IconMessages size={20}/>,
            link: "/FAQs",
            id: "/FAQs",
        },
        {
            title: "Feedback",
            icon: <IconMessage2Code size={20}/>,
            link: "/feedback",
            id: "/feedback",
        },
        {
            title: "Contact",
            icon: <IconPhone size={20}/>,
            link: "/contact-us",
            id: "/contact-us",
        },
        {
            title: "Report a problem",
            icon: <IconAlertCircle size={20}/>,
            link: "/support",
            id: "/support",
        },
    ];
};
