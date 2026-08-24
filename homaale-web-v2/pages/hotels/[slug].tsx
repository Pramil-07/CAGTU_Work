import Layout from "@/components/Layout/Layout";
import HotelDetailPage from "@/components/Stays/EntityStayDetail";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
const Details = () => {
    const router = useRouter();
    const [slug, setSlug] = useState<string | null>(null);
    const [isLoadingSlug, setIsLoadingSlug] = useState(true);

    useEffect(() => {
        if (router.isReady) {
            const { slug } = router.query;
            if (!slug || Array.isArray(slug)) {
                setIsLoadingSlug(false);
                return;
            }
            setSlug(slug);
            setIsLoadingSlug(false);
        }
    }, [router.isReady, router.query]);
    return (
        <Layout
            heading="Hotels Details"
            breadCrumbsItems={[{name:"Hotel",href:"/hotels"}
                ,{ name: `${slug}`, href: `/hotels/${slug}` }
            ]}
        >
            <HotelDetailPage slug={slug} />
        </Layout>
    );
};

export default Details;
