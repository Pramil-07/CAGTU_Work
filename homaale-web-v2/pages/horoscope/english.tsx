import React from "react";

import HoroscopeTabs from "@/components/horoscope/HoroscopeTabs";
import Layout from "@/components/Layout/Layout";

const EnglishHoroscope = () => {
    return (
        <Layout currentTitle="horoscope" heading="Horoscope">
            <HoroscopeTabs is_nepali={false} />
        </Layout>
    );
};

export default EnglishHoroscope;
