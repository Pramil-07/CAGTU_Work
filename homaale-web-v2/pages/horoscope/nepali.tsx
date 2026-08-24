import React from "react";

import HoroscopeTabs from "@/components/horoscope/HoroscopeTabs";
import Layout from "@/components/Layout/Layout";

const NepaliHoroscope = () => {
    return (
        <Layout currentTitle="rashifal" heading="Rashifal">
            <HoroscopeTabs is_nepali={true} />
        </Layout>
    );
};

export default NepaliHoroscope;
