import type { ActionIconProps } from "@mantine/core";
import { ActionIcon, Button, Text } from "@mantine/core";
import { IconArrowForwardUp } from "@tabler/icons-react";
import React, { useState } from "react";

import { useActionIconStyles } from "@/styles/components/ActionIconStyles";
import type { ShareIconProps } from "@/types/ShareIconProps";

import ShareModal from "./ShareModal";
import {PiArrowBendUpRightLight} from "react-icons/pi";

export const ShareButton = ({
    showText,
    className,
    url,
    ...rest
}: ShareIconProps & ActionIconProps) => {
    const { classes } = useActionIconStyles();
    const [showModal, setShowModal] = useState(false);
    const handleOnClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation();
        setShowModal(!showModal);
    };

    return (
        <>
            {showText ? (
                <Button
                    onClick={(e) => handleOnClick(e)}
                    color="blue"
                    variant="subtle"
                    compact
                    className={`${classes.iconContainer} ${className} `}
                    leftIcon={<PiArrowBendUpRightLight strokeWidth={8} size={22} />}
                    sx={(theme) => ({
                        "&:not([data-disabled]):hover": {
                            background:
                                theme.colorScheme === "dark"
                                    ? `${theme.colors.gray[8]} !important`
                                    : `${theme.colors.blue[0]} !important`,
                        },
                    })}
                >
                    <Text   className="edit">
                        {showText ? "Share" : ""}
                    </Text>
                </Button>
            ) : (
                <ActionIcon
                    color="blue"
                    variant="subtle"
                    {...rest}
                    onClick={(e) => {
                        handleOnClick(e);
                    }}
                    className={classes.saveIcon}
                    sx={(theme) => ({
                        "&:not([data-disabled]):hover": {
                            background:
                                theme.colorScheme === "dark"
                                    ? `${theme.colors.gray[8]} !important`
                                    : `${theme.colors.blue[0]} !important`,
                        },
                    })}
                >
                    <PiArrowBendUpRightLight className="w-6 h-6"/>
                </ActionIcon>
            )}
            <ShareModal
                opened={showModal}
                handleClose={() => setShowModal(false)}
                url={url}
            />
        </>
    );
};
