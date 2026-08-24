import React, {useEffect, useState} from "react";
import {Skeleton, useMantineTheme, Flex} from "@mantine/core";
import {useDark} from "@/utils/helpers";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import {EntityServiceProps} from "@/types/merchant/EntityServiceProps";
import Image from "next/image";
import router from "next/router";
import { useBrand } from "@/hooks/useBrand";
import { useBrandData } from "@/brand/BrandContext";

interface Service {
    id: string;
    title: string;
    icon: string | null;
}

interface AvailableServicesProps {
    merchantId: string;
}

const AvailableServices: React.FC<AvailableServicesProps> = ({merchantId}) => {
    const [services, setServices] = useState<Service[]>([]);
    const [entityServiceDataState, setEntityServiceDataState] = useState<EntityServiceProps>();
    const [loading, setLoading] = useState(false);
    const theme = useMantineTheme();
    const dark = useDark();
    const brand = useBrand()
    const {brandData}=useBrandData()

    const fetchEntityData = async () => {
        try {
            setLoading(true);
            const {data: fetchedEntityServiceData} = await axiosClient.get(
                `${urls.entity.myService}${merchantId}`
            );

            if (fetchedEntityServiceData) {
                setEntityServiceDataState(fetchedEntityServiceData);
                setServices(
                    fetchedEntityServiceData.result?.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        icon: item.icon,
                    })) || []
                );
            }
            console.error("entity service data:", services);
        } catch (error) {
            console.error("Error fetching entity data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntityData();
    }, [merchantId]);

    const renderSkeletons = () => {
        return Array(4).fill(0).map((_, index) => (
            <div
                key={index}
                className="flex items-center w-full transition-colors relative group"
                style={{
                    padding: "12px",
                    gap: "12px",
                }}
            >
                <Skeleton
                    height={40}
                    width={40}
                    circle
                    style={{
                        backgroundColor: dark ? "#1F2125" : "#E5E7EB",
                    }}
                />
                <Skeleton
                    height={16}
                    width="70%"
                    style={{
                        backgroundColor: dark ? "#1F2125" : "#E5E7EB",
                    }}
                />
            </div>
        ));
    };

    const renderIcon = (iconHtml: string | null) => {
        if (!iconHtml) {
            return (
              
                
                <Image src={brandData.WhiteIcon}
                       height={38}
                       width={38}
                       alt="serviceprovider-image"
                       priority
                       style={{
                           borderRadius: "50%",
                       }}
                />
            );
        }

        const svgMatch = iconHtml.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
        const svgContent = svgMatch ? svgMatch[0] : '';

        const bgMatch = iconHtml.match(/background-color\s*:\s*([^;"]+)/i);
        const backgroundColor = bgMatch ? bgMatch[1] : (dark ? "#1F2125" : "#E5E7EB");

        return (
            <div className="w-10 h-10 flex items-center justify-center rounded-full"
                 style={{
                     background: backgroundColor,
                 }}
            >
                <div dangerouslySetInnerHTML={{__html: svgContent}}
                     style={{
                         width: "15px",
                         height: "15px",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                     }}
                />
            </div>
        );
    };
    return (
        <div className="w-full mx-auto p-6 rounded-lg shadow-md mt-6"
             style={{
                 background: dark ? "#1A1B1E" : "#fff",
                 borderRadius: "10px",
                 border: dark ? "1px solid grey" : "",
             }}
        >
            <div className="flex justify-between mb-6">
                <h2 className="text-xxl font-semibold" style={{color: dark ? "white" : "#1A202C"}}>
                    Available Services
                </h2>
            </div>

            {loading ? (
                <div
                    className="grid gap-6"
                    style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    }}
                >
                    {renderSkeletons()}
                </div>
            ) : services.length === 0 ? (
                <div
                    className="border rounded-lg p-4 flex items-center justify-between"
                    style={{
                        background: dark ? theme.colors.dark[6] : "#fff",
                        borderRadius: "5px",
                    }}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg width="36" height="40" viewBox="0 0 36 40" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M7.375 13.75H28.625C28.9896 13.6979 29.1979 13.4896 29.25 13.125V10.625C29.1979 10.2604 28.9896 10.0521 28.625 10H28C27.9479 8.17708 27.4531 6.5625 26.5156 5.15625C25.526 3.75 24.224 2.70833 22.6094 2.03125L20.5 6.25V1.25C20.4479 0.46875 20.0312 0.0520833 19.25 0H16.75C15.9688 0.0520833 15.5521 0.46875 15.5 1.25V6.25L13.3906 2.03125C11.776 2.70833 10.474 3.75 9.48438 5.15625C8.54688 6.5625 8.05208 8.17708 8 10H7.375C7.01042 10.0521 6.80208 10.2604 6.75 10.625V13.0469C6.80208 13.5156 7.01042 13.75 7.375 13.75ZM18 21.25C16.4896 21.1979 15.1615 20.7292 14.0156 19.8438C12.9219 18.9062 12.2188 17.7083 11.9062 16.25H8.15625C8.52083 18.75 9.58854 20.8333 11.3594 22.5C13.1823 24.1146 15.3958 24.9479 18 25C20.6042 24.9479 22.8177 24.1146 24.6406 22.5C26.4115 20.8333 27.4792 18.75 27.8438 16.25H24.0938C23.7812 17.7083 23.0521 18.9062 21.9062 19.8438C20.8125 20.7292 19.5104 21.1979 18 21.25ZM25.1094 27.5H10.8906C7.97396 27.5521 5.52604 28.5677 3.54688 30.5469C1.56771 32.526 0.552083 34.974 0.5 37.8906C0.604167 39.1927 1.30729 39.8958 2.60938 40H33.3906C34.6927 39.8958 35.3958 39.1927 35.5 37.8906C35.4479 34.974 34.4323 32.526 32.4531 30.5469C30.474 28.5677 28.026 27.5521 25.1094 27.5ZM4.48438 36.25C4.84896 34.7917 5.63021 33.5938 6.82812 32.6562C7.97396 31.7708 9.32812 31.3021 10.8906 31.25H25.1094C26.6719 31.3021 28.026 31.7708 29.1719 32.6562C30.3698 33.5938 31.151 34.7917 31.5156 36.25H4.48438Z"
                                    fill="#868E96"/>
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium" style={{color: dark ? "#E5E7EB" : "#374151"}}>
                                No Services Available
                            </div>
                            <div className="text-sm" style={{color: dark ? "#A1A1AA" : "#6B7280"}}>
                                Add your services to reach out more clients.
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className="grid gap-6"
                    style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    }}
                >
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="flex items-center w-full transition-colors relative group cursor-pointer hover:shadow-2xl ease-in-out duration-300"

                            style={{
                                background: dark ? "#292B2F" : "#F9FAFB",
                                borderRadius: "10px",
                                border: dark ? "1px solid white" : "1px solid #E5E7EB",
                                padding: "12px",
                                gap: "12px",
                            }}
                        >
                            <div className="min-w-12 min-h-12 max-w-12 max-h-12 flex items-center justify-center rounded-lg overflow-hidden">
                                {renderIcon(service.icon)}
                            </div>
                           <span
                            className="line-clamp-2"
                            style={{ color: dark ? "#E5E7EB" : "#374151" }}
                            title={service.title}   // ← This shows full text on hover
                            onClick={() => {
                                router.push(`/services/${service.id}`);
                            }}
                            >
                            {service.title}
                            </span>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableServices;
