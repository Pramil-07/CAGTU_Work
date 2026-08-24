import {useState, useEffect, useMemo} from 'react';
import {FiEdit, FiCheck, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight} from "react-icons/fi";
import {useMantineTheme, Modal, Button} from "@mantine/core";
import {modals} from '@mantine/modals';
import {isLoggedIn, useDark} from "@/utils/helpers";
import {notifications} from "@mantine/notifications";
import {CiGrid41} from "react-icons/ci";
import {BsTable} from "react-icons/bs";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import {Check, X} from 'lucide-react';
import {EntityServiceProps} from "@/types/merchant/EntityServiceProps";
import router from "next/router";

// interface Service {
//     id: string;
//     title: string;
// }
interface PackageService {
    is_active: boolean;
    id: string;
    package_service: string;
    title: string;
    is_requested: boolean;
}

interface AvailablePackageProps {
    id: string;
    name: string;
    amount: string;
    percentage: string;
    valid_upto: string;
    is_active: boolean;
    // service_id?: string[];
    package_item: PackageService[];
}

interface PackageFormData {
    name: string;
    amount: string;
    validUpto: string;
    percentage: string;
    package_item: Array<{
        // id: string;
        package_service: string;
        // title: string;
        is_active: boolean;
    }>;
}

// interface ServiceOption {
//     value: string;
//     label: string;
// }
interface ColorPalette {
    main: string;
    text: string;
}

interface ColorMap {
    [key: string]: ColorPalette;
}

const AvailablePackages = ({merchantId, hasPermission}: { merchantId: any, hasPermission: boolean }) => {
    const theme = useMantineTheme();
    const dark = useDark();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [service, setService] = useState<EntityServiceProps>();
    const [isEditing, setIsEditing] = useState(false);
    // const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [viewModelOpen, setViewModelOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [AvailablePackagesDataState, setAvailablePackagesDataState] = useState<AvailablePackageProps []>([])
    const [currentPackage, setCurrentPackage] = useState<AvailablePackageProps | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    // console.log("service offer", serviceOptions)
    // console.log("service offer 2", service)
    const showSuccessNotification = (message: string) => {
        notifications.show({
            title: "successfully submitted",
            message,
            color: "green",
            icon: <Check className="w-4 h-4"/>,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };
    const showErrorNotification = (message: string) => {
        notifications.show({
            title: "error submitting",
            message,
            color: "red",
            icon: <X className="w-4 h-4"/>,
            autoClose: 3000,
            style: {
                position: 'fixed',
                top: '60px',
                right: "20px",
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        });
    };

    // For pagnation
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6); // Default items per page
    const [totalPages, setTotalPages] = useState(1);
    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return AvailablePackagesDataState.slice(startIndex, endIndex);
    };
    // Form state for the modal
    const [formData, setFormData] = useState<PackageFormData>({
        name: "",
        amount: "",
        validUpto: "Month",
        percentage: "",
        package_item: [],
    });

    const handleFeatureClick = (feature: PackageService) => {
        if (!feature.package_service) return;

        const isTask = feature.is_requested;

        router.push(`/${isTask ? 'tasks' : 'services'}/${feature.package_service}`);
    };

    const colorPalette = [
        {main: "#007BFF", text: "#007BFF"}, // Blue
        {main: "#28A745", text: "#28A745"}, // Green
        {main: "#FFC107", text: "#FFC107"}, // Yellow
        {main: "#DC3545", text: "#DC3545"}, // Red
        {main: "#17A2B8", text: "#17A2B8"}, // Cyan
        {main: "#9C27B0", text: "#9C27B0"}, // Purple
        {main: "#FF9800", text: "#FF9800"}, // Orange
        {main: "#20C997", text: "#20C997"}, // Teal
        {main: "#E83E8C", text: "#E83E8C"}, // Pink
        {main: "#6C757D", text: "#6C757D"}, // Gray
    ];

    // Create a memoized mapping of package IDs to colors
    const packageColors = useMemo(() => {
        if (!AvailablePackagesDataState?.length) return {} as ColorMap;

        return AvailablePackagesDataState.reduce((colorMap, pkg, index) => {
            colorMap[pkg.id] = colorPalette[index % colorPalette.length];
            return colorMap;
        }, {} as ColorMap);
    }, [AvailablePackagesDataState]);

    // Function to get color for a specific package
    const getPackageColor = (packageId: string): ColorPalette => {
        return packageColors[packageId] || colorPalette[0];
    };
    const validateFeatures = (features: PackageFormData['package_item']): boolean => {
        // Check if at least one feature exists and all features have package_service selected
        if (features.length === 0) {
            showErrorNotification("Please add at least one feature to submit your package");
            return false;
        }

        const hasEmptyFeature = features.some(feature => !feature.package_service);
        if (hasEmptyFeature) {
            showErrorNotification("Please select a feature for package empty features are not Accepted");
            return false;
        }

        return true;
    };
    const viewPackage = (pkg: AvailablePackageProps) => {
        setCurrentPackage(pkg);
        setViewModelOpen(true);
    };
    const handleCreatePackage = () => {
        setFormData({
            name: "",
            amount: "",
            validUpto: "Month",
            percentage: "",
            package_item: [],
        });
        setCurrentPackage(null);
        setEditModalOpen(true);

    };

    const handleEditPackage = (pkg: AvailablePackageProps) => {
        setFormData({
            name: pkg.name,
            amount: pkg.amount,
            validUpto: pkg.valid_upto,
            percentage: pkg.percentage,
            package_item: pkg.package_item.map(service => ({
                is_active: service.is_active,
                package_service: service.package_service
            })),
        });
        setCurrentPackage(pkg);
        setEditModalOpen(true);
    };

    const addFeature = () => {
        const lastFeature = formData.package_item[formData.package_item.length - 1];
        if (formData.package_item.length > 0 && !lastFeature.package_service) {
            showErrorNotification("Please select a service for the current feature before adding a new one");
            return;
        }

        setFormData(prev => ({
            ...prev,
            package_item: [...prev.package_item, {
                is_active: true,
                package_service: ''
            }],
        }));
    };

    const updateFeature = (index: number, field: keyof PackageFormData['package_item'][0], value: string | boolean) => {
        // console.log(value)
        setFormData(prev => {
            const newFeatures = [...prev.package_item];
            // console.log("Old:" ,prev.package_item);
            newFeatures[index] = {
                ...newFeatures[index],
                [field]: value
            };
            // console.log("New:" ,newFeatures);
            return {...prev, package_item: newFeatures};
        });
    };

    const removeFeature = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            package_item: prev.package_item.filter((_, index) => index !== indexToRemove),
        }));
    };

    useEffect(() => {
        if (AvailablePackagesDataState) {
            setTotalPages(Math.ceil(AvailablePackagesDataState.length / itemsPerPage));
        }
    }, [AvailablePackagesDataState, itemsPerPage]);

    useEffect(() => {
        const fetchPackageService = async () => {
            try {
                const response = await axiosClient.get<EntityServiceProps>(
                    `${urls.package.package_service}?is_requested=true/`,
                );
                // console.log("package service",response.data)
                setService(response.data);
            } catch (error) {
                // console.error('Error fetching service:', error);
                setError('Failed to load services');
            }
        };
        fetchPackageService();
    }, []);
    // console.log("list of service ",service)

    // console.log(
    //     "this is service",
    //     service?.result?.map(d => d.title) || []
    // );


    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setIsLoading(true);
                // const response = await axiosClient.get(`${urls.package.packages}`,
                const response = await axiosClient.get(`${urls.package.packages}${merchantId}/`,
                );
                // console.log('Fetched packages:', response.data);
                const fetchedPackages = response.data;
                if (Array.isArray(fetchedPackages)) {
                    setAvailablePackagesDataState(fetchedPackages);
                } else {
                    setError("Unexpected API Response");
                }
            } catch (error) {
                // console.error("Error fetching packages:", error);
                setError("Failed to fetch packages");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, [merchantId]);

    // console.log(AvailablePackagesDataState);

    const handleSavePackage = async () => {
        try {
            setIsLoading(true);

            // Validate required fields
            if (!formData.name || !formData.amount || !formData.validUpto) {
                setError("Please fill in all required fields");
                showErrorNotification("Please fill in all required fields");
                return;
            }
            if (!validateFeatures(formData.package_item)) {
                return;
            }
            // const serviceIdArray = formData.services
            //     .map(feature => {
            //         const matchedService = serviceOptions.find(
            //             option => option.label === feature.title
            //         );
            //         return matchedService?.value;
            //     })
            //     .filter((id): id is string => id !== undefined);

            const packageData = {
                name: formData.name,
                // service_id: serviceIdArray,
                amount: formData.amount,
                percentage: formData.percentage,
                valid_upto: formData.validUpto,
                is_active: true,
                package_item: formData.package_item,
            };

            // console.log('Sending package data:', packageData); // Debug log

            if (currentPackage?.id) {
                const {data} = await axiosClient.put<AvailablePackageProps>(
                    `${urls.package.updatePackage}${currentPackage.id}/`,
                    packageData,
                );
                setAvailablePackagesDataState(prev =>
                    prev.map(pkg => pkg.id === currentPackage.id ? data : pkg)
                );
                showSuccessNotification("Package updated successfully");
            } else {
                const {data} = await axiosClient.post<AvailablePackageProps>(
                    `${urls.package.packages}${merchantId}/`,
                    packageData,
                );
                setAvailablePackagesDataState(prev => [...prev, data]);
                showSuccessNotification("New package created successfully");
            }

            setEditModalOpen(false);
            setCurrentPackage(null);
            setError(null); // Clear any existing errors
        } catch (error) {
            // console.error("Error saving package:", error);
            setError("Failed to save package. Please try again");
            showErrorNotification("Failed to save package. Please try again");
        } finally {
            setIsLoading(false);
        }
    };


    const removePackage = async (id: string) => {
        modals.openConfirmModal({
            title: 'Delete Package',
            children: (
                <div className="text-sm">
                    <p>Are you sure you want to delete this package?</p>
                    <p className="mt-2 text-gray-500">This action cannot be undone.</p>
                </div>
            ),
            labels: {confirm: 'Delete', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: async () => {
                try {
                    setIsLoading(true);
                    await axiosClient.delete(`${urls.package.packages}${id}/delete`,
                    );
                    setAvailablePackagesDataState((prev) =>
                        prev.filter((pkg) => pkg.id !== id)
                    );
                    // openModal("are you sure");
                    showSuccessNotification("Package deleted successfully");
                } catch (error) {
                    // console.error("Error deleting package:", error);
                    setError("Failed to delete package. Please try again.");
                    showErrorNotification("Failed to delete package. Please try again");
                } finally {
                    setIsLoading(false);
                }
            },
        });
    };

    const PaginationControls = () => (
        <div className="mt-6 flex justify-center items-center gap-4">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${
                    currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : `hover:bg-gray-500 dark:hover:bg-gray-700`
                }`}
            >
                <FiChevronLeft className={dark ? 'text-white' : 'text-gray-600'}/>
            </button>

            <div className="flex items-center gap-1">
                {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            currentPage === page
                                ? 'bg-blue-500 text-white'
                                : `${dark ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${
                    currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-500 dark:hover:bg-gray-700'
                }`}
            >
                <FiChevronRight className={dark ? 'text-white' : 'text-gray-600'}/>
            </button>
        </div>
    );

    // package grid view
    const renderGridView = () => (
        <>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {getPaginatedData().map((pkg) => {
                    const {main: packageColor, text: packageTextColor} = getPackageColor(pkg.id);
                    return (
                        <div
                            key={pkg.id}
                            className="rounded-lg relative shadow-md p-0 flex flex-col h-full break-words"
                            style={{minHeight: "400px"}}
                        >

                            {/* Action buttons group */}
                            {isEditing && hasPermission && (
                                <div className="absolute -top-2 -right-2 flex gap-2 z-10">
                                    <button
                                        className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                                        onClick={() => handleEditPackage(pkg)}
                                    >
                                        <FiEdit className="w-4 h-4"/>
                                    </button>
                                    <button
                                        className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        onClick={() => removePackage(pkg.id)}
                                    >
                                        <FiTrash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            )}

                            <div
                                className="p-6 rounded-lg border shadow-md flex-1 flex flex-col"
                                style={{
                                    color: dark ? "white" : "",
                                    backgroundColor: dark
                                        ? isEditing
                                            ? theme.colors.dark[9]
                                            : theme.colors.dark[6]
                                        : "#fff",
                                    borderRadius: "8px",
                                }}
                            >
                                <div
                                    className="w-full absolute top-0 right-0 h-2 rounded-t-xl rounded-b-none"
                                    style={{
                                        backgroundColor: packageColor,
                                    }}
                                />
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-medium mb-4">{pkg.name}</h3>
                                    <div className="text-3xl font-bold mb-2">
                                        Rs {pkg.amount}
                                        <span className="text-base font-normal text-gray-600 ml-2 cursor-pointer">
                                            /{pkg.valid_upto}
                                        </span>
                                    </div>
                                    <p style={{color: packageTextColor}}
                                       className="text-sm flex flex-row items-center justify-center gap-2">
                                        <h5>Save upto -</h5>{pkg.percentage} %
                                    </p>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {pkg.package_item.map((feature, featureIndex) => (
                                        <div key={featureIndex}
                                             className="flex items-center justify-between gap-2 group">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="text-lg"
                                                      style={{color: feature.is_active ? packageColor : 'gray'}}>
                                                    •
                                                </span>
                                                <span
                                                    className={`text-sm flex-1 ${!feature.is_active ? "text-gray-500 line-through" : ""}`}>
                                                    {feature.title}
                                                </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                className="w-full mt-4 py-2 px-4 rounded-lg border transition-all hover:bg-opacity-10"
                                style={{
                                    backgroundColor: dark ? "rgb(37, 38, 43)" : "transparent",
                                    color: packageColor,
                                    borderColor: packageColor,
                                }}
                                onClick={() => viewPackage(pkg)}
                            >
                                View Detail
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
        <PaginationControls />
    </>
);


    {/*Table view*/
    }
    const renderTableView = () => (
        <>
            <div className="overflow-x-auto mt-8">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Package Name
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Features
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Discount
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className={`${dark ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200`}>
                    {AvailablePackagesDataState.map((pkg) => (
                        <tr key={pkg.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <div
                                            className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-900'}`}>
                                            {pkg.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {pkg.package_item.map(service => service.title).join(", ").length > 50
                                        ? `${pkg.package_item.map(service => service.title).join(", ").substring(0, 50)}...`
                                        : pkg.package_item.map(service => service.title).join(", ")}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 text-xs rounded-full ${
                                    pkg.valid_upto
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {pkg.valid_upto}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                Rs {pkg.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs bg-[#FFDFA6] rounded text-[#3D3F7D]">
                                    {pkg.percentage}%
                                </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isEditing && hasPermission && (
                                <div className="flex space-x-2 justify-end">
                                    <button
                                        onClick={() => handleEditPackage(pkg)}
                                        className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => removePackage(pkg.id)}
                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        <PaginationControls />
    </>
);

return (
    <>
        <div
            className="w-full mx-auto p-4 text-neutral-800 shadow-sm rounded-lg bg-white overflow-hidden"
            style={{
                marginTop: "20px",
                borderRadius: "20px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                backgroundColor: dark ? theme.colors.dark[6] : "#fff",
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2
                    className="text-2xl font-medium break-words max-w-full text-center sm:text-3xl"
                    style={{
                        color: dark ? "white" : "",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        maxWidth: "100%",
                    }}
                >
                    Packages ({AvailablePackagesDataState && AvailablePackagesDataState.length})
                </h2>
                <div className="flex gap-2">
                    {isEditing && hasPermission && (
                        <Button
                        sx={{

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
                            <FiPlus className="w-5 h-5" />
                        </Button>
                    )}
                    {hasPermission && isLoggedIn() && (
                        <>
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
                                className="text-gray-600  p-2 rounded-full"
                                onClick={() => setIsEditing(!isEditing)}
                                aria-label={isEditing ? "Save changes" : "Edit packages"}
                            >
                                {isEditing ? <FiCheck className="w-5 h-5" /> : <FiEdit className="w-5 h-5" />}
                            </Button>
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
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded text-gray-600 ${viewMode === 'grid' ? '' : ''}`}
                            >
                                <CiGrid41 size={20} />
                            </Button>
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
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded text-gray-600 ${viewMode === 'table' ? '' : ''}`}
                            >
                                <BsTable size={20} />
                            </Button>
                        </>
                    )}
                </div>
            </div>
            {AvailablePackagesDataState && AvailablePackagesDataState.length === 0 ? (
                <div
                    style={{
                        backgroundColor: dark ? theme.colors.dark[6] : "#fff",
                        color: dark ? "gray" : "",
                        borderRadius: "10px",
                    }}
                    className="border p-4 flex flex-col sm:flex-row items-center w-full justify-between bg-white gap-4 max-w-full mx-auto"
                >
                    <div className="flex items-center space-x-4 w-full">
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
                                <h3 className="font-medium text-base sm:text-lg">No Packages Available</h3>
                            ) : (
                                <h3 className="font-medium text-base sm:text-lg">No Packages are found</h3>
                            )}
                            {hasPermission ? (
                                <div className="text-sm text-gray-500 mt-1">
                                    Add new packages for your services & reach out more clients.
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 mt-1">
                                    no packages are added on this service provider.
                                </div>
                            )}
                        </div>
                    </div>
                    {hasPermission && (
                        <Button
                            onClick={handleCreatePackage}
                            variant="outline"
                            style={{ borderRadius: "5px" }}
                            className="w-full sm:w-auto min-w-[200px] max-w-[200px] px-3 py-2 text-sm sm:text-base"
                        >
                            Add New Package
                        </Button>
                    )}
                </div>
            ) : (
                viewMode === 'grid' ? renderGridView() : renderTableView()
            )}
        </div>
        <Modal
            opened={viewModelOpen}
            onClose={() => {
                setViewModelOpen(false);
                setCurrentPackage(null);
            }}
            size="lg"
        >
            {currentPackage && (
                <div className={`p-6 ${dark ? 'text-white' : 'text-gray-800'}`}>
                    <div className="relative">
                        <div
                            className="w-full absolute top-0 right-0 h-2 rounded-t-xl"
                            style={{ backgroundColor: getPackageColor(currentPackage.id).main }}
                        />
                        <div className="text-center mb-8 pt-4">
                            <h2 className="text-2xl font-bold mb-2">{currentPackage.name}</h2>
                            <div className="text-3xl font-bold mb-2">
                                Rs {currentPackage.amount}
                                <span className={`text-base font-normal ${dark ? 'text-gray-400' : 'text-gray-600'} ml-2`}>
                                        /{currentPackage.valid_upto}
                                    </span>
                                </div>
                                <p className="text-sm inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                    Save up to {currentPackage.percentage}%
                                </p>
                            </div>

                            {/* Features */}
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-4">Included Features</h3>
                                <div className="space-y-3">
                                    {currentPackage.package_item.map((feature, index) => (
                                        <button
                                            key={index}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                                dark
                                                    ? feature.is_active ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 hover:bg-gray-800'
                                                    : feature.is_active ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                            onClick={() => handleFeatureClick(feature)}

                                        >
                                            <div className="flex items-center gap-3 ">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${
                                                        feature.is_active ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                                />
                                                <span className={feature.is_active ? 'font-medium' : 'text-gray-500'}>
                                                    {feature.title}
                                                </span>
                                                {/*                            <span className={`text-xs px-2 py-1 rounded ${*/}
                                                {/*                                feature.is_requested*/}
                                                {/*                                    ? 'bg-orange-100 text-orange-800'*/}
                                                {/*                                    : 'bg-blue-100 text-blue-800'*/}
                                                {/*                            }`}>*/}
                                                {/*  {feature.is_requested ? 'Task' : 'Service'}*/}
                                                {/*</span>*/}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            {/* Edit package Modal */}
            <Modal
                opened={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setCurrentPackage(null);
                }}
                title={currentPackage ? "Edit Package" : "Create New Package"}
                size="lg"
                className=" border rounded-b-3xl "
            >
                {/*<div className="rounded-lg shadow-md p-0 flex flex-col relative min-h-[400px]">*/}
                {/*<div className="w-full h-2 rounded-t-lg bg-blue-500" />*/}

                <div className={`p-6 rounded-2xl border shadow-md flex-1 flex flex-col ${
                    dark ? 'bg-gray-800 text-white' : 'bg-white'
                }`}>
                    {/* Title Section */}
                    <div className="mb-6">
                        <label className="text-start text-xl font-bold block mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            placeholder="Enter package name"
                            className={`p-2 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full rounded ${
                                dark ? 'bg-gray-700' : 'bg-white'
                            }`}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Price Input */}
                        <div className="flex-1">
                            <label className="block text-xl font-bold text-gray-800 dark:text-white mb-2">Price</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                                placeholder="0.00"
                                className="w-full p-2 h-10 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                        </div>

                        {/* Valid For Dropdown */}
                        <div className="w-full md:w-32">
                            <label className="block text-xl font-bold text-gray-800 dark:text-white mb-2">Valid
                                For</label>
                            <select
                                value={formData.validUpto}
                                onChange={(e) => setFormData(prev => ({...prev, validUpto: e.target.value}))}
                                className="w-full p-2 h-10 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                                <option value="Day">Day</option>
                                <option value="Month">Month</option>
                                <option value="Year">Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Discount Section */}
                    <div className="mb-6">
                        <label className="text-start text-xl font-bold block mb-2">Discount (%)</label>
                        <input
                            type="number"
                            value={formData.percentage}
                            onChange={(e) => setFormData(prev => ({...prev, percentage: e.target.value}))}
                            placeholder="Enter discount percentage"
                            className={`p-2 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full rounded ${
                                dark ? 'bg-gray-700' : 'bg-white'
                            }`}
                        />
                    </div>

                    {/* Features Section */}
                    <div className="flex-1 space-y-4">
                        <label className="block text-xl font-bold text-gray-800 dark:text-white">Features</label>
                        {formData.package_item.map((feature, index) => {
                            const selectedServiceIds = formData.package_item
                                .filter((_, i) => i !== index)
                                .map(f => f.package_service)
                                .filter(id => id);

                            const availableOptions = service?.result.filter(option =>
                                !selectedServiceIds.includes(option.id) || option.id === feature.package_service
                            ) || [];

                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={feature.is_active}
                                        onChange={(e) => updateFeature(index, 'is_active', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <select
                                        value={feature.package_service || ''}
                                        onChange={(e) => updateFeature(index, 'package_service', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                    >
                                        <option value="">Select a feature</option>
                                        {availableOptions.map((option) => (
                                            <option
                                                key={option.id}
                                                value={option.id}
                                            >
                                                {option.title}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeFeature(index)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete feature"
                                    >
                                        <FiTrash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Feature Button */}
                    <button
                        onClick={addFeature} // Simply invoke the function without passing an argument
                        className="flex items-center justify-center gap-1 text-green-600 hover:text-green-700 w-full mt-4 p-2"
                    >
                        <FiPlus className="w-4 h-4"/>
                        <span className="text-sm">Add Feature</span>
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={handleSavePackage}
                        className={`w-full mt-4 py-2 px-4 rounded-lg border transition-all ${
                            dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    >
                        Save
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default AvailablePackages;
