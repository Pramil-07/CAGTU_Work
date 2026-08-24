import { Box, createStyles, Flex, Text, TextInput, Button } from "@mantine/core";
import { IconChevronDown, IconChevronRight, IconSearch } from "@tabler/icons-react";
import parse from "html-react-parser";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import urls from "@/constants/urls";
import type { NestedCategoryProps } from "@/types/NestedCategoryProps";
import { axiosClient } from "@/utils/axiosClient";
import { useRouter } from "next/router";
import { useDark } from "@/utils/helpers";
import HomaaleLoader from "../common/HomaaleLoader";
import { useMediaQuery } from "@mantine/hooks";

// In-memory cache to store categories
const categoryCache: { data: NestedCategoryProps[] | null } = { data: null };

const useCategoryPageStyles = createStyles((theme) => ({
    navbar: {
        height: "fit-content",
        position: "relative",
        left: "-10px",
        color: theme.colorScheme === "dark"
            ? theme.colors.dark[0]
            : theme.colors.homaaleSlate[6],
    },
    searchContainer: {
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    searchInput: {
        width: "100%",
        maxWidth: "280px",
        position: "relative",
        top: "8px",
        left: "10px",
    },
    closeButton: {
        position: "relative",
        top: "8px",
        left: "10px",
        color: theme.colorScheme === "dark" ? theme.colors.gray[4] : theme.colors.gray[6],
    },
    links: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    listCard: {
        color: theme.colorScheme === "dark"
            ? theme.colors.dark[0]
            : theme.colors.homaaleSlate[6],
        padding: "12px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[1],
        },
    },
    active: {
        fontWeight: 600,
    },
    isNested: {
        paddingLeft: "30px",
    },
    categoryText: {
        fontSize: "16px",
        fontWeight: 500,
        color: theme.colorScheme === "dark"
            ? theme.colors.gray[3]
            : theme.colors.gray[8],
    },
    highlighted: {
        backgroundColor: theme.colorScheme === "dark"
            ? theme.colors.orange[5]
            : theme.colors.orange[0],
        color: theme.colorScheme === "dark"
            ? theme.colors.gray[0]
            : theme.colors.gray[9],
        fontWeight: 600,
        borderRadius: "4px",
        padding: "2px 4px",
    },
    subCategoryContainer: {
        marginTop: "10px",
        paddingLeft: "10px",
        borderLeft: `2px solid ${theme.colors.orange[4]}`,
        position: "relative",
        left: "15px",
    },
    subCategory: {
        padding: "8px 0",
        transition: "color 0.2s ease",
        "&:hover": {
            color: theme.colorScheme === "dark"
                ? theme.colors.orange[6]
                : theme.colors.orange[6],
        },
    },
    subCategoryActive: {
        color: theme.colorScheme === "dark"
            ? theme.colors.orange[3]
            : theme.colors.orange[6],
        fontWeight: 600,
        backgroundColor: theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.orange[0],
        padding: "8px 16px",
        borderRadius: "4px",
    },
    subCategoryText: {
        fontSize: "14px",
        fontWeight: 500,
        color: theme.colorScheme === "dark"
            ? theme.colors.gray[4]
            : theme.colors.gray[7],
    },
    iconWrapper: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "50px",
        height: "50px",
        "& svg": {
            width: "60%",
            height: "60%",
            fill: theme.colorScheme === "dark"
                ? theme.colors.gray[4]
                : theme.colors.gray[0],
        },
    },
}));

export function CategorySidebar({ closeDrawer }: { closeDrawer: () => void }) {
    const { classes, cx } = useCategoryPageStyles();
    const [primaryId, setPrimaryId] = useState<number | null>(null);
    const [secondaryId, setSecondaryId] = useState<number | null>(null);
    const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());
    const [entityValue, setEntityValue] = useState("explore");
    const [categoryNested, setCategoryNested] = useState<NestedCategoryProps[]>(categoryCache.data || []);
    const [filteredCategories, setFilteredCategories] = useState<NestedCategoryProps[]>(categoryCache.data || []);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(!categoryCache.data);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const isDark = useDark();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const is_explore = router.pathname === "/explore";
    const is_product = router.pathname === "/products";
    const is_Mybooking = router.pathname === "/bookings?active_tab=mybookings";
    const is_booking = router.pathname === "/bookings";
    const is_myList = router.pathname === "/myList";
    const is_shop = router.pathname === "/shops";

    useEffect(() => {
        const fetchCategories = async () => {
            if (categoryCache.data) {
                return;
            }
    
            try {
                setLoading(true);
                const { data } = await axiosClient.get(urls.category.nested);
                categoryCache.data = data;
                setCategoryNested(data);
                setFilteredCategories(data);
            } catch (err) {
                setError("Unable to load categories");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        if (!categoryCache.data) {
            fetchCategories();
        }
    
        const cacheClearTimeout = setTimeout(() => {
            categoryCache.data = null;
        }, 3600000);
    
        return () => clearTimeout(cacheClearTimeout);
    }, []);
    const closeAllDropdowns = () => {
        setOpenCategories(new Set());
    };

    useEffect(() => {
        if (is_explore) setEntityValue("explore");
        else if (is_myList) setEntityValue("myList");
        else if (is_booking) setEntityValue("bookings");
        else if (is_product) setEntityValue("products");
        else if (is_Mybooking) setEntityValue("bookings?active_tab=mybookings");
        else if (is_shop) setEntityValue("shops");
    }, [router.pathname, is_explore, is_myList, is_booking, is_product, is_Mybooking, is_shop]);

    useEffect(() => {
           const filterCategories = (categories: NestedCategoryProps[], query: string): NestedCategoryProps[] => {
            const lowerQuery = query.toLowerCase();
            const matchedParentIds: number[] = [];
            const filtered = categories
                .map((category) => {
                 
                 const matches = category.name.toLowerCase().includes(lowerQuery);
                
                    const filteredChildren = category.child ? filterCategories(category.child, query) : [];
                    const hasMatchingChild = filteredChildren.length > 0;
    
                    if (matches || hasMatchingChild) {
                        if (hasMatchingChild) {
                            matchedParentIds.push(category.id); // Track parent of matching child
                        }
                        return { ...category, child: category.child || [] };
                    }
                    return null;
                })
                .filter((category): category is NestedCategoryProps => category !== null);
    
            // Update openCategories without spreading Set
            if (matchedParentIds.length > 0) {
                setOpenCategories((prev) => {
                    const newSet = new Set<number>(prev);
                    matchedParentIds.forEach((id) => newSet.add(id));
                    return newSet;
                });
            }
    
            return filtered;
        };
    
        if (!searchQuery) {
            closeAllDropdowns(); // Close all dropdowns when search query is cleared
            setFilteredCategories(categoryNested); // Reset to all categories
        } else {
            // Apply filtering only if query has more than 2 characters or contains a number
            const hasNumber = /\d/.test(searchQuery);
            if (searchQuery.length > 2 || hasNumber) {
                setFilteredCategories(filterCategories(categoryNested, searchQuery));
            } else {
                setFilteredCategories(categoryNested); // Reset to all categories if condition not met
            }
        }
    }, [searchQuery, categoryNested]);


    const toggleCategory = (categoryId: number) => {
        setOpenCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleCategoryClick = (category: NestedCategoryProps) => {
        if (category.level === 0) {
            if (primaryId !== category.id) {
                setPrimaryId(category.id);
                setSecondaryId(null);
            }
            if (category.child && category.child.length > 0) {
                setOpenCategories((prev) => new Set(prev).add(category.id));
            }
        } else {
            setSecondaryId(category.id);
            if (category.child && category.child.length > 0) {
                setOpenCategories((prev) => new Set(prev).add(category.id));
            } else {
                closeDrawer();
            }
        }
    };

    const CategoryNestedCard = ({
        category,
        is_nested = false,
        searchQuery,
    }: {
        category: NestedCategoryProps;
        is_nested?: boolean;
        searchQuery: string;
    }) => {
        const isMatch = searchQuery && category.name.toLowerCase().includes(searchQuery.toLowerCase());

        return (
            <Box
                className={cx(classes.listCard, {
                    [classes.active]: category?.id === (category.level === 0 ? primaryId : secondaryId),
                    [classes.isNested]: is_nested,
                })}
                onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category);
                }}
            >
                <Flex justify="space-between" align="center">
                    <Link
                        href={is_Mybooking
                            ? `/bookings?active_tab=mybookings&category=${category?.slug}&category_name=${category.name}`
                            : `/${entityValue}?category=${category?.slug}&category_name=${category.name}&category_id=${category.id}`}
                    >
                        <Flex align="center" gap={8}>
                            {!is_nested && (category?.icon ? (
                                <Box className={classes.iconWrapper}>{parse(category?.icon)}</Box>
                            ) : (
                                <IconChevronRight
                                    size={14}
                                    color={isDark ? "#A1A1AA" : "#4B5563"}
                                />
                            ))}
                            <Text
                                className={cx(classes.categoryText, { [classes.highlighted]: isMatch })}
                            >
                                {category?.name}
                            </Text>
                        </Flex>
                    </Link>
                    {category?.child?.length > 0 && (
                        <IconChevronDown
                            size={18}
                            color={isDark ? "#A1A1AA" : "#4B5563"}
                            style={{
                                transform: openCategories.has(category.id) ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s ease",
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(category.id);
                            }}
                        />
                    )}
                </Flex>

                {openCategories.has(category.id) && category.child && (
                    <Box className={classes.subCategoryContainer}>
                        {category.child.map((subCategory) => (
                            <CategoryNestedCard
                                key={subCategory.id}
                                category={subCategory}
                                is_nested={true}
                                searchQuery={searchQuery}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    const links = filteredCategories?.map((item, index) => (
        <CategoryNestedCard
            category={item}
            key={index}
            searchQuery={searchQuery}
        />
    ));

    return (
        <nav className={classes.navbar}>
            <Flex className={classes.searchContainer}>
                <TextInput
                    placeholder="Search categories..."
                    icon={<IconSearch size={20} />}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    className={classes.searchInput}
                />
                <Button
                    onClick={() => closeDrawer()}
                    title="Close"
                    variant="subtle"
                    className={classes.closeButton}
                >
                    X
                </Button>
            </Flex>
            <hr style={{ marginLeft: "10px", width: "100%" }} />
            {loading ? (
                <Text color={isDark ? "gray.4" : "gray.6"} style={{ position: 'relative', marginTop: "300px", marginLeft: isMobile ? "150px" : "200px" }}>
                    <HomaaleLoader />
                </Text>
            ) : error ? (
                <Text color={isDark ? "red.4" : "red.6"}>{error}</Text>
            ) : (
                <Box className={classes.links}>{links}</Box>
            )}
        </nav>
    );
}

export default CategorySidebar;