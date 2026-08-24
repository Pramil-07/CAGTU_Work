import { Box } from "@mantine/core";
import parse from "html-react-parser";
import { useRouter } from "next/router";
import React from "react";

import { useCategoryStyles } from "@/styles/components/CategoryStyles";
import type { TopCategoryProps } from "@/types/TopCategoryProps";

export const CategoryCard = ({
    data,
}: {
    data: TopCategoryProps["result"][0];
}) => {
    const { classes } = useCategoryStyles();
    // console.log(data);

    const router = useRouter();
    return (
        <Box
            className={`${classes.root} category__card`}
            onClick={() =>
                router.push(
                    `/explore?category=${data?.slug}&category_name=${data?.category}&category_id=${data?.main_id}`
                )
            }
        >
            <figure>

                {data?.icon
                    ? parse(data?.icon)
                    : parse(
                          `<svg width="464" height="464" viewBox="0 0 464 464" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M144 0C170.5 0 192 21.49 192 48V144C192 170.5 170.5 192 144 192H48C21.49 192 0 170.5 0 144V48C0 21.49 21.49 0 48 0H144ZM144 48H48V144H144V48ZM144 256C170.5 256 192 277.5 192 304V400C192 426.5 170.5 448 144 448H48C21.49 448 0 426.5 0 400V304C0 277.5 21.49 256 48 256H144ZM144 304H48V400H144V304ZM256 48C256 21.49 277.5 0 304 0H400C426.5 0 448 21.49 448 48V144C448 170.5 426.5 192 400 192H304C277.5 192 256 170.5 256 144V48ZM304 144H400V48H304V144ZM352 240C365.3 240 376 250.7 376 264V328H440C453.3 328 464 338.7 464 352C464 365.3 453.3 376 440 376H376V440C376 453.3 365.3 464 352 464C338.7 464 328 453.3 328 440V376H264C250.7 376 240 365.3 240 352C240 338.7 250.7 328 264 328H328V264C328 250.7 338.7 240 352 240Z" fill="white"/>
                                  </svg>`
                      )}
            </figure>
            <h4> {data?.category}</h4>

        </Box>
    );
};
