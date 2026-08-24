import { Box, Flex } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/router";

import { useUserStatus } from "@/hooks/useUserStatus";
import { usePostApplyStyles } from "@/styles/components/PostApplyStyles";

export type PostApplyProps = {
    title: string;
    image: string;
    description: string;
    button: string;
    link?: string;
    is_requested?: boolean;
};
export const PostApply = ({
    title,
    image,
    description,
    button,
    link,
    is_requested,
}: PostApplyProps) => {
    const { classes } = usePostApplyStyles();
    const router = useRouter();
    const { checkStatus } = useUserStatus();
    const handleClick = () => {
        if (link) {
            router.push(link);
        } else {
            if (checkStatus("kyc")) {
                router.push({
                    pathname: "/post/entity",
                    query: {
                        is_requested: is_requested,
                    },
                });
            }
        }
    };

    return (
        <Box className={classes.root}>
            <Image
                src={image}
                height={148}
                width={148}
                alt="image-post_apply"
                style={{ borderRadius: 75 }}
            />
            <h3>{title}</h3>
            <p>{description}</p>
            <Flex gap={15} className="button_wrapper" onClick={handleClick}>
                {button}
                <IconArrowRight size={24} />
            </Flex>
        </Box>
    );
};
