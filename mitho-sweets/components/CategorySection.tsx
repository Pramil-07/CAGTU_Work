
import { Title, Container } from '@mantine/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/autoplay';
import {useCategoryStyles} from "@/styles/CategoryStyles";
import dummyCategories from "@/styles/dummyCategories.json"
import CategoryCard from "@/components/cards/CategoryCard";
// import snacks from "@/images/offer1.png";
// import sweets from "@/images/offer2.png";
// import savoury from "@/images/offer3.png";

// Define interface for category data
interface Category {
    title: string;
    image: string;
    description:string
}



// Define props for CategorySection
interface CategorySectionProps {
    categories: Category[];
}

// Main CategorySection component
const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
    const { classes } = useCategoryStyles();

    // const offer = [
    //     {
    //         title: "SNACKS",
    //         description:
    //             "Crunchy, light, and tasty — our snacks are perfect for any time of the day. Made with care and full of flavor.",
    //         image: snacks,
    //     },
    //     {
    //         title: "SWEETS",
    //         description:
    //             "Indulge in traditional and modern sweets made with love and premium ingredients. A perfect treat for every sweet tooth.",
    //         image: sweets,
    //     },
    //     {
    //         title: "SAVOURY",
    //         description:
    //             "From spicy bites to cheesy delights, our savoury collection is sure to satisfy your cravings with every bite.",
    //         image: savoury,
    //     },
    // ];

    return (
        <Container className={classes.container} size="lg" py="xl">
            <Title className={classes.sectionTitle} order={2} ta="center" mb="xl">
                Browse Categories
            </Title>
            <Swiper
                modules={[Autoplay]}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                loop={true}
                spaceBetween={20}
                slidesPerView={4}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                    },
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 15,
                    },
                    900: {
                        slidesPerView: 3,
                        spaceBetween: 20,
                    },
                    1200: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                    },
                }}
                className={classes.swiper}
            >
                {categories?.map((category, index) => (
                    <SwiperSlide key={index}>
                        <CategoryCard
                            title={category.title}
                            image={category.image} id={0}                        />
                    </SwiperSlide>
                ))}
            </Swiper>++
        </Container>
    );
};

// getStaticProps for fetching category data
export async function getStaticProps() {
    try {
        // Attempt to fetch from API
        const res = await fetch('https://api.example.com/categories');
        if (!res.ok) throw new Error('API fetch failed');
        const categories: Category[] = await res.json();

        return {
            props: {
                categories
            },
            revalidate: 3600 // Revalidate every hour
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to dummy data

        return {
            props: {
                categories: dummyCategories
            },
            revalidate: 3600
        };
    }
}

export default CategorySection;