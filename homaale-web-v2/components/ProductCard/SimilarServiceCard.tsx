import React, { useEffect, useState } from "react";
import { Skeleton, Grid } from "@mantine/core";
import { axiosClient } from "@/utils/axiosClient";
import { ServiceCard } from "@/components/cards/ServiceCard";
// import { NoDataAlert } from "@/components/common/NoDataAlert";
import type { EntityServiceLisitngProps } from "@/types/EntityServiceLisitngProps";

interface SimilarServicesProps {
    productId: string | string[] | undefined;
}

const SimilarService: React.FC<SimilarServicesProps> = ({ productId }) => {
    const [loading, setLoading] = useState(true);
    const [similarServices, setSimilarServices] = useState<EntityServiceLisitngProps["result"]>([]);

    useEffect(() => {
        const fetchSimilarServices = async () => {
            if (!productId) {
                setLoading(false);
                return;
            }

            try {
                const response = await axiosClient.get(`/product/entity/similar/${productId}`);
                setSimilarServices(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching similar services:', error);
                setLoading(false);
            }
        };

        fetchSimilarServices();
    }, [productId]);

    // Debug logs
    console.log('similar services:', similarServices);
    console.log('similar services is loading:', loading);
    console.log('similar services id:', productId);

    // if (!loading && (!similarServices || similarServices.length === 0)) {
    //     return (
    //         <section className="py-8">
    //             <h2 className="text-lg mb-6">Similar Services</h2>
    //             {/*<NoDataAlert />*/}
    //         </section>
    //     );
    // }

    return (
        <section className="py-8">
            {loading ? (
                <>
                    <h2 className="text-lg mb-6">Similar Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(3).fill(0).map((_, index) => (
                        <div className="w-[250px]" key={`skeleton-${index}`}>
                            <div className="border-round border-1 surface-border p-4 surface-card">
                                <Skeleton height="200px" width="100%" />
                                <div className="flex justify-content-between mt-3 mb-3">
                                    <Skeleton width="70%" height="1rem" />
                                </div>
                                <Skeleton width="40%" height="1.5rem" />
                                <div className="flex justify-content-between mt-3 gap-2">
                                    <Skeleton width="30%" height="2rem" />
                                    <Skeleton width="30%" height="2rem" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            ) : (
                <>
                {similarServices?.length > 0 && (
                        <h2 className="text-lg mb-6 text-semibold">Similar Services</h2>
                    )}
                {/*// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6">*/}
                <Grid gutter={5} mt={16}>
                    {similarServices?.map((item) => (
                        <Grid.Col
                            span={12}
                            md={6}
                            lg={6}
                            xl={4}
                            key={item?.id}
                        >
                        <ServiceCard key={item?.id} service={item} />
                        </Grid.Col>
                    ))}
                </Grid>
                {/*// </div>*/}
                </>
            )}
        </section>
    );
};

export default SimilarService;
