import { Box, createStyles, Flex, Group, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";

import DeleteModal from "@/components/common/DeleteModal";
import NoDataAlert from "@/components/common/NoDataAlert";
import RatingSection from "@/components/rating/RatingSection";
import { useProfile } from "@/hooks/useProfile";

import AddCertificationForm from "../AddCertificationForm";
import AddEducationForm from "../AddEducationForm";
import AddExperienceForm from "../AddExperienceForm";
import AddPortfolioForm from "../AddPortfolioForm";
import AddSkillsForm from "../AddSkillsForm";
import PortfolioDetails from "../PortfolioDetails";

const About = () => {
    const { classes } = useStyles();
    const { data: profile } = useProfile();

    const [showExpForm, setShowExpForm] = useState(false);
    const [isEditExp, setIsEditExp] = useState(false);
    const [experienceHovered, setExperienceHovered] = useState<null | number>(
        null
    );

    const [showAddSkillsForm, setShowAddSkillsForm] = useState(false);

    const [showEducationForm, setshowEducationForm] = useState(false);
    const [isEditEducation, setisEditEducation] = useState(false);
    const [educationHovered, setEducationHovered] = useState<null | number>(
        null
    );

    const [showCertificationForm, setShowCertificationForm] = useState(false);
    const [isEditCertification, setIsEditCertification] = useState(false);
    const [certificationHovered, setCertificationHovered] = useState<
        null | number
    >(null);

    const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
    const [isPortfolioEdit, setIsPortfolioEdit] = useState(false);
    const [portfolioHovered, setPortfolioHovered] = useState<null | number>(
        null
    );

    const [showPortfolioDetail, setShowPortfolioDetail] = useState(false);
    const [id, setId] = useState<number | undefined>();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalName, setModalName] = useState("");
    const [invalidateKey, setInvalidateKey] = useState("");

    const userSkills = profile?.skills ?? [];

    const handleDelete = (id: any, name: string, invalidateKey: string) => {
        setShowDeleteModal(!showDeleteModal);
        setId(id);
        setModalName(name);
        setInvalidateKey(invalidateKey);
    };

    const handleEdit = (id: any) => {
        setShowExpForm(!showExpForm);
        setId(id);
    };

    const largeScreen = useMediaQuery("(min-width: 60em)");

    return (
        <>
            {/* <ScrollArea.Autosize
                mah={760}
                offsetScrollbars
                scrollbarSize={5}
                scrollHideDelay={1}
            > */}
            <Box className={classes.contentBlock}>
                <Flex className="block-title">
                    <h4>My portfolio</h4>
                    <AddPortfolioForm
                        opened={showAddPortfolioModal}
                        setShowPortfolioForm={setShowAddPortfolioModal}
                        handleClose={() => {
                            setShowAddPortfolioModal(false);
                            setIsPortfolioEdit(false);
                        }}
                        isEditPortfolio={isPortfolioEdit}
                        id={id}
                    />
                    <PortfolioDetails
                        opened={showPortfolioDetail}
                        setShowPortfolioDetails={setShowPortfolioDetail}
                        handleClose={() => setShowPortfolioDetail(false)}
                        id={id}
                    />
                    <Text
                        component="a"
                        color={"blue"}
                        sx={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setShowAddPortfolioModal(true);
                            setIsPortfolioEdit(false);
                        }}
                    >
                        Add New
                    </Text>
                </Flex>
                <Group className="block-content" spacing={30}>
                    {profile?.portfolio && profile?.portfolio?.length > 0 ? (
                        profile?.portfolio?.map((item: any) => (
                            <Box
                                key={item.id}
                                onMouseEnter={() => {
                                    setPortfolioHovered(item?.id);
                                }}
                                onMouseLeave={() => {
                                    setPortfolioHovered(null);
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        margin: "auto",
                                        overflow: "hidden",
                                        "&:hover": {
                                            ".overlay": {
                                                opacity: 1,
                                            },
                                            ".content-details": {
                                                bottom: 10,
                                                right: 10,
                                                opacity: 1,
                                            },
                                        },
                                    }}
                                    className="content"
                                >
                                    <Box
                                        className="overlay"
                                        sx={{
                                            background:
                                                "linear-gradient(350deg, rgba(0,0,0,1) 7%, rgba(255,255,255,0.10) 100%)",
                                            position: "absolute",
                                            height: "100%",
                                            width: "100%",
                                            left: 0,
                                            top: 0,
                                            bottom: 0,
                                            right: 0,
                                            opacity: 0,
                                            transition: "all 0.25s ease",
                                        }}
                                    ></Box>
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
                                    >
                                        {portfolioHovered === item?.id ||
                                        !largeScreen ? (
                                            <Box
                                                ml={12}
                                                mb={0}
                                                className="icon-block"
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 0,
                                                }}
                                            >
                                                <IconEye
                                                    className="svg-icon portfolio-edit-icon"
                                                    size={16}
                                                    onClick={() => {
                                                        setId(item?.id);
                                                        setShowPortfolioDetail(
                                                            true
                                                        );
                                                    }}
                                                />
                                                <IconEdit
                                                    className="svg-icon portfolio-edit-icon"
                                                    size={16}
                                                    onClick={() => {
                                                        setId(item?.id);
                                                        setShowAddPortfolioModal(
                                                            true
                                                        );
                                                        setIsPortfolioEdit(
                                                            true
                                                        );
                                                    }}
                                                />
                                                <IconTrash
                                                    className="svg-icon delete-icon"
                                                    size={16}
                                                    onClick={() =>
                                                        handleDelete(
                                                            item?.id,
                                                            "portfolio",
                                                            "profile-data"
                                                        )
                                                    }
                                                />
                                            </Box>
                                        ) : (
                                            ""
                                        )}
                                    </Box>
                                </Box>
                                <p>{item.title}</p>
                            </Box>
                        ))
                    ) : (
                        <NoDataAlert message="Add some of your portfolios to showcase your works." />
                    )}
                </Group>
            </Box>
            <Box className={classes.contentBlock}>
                <Flex className="block-title">
                    <h4>Experience</h4>
                    <AddExperienceForm
                        opened={showExpForm}
                        setShowExpForm={setShowExpForm}
                        handleClose={() => {
                            setShowExpForm(false);
                            setIsEditExp(false);
                        }}
                        id={id}
                        isEditExp={isEditExp}
                    />
                    <Text
                        component="a"
                        color={"blue"}
                        sx={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setShowExpForm(true);
                            setIsEditExp(false);
                        }}
                    >
                        Add New
                    </Text>
                </Flex>
                <Box className="block-content">
                    {profile?.experience && profile?.experience.length > 0 ? (
                        profile?.experience?.map((item: any) => {
                            return (
                                <Box
                                    mb={24}
                                    key={item.id}
                                    onMouseEnter={() =>
                                        setExperienceHovered(item?.id)
                                    }
                                    onMouseLeave={() =>
                                        setExperienceHovered(null)
                                    }
                                >
                                    <Flex justify={"start"} align="center">
                                        <p className="block-content-title">
                                            {item.title}
                                        </p>
                                        {experienceHovered === item.id ||
                                        !largeScreen ? (
                                            <Box
                                                ml={12}
                                                mb={0}
                                                className="icon-block"
                                            >
                                                <IconEdit
                                                    className="svg-icon edit-icon"
                                                    size={16}
                                                    onClick={() => {
                                                        handleEdit(item?.id);
                                                        setIsEditExp(true);
                                                    }}
                                                />
                                                <IconTrash
                                                    className="svg-icon delete-icon"
                                                    size={16}
                                                    onClick={() =>
                                                        handleDelete(
                                                            item?.id,
                                                            "experience",
                                                            "profile-data"
                                                        )
                                                    }
                                                />
                                            </Box>
                                        ) : (
                                            ""
                                        )}
                                    </Flex>
                                    <p className="experience-org">
                                        {item.company_name} .{" "}
                                        {item.employment_type}
                                    </p>
                                    <p className="description"
                                        dangerouslySetInnerHTML={{ __html: item.description || "" }}
                                    />
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
                        <NoDataAlert message="Adding your work experience can increases your customer flow." />
                    )}
                </Box>
            </Box>

            <Box className={classes.contentBlock}>
                <Flex className="block-title">
                    <h4>Skills</h4>
                    <AddSkillsForm
                        opened={showAddSkillsForm}
                        setShowSkillsForm={setShowAddSkillsForm}
                        handleClose={() => setShowAddSkillsForm(false)}
                    />
                    <Text
                        component="a"
                        color={"blue"}
                        sx={{
                            cursor: "pointer",
                        }}
                        onClick={() => setShowAddSkillsForm(true)}
                    >
                        Add New
                    </Text>
                </Flex>
                <Box className="block-content">
                    {userSkills && userSkills.length > 0 ? (
                        <Group>
                            {userSkills.map((item, index) => (
                                <Text
                                    component="span"
                                    key={index}
                                    color="gray.7"
                                    sx={{
                                        background: "#EBF5FF",
                                        borderRadius: "32px",
                                        padding: "4px 16px",
                                    }}
                                >
                                    {item.name}
                                </Text>
                            ))}
                        </Group>
                    ) : (
                        <NoDataAlert message="Add Skills you are great at." />
                    )}
                </Box>
            </Box>

            <Box className={classes.contentBlock}>
                <Flex className="block-title">
                    <h4>Education</h4>
                    <AddEducationForm
                        opened={showEducationForm}
                        setShowEducationForm={setshowEducationForm}
                        handleClose={() => setshowEducationForm(false)}
                        id={id}
                        isEditEducation={isEditEducation}
                    />

                    <Text
                        component="a"
                        color={"blue"}
                        sx={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setshowEducationForm(true);
                            setisEditEducation(false);
                        }}
                    >
                        Add New
                    </Text>
                </Flex>
                <Box className="block-content">
                    {profile?.education && profile?.education?.length > 0 ? (
                        profile?.education?.map((item) => (
                            <Box
                                mb={24}
                                key={item?.id}
                                onMouseEnter={() =>
                                    setEducationHovered(item?.id)
                                }
                                onMouseLeave={() => setEducationHovered(null)}
                            >
                                <Flex justify={"start"} align="center">
                                    <p className="block-content-title">
                                        {item?.school}
                                    </p>
                                    {educationHovered === item.id ||
                                    !largeScreen ? (
                                        <Box
                                            ml={12}
                                            mb={0}
                                            className="icon-block"
                                        >
                                            <IconEdit
                                                className="svg-icon edit-icon"
                                                size={16}
                                                onClick={() => {
                                                    setId(item?.id);
                                                    setisEditEducation(true);
                                                    setshowEducationForm(true);
                                                }}
                                            />
                                            <IconTrash
                                                className="svg-icon delete-icon"
                                                size={16}
                                                onClick={() =>
                                                    handleDelete(
                                                        item?.id,
                                                        "education",
                                                        "profile-data"
                                                    )
                                                }
                                            />
                                        </Box>
                                    ) : (
                                        ""
                                    )}
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
                        <NoDataAlert message="Add education details to make your profile more outstanding." />
                    )}
                </Box>
            </Box>

            <Box className={classes.contentBlock}>
                <Flex className="block-title">
                    <h4>Certifications</h4>
                    <AddCertificationForm
                        opened={showCertificationForm}
                        setShowCertificationForm={setShowCertificationForm}
                        handleClose={() => setShowCertificationForm(false)}
                        id={id}
                        isEditCertification={isEditCertification}
                    />
                    <Text
                        component="a"
                        color={"blue"}
                        sx={{
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setShowCertificationForm(true);
                            setIsEditCertification(false);
                        }}
                    >
                        Add New
                    </Text>
                </Flex>
                <Box className="block-content">
                    {profile?.certificates &&
                    profile?.certificates?.length > 0 ? (
                        profile?.certificates?.map((item) => (
                            <Box
                                key={item.id}
                                mb={24}
                                onMouseEnter={() =>
                                    setCertificationHovered(item?.id)
                                }
                                onMouseLeave={() =>
                                    setCertificationHovered(null)
                                }
                            >
                                <Flex align={"start"} justify={"start"}>
                                    <p className="block-content-title">
                                        {item?.name}
                                    </p>
                                    {certificationHovered === item.id ||
                                    !largeScreen ? (
                                        <Box
                                            ml={12}
                                            mb={0}
                                            className="icon-block"
                                        >
                                            <IconEdit
                                                className="svg-icon edit-icon"
                                                size={16}
                                                onClick={() => {
                                                    setShowCertificationForm(
                                                        true
                                                    );
                                                    setId(item?.id);
                                                    setIsEditCertification(
                                                        true
                                                    );
                                                }}
                                            />
                                            <IconTrash
                                                className="svg-icon delete-icon"
                                                size={16}
                                                onClick={() =>
                                                    handleDelete(
                                                        item?.id,
                                                        "certification",
                                                        "profile-data"
                                                    )
                                                }
                                            />
                                        </Box>
                                    ) : (
                                        ""
                                    )}
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
                        <NoDataAlert message="Adding certifications will put more trust in your customers." />
                    )}

                    <DeleteModal
                        show={showDeleteModal}
                        setShowDeleteModal={setShowDeleteModal}
                        handleClose={() => setShowDeleteModal(false)}
                        id={id}
                        modalName={modalName}
                        invalidateKey={invalidateKey}
                    />
                </Box>
            </Box>
            {profile && profile?.rating?.user_rating_count ? (
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
            {/* </ScrollArea.Autosize> */}
        </>
    );
};

export default About;
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
            ".icon-block": {
                ".svg-icon": {
                    marginRight: 12,
                    cursor: "pointer",
                },
                ".edit-icon": {
                    color:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[1]
                            : theme.colors.secondary[4],
                },
                ".portfolio-edit-icon": {
                    color: "#fff",
                },
                ".delete-icon": {
                    color: theme.colors.red[6],
                },
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
            ".description": {
                '& p': {
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
                    lineHeight: '22px',
                },

                '& ul': {
                    listStyleType: 'disc !important',
                    paddingLeft: '1.5rem !important',
                    margin: '1em 0 !important',
                },
                '& ol': {
                    listStyleType: 'decimal !important',
                    paddingLeft: '1.5rem !important',
                    margin: '1em 0 !important',
                },

                "li[data-list='bullet']": {
                    display: 'list-item',
                    listStyleType: 'disc',
                    margin: '0.5em 0.5',

                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
                },

                "li[data-list='ordered']": {
                    display: 'list-item',
                    listStyleType: 'decimal',
                    // paddingLeft: '1.5rem',
                    margin: '0.5em 0',
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.homaaleSlate[5],
                },

                '& li': {
                    marginBottom: '0.5em',
                    lineHeight: '22px',
                },
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
