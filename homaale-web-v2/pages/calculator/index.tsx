"use client"

import Layout from "@/components/Layout/Layout"
import Calculator from "@/components/calculator";

export default function page() {
    return (
        <Layout currentTitle="Calculator" description="Calculator" hideBreadCrumbs>
            <Calculator />
        </Layout>
    )
}
