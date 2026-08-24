
import { createStyles } from '@mantine/styles';
import {useMantineTheme} from "@mantine/core";

export const useCategoryStyles = createStyles((theme) => ({


    container: {
        padding: theme.spacing.xl,
        maxWidth: 1200,
        margin: '0 auto',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[9],
        [theme.fn.smallerThan('sm')]: {
            fontSize: '2rem',
        },
    },
    card: {
        background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
        transition: 'transform 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows.md,
        },
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 150,
        [theme.fn.smallerThan('md')]: {
            height: 120,
        },
        [theme.fn.smallerThan('sm')]: {
            height: 100,
        },
    },
    image: {
        borderRadius: theme.radius.md,
        objectFit: 'cover',
    },
    title: {
        color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.gray[9],
        [theme.fn.smallerThan('sm')]: {
            fontSize: theme.fontSizes.md,
        },
    },
    swiper: {
        paddingBottom: theme.spacing.md,
    },
    textHover: {
    color: theme.colors.gray[0],
        '&:hover': {
            color: theme.colors.red[5],
        },
},
}));