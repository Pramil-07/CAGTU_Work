import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

export const useSidebarCollapsed = () => {
    const [opened, setOpened] = useState<boolean>(false);
    const [minimize, setMinimize] = useState<boolean>(false);
    const mediaMatch = useMediaQuery("(min-width: 900px)");

    const handleAsideToggler = () => {
        setOpened((o) => !o);
        if (mediaMatch) {
            setMinimize((min) => !min);
        } else {
            setMinimize(false);
        }
    };

    return { opened, minimize, handleAsideToggler };
};
