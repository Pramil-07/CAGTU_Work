import { Flex, useMantineTheme } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import Image from "next/image";

import { useHiringComponentStyles } from "@/styles/components/HiringComponet";
export type HiringProps = {
    title: string;
    desc: string;
    icon: Icon;
};
export const HiringComponent = ({ title, desc, icon: Icon }: HiringProps) => {
    const { classes } = useHiringComponentStyles();
    const theme = useMantineTheme();
    return (
        <Flex
            direction={"column"}
            className={classes.root}
            align={"flex-start"}
        >
            <Flex mb={24} gap={21}>
                <div className={classes.icon_wrapper}>
                    <Icon size={24} color={theme.colors.brand[3]} />
                </div>
                <Image
                    className="arrow_image"
                    src="/images/empty/careerarrow.png"
                    alt="image-careerarrowimage"
                    height={18}
                    width={150}
                   
                />
            </Flex>
            <h4>{title}</h4>
            <p>{desc}</p>
        </Flex>
    );
};
