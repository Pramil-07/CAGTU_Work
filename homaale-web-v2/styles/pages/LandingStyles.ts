import { createStyles } from "@mantine/core";

export const useLandingStyles = createStyles((theme) => ({
    root: {
        ".more__link": {
            display: "flex",
            alignItems: "center",
            gap: 10,
            color:
                theme.colorScheme === "light"
                    ? theme.colors.homaaleSlate[8]
                    : theme.colors.homaaleSlate[1],
            fontWeight: 500,

            "& svg": {
                height: 20,
                width: 20,
            },
            "&:hover": {
                transition: "0.1s ease",
                color: theme.colors.brand[3],
            },
        },
        "& h2": {
            fontWeight: 600,
            fontSize: 40,
            [theme.fn.smallerThan("lg")]: {
                fontSize: 24,
            },
        },
        "& h3": {
            fontWeight: 500,
            fontSize: 20,
        },
        "& h5": {
            fontWeight: 500,
            fontSize: 16,
            color: theme.colors[theme.primaryColor][4],
            [theme.fn.smallerThan("lg")]: {
                fontSize: 14,
            },
        },

        "& button": {
            fontWeight: 500,
            gap: 10,
            fontSize: 15,

            "& svg": {
                marginLeft: 10,
            },

            "&:not([data-disabled]):hover": {
                transition: "0.2s all ease",
                background: `${theme.colors[theme.primaryColor][4]}`,
            },
        },

        ".secondary__link": {
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontWeight: 500,
            fontSize: 15,
            cursor: "pointer",
            color:
                theme.colorScheme === "light"
                    ? theme.colors.homaaleSlate[8]
                    : theme.colors.homaaleSlate[1],
            "&: hover": {
                color: `${theme.colors[theme.primaryColor][4]}`,
                transition: "0.3s all",
            },
        },
    },
    main: {
        "& p": {
            color:
                theme.colorScheme === "light"
                    ? theme.colors.homaaleSlate[6]
                    : theme.colors.homaaleSlate[3],
            margin: "16px 0 48px",
        },
    },
    category: {
        ".mantine-Grid-root": {
            ".mantine-Grid-col": {
                "&:nth-of-type(1)": {
                    ".category__card": {
                        "& figure": {
                            background: "#00D084",
                        },
                    },
                },
                "&:nth-of-type(2)": {
                    ".category__card": {
                        "& figure": {
                            background: "#0693E3",
                        },
                    },
                },
                "&:nth-of-type(3)": {
                    ".category__card": {
                        "& figure": {
                            background: "#975FE0",
                        },
                    },
                },
                "&:nth-of-type(4)": {
                    ".category__card": {
                        "& figure": {
                            background: "#3F60D6",
                        },
                    },
                },
                "&:nth-of-type(5)": {
                    ".category__card": {
                        "& figure": {
                            background: "#116EA3",
                        },
                    },
                },
                "&:nth-of-type(6)": {
                    ".category__card": {
                        "& figure": {
                            background: "#F2A73A",
                        },
                    },
                },
                "&:nth-of-type(7)": {
                    ".category__card": {
                        "& figure": {
                            background: "#E05353",
                        },
                    },
                },
                "&:nth-of-type(8)": {
                    ".category__card": {
                        "& figure": {
                            background: "#80A9C0",
                        },
                    },
                },
                "&:nth-of-type(9)": {
                    ".category__card": {
                        "& figure": {
                            background: "#D4926D",
                        },
                    },
                },
                "&:nth-of-type(10)": {
                    ".category__card": {
                        "& figure": {
                            background: "#61CCD2",
                        },
                    },
                },
                "&:nth-of-type(11)": {
                    ".category__card": {
                        "& figure": {
                            background: "#1B3874",
                        },
                    },
                },
                "&:nth-of-type(12)": {
                    ".category__card": {
                        "& figure": {
                            background: "#49A7DD",
                        },
                    },
                },
            },
        },
    },
    trust: {
        "& p": {
            font: "400 16px/27px inter",
            color: theme.colors.homaaleSlate[6],
        },
    },
    brand: {
        textAlign: "center",
        marginBottom: 80,
        "& h4": {
            marginBottom: 46,
        },
    },
    mobileNavigation: {
        display: "none",
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "#fff",
        borderTop:
            theme.colorScheme === "dark"
                ? "1px solid #475569"
                : "1px solid #E2E8F0",
        zIndex: 1000,
        position: "sticky",
        bottom: 0,
        padding: "10px 20px",
        "& svg": {
            marginLeft: "0 !important",
        },
        [theme.fn.smallerThan("md")]: {
            display: "block",
        },
    },
}));
