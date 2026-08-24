import urls from "constants/urls";



import { axiosClient } from "utils/axiosClient";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BlogsDescription } from "@/components/Blogs/blogsdescription";
import Layout from "@/components/Layout/Layout";
import type { BlogDetailData } from "@/types/BlogsProps";


const BlogDesc = () => {
    const router = useRouter();
    const {id} = router.query;
    const [blog, setBlog] = useState<BlogDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchBlogDetail = async () => {
            try {
                setLoading(true);
                const {data} = await axiosClient.get<BlogDetailData>(`${urls.blog.detail}${id}`);
                setBlog(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching blog details:', err);
                setError('Failed to load blog details');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogDetail();
    }, [id]);



        if (!blog) {
            return (
                <Layout title="Blog Not Found">
                    <p>Blog post could not be found.</p>
                </Layout>
            );
        }


        return (
            <Layout
                title="Blogs"
                breadCrumbsItems={[{name: "blogs", href: "/blogs"}]}
                currentTitle={blog.data?.title}
            >
                {blog && <BlogsDescription blog={blog}/>}
            </Layout>
        );

}

// <<<<<<< service_issue_nov8
//     return (
//         <Layout
//             title="Blogs"
//             breadCrumbsItems={[{ name: "blogs", href: "/blogs" }]}
//             currentTitle={blog.data?.title}
//         >
//             {blog && <BlogsDescription blog={blog} />}
//         </Layout>
//     );
// };
// }

// export default BlogDesc;
// =======
    export default BlogDesc;
// >>>>>>> test-develop


// export const getStaticPaths: GetStaticPaths = async () => {
//     try {
//         const { data: blogsData } = await axiosClient.get(urls.blog.list);
//         if (blogsData.error) throw new Error(blogsData.error.message);
//
//         const paths = blogsData?.result?.map(
//             ({ slug }: BlogDetailData["data"]) => ({
//                 params: { id: slug },
//             })
//         );
//
//         return {
//             paths,
//             fallback: true,
//         };
//     } catch (err) {
//         return {
//             paths: [],
//             fallback: true,
//         };
//     }
// };
//
// export const getStaticProps: GetStaticProps = async ({ params }) => {
//     try {
//         const { data } = await axiosClient.get<BlogDetailData>(
//             `${urls.blog.detail}${params?.id}`
//         );
//
//         return {
//             props: {
//                 blog: data,
//             },
//             revalidate: 10,
//         };
//     } catch (err) {
//         return {
//             props: {
//                 blog: {},
//             },
//             revalidate: 10,
//         };
//     }
// }

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//     try {
//         const { data } = await axiosClient.get<BlogDetailData>(
//             `${urls.blog.detail}${params?.slug}`
//         );
//
//         return {
//             props: {
//                 blog: data,
//             },
//         };
//     } catch (err) {
//         console.error("Error fetching blog data:", err);
//         return {
//             props: {
//                 blog: null,
//             },
//         };
//     }
// };

