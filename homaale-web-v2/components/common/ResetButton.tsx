import { Button } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import React from "react";

import { reset } from "@/features/utils/filterSlice";
import { useAppDispatch } from "@/hooks";

export const ResetButton = () => {
    const dispatch = useAppDispatch();
    return (
        <Button
            radius={20}
            variant={"filled"}
            color={"red.5"}
            onClick={() => dispatch(reset())}
            sx={{
                "& span": {
                    color: "white",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: 12,
                },
            }}
        >
            reset
            <IconX size={14} style={{ marginLeft: 5 }} />
        </Button>
    );
};
