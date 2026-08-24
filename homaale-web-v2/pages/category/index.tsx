


 // --------------------------------------------Dynamic Code------------------------------------


import { Accordion, Box, Flex, Grid, Radio, Text } from "@mantine/core";
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";
import parse from "html-react-parser";
import Link from "next/link";
import React, {useEffect, useState} from "react";

import Layout from "@/components/Layout/Layout";
import urls from "@/constants/urls";
import { useCategoryPageStyles } from "@/styles/pages/CategoryStyles";
import type {NestedCategoryProps} from "@/types/NestedCategoryProps";
import { axiosClient } from "@/utils/axiosClient";
 import router from "next/router";


const CategoryPage = (

) => {

    const { classes, cx } = useCategoryPageStyles();


    const [primaryId, setPrimaryId] = useState<number | null>(null);
    const [secondaryId, setSecondaryId] = useState<number>();
    // const [entityValue, setEntityValue] = useState("tasks");
    const [entityValue, setEntityValue] = useState("explore");
    const [categoryNested, setCategoryNested] = useState<NestedCategoryProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        const fetchCategories = async ()=> {
            try {
                setLoading(true);
                const {data} = await axiosClient.get(urls.category.nested)
                setCategoryNested(data);
            } catch (err) {
                setError("unable to  load categories");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories()
    },[])

    if(error){
        console.log(error)
    }

// card component start


    const nested      = categoryNested?.filter((item:NestedCategoryProps) => item.id === primaryId);
         const has_nested = nested?.some((item) => item.child.length > 0);

    // Handle category selection


    const CategoryNestedCard = ({
                   category,
                   is_nested,
               }: {
                   category: NestedCategoryProps;
                   is_nested?: boolean;
               }) => (
                   <Box

                       className={cx(classes.listCard, {
                           [classes.active]:
                               category?.id === primaryId || category?.id === secondaryId,
                           [classes.isNested]: is_nested,
                       })}
                       onClick={() => {
                           if (category.level === 1) {
                               setSecondaryId(category?.id);
                           } else if (category.level === 0) setPrimaryId(category?.id);
                       }}
                   >   <Flex style={{justifyContent:"space-between", gap:"10px"}}>

                       <Link
                           href={`${entityValue}?category=${category?.slug}&category_name=${category.name}`}
                           >
                           <Flex justify={""} gap={10}

>
                               {!is_nested &&
                                   (category?.icon ? parse(category?.icon) : "")}{" "}
                               {category?.name}
                           </Flex>
                       </Link>

                       {category?.child?.length ? (
                           <Text
                               style={{

                                   transform:
                                       category?.level === 0
                                           ? "rotate(0deg)"
                                           : "rotate(90deg)",
                               }}
                           >
                               <IconChevronRight />
                           </Text>



                                                        ) : (
                                                            ""
                                                        )}
                                                        </Flex>
                   </Box>
               );

    // card component end

  return (
      <Layout heading="Browse Category" currentTitle="category" breadCrumbsItems={[{name: "Tasks & Bookings", href: ""}]} >

                       {/*<Radio.Group*/}
                       {/*    value={entityValue}*/}
                       {/*    onChange={setEntityValue}*/}
                       {/*    display={"flex"}*/}
                       {/*    name="Entity Service"*/}
                       {/*   mb={30}*/}
                       {/* >*/}
                       {/*     <Radio value="tasks" label="I am looking for work" mr={20} />*/}
                       {/*     <Radio value="services" label="I am looking for service" />*/}
                       {/* </Radio.Group>*/}

                        <div className={classes.root}>
                            <Grid>
                                <Grid.Col
                                    md={4}
                                    key={1}
                                    sx={(theme) => ({
                                        [theme.fn.smallerThan("md")]: {
                                            display: has_nested ? "none" : "block",
                                        },
                                    })}
                                >
                                    {categoryNested?.map((item, index) => {
                                        return (
                                            <CategoryNestedCard
                                                category={item}
                                                key={index}
                                            />
                                        );
                                    })}
                                </Grid.Col>

                                {has_nested && (
                                    <Grid.Col md={8}>
                                        <Box className={classes.nested}>
                                            <Text
                                                component="p"
                                                onClick={() => setPrimaryId(null)}
                                            >
                                                <IconChevronLeft /> Back
                                            </Text>
                                            <Grid>
                                                <Grid.Col md={6}>
                                                    {nested?.map((item :NestedCategoryProps) => {
                                                        return item?.child?.map(
                                                            (item, index) => (
                                                                <>
                                                                    <CategoryNestedCard
                                                                        category={item}
                                                                        key={index}
                                                                        is_nested
                                                                    />
                                                                    <Accordion
                                                                        variant="filled"
                                                                        className={
                                                                            classes.accordion
                                                                        }
                                                                        key={index}
                                                                    >
                                                                        <Accordion.Item value="customization">
                                                                            <Accordion.Control
                                                                                chevron={
                                                                                    item
                                                                                        ?.child
                                                                                        ?.length >
                                                                                    0 ? (
                                                                                        <IconChevronDown
                                                                                            size={
                                                                                                20
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        " "
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Link
                                                                                    href={`${entityValue}?category=${item?.slug}&category_name=${item.name}`}
                                                                                >
                                                                                    {
                                                                                        item?.name
                                                                                    }
                                                                                </Link>
                                                                            </Accordion.Control>
                                                                            {item?.child?.map(
                                                                                (
                                                                                    item,
                                                                                    index
                                                                                ) => (
                                                                                    <Accordion.Panel
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        <Link
                                                                                            href={`${entityValue}?category=${item?.slug}&category_name=${item.name}`}
                                                                                        >
                                                                                            {
                                                                                                item?.name
                                                                                            }
                                                                                        </Link>
                                                                                    </Accordion.Panel>
                                                                                )
                                                                            )}
                                                                        </Accordion.Item>
                                                                    </Accordion>
                                                                </>
                                                            )
                                                        );
                                                    })}
                                                </Grid.Col>
                                                <Grid.Col
                                                    md={6}
                                                    sx={(theme) => ({
                                                        [theme.fn.smallerThan("md")]: {
                                                            display: has_nested
                                                                ? "none"
                                                                : "block",
                                                        },
                                                    })}
                                                >
                                                    {nested?.map((item) =>
                                                        item.child
                                                            .filter(
                                                                (item) =>
                                                                    item.id === secondaryId
                                                            )
                                                            .map((item) => {
                                                                return item?.child.map(
                                                                    (item, index) => (
                                                                        <CategoryNestedCard
                                                                            category={item}
                                                                            key={index}
                                                                            is_nested
                                                                        />
                                                                    )
                                                                );
                                                            })
                                                    )}
                                                </Grid.Col>
                                            </Grid>
                                        </Box>
                                    </Grid.Col>
                                )}
                            </Grid>
                        </div>
                    </Layout>
  )
}
export default CategoryPage;
