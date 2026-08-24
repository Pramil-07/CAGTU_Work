"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Center,
    Container,
    Pagination,
    useMantineTheme,
    Select,
    Flex,
    Button,
} from "@mantine/core";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import ErrorPage from "@/components/Error/Error";
import DataTable from "@/components/DataTable/DataTable";
import apiClient from "@/axiosConfig";
import { Transaction } from "@/DataTypes/TransactionProps";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {PaymentMethod} from "@/app/cart/checkout/page";
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { LuArrowUpDown } from "react-icons/lu";

export default function Page() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [providerFilter, setProviderFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const theme = useMantineTheme();
    const [dateSort, setDateSort] = useState<string>(''); // Added for sorting

    // Ref for tab content to support dynamic height calculations
    const transactionsRef = useRef<HTMLDivElement | null>(null);

    async function fetchTransactions(
        page: number = 1,
        filters: { provider?: string; payment_status?: string; ordering?: string } = {}
    ): Promise<{
        result: Transaction[];
        total_pages: number;
        current: number;
    }> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("page", page.toString());
            if (filters.provider) queryParams.append("provider", filters.provider);
            if (filters.payment_status) queryParams.append("payment_status", filters.payment_status);
            if (filters.ordering) queryParams.append("ordering", filters.ordering);

            const response = await apiClient.get(`/payment/transaction/?${queryParams.toString()}`);
            if (!response) throw new Error("Failed to fetch transactions");
            return response.data;
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
                const transactionsData = await fetchTransactions(currentPage, { ordering: dateSort });
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
    }, [currentPage, dateSort]);

    const providerOptions = Array.from(
        new Set(transactions.map((t) => t.provider).filter((p) => p))
    ).map((provider) => ({ value: provider, label: provider }));
    const statusOptions = Array.from(
        new Set(transactions.map((t) => t.payment_status).filter((s) => s))
    ).map((status) => ({ value: status, label: status }));

    // Handle apply filter button click
    const applyFilters = async () => {
        setLoading(true);
        setError("");
        try {
            const filters = {
                provider: providerFilter || undefined,
                payment_status: statusFilter || undefined,
                ordering: dateSort || undefined,
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
        setProviderFilter(null);
        setStatusFilter(null);
        setDateSort(''); // Reset sort
        setCurrentPage(1); // Reset to first page
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

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await apiClient.get('/payment/method/');
                if (response.data && Array.isArray(response.data)) {
                    setPaymentMethods(response.data);
                    console.log("data of payment method",response.data)
                } else {
                    setError('Failed to fetch payment methods: Invalid response');
                    console.error('Invalid payment methods response:', response.data);
                }
            } catch (err) {
                setError('Error fetching payment methods. Please try again.');
                console.error('Payment methods fetch error:', err);
            }
        };

        fetchPaymentMethods();
    }, []);

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
    interface Column {
        title: React.ReactNode;
        dataIndex: string;
        key: string;
        render?: (value: any, record: any) => React.ReactNode;
    }

    const columns: Column[] = [
        {
            title: "Transaction ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Provider",
            dataIndex: "provider",
            key: "provider",
            render: (provider: string) => {
                const match = paymentMethods.find(
                    (pm) => pm.name.trim().toLowerCase() === provider.trim().toLowerCase()
                );

                return (
                    <div className="flex justify-center items-center">
                        {match?.logo ? (
                            <img
                                src={match.logo.startsWith("http") ? match.logo : `${process.env.NEXT_PUBLIC_API_URL}${match.logo}`}
                                alt={match.name}
                                className="h-8 w-auto object-contain"
                            />
                        ) : (
                            <span>{provider}</span>
                        )}
                    </div>
                );
            },
        },
        {
            title: (
                <div className="flex items-center">
                    Date
                    <button
                        className="ml-2"
                        // size="xs"
                        onClick={() =>
                            setDateSort(
                                dateSort === '' ? 'created_at' : dateSort === 'created_at' ? '-created_at' : ''
                            )
                        }
                        // color={dateSort ? 'red' : 'gray'}
                    >
                        {dateSort === '' ? (
                            <LuArrowUpDown size={16} />
                        ) : dateSort === 'created_at' ? (
                            <IconArrowUp size={16} />
                        ) : (
                            <IconArrowDown size={16} />
                        )}
                    </button>
                </div>
            ),
            dataIndex: "created_at",
            key: "date",
            render: (created_at: string) => (
                <span>{created_at ? new Date(created_at).toLocaleDateString() : ""}</span>
            ),
        },
        {
            title: "Status",
            dataIndex: "payment_status",
            key: "status",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number, record: Transaction) => (
                <span>
                    {record.currency || "AU$"} {amount || "0.00"}
                </span>
            ),
        },
        {
            title: "Type",
            dataIndex: "transaction_type",
            key: "type",
        },
    ];

    return (
 <div className="bg-white p-8 rounded-xl shadow-lg border max-w-80 md:max-w-96 lg:max-w-full overflow-x-auto relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl text-red-500 font-bold">Transaction History</h1>
            </div>
            <BreadCrumbs
            currentTitle="Transaction History"
            items={[{name: "Dashboard", href: "/dashboard"}]}
            className="hover:text-red-500 cursor-pointer py-2"
        />
            <Flex gap="md" direction={{ base: "column", sm: "row" }} mb="md">
                <Select
                    // label="provider"
                    placeholder="Filter by provider"
                    data={[{ value: "", label: "All Providers" }, ...providerOptions]}
                    value={providerFilter}
                    onChange={setProviderFilter}
                    clearable
                />
                <Select
                    // label="status"
                    placeholder="Filter by status"
                    data={[{ value: "", label: "All Statuses" }, ...statusOptions]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    clearable
                />
                <Button
                    onClick={applyFilters}
                    size="md"
                >
                    Apply Filters
                </Button>
                <Button
                    onClick={clearFilters}
                    variant="outline"
                    size={"md"}
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