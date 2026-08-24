import { AspectRatio, Box, Flex, Text, useMantineTheme } from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { format } from "date-fns";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useBlogCardStyles } from "@/styles/components/BlogCardStyles";
import type { BlogProps } from "@/types/BlogsProps";

export const BlogCard = ({ blogs }: { blogs: BlogProps["result"][0] }) => {
    const { classes } = useBlogCardStyles();
    const theme = useMantineTheme();

    const { image, preview_content, slug, created_at, title } =
        blogs ?? ({} as BlogProps["result"][0]);
    return (
        <Box className={classes.root}>
            <Link href={`/blogs/${slug}`}>
                {image ? (
                    <AspectRatio className="blog__image" ratio={16 / 9}>
                        <Image
                            src={image}
                            height={313}
                            style={{ objectFit: "cover" }}
                            width={400}
                            alt="blog-image"
                        />
                    </AspectRatio>
                ) : (
                    ""
                )}

                <Box className="blog__content">
                    <h3>{title}</h3>
                    <Text lineClamp={2}>
                        {preview_content && parse(preview_content)}
                    </Text>

                    <Flex className="tag_wrapper" mt={16}>
                        <Flex gap={10}>
                            <span className="tags">Tips</span>
                            <span className="tags">Managing</span>
                        </Flex>
                        <Flex gap={4}>
                            <IconCalendarEvent
                                size={14}
                                color={theme.colors.gray[5]}
                            />
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: `${theme.colors.gray[5]}`,
                                }}
                            >
                                {created_at
                                    ? format(new Date(created_at), "PP")
                                    : ""}
                            </p>
                        </Flex>
                    </Flex>
                </Box>
            </Link>
        </Box>
    );
};
