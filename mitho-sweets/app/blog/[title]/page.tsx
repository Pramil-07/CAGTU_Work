"use client"

import React, { useState, useEffect } from "react"
import {useParams, useRouter} from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiBook, FiEye } from "react-icons/fi"
import { FaGreaterThan } from "react-icons/fa6"
import {Avatar, Badge, Breadcrumbs, Button, Card, Input, Paper, useMantineTheme} from "@mantine/core"
import { IoIosSearch } from "react-icons/io"
import apiClient from "../../../axiosConfig"
import { ShareWith } from "@/components/ShareWith"
import { useAuth } from "@/lib/AuthContext"
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader"
import CommentSection from "@/components/common/CommentSection"
import {CardContent} from "@mui/material";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import CategoryData, {Category} from "@/components/CategoryData";
import Empty from "@/components/Empty";
import {Blog, Tags} from "@/components/Blog";


// Interfaces
interface BlogPost {
    id: number
    title: string
    author_name: string
    readTime: string
    views: number
    category_name: string
    category: number
    image: string
    content: string
    slug: string
    tags: Tags[]
}
 // interface Tags {
 //    id: number
 //    name: string
 //    slug: string
 // }

export interface CommentUser {
    first_name: string
    last_name: string
    profile_image: string
}

export interface Comment {
    id: number
    user: CommentUser
    created_at: string
    updated_at: string
    deleted_at: string | null
    status: string
    rating: number
    review: string
    product: number | null
    blog: number
}


const popularTags = ["beautiful", "New York", "oral", "namaste", "loving", "travel", "fighting"]

// Media query styles
const mediaQueryStyles = `
  @media (max-width: 1160px) {
    .px-zero .content-container,
    .px-zero .navbar-mobile {
      padding-left: 40px;
      padding-right: 40px;
    }
  }
  @media (max-width: 776px) {
    .px-zero .content-container,
    .px-zero .navbar-mobile {
      padding-left: 16px;
      padding-right: 16px;
    }
    .breadcrumbs-container {
      flex-wrap: wrap;
      gap: 8px;
    }
    .breadcrumbs-container a,
    .breadcrumbs-container span {
      font-size: 0.875rem;
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
    .breadcrumbs-container a,
    .breadcrumbs-container span {
      font-size: 1rem;
    }
  }
`

export default function BlogDetailPage() {
    const { isLoggedIn } = useAuth()
    const params = useParams()
    const slug = params.title ? decodeURIComponent(Array.isArray(params.title) ? params.title[0] : params.title) : ""
    const [isBlog , setIsBlog] = useState(true)
    const [post, setPost] = useState<BlogPost | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState({ review: "", rating: 0 })
    const [expandedComments, setExpandedComments] = useState<number[]>([])
    const [categories, setCategories] = useState<Category[]>([]);
    const [trending, setTrending] = useState<Blog[]>([]);
    const [popularTags, setPopularTags] = useState<Tags[] | string[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tags | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const theme = useMantineTheme();
    const router = useRouter();


    // Fetch blog post
    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return
            setLoading(true)
            setError("")
            try {
                const response = await apiClient.get(`/blogs/${slug}`)
                setPost(response.data)
            } catch (err) {
                console.error("Failed to fetch post:", err)
                setError("Failed to load blog post")
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [slug])

    

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get("/product/category/?type=blog");
                setCategories(response.data.result);
                console.log("category data",response.data.result);
            }catch (e){
                console.log("Error in category",e)
                setCategories([
                    { id: 1, name: "The Lifestyle", post_count: 12 },
                    { id: 2, name: "Health Care", post_count: 8 },
                    { id: 3, name: "Business", post_count: 15 },
                    { id: 4, name: "Technology", post_count: 6 },
                    { id: 5, name: "Travel", post_count: 9 },
                ]);

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

    const handleTagClick = async (tag: Tags) => {
        setSelectedTag(tag);

        router.push(`/blog?tag=${tag.slug}${selectedCategory ? `&category=${selectedCategory}` : ""}`);
    };

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategory(categoryId);
        router.push(
            `/blog?tag=${selectedTag?.slug || ""}&category=${categoryId}`
        );
    };

    const handleRoute = () => {
        router.push(`/shop`);
    }
    // Fetch trending posts
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await apiClient.get("/blogs/trending/")
                setTrending(response.data || [])
                console.log("trending",response.data)
            } catch (err) {
                console.error("Failed to fetch trending blogs:", err)
            }
        }
        fetchTrending()
    }, [])


    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            if (!slug) return
            try {
                const response = await apiClient.get(`/activity/rating/${slug}/`)
                setComments(response.data.result || [])
            } catch (err) {
                console.error("Failed to fetch comments:", err)
                setError("Failed to fetch comments")
            }
        }
        fetchComments()
    }, [slug])

    // Handle comment submission
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoggedIn || !post?.id) return

        try {
            const formData = new FormData()
            formData.append("rating", String(newComment.rating))
            formData.append("review", newComment.review)

            await apiClient.post(`/activity/rating/?blog_id=${post.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setNewComment({ review: "", rating: 0 })
            const response = await apiClient.get(`/activity/rating/${slug}/`)
            setComments(response.data.result || [])
        } catch (err) {
            console.error("Failed to submit comment:", err)
            setError("Failed to submit comment")
        }
    }

    // Handle star rating click
    const handleStarClick = (rating: number) => {
        setNewComment((prev) => ({ ...prev, rating }))
    }

    // Toggle "View More/View Less" for long comments
    const toggleComment = (id: number) => {
        setExpandedComments((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[45vh]">
                <MithoSweetsLoader />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    if (!post?.slug) {
        return (
            <Empty title="No blog post found" />
        )
    }

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200; // average reading speed
        const words = content.trim().split(/\s+/)?.length;
        const minutesDecimal = words / wordsPerMinute; // exact time in minutes
        const minutes = Math.floor(minutesDecimal);     // whole minutes
        const seconds = Math.round((minutesDecimal - minutes) * 60); // remaining seconds
        return `${minutes} min ${seconds} sec read`;
    };

    const breadcrumbItems = [
        { title: "Home", href: "/" },
        { title: "Blog", href: "/blog" },
        { title: post?.category_name || "Category", href: "#" },
        { title: post?.title || "Post Title", href: "" },
    ]

    const getCurrentTitle = () => {
        if (selectedTag && selectedCategory) return "Filtered Blogs";
        if (selectedTag) return selectedTag.name;
        if (selectedCategory) return categories.find((cat: any) => cat.id === selectedCategory)?.name || "Category";

        // Default for blog route with no filters
        return "Blog Details";
    };

    return (
        <div>
        <div className="w-full bg-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-5">
                <BreadCrumbs
                    currentTitle={getCurrentTitle()}
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Blog", href: "/blog" },
                        ...(selectedTag || selectedCategory
                            ? [
                                {
                                    name: getCurrentTitle(),
                                    href: "#"
                                }
                            ]
                            : [])
                    ]}
                />
            </div>
        </div>
        <div className="page-container">
            {/* Navigation */}
            <div className="content-container ">
            {/*<nav*/}
            {/*    className="bg-white py-4 px-4 sm:px-6 md:px-44 lg:px-52 xl:px-56 navbar-mobile flex flex-wrap items-center justify-end">*/}
                {/* Search bar in navbar for small devices */}
                <div className="flex justify-end ">
                    <div className="relative w-48 sm:w-64 mr-10 mt-3">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            <IoIosSearch size={20} className="transition-transform duration-200 hover:scale-110"/>
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white text-gray-700 text-sm placeholder-gray-400 transition-all duration-200 ease-in-out hover:border-orange-300 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            {/*</nav>*/}
            </div>

            <div className="content-container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                    {/* Main Content */}
                    <div className="lg:col-span-2 max-w-5xl mx-auto w-full">
                        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                {post?.title ? post.title.charAt(0).toUpperCase() + post.title.slice(1) : ""}
                            </h1>
                            <div className="flex flex-wrap justify-between item-center">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                                <span>
                                  By <span style={{
                                    color: theme.colors.brand[6],
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                }}>{post?.author_name}</span>
                                </span>
                                    <span className="flex items-center gap-1">
                                    <FiBook/>
                                        {post?.content ? calculateReadTime(post.content) : "2 min read"}
                                </span>
                                    {/* <span className="flex items-center gap-1">*/}
                                    {/*     <FiEye />*/}
                                    {/*     {post?.views || 0} Views*/}
                                    {/*</span>*/}
                                    {/*<Badge color="orange" variant="light">*/}
                                    {/*    {post?.category_name}*/}
                                    {/*</Badge>*/}
                                    <Badge
                                        variant="light"
                                        color={theme.colors.brand[6]}
                                        onClick={() => handleCategoryClick(post?.category)}
                                        component="button"
                                        styles={{
                                            root: {
                                                cursor: "pointer",
                                            },
                                        }}
                                        className="text-gray-700 hover:bg-red-400 items-center hover:text-gray-50"
                                    >
                                        {post?.category_name}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center  mb-6">
                                    <span className="text-sm text-gray-500">Share this:</span>
                                    <ShareWith/>
                                </div>
                            </div>
                            <div className="relative rounded-lg overflow-hidden h-96 mb-8">
                                <Image
                                    src={post.image || "/placeholder.svg"}
                                    alt={post?.title || "Blog post image"}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed product-description">
                                <div
                                    dangerouslySetInnerHTML={{__html: post?.content || ""}}
                                />
                            </div>

                        </div>

                        {/* Tags Section */}
                        {post?.tags?.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                                {/*<h3 className="font-semibold text-lg mb-3">Tags</h3>*/}
                                <div className="flex flex-wrap gap-2 p-3">
                                    {post.tags.map((tag) => (
                                        <Button
                                            key={tag.id}
                                            variant="light"
                                            component="button"
                                            onClick={() => handleTagClick(tag)}
                                            className="cursor-pointer px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
                                        >
                                            {tag.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <CommentSection
                            slug={slug}
                            id={post?.id}
                            comments={comments}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            expandedComments={expandedComments}
                            toggleComment={toggleComment}
                            handleCommentSubmit={handleCommentSubmit}
                            handleStarClick={handleStarClick}
                            error={error}
                            isLoggedIn={isLoggedIn}
                            isBlog={isBlog}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <CategoryData categories={categories} onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory}/>
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-lg mb-4">TRENDING NOW</h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {trending.slice(0, 4).map((post) => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 relative flex-shrink-0">
                                                    <Image
                                                        src={post.image || "/placeholder.svg"}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover rounded"
                                                    />

                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                        { post?.title ? post.title.charAt(0).toUpperCase() + post.title.slice(1) : ""}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(post.published_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div
                                    className="bg-gradient-to-br from-orange-600 to-purple-700 rounded-lg p-6 text-white text-center">
                                    <h4 className="font-bold text-lg mb-2">Sweets Zone</h4>
                                    <p className="text-sm mb-3">Save 17% on Mitho Sweets</p>
                                    <button onClick={handleRoute} className="bg-white text-orange-600 px-4 py-2 rounded hover:bg-orange-100">
                                        Shop Now →
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-lg mb-4">POPULAR TAGS</h3>
                                <div className="flex flex-wrap gap-2">
                                    {popularTags.map((tag: any) => (
                                        <Badge
                                            key={tag.id}
                                            variant="light"
                                            color={theme.colors.brand[6]}
                                            onClick={() => handleTagClick(tag)}
                                            component="button"
                                            styles={{
                                                root: {
                                                    cursor: "pointer",
                                                },
                                            }}
                                            className="text-gray-700 hover:bg-red-400 hover:text-gray-50"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <style jsx>{mediaQueryStyles}</style>
        </div>
        </div>
    )
}