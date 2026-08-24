"use client";
import React, { useEffect, useState } from "react";
import { FiBook, FiEye, FiSearch } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import {Badge, Button, Card, Pagination, useMantineTheme} from "@mantine/core";
import { CardContent } from "@mui/material";
import { IoIosSearch } from "react-icons/io";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import { FaGreaterThan } from "react-icons/fa";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import CategoryData, {Category} from "@/components/CategoryData";
import {useAuthModalContext} from "@/components/authModalProvider";
import {useRouter, useSearchParams} from "next/navigation";
import Empty from "@/components/Empty";
import apiClient from "@/axiosConfig";
import NoDataPage from "@/components/Error/NoDataPage";
// import {router} from "next/client";

// BlogPost interface remains unchanged
export interface BlogPost {
    id: number;
    title: string;
    author_name: string;
    published_at: string;
    category_name: string;
    content: string;
    image: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    author: string;
    category: number;
    views?: number;
    readTime?: string;
}
export interface BlogTag {
    id: number;
    name: string;
    slug: string;
}

export interface Blog {
    id: number;
    author: string;
    author_name: string;
    category: number;
    category_name: string;
    content: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    is_published: boolean;
    slug: string;
    title: string;
    image: string | null;
    tags: BlogTag[];
}

export interface Tags {
    id: number;
    name: string;
    slug?: string;
}


// Static data for featured posts (unchanged)
// const featuredData: BlogPost[] = [
//     {
//         id: 1,
//         title: "Exploring Kathmandu's Sweet Spots: A Sugary Adventure Through the Capital's Best Dessert Corners",
//         author_name: "Nishan Subedi",
//         published_at: "2025-07-25",
//         category_name: "featured",
//         content:
//             "Kathmandu's dessert scene is a delightful fusion of traditional and modern flavors. From the syrupy goodness of rasbari and lal mohan found in Ason to the rich chocolate cakes served at Thamel cafes...",
//         image: "https://cdn.pixabay.com/photo/2023/10/02/08/42/candies-8288760_1280.jpg",
//         slug: "exploring-kathmandus-sweet-spots",
//         is_published: true,
//         created_at: "2025-07-25",
//         updated_at: "2025-07-25",
//         author: "Nishan Subedi",
//         category: 1,
//         views: 1248,
//         readTime: "3 min read",
//     },
// ];

const categoriesBlog: any = [
    { name: "The Lifestyle", count: 12 },
    { name: "Health Care", count: 8 },
    { name: "Business", count: 15 },
    { name: "Technology", count: 6 },
    { name: "Travel", count: 9 },
];

// export const popularTagsStatic = ["beautiful", "New York", "oral", "namaste", "loving", "travel", "fighting"];

// Media query styles updated to include navbar search bar positioning
const mediaQueryStyles = `
  @media (max-width: 1160px) {
    .px-zero .content-container,
    .px-zero .navbar-mobile {
      padding-left: 40px;
      padding-right: 40px;
      width: "100%"
    }
  }
  @media (max-width: 776px) {
    .px-zero .content-container,
    .px-zero .navbar-mobile {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
  @media (max-width: 1024px) {
    .navbar-search-container {
      display: flex;
      align-items: center;
    }
    .sidebar-search-container {
      display: none;
    }
  }
  @media (min-width: 1025px) {
    .navbar-search-container {
      display: none;
    }
    .sidebar-search-container {
      display: block;
    }
  }
`;

export default function Blog() {
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [trending, setTrending] = useState<Blog[]>([]);
    const [popularTags, setPopularTags] = useState<Tags[] | string[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tags | null>(null);
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const theme = useMantineTheme();
    const {showLogin} = useAuthModalContext();
    const searchParams = useSearchParams();
    const tagName = searchParams.get("tag") || "";
    const categoryId = searchParams.get("category") || "";
    const router = useRouter();

    const postsPerPage = 5;

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await apiClient.get("/blogs/");
                const rawPosts = response.data.results || response.data;
                const mappedPosts: BlogPost[] = Array.isArray(rawPosts)
                    ? rawPosts.map((post: any) => ({
                        id: post.id,
                        title: post.title,
                        author_name: post.author_name,
                        published_at: post.published_at,
                        category_name: post.category_name,
                        content: post.content,
                        image: post.image,
                        slug: post.slug,
                        is_published: post.is_published,
                        created_at: post.created_at,
                        updated_at: post.updated_at,
                        author: post.author,
                        category: post.category,
                        views: post.views || 0,
                        readTime: post.readTime || "5 min read",
                    }))
                    : [];
                setAllPosts(mappedPosts);
            } catch (err) {
                console.error("API failed. Using fallback data.", err);
                // setAllPosts(featuredData);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get("/blogs/", {
                    params: {
                        tag_name: tagName,
                        category: categoryId || "",
                    },
                });
                setAllPosts(response.data.result || response.data);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [tagName, categoryId]);

    const handleCategoryClick = (categoryId: number) => {
        const isActive = selectedCategory === categoryId;
        const newCategory = isActive ? null : categoryId;

        setSelectedCategory(newCategory);

        router.push(
            `/blog?tag=${selectedTag?.slug || ""}${newCategory ? `&category=${newCategory}` : ""}`
        );
    };

    const handleTagClick = (tag: Tags) => {
        const isActive = selectedTag?.id === tag.id;
        const newTag = isActive ? null : tag;

        setSelectedTag(newTag);

        router.push(
            `/blog?tag=${newTag?.slug || ""}${selectedCategory ? `&category=${selectedCategory}` : ""}`
        );
    };

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const minutesDecimal = words / wordsPerMinute;
        const minutes = Math.floor(minutesDecimal);
        const seconds = Math.round((minutesDecimal - minutes) * 60);
        return `${minutes} min ${seconds} sec read`;
    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get("/product/category/?type=blog");
                setCategories(response.data.result);

                console.log("category data",response.data.result);
            }catch (e){
                console.log("Error in category",e);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchTrendingPosts = async () => {
            try {
                const response = await apiClient.get("/blogs/trending/");
                setTrending(response.data);
                console.log("trending data",response.data);
            }catch (e){
                console.log("Error in trending",e)
            }
        }
        fetchTrendingPosts();
    }, []);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await apiClient.get("/blogs/tags/");
                setPopularTags(response.data);
                console.log("popular tags data",response.data);
            }catch (e){
                console.log("Error in tags",e);
                // const fallbackTags: Tags[] = popularTagsStatic.map((tag, index) => ({
                //     id: index + 1,
                //     name: tag,
                //     slug: tag.toLowerCase().replace(/\s+/g, "-")
                // }));
                // setPopularTags(fallbackTags);
            }
        }
        fetchTags();
    }, []);

    useEffect(() => {
        const fetchFilteredPosts = async () => {
            try {
                const response = await apiClient.get("/blogs/", {
                    params: { tag_name: tagName, category: categoryId },
                });
                setPosts(response.data.results || response.data);
            } catch (err) {
                console.error("Failed to fetch filtered posts", err);
            }
        };
        fetchFilteredPosts();
    }, [tagName, categoryId]);
    // const displayPosts = allPosts.length > 0 ? allPosts : <Empty title="No blog found" />;

    if (!allPosts) {
        return (
            <NoDataPage msg="No Blog Found" height="50vh"/>
        )
    }
    // Filter posts based on search term
    const filteredPosts = allPosts&& allPosts ?.filter(
        (post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

    if (loading) {
        return(
            <div style={{display: "flex", height:"100vh", alignItems: "center", justifyContent: "center"}}>
                <MithoSweetsLoader/>
            </div>
        )
    }
    const getCurrentTitle = () => {
        if (selectedTag && selectedCategory) return "Filtered Blogs";
        if (selectedTag) return selectedTag.name;
        if (selectedCategory)
            return categories.find((cat) => cat.id === selectedCategory)?.name || "Category";
        return "All Posts";
    };

    const breadcrumbItems =
        selectedTag || selectedCategory
            ? [
                { name: "Home", href: "/" },
                { name: "Blog", href: "/blog" },
                { name: getCurrentTitle(), href: "#" },
            ]
            : [
                { name: "Home", href: "/" },
                { name: "Blog", href: "/blog" },
            ];


    return (
        <div className="w-full">

            <div className="w-full bg-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-5">
                    <BreadCrumbs currentTitle={getCurrentTitle()} items={breadcrumbItems} />

                </div>
            </div>
            {/*<div>*/}
            {/*    <button onClick={showLogin}> show modal</button>*/}
            {/*</div>*/}
            <div className="page-container item-center justify-center bg-white rounded-lg">
                <div
                    className="bg-white py-4 px-4 sm:px-6 md:px-44 lg:px-52 xl:px-56 navbar-mobile flex flex-wrap items-center justify-end">
                    {/* Search bar in navbar for small devices */}
                    <div className="content-container md:w-24">
                        <div className="relative w-48 sm:w-64 mr-10 mt-3">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <IoIosSearch size={20} className="transition-transform duration-200 hover:scale-110"/>
                        </span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white text-gray-700 text-sm placeholder-gray-400 transition-all duration-200 ease-in-out hover:border-orange-300 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="content-container py-8 ">
                    <div className="flex gap-8 flex-col lg:flex-row">
                        {/* Main Content */}
                        <main className="flex-1">
                            <div className="space-y-8">
                                {currentPosts.length > 0 ? currentPosts.map((post: any) => (
                                    <article
                                        key={post.id}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <Link href={`/blog/${post.slug}`}>
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={post?.image || "/placeholder.svg"}
                                                    alt={post?.title}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <span
                                                    className="bg-red-100 text-red-400 px-2 py-1 rounded-full text-xs font-bold">
                                                    {post?.category_name || ""}
                                                </span>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-red-500 transition-colors">
                                                    {post?.title
                                                        ? post.title.charAt(0).toUpperCase() + post.title.slice(1)
                                                        : ""}
                                                </h2>
                                                {/*<p className="text-gray-600 mb-4 line-clamp-3">{post.content.substring(0, 200)}...</p>*/}
                                                <p
                                                    className="text-gray-600 mb-4 line-clamp-3 product-description"
                                                    dangerouslySetInnerHTML={{__html: post.content}}
                                                />

                                                <div className="flex items-center flex-wrap justify-between">
                                                    <div
                                                        className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
                                                        <span>By {post?.author_name || ""}</span>
                                                        <div className="flex items-center gap-1">
                                                            <FiBook className="w-4 h-4"/>
                                                            <span>{post?.content ? calculateReadTime(post.content) : "2 min read"}</span>
                                                        </div>
                                                        {/*<div className="flex items-center gap-1">*/}
                                                        {/*    <FiEye className="w-4 h-4"/>*/}
                                                        {/*    <span>{post?.views || 0}</span>*/}
                                                        {/*</div>*/}
                                                    </div>
                                                    <Button color={theme.colors.brand[6]}
                                                            className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                                        Read More →
                                                    </Button>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                    ))
                                : (
                                    <div className="flex item-center justify-center">
                                    <NoDataPage msg="No Blog Found" height="50vh"/>
                                    </div>
                                    )}
                            </div>

                            <div className="flex justify-center mt-12">
                                <Pagination
                                    total={totalPages}
                                    value={currentPage}
                                    onChange={setCurrentPage}
                                    color={theme.colors.brand[6]}
                                    radius="lg"
                                />
                            </div>
                        </main>

                        {/* Sidebar */}
                        <aside className="w-full lg:w-80">
                            <div className="space-y-6">
                                {/* Categories */}
                                {/*<div className="bg-white rounded-lg p-6 shadow-sm">*/}
                                {/*    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>*/}
                                {/*    <ul className="space-y-2">*/}
                                {/*        {categories.map((category) => (*/}
                                {/*            <li key={category.name}>*/}
                                {/*                <Link href="#" className="group flex items-center justify-between text-gray-600 transition-colors">*/}
                                {/*                    <span className="group-hover:text-orange-600 transition-colors">{category.name}</span>*/}
                                {/*                    <span className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">*/}
                                {/*                        ({category.count})*/}
                                {/*                    </span>*/}
                                {/*                </Link>*/}
                                {/*            </li>*/}
                                {/*        ))}*/}
                                {/*    </ul>*/}
                                {/*</div>*/}
                                <CategoryData categories={categories} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory}/>

                                {/* Trending Posts */}
                                <div className="bg-white rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Posts</h3>
                                    <div className="space-y-4">
                                        {trending.length > 0 ? trending.slice(0, 4).map((post) => (
                                            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                                                <div className="flex gap-3">
                                                    <div className="w-16 h-16 relative flex-shrink-0">
                                                        <Image
                                                            src={post?.image || "/placeholder.svg"}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover rounded"
                                                        />

                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                            {post?.title
                                                                ? post.title.charAt(0).toUpperCase() + post.title.slice(1)
                                                                : ""}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(post.published_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )): (
                                            <div className="text-red-400">
                                                No Trending Posts Found
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Card>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold text-lg mb-4">POPULAR TAGS</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {popularTags.length > 0 ? popularTags.map((tag: any) => {
                                                const isActive = selectedTag?.id === tag.id || tag.slug === tagName;
                                                return (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="light"
                                                        color={isActive ? theme.colors.brand[6] : theme.colors.brand[5]}
                                                        onClick={() => handleTagClick(tag)}
                                                        component="button"
                                                        styles={{ root: { cursor: "pointer" } }}
                                                        className={`text-gray-700 ${isActive ? "bg-red-500 text-white" : "hover:bg-red-400 hover:text-gray-50"}`}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                );
                                            }): (
                                                <div className="text-red-400">
                                                    No Tags Found
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </aside>
                    </div>
                </div>
                <style jsx>{mediaQueryStyles}</style>
            </div>
        </div>
    );
}