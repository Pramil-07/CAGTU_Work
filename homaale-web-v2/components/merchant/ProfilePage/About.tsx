import React, {useEffect, useState} from "react";
import {useDark} from "@/utils/helpers";
import {Box, useMantineTheme, Button} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {FaRegEdit} from "react-icons/fa";
import {axiosClient} from "@/utils/axiosClient";
import type {ProfileResponseProps} from "@/types/ProfileResponseProps";
import {Editor} from "primereact/editor";
import {useEntityServiceDetailStyles} from "@/styles/pages/EntityServiceDetailStyles";

interface MerchantData {
    id: string;
    about: string;
}

interface Profile {
    merchant_data: MerchantData;
    merchantId: ProfileResponseProps;
}

const About = ({merchantId, hasPermission}: { merchantId: any; hasPermission: boolean }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isEditing, setIsEditing] = useState(true);
    const [editedAbout, setEditedAbout] = useState<string>("");
    const isMobile = useMediaQuery("(max-width: 768px)");
    const theme = useMantineTheme();
    const dark = useDark();
    const {classes} = useEntityServiceDetailStyles();

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${merchantId}/`);
                setProfile(response.data);
                setEditedAbout(response.data.merchant_data.about || "");
            } catch (error) {
                // console.error("Error fetching data:", error);
            }
        };
        fetchApiData();
    }, [merchantId]);

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditedAbout(profile?.merchant_data?.about || "");
        } else if (editedAbout === "Write a short bio here  !") {
            setEditedAbout(" ");
        }
        setIsEditing((prev) => !prev);
    };

    const handleSave = async () => {
        if (!profile?.merchant_data?.id) {
            // console.error("No merchant ID found");
            return;
        }

        try {
            const response = await axiosClient.put(`/merchant/about/${merchantId}/`, {
                about: editedAbout,
            });

            if (response.data) {
                setProfile((prev) => ({
                    ...prev!,
                    merchant_data: {
                        ...prev!.merchant_data,
                        about: editedAbout,
                    },
                }));
                setIsEditing(true);
            }
        } catch (error) {
            // console.error("Error saving profile data:", error);
        }
    };

    const handleCancel = () => {
        setEditedAbout(profile?.merchant_data?.about || "");
        setIsEditing(true);
    };

    return (
        <div
            style={{
                background: dark ? theme.colors.dark[6] : "#fff",
                border: dark ? "1px solid grey" : "",
            }}
            className="flex flex-col w-full rounded-2xl shadow-xl max-md:mr-0.5 max-md:max-w-full"
        >
            <div
                style={{
                    background: dark ? theme.colors.dark[6] : "#fff",
                    color: dark ? "white" : "black",
                    alignItems: "center",
                }}
                className="flex flex-wrap gap-10 justify-between items-center px-8 pt-9 pb-3.5 w-full text-xl whitespace-nowrap bg-white rounded-3xl min-h-[78px] max-md:px-5 max-md:max-w-full"
            >
                <h2 className="flex flex-col self-stretch my-auto font-medium w-[61px]">
                    <span className="rounded-none w-[61px]">About</span>
                </h2>
                {hasPermission && (
                    <button
                        className="self-stretch my-auto w-6 text-center min-h-[24px]"
                        aria-label="Toggle about section"
                        onClick={handleEditToggle}
                    >
                        <FaRegEdit/>
                    </button>
                )}
            </div>
            <hr/>
            <div className="p-10 w-full leading-5 rounded-none max-md:px-5 max-md:max-w-full">
                {!isEditing && hasPermission ? (
                    <Box
                        style={{
                            fontFamily: "sans-serif",
                            width: "100%",
                        }}
                    >
                        <Editor
                            placeholder="Write about yourself"
                            value={editedAbout}
                            onTextChange={(e) => setEditedAbout(e.htmlValue || "")}

                        />
                        <div style={{marginTop: "10px"}}>
                            <Button onClick={handleSave} style={{marginRight: "10px"}}>
                                Save
                            </Button>
                            <Button onClick={handleCancel} color="gray">
                                Cancel
                            </Button>
                        </div>
                    </Box>
                ) : profile ? (
                    <Box
                        style={{
                            fontSize: "20px",
                            color: dark ? "white" : "black",
                            fontFamily: "sans-serif",
                            width: "100%",
                            maxHeight: "25rem", // Set maximum height for scroll
                            overflowY: "auto", // Enable vertical scrolling
                            paddingRight: "10px", // Space for scrollbar
                        }}
                        className={classes.description}
                    >
                        <div
                            dangerouslySetInnerHTML={{
                                __html: profile.merchant_data?.about ||
                                    (hasPermission
                                        ? "Write about your profile."
                                        : "There is no merchant's about section."),
                            }}
                        />
                    </Box>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default About;
