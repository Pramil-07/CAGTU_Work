import { Box, Flex } from "@mantine/core";
import Image from "next/image";

import { useAboutCardStyles } from "@/styles/components/AboutCardStyles";
import type { AboutCardProps } from "@/types/AboutUs/aboutcard";

const AboutCard = ({
    cardImage, 
    
    cardDescription, 
    cardTitle,
}: AboutCardProps) => {
    const { classes } = useAboutCardStyles();
    return (
        <Box className={classes.root}>
                            <>
 <Image
                className={classes.cardimage}
                src={cardImage}
                alt=""
                height={313}
                width={422}
            />
            <Flex
                className={classes.carddesc}
                direction={"column"}
                justify={"center"}
                align={"center"}
                p={40}
                left={13}
                right={10}
                bottom={-72}
            >
                <h4>{cardTitle}</h4>
                <p>{cardDescription}</p>
            </Flex>
                            </>
        </Box>
    );
};
export default AboutCard;
