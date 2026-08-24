import type { ActionIconProps } from "@mantine/core";
import { ActionIcon, Button, Text, useMantineTheme } from "@mantine/core";
import { IconBookmark } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import { useBookmark } from "@/hooks/useBookmark";
import { useActionIconStyles } from "@/styles/components/ActionIconStyles";
import type { SaveIconProps } from "@/types/SaveIconProps";
import {FaRegBookmark} from "react-icons/fa";
import {GoBookmarkFill} from "react-icons/go";

const SaveIcon = ({
    object_id,
    model,
    filled,
    showText,
    className,
    ...rest
}: SaveIconProps & ActionIconProps) => {
    const { classes } = useActionIconStyles();
    const theme = useMantineTheme();

    const [bookmarkFilled, setBookmarkFilled] = useState(filled);

    useEffect(() => {
        setBookmarkFilled(filled);
    }, [filled]);

    const { mutate, isLoading } = useBookmark();

    const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!object_id || !model) return;
        mutate(
            { object_id, model },
            {
                onSuccess: (e) => {
                    if (e.model_id === object_id) {
                        if (e.status === "add") {
                            setBookmarkFilled(true);
                        } else if (e.status === "remove") {
                            setBookmarkFilled(false);
                        }
                    }
                },
            }
        );
    };

    return showText ? (
        <Button
            color="red"
            variant="subtle"
            loading={isLoading}
            onClick={handleSaveClick}
            compact
            className={`${classes.iconContainer} ${className}`}
            leftIcon={
                bookmarkFilled ? (
                    <GoBookmarkFill
                        size={20}
                        style={{
                            fill:
                                theme.colorScheme === "dark"
                                    ? theme.colors.red[5]
                                    : theme.colors.red[7],
                            stroke:
                                theme.colorScheme === "dark"
                                    ? theme.colors.red[5]
                                    : theme.colors.red[7],
                        }}
                    />
                ) : (
                    <FaRegBookmark
                        size={18}
                        style={{
                            fill:
                                theme.colorScheme === "dark"
                                    ? theme.colors.red[5]
                                    : theme.colors.red[7],
                            stroke:
                                theme.colorScheme === "dark"
                                    ? theme.colors.red[5]
                                    : theme.colors.red[7],
                        }}
                    />
                )
            }
            sx={(theme) => ({
                fontSize: "12px",
                fontWeight: 400,
                "&:not([data-disabled]):hover": {
                    background:
                        theme.colorScheme === "dark"
                            ? `${theme.colors.gray[8]} !important`
                            : `${theme.colors.red[0]} !important`,
                },
            })}
        >
            {showText ? (
                <Text
                   className="edit"
                    component="span"
                    // color={theme.colorScheme === "dark" ? "white" : "white"}
                >
                    {bookmarkFilled ? "Remove" : "Save"}
                </Text>
            ) : null}
        </Button>
    ) : (
        <ActionIcon
            color="red"
            loading={isLoading}
            onClick={handleSaveClick}
            variant="subtle"
            className={classes.saveIcon}
            sx={(theme) => ({
                "&:not([data-disabled]):hover": {
                    background:
                        theme.colorScheme === "dark"
                            ? `${theme.colors.gray[8]} !important`
                            : `${theme.colors.red[0]} !important`,
                },
            })}
            {...rest}
        >
            {bookmarkFilled ? (
                <IconBookmark
                    style={{
                        fill: `${theme.colors.red[7]}`,
                        stroke: `${theme.colors.red[7]}`,
                    }}
                />
            ) : (
                <IconBookmark
                    style={{
                        fill: `${theme.colors.red[7]}`,
                        stroke: `${theme.colors.red[7]}`,
                    }}
                />
            )}
        </ActionIcon>
    );
};
export default SaveIcon;
