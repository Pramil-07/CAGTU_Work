"use client";
import {Facebook, Instagram, Twitter} from "lucide-react";
import {useMaster} from "@/hooks/useMaster";
import React, { useEffect, useState } from "react";
import apiClient from "@/axiosConfig";
import { toast } from "@/components/common/Toast";
import { Input, useMantineTheme } from "@mantine/core";
import logo from "@/images/logo-bg.png"
import Image from "next/image";
import {AiFillTikTok, AiOutlineTikTok} from "react-icons/ai";
import Link from "next/link";

const Footer = () => {
    const { profiles } = useMaster();
    const [email, setEmail] = useState("");
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const theme = useMantineTheme();
    const [error, setError] = useState("");
    const fallbackFooter = {
        id: "default",
        profile_name: "Mitho Sweets & Snacks",
        address: {
            country: "Australia",
            street_address: "123 Sweet Street",
            suburb: "Sweetville",
            state: "NSW"
        },
        email: "info@mithosweets.com.au",
        phone: "0497936602",
        opening_day: "Monday",
        closing_day: "Sunday",
        opening_time: "9:00 AM",
        closing_time: "9:00 PM",
    };

    const handleSubscribe = async () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {
            const response = await apiClient.post("/support/newsletter/subscribe/", { email });
            toast.success(response.data.message || "Subscribed successfully");
            setEmail("");
            setError("");
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Enter a valid email!";
            toast.error(errorMessage);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    console.log("profile from footer", profiles);

    return (
        <div className="w-full  ">
            {/* Newsletter Section */}
            <div style={{ backgroundColor: theme.colors.brand[7] }} className="py-6 w-full">
                <div className="max-w-7xl mx-auto px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    {/* Left Section with Icon and Text */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-12 shadow-sm shadow-red-950 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-gray-100"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white">Sign up to Newsletter</h3>
                    </div>

                    {/* Input + Button */}
                    <div className="flex w-full sm:w-auto">
                        <input
                            type="email"
                            placeholder={error || "Enter your email"}
                            value={email}
                            onChange={handleChange}
                            className={`px-4 py-3 w-full sm:w-80 rounded-l-md focus:outline-none focus:ring-2 text-gray-700 ${
                                error
                                    ? "border border-red-500 placeholder-red-500 focus:ring-red-500"
                                    : "border border-gray-300 focus:ring-gray-400"
                            }`}
                            aria-invalid={!!error}
                        />
                        <button
                            onClick={handleSubscribe}
                            className="px-6 py-3 bg-gray-800 text-white rounded-r-md hover:bg-gray-900 transition-colors duration-200 font-medium"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <footer className="bg-gray-900 text-white w-full">
                <div className="max-w-7xl mx-auto px-5 py-12">
                    {(profiles ? profiles : [fallbackFooter]).map((profile) => (
                        <div
                            key={profile.id}
                            className="gap-8 text-sm flex flex-col sm:flex-row sm:justify-between"
                        >
        {/* Logo & Address */}
                            <div className="justify-start">
                                <div className="ml-6">
                                <Image src={logo} alt="about image" height={5} width={70} />
                                </div>
                                <h2 className="text-xl font-semibold mb-4">
                             {profile.profile_name}
                                </h2>
          <p>{profile.address.country || "Sydney, Australia"}</p>
                                <p>
                                    {profile.address.street_address}, {profile.address.suburb}, {profile.address.state}
                                </p>
          <p>ABN: 81903313582</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className={`hover:text-[${theme.colors.brand[7]}] block transform hover:translate-x-1 duration-300`}>Home</a></li>
            <li><a href="/shop" className={`hover:text-[${theme.colors.brand[7]}] block  transform hover:translate-x-1 duration-300`}>Shop</a></li>
            <li><a href="/about" className={`hover:text-[${theme.colors.brand[7]}] block transform hover:translate-x-1 duration-300`}>About</a></li>
            <li><a href="/contact" className={`hover:text-[${theme.colors.brand[7]}] block transform hover:translate-x-1 duration-300`}>Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold mb-4">Contact</h3>
                                <p>
                                    Email:{" "}
                                    <a href="mailto:info@mithosweets.com.au" className={`hover:text-[${theme.colors.brand[7]}] transform hover:translate-x-1 duration-300`}>
                                        {profile.email}
                                    </a>
                                </p>
                                <p>
                                    Phone:{" "}
                                    <a href="tel:0497936602" className={`hover:text-[${theme.colors.brand[7]}] transform hover:translate-x-1 duration-300`}>
                                        {profile.phone}
                                    </a>
                                </p>
            <div className="flex gap-4 mt-4">
                <a href="https://www.facebook.com/people/Mithosweets/61567271377885/" aria-label="Facebook"
                   className={`hover:text-[${theme.colors.brand[7]}] transform hover:translate-x-1 duration-300 `} target="_blank">
                    <Facebook size={20}/>
                </a>
                {/*<a href="#" aria-label="Twitter"*/}
                {/*   className={`hover:text-[${theme.colors.brand[7]}]  transform hover:translate-x-1 duration-300`} target="_blank">*/}
                {/*    <Twitter size={20}/>*/}
                {/*</a>*/}
                <a href="https://www.instagram.com/mithosweets/" aria-label="Instagram"
                   className={`hover:text-[${theme.colors.brand[7]}] transform hover:translate-x-1 duration-300 `} target="_blank">
                    <Instagram size={20}/>
                </a>
                <a href="https://www.tiktok.com/@mithosweets" aria-label="TikTok"
                   className={`hover:text-[${theme.colors.brand[7]}] transform hover:translate-x-1 duration-300 `} target="_blank">
                    <AiOutlineTikTok size={20}/>
                </a>
            </div>
        </div>

                            {/* Opening Time */}
                            <div className="justify-end">
                                <h3 className="font-semibold mb-4">Opening Hours</h3>
                                <p>
                                {profile.opening_day} - {profile.closing_day}
                                </p>
                                <p>
                                    {profile.opening_time} - {profile.closing_time}
                                </p>
          <div className="mt-6 space-y-2">
                                    <a href="/Legal/privacy-policy" className={`block hover:text-[${theme.colors.brand[7]}]  transform hover:translate-x-1 duration-300`}>
                                        Privacy Policy
                                    </a>
                                    <a href="/Legal/terms-and-condition" className={`block hover:text-[${theme.colors.brand[7]}]  transform hover:translate-x-1 duration-300`}>
                                        Terms & Conditions
                                    </a>
                                    <Link href="/bulk-order" className={`block hover:text-[${theme.colors.brand[7]}]  transform hover:translate-x-1 duration-300`}>Bulk Order</Link>
                                </div>
                                </div>
                                
        </div>
                    ))}
                </div>

      {/* Bottom Line */}
                <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Mitho Sweets & Snacks — Made by Mitho Sweets
      </div>
    </footer>
        </div>
  );
};

export default Footer;