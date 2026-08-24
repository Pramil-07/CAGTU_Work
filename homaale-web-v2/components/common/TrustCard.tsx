import { Box, createStyles, Image } from "@mantine/core";
const useTrustCard = createStyles((theme) => ({
    mainCard: {
        "& h4": {
            color:
                theme.colorScheme === "dark"
                    ? theme.colors.gray[7]
                    : theme.colors.homaaleSlate[8],
        },
        padding: "24px 32px 32px",
        borderRadius: 16,
        "& p": {
            font: "400 14px/24px inter",
        },
    },
    image: {
        marginBottom: 16,
    },
}));

export type TrustCardProps = {
    title: string;
    image: string;
    description: string;
    color: string;
};

export const TrustCard = ({
    title,
    image,
    description,
    color,
}: TrustCardProps) => {
    const { classes } = useTrustCard();
    return (
        <Box className={classes.mainCard} sx={{ background: color }}>
            <Image
                className={classes.image}
                src={image}
                height={55}
                width={43}
                alt="Norway"
            />
            <h4 className="m-0">{title}</h4>
            <p className="mt-4">{description}</p>
        </Box>
    );
};
