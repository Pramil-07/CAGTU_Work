import Link from 'next/link';
import { Text } from '@mantine/core';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {IconCake} from "@tabler/icons-react";

// Define the CategoryCardProps interface
interface CategoryCardProps {
    title: string;
    image: string; // This will be the SVG string
    id:number;
    style?: React.CSSProperties; // Define style as optional CSSProperties
    main_category?:number;
}

// Component for individual category card
const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, style,id,main_category }) => {
    // Animation variants for the card, typed as Variants
    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
        hover: {
            scale: 1.05,
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            transition: {
                duration: 0.2,
                ease: 'easeOut',
            },
        },
    };

    return (
        <Link href={`/shop?category=${title.toLowerCase().replace(/\s+/g, '-')}&id=${main_category}`} passHref>
            <motion.div
                className="group"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                style={{
                    textDecoration: 'none',
                    width: '100%',
                    minWidth:"150px",
                    maxWidth: '150px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border:"1px solid lightgray",
                    backgroundColor: 'transparent',
                    // boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    ...style, // Merge passed styles from parent
                }}
            >
                <div
                    style={{

                        position: 'relative',
                        width: '100%',
                        height: '100px',
                        display: 'flex',
                        borderRadius:"20%",
                        justifyContent: 'center',
                        alignItems: 'center',
                        // border:"1px solid lightgray",
                        backgroundColor: '',
                    }}
                >
                    {/* Render the SVG string using dangerouslySetInnerHTML */}

                    <div
                        style={{
                            marginTop:"20px",
                            width: '40%',
                            height: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}

                        dangerouslySetInnerHTML={{ __html: image }}


                    />

                </div>
                <div>


                <Text
                        className="group-hover:text-red-600"
                    style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                       // color: '#1a202c',
                        textAlign: 'center',
                        padding: '1rem',
                        '@media (maxWidth: 768px)': {
                            fontSize: '1rem',
                        },
                    }}
                >
                 <span  > {title}</span>
                </Text>
                </div>
            </motion.div>
        </Link>
    );
};

export default CategoryCard;