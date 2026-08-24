import { Box, Grid } from "@mantine/core";
import { format } from "date-fns";
import React from "react";

import { useGetHoroscope } from "@/hooks/useGetHoroscope";
import { getHoroscopeName, getNepaliDate } from "@/utils/helpers";

import Empty from "../common/Empty";
import HoroscopeCard from "./HoroscopeCard";

const HoroscopeType = ({
    type,
    is_nepali,
}: {
    type: number;
    is_nepali: boolean;
}) => {
    const { data } = useGetHoroscope(type, is_nepali);

    return (
        <>
            <Box mb={16}>
                {data && data.length > 0
                    ? `${
                          data[0]?.start_date
                              ? `${
                                    is_nepali
                                        ? getNepaliDate(
                                              new Date(data[0]?.start_date)
                                          )
                                        : format(
                                              new Date(data[0]?.start_date),
                                              "dd MMM yyy"
                                          )
                                } - `
                              : ""
                      }${
                          is_nepali
                              ? getNepaliDate(new Date(data[0]?.end_date))
                              : format(
                                    new Date(data[0]?.end_date),
                                    "dd MMM yyy"
                                )
                      }`
                    : ""}
            </Box>
            <Grid gutter={30}>
                {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <Grid.Col md={6} key={index}>
                            <HoroscopeCard
                                title={getHoroscopeName(index, is_nepali)}
                                desc={item.description}
                                icon={`/horoscope/${index}.png`}
                            />
                        </Grid.Col>
                    ))
                ) : (
                    <Empty
                        title="No data Found"
                        description="No horoscope data found."
                    />
                )}
            </Grid>
        </>
    );
};

export default HoroscopeType;
