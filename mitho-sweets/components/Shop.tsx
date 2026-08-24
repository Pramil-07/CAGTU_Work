"use client"

import React, { useState, useEffect, ChangeEvent } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
    Container,
    Grid,
    TextInput,
    Select,
    Paper,
    Text,
    Loader,
    Center,
    Stack,
    Group,
    RangeSlider,
    Checkbox,
    ActionIcon,
    Pagination,
    useMantineTheme,
    Button,
    Drawer,
    Burger,
} from "@mantine/core"
import { IconSearch, IconGridDots, IconList, IconFilter } from "@tabler/icons-react"
import apiClient from "@/axiosConfig"
import Empty from "@/components/Empty"
import ProductDisplay from "@/components/ProductDisplay"
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader"
import BreadCrumbs from "@/components/common/BreadCrumbs";
import {useCategories} from "@/lib/hooks/useCategory";
import {CiFilter} from "react-icons/ci";
import {LuFilter, LuFilterX} from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";
import Error from  "@/components/Error/Error"
import NoDataPage from "@/components/Error/NoDataPage";
import { useTags } from "@/lib/hooks/useProductTag"
import logo from "@/images/logo-bg.png"
import {FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa"

interface Product {
    id: number | string
    name: string
    price: number
    average_rating: number
    currency?: {
        code?: string
}
    stock?: {
        price?: number
        mrp?: number
    }
    slug?: string
    [key: string]: any
}

export default function Shop() {
    const filterOptions: string[] = [
        "All Products",
        "Featured",
        "Best Selling",
        "Price, low to high",
        "Price, high to low",
    ]

    // const categories: string[] = [
    //     "Shop & Bag",
    //     "Electronics",
    //     "Clothing",
    //     "Home",
    //     "Sports",
    //     "Beauty",
    //     "Accessories",
    // ]

    const [displayProducts, setDisplayProducts] = useState<Product[]>([])
    const [query, setQuery] = useState<string>("")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedFilter, setSelectedFilter] = useState<string>(filterOptions[0])
    const [applyFilter, setApplyFilter] = useState(false)
    const [priceRange, setPriceRange] = useState<[number, number] >([0, 2000])
    const [newProducts , setNewProducts] = useState<Product[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false)
    const {categories} = useCategories();
    const {tags} = useTags()
    const [appliedCategories, setAppliedCategories] = useState<string[]>([])
        const [appliedTags, setAppliedTags] = useState<string[]>([])
    const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number] | null>(null)
    const itemsPerPage = 12
    const searchParams = useSearchParams()
    const theme = useMantineTheme()
    const router = useRouter()
    const category = searchParams.get("category") || ""
    const tag = searchParams.get("tags") ||  ""
    const idQuery = searchParams.get("id") || ""
    const idQueryTag = searchParams.get("idTag") || ""
    const urlQuery = searchParams.get("query") || ""
    console.log("id of shop cat",idQuery)

    useEffect(() => {
        if (idQuery) {
            // Check if idQuery matches any category slug
            const matchingCategory = categories.find((cat) => cat.slug === idQuery || cat.id.toString() === idQuery)
            if (matchingCategory && !selectedCategories.includes(matchingCategory.slug ?? "")) {
                setSelectedCategories([matchingCategory.slug ?? ""])
                setAppliedCategories([matchingCategory.slug ?? ""]) // Also apply the category immediately
            }
        }
        if(idQueryTag ){
     const matchingTag = tags.find((tag) => tag.slug === idQueryTag || tag.id.toString() === idQueryTag)
                          if (matchingTag && !selectedTags.includes(matchingTag.slug ?? "")) {
                setSelectedTags([matchingTag.slug ?? ""])
                setAppliedTags([matchingTag.slug ?? ""]) // Also apply the tag immediately
            }
        }
        
        
                   

        
    }, [idQuery, categories,tags])

    const fetchProducts = async (
        filter: string,
        category: string = "",
                tag: string= "",
        query: string = "",
        categories: string[] = [],
        appliedTags: string[]=[],
        priceRange?: [number, number] | null
    ) => {
        try {
            setIsLoading(true)
            let endpoint = "/product/list"
            const queryParams = new URLSearchParams()

            if (filter === "Featured" || filter === "Best Selling") {
                queryParams.set("product_status", "Featured")
            }
      
            if (categories?.length > 0 ){
             categories.forEach((slug) => queryParams.append("category__slug", slug))
            }

            else {
            queryParams.set("category__slug", category)
            }

             if (appliedTags?.length > 0) {
                appliedTags.forEach((slug) => queryParams.append("tag_name", slug))
             }
            else  {
                if(applyFilter){
                    queryParams.set("tag_name", tag)
                }
             }
     
              if (query) {
                queryParams.set("query", query)
            }
          if(applyFilter){
            if (priceRange) {
                queryParams.set("price_gte", String(priceRange[0]))
                queryParams.set("price_lte", String(priceRange[1]))
            }

          }
           
            if (queryParams.toString()) {
                endpoint += `?${queryParams.toString()}`
            }

            const response = await apiClient.get<{ result: Product[] }>(endpoint)
            let products = response.data.result

            products = products.map((product) => ({
                ...product,
                price: product.stock?.price ?? product.price,
            }))

            if (filter === "Price, low to high") {
                products = [...products].sort((a, b) => a.price - b.price)
            } else if (filter === "Price, high to low") {
                products = [...products].sort((a, b) => b.price - a.price)
            }

            setDisplayProducts(products)
        } catch (error) {
            console.error("Error fetching products:", error)
            setDisplayProducts([])
        } finally {
            setIsLoading(false)
        }
    }

const newProduct = async () => {
        try {
            const response = await apiClient.get("/product/list")
            setNewProducts(response.data.result)
            console.log("data of new prodcts", response.data.result);
        }catch (error) {
            console.error("Error fetching products:", error)
            setDisplayProducts([])
    }
}
    useEffect(() => {
        newProduct()
    }, []);

    useEffect(() => {
        setQuery(urlQuery)
        fetchProducts(selectedFilter,category,tag,urlQuery,appliedCategories, appliedTags, appliedPriceRange)
    }, [selectedFilter, category,tag, urlQuery, appliedCategories, appliedTags, appliedPriceRange])




    const handleInputChange = (value: string) => {
        setQuery(value)
        setCurrentPage(1)
    }

    const handleApplyFilters = () => {
        setAppliedCategories(selectedCategories)
        setAppliedTags(selectedTags)
        setAppliedPriceRange(priceRange)
        setCurrentPage(1)
        setApplyFilter(true)
        router.replace("/shop")
        setDrawerOpened(false)
    }
      const handleClearFilters = () => {
        setApplyFilter(false)
        setSelectedCategories([])
        setAppliedCategories([])
        setSelectedTags([])
        setAppliedTags([])
        setCurrentPage(1)
        setApplyFilter(false)
        setDrawerOpened(false)
        router.push("/shop")
    }
    


    const handleCategoryChange = (categorySlug: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories([...selectedCategories, categorySlug])
        } else {
            setSelectedCategories(selectedCategories.filter((cat) => cat !== categorySlug))
        }
        setCurrentPage(1)
    }
  const handleTagChange = (tagSlug: string, checked: boolean) => {
  setSelectedTags(prevTags => {
    const updatedTags = checked
      ? [...prevTags, tagSlug]
      : prevTags.filter(cat => cat !== tagSlug)

    console.log("updated tags", updatedTags)
    return updatedTags
  })

  setCurrentPage(1)
}

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = event.target.value
        setSelectedFilter(selectedOption)
        setCurrentPage(1)
    }

    const filteredProducts =
        query && !urlQuery
            ? displayProducts.filter((item) =>
                item.name.toLowerCase().includes(query.toLowerCase())
            )
            : displayProducts

    const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage)
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => {
            if (index < Math.floor(rating)) {
                return (
                    <FaStar size={13.5} key={index} className="text-yellow-400 inline" />
                );
            } else if (index < rating && rating % 1 >= 0.5) {
                return (
                    <FaStarHalfAlt
                        size={13}
                        key={index}
                        className="text-yellow-400 inline"
                    />
                );
            } else {
                return (
                    <FaRegStar size={13} key={index} className="text-gray-300 inline" />
                );
            }
        });
    };

    return (
        <div className="w-full">
            {/* Header with filters and search */}
            <div className="w-full bg-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-5">
                <BreadCrumbs
                    currentTitle="All Products"
                    items={[{name: "Shop", href: "/shop"}]}
                />
            </div>
            </div>
            <div className="max-w-7xl mx-auto mb-3 ">
    <Container size="xl" className={"min-h-screen"}>

            <Grid>
                {/* Sidebar for lg and up */}
                <Grid.Col span={{ base: 0, md: 0, lg: 3 }} className="hidden lg:block mt-5">
                    <Stack gap="lg">
                        {/* Category Filter */}
                        <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                Category
                            </Text>
                            <Stack gap="xs" style={{ 
    maxHeight: "140px", // Set your desired fixed height
    overflowY: "auto"   // Enable vertical scrolling
  }}>
                                {categories.map((cat) => (
                                    <Checkbox
                                        key={cat.id}
                                        label={cat.name}
                                        checked={selectedCategories.includes(cat.slug ?? "")  }
                                        onChange={(event) =>
                                            handleCategoryChange(cat.slug ?? "", event.currentTarget.checked)
                                        }
                                        styles={{
                                            input: { cursor: "pointer" },
                                            label: { cursor: "pointer" },
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Paper>
                          <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                Tags
                            </Text>
                            <Stack gap="xs">
                                {tags.map((tag) => (
                                    <Checkbox
                                        key={tag.id}
                                        label={tag.name}
                                        checked={selectedTags.includes(tag.slug ?? "")}
                                        onChange={(event) =>
                                            handleTagChange(tag.slug ?? "", event.currentTarget.checked)
                                        }
                                        styles={{
                                            input: { cursor: "pointer" },
                                            label: { cursor: "pointer" },
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Paper>

                        {/* Price Filter */}
                        <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                Filter by Price
                            </Text>
                            <RangeSlider
                                value={priceRange}
                                onChange={setPriceRange}
                                min={0}
                                max={1000}
                                step={10}
                                minRange={10}
                                mb="md"
                            />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    ${priceRange[0]}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    ${priceRange[1]}
                                </Text>
                            </Group>

                        </Paper>
                        <Group >
                            <Button
                                type="button"
                                color={theme.colors.brand[6]}
                                onClick={handleApplyFilters}
                            >
                                <LuFilter className="mr-2"/> Filter
                            </Button>
                              <Button
                                type="button"
                                color={theme.colors.brand[6]}
                                onClick={handleClearFilters}
                            >
                                <LuFilterX className="mr-2"/>Clear Filter
                            </Button>
                        </Group>

                        {/* New Products */}
                        <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                NEW PRODUCTS
                            </Text>
                            <Stack gap="sm">
                                {newProducts?.slice(0, 3)?.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.slug}`}
                                        className="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition"
                                    >
                                    <Group gap="sm">
                                        <div className="bg-gray-100 rounded-md w-25 h-[55px] flex items-center justify-center">
                                            <Image
                                                src={product?.images[0]?.image || logo}
                                                alt={product?.name}
                                                width={50}
                                                height={50}
                                                className="object-contain max-w-full max-h-full"
                                            />
                                        </div>
                                        <div style={{flex: 1}}>
                                            <Text size="sm" lineClamp={2}>
                                                {product?.name}
                                            </Text>
                                            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                                                <Text size="xs" c={theme.colors.brand[7]} fw={600}>
                                                    {product?.currency?.code}{product?.stock?.price}
                                                </Text>
                                                <Text c="dimmed" style={{ textDecoration: "line-through", fontSize: "0.65rem" }}>
                                                    {product?.currency?.code}{product?.stock?.mrp}
                                                </Text>
                                            </div>
                                            <Text size="xs">
                                                {renderStars(product?.average_rating || 0)}
                                            </Text>
                                        </div>
                                    </Group>
                                    </Link>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                {/* Drawer for sm and md */}
                <Drawer
                    opened={drawerOpened}
                    onClose={() => setDrawerOpened(false)}
                    title={<Text fw={600}>Filters</Text>}
                    position="left"
                    size="sm"
                >
                    <Stack gap="lg">
                        {/* Category Filter */}
                        <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                Category
                            </Text>
                            <Stack gap="xs" style={{ 
    maxHeight: "140px", // Set your desired fixed height
    overflowY: "auto"   // Enable vertical scrolling
  }}>
                                {categories.map((cat) => (
                                    <Checkbox
                                        key={cat.id}
                                        label={cat.name}
                                        checked={selectedCategories.includes(cat.slug ?? "")}
                                        onChange={(event) =>
                                            handleCategoryChange(cat.slug ?? "", event.currentTarget.checked)
                                        }
                                        styles={{
                                            input: { cursor: "pointer" },
                                            label: { cursor: "pointer" },
                                        }}
                                    />
                                ))}
                            </Stack>
                            
                        </Paper>
                         <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                Tags
                            </Text>
                            <Stack gap="xs">
                                {tags.map((tag) => (
                                    <Checkbox
                                        key={tag.id}
                                        label={tag.name}
                                        checked={selectedTags.includes(tag.slug ?? "")}
                                        onChange={(event) =>
                                            handleTagChange(tag.slug ?? "", event.currentTarget.checked)
                                        }
                                        styles={{
                                            input: { cursor: "pointer" },
                                            label: { cursor: "pointer" },
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Paper>

                        {/* Price Filter */}
                        <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                Filter by Price
                            </Text>
                            <RangeSlider
                                value={priceRange}
                                onChange={setPriceRange}
                                min={0}
                                max={1000}
                                step={10}
                                minRange={10}
                                mb="md"
                            />
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    ${priceRange[0]}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    ${priceRange[1]}
                                </Text>
                            </Group>

                        </Paper>
                        <Group >
                            <Button
                                type="button"
                                color={theme.colors.brand[6]}
                                onClick={handleApplyFilters}
                            >
                                <LuFilter className="mr-2"/> Filter
                            </Button>
                              <Button
                                type="button"
                                color={theme.colors.brand[6]}
                                onClick={handleClearFilters}
                            >
                                <LuFilterX className="mr-2"/>Clear Filter
                            </Button>
                        </Group>

                        {/* New Products */}
                        <Paper shadow="xs" p="md">
                            <Text fw={600} mb="md">
                                NEW PRODUCTS
                            </Text>
                            <Stack gap="sm">
                                {newProducts?.slice(0, 3)?.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.slug}`}
                                        className="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition"
                                    >
                                        <Group gap="sm">
                                            <Image
                                                src={product?.images[0]?.image}
                                                alt={product?.name}
                                                width={50}
                                                height={50}
                                                className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0"
                                            />
                                            <div style={{flex: 1}}>
                                                <Text size="sm" lineClamp={2}>
                                                    {product.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    ${product.stock?.price}
                                                </Text>
                                            </div>
                                        </Group>
                                    </Link>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                </Drawer>

                {/* Main Content */}
                <Grid.Col className="mt-2" span={{ base: 12, md: 9, lg: 9 }}>
                    <Paper p="md" mb="lg">
                        <Group justify="space-between" align="center">
                            <TextInput
                                placeholder="Search products..."
                                leftSection={<IconSearch size={16} />}
                                value={query}
                                onChange={(e) => handleInputChange(e.currentTarget.value)}
                                w={{ base: 200, sm: 300 }}
                            />

                            <Group gap="xs">
                                <Button
                                    type="button"
                                    leftSection={<IconFilter size={16} />}
                                    onClick={() => setDrawerOpened(true)}
                                    size="md"
                                    color={theme.colors.brand[6]}
                                    hiddenFrom="md"
                                >
                                    Filter
                                </Button>

                                <div className="relative">
                                    <select
                                        className="w-full bg-white border border-gray-300 cursor-pointer px-7 py-2 rounded-md text-gray-400"
                                        onChange={handleSelectChange}
                                        value={selectedFilter}
                                    >
                                        {filterOptions.map((option, index) => (
                                            <option key={index} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </Group>
                        </Group>
                    </Paper>
                    {isLoading ? (
                        <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
                            <MithoSweetsLoader />
                        </div>
                    ) : paginatedProducts?.length === 0 ? (
                        <NoDataPage msg={"No Data Found"}/>
                    ) : (
                        <>
                            <Grid>
                                {paginatedProducts.map((product) => (
                                    <Grid.Col
                                        key={product.id}
                                        span={{base: 12, sm: 6, md: 4, lg: 4}}
                                    >
                                        <ProductDisplay
                                            key={product.id}
                                            product={product}
                                            border={true}
                                            isWish={product.is_bookmarked}
                                        />
                                    </Grid.Col>
                                ))}
                            </Grid>

                            {/*<div className="flex justify-center my-5">*/}
                            {/*    {totalPages >= 1 && (*/}
                            {/*        <Pagination*/}
                            {/*            value={currentPage}*/}
                            {/*            onChange={setCurrentPage}*/}
                            {/*            total={totalPages}*/}
                            {/*            radius="md"*/}
                            {/*        />*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        </>
                    )}
                </Grid.Col>
            </Grid>
        </Container>
                <div className="flex justify-center w-full mt-2 md:ml-32  sm:px-2 ">
                    {totalPages >= 1 && (
                        <Pagination
                            value={currentPage}
                            onChange={setCurrentPage}
                            total={totalPages}
                            radius="lg"
                        />
                    )}
                </div>
        </div>
        </div>
    )
}