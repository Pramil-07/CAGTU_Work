import React, {useEffect, useRef, useState} from "react";
import {
    FiEdit,
    FiCheck,
    FiPlus,
    FiChevronRight,
    FiChevronLeft,
    FiSave,
    FiTrash2,
} from "react-icons/fi";
import {
    Button,
    Group,
    TextInput,
    Textarea,
    Title,
    Modal,
    Select,
    useMantineTheme, Skeleton, NumberInput,
} from "@mantine/core";
import {axiosClient} from "@/utils/axiosClient";
import urls from "@/constants/urls";
import {isLoggedIn, useDark} from "@/utils/helpers";
import axios from "axios";
import router from "next/router";
import {CiGrid41} from "react-icons/ci";
import {BsTable} from "react-icons/bs";
import {useCategoryOptions} from "@/hooks/useCategoryOptions";
import {useAppDispatch} from "@/hooks";

import {DateTimePicker} from "@mantine/dates";
import dayjs from "dayjs";
import {useProfile} from "@/hooks/useProfile";
import {ImageIcon, Plus} from "lucide-react";
import {notifications} from "@mantine/notifications";
import {openConfirmModal} from "@/components/common/form/ConfirmModal";
import {toast} from "@/components/common/Toast";
import {SkeletonServiceCard} from "@/components/skeletons/SkeletonServiceCard";
import {CardSkeletonGrid} from "@/pages/explore/services";


export interface ProfileImage {
    url: string | null;
}

export interface CreatedBy {
    id: string | undefined;
    username: string | undefined;
    email: string | null;
    phone: string | null;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    profile_image: ProfileImage | null;
    bio: string;
    created_at: string;
    designation: string;
    is_profile_verified: boolean;
    is_followed: boolean;
    is_following: boolean;
    badge: string | null;
}

export interface OfferRule {
    id: number;
    is_active: boolean;
    title: string;
    description: string;
    extra_data: Record<string, unknown>;
    has_discount: boolean;
    has_free_items: boolean;
    has_quantity: boolean;
}

export interface Offer {
    id: number;
    services: []; // Replace `any` with the specific type if available
    entity_services: any[]; // Replace `any` with the specific type if available
    categories: any[]; // Replace `any` with the specific type if available
    created_by: CreatedBy;
    merchant: any | null; // Replace `any` with the specific type if available
    country: any | null;
    free: any | null; // Replace `any` with the specific type if available
    offer_rule: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    title: string;
    description: string;
    offer_type: OfferType | "";
    status?: 'Active' | 'Inactive';
    code: string;
    image: File | undefined | string;
    start_date: string;
    end_date: string;
    is_consumable: boolean;
    discount: string;
    discount_type: string;
    discount_limit: string;
    quantity: string;
    is_common: boolean;
    redeem_points: number;
    organizations: any[]; // Replace `any` with the specific type if available
    redeems: any[]; // Replace `any` with the specific type if available
    user_id?: string;
}

interface Country {
    id: number;
}

interface ServiceItem {
    id: string;   // or number, depending on your data type
    title: string;
    // add other properties if needed
}

interface DiscountTypeItem {
    id: string;
    title: string;
}

// Define the type for the service response
interface ServiceData {
    result: ServiceItem[];
}

enum OfferType {
    promo_code = "Promo code",
    gift_card = "Gift Card",
    voucher = "Voucher",
    coupon = "Coupon",
    scratch_card = "Scratch Card",
    basic = "Basic"
}

interface SpecialOffersProps {
    offers?: any[]
}

const SpecialOffers = ({merchantId, hasPermission}: { merchantId: any, hasPermission: boolean }) => {
    const [fetchedOffers, setFetchedOffers] = useState<Offer[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
    const [newOfferImage, setNewOfferImage] = useState<File>();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [expandedOffers, setExpandedOffers] = useState<number[]>([]);
    const [service, setService] = useState<ServiceData | undefined>(undefined);
    const [imageError, setImageError] = useState<string | null>(null);
    const [offerRule, setOfferRule] = useState<OfferRule | null>()
    const [selectedEntityServiceId, setSelectedEntityServiceId] = useState<string []>([]);
    const [offerType, setOfferType] = useState<OfferType | null>(null);
    const [offerCount, setOfferCount] = useState(0)
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [fetchCategory, setFetchCategory] = useState<[]>();
    const {data: CategoryOptions = []} = useCategoryOptions();
    const dispatch = useAppDispatch();
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date())

    const [countryList, setCountryList] = useState<any[]>([]);
    const [isLoading, setIsloading] = useState(false)
    const [isModalOpen, setModalOpen] = useState(false);
    const [viewOffer, setviewOffer] = useState<Offer>()
    const modalRef = useRef<HTMLDivElement>(null);
    // const [opened, setOpened] = useState(false);  // For controlling modal visibility
    // const [offerIdToDelete, setOfferIdToDelete] = useState(null);
    const handleOpenModal = async (currentOffer: number) => {
        setModalOpen(true);
        try {
            // const response = await axiosClient.get(`/offer/cms/serviceoffer/${currentOffer}/`);

            // const data = fetchedOffer.filter((offer : any) => offer.id === currentOffer);
            const data = fetchedOffers.find(offer => offer.id === currentOffer)
            setviewOffer(data);
            // console.log("fetched test data ", currentOffer);
        } catch (error) {
            // console.error('Error fetching offer data:', error);
        }
    };
    // console.log("dummy", setCurrentOffer);
// console.log("current offer test ",currentOffer?.id)
    const handleCloseModal = () => setModalOpen(false);
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleCloseModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };
    const {data: profileData} = useProfile();
    const profileId = profileData?.user.id
    const theme = useMantineTheme();
    const isDark = theme.colorScheme === "dark";
    const dark = useDark();
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const id = router.query.id as string;

    // console.log("profile id ", profileId)
    // console.log("merchant id ", merchantId)


    const loadOffers = async () => {
        setIsloading(true)
        try {
            const {data} = await axiosClient.get(`${urls.offer.all}?page_size=50&user_id=${merchantId}`);
            // console.log("All offers:", data.result);

            const merchantOffers = data.result.filter((offer: Offer) =>
                offer.created_by.id === merchantId ||
                offer.merchant?.id === merchantId
            );
            setFetchedOffers(data.result);
            setFetchedOffers(merchantOffers);
        } catch (err) {
            console.error("Error fetching offers:", err);
            // notifications.show({
            //     color: 'red',
            //     title: 'Error',
            //     message: 'Failed to load offers. Please try again.',
            // });
        } finally {
            setIsloading(false)
        }
    };

    useEffect(() => {
        loadOffers();
    }, []);
    // console.log("All offer", fetchedOffers)


    useEffect(() => {
        const loadservices = async () => {
            try {
                const {data} = await axiosClient.get(`${urls.entity.myService}${profileId}`);
                setService(data);
                // console.log("This is", data);

            } catch (err) {
                console.error("Error fetching offers:", err);
            }
        };
        loadservices();
    }, [profileId]);

    useEffect(() => {
        const loadservices = async () => {
            try {
                const response = await axios.get('/offer/serviceoffer')
                setFetchedOffers(response.data)
                // console.log("offers", response.data)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            loadservices();
        }
    }, []);


    useEffect(() => {
        const loadOffers = async () => {
            try {
                const response = await axios.get('/offer/cms/serviceoffer/')
                setFetchedOffers(response.data)
                setOfferCount(response.data.count);
                // console.log("offers", response.data)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            loadOffers();
        }

    }, []);
    // console.log("fetched data fot ers", fetchedOffers)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get('/locale/cms/country/');
                setCountryList(response.data.result);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);
    // console.log("special", fetchedOffers)
    // console.log("country check", countryList);
    const handlePrevSlide = () => {
        setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : fetchedOffers.length - 1);
    };

    const handleNextSlide = () => {
        setCurrentSlideIndex(prev => prev < fetchedOffers.length - 1 ? prev + 1 : 0);
    };

    const handleDeleteOffer = async (offerId: number) => {
        openConfirmModal({
            title: "Delete Confirmation",
            message: "Are you sure you want to delete this item ?",
            onConfirm: async () => {
                try {
                    const response = await axiosClient.delete(`/offer/cms/serviceoffer/${offerId}/`);
                    if (response.status === 200) {
                        // Update state immediately after successful deletion
                        setFetchedOffers(prevOffers => prevOffers.filter(offer => offer.id !== offerId));
                    }
                    toast.success("offer deleted successfully ")
                } catch (error) {
                    console.error("Error deleting offer:", error);
                }
            }
        })
        loadOffers()
    };

    const handleMultipleDeleteOffer = async (offerId: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete multiple offer?");
        if (!confirmDelete) return;

        try {
            const response = await axiosClient.delete(`/offer/cms/serviceoffer/multiple-delete/`);
            if (response.status === 200) {
                // Update state immediately after successful deletion
                setFetchedOffers(prevOffers => prevOffers.filter(offer => offer.id !== offerId));
            }
        } catch (error) {
            console.error("Error deleting offer:", error);
        }
        loadOffers()
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 1) {
                setImageError("Image size should be less than 1 MB");
                setNewOfferImage(undefined);
                if (currentOffer) {
                    setCurrentOffer({ ...currentOffer, image: undefined });
                }
                return;
            } else {
                setImageError(null);
            }

            setNewOfferImage(file);
            if (currentOffer) {
                setCurrentOffer({ ...currentOffer, image: file });
            }
        } else {
            setImageError(null);
            setNewOfferImage(undefined);
            if (currentOffer) {
                setCurrentOffer({ ...currentOffer, image: undefined });
            }
        }
    };

    const handleCreateOffer = async () => {
        const createSpecialOffer: Offer = {
            id: Date.now(),
            title: "",
            description: "",
            image: newOfferImage,
            is_active: true,
            status: 'Active',
            discount: "",
            code: "",
            offer_type: "",
            offer_rule: 1,
            services: [],
            categories: [],
            organizations: [],
            country: [],
            free: null,
            entity_services: [],
            start_date: dayjs(startDate).toISOString(),
            end_date: dayjs(startDate).toISOString(),
            discount_type: 'Percentage',
            quantity: "",
            is_consumable: true,
            is_common: true,
            discount_limit: "",
            redeem_points: 0,
            merchant: {
                id: merchantId
            },

            created_by: {
                id: merchantId,
                username: profileData?.user.username,
                email: null,
                phone: null,
                full_name: "",
                first_name: "",
                middle_name: "",
                last_name: "",
                profile_image: null,
                bio: "",
                created_at: "",
                designation: "",
                is_profile_verified: false,
                is_followed: false,
                is_following: false,
                badge: null
            },
            created_at: "",
            updated_at: "",
            redeems: []
        }

        setCurrentOffer(createSpecialOffer);
        setEditModalOpen(true);
    };

    const handleEditOffer = (offer: Offer) => {
        const normalizedCountry = offer.country && typeof offer.country === 'object' ? offer.country.code : offer.country || '';
        setCurrentOffer({
            ...offer,
            status: offer.is_active ? 'Active' : 'Inactive',
            country: normalizedCountry,
        });
        setEditModalOpen(true);
    };

    // console.log('newOfferImage:', newOfferImage);

    const handleSaveOffer = async () => {
        if (!currentOffer) return;
        // Validate required fields
        if (!fetchedOffers.some(offer => offer.id === currentOffer.id)) {
            if (!currentOffer.title.trim() || !currentOffer.description.trim()) {
                return;
            }
        }
        const isNewOffer = !fetchedOffers.some(offer => offer.id === currentOffer.id);
        const action = isNewOffer ? 'create' : 'update';

        if (isNewOffer) {
            try {
                // Create FormData object to handle file upload
                const formData = new FormData();

                // Append image if it exists
                if (newOfferImage) {
                    formData.append('image', newOfferImage);
                }
                // const isActive = currentOffer.status === 'Active';

                // Append other offer data
                formData.append('is_active', currentOffer.is_active ? 'true' : 'false');
                formData.append('status', currentOffer.is_active ? 'Active' : 'Inactive');
                // formData.append('is_active', String(currentOffer.is_active ? 'Active' : 'Inactive'));
                // formData.append('is_active', String(isActive));
                formData.append('title', currentOffer.title);
                formData.append('country', currentOffer.country);
                formData.append('description', currentOffer.description);
                formData.append('discount', currentOffer.discount || "0");
                formData.append('discount_type', currentOffer.discount_type || "Percentage");
                formData.append('discount_limit', currentOffer.discount_limit || "0");
                formData.append('quantity', String(currentOffer.quantity || 0));
                // formData.append('code', currentOffer.code || "DEFAULT_CODE");
                formData.append('code', currentOffer.code || "");
                formData.append('offer_type', currentOffer.offer_type || "coupon");
                formData.append('start_date', dayjs(startDate).toISOString());
                formData.append('end_date', dayjs(endDate).toISOString());
                formData.append('offer_rule', currentOffer.offer_rule.toString());
                formData.append('is_consumable', String(currentOffer.is_consumable));
                formData.append('is_common', String(currentOffer.is_common));
                formData.append('merchant', merchantId);
                formData.append('created_by', merchantId);
                // formData.append('merchant', String(merchantId));
                // formData.append('free', null);
                // formData.append('redeem_points', String(currentOffer.redeem_points || 0));

                // Append arrays as JSON strings
                // formData.append('services', JSON.stringify(currentOffer.services || []));
                selectedEntityServiceId.forEach((id) => {
                    formData.append('entity_services', id);
                });
                // formData.append('entity_services', JSON.stringify(selectedEntityServiceId || []));
                // formData.append('categories', JSON.stringify(currentOffer.categories || []));
                // formData.append('organizations', JSON.stringify(currentOffer.organizations || []));

                // Make POST request with FormData
                const response = await axiosClient.post('/offer/cms/serviceoffer/', formData);

                notifications.show({
                    color: 'green',
                    title: 'Offer Created successfully',
                    message: 'Your Offer is created . Please wait some seconds',
                    // classNames: classes,
                })

                setOfferCount(prevCount => prevCount + 1);

                // console.log("fetched offer test ",fetchedOffers)

                // Show success message
            } catch (error) {
                console.error("Error saving the offer:", error);
            }
            loadOffers()
        } else {
            try {
                // Handle updating existing offer
                const formData = new FormData();
                // console.log('newOfferImage:', newOfferImage);
                if (newOfferImage) {
                    formData.append('image', newOfferImage); // This ensures the new image is sent as binary
                }

                // const code = currentOffer.code || "DEFAULT_CODE";
                const code = currentOffer.code || "";
                if (code.length > 16) {
                    return;
                }
                // Append other offer data
                formData.append('is_active', currentOffer.is_active ? 'true' : 'false');
                formData.append('status', currentOffer.is_active ? 'Active' : 'Inactive');
                formData.append('title', currentOffer.title || "");
                formData.append('country', currentOffer.country);
                formData.append('description', currentOffer.description || "");
                formData.append('discount', currentOffer.discount || "0");
                formData.append('discount_type', currentOffer.discount_type || "");
                formData.append('discount_limit', currentOffer.discount_limit || "0");
                formData.append('quantity', String(currentOffer.quantity || 0));
                formData.append('code', code);
                formData.append('offer_type', currentOffer.offer_type || "coupon");
                formData.append('start_date', dayjs(startDate).toISOString());
                formData.append('end_date', dayjs(endDate).toISOString());
                // formData.append('offer_rule', currentOffer.offer_rule);
                formData.append('is_consumable', String(currentOffer.is_consumable ? "true" : "false"));
                formData.append('is_common', String(currentOffer.is_common ? "true" : "false"))
                formData.append('merchant', merchantId);
                formData.append('created_by', merchantId);
                // formData.append('redeem_points', String(currentOffer.redeem_points || 0));

                selectedEntityServiceId.forEach((id) => {
                    formData.append('entity_services', id);
                });

                const response = await axiosClient.patch(`/offer/cms/serviceoffer/${currentOffer.id}/`, formData);

                if (response.status == 200) {
                    const loadOffers = async () => {
                        try {
                            const {data} = await axiosClient.get(`urls.offer.all/?user_id=${merchantId}`);
                            const merchantOffers = data.result.filter((offer: Offer) =>
                                offer.created_by.id === merchantId ||
                                offer.merchant?.id === merchantId
                            );
                            // setFetchedOffers(merchantOffers);
                            setFetchedOffers(merchantOffers.length > 0 ? merchantOffers : []);
                        } catch (err) {
                            console.error("Error fetching offers:", err);
                        }
                    };
                    loadOffers();
                }
                notifications.show({
                    color: 'green',
                    title: 'Offer updated successfully',
                    message: 'Offer is updated .',
                    // classNames: classes,
                })

            } catch (error: any) {
                const errorMessages: string[] = [];

                // Handle Axios error
                if (error.response?.data) {
                    const errorData = error.response.data;

                    // Handle field-specific errors
                    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
                        Object.entries(errorData).forEach(([field, errors]) => {
                            if (Array.isArray(errors)) {
                                errors.forEach((err: string) => {
                                    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
                                    errorMessages.push(`${fieldName}: ${err}`);
                                });
                            } else if (typeof errors === 'string') {
                                const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
                                errorMessages.push(`${fieldName}: ${errors}`);
                            }
                        });
                    }

                    // Handle non-field errors
                    if (errorData.detail) {
                        errorMessages.push(errorData.detail);
                    } else if (typeof errorData === 'string') {
                        errorMessages.push(errorData);
                    }
                } else {
                    // Handle network or unexpected errors
                    errorMessages.push(error.message || `Failed to ${action} offer`);
                }

                // Show each error as a toast
                if (errorMessages.length > 0) {
                    errorMessages.forEach((msg) => console.log(msg));
                } else {
                    console.log(`Failed to ${action} offer`);
                }
            }
            loadOffers()
        }

        // Close modal and reset states
        setEditModalOpen(false);
        setCurrentOffer(null);
        setNewOfferImage(undefined);
    };
    fetchedOffers;

    const handleDropdown = (selectedValue: string | null) => {
        const selectedService = service?.result?.find((item) => item.id === selectedValue);
        if (selectedService) {
            // Update selectedEntityServiceId
            setSelectedEntityServiceId([selectedService.id]);

            // Update currentOffer.entity_services
            setCurrentOffer(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    entity_services: [{id: selectedService.id, title: selectedService.title}], // Adjust based on your service object structure
                };
            });
        } else {
            // Handle case where no service is selected (e.g., cleared)
            setSelectedEntityServiceId([]);
            setCurrentOffer(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    entity_services: [],
                };
            });
        }
    };
    const formatDiscount = (discount: string, discountType: string) => {
        if (!discount) return 'N/A';

        const value = parseFloat(discount);
        if (isNaN(value)) return 'N/A';

        if (discountType === 'Percentage') {
            return `${value}% OFF`;
        } else if (discountType === 'Amount') {
            return `Rs. ${value.toFixed(0)} OFF`;
        }
        return 'N/A';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const field = e.target.name;
        const value = e.target.value;
        setCurrentOffer(prev => prev ? {...prev, [field]: value} : null);

    };

    const getVisibleOffers = () => {
        const visibleCount = Math.min(fetchedOffers.length, 3); // Show up to 3 offers, but no more than the total number of offers
        const startIndex = currentSlideIndex;
        const visibleOffers = [];

        for (let i = 0; i < visibleCount; i++) {
            const offerIndex = (startIndex + i) % fetchedOffers.length;
            visibleOffers.push({...fetchedOffers[offerIndex], uniqueKey: `${fetchedOffers[offerIndex].id}-${i}`});
        }
        return visibleOffers;
    };

    const getCardWidth = (index: number) => {
        if (windowWidth <= 640) {
            return {width: '280px', flex: '0 0 280px'};
        } else if (windowWidth <= 1024) {
            return {width: '300px', flex: '0 0 300px'};
        } else {
            return {width: "100%"};
        }
    };

    // console.log("image", currentOffer?.image)
    const getContainerPadding = () => {
        if (windowWidth <= 640) return 'px-4';
        if (windowWidth <= 1024) return 'px-8';
        return 'px-12';
    };

    const offerTypeList = Object.entries(OfferType).map(([key, value]) => ({
        label: value,
        value: key
    }));

    // console.log(offerTypeList)
    const serviceValues: { label: any; value: any }[] = (service?.result ?? []).map((item: any) => ({
        value: item.id,
        label: item.title,
    }))
    if (isLoading) {
        return (
            // <Skeleton className="mt-10" height={350}/>
            <div className="my-10">
                <CardSkeletonGrid title={"Offers"}/>
            </div>
        )
    }

    return (
        <div className="mx-auto p-4 text-neutral-800 shadow-sm rounded-lg bg-white w-full mt-5 overflow-hidden"
             style={{
                 borderRadius: "20px",
                 border: dark ? "1px solid #555" : "1px solid #E5E7EB",
                 backgroundColor: dark ? theme.colors.dark[6] : "#fff",
                 boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
             }}>

            {/* Edit Offer Modal */}
            <Modal
                opened={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setCurrentOffer(null);
                    setNewOfferImage(undefined);
                    setImageError(null);
                }}
                title={
                    currentOffer && fetchedOffers.some(offer => offer.id === currentOffer.id)
                        ? "Edit Offer"
                        : "Create New Offer"
                }
                size="lg"
            >
                {currentOffer && (
                    <div className="space-y-4">

                        <div className="p-6 rounded-lg max-w-xl w-full">

                            <div className="space-y-4">

                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-30 h-40"
                                        id="offer-image-upload"
                                        required
                                    />

                                    <label htmlFor="offer-image-upload" className="block relative cursor-pointer">
                                        {currentOffer.image ? (
                                            <img
                                                src={currentOffer.image instanceof File ? URL.createObjectURL(currentOffer.image) : currentOffer.image}
                                                alt="Upload preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div
                                                className="w-30 h-48 bg-gray-200 flex flex-col items-center justify-center rounded-lg">
                                                <ImageIcon className="w-12 h-12 text-gray-500"/>
                                                <span className="text-gray-500 mt-2">Upload Image *</span>
                                                <span className="text-gray-500 mt-2">Size(less than 1 mb)</span>
                                            </div>
                                        )}

                                        <div
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                            <Plus className="text-white w-8 h-8"/>
                                        </div>
                                    </label>
                                    {imageError && (
                                        <p className="text-red-500 text-sm mt-1">{imageError}</p>
                                    )}
                                </div>

                                {/* Title */}
                                <TextInput
                                    label="Title"
                                    placeholder="Enter offer title"
                                    value={currentOffer.title}
                                    name="title"
                                    onChange={handleInputChange}
                                    maxLength={50}
                                    required
                                />

                                {/* Description */}
                                <div>
                                    <Textarea
                                        placeholder="Enter the description"
                                        label="Description"
                                        maxLength={500}
                                        className="w-full rounded-md text-sm"
                                        value={currentOffer.description}
                                        name="description"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                {/* Offer Rule */}
                                {/*<div>*/}
                                {/*    <div className="flex items-center gap-1 mb-1">*/}
                                {/*        <label className="text-sm">Offer Rule</label>*/}
                                {/*        <span className="text-red-500">*</span>*/}
                                {/*    </div>*/}
                                {/*    <select className="w-full border border-gray-700 rounded-md p-2 text-sm">*/}
                                {/*        <option>Select type</option>*/}
                                {/*    </select>*/}
                                {/*</div>*/}

                                <Select
                                    label="Entity Services"
                                    placeholder="Select a service"
                                    onChange={(value) => handleDropdown(value)}
                                    // defaultValue={currentOffer?.entity_services[0].id}    original
                                    // defaultValue={isEditMode ? currentOffer?.entity_services[0].id : undefined}
                                    defaultValue={currentOffer.id ? currentOffer?.entity_services[0]?.id : undefined}
                                    value={currentOffer.id ? currentOffer?.entity_services[0]?.id : undefined}
                                    data={serviceValues}
                                    clearable={!currentOffer.id}

                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <TextInput
                                            type="number"
                                            value={currentOffer.discount}
                                            label="Discount"
                                            placeholder="Enter Discount Amount"
                                            name="discount"
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <Select
                                        label="Discount Type"
                                        name="discount_type"
                                        required
                                        data={[
                                            { value: 'Percentage', label: 'Percentage' },
                                            { value: 'Amount', label: 'Amount' },
                                        ]}
                                        value={currentOffer.discount_type}
                                        onChange={(value) =>
                                            handleInputChange({
                                                target: {
                                                    name: 'discount_type',
                                                    value: value || '',
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }
                                    />

                                </div>

                                {/* Discount Limit */}
                                <NumberInput
                                    label="Discount Limit"
                                    placeholder="Enter discount limit"
                                    name="discount_limit"
                                    required
                                    value={
                                        currentOffer.discount_limit === ''
                                            ? ''
                                            : Number(currentOffer.discount_limit) || 0
                                    }
                                    onChange={(value) =>
                                        handleInputChange({
                                            target: {
                                                name: 'discount_limit',
                                                value: value?.toString() || '',
                                            },
                                        } as React.ChangeEvent<HTMLInputElement>)
                                    }/>


                                {/* Quantity */}
                                <TextInput
                                    type="number"
                                    label="Quantity"
                                    placeholder="Enter quantity"
                                    name="quantity"
                                    value={currentOffer.quantity}
                                    onChange={handleInputChange}
                                    radius="md"
                                    required
                                />

                                {/* Offer Type and Promocode */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Offer Type"
                                        placeholder="eg: Gift Card/Voucher"
                                        name="offer_type"
                                        required
                                        data={offerTypeList}
                                        value={currentOffer.offer_type}
                                        onChange={(value) =>
                                            handleInputChange({
                                                target: {
                                                    name: 'offer_type',
                                                    value: value || '',
                                                },
                                            } as React.ChangeEvent<HTMLInputElement>)
                                        }
                                    />

                                    <div>
                                        <TextInput
                                            label="Code"
                                            placeholder="eg: NEWYEAR2024"
                                            value={currentOffer.code}
                                            name="code"
                                            onChange={handleInputChange}
                                        />

                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <DateTimePicker
                                            label="Start Date"
                                            value={startDate}
                                            onChange={setStartDate}
                                            withSeconds
                                            // minDate={today}
                                            placeholder="Pick a start date and time"
                                        />
                                    </div>
                                    <div>
                                        <DateTimePicker
                                            label="Offer End on"
                                            value={endDate}
                                            onChange={setEndDate}
                                            withSeconds
                                            placeholder="Pick an end date and time"
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <Select
                                    label="Country"
                                    placeholder="Select a country"
                                    name="country"
                                    required
                                    data={countryList?.map((item: any) => ({
                                        value: item.code,
                                        label: item.name,
                                    }))}
                                    value={currentOffer.country}
                                    onChange={(value) =>
                                        handleInputChange({
                                            target: {
                                                name: 'country',
                                                value: value || '',
                                            },
                                        } as React.ChangeEvent<HTMLInputElement>)
                                    }
                                />

                                <Select
                                    label="Offer Status"
                                    placeholder="Select offer status"
                                    value={currentOffer?.status || 'Active'}
                                    disabled
                                    onChange={(value) => {
                                        if (currentOffer) {
                                            setCurrentOffer({
                                                ...currentOffer,
                                                status: value as 'Active' | 'Inactive',
                                                is_active: value === 'Active'
                                            });
                                        }
                                    }
                                    }
                                    data={[
                                        {value: 'Active', label: 'Active'},
                                        {value: 'Inactive', label: 'Inactive'},
                                        // { value: 'Pending', label: 'Pending' }
                                    ]}

                                />

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        className="w-full px-4 py-2 mt-5 text-sm rounded-md"
                                        onClick={handleSaveOffer}
                                        leftIcon={<FiSave/>}
                                    >
                                        Save Offer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <div className="special-offers rounded-lg">
                <Group position="apart" align="center" mb="lg">
                    <Title order={2} color={isDark ? "gray.0" : "dark.8"}>
                        Offers ({fetchedOffers.length})
                    </Title>

                    <div className="flex space-x-2 ">
                        {isEditing && hasPermission && (
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
                                onClick={handleCreateOffer}
                            >
                                <FiPlus className="w-5 h-5"/>
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
                                    {isEditing ? <FiCheck className="w-5 h-5"/> : <FiEdit className="w-5 h-5"/>}
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
                                    className={`p-2 rounded text-gray-600  ${viewMode === 'grid' ? '' : ''}`}
                                >
                                    <CiGrid41 size={20}/>
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
                                    className={`p-2 rounded text-gray-600  ${viewMode === 'table' ? '' : ''}`}
                                >
                                    <BsTable size={20}/>
                                </Button>
                            </>
                        )}
                    </div>
                </Group>

                {fetchedOffers.length > 0 ? (
                    viewMode === 'grid' ? (
                        // Existing grid view code
                        <div className="relative flex items-center">
                            <button
                                onClick={handlePrevSlide}
                                className={`absolute left-0 z-10 bg-white rounded-full shadow-md p-2 cursor-pointer hover:bg-gray-100 ${
                                    windowWidth <= 640 ? 'transform -translate-x-2' : ''
                                }`}
                            >
                                <FiChevronLeft size={24}/>
                            </button>
                            <button
                                onClick={handleNextSlide}
                                className={`absolute right-0 z-10 bg-white rounded-full shadow-md p-2 cursor-pointer hover:bg-gray-100 ${windowWidth <= 640 ? 'transform translate-x-2' : ''}`}
                            >
                                <FiChevronRight size={24}/>
                            </button>

                            <div className={`flex space-x-4 w-full overflow-hidden ${getContainerPadding()}`}>
                                {getVisibleOffers().map((offer, index) => {
                                    const cardStyles =fetchedOffers.length === 1
                                        ? {flex: '0 0 auto'} // Let Tailwind handle width for single offer
                                        : getCardWidth(index); // Use existing logic for multiple offers
                                    return (
                                        <div
                                            key={offer.uniqueKey}
                                            className={`rounded-lg border overflow-hidden flex flex-col
                                            ${isDark ? 'bg-dark-7 border-dark-4 text-[white]' : 'bg-white border-gray-100 text-gray-900'}
                                            ${fetchedOffers.length === 1 ? 'w-full md:w-1/2 mx-auto' : 'w-full'}`}
                                            style={cardStyles}
                                        >
                                            <div className="relative">
                                                {isEditing && (
                                                    <div className="absolute top-3 right-2 z-10 flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditOffer(offer)}
                                                            className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                        >
                                                            {hasPermission && (
                                                                <FiEdit size={16}/>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOffer(offer.id)}
                                                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                        >
                                                            <FiTrash2 size={16}/>
                                                        </button>
                                                    </div>
                                                )}
                                                {/*<img*/}
                                                {/*    src={typeof offer.image === 'string' ? offer.image : ''}*/}
                                                {/*    alt={offer.title}*/}
                                                {/*    className="w-full h-48 object-cover"*/}
                                                {/*/>*/}
                                                {offer.image ? (
                                                    <img
                                                        src={typeof offer.image === 'string' ? offer.image : '' }
                                                        alt={offer.title}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={"/images/placeholder/taskPlaceholder.png"}
                                                        alt={offer.title}
                                                        className="w-full h-48 object-contain"
                                                    />
                                                )}
                                                <span
                                                    className={`absolute bottom-2 right-0 px-4 py-1 mr-2  text-sm text-white rounded-full ${offer.is_active === true ? 'bg-green-500' : 'bg-red-500'}`}
                                                >
                                             {offer.is_active ? "Active" : "Inactive"}
                                            </span>
                                            </div>

                                            <div
                                                className={`p-4 flex-1 space-y-2 ${isDark ? 'text-[#E5E7EB]' : 'text-gray-900'}`}>
                                                <h3 className="text-lg font-medium mb-2 break-words line-clamp-2">{offer.title}</h3>
                                                {expandedOffers.includes(offer.id) && (
                                                    <p className={`text-sm mt-2 ${isDark ? 'text-[#E5E7EB]' : 'text-gray-500'}`}>{offer.description}</p>
                                                )}
                                            </div>
                                            <div className="text-sm h-24 p-4">
                                                <div className="mt-6 mb-1">
                                                        <span className="text-[1.5rem] font-bold text-[#3EAEFF]">
                                                            {formatDiscount(offer.discount, offer.discount_type)}
                                                        </span>
                                                </div>
                                                <button
                                                    className={`hover:underline ${isDark ? 'text-[#E5E7EB]' : 'text-[#3D3F7D]'}`}
                                                    // onClick={() => toggleDescription(offer.id)}
                                                    onClick={() => handleOpenModal(offer.id)}
                                                >
                                                    {expandedOffers.includes(offer.id) ? 'Show less' : 'View details > '}
                                                </button>
                                                <span className="float-end px-2 text-xs bg-[#FFDFA6] mr-2 rounded"
                                                      style={{color: '#3D3F7D'}}
                                                >
                                                      {/*{offer.code || 'CODE'}*/}
                                                    {offer.code || ''}
                                                </span>
                                            </div>
                                            {isModalOpen && (
                                                <div
                                                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50">
                                                    <div ref={modalRef} style={{
                                                        background: dark ? theme.colors.dark[6] : "#fff",
                                                        color: "gray"
                                                    }}
                                                         className="bg-white rounded-lg shadow-lg w-11/12 sm:w-3/5 md:w-2/5 lg:w-1/2 xl:w-2/5 overflow-y-auto p-6 max-h-[90vh]">
                                                        {/* Modal Header */}
                                                        <div
                                                            className="flex justify-between items-center border-b pb-2 mb-4">
                                                            <h2 className="text-xl font-bold">Service Offer Details</h2>
                                                            <button
                                                                className="text-gray-500 hover:text-gray-700"
                                                                onClick={handleCloseModal}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        {/* Modal Content */}
                                                        <div className="space-y-6">
                                                            {/* Header Section */}
                                                            <div className="flex items-center gap-4">
                                                                {viewOffer?.image ? (
                                                                    <img
                                                                        src={
                                                                            viewOffer?.image instanceof File
                                                                                ? URL.createObjectURL(viewOffer.image)
                                                                                : viewOffer.image
                                                                        }
                                                                        alt="Offer Image"
                                                                        className="w-full h-48 object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="w-full h-48 bg-gray-200 flex flex-col items-center justify-center rounded-lg">
                                                                        <ImageIcon className="flex items-center gap-4"/>
                                                                        <span className="text-gray-500 mt-2">No Image Uploaded</span>
                                                                    </div>
                                                                )}

                                                            </div>
                                                            <h3 className="font-semibold text-base sm:text-lg">{viewOffer?.title || "No Title available"}</h3>
                                                            {/* Offer Details */}
                                                            <div>
                                                                <h4 className="font-semibold text-lg text-gray-400">Offer
                                                                    Details:</h4>
                                                                <div
                                                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                                                    <div>
                                                                        <span className="text-gray-500">Offer Starts Date:</span>
                                                                        <p className="text-green-500">{startDate ? dayjs(startDate).format('YYYY-MM-DD hh:mm A') : 'No start date selected'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-gray-500">Offer Ends On:</span>
                                                                        <p className="text-red-500">{endDate ? dayjs(endDate).format('YYYY-MM-DD hh:mm A') : 'No end date selected'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-gray-500">Offer Type:</span>
                                                                        <p>{viewOffer?.offer_type || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Offer Rule Section */}
                                                            <div>
                                                                {/*<h4 className="font-semibold text-lg">Offer Rule:</h4>*/}
                                                                <div
                                                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                                                    <div>
                                                                        <span className="text-gray-500">Discount:</span>
                                                                        <p>{viewOffer?.discount || "N/A"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-gray-500">Discount Type:</span>
                                                                        <p>{viewOffer?.discount_type || "N/A"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-gray-500">Discount Limit:</span>
                                                                        <p>{viewOffer?.discount_limit || "N/A"}</p>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                                                    <div>
                                                                        <span className="text-gray-500">Quantity:</span>
                                                                        <p>{viewOffer?.quantity || "N/A"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="text-gray-500">Offer Code</span>
                                                                        <p>{viewOffer?.code || "N/A"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500">Country</span>
                                                                        <p>{viewOffer?.country?.name || "N/A"}</p>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                                                    <div>
                                                                        <span
                                                                            className="text-gray-500">Offer Status</span>
                                                                        <p>{viewOffer?.status || "Active"}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <span className=" text-gray-500">Description</span>
                                                                    <p>{viewOffer?.description || "N/A"}</p>
                                                                </div>
                                                            </div>

                                                            {/* Related Services Section */}
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-700">Entity
                                                                    Services</label>
                                                                {/*<p>{entityServiceOptions.find((item) => item.value === viewOffer?.entity_services[0]?.id)?.label || "N/A"}</p>*/}
                                                                <p>{serviceValues.find((item) => item.value === viewOffer?.entity_services[0]?.id)?.label || "N/A"}</p>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        // New table view
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input type="checkbox"
                                               className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    {/*<th scope="col"*/}
                                    {/*    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
                                    {/*    Status*/}
                                    {/*</th>*/}
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className={`${isDark ? 'bg-gray-900' : 'bg-white'} divide-y divide-gray-200`}>
                                {fetchedOffers.map((offer) => (
                                    <tr key={offer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="checkbox"
                                                   className="rounded border-gray-300"/>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                        src={typeof offer.image === 'string' ? offer.image : ''}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div
                                                        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                                        {offer.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {offer.description?.length > 50
                                                    ? `${offer.description.substring(0, 50)}...`
                                                    : offer.description}
                                            </div>
                                        </td>
                                        {/*        <td className="px-6 py-4 whitespace-nowrap">*/}
                                        {/*<span className={`px-3 py-1 text-xs rounded-full ${*/}
                                        {/*    offer.is_active === true*/}
                                        {/*        ? 'bg-green-100 text-green-800'*/}
                                        {/*        : offer.is_active === false*/}
                                        {/*            ? 'bg-red-100 text-red-800'*/}
                                        {/*            : 'bg-orange-100 text-orange-800'*/}
                                        {/*}`}>*/}
                                        {/*    {offer.is_active || 'Active'}*/}
                                        {/*</span>*/}
                                        {/*        </td>*/}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                            {formatDiscount(offer.discount, offer.discount_type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs bg-[#FFDFA6] rounded text-[#3D3F7D]">
                                    {offer.code || 'CODE'}
                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isEditing && (
                                                <div className="flex space-x-2 justify-end">
                                                    <button
                                                        onClick={() => handleEditOffer(offer)}
                                                        className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                    >
                                                        {hasPermission && (
                                                            <FiEdit size={16}/>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOffer(offer.id)}
                                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <FiTrash2 size={16}/>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    // if there is no offer
                    <div
                        style={{
                            backgroundColor: dark ? theme.colors.dark[6] : "#fff",
                            color: dark ? "gray" : "",
                            borderRadius: "10px",
                        }}
                        className="border p-4 flex flex-col sm:flex-row items-center w-full justify-between bg-white gap-4 max-w-full mx-auto"
                    >
                        {/* Empty state content */}
                        <div className="flex items-center space-x-4 w-full">
                            <div
                                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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
                                    <h3 className="font-medium text-base sm:text-lg">No Offers Available</h3>
                                ) : (
                                    <h3 className="font-medium text-base sm:text-lg">No Offers were found</h3>
                                )}
                                {hasPermission ? (
                                    <div className="text-sm text-gray-500 mt-1">
                                        Add Offer for your services & reach out more clients.
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 mt-1">
                                        Offers were not added by this service provider.
                                    </div>
                                )}
                            </div>
                        </div>
                        {hasPermission && (
                            <Button
                                onClick={handleCreateOffer}
                                variant="outline"
                                style={{ borderRadius: "5px" }}
                                className="w-full sm:w-auto min-w-[200px] max-w-[200px] px-3 py-2 text-sm sm:text-base"
                            >
                                Add New Offer
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecialOffers;
