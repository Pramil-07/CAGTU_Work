import React, {useState, useEffect} from 'react';
import {
    ActionIcon, Box, Button, Flex, Input, Menu, RangeSlider,
    Title, Text, Drawer, Tooltip
} from "@mantine/core";
import {IconChevronDown, IconChevronUp, IconExternalLink, IconFilter, IconSearch, IconX} from "@tabler/icons-react";
import {Form, Formik} from "formik";
import NumberField from "@/components/common/form/NumberField";
import FormButton from "@/components/common/form/FormButton";
import { useFilterStyles } from "@/styles/components/FilterStyles";
import { useMantineTheme } from "@mantine/core";
import router, {useRouter} from "next/router";
import {useDark} from "@/utils/helpers";
import {useMediaQuery} from "@mantine/hooks";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {setQuery, setSearch} from "@/features/utils/filterSlice";
import { FaSlidersH } from 'react-icons/fa';
import { useBrandData } from '@/brand/BrandContext';

// Constants
const MIN_AMOUNT = 0;
const MAX_AMOUNT = 10000;

// Rating options
const RATING_OPTIONS = [
    {value: '0', label: 'Any Rating'},
    {value: '1', label: '1 & Above'},
    {value: '2', label: '2 & Above'},
    {value: '3', label: '3 & Above'},
    {value: '4', label: '4 & Above'},
    {value: '5', label: '5 Only'}
];

interface Category {
    id: number;
    name: string;
}

interface ProductFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    minPrice: number | null;
    setMinPrice: (value: number | null) => void;
    maxPrice: number | null;
    setMaxPrice: (value: number | null) => void;
    minRating: string | null;
    setMinRating: (value: string | null) => void;
    sortOrder: string | null;
    setSortOrder: (value: string | null) => void;
    categoryId: any;
    categories: Category[];
    categoryName: string | null;
    setCategoryName: (value: string | null) => void;
    handleCategoryClick: any;
    drawerContent: any;
    drawerOpen: any;
    setDrawerOpen: any;
    childCategoryId: any;
    childCategoryName: any;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
                                                         searchTerm,
                                                         setSearchTerm,
                                                         minPrice,
                                                         setMinPrice,
                                                         maxPrice,
                                                         setMaxPrice,
                                                         minRating,
                                                         setMinRating,
                                                         sortOrder,
                                                         setSortOrder,
                                                         categoryId,
                                                         categories,
                                                         categoryName,
                                                         setCategoryName,
                                                         childCategoryId,
                                                         childCategoryName,
                                                         handleCategoryClick,
                                                         drawerContent,
                                                         drawerOpen,
                                                         setDrawerOpen,
                                                     }) => {
    const theme = useMantineTheme();
    const {classes, cx} = useFilterStyles();
    const is_dark = useDark();
    const {query} = useRouter();
    const [budgetFilter, setBudgetFilter] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const filterState = useSelector((state: RootState) => state.filterReducer);
    const {brandData}= useBrandData();
    // const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    useEffect(() => {
        if (router.query.name) {
            setSearchTerm(router.query.name as string);
            dispatch(setSearch(router.query.name as string))
            dispatch(setQuery({key: "searchType", value: "products"}))

        } else if (filterState.search) {
            const term = filterState.search.replace(/(&name=|&search=)/, "");
            setSearchTerm(term);
        }
    }, [router.query.name, filterState.search, setSearchTerm, dispatch]);

    const [ratingMenuOpen, setRatingMenuOpen] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        dispatch(setSearch(value))
    };

    // const category_id = router.query;
    const handlePriceRangeSubmit = (values: { from: number, to: number }) => {
        setMinPrice(values.from);
        setMaxPrice(values.to);
        setBudgetFilter(false);
    };

    const clearPriceFilter = () => {
        setMinPrice(null);
        setMaxPrice(null);
    };

    const handleSortDate = (direction: string) => {
        setSortOrder(direction === "asc" ? "date_asc" : "date_desc");
    };

    const handleSortPrice = (direction: string) => {
        setSortOrder(direction === "asc" ? "price_asc" : "price_desc");
    };

    const clearSort = () => {
        setSortOrder(null);
    };

    const clearCategoryFilter = () => {
        categoryId(null);
    };

    const clearRatingFilter = () => {
        setMinRating(null);
    };

    const handleSelectCategory = (id: string, name: string) => {
        categoryId(id);
        setCategoryName(name);
        setCategoryMenuOpen(false);
    };
    // const handleCategoryClick=()=>{
    //     setDrawerOpen(true)
    // }
    const closeDrawer = () => setDrawerOpen(false);

    const handleSelectRating = (value: string) => {
        setMinRating(value);
        setRatingMenuOpen(false);
    };

    // Create marks for the slider
    const marks = [
        {value: 0, label: '$0'},
        {value: Math.log10(100), label: '$100'},
        {value: Math.log10(1000), label: '$1,000'},
        {value: Math.log10(10000), label: '$10,000'}
    ];

    const [showFilters, setShowFilters] = useState(true);
    const smallScreen = useMediaQuery("(max-width: 991px)");
    useEffect(() => {
        if (!smallScreen) {
            setShowFilters(true);
        }
        else {
            setShowFilters(false);
        }
    }, [smallScreen]);
    return (
        <Flex
            justify={"flex-start"}
            align={"center"}
            wrap={"wrap"}
            gap={"sm"}
            w={"100%"}
            className={classes.root}
        >
            <Drawer
                opened={drawerOpen}
                onClose={closeDrawer}
                position="right"

                size="l"
                zIndex={1000}
                withCloseButton={false}
                styles={{
                    content: {
                        backgroundColor: is_dark ? theme.colors.dark[7]
                            : theme.colors.homaaleSlate[0],
                    },
                    overlay: {
                        backgroundColor: '',
                    },
                }}
            >
                {/* <h1>Category SideBar</h1> */}
                {drawerContent}
            </Drawer>
            <Input
                icon={<IconSearch size={18}/>}
                placeholder="Search products..."
                className={classes.input}
                radius={brandData.radius}
                value={searchTerm}
                onChange={handleSearchChange}
                miw={smallScreen ? 250 : 200}
                w={"15%"}
            />
            {smallScreen && (
                <Tooltip label={showFilters ? "Hide Filters" : "Show Filters"} withArrow>
                    <Button
                        // size="md"
                        radius="xl"
                        variant={showFilters ? "filled" : "outline"}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <IconFilter size={16}/>
                    </Button>
                </Tooltip>
            )}
            {showFilters && (
                <>
                    {/*<Box style={{position: "relative"}}>*/}
                    {/*    <Button*/}
                    {/*        radius={20}*/}
                    {/*        variant={sortOrder === "date_desc" || sortOrder === "date_asc" ? "filled" : "default"}*/}
                    {/*        onClick={() => handleSortDate(sortOrder === "date_asc" ? "desc" : "asc")}*/}
                    {/*        style={{*/}
                    {/*            color:*/}
                    {/*                theme.colorScheme === 'dark'*/}
                    {/*                    ? theme.colors.dark[2]*/}
                    {/*                    : theme.colors.gray[6],*/}
                    {/*        }}*/}
                    {/*        rightIcon={*/}
                    {/*            sortOrder === "date_desc"*/}
                    {/*                ? <IconChevronDown size={16}/>*/}
                    {/*                : <IconChevronUp size={16}/>*/}
                    {/*        }*/}
                    {/*        pr={sortOrder === "date_desc" || sortOrder === "date_asc" ? 35 : undefined}*/}
                    {/*    >*/}
                    {/*        Sort Date*/}
                    {/*    </Button>*/}
                    {/*    {(sortOrder === "date_desc" || sortOrder === "date_asc") && (*/}
                    {/*        <ActionIcon*/}
                    {/*            size={20}*/}
                    {/*            variant={"transparent"}*/}
                    {/*            className={classes.crossBtn}*/}
                    {/*            onClick={clearSort}*/}
                    {/*            style={{right: "5px"}}*/}
                    {/*        >*/}
                    {/*            <IconX size={14}/>*/}
                    {/*        </ActionIcon>*/}
                    {/*    )}*/}
                    {/*</Box>*/}

                    <Box style={{position: "relative"}}>
                        <Button
                            radius={brandData.radius}
                            variant={sortOrder === "price_desc" || sortOrder === "price_asc" ? "filled" : "default"}
                            onClick={() => handleSortPrice(sortOrder === "price_asc" ? "desc" : "asc")}
                            style={{
                                color:
                                    theme.colorScheme === 'dark'
                                        ? theme.colors.dark[2]
                                        : theme.colors.gray[6],
                            }}
                            rightIcon={
                                sortOrder === "price_desc"
                                    ? <IconChevronDown size={16}/>
                                    : <IconChevronUp size={16}/>
                            }
                            pr={sortOrder === "price_desc" || sortOrder === "price_asc" ? 35 : undefined}
                        >
                            Sort Price
                        </Button>
                        {(sortOrder === "price_desc" || sortOrder === "price_asc") && (
                            <ActionIcon
                                size={20}
                                variant={"transparent"}
                                className={classes.crossBtn}
                                onClick={clearSort}
                            >
                                <IconX size={14}/>
                            </ActionIcon>
                        )}
                    </Box>

                    <Menu
                        withArrow
                        position="bottom"
                        transitionProps={{transition: "pop"}}
                        id="price-filter-menu"
                        opened={budgetFilter}
                        onChange={setBudgetFilter}
                    >
                        <Box style={{position: "relative"}}>
                            <Menu.Target>
                                <Button
                                    radius={brandData.radius}
                                    variant={minPrice !== null || maxPrice !== null ? "filled" : "default"}
                                    className={cx(classes.root, {
                                        [classes.activeSort]: minPrice !== null || maxPrice !== null,
                                    })}
                                    w={"100%"}
                                    onClick={() => setBudgetFilter(true)}
                                >
                                    Filter Price
                                </Button>
                            </Menu.Target>
                            {(minPrice !== null || maxPrice !== null) && (
                                <ActionIcon
                                    size={20}
                                    variant={"transparent"}
                                    className={classes.crossBtn}
                                    onClick={clearPriceFilter}
                                >
                                    <IconX size={14}/>
                                </ActionIcon>
                            )}
                        </Box>
                        <Menu.Dropdown p={24}>
                            <Title
                                order={3}
                                size={20}
                                fw={500}
                                color={
                                    theme.colorScheme === "dark"
                                        ? theme.colors.gray[3]
                                        : theme.colors.gray[8]
                                }
                            >
                                Filter Price Range
                            </Title>
                            <Formik
                                initialValues={{
                                    from: minPrice !== null ? minPrice : MIN_AMOUNT,
                                    to: maxPrice !== null ? maxPrice : MAX_AMOUNT,
                                }}
                                onSubmit={handlePriceRangeSubmit}
                            >
                                {({errors, touched, setFieldValue, values}) => (
                                    <Form>
                                        <Flex
                                            justify={"flex-start"}
                                            gap={4}
                                            align={"flex-end"}
                                        >
                                            <Text component="p">$
                                                {MIN_AMOUNT}
                                            </Text>
                                            <RangeSlider
                                                thumbSize={14}
                                                marks={marks}
                                                label={(value) => `$${Math.round(10 ** value)}`}
                                                sx={{
                                                    ".mantine-Slider-label": {
                                                        background: "transparent",
                                                        top: 10,
                                                    },
                                                }}
                                                w={"100%"}
                                                mt="xl"
                                                min={0}
                                                max={Math.log10(MAX_AMOUNT)}
                                                minRange={0.001}
                                                value={[
                                                    Math.log10(values.from || MIN_AMOUNT),
                                                    Math.log10(values.to || MAX_AMOUNT),
                                                ]}
                                                onChange={(e) => {
                                                    setFieldValue(
                                                        "from",
                                                        Math.round(10 ** e[0])
                                                    );
                                                    setFieldValue("to", Math.round(10 ** e[1]));
                                                }}
                                            />
                                            <Text component="p">
                                                ${MAX_AMOUNT.toLocaleString()}
                                            </Text>
                                        </Flex>
                                        <Flex
                                            justify={"flex-start"}
                                            align={"flex-start"}
                                            direction={{
                                                base: "column",
                                                sm: "row",
                                            }}
                                            gap={{base: 0, sm: 12}}
                                            mt={40}
                                        >
                                            <NumberField
                                                id="from"
                                                name={"from"}
                                                maw={220}
                                                placeholder="From"
                                                touch={touched.from}
                                                error={errors.from}
                                                minimum={MIN_AMOUNT}
                                                maximum={MAX_AMOUNT}
                                                withAsterisk
                                            />
                                            <NumberField
                                                id="to"
                                                name={"to"}
                                                maw={220}
                                                placeholder="To"
                                                touch={touched.to}
                                                error={errors.to}
                                                minimum={values.from}
                                                maximum={MAX_AMOUNT}
                                                withAsterisk
                                            />
                                        </Flex>
                                        <Flex justify={"center"} gap={12} mt={20}>
                                            <Button
                                                variant="outline"
                                                onClick={() => setBudgetFilter(false)}
                                            >
                                                Cancel
                                            </Button>

                                            <FormButton
                                                name={"Apply"}
                                                id={"apply-btn"}
                                                type="submit"
                                            />
                                        </Flex>
                                    </Form>
                                )}
                            </Formik>
                        </Menu.Dropdown>
                    </Menu>
                </>
            )}

            {/* Category Menu */}
            {/*<Menu*/}
            {/*    withArrow*/}
            {/*    position="bottom"*/}
            {/*    transitionProps={{ transition: "pop" }}*/}
            {/*    id="category-menu"*/}
            {/*    opened={categoryMenuOpen}*/}
            {/*    onChange={setCategoryMenuOpen}*/}
            {/*>*/}
            {/*    <Box style={{ position: "relative" }}>*/}
            {/*        <Menu.Target>*/}
            {/*            <Button*/}
            {/*                radius={20}*/}
            {/*                variant={categoryId ? "filled" : "default"}*/}
            {/*                className={cx(classes.root, {*/}
            {/*                    [classes.activeSort]: categoryId,*/}
            {/*                })}*/}
            {/*                w={"100%"}*/}
            {/*                onClick={() => setCategoryMenuOpen(true)}*/}
            {/*                rightIcon={<IconChevronDown size={16} />}*/}
            {/*            >*/}
            {/*                {categoryName ? `Category: ${categoryName}` : "Select Category"}*/}
            {/*            </Button>*/}
            {/*        </Menu.Target>*/}
            {/*        {categoryId && (*/}
            {/*            <ActionIcon*/}
            {/*                size={20}*/}
            {/*                variant={"transparent"}*/}
            {/*                className={classes.crossBtn}*/}
            {/*                onClick={clearCategoryFilter}*/}
            {/*            >*/}
            {/*                <IconX size={14} />*/}
            {/*            </ActionIcon>*/}
            {/*        )}*/}
            {/*    </Box>*/}
            {/*    <Menu.Dropdown p={12} style={{ maxHeight: '300px', overflowY: 'auto' }}>*/}
            {/*        <Title*/}
            {/*            order={3}*/}
            {/*            size={16}*/}
            {/*            fw={500}*/}
            {/*            mb={12}*/}
            {/*            color={*/}
            {/*                theme.colorScheme === "dark"*/}
            {/*                    ? theme.colors.gray[3]*/}
            {/*                    : theme.colors.gray[8]*/}
            {/*            }*/}
            {/*        >*/}
            {/*            Select Category*/}
            {/*        </Title>*/}
            {/*        {categories.length > 0 ? (*/}
            {/*            categories.map((cat) => (*/}
            {/*                <Menu.Item*/}
            {/*                    key={cat.id}*/}
            {/*                    onClick={() => handleSelectCategory(cat.id.toString(), cat.name)}*/}
            {/*                    style={{*/}
            {/*                        backgroundColor: categoryId === cat.id.toString() ?*/}
            {/*                            (theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]) :*/}
            {/*                            'transparent'*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    {cat.name}*/}
            {/*                </Menu.Item>*/}
            {/*            ))*/}
            {/*        ) : (*/}
            {/*            <Menu.Item disabled>No categories available</Menu.Item>*/}
            {/*        )}*/}
            {/*    </Menu.Dropdown>*/}
            {/*</Menu>*/}
            {showFilters && (
            <Box style={{ position: "relative" }}>
                <Button
                    radius={brandData.radius}
                    variant={query?.category ? "filled" : "default"}
                    className={cx(classes.root, {
                        [classes.activeSort]: query?.category_id || childCategoryId,
                    })}
                    onClick={handleCategoryClick}
                    w={"100%"}
                >
                    {/* Show childCategoryName if present, otherwise category_name, or default text */}
                    {childCategoryId
                        ? childCategoryName
                        : query?.category_name
                            ? query?.category_name
                            : 'Select Category'}{' '}
                    <IconExternalLink size={16} style={{ margin: '0 10px 0 5px' }} />
                </Button>
                {(categoryId || childCategoryId) && (
                    <ActionIcon
                        size={20}
                        variant={"transparent"}
                        className={classes.crossBtn}
                        onClick={() => router.replace(router.pathname)}
                    >
                        <IconX size={14} />
                    </ActionIcon>
                )}
            </Box>
            )}
            {/* Rating Menu */}
            {showFilters && (
                <Menu
                    withArrow
                    position="bottom"
                    transitionProps={{transition: "pop"}}
                    id="rating-menu"
                    opened={ratingMenuOpen}
                    onChange={setRatingMenuOpen}
                >
                    <Box style={{position: "relative"}}>
                        <Menu.Target>
                            <Button
                                radius={brandData.radius}
                                variant={minRating !== null && minRating !== '0' ? "filled" : "default"}
                                className={cx(classes.root, {
                                    [classes.activeSort]: minRating !== null && minRating !== '0',
                                })}
                                w={"100%"}
                                onClick={() => setRatingMenuOpen(true)}
                                rightIcon={<IconChevronDown size={16}/>}
                            >
                                {minRating && minRating !== '0' ?
                                    `Rating: ${minRating}${minRating === '5' ? '★ Only' : '★ & Above'}` :
                                    "Filter Rating"}
                            </Button>
                        </Menu.Target>
                        {minRating !== null && minRating !== '0' && (
                            <ActionIcon
                                size={20}
                                variant={"transparent"}
                                className={classes.crossBtn}
                                onClick={clearRatingFilter}
                            >
                                <IconX size={14}/>
                            </ActionIcon>
                        )}
                    </Box>
                    <Menu.Dropdown p={12}>
                        <Title
                            order={3}
                            size={16}
                            fw={500}
                            mb={12}
                            color={
                                theme.colorScheme === "dark"
                                    ? theme.colors.gray[3]
                                    : theme.colors.gray[8]
                            }
                        >
                            Select Minimum Rating
                        </Title>
                        {RATING_OPTIONS.map((option) => (
                            <Menu.Item
                                key={option.value}
                                onClick={() => handleSelectRating(option.value)}
                                style={{
                                    backgroundColor: minRating === option.value ?
                                        (theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]) :
                                        'transparent'
                                }}
                            >
                                {option.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            )}
        </Flex>
    );
};

export default ProductFilter;
