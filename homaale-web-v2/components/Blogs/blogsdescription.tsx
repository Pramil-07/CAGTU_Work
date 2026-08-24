import {
    AspectRatio,
    Box,
    Flex,
    Grid,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandTwitter,
    IconShare,
} from "@tabler/icons-react";
import { format } from "date-fns";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import {
    FacebookShareButton,
    InstapaperShareButton,
    LinkedinShareButton,
    TwitterShareButton,
} from "next-share";

import { useBlogDescriptionStyles } from "@/styles/components/BlogDescription";
import type { BlogDetailData } from "@/types/BlogsProps";
import { getPageUrl } from "@/utils/helpers";

export const BlogsDescription = ({ blog }: { blog: BlogDetailData }) => {
    const theme = useMantineTheme();
    const { classes } = useBlogDescriptionStyles();

    const { image, author, title, created_at, content, related_blogs } =
        blog?.data ?? ({} as BlogDetailData);
    return (
        <Grid className={classes.root}>
            <Grid.Col md={8} sm={12}>
                {image ? (
                    <AspectRatio ratio={18 / 9}>
                        <Image
                            height={556}
                            className="blog_image"
                            width={986}
                            src={image}
                            alt={`image-${title}`}
                        />
                    </AspectRatio>
                ) : (
                    ""
                )}

                <Box className="date">
                    {image ? (
                        <Image
                            height={32}
                            width={32}
                            src={image}
                            alt={`image-${author}`}
                            style={{ borderRadius: 50, objectFit: "cover" }}
                        />
                    ) : (
                        " "
                    )}
                    <h4>{author}</h4>
                    <p>posted on</p>
                    {created_at ? (
                        <h4
                            style={{
                                fontSize: 16,
                                fontWeight: 500,
                                color: theme.colors.gray[6],
                            }}
                        >
                            {format(new Date(created_at), "PP")}
                        </h4>
                    ) : (
                        ""
                    )}
                </Box>
                <h1>{title}</h1>
                {content ? (
                    <div className="parsecontent">{parse(content)}</div>
                ) : (
                    ""
                )}

                <Box className="sharing">
                    <Flex gap={10}>
                        <IconShare size={14} />
                        <p>Share</p>
                    </Flex>
                    <Flex gap={10}>
                        <FacebookShareButton url={getPageUrl()}>
                            <IconBrandFacebook size={24} />
                        </FacebookShareButton>
                        <InstapaperShareButton url={getPageUrl()}>
                            <IconBrandInstagram size={24} />
                        </InstapaperShareButton>
                        <LinkedinShareButton url={getPageUrl()}>
                            <IconBrandLinkedin size={24} />
                        </LinkedinShareButton>
                        <TwitterShareButton url={getPageUrl()}>
                            <IconBrandTwitter size={24} />
                        </TwitterShareButton>
                    </Flex>
                </Box>
            </Grid.Col>
            <Grid.Col md={4}>
                <h3>Related Articles</h3>
                <Box className="articles">
                    {related_blogs
                        ?.filter((val) => val?.published_status === "Published")
                        .map((item, index) => (
                            <Link key={index} href={`/blogs/${item?.slug}`}>
                                <Flex
                                    justify={"flex-start"}
                                    align={"flex-start"}
                                    gap={10}
                                    className="related_article_wrapper"
                                >
                                    {item?.image ? (
                                        <Image
                                            height={112}
                                            width={112}
                                            src={item?.image}
                                            alt={`image-${item?.title}`}
                                            style={{
                                                borderRadius: 4,
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        " "
                                    )}
                                    <Text lineClamp={3}>
                                        {item?.preview_content &&
                                            parse(item?.preview_content)}
                                    </Text>
                                </Flex>
                            </Link>
                        ))}
                </Box>
                <Image
                    className="advertisement_image"
                    height={684}
                    width={499}
                    src={"/images/blogsimages/Advertisment.png"}
                    alt={"image-advertisement"}
                />
            </Grid.Col>
        </Grid>
    );
};
