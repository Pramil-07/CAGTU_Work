import { createStyles } from "@mantine/core";

export const useAuthLayoutStyles = createStyles((theme) => ({
    wrapper: {
        height: "100vh",
        padding: 32,
        ".left-container": {
            width: "100%",
            padding: "24px 0px",
            // position: "relative",
            [`@media (min-width: ${theme.breakpoints.md}px)`]: {
                padding: "190px 120px",
                width: "65%",
            },
            [`@media (min-width: 1024px)`]: {
                padding: "32px",
                width: "65%",
            },
            [`@media (min-width: ${theme.breakpoints.lg}px)`]: {
                padding: "100px 120px",
            },
            [`@media (min-width: ${theme.breakpoints.xl}px)`]: {
                padding: "190px 240px",
            },
            [`@media (min-width: 1800px)`]: {
                padding: "100px 360px",
            },
            "& img": {
                position: "absolute",
                top: 32,
                left: 32,
            },
            "& h1": {
                fontSize: 32,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[3]
                        : theme.colors.homaaleSlate[8],
                fontWeight: 600,
                textTransform: "capitalize",
                marginTop: 32,
                [`@media (min-width: ${theme.breakpoints.md}px)`]: {
                    marginTop: 0,
                },
            },
            "& p": {
                fontSize: 16,
                color:
                    theme.colorScheme === "dark"
                        ? theme.colors.homaaleSlate[4]
                        : theme.colors.homaaleSlate[5],
                fontFamily: "Inter",
                marginBottom: 50,
            },
            ".social-btn": {
                background: "none",
                border: `1px solid ${theme.colors.gray[4]}`,
                borderRadius: 8,
                color: theme.colors.homaaleSlate[8],
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 8,
                padding: "0 12px",
                "&:first-of-type": {
                    marginRight: 8,
                    [`@media (min-width: ${theme.breakpoints.md}px)`]: {
                        marginRight: 24,
                    },
                },
            },
            ".horizontal-line": {
                overflow: "hidden",
                textAlign: "center",
                margin: "30px 0 28px 0",
                "&::before, &::after": {
                    background: "#00000010",
                    content: '""',
                    display: "inline-block",
                    height: 1,
                    position: "relative",
                    verticalAlign: "middle",
                    width: "50%",
                },
                "&::before": {
                    right: 10,
                    marginLeft: "-50%",
                },
                "&::after": {
                    left: 10,
                    marginRight: "-50%",
                },
            },
        },
        ".right-container": {
            width: "35%",
            height: "93vh",
            backgroundImage: `url("/images/authImg.png")`,
            backgroundRepeat: "no-repeate",
            backgroundSize: "cover",
            borderRadius: "12px",
            [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                display: "none",
            },
            "& p": {
                fontSize: 22,
                fontWeight: 500,
                lineHeight: "36px",
                color: "#FFF",
                padding: "120px 50px",
            },
        },
    },
}));
