import React, { useEffect, useState, useRef } from "react";
import {
    Text,
    Group,
    Title,
    useMantineTheme,
    Button,
    Modal,
    FileInput,
    Alert,
    Tooltip
} from "@mantine/core";
import {FaDownload, FaExclamationTriangle} from "react-icons/fa";
import {useDark} from "@/utils/helpers";
import {axiosClient} from "@/utils/axiosClient";
import ProductCard, { Product } from "@/components/ProductCard/ProductCard";
import {useUserStatus} from "@/hooks/useUserStatus";
import {useRouter} from "next/router";
import {FiPlus} from "react-icons/fi";
import {GrAnalytics} from "react-icons/gr";
import ProductAnalytics from "@/components/merchant/ProfilePage/ProductAnalytics";
import {UploadIcon, X} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import {notifications} from "@mantine/notifications";
import {useProfile} from "@/hooks/useProfile";
import {useMediaQuery} from "@mantine/hooks";
import {CmsProps} from "@/pages/products";

interface ProductProps {
    id: number;
    title: string;
    image?: string;
    rating: string;
    reviews: string;
    price: string;
    name: string;
    description: string;
    product_status: string;
    slug: string;
    onAddToBox?: () => void;
}

const ProductList = ({ id, hasPermission }: { id: string; hasPermission: boolean }) => {
    const theme = useMantineTheme();
    const dark = useDark();
    const [productData, setProductData] = useState<Product[]>([]);
    const [viewAll, setViewAll] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const dropRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const {checkStatus} = useUserStatus();
    const router = useRouter();
    const [showAnalytics, setShowAnalytics] = useState(false);
    const user = useUser()
    const {data: profileData} = useProfile();
    const merchantId = profileData?.user?.id;
    const verifyMerchant =  profileData?.merchant_data?.[0]?.is_premium;
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [canCreateProduct, setCanCreateProduct] = useState<boolean>(false);
    const [maxProducts, setMaxProducts] = useState<number>(0);
    const [currentProductCount, setCurrentProductCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [merchantData , setMerchantData] = useState(undefined);

    const myMerchant= user.data?.id===id
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get(myMerchant?"product/user-product/":`product/search/?user_id=${id}`);
                setProductData(response.data.results);
                // console.log("Product data:", response.data.results);
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                const response = await axiosClient.get(`/merchant/${id}/`);
                // setProfile(response.data);
                setMerchantData(response.data.merchant_data.id);
                // console.log("merchant data",response.data)
                setIsPremium(response.data.merchant_data.is_premium );
                // console.log("merchant data",response.data.merchant_data.is_premium)
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsPremium(false); // Default to false on error
            }
        };
        fetchApiData();
    }, [id]);

    useEffect(() => {
        const fetchCmsLimit = async () => {
            if (!verifyMerchant) {
                setCanCreateProduct(false);
                setMaxProducts(0);
                setCurrentProductCount(0);
                return;
            }
            setLoading(true);
            try {
                // Fetch user products to get count
                const userProductsResponse = await axiosClient.get('/product/user-product/?page=1');
                const productCount = userProductsResponse.data.count ?? 0;
                // setCurrentProductCount(productCount);

                // Fetch CMS limits
                const cmsResponse = await axiosClient.get<CmsProps>("/merchant/cms-merchant-limits/");
                if (!cmsResponse.data.result || !Array.isArray(cmsResponse.data.result)) {
                    throw new Error("Invalid CMS response: result is missing or not an array");
                }

                // Select CMS data based on is_premium
                const cmsData = cmsResponse.data.result.find((item) => item.is_premium === isPremium);
                if (!cmsData) {
                    throw new Error(`No CMS data found for ${isPremium ? "premium" : "non-premium"} merchant`);
                }
                setMaxProducts(cmsData.max_products);
                console.log("max products ",cmsData.max_products);
                
                // Determine if user can create more products
                const canCreate = productCount < cmsData.max_products;
                setCanCreateProduct(canCreate);

                // Show notification based on remaining product limit
                const remainingProducts = cmsData.max_products - productCount;
                // if (!canCreate) {
                //     notifications.show({
                //         title: "Product Creation Limit Reached",
                //         message: `You have reached the maximum product limit (${cmsData.max_products}). ${
                //             isPremium ? "Contact support at Hommale Team." : "Upgrade to premium to create more products."
                //         }`,
                //         color: "orange",
                //     });
                // } else {
                //     notifications.show({
                //         title: "Product Creation Available",
                //         message: `You can create ${remainingProducts} more product${remainingProducts === 1 ? "" : "s"} as a ${
                //             isPremium ? "premium" : "free"
                //         } user.`,
                //         color: "green",
                //     });
                // }
            } catch (error) {
                console.error("CMS limit error:", error);
                setMaxProducts(0);
                setCurrentProductCount(0);
                setCanCreateProduct(false);
                // notifications.show({`    
                //     title: "Error",
                //     message: "Failed to fetch product limits. Contact support at Hommale Team.",
                //     color: "red",
                //     style: {
                //         position: 'fixed',
                //         top: '60px', 
                //         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                //     },
                // });
            } finally {
                setLoading(false);
            }
        };

        fetchCmsLimit();
    }, [maxProducts, isPremium , currentProductCount, verifyMerchant]);

    const handleViewAll = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setViewAll(!viewAll);
    };

    const handleCreatePackage = () => {
        setModalOpened(true);
    };

    const handleCloseModal = () => {
        setModalOpened(false);
        setFile(null);
        setError(null);
        setIsDragging(false);
    };

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            const validTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
            ];
            if (!validTypes.includes(selectedFile.type)) {
                setError("Invalid file type. Please upload an Excel file (.xlsx or .xls).");
                setFile(null);
            } else {
                setError(null);
                setFile(selectedFile);
            }
        } else {
            setFile(null);
        }
    };
    const importProductSampleFile = async () => {
        await axiosClient.get('/product/merchant_download_excel', {
                responseType: 'blob',
            })
            .then((res: any) => {
                const file = new File([res.data], `product_sample_upload_${new Date().toLocaleDateString()}.xlsx`);
                const url = window.URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = `product_sample_upload_${new Date().toLocaleDateString()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    };
    const handleCreateProduct = () => {
        if (!verifyMerchant) {
            notifications.show({
                title: "Merchant Access Required",
                message: "You must be a merchant to use this feature.",
                color: "red",
                styles: (theme) => ({
                    root: {
                        position: "fixed",
                        top: 60,
                        left: "50%",
                        transform: "translateX(-50%)",
                        maxWidth: isMobile ? "90%" : 500,
                        zIndex: 1000,
                        boxShadow: theme.shadows.md,
                        borderRadius: theme.radius.md,
                        textAlign: "center",
                    },
                }),
            });
            return;
        }
        if (canCreateProduct) {
            router.push({
                pathname: "/post/entity",
                query: {type: "product"},
            });
        }else {
               console.log("verufy nerchant", verifyMerchant)

            notifications.show({
                title: "Action Restricted",
                message: `You cannot create a new Product. You have reached the maximum Product limit (${maxProducts}). ${
                    !isPremium ? "Upgrade to a premium account to create more Products." : ""
                }`,
                color: "red",
                style: {
                    position: 'fixed',
                    top: '60px',
                    right: "20px",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
            });
        }
    };

        // const fetchMerchantData = async () => {
        //     try {
        //         const response = await axiosClient.get(`support/cms/support-ticket/?type=merchant-premium`);
        //         // setProductData(response.data.results);
        //         console.log("Product data:", response.data.results);
        //     } catch (error) {
        //         console.error("Error fetching product data:", error);
        //     }
        // };
        // fetchMerchantData();

    // path: `${cipherSupportPath}/support-ticket/?type=merchant-premium`,

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    };

    const handleSubmit = async () => {
        // console.log("Submitting file:", file);
        if (!file) {
            setError("Please upload an Excel file before submitting.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("products", file); // Use the correct key
            const response = await axiosClient.post("/merchant/product-bulk-upload/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // console.log("File uploaded successfully:", response.data);
            handleCloseModal();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Error uploading file. Please try again.";
            setError(errorMessage);
            console.error("Upload error:", error);
        }
    };


    return (
        <div
            className="w-full drop-shadow-md mt-5 mx-auto p-4 shadow-sm rounded-2xl overflow-hidden"
            style={{
                marginTop: "20px",
                borderRadius: "20px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                backgroundColor: dark ? theme.colors.dark[6] : "#fff",
            }}
        >
            {/* Header */}
            <Group position="apart" className="mb-6">
                <Title order={2} size="h3" style={{ color: dark ? "#E5E7EB" : "#374151" }}>
                    Products
                </Title>
                {productData.length !== 0 && (
                    <div className="flex gap-2">
                        { hasPermission && (
                        <Tooltip label={"Analytics"} position={"top"}>
                            <Button
                                  sx={{
                                    color:theme.colors.brand[4],
                                    background:"transparent",
                                    '&:hover': {
                                    color: theme.colors.brand[4],
                                    background:"transparent" // Mantine theme color for hover
                                    },
                                }}
                                variant="subtle"
                                className="text-gray-600  p-2 rounded-full flex items-center gap-1"
                                onClick={() => setShowAnalytics(!showAnalytics)}
                            >
                                <GrAnalytics className="w-5 h-5"/>
                            </Button>
                        </Tooltip>
                    )}
                        { hasPermission && (
                        <Tooltip label={"Bulk Add"} position={"top"}>
                            <Button
                                  sx={{
                                    color:theme.colors.brand[4],
                                    background:"transparent",
                                    '&:hover': {
                                    color: theme.colors.brand[4],
                                    background:"transparent" // Mantine theme color for hover
                                    },
                                }}
                                variant="subtle"
                                className="text-gray-600  p-2 rounded-full flex items-center gap-1"
                                onClick={handleCreatePackage}
                            >
                                <UploadIcon className="w-5 h-5"/>
                            </Button>
                        </Tooltip>
                        )}
                        { hasPermission &&  (
                            <Tooltip label={"Add product"} position={"top"}>
                                <Button
                                      sx={{
                                        color:theme.colors.brand[4],
                                        background:"transparent",
                                        '&:hover': {
                                        color: theme.colors.brand[4],
                                        background:"transparent" // Mantine theme color for hover
                                        },
                                    }}
                                    variant="subtle"
                                    className="text-gray-600  p-2 rounded-full flex items-center gap-1"
                                    onClick={handleCreateProduct}>                                     <FiPlus className="w-5 h-5"/>
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            className="px-4 py-2 bg-[#FFCA6A] rounded text-black"
                            style={{ fontWeight: 100 }}
                            onClick={handleViewAll}
                        >
                            {viewAll ? "View Less" : "View All"}
                        </Button>
                    </div>

                )}
            </Group>

            {/* Products Grid or Empty State */}
            {showAnalytics ? (
                <ProductAnalytics/>
            ) : productData.length > 0 ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(viewAll ? productData : productData.slice(0, 3)).map((item, index) => (
                        <div key={index}>
                            <ProductCard products={item}/>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        backgroundColor: dark ? theme.colors.dark[6] : "#fff",
                        color: dark ? "gray" : "",
                        borderRadius: "10px",
                    }}
                    className="w-full border p-4 flex flex-col sm:flex-row items-center justify-between bg-white gap-4 max-w-full mx-auto"
                >
                    <div className="w-full flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                                width="36"
                                height="40"
                                viewBox="0 0 36 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M7.375 13.75H28.625C28.9896 13.6979 29.1979 13.4896 29.25 13.125V10.625C29.1979 10.2604 28.9896 10.0521 28.625 10H28C27.9479 8.17708 27.4531 6.5625 26.5156 5.15625C25.526 3.75 24.224 2.70833 22.6094 2.03125L20.5 6.25V1.25C20.4479 0.46875 20.0312 0.0520833 19.25 0H16.75C15.9688 0.0520833 15.5521 0.46875 15.5 1.25V6.25L13.3906 2.03125C11.776 2.70833 10.474 3.75 9.48438 5.15625C8.54688 6.5625 8.05208 8.17708 8 10H7.375C7.01042 10.0521 6.80208 10.2604 6.75 10.625V13.0469C6.80208 13.5156 7.01042 13.75 7.375 13.75ZM18 21.25C16.4896 21.1979 15.1615 20.7292 14.0156 19.8438C12.9219 18.9062 12.2188 17.7083 11.9062 16.25H8.15625C8.52083 18.75 9.58854 20.8333 11.3594 22.5C13.1823 24.1146 15.3958 24.9479 18 25C20.6042 24.9479 22.8177 24.1146 24.6406 22.5C26.4115 20.8333 27.4792 18.75 27.8438 16.25H24.0938C23.7812 17.7083 23.0521 18.9062 21.9062 19.8438C20.8125 20.7292 19.5104 21.1979 18 21.25ZM25.1094 27.5H10.8906C7.97396 27.5521 5.52604 28.5677 3.54688 30.5469C1.56771 32.526 0.552083 34.974 0.5 37.8906C0.604167 39.1927 1.30729 39.8958 2.60938 40H33.3906C34.6927 39.8958 35.3958 39.1927 35.5 37.8906C35.4479 34.974 34.4323 32.526 32.4531 30.5469C30.474 28.5677 28.026 27.5521 25.1094 27.5ZM4.48438 36.25C4.84896 34.7917 5.63021 33.5938 6.82812 32.6562C7.97396 31.7708 9.32812 31.3021 10.8906 31.25H25.1094C26.6719 31.3021 28.026 31.7708 29.1719 32.6562C30.3698 33.5938 31.151 34.7917 31.5156 36.25H4.48438Z"
                                    fill="#868E96"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            {hasPermission ? (
                                <h3 className="font-medium text-base sm:text-lg">No Products Available</h3>
                            ) : (
                                <h3 className="font-medium text-base sm:text-lg">No Products are found</h3>
                            )}
                            {hasPermission ? (
                                <div className="text-sm text-gray-500 mt-1">
                                    Add new Products for your services & reach out more clients.
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 mt-1">
                                    No products are added on this service provider.
                                </div>
                            )}
                        </div>
                    </div>
                    {hasPermission && (
                        <Button
                            variant="outline"
                            style={{ borderRadius: "5px" }}
                            className="w-full sm:w-auto min-w-[200px] max-w-[200px] px-3 py-2 text-sm sm:text-base"
                            onClick={() => {
                                if (checkStatus("kyc")) {
                                    router.push({
                                        pathname: "/post/entity",
                                        query: { type: "product" },
                                    });
                                }
                            }}
                        >
                            Add your Product
                        </Button>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                opened={modalOpened}
                onClose={handleCloseModal}
                title={
                    <Title order={3} className="text-gray-800 dark:text-gray-200">
                        Product Bulk Upload
                    </Title>
                }
                size="lg"
                centered
                overlayProps={{
                    opacity: 0.55,
                    blur: 3,
                }}
                className="transition-all duration-300"
            >
                <div
                    ref={dropRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                        isDragging
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                            : "border-gray-300 dark:border-gray-600"
                    }`}
                >
                    <Text size="lg" className="mb-4 text-gray-600 dark:text-gray-300">
                        Drag and drop your Excel file here or click to select
                    </Text>
                    <FileInput
                        value={file}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        placeholder="Select Excel file"
                        className="mx-auto max-w-xs"
                    />
                    {file && (
                        <Text size="sm" className="mt-2 text-green-600 dark:text-green-400">
                            Selected file: {file.name}
                        </Text>
                    )}
                </div>

                {error && (
                    <Alert
                        icon={<FaExclamationTriangle/>}
                        title="Error"
                        color="red"
                        className="mt-4"
                    >
                        {error}
                    </Alert>
                )}
                <div className="mt-4 text-center">
                    <Text size="sm" className="text-gray-600 dark:text-gray-400">
                        Here is the sample file to ensure your file matches the required format.
                    </Text>
                    <div onClick={importProductSampleFile} className="cursor-pointer text-orange-500 hover:underline mt-2">
                        <FaDownload className="mx-auto text-orange-500 text-2xl mb-1" />
                       Sample File
                    </div>
                </div>


                <Group position="right" mt="xl">
                    <Button
                        variant="outline"
                        onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        color="orange"
                        variant="filled"
                        disabled={!file}
                    >
                        Submit
                    </Button>
                </Group>
            </Modal>
        </div>
    );
};

export default ProductList;
