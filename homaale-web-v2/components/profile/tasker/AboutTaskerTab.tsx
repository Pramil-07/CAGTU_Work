import { Box, createStyles, Flex, Group, Text } from "@mantine/core";
import { format } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";

import NoDataAlert from "@/components/common/NoDataAlert";
import RatingSection from "@/components/rating/RatingSection";
import type { ProfileResponseProps } from "@/types/ProfileResponseProps";

import PortfolioDetails from "../PortfolioDetails";

const AboutTaskerTab = ({ profile }: { profile: ProfileResponseProps }) => {
    const { classes } = useStyles();

    const [showPortfolioDetail, setShowPortfolioDetail] = useState(false);
    const [id, setId] = useState<number | undefined>();

    const userSkills = profile?.skills ?? [];

    return (
        <>
            <Box className={classes.contentBlock}>
                <h4 className="block-title">My portfolio</h4>
                <PortfolioDetails
                    opened={showPortfolioDetail}
                    setShowPortfolioDetails={setShowPortfolioDetail}
                    handleClose={() => setShowPortfolioDetail(false)}
                    id={id}
                />
                <Group className="block-content" spacing={30}>
                    {profile?.portfolio && profile?.portfolio?.length > 0 ? (
                        profile?.portfolio?.map((item: any) => (
                            <Box
                                key={item.id}
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    setId(item?.id);
                                    setShowPortfolioDetail(true);
                                }}
                            >
                                <Box className="content">
                                    <figure>
                                        <Image
                                            src={
                                                item.images.length > 0
                                                    ? item.images[0].media
                                                    : "/images/placeholder/loadingLightPlaceHolder.jpg"
                                            }
                                            height={150}
                                            width={250}
                                            alt="img"
                                            placeholder="blur"
                                            blurDataURL="/images/placeholder/loadingLightPlaceHolder.jpg"
                                            style={{
                                                objectFit: "cover",
                                            }}
                                        />
                                    </figure>
                                    <Box
                                        className="content-details"
                                        sx={{
                                            position: "absolute",
                                            textAlign: "center",
                                            width: "100%",
                                            bottom: 10,
                                            right: 10,
                                            opacity: 0,
                                            transition: "all 0.25s ease",
                                        }}
                                    ></Box>
                                </Box>
                                <p>{item.title}</p>
                            </Box>
                        ))
                    ) : (
                        <NoDataAlert message="No portfolio details to show." />
                    )}
                </Group>
            </Box>
            <Box className={classes.contentBlock}>
                <h4 className="block-title">Experience</h4>
                <Box className="block-content">
                    {profile?.experience && profile?.experience.length > 0 ? (
                        profile?.experience?.map((item: any) => {
                            return (
                                <Box mb={24} key={item.id}>
                                    <Flex justify={"start"} align="center">
                                        <p className="block-content-title">
                                            {item.title}
                                        </p>
                                    </Flex>
                                    <p className="experience-org">
                                        {item.company_name} .{" "}
                                        {item.employment_type}
                                    </p>
                                    <p className="experience-desc">
                                        <span
                                        dangerouslySetInnerHTML={{ __html: item.description || "" }}
/>
                                    </p>
                                    <p className="experience-period">
                                        {format(
                                            new Date(item?.start_date),
                                            "MMMM yyyy"
                                        )}
                                        {`${
                                            !item?.currently_working
                                                ? ` - ${
                                                      item?.end_date &&
                                                      format(
                                                          new Date(
                                                              item.end_date
                                                          ),
                                                          "MMMM yyyy"
                                                      )
                                                  }`
                                                : " - Present"
                                        }`}
                                    </p>
                                    <p className="experience-location">
                                        {item.location}
                                    </p>
                                </Box>
                            );
                        })
                    ) : (
                        <NoDataAlert message="No experience data to show." />
                    )}
                </Box>
            </Box>

            <Box className={classes.contentBlock}>
                <h4 className="block-title">Skills</h4>
                <Box className="block-content">
                    {userSkills && userSkills.length > 0 ? (
                        <Group>
                            {userSkills.map((item, index) => (
                                <Text
                                    component="span"
                                    color="gray.7"
                                    key={index}
                                    sx={{
                                        background: "#EBF5FF",
                                        borderRadius: "32px",
                                        padding: "4px 16px",
                                    }}
                                >
                                    {item?.name}
                                </Text>
                            ))}
                        </Group>
                    ) : (
                        <NoDataAlert message="No Skills data to show." />
                    )}
                </Box>
            </Box>

            <Box className={classes.contentBlock}>
                <h4 className="block-title">Education</h4>
                <Box className="block-content">
                    {profile?.education && profile?.education?.length > 0 ? (
                        profile?.education?.map((item) => (
                            <Box mb={24} key={item?.id}>
                                <Flex justify={"start"} align="center">
                                    <p className="block-content-title">
                                        {item?.school}
                                    </p>
                                </Flex>
                                <p className="experience-org">{item?.degree}</p>

                                <p className="experience-period">
                                    {format(
                                        new Date(item?.start_date),
                                        "MMMM yyyy"
                                    )}
                                    -
                                    {format(
                                        new Date(item?.end_date),
                                        "MMMM yyyy"
                                    )}
                                </p>
                                <p className="experience-location">
                                    {item?.location}
                                </p>
                            </Box>
                        ))
                    ) : (
                        <NoDataAlert message="No Education data to show." />
                    )}
                </Box>
            </Box>

            <Box className={classes.contentBlock}>
                <h4 className="block-title">Certifications</h4>
                <Box className="block-content">
                    {profile?.certificates &&
                    profile?.certificates?.length > 0 ? (
                        profile?.certificates?.map((item) => (
                            <Box key={item.id} mb={24}>
                                <Flex align={"start"} justify={"start"}>
                                    <p className="block-content-title">
                                        {item?.name}
                                    </p>
                                </Flex>
                                <p className="experience-org">
                                    {item?.issuing_organization}
                                </p>

                                <p className="experience-period">
                                    Issued on{" "}
                                    {format(
                                        new Date(item?.issued_date),
                                        "MMMM yyyy"
                                    )}
                                    {`${
                                        item?.does_expire === false
                                            ? `- ${
                                                  item?.expire_date &&
                                                  format(
                                                      new Date(
                                                          item.expire_date
                                                      ),
                                                      "MMMM yyyy"
                                                  )
                                              }`
                                            : " - No Expiration Date"
                                    }`}
                                </p>
                                <p className="experience-location">
                                    {item?.credential_id}
                                </p>
                            </Box>
                        ))
                    ) : (
                        <NoDataAlert message="No certifications data to show." />
                    )}
                </Box>
            </Box>
            {profile?.rating?.user_rating_count ? (
                <RatingSection
                    id={profile?.user?.id}
                    total={profile?.rating?.user_rating_count}
                    created_by={{
                        full_name: profile?.user?.full_name,
                        profile_image: profile?.profile_image,
                        id: profile?.user?.id,
                    }}
                    is_service={false}
                />
            ) : (
                ""
            )}
        </>
    );
};

export default AboutTaskerTab;

export const useStyles = createStyles((theme) => ({
    contentBlock: {
        borderBottom:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : "1px solid #00000008",
        padding: "24px 0",
        ".mantine-Modal-header": { padding: 16 },
        ".block-title": {
            marginBottom: 10,
        },
        ".block-content": {
            figure: {
                margin: 0,
                img: {
                    borderRadius: 4,
                },
            },
            p: {
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.gray[1]
                        : theme.colors.homaaleSlate[7],
                marginTop: 8,
            },
            ".block-content-title": {
                margin: 0,
                fontSize: 15,
                fontWeight: 500,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.homaaleSlate[8],
            },
            ".experience-org": {
                fontSize: 13,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[2]
                        : theme.colors.gray[8],
                fontWeight: 400,
                marginTop: 10,
            },
            ".experience-desc": {
                fontSize: 14,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.colors.homaaleSlate[5],
                fontWeight: 400,
                lineHeight: "22px",
            },
            ".experience-period": {
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.dark[2]
                        : theme.colors.gray[8],
                fontWeight: 400,
                marginTop: 16,
            },
            ".experience-location": {
                color: theme.colors.homaaleSlate[5],
                fontWeight: 400,
            },
            ".mantine-Chip-label": {
                background: "#EBF5FF",
                color: theme.colors.homaaleSlate[8],
            },
        },
    },
}));
