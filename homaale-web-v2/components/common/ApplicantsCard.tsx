import { Avatar, Box, Flex, Text } from "@mantine/core";
import {
    IconAlertCircle,
    IconCertificate2,
    IconCircleCheck,
    IconDiscountCheck,
    IconMoodHappy,
    IconSquareRoundedXFilled,
    IconStar,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";

import { useApplicantsCardStyles } from "@/styles/components/ApplicantsCardStyles";
import type { ApplicantsProps } from "@/types/booking/ApplicantsProps";
import { APPROVAL_STATUS } from "@/utils/RenderStatusButtons";

import { AppliedModal } from "../booking/AppliedModal";
import {boolean, string} from "yup";

export const ApplicantsCard = ({
                                   applicants,
                                   is_requested,
                                   disabled
                               }: {
    enitity_id: string,
    applicants: ApplicantsProps["result"][0],
    is_requested: boolean,
    disabled?: boolean
}) => {
    const { classes, cx } = useApplicantsCardStyles();

    const {
        created_by,
        created_at,
        id,
        price,
        earning,
        budget_type,
        currency,
        status,
    } = applicants ?? ({} as ApplicantsProps["result"][0]);

    const [applicantsModal, setApplicantsModal] = useState(false);

    const renderStatus = (status: string) => {
        switch (status) {
            case APPROVAL_STATUS.approved:
                return {
                    title: APPROVAL_STATUS.approved,
                    color: "#38C675",
                    icon: <IconCircleCheck size={16} />,
                };
            case APPROVAL_STATUS.cancelled:
                return {
                    title: APPROVAL_STATUS.cancelled,
                    color: "#FF9700",
                    icon: <IconAlertCircle size={16} />,
                };
            case APPROVAL_STATUS.rejected:
                return {
                    title: APPROVAL_STATUS.rejected,
                    color: "#FE5050",
                    icon: <IconSquareRoundedXFilled size={16} />,
                };

            default:
                break;
        }
    };
    return (
        <>
            <Box
                className={cx(
                    classes.root
                    //     , {
                    //     [classes.accept]: status === APPROVAL_STATUS?.approved,
                    //     [classes.reject]: status === APPROVAL_STATUS?.rejected,
                    // }
                )}
                onClick={() => setApplicantsModal(true)}
            >
                {/* <Text className="status_icon">
                    {status === APPROVAL_STATUS?.approved && <IconCheck />}
                    {status === APPROVAL_STATUS?.rejected && <IconX />}
                </Text> */}

                <Box className={classes.body}>
                    <Flex mb={16}>
                        <span>
                            {created_at && format(new Date(created_at), "PP")}
                        </span>
                        <Text
                            sx={{
                                textAlign: "center",
                                borderRadius: 6,
                                textTransform: "capitalize",
                                gap: 5,
                                alignItems: "center",
                                justifyContent: 'end'
                            }}
                            size={12}
                            display={"flex"}
                            p={4}
                            color={renderStatus(status)?.color}
                            bg={`${renderStatus(status)?.color}33`}
                        >
                            {renderStatus(status)?.icon}{" "}
                            {renderStatus(status)?.title}
                        </Text>
                    </Flex>
                    <Box className={classes.content}>
                        <Avatar size={"xl"} mx={"auto"} mb={8}>
                            <Image
                                src={
                                    created_by?.profile_image ??
                                    "/images/placeholder/profilePlaceholder.png"
                                }
                                fill
                                alt={`image-loadingLightPlaceHolder`}
                                placeholder="blur"
                                blurDataURL="/images/placeholder/profilePlaceholder.png"
                                style={{
                                    objectFit: "contain",
                                }}
                                className="profile_image"
                            />
                        </Avatar>
                        <h3>
                            {created_by?.user?.first_name}{" "}
                            {created_by?.user?.middle_name}{" "}
                            {created_by?.user?.last_name}
                            <IconDiscountCheck />
                        </h3>
                        <p>{created_by?.designation}</p>
                    </Box>
                    <Flex justify={"space-evenly"} wrap={"wrap"}>
                        <p>
                            <IconCertificate2 />{" "}
                            {+created_by?.stats?.success_rate?.toFixed(1)}
                        </p>
                        <p>
                            <IconMoodHappy /> {created_by?.stats?.happy_clients}
                        </p>
                        <p>
                            <IconStar />{" "}
                            {created_by?.stats?.avg_rating
                                ? +created_by?.stats?.avg_rating?.toFixed(1)
                                : 0}
                        </p>
                    </Flex>
                </Box>
                <Box className={classes.footer}>
                    <p>
                        {is_requested
                            ? `${currency} ${+parseFloat(price).toFixed(2)}`
                            : `${currency} ${+parseFloat(earning).toFixed(2)}`}
                        <span>/{budget_type}</span>
                    </p>
                </Box>
            </Box>
            {applicantsModal && (
                <AppliedModal
                    id={id}
                    opened={applicantsModal}
                    setOpened={setApplicantsModal}
                />
            )}
        </>
    );
};
