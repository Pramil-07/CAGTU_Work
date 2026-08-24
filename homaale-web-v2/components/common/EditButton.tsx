import { ActionIcon, Button } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import React from "react";

import { useActionIconStyles } from "@/styles/components/ActionIconStyles";


export const EditButton = ({
    onClick,
    showText,
}: {
    onClick: () => void;
    showText?: boolean;
}) => {
    const { classes } = useActionIconStyles();
    return (
        <>
            {showText ? (
                <Button className={classes.iconContainer}
                    onClick={(e) => {
                        onClick();
                        e.stopPropagation();
                    }}
                    leftIcon={<IconEdit size={18} />}
                    compact
                    variant="subtle"
                        sx={(theme) => ({
                            "&:not([data-disabled]):hover": {
                                background:
                                    theme.colorScheme === "dark"
                                        ? `${theme.colors.gray[8]} !important`
                                        : `${theme.colors.orange[0]} !important`,
                            },
                        })}
                >
                    <p style={{

                    }} className="edit" >Edit</p>
                </Button>
            ) : (
                <ActionIcon

                    color={"orange.4"}
                    onClick={(e) => {
                        onClick();
                        e.stopPropagation();
                    }}
                    variant="subtle"
                >
                    <IconEdit size={22} />
                </ActionIcon>
            )}
        </>
    );
};
