import { createStyles } from "@mantine/core";

export const useAboutCardStyles = createStyles((theme) => ({
    root: {
        position: "relative",
    },
    carddesc: {
        position: "absolute",
        background: "#FFF",
        borderRadius: 4,
        border: "1px solid rgba(0, 0, 0, 0.10)",
        [theme.fn.smallerThan(1000)]: {
            width: 200,
        },
        [theme.fn.smallerThan(1000)]: {
            marginBottom: 60,
        },
        "& h4": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[8]
                    : "black",
        },
    },
    cardimage: {
        borderRadius: 4,
        [theme.fn.smallerThan(1600)]: {
            width: 300,
        },
        [theme.fn.smallerThan(1200)]: {
            width: 250,
        },
        [theme.fn.smallerThan(1000)]: {
            marginBottom: 40,
            width: "100%",
        },
    },
}));
