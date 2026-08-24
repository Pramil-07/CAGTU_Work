"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Center,
    Container,
    Paper,
    Pagination,
    useMantineTheme,
    TextInput,
    Flex,
    Button,
} from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import ErrorPage from "@/components/Error/Error";
import DataTable from "@/components/DataTable/DataTable";
import apiClient from "@/axiosConfig";
import { User } from "@/DataTypes/TransactionProps";
import BreadCrumbs from "@/components/common/BreadCrumbs";

export default function Page() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<User[]>([]);
    // const [filteredTransactions, setFilteredTransactions] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [emailFilter, setEmailFilter] = useState("");
    const [phoneFilter, setPhoneFilter] = useState("");
    const theme = useMantineTheme();

    // Ref for tab content to support dynamic height calculations
    const transactionsRef = useRef<HTMLDivElement | null>(null);

    // Function to fetch transactions with optional filter parameters
    async function fetchTransactions(
        page: number = 1,
        filters: { username?: string; email?: string; phone?: string } = {}
    ): Promise<{
        result: User[];
        total_pages: number;
        current: number;
    }> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("page", page.toString());
            if (filters.username) queryParams.append("username", filters.username);
            if (filters.email) queryParams.append("email", filters.email);
            if (filters.phone) queryParams.append("phone", filters.phone);

            const response = await apiClient.get(`/account/profile/list/?${queryParams.toString()}`);
            if (!response || !response.data.results) {
                throw new Error("Failed to fetch transactions");
            }
            console.log("response of user", response.data.results);

            // Use the array directly as the result
            const result = response.data.results as User[];

            // Assuming no pagination metadata is returned, use defaults or fetch total_pages if available
            // If the API supports total count, you might need to adjust this (e.g., response.headers or a separate endpoint)
            const total_pages = 1; // Replace with actual logic if pagination metadata is available
            const current = page;

            return { result, total_pages, current };
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return { result: [], total_pages: 0, current: 1 };
        }
    }

    // Fetch transactions on mount and when page changes
    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            setError("");
            try {
                const transactionsData = await fetchTransactions(currentPage);
                setTransactions(transactionsData.result);
                // setFilteredTransactions(transactionsData.result);
                setTotalPage(transactionsData.total_pages);
                setCurrentPage(transactionsData.current);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to fetch transactions");
            } finally {
                setLoading(false);
            }
        };
        loadTransactions();
    }, [currentPage]);

    // Handle apply filter button click
    const applyFilters = async () => {
        setLoading(true);
        setError("");
        try {
            const filters = {
                username: nameFilter || undefined,
                email: emailFilter || undefined,
                phone: phoneFilter || undefined,
            };
            const transactionsData = await fetchTransactions(1, filters);
            setTransactions(transactionsData.result);
            setTotalPage(transactionsData.total_pages);
            setCurrentPage(1); // Reset to first page
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to fetch filtered transactions");
        } finally {
            setLoading(false);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setNameFilter("");
        setEmailFilter("");
        setPhoneFilter("");
        setCurrentPage(1); // Reset to first page
        // Fetch unfiltered data
        fetchTransactions(1).then((transactionsData) => {
            setTransactions(transactionsData.result);
            setTotalPage(transactionsData.total_pages);
            setCurrentPage(transactionsData.current);
            setLoading(false);
        }).catch((err: any) => {
            setError(err.response?.data?.detail || "Failed to fetch transactions");
            setLoading(false);
        });
    };

    if (loading) {
        return (
            <Container size="xl" py="xl">
                <Center style={{ minHeight: "100vh" }}>
                    <MithoSweetsLoader />
                </Center>
            </Container>
        );
    }

    // Define columns for DataTable
    const columns = [
        { title: "Username", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role: string[]) => role.join(", ") || "N/A",
        },
        {
            title: "First Name",
            dataIndex: "first_name",
            key: "first_name",
        },
        {
            title: "Last Name",
            dataIndex: "last_name",
            key: "last_name",
        },
        {
            title: "Phone",
            dataIndex: "extra_details",
            key: "phone",
            render: (extra_details: { phone: string | null }) => extra_details.phone || "",
        },
    ];

    return (
 <div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl text-red-500 font-bold">User List</h1>
            </div>
            <BreadCrumbs
            currentTitle="User List"
            items={[{name: "Dashboard", href: "/dashboard"}]}
            className="hover:text-red-500 cursor-pointer py-2"
        />
            <Flex gap="md" direction={{ base: "column", sm: "row" }} mb="md">
                <TextInput
                    // label="Name"
                    placeholder="Filter by Name"
                    value={nameFilter}
                    onChange={(event) => setNameFilter(event.currentTarget.value)}
                    // style={{ flex: 1 }}
                />
                <TextInput
                    // label="Email"
                    placeholder="Filter by email"
                    value={emailFilter}
                    onChange={(event) => setEmailFilter(event.currentTarget.value)}
                    // style={{ flex: 1 }}
                />
                <TextInput
                    // label="Phone"
                    placeholder="Filter by phone"
                    value={phoneFilter}
                    onChange={(event) => setPhoneFilter(event.currentTarget.value)}
                    // style={{ flex: 1 }}
                />
                <Button
                    onClick={applyFilters}
                >
                    Apply Filters
                </Button>
                <Button
                    onClick={clearFilters}
                    variant="outline"
                >
                    Clear Filters
                </Button>
            </Flex>
            <div ref={transactionsRef}>
                <DataTable columns={columns} data={transactions} />
                    {totalPage > 0 && (
                        <Center mt="xl">
                            <Pagination
                                total={totalPage}
                                value={currentPage}
                                onChange={setCurrentPage}
                                radius="xl"
                                color={theme.colors.brand[7]}
                            />
                        </Center>
                    )}
                </div>
        </div>
    );
}