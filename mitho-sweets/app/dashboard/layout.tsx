"use client";
import React, {useEffect, useState} from "react";
import {FiBox, FiBarChart2, FiMenu, FiBook, FiAirplay, FiChevronDown, FiChevronRight} from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdOutlineDashboard } from "react-icons/md";
import classNames from "classnames";
import { Drawer, ScrollArea } from "@mantine/core";
import {BiCategory, BiSolidOffer} from "react-icons/bi";
import { TbCopyPlus } from "react-icons/tb";
import { BsCartCheck } from "react-icons/bs";
import { AiOutlineTransaction } from "react-icons/ai";
import {PiTag} from "react-icons/pi";
import apiClient from "@/axiosConfig";
import {useAuth} from "@/lib/AuthContext";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import {FaRegUser} from "react-icons/fa";
import {CgCopy} from "react-icons/cg";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {isLoggedIn} = useAuth();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = unknown

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <MdOutlineDashboard className="mr-2" /> },
    { label: "User", path: "/dashboard/user-list", icon: <FaRegUser  className="mr-2" /> },
    { label: "Product", path: "/dashboard/product", icon: <FiBox className="mr-2" /> },
    { label: "Orders", path: "/dashboard/orders", icon: <BsCartCheck className="mr-2" /> },
    { label: "Product Analytics", path: "/dashboard/product-analytics", icon: <FiBarChart2 className="mr-2" /> },
    { label: "Transaction History", path: "/dashboard/transaction-history", icon: <AiOutlineTransaction className="mr-2" /> },
    { label: "Offers", path: "/dashboard/offers", icon: <BiSolidOffer className="mr-2" /> },
    { label: "Blog", path: "/dashboard/blog", icon: <FiBook className="mr-2" /> },
    { label: "Brand", path: "/dashboard/brand", icon: <FiAirplay className="mr-2" /> },
    { label: "Bulk Order", path: "/dashboard/bulk-order", icon: <TbCopyPlus className="mr-2" /> },    
    {
      label: "Category",
      icon: <BiCategory size={18} className="mr-2"/>,
      children: [
        {label: "All Category", path: "/dashboard/category"},
        {label: "Top Category", path: "/dashboard/category/top-category"},
      ],
    },
    {label: "Tag", path: "/dashboard/tag", icon: <PiTag size={18} className="mr-2"/>},
    {
      label: "Legal",
      path: "/dashboard/legal",
      icon: <CgCopy size={18} className="mr-2"/>
    },

  ];

  const NavLinks = () => {
    const router = useRouter();

    // Automatically open groups if current path matches any child
    const initialOpenGroups = navItems.reduce((acc, item) => {
      if (item.children?.some((child) => child.path === pathname)) {
        acc[item.label] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenGroups);

    const toggleGroup = (label: string) => {
      setOpenGroups((prev) => ({...prev, [label]: !prev[label]}));
    };

    return (
    <nav className="max-h-[95vh] overflow-y-auto w-[220px] ">
          {navItems.map((item) =>
              item.children ? (
                  <div key={item.label}>
                    <button
                        className="w-full text-left px-4 py-3 rounded-lg font-medium flex items-center justify-between hover:bg-red-100 text-gray-800 "
                        onClick={() => toggleGroup(item.label)}
                    >
                      <span className="flex items-center">{item.icon}{item.label}</span>
                      <span>{openGroups[item.label] ? <FiChevronDown/> : <FiChevronRight/>}</span>
                    </button>

                    {openGroups[item.label] && (
                        <div className="ml-6 flex flex-col">
                          {item.children.map((child) => (
                              <Link
                                  key={child.path}
                                  href={child.path}
                                  className={classNames(
                                      "px-4 py-2 rounded-lg text-sm flex items-center",
                                      {
                                        "bg-[#ff3355] text-white": pathname === child.path,
                                        "hover:bg-red-100 text-gray-800": pathname !== child.path,
                                      }
                                  )}
                                  onClick={() => setDrawerOpened(false)}
                              >
                                {child.label}
                              </Link>
                          ))}
                        </div>
                    )}
                  </div>
              ) : (
                  <Link
                      key={item.path}
                      href={item.path}
                      className={classNames(
                          "w-full text-left px-4 py-3 rounded-lg gap-2 font-medium transition flex items-center",
                          {
                            "bg-[#ff3355] text-white border border-white": pathname === item.path,
                            "hover:bg-red-100 text-gray-800 border border-transparent": pathname !== item.path,
                          }
                      )}
                      onClick={() => setDrawerOpened(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
              )
          )}
        </nav>
    );
  };

  useEffect(() => {
    if (hasAccess === false) {
      const timer = setTimeout(() => {
        router.replace("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasAccess, router]);


  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoggedIn) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/account/customer/profile/");
        const userRole = response.data.data.role;

        if (userRole.includes("Admin")) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [isLoggedIn]);


  if (loading) {
    return (
        <div className="min-h-screen items-center flex justify-center">
          <MithoSweetsLoader/>
        </div>
    );
  }

  if (hasAccess === false) {
    return (
        <div className="min-h-screen items-center flex justify-center">
          <MithoSweetsLoader/>
        </div>
    );
  }
  return (
      <>
        {/* Mobile Navbar */}
        <div
            className="md:hidden gap-5 top-0 left-0 right-0 bg-red-600 shadow-md flex items-center justify-between px-4 h-14 z-50">
          <div className="font-bold text-lg text-white">Dashboard</div>
          <button
              aria-label="Open menu"
              onClick={() => setDrawerOpened(true)}
              className="text-2xl text-white"
          >
            <FiMenu/>
          </button>
        </div>

        {/* Mantine Drawer */}
        <Drawer
            opened={drawerOpened}
            onClose={() => setDrawerOpened(false)}
            padding="md"
            size="250px"
            withCloseButton={true}
            zIndex={60}
            overlayProps={{opacity: 0.55, blur: 3}}
        >
          <ScrollArea style={{height: "100vh"}}>
            <NavLinks/>
          </ScrollArea>
        </Drawer>

        {/* Main layout */}
        <div className="flex mb-20 min-h-screen bg-gray-50 pt-14 md:pt-0">
          <div className="hidden md:block w-64 bg-white shadow-lg p-6 space-y-4 border-r sticky top-0">
            <NavLinks/>
          </div>

          <main className="flex-1 p-10">{children}</main>
        </div>
      </>
  );
}
