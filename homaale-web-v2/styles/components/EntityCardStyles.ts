import {useMediaQuery} from "@mantine/hooks";
import {createStyles} from "@mantine/core";

export const useEntityCardStyles = createStyles((theme) => ({
    root: {

        border:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[7]}`
                : `1px solid rgba(0, 0, 0, 0.08)`,
        paddingBlock: 16,
        borderRadius: 4,
        alignItems: "flex-start",
        cursor: "pointer",
        // maxWidth:"600px",
        // minWidth:"300px",

        gap: "30px",
        background:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : "inherit",

        "&:hover": {
            border: `1px solid ${theme.colors[theme.primaryColor][4]}`,
            // transition: "0.50s ease",
        },
        ".price": {
            fontWeight: 500,
            fontSize: 15

        },

    },
    image: {

        minWidth: 110,
        minHeight: 150,
        maxHeight: 150,
        maxWidth: 130,
        layout: "fill",

        objectFit: "contain",
        position: "relative",
        right: 10,

        top: "",


        // [theme.fn.smallerThan("1000px")]: {
        // minWidth: 900,
        // minHeight: 90,
        // maxHeight:90,
        // maxWidth:90,

        // objectFit:"contain",
        // position: "relative",
        // right:5,
        // top:"100px",

        // },

        [theme.fn.smallerThan("sm")]: {
            minWidth: 200,
            minHeight: 230,

        },

        ".badge": {position: "absolute", top: 5, right: 0, zIndex: 12},
        ".offer": {
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            background:
                "linear-gradient(180deg, rgba(252, 165, 0, 0.9) 0%, rgba(244, 88, 0, 0.81) 145%);",
            fontWeight: 500,
            fontSize: 16,
            transform: "rotate(-46deg)",
            width: 120,
            color: "#ffffff",
            zIndex: 2,
            right: 14,
            top: 17,

            [theme.fn.smallerThan("sm")]: {
                right: 114,
                top: 17,
            },
        },
    },
    title: {
        textTransform: "capitalize",
        fontWeight: 500,
        fontSize: 18,
        whiteSpace: "break-spaces",
        overflow: "hidden",
        // textOverflow: "ellipsis",
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.secondaryColor[0],
    },
    created: {
        display: "flex",
        alignItems: "center",
        marginBlock: 4,
        ".created__full": {
            fontWeight: 500,
            fontSize: 11,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.homaaleSlate[2]
                    : theme.colors.homaaleSlate[7],
            "& span": {
                whiteSpace: "break-spaces",
                // overflow: "hidden",
                // textOverflow: "ellipsis",
            },
        },
        "& p": {
            fontWeight: 400,
            fontSize: 12,
            gap: 4,
            display: "flex",
            alignItems: "center",
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.gray[7],

            "& span": {
                fontWeight: 500,
                fontSize: 12,
            },
        },
    },
    createdByTitle: {
        "&:hover": {
            transition: "0.2s ease all",
            color: theme.colors.brand[4],
        },
    },
    content: {
        marginTop: 16,
        "& p": {
            fontWeight: 400,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[7],
            marginBottom: 8,

            "& svg": {
                color: theme.colors.gray[6],
            },
        },
    },

    bottomSection: {
        borderTop:
            theme.colorScheme === "dark"
                ? `1px solid ${theme.colors.gray[6]}`
                : `1px solid ${theme.colors.gray[2]}`,
        paddingTop: 16,
        marginTop: 16,
        "& p": {
            color:
                theme.colorScheme === "dark"
                ? `${theme.colors.gray[5]}`
                : `${theme.colors.gray[8]}`,
            fontWeight: 400,
            fontSize: 14,
        },
    },
    bottomLeft: {
        gap: 12,
        "& p": {
            fontWeight: 500,
            fontSize: 12,
            padding: "4px 14px",
            borderRadius: 4,
        },
        ".bottomLeft__apply": {
            color: "#22C55E",
            background: "#DCFCE7",
        },
        ".bottomLeft__book": {
            color: "#3EAEFF",
            background: "#ECF7FF",
        },
        ".date__time": {
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
            fontSize: 12,
            gap: 6,
            padding: 0,
            color: theme.colors.homaaleSlate[4],
        },
        ".date__side": {
            color: "#000000",
            fontSize: 12,
            lineHeight: 1,
        },
        ".edit": {

            fontWeight: 200,
            fontSize: 13,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
        },
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        fontWeight: 500,
        fontSize: 8,
        color: theme.colors.homaaleSlate[5],
        ".price": {
            fontWeight: 400,
            fontSize: 14,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
        },
        ".per": {
            fontWeight: 100,
            fontSize: 8,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
        },
        ".edit": {
            fontWeight: 200,
            fontSize: 13,
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.homaaleSlate[8],
        },


    },
}));

