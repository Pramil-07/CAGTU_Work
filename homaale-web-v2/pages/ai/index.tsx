

"use client";

import React, {useRef} from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { PAGE_INDEX } from "@/staticData/keywordsForSearch"
import Layout from "@/components/Layout/Layout"
import { useBrandData } from "@/brand/BrandContext"
import ProductCard from "@/components/ProductCard/ProductCard"
import { axiosClient } from "@/utils/axiosClient"
import CalculatorPage from "@/components/calculator";
import {ActionIcon, Container, Flex, Grid, Image, Input, TextInput, useMantineTheme} from "@mantine/core";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {IconArrowRight, IconCamera, IconMicrophone, IconX} from "@tabler/icons-react";
import Calculator from "@/components/calculator";
import AiAssistant from "@/components/AI/AiAssistant"
import SearchSidebar from "@/components/SearchSidebar";
import HotelCard, {Hotel} from "@/components/hotels/HotelCard";
import {Carousel} from "@mantine/carousel";
import {useMediaQuery} from "@mantine/hooks";
import {useSearchHistory} from "@/hooks/useSearchHistory";
import {ServiceCard} from "@/components/cards/ServiceCard";
import urls from "@/constants/urls";
import {TopCategoryProps} from "@/types/TopCategoryProps";
import Link from "next/link";
import {useLandingStyles} from "@/styles/pages/LandingStyles";
import {CategoryCard} from "@/components/common/CategoryCard";

// At the top of your file
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}


export default function SearchPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { addToHistory } = useSearchHistory();
    const [searchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [servicesLoading, setServicesLoading] = useState(false)
    const [servicesData, setServicesData] = useState<any[]>([])
    const [productsData, setProductsData] = useState<any[]>([])
    const [taskServices, setTaskServices] = useState<any[]>([]);
    const [showAI, setShowAI] = useState(false);
    const [taskServicesLoading, setTaskServicesLoading] = useState(false);
    const [topCategories, setTopCategories] = useState<TopCategoryProps["result"] | null>(null);
    const [topCategoriesLoading, setTopCategoriesLoading] = useState(false);
    const [regularServices, setRegularServices] = useState<any[]>([]);
    const [regularServicesLoading, setRegularServicesLoading] = useState(false);
    const [productSearch, setProductSearch] = useState<any[]>([]);
    const [productSearchLoading, setProductSearchLoading] = useState(false);
    const [taskerData, setTaskerData] = useState<any[]>([])
    const [taskersLoading, setTaskersLoading] = useState(false)
    const [hotelsData, setHotelsData] = useState<Hotel[]>([]);
    const [hotelsLoading, setHotelsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false)
    const [showCalculator, setShowCalculator] = useState(false)
    const [showTasks, setShowTasks] = useState(false);
    const {classes} = useLandingStyles();

    const [showServices, setShowServices] = useState(false);
    const [showProducts, setShowProducts] = useState(false);
    const [showHotels , setShowHotels] = useState(false)
    const theme = useMantineTheme();
    const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
    const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

    // console.log("tasker data",taskerData)
    const { brandData } = useBrandData()

    console.log("query",searchQuery)
    const isInitialState = !searchQuery && results.length === 0;
    const STOPWORDS = ["a", "an", "the", "of", "in", "on", "at", "for", "to", "and", "or", "is", "are", "by"]

    useEffect(() => {
        const q = searchParams.get("q") || "";
        setSearchQuery(q);

        if (q && q !== searchQuery) {
            const normalized = q.toLowerCase().trim();
            const calculatorKeyword = ["calculator", "math", "tools"]
            setShowCalculator(calculatorKeyword.some(keyword => normalized.includes(keyword)));

            const taskKeyword= ["task", "tasks", "help", "need", "hire", "job"]
            setShowTasks(taskKeyword.some(keyword => normalized.includes(keyword)));
            const serviceKeyword= ["service", "services", "repair", "clean", "fix", "maintenance", "offering"]
            setShowServices(serviceKeyword.some(keyword => normalized.includes(keyword)));
            const productKeyword = ["product", "products", "buy", "shop", "item", "sell", "item", "goods"]
            setShowProducts(productKeyword.some(keyword => normalized.includes(keyword)));

            const hotelKeywords = ["hotel", "hotels", "stay", "accommodation", "booking", "rooms", "motel"];
            setShowHotels(hotelKeywords.some(keyword => normalized.includes(keyword)));
            setSearchQuery(q);
            searchAll(q);
        }
    }, [searchParams]);

    const fetchTaskServices = async (query: string) => {
        setTaskServicesLoading(true);
        try {
            const response = await axiosClient.get(
                `/task/entity/service/?is_requested=true&search=${encodeURIComponent(query)}`
            );
            setTaskServices(response.data.results || []);
        } catch (e) {
            console.error(e);
            setTaskServices([]);
        } finally {
            setTaskServicesLoading(false);
        }
    };

    useEffect(() => {
        const fetchTopCategories = async () => {
            setTopCategoriesLoading(true);
            try {
                const response = await axiosClient.get(`${urls.category.top}?page_size=12&ordering=priority`)
                setTopCategories(response.data.result || []);
                console.log("top cateogories", response.data.result || []);
            } catch (e) {
                console.error(e);
            } finally {
                setTopCategoriesLoading(false);
            }
        };
        fetchTopCategories();
    },[])

    const fetchRegularServices = async (query: string) => {
        setRegularServicesLoading(true);
        try {
            const response = await axiosClient.get(
                `/task/entity/service/?is_requested=false`
            );
            setRegularServices(response.data.result || []);
        } catch (e) {
            console.error(e);
            setRegularServices([]);
        } finally {
            setRegularServicesLoading(false);
        }
    };

    const fetchProductSearch = async (query: string) => {
        setProductSearchLoading(true);
        try {
            const response = await axiosClient.get(
                `/product/search/`
            );
            setProductSearch(response.data.results || []);
        } catch (e) {
            console.error(e);
            setProductSearch([]);
        } finally {
            setProductSearchLoading(false);
        }
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice recognition");
            return;
        }

        const recognition = new (SpeechRecognition as any)(); // cast to any for TS
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript); // update input state
            addToHistory(transcript);   // add to search history
            window.location.assign(`/ai?q=${encodeURIComponent(transcript)}`); // navigate
        };

        recognition.onerror = (event: any) => {
            console.error("Voice recognition error:", event.error);
        };

        recognition.start();
    };


    /** Unified search for PAGE_INDEX + explore + APIs */
    const searchAll = async (query: string) => {
        setLoading(true)

        // --- PAGE_INDEX search ---
        const terms = query
            .toLowerCase()
            .split(/\s+/)
            .filter((t) => t.length > 0 && !STOPWORDS.includes(t))

        const pageResults = PAGE_INDEX.map((page) => {
            let score = 0
            terms.forEach((term) => {
                page.keywords.forEach((keyword) => {
                    const words = keyword.toLowerCase().split(/\s+/)
                    if (words.includes(term)) score += 1
                })
            })
            return { ...page, score, isRoute: false }
        }).filter((page) => page.score > 0)

        // --- Explore route ---
        const exploreResult = {
            path: `/explore?search=${encodeURIComponent(query)}`,
            title: "Explore",
            description: `Explore results for "${query}"`,
            score: -1,
            isRoute: true,
        }
        const fetchHotels = async (query: string) => {
            // Only fetch if the query contains "hotel" (case-insensitive)
            // if (!query.toLowerCase().includes("hotel")) return;

            setHotelsLoading(true);
            try {
                const response = await axiosClient.get('/hotel/list/');
                if (response.data.result) setHotelsData(response.data.result);
            } catch (err) {
                console.error("Error fetching hotels:", err);
                setHotelsData([]);
            } finally {
                setHotelsLoading(false);
            }
        };


        const apiResults: any[] = []
        try {
            const urls = [
                `/task/entity/service/?is_requested=null&page_size=9&page=1&search=${encodeURIComponent(query)}&category=`,
                `/task/entity/service/?is_requested=null&page_size=9&page=1&search=${encodeURIComponent(query)}&category=`,
                `/product/search/?search=${encodeURIComponent(query)}&page=1`,
                `/tasker/?page_size=9&page=1&search=${encodeURIComponent(query)}`,
            ]

            for (const url of urls) {
                const response = await axiosClient.get(url)
                if (response.data.status === "success" && response.data.results) {
                    const mapped = response.data.results.map((item: any) => ({
                        path: url.includes("product") ? `/products/${item.id}` : `/service/${item.id}`,
                        title: item.title || item.name,
                        description: item.description || "",
                        score: 1,
                        isRoute: false,
                    }))
                    apiResults.push(...mapped)
                }
            }
        } catch (err) {
            console.error("Error fetching API results:", err)
        }

        const allResults = [exploreResult, ...pageResults, ...apiResults]
        allResults.sort((a, b) => (b.score || 0) - (a.score || 0))

        setResults(allResults)
        setLoading(false)

        // fetch services/products separately
        fetchServicesAndProducts(query)
        fetchTasker(query)
        fetchHotels(query);
        fetchTaskServices(query);
        fetchRegularServices(query);
        fetchProductSearch(query);
    }

    const fetchServicesAndProducts = async (query: string) => {
        setServicesLoading(true)

        try {
            const servicesRes = await axiosClient.get(`/service/search/?search=${encodeURIComponent(query)}`)
            if (servicesRes.data.status === "success") setServicesData(servicesRes.data.results || [])

            const productsRes = await axiosClient.get(`/products/search/?search=${encodeURIComponent(query)}`)
            if (productsRes.data.status === "success") setProductsData(productsRes.data.results || [])
        } catch (err) {
            console.error("Error fetching services/products:", err)
        } finally {
            setServicesLoading(false)
        }
    }

    const fetchTasker = async (query: string) => {
        setTaskersLoading(true)

        try {
            const taskerRes = await axiosClient.get(`/tasker/?page_size=9&page=1&search=${encodeURIComponent(query)}`)
            // console.log("tasker response",taskerRes.data.result)
            setTaskerData(taskerRes.data.result || [])
        } catch (err) {
            console.error("Error fetching taskers:", err)
        } finally {
            setTaskersLoading(false)
        }
    }

    const handleNewSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const query = formData.get("search")?.toString().trim();
        if (!query) return;

        addToHistory(query);

        window.location.assign(`/ai?q=${encodeURIComponent(query)}`);
    };


    const handleResultClick = (result: any) => {
        router.push(`${result.path}`)
    }

    const clearSearch = () => setSearchQuery("");


    if (isInitialState) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center flex-1 w-full px-4">
                    <div className="mb-12 flex w-96 h-20 gap-2">
                        <Image
                            src={brandData.aiIcon || "/placeholder.svg"}
                            alt="Brand logo"
                            onClick={() => {
                                // router.push("/ai");
                                window.location.reload();
                            }}
                            className="object-contain cursor-pointer"
                        />
                    </div>

                    <form onSubmit={handleNewSearch} className="w-full max-w-3xl">
                        <div
                            className={`relative transition-all duration-300 ${
                                isFocused ? "transform scale-[1.01]" : ""
                            }`}
                        >
                            <div
                                className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-30"></div>

                            <div className="relative bg-white rounded-full border border-gray-300">
                                <div className="flex items-center gap-2 pl-4 pr-2 py-1">
                                    <div
                                        className={`transition-all duration-300 ${
                                            isFocused ? "text-blue-600 scale-110" : "text-gray-400"
                                        }`}
                                    >
                                        <Search size={20} strokeWidth={2.5}/>
                                    </div>

                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search pages..."
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const q = (e.target as HTMLInputElement).value;
                                                router.push(`/ai?q=${encodeURIComponent(q)}`);
                                            }
                                        }}

                                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base font-medium py-2 w-full"
                                    />

                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={handleVoiceSearch}
                                    >
                                        <IconMicrophone size={18} strokeWidth={2.5}/>
                                    </button>

                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <IconCamera size={18} strokeWidth={2.5}/>
                                    </button>

                                    <button
                                        type="submit"
                                        className="group relative px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                                    >
                                        <span className="relative z-10">Search</span>
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    /* --------------------------------------------------------------
       MAIN PAGE (sidebar + results)
    -------------------------------------------------------------- */
    return (
        <div className="flex min-h-screen bg-white font-sans">

            {/* Header */}
            {/*<div className="border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 bg-white z-10">*/}
            {/*    <div className="max-w-4xl mx-auto">*/}
            {/*        <h1 className="text-2xl font-semibold mb-4 text-gray-900">Search Results</h1>*/}
            {/*        <form onSubmit={handleNewSearch} className="flex gap-2">*/}
            {/*        <form onSubmit={handleNewSearch} className="flex gap-2">*/}
            {/*        <form onSubmit={handleNewSearch} className="flex gap-2">*/}
            {/*            <div className="flex-1 relative">*/}
            {/*                <Search size={18} className="absolute left-3 top-3 text-gray-400" />*/}
            {/*                <input*/}
            {/*                    type="text"*/}
            {/*                    name="search"*/}
            {/*                    defaultValue={searchQuery}*/}
            {/*                    placeholder="Search pages..."*/}
            {/*                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"*/}
            {/*                />*/}
            {/*            </div>*/}
            {/*            <button*/}
            {/*                type="submit"*/}
            {/*                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium"*/}
            {/*            >*/}
            {/*                Search*/}
            {/*            </button>*/}
            {/*        </form>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className="flex-1 flex flex-col">
                <div className="border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 bg-white z-10">
                    <div className="max-w-6xl  flex gap-6 items-center">
                        <div className="relative w-44 h-14 flex items-center">
                            <Image
                                src={brandData.aiIcon}
                                alt="Brand logo"
                                onClick={() => (window.location.href = "/ai")}
                                className="object-contain cursor-pointer"
                            />
                        </div>

                        <form onSubmit={handleNewSearch} className="relative flex-1 max-w-3xl">
                            <div
                                className={`relative transition-all duration-300 ${
                                    isFocused ? "transform scale-[1.01]" : ""
                                }`}
                            >
                                {/* Keep the subtle outer glow */}
                                <div
                                    className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-30"></div>

                                <div className="relative bg-white rounded-full border border-gray-300">
                                    <div className="flex items-center gap-2 pl-4 pr-2 py-1">
                                        {/* Search icon – unchanged */}
                                        <div
                                            className={`transition-all duration-300 ${
                                                isFocused ? "text-blue-600 scale-110" : "text-gray-400"
                                            }`}
                                        >
                                            <Search size={20} strokeWidth={2.5}/>
                                        </div>

                                        <input
                                            type="text"
                                            name="search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search pages..."
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    if (searchQuery.trim()) {
                                                        addToHistory(searchQuery.trim());
                                                        window.location.assign(`/ai?q=${encodeURIComponent(searchQuery.trim())}`);
                                                    }
                                                }
                                            }}
                                            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base font-medium py-2 w-full"
                                        />

                                        {/* Voice button */}
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <IconMicrophone size={18} strokeWidth={2.5}/>
                                        </button>

                                        {/* Camera button */}
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <IconCamera size={18} strokeWidth={2.5}/>
                                        </button>

                                        {/* Search magnifier button (mirrors the big Search button) */}
                                        <button
                                            type="submit"
                                            className="group relative px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                                        >
                                            <span className="relative z-10">Search</span>
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div>
                        <button
                            onClick={() => setShowAI(prev => !prev)}
                            className="fixed top-6 right-6 px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-pink-500 to-red-600 shadow-xl shadow-red-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/50 hover:scale-110 active:scale-95"
                        >
                            AI Response
                        </button>
                    </div>
                </div>
                <div className="flex flex-1 min-h-screen">
                    {/* Sidebar */}
                    <div className="flex-shrink-0 ">
                        <SearchSidebar currentQuery={searchQuery}/>
                    </div>
                    <div className="flex-1 flex flex-col px-4 sm:px-6 py-4 overflow-y-auto">
                        {showAI && (
                            <AiAssistant query={searchQuery}/>
                        )}
                        {/* Results */}
                        <p className="text-sm text-gray-600 mb-2">
                            About <span className="font-medium">{results.length}</span> results for{" "}
                            <span className="font-semibold text-black">{searchQuery}</span>
                        </p>
                        <div className="max-w-7xl mx-4 px-4 sm:px-6 pb-4 sm:pb-6">
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <HomaaleLoader/>
                                </div>
                            ) : results.length > 0 ? (
                                <div>
                                    {/*<p className="text-sm text-gray-600 mb-2">*/}
                                    {/*    About <span className="font-medium">{results.length}</span> results for{" "}*/}
                                    {/*    <span className="font-semibold text-black">{searchQuery}</span>*/}
                                    {/*</p>*/}
                                    {showCalculator && (
                                        <div className="mt-2 mb-2 border-b border-gray-200 pb-8">
                                            <Calculator/>
                                        </div>
                                    )}
                                    {!taskServicesLoading && showTasks && taskServices.length > 0 && (
                                        <div>
                                            {/*<h2 className="text-2xl font-semibold mb-4 text-gray-900">*/}
                                            {/*    Tasks*/}
                                            {/*</h2>*/}
                                            <Carousel
                                                loop
                                                withIndicators={false}
                                                withControls={!isXs || taskServices.length > 0}
                                                align="start"
                                                slideGap="md"
                                                slidesToScroll={1}
                                                slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "25%"}
                                                height="auto"
                                                className="max-w-7xl py-2"
                                                draggable
                                                styles={{
                                                    control: {
                                                        backgroundColor: theme.colors.brand[3],
                                                        border: "none",
                                                        width: 10,
                                                        height: 10,
                                                        "&:hover": { backgroundColor: theme.colors.brand[7] },
                                                    },
                                                }}
                                            >
                                                {taskServices.map((svc) => (
                                                    <Carousel.Slide key={svc.id}>
                                                        <ServiceCard service={svc} />
                                                    </Carousel.Slide>
                                                ))}
                                            </Carousel>
                                        </div>
                                    )}
                                    {!regularServicesLoading && showServices && regularServices.length > 0 && (
                                        <div>
                                            {/*<h2 className="text-2xl font-semibold mb-4 text-gray-900">*/}
                                            {/*    Services of {brandData.name}*/}
                                            {/*</h2>*/}
                                            <Carousel
                                                loop
                                                withIndicators={false}
                                                withControls={!isXs || regularServices.length > 0}
                                                align="start"
                                                slideGap="md"
                                                slidesToScroll={1}
                                                slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "25%"}
                                                height="auto"
                                                className="max-w-7xl py-2"
                                                draggable
                                                styles={{
                                                    control: {
                                                        backgroundColor: theme.colors.brand[3],
                                                        border: "none",
                                                        width: 10,
                                                        height: 10,
                                                        "&:hover": { backgroundColor: theme.colors.brand[7] },
                                                    },
                                                }}
                                            >
                                                {regularServices.map((svc) => (
                                                    <Carousel.Slide key={svc.id}>
                                                        <ServiceCard service={svc} />
                                                    </Carousel.Slide>
                                                ))}
                                            </Carousel>
                                        </div>
                                    )}
                                    {!productSearchLoading && showProducts && productSearch.length > 0 && (
                                        <div>
                                            {/*<h2 className="text-2xl font-semibold mb-4 text-gray-900">*/}
                                            {/*    Products*/}
                                            {/*</h2>*/}
                                            <Carousel
                                                loop
                                                withIndicators={false}
                                                withControls={!isXs || productSearch.length > 0}
                                                align="start"
                                                slideGap="md"
                                                slidesToScroll={1}
                                                slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "25%"}
                                                height="auto"
                                                className="max-w-7xl py-2"
                                                draggable
                                                styles={{
                                                    control: {
                                                        backgroundColor: theme.colors.brand[3],
                                                        border: "none",
                                                        width: 10,
                                                        height: 10,
                                                        "&:hover": { backgroundColor: theme.colors.brand[7] },
                                                    },
                                                }}
                                            >
                                                {productSearch.map((prod) => (
                                                    <Carousel.Slide key={prod.id}>
                                                        <ProductCard products={prod} />
                                                    </Carousel.Slide>
                                                ))}
                                            </Carousel>
                                        </div>
                                    )}
                                    {/* Hotels Section */}
                                    {!hotelsLoading && showHotels && (
                                        <Carousel
                                            loop
                                            withIndicators={false}
                                            withControls={!isXs || hotelsData.length > 0}
                                            align="start"
                                            slideGap="md"
                                            slidesToScroll={1}
                                            slideSize={isXs ? "85%" : isSm ? "50%" : isMd ? "33.333%" : "25%"}
                                            height="auto"
                                            className="max-w-7xl  py-2"
                                            draggable
                                            styles={{
                                                control: {
                                                    backgroundColor: theme.colors.brand[3],
                                                    border: "none",
                                                    width: 10,
                                                    height: 10,
                                                    "&:hover": {backgroundColor: theme.colors.brand[7]},
                                                },
                                            }}
                                        >
                                            {hotelsData.map((hotel) => (
                                                <Carousel.Slide key={hotel.id}>
                                                    <div className="px-2"> {/* ← This adds breathing room */}
                                                        <HotelCard hotel={hotel} compact={true}/>
                                                    </div>
                                                </Carousel.Slide>
                                            ))}
                                        </Carousel>
                                    )}
                                    <div className="space-y-5">
                                        {results.map((result) => (
                                            <div
                                                key={result.path + result.title}
                                                className="group cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded transition"
                                                onClick={() => handleResultClick(result)}
                                            >
                                                <p className="text-sm text-green-700 mb-1 font-medium">
                                                    {`${brandData.metaData.ogUrl.replace(/\/$/, "")}/${result.path.replace(/^\//, "")}`}
                                                </p>
                                                <h2 className="text-xl text-blue-600 group-hover:underline font-medium mb-1">{result.title}</h2>
                                                <p
                                                    className="text-gray-700 text-sm leading-relaxed line-clamp-2"
                                                    dangerouslySetInnerHTML={{__html: result.description}}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <Search size={56} className="mx-auto mb-6 text-gray-300"/>
                                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                        {searchQuery ? `No results found for "${searchQuery}"` : "Start searching"}
                                    </h2>
                                    <p className="text-gray-600">
                                        {searchQuery
                                            ? "Try different keywords or check your spelling"
                                            : "Type something in the search box above to begin"}
                                    </p>
                                </div>
                            )}

                            {/* Services / Products / Taskers */}
                            {searchQuery && (
                                <>
                                    {!servicesLoading && servicesData.length > 0 && (
                                        <div className="mt-6 pt-8 border-t border-gray-200">
                                            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Services</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {servicesData.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="group cursor-pointer hover:shadow-lg transition p-4 border border-gray-200 rounded-lg"
                                                        onClick={() => router.push(`/service/${service.id}`)}
                                                    >
                                                        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600">
                                                            {service.title || service.name}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{service.description}</p>
                                                        <p className="text-blue-600 font-medium text-sm">View Service
                                                            →</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!servicesLoading && productsData.length > 0 && (
                                        <div className="mt-12 pt-8 border-t border-gray-200">
                                            {/*<h2 className="text-2xl font-semibold mb-6 text-gray-900">Products</h2>*/}
                                            <div
                                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                                {productsData.map((product) => (
                                                    <div key={product.id}>
                                                        <ProductCard products={product}/>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* We Also Provide (Top Categories) */}


                                    {!taskersLoading && taskerData.length > 0 && (
                                        <div className=" pt-2 border-t border-gray-200">
                                            <div className=" gap-4 md:gap-6">
                                                {taskerData.map((tasker) => (
                                                    <div
                                                        key={tasker.id}
                                                        onClick={() => router.push(`/tasker/${tasker.user.id}`)}
                                                        className="group cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded transition"
                                                    >
                                                        <p className="text-sm text-green-700 mt-2 font-medium">
                                                            {`${brandData.metaData.ogUrl.replace(/\/$/, "")}/tasker`}
                                                        </p>
                                                        <h2 className="text-xl text-blue-600 group-hover:underline font-medium mb-1">{tasker.full_name}</h2>
                                                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2"
                                                           dangerouslySetInnerHTML={{__html: tasker.bio}}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!topCategoriesLoading && topCategories && (
                                        <div className="mt-6 mb-6">
                                            {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                                We also provide
                                            </h3>*/}

                                            {/*<div
                                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {topCategories?.map((cat: any) => (
                                                    <div
                                                        key={cat.id}
                                                        className="flex flex-col items-center justify-center px-3 py-4 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                                                        onClick={() => router.push(`/category/${cat.slug}`)}
                                                    >
                                                        <div
                                                            className="w-12 h-12 mb-2 flex items-center justify-center"
                                                            dangerouslySetInnerHTML={{__html: cat.icon}}
                                                        />

                                                        <p className="text-sm font-medium text-gray-700 text-center">
                                                            {cat.category}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>*/}
                                            <section className={classes.category} id={"category-section"}>
                                                <Container size={"xl"}>
                                                    <Flex mb={3}>
                                                        <h3>We also provide</h3>
                                                        <Link href={"/category"} className="more__link flex">
                                                            View More <IconArrowRight/>
                                                        </Link>
                                                    </Flex>
                                                    <Grid mb={80}>
                                                        {topCategories?.map(
                                                            (item, index) => (
                                                                <Grid.Col
                                                                    md={2}
                                                                    sm={4}
                                                                    xs={6}
                                                                    span={6}
                                                                    key={index}
                                                                    display={"flex"}
                                                                >
                                                                    <CategoryCard data={item}/>
                                                                </Grid.Col>
                                                            )
                                                        )}
                                                    </Grid>
                                                </Container>
                                            </section>
                                        </div>
                                    )}

                                    {servicesLoading && (
                                        <div className="mt-12 pt-8 border-t border-gray-200">
                                            <p className="text-center text-gray-500">Loading services and
                                                products...</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // </Layout>
    )
}
