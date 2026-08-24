import type { SelectItem } from "@mantine/core";
import { Group } from "@mantine/core";
import { Text } from "@mantine/core";
import { Box } from "@mantine/core";
import { Flex } from "@mantine/core";
import { createStyles } from "@mantine/core";
import { Button } from "@mantine/core";
import { Select } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import React, { useState } from "react";

import { useData } from "@/hooks/useData";
import type { AvatarProps } from "@/types/AvatarProps";
import type { ServiceCategoryOptions } from "@/types/ServiceCategoryOptionsProps";
import { axiosClient } from "@/utils/axiosClient";

import NoDataAlert from "../common/NoDataAlert";

const AvatarForm = ({
    onAvatarEdit,
    setShowEditForm,
    userId,
    setFieldValue,
}: {
    onAvatarEdit: (avatar: AvatarProps[0]) => void;
    setShowEditForm: Dispatch<SetStateAction<boolean>>;
    userId?: string;
    setFieldValue: (key: string, data: number | undefined) => void;
}) => {
    const [value, setValue] = useState<string>("1");
    const [avatarData, setAvatarData] = useState<AvatarProps[0] | null>();
    const { data: nestedData } = useData<ServiceCategoryOptions>(
        ["category-list"],
        "/task/cms/task-category/list/"
    );

    const queryClient = useQueryClient();

    const serviceItems: SelectItem[] = nestedData
        ? nestedData?.data.map((service) => ({
              id: service?.id,
              label: service?.name,
              value: service?.id,
          }))
        : [];

    const { data: Avatar } = useData<AvatarProps>(
        ["Avatar-list", value],
        `/task/avatar/list?category=${value}`,
        !!value
    );

    const { classes } = useStyles();

    const handleSubmit = async () => {
        setFieldValue("avatar", avatarData?.id);
        try {
            const { data } = await axiosClient.patch("/tasker/profile/", {
                avatar: avatarData?.id,
                profile_image: null,
            });
            queryClient.setQueryData(["profile-data"], data);
            queryClient.invalidateQueries(["user-data"]);
            window.location.reload();
            // dispatch(update(data));
        } catch (error) {
            console.log(error);
        }
        avatarData && onAvatarEdit(avatarData);
        setShowEditForm(avatarData ? false : true);
    };

    return (
        <div className={classes.avatarSection}>
            <Flex justify="flex-start" align="center">
                <Text component="span"> Select Category</Text>
                <Select
                    ml={16}
                    radius={20}
                    placeholder="Pick one"
                    value={value}
                    onChange={(id: string) => {
                        setValue(id ?? "");
                        setAvatarData(null);
                    }}
                    searchable
                    dropdownPosition="bottom"
                    data={serviceItems}
                />
            </Flex>
            <Flex justify={"flex-start"}>
                {Avatar?.data && Avatar?.data?.length > 0 ? (
                    Avatar?.data.map((item, key) => (
                        <figure
                            key={key}
                            onClick={() => {
                                avatarData?.id === item?.id
                                    ? setAvatarData(null)
                                    : setAvatarData(item);
                            }}
                        >
                            <Image
                                src={
                                    item?.image
                                        ? item?.image
                                        : "/placeholder/profilePlaceholder.png"
                                }
                                alt="avatar"
                                width={120}
                                height={120}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    borderRadius: "50%",
                                    display: "none",
                                }}
                                className={` ${
                                    avatarData?.id === item?.id && "click"
                                }`}
                            >
                                <IconCheck className="icon" size={24} />
                            </Box>
                        </figure>
                    ))
                ) : (
                    <Box m={"24px 0"} w={"100%"}>
                        <NoDataAlert />
                    </Box>
                )}
            </Flex>
            <Group grow>
                <Button
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                >
                    Cancel
                </Button>
                <Button onClick={() => handleSubmit()} disabled={!avatarData}>
                    Apply
                </Button>
            </Group>
        </div>
    );
};

const useStyles = createStyles(() => ({
    avatarSection: {
        figure: {
            position: "relative",
            img: {
                borderRadius: "50%",
            },
        },
        ".click": {
            top: 0,
            background: "rgba(61, 174, 255, 0.6)",
            width: 120,
            height: 120,
            display: "block",
            ".icon": {
                position: "absolute",
                top: "37%",
                left: "42%",
                height: "25%",
                color: "#fff",
            },
        },
    },
}));

export default AvatarForm;
