import { createStyles } from "@mantine/core";

export const useCategoryStyles = createStyles((theme) => ({
    root: {
        border: `1px solid rgba(0, 0, 0, 0.05)`,
        borderRadius: 4,
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        textAlign: "center",
        width: "100%",
        padding: "23px 10px",
        background:
            theme.colorScheme === "light" ? "#fff" : theme.colors.dark[6],

        "& figure": {
            position: "relative",
            height: 90,
            width: 90,
            display: "flex",
            alignItems: "center",
            borderRadius: "50%",
            justifyContent: "center",

            "& svg": {
                height: 40,
                width: 40,
                fill: "#ffff",
            },
        },
        "& h4": {
            fontWeight: 500,
            fontSize: 15,
            color:
                theme.colorScheme === "light"
                    ? theme.colors.gray[7]
                    : theme.colors.gray[2],
        },
        "&:hover": {
            transition: "all 0.1s ease",
            transform: "scale(1.02)",
            boxShadow: `0px 10px 30px -10px rgba(33, 29, 79, 0.3)`,
        },
    },
}));
