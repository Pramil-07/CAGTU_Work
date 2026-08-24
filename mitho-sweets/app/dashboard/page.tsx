"use client";
import React from "react";
import { Title, Text, useMantineTheme } from "@mantine/core";
import BreadCrumbs from "@/components/common/BreadCrumbs";

export default function DashboardHome() {
    const theme = useMantineTheme();
  
  return (
    <div className="text-black">
      <h1 className="text-2xl text-orange-500 font-bold mb-3" style={{color : theme.colors.brand[6]}}>Dashboard</h1>
      <BreadCrumbs
            currentTitle="Dashboard"
            className="hover:text-red-500 cursor-pointer"
        />
    <div className="bg-white flex flex-col items-center p-24 rounded-xl shadow-lg">
      
      <Title order={2} className="md:text-3xl font-semibold text-orange-600 mb-2 text-center" style={{color: theme.colors.brand[6]}}>
        Welcome to the Mitho Sweets Dashboard
      </Title>

      <Text className="text-gray-600 text-center text-sm md:text-base mt-4">
        Use the dashboard to manage orders, track inventory, and view sales insights.
      </Text>
    </div>
    </div>
  
  );
}
