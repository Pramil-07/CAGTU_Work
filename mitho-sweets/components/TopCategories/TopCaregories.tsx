"use client"

import { useCategories } from "@/lib/hooks/useCategory"
import CategoryCard from "@/components/cards/CategoryCard"
import NoDataPage from "@/components/Error/NoDataPage"
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useMantineTheme, Grid } from "@mantine/core"
import { useEffect, useState } from "react"
import apiClient from "@/axiosConfig"

export interface TopCategory {
    id: number
    category: string
    slug?: string
    icon: string
    status: string
    main_category:number
}

const TopCategories = () => {
    const { categories, isLoading } = useCategories()
    const theme = useMantineTheme()
    const [topCategories, setTopCategories] = useState<TopCategory[]>([])

    useEffect(() => {
        const fetchTopCategories = async () => {
            const response = await apiClient.get("product/top-category/list/")
            setTopCategories(response.data.data)
            console.log("topcatgories", response.data)
        }
        fetchTopCategories()
    }, []) // Empty dependency array

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.1,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.1 },
        },
    }

    return (
        <div
            style={{
                paddingTop: "1rem",
                paddingBottom: "1rem",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <motion.h1
                initial={{ opacity: 0, x: 1 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    fontSize: "2.25rem",
                    fontWeight: "700",
                    color: "#1a202c",
                    textAlign: "left",
                    marginBottom: "1rem",
                }}
            >
                <span style={{ color: theme.colors.brand[7] }}>Top </span> Categories
            </motion.h1>

            {isLoading ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "200px",
                        width: "100%",
                    }}
                >
                    <MithoSweetsLoader />
                </div>
            ) : topCategories?.length > 0 ? (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                >
                    <Grid gutter="lg">
                        <AnimatePresence>
                            {topCategories?.slice(0, 7).map((item) => (
                                <Grid.Col key={item.id} span={{ base: 6, sm: 4, md:1.7 }}>
                                    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit">
                                        <CategoryCard
                                            title={item.category}
                                            image={item.icon}
                                            {...item}
                                            style={{
                                                width: "100%",
                                                backgroundColor: "#ffffff",
                                                borderRadius: "8px",
                                                // transition: "transform 0.2s ease-in-out",
                                            }}
                                        />
                                    </motion.div>
                                </Grid.Col>
                            ))}
                        </AnimatePresence>
                    </Grid>
                </motion.div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "200px",
                        width: "100%",
                    }}
                >
                    <NoDataPage msg={"No Top Categories Found"} height={"30vh"} />
                </div>
            )}
        </div>
    )
}

export default TopCategories