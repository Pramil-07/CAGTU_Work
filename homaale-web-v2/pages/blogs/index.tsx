import { Grid, Pagination } from "@mantine/core";
import type {  NextPage } from "next";
import React, {useEffect, useState} from "react";

import { BlogCard } from "@/components/common/BlogCard";
import Empty from "@/components/common/Empty";
import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import type { BlogProps } from "@/types/BlogsProps";
import { axiosClient } from "@/utils/axiosClient";

const Blogs: NextPage<{
    blogData: BlogProps;
}> = ({ blogData }) => {
    const [page, setPage] = useState(1);
    const [blogDataState,setBlogDataState] = useState<BlogProps >();

    useEffect(() => {
        const fetchBlogData = async () =>{
            try{
                const {data} = await axiosClient.get(urls.blog.list)
                setBlogDataState(data)
            }catch (err){
                console.error('error fetching blog data:',err);
            }
        }
        fetchBlogData();
    }, []);
    return (
        <Layout currentTitle={"blogs"} heading={"Blogs"}>
            {blogDataState && blogDataState?.result?.length > 0 ? (
                <>
                    <Grid mt={24}>
                        {blogDataState?.result?.map((item, index) => (
                            <Grid.Col md={4} key={index}>
                                <BlogCard blogs={item} />
                            </Grid.Col>
                        ))}
                    </Grid>
                    {blogDataState && blogDataState?.result?.length > 0 && (
                        <Pagination
                            sx={{ justifyContent: "center" }}
                            radius={"lg"}
                            mt={28}
                            total={blogDataState?.total_pages}
                            value={page}
                            onChange={setPage}
                        />
                    )}
                </>
            ) : (
                <Empty title={"No Blogs Available!!!"} description={""} />
            )}
        </Layout>
    );
};

export default Blogs;

//
// export const getStaticProps: GetStaticProps = async () => {
//     try {
//         const { data: blogData } = await axiosClient.get(urls.blog.list);
//         return {
//             props: {
//                 blogData,
//             },
//             revalidate: 10,
//         };
//     } catch (err: any) {
//         return {
//             props: {
//                 blogData: [],
//             },
//             revalidate: 10,
//         };
//     }
// };
