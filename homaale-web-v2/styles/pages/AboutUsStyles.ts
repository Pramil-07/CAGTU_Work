import { createStyles } from "@mantine/core";

export const useAboutUsStyles = createStyles((theme) => ({
    wrapper: {
        position: "relative",
        display: "inlineBlock",
        marginBottom: 80,
    },
    image: { display: "block", width: "100%", height: "auto" },
    textoverlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        fontSize: 40,
        fontWeight: 600,
        textAlign: "center",
        [theme.fn.smallerThan("md")]: {
            fontWeight: 400,
            fontSize: 25,
        },
        [theme.fn.smallerThan("sm")]: {
            fontWeight: 300,
            fontSize: 20,
        },
        [theme.fn.smallerThan("xs")]: {
            display: "none",
        },
    },
    cardimage: {
        display: "block",
        [theme.fn.smallerThan(700)]: {
            display: "none",
        },
        [theme.fn.smallerThan(1000)]: {
            width: 200,
        },
    },
    heading: { fontSize: 16, fontWeight: 500, marginBottom: 16 },
    description: {
        fontSize: 14,
        fontWeight: 400,
        textAlign: "justify",
        color:
            theme.colorScheme === "dark"
                ? theme.colors.homaaleSlate[2]
                : "black",
    },
    descdiv: {
        postition: "absolute",
        padding: 10,
        background: "rgba(75, 85, 99, 0.60)",
        borderRadius: 4,
        top: "20%",
        transform: "translate(0%, -100%)",
        color: "white",
        fontWeight: 500,
        fontSize: 20,
    },
    contentwrapper: {
        [theme.fn.smallerThan(700)]: {
            display: "none",
        },
    },
}));
