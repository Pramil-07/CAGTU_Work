import type { ButtonProps } from "@mantine/core";
import { Text } from "@mantine/core";
import { Button } from "@mantine/core";
import type { ReactNode } from "react";
import React from "react";

export type SlotButtonProps = {
    children: ReactNode;
    onClick: () => void;
};

export const SlotButton = ({
    children,
    onClick,
    ...rest
}: SlotButtonProps & ButtonProps) => {
    return (
        <Button {...rest} onClick={onClick}>
            <Text weight={400} size={14} component={"span"}>
                {children}
            </Text>
        </Button>
    );
};
