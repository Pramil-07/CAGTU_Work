import type {MantineNumberSize} from "@mantine/core";
import {FileInput, NumberInput, Switch, TextInput, Tooltip, MultiSelect, Badge} from "@mantine/core";
import {Alert} from "@mantine/core";
import {FocusTrap} from "@mantine/core";
import {LoadingOverlay} from "@mantine/core";
import {Button} from "@mantine/core";
import {Flex} from "@mantine/core";
import {
    Box,
    Checkbox,
    Grid,
    Radio,
    Text,
    Title,
    useMantineTheme,
} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {IconCalendarEvent, IconClock, IconMap2, IconPlus} from "@tabler/icons-react";
import {IconAlertCircle} from "@tabler/icons-react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {format, parseISO} from "date-fns";
import {Form, Formik} from "formik";
import {debounce} from "lodash";
import _ from "lodash";
import Link from "next/link";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";

import DateField from "@/components/common/form/DateField";
import DescriptionField from "@/components/common/form/DescriptionField";
import FormButton from "@/components/common/form/FormButton";
import InputField from "@/components/common/form/InputField";
import {ListField} from "@/components/common/form/ListField";
import MultiFileDropzone from "@/components/common/form/MultiFileDropzone";
import NumberField from "@/components/common/form/NumberField";
import SelectField from "@/components/common/form/SelectField";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {toast} from "@/components/common/Toast";
import Layout from "@/components/Layout/Layout";
import {budgetType} from "@/constants/BudgetType";
import {TIME_INTERVAL} from "@/constants/minutesData";
import urls from "@/constants/urls";
import {useCategoryOptions} from "@/hooks/useCategoryOptions";
import {useCityOption} from "@/hooks/useCityOptions";
import {useCurrencyOption} from "@/hooks/useCurrencyOptions";
import {useFileStore} from "@/hooks/useFileStore";
import {usePostEntityService} from "@/hooks/usePostEntityService";
import type { ProductData, Variant} from "@/hooks/usePostProduct";
import {optionType, usePostProduct} from "@/hooks/usePostProduct";
import type {EntityServiceDetailProps} from "@/types/EntityServiceDetailProps";
import type {PostTaskPayloadProps} from "@/types/PostTaskPayload";
import {axiosClient} from "@/utils/axiosClient";
import {
    getPayableAmount,
    getReceivableAmount,
    scrollToElement,
} from "@/utils/helpers";
import NProgress from "nprogress";
import {useShopOptions} from "@/hooks/useShopOptions";
import Map from "@/components/common/Map";
import {Circle, MarkerF, OverlayViewF} from "@react-google-maps/api";
import {useAppDispatch, useAppSelector} from "@/hooks";

import {useGeocoding} from "@/hooks/useGeocoding";
import * as Yup from "yup";

import type {LocationProps} from "@/types/LocationProps";
import {PlacesAutocomplete} from "@/components/common/form/PlacesAutoComplete";
import {CityTypes} from "@/types/CityTypes";
import {modals} from "@mantine/modals";
import type {NestedCategoryProps} from "@/types/NestedCategoryProps";
import Select from "@mui/material/Select";
import { useServiceOption } from "@/hooks/useServiceOptions";
import NestedCategorySelect from "@/components/NestedCategorySelect/NestedCategorySelect";

enum Status {
    Published = "published",
    Draft = "draft",
}

enum ProductStatus {
    General = "General",
    Sale = "Sale",
    Featured = "Featured",
    HotDeals = "Hot Deals"
}
export enum Size {
    small = "SM",
    medium = "MD",
    large = "LG",
    extraLarge = "XL",
    doubleExtraLarge = "XXL"
  }
  export enum Color {
    black = "Black",
    white = "White",
    red = "Red",
    blue = "Blue",
    green = "Green",
    yellow = "Yellow",
    orange = "Orange",
    purple = "Purple",
    gray = "Gray",
    brown = "Brown"
  }
export type SelectOption = {
    value: string;
    label: string;
    ancestors?: string[];
    fontWeight?: 'bold' | 'normal';
}
// const facilitiesOptions = [
//     "Free WiFi",
//     "Non-smoking rooms",
//     "Fitness centre",
//     "Private parking",
//     "Family rooms",
//     "Restaurant",
//     "Room service",
//     "Tea/coffee maker in all rooms",
//     "Bar",
//     "Very good breakfast",
//     "Swimming pool",
//     "Spa & wellness centre",
//     "Airport shuttle",
//     "24-hour front desk",
//     "Pets allowed",
//     "Elevator",
//     "Air conditioning",
//     "Free parking",
//     "Laundry service",
//     "Business centre",
//     "Conference facilities",
//     "Valet parking",
//     "Concierge service",
//     "Tour desk",
//     "Luggage storage",
//     "Currency exchange",
//     "Gift shop",
//     "Safe deposit box",
//     "Babysitting/child services",
//     "Children's playground",
//     "Soundproof rooms",
//     "Terrace",
//     "Garden",
//     "Sun deck",
//     "Outdoor furniture",
//     "Picnic area"
// ];

const flattenCategoriesForSelect = (
    categories: NestedCategoryProps[],
    level?:number,
    ancestors: string[] = []
): SelectOption[] => {
    let options: SelectOption[] = [];

    categories.forEach((category) => {
        options.push({
            value: category.id.toString(),
            label: `${'-> '.repeat(level||0)}${category.name}`,
            fontWeight: level === 0 ? 'bold' : 'normal',
            ancestors: [...ancestors],
        });

        if (category.child && category.child.length > 0) {
            options = options.concat(
                flattenCategoriesForSelect(category.child, (level||0) + 1, [...ancestors, category.id.toString()])
            );
        }
    });

    return options;
};


const Entity = () => {
    const theme = useMantineTheme();
    const queryClient = useQueryClient();
    const router = useRouter();
    const mediumScreen = useMediaQuery("(max-width: 1023px)");
    const mediumScreen1 = useMediaQuery("(max-width: 1500px) and (min-width: 1200px)");
    const [openMap, setOpenMap] = useState(false);
    const [onChangeLocation, setChangeLocation] = useState(false);
    const [shouldNavigate , setShouldNavigate] = useState(false);
    const [categoryNested, setCategoryNested] = useState<NestedCategoryProps[]>( [])
    const formikRef = useRef<any>(null);
    const dirtyRef = useRef(false);
    const pendingNavigationRef = useRef<string | null>(null);
    const dispatch = useAppDispatch();
    const[error,setError]=useState("")
    // console.log("navigate",shouldNavigate)
    const id = router.query.id as string;

    const is_requested: boolean | string =
        router.query.is_requested === "true" ? true :
            router.query.type === "product" ? "product" :
                false;


    const {data: locations, radius} = useAppSelector(
        (state) => state.locationReducer
    );


    // To assign max file number of Images and videos
    const MaxImages = 5;
    const MaxVideos = 1;
    const NavigationCancelled = "Navigation cancelled to show unsaved changes modal";

    const {category: queryCategory, shop_name: queryShopName} = router.query;
    const {data: shopOptions = [], isLoading: shopOptionsLoading} = useShopOptions();


    const {data: editData, isLoading: editLoading} = useQuery(
        ["entity-detail", id],
        async () => {
            try {
                const endpoint = is_requested === "product" ? `/product/${id}` : `${urls.entity.list}${id}/`;
                const {data} = await axiosClient.get<EntityServiceDetailProps | any>(endpoint);
                return data;
            } catch (error) {
                console.log(
                    "� ~ file: [id].tsx:20 ~ const{data}=useQuery ~ error",
                    error
                );
            }
        },
        {enabled: !!id}
    );
    console.log( "editData", editData);


    const {
        title,
        description,
        budget_from,
        budget_to,
        payable_from,
        payable_to,
        budget_type,
        is_online,
        is_range,
        end_date,
        end_time,
        start_date,
        start_time,
        highlights,
        currency,
        city,
        location,
        images,
        videos,
        is_negotiable,
        service,
        extra_data,
        status_choice,
        // Product-specific fields
        name,
        cost_price,
        price,
        discount_per,
        stock_quantity,
        local_currency_details,
        SKU,
        key_feature,
        product_status,
        rating,
        option_type,
        variants,
        is_active: is_active_product,
        allow_multiple_variants,
        category_details,
    } = editData ?? ({} as ProductData);
    console.log("key_feature ", key_feature)

    const [maplocation, setMapLocation] = useState<{
        selected?: string,
        lat: LocationProps["data"]["latitude"];
        lng: LocationProps["data"]["longitude"];
    }>({
        selected: '',
        lat: null,
        lng: null,
    });
    // console.log("edit lat lang", maplocation.selected);
const [postClicked,setPostClicked] = useState<boolean>(false)
const isMobile = useMediaQuery('(max-width:450px)')
    // console.log('onchange maplocation', maplocation.selected)


    const {data} = useGeocoding(
        onChangeLocation ? `${maplocation.lat},${maplocation.lng}` : null
    );
   const initialvalue = editData?.location
        ?? editData?.extra_data?.[0]?.selectedValue
        ?? (onChangeLocation ? data : location)
        ?? '';
    // console.log("onchange initial value", initialvalue);
       useEffect(() => {
      const form = formikRef.current;
      if (!form) return;
      const extra = [{
        selectedValue: maplocation.selected ?? '',
        latitude: maplocation.lat ?? null,
        longitude: maplocation.lng ?? null,
      }];
      // update Formik without triggering validation
      form.setFieldValue('extra_data', extra, false);
      form.setFieldValue('location', maplocation.selected ?? '', false);
    }, [maplocation]);

    useEffect(() => {
        if (editData) {
            const ext = editData.extra_data && editData.extra_data.length ? editData.extra_data[0] : null;
            const sel = ext?.selectedValue ?? editData.location ?? null;
            const lat = ext?.latitude ?? null;
            const lng = ext?.longitude ?? null;

            if (sel || (lat !== null && lng !== null)) {
                setMapLocation({
                    selected: sel ?? '',
                    lat: lat ?? null,
                    lng: lng ?? null,
                });

                // Open the map only if we have coordinates (keeps behavior consistent)
                if (lat !== null && lng !== null) {
                    setOpenMap(true);
                }
            }
        }
    }, [editData]);
     useEffect(() => {
      const checkFormikExtraData = () => {
        const form = formikRef.current;
        if (!form) return;
        const { errors: e, touched: t, values: v } = form;
        const hasExtraDataError = !!(t?.extra_data && e?.extra_data);
        console.log('Formik extra_data state (outer effect):', {
          hasExtraDataError,
          touchedExtra: t?.extra_data,
          extraErrorMsg: e?.extra_data,
          selectedValue: v?.extra_data?.[0]?.selectedValue,
          coords: `${v?.extra_data?.[0]?.latitude ?? ''}, ${v?.extra_data?.[0]?.longitude ?? ''}`,
        });
      };

      // Polling keeps this logic outside Formik render prop (no hooks inside callbacks)
      const intervalId = setInterval(checkFormikExtraData, 300);
      checkFormikExtraData();
      return () => clearInterval(intervalId);
    }, []);
      useEffect(() => {
      const form = formikRef.current;
      if (!form) return;

      // If status is not published, clear any lingering address errors/touched so error doesn't show immediately
      if (form.values?.status_choice !== Status.Published) {
        // remove error and touched for extra_data and location
        if (form.errors?.extra_data) form.setFieldError('extra_data', undefined);
        if (form.errors?.location) form.setFieldError('location', undefined);
        if (form.touched?.extra_data) form.setFieldTouched('extra_data', false, false);
        if (form.touched?.location) form.setFieldTouched('location', false, false);
      }
      // run when editData or maplocation change so edits don't re-trigger immediate validation
    }, [editData, maplocation, id]);
console.log("status_choice", status_choice)
    useEffect(() => {

        if (id) {
            setOpenMap(!openMap);

        }
    }, [id]);
    console.log("Initial category value:", {
        is_requested,
        category_details: category_details,
        service_category: service?.category,
        queryCategory
    });
    useEffect(() => {
        const fetchCategories = async () => {

            try {

                const { data } = await axiosClient.get(urls.category.nested);
                setCategoryNested(data);

            } catch (err) {
                setError("Unable to load categories");
                console.error(err);
            }
        };

    fetchCategories()

    }, []);

    const {data: generalCategoryOptions = []} = useCategoryOptions();
    const {data: productCategoryOptions = [], isLoading: productCategoryLoading} = useQuery(
        ["product-categories"],
        async () => {
            const {data} = await axiosClient.get("/product/list-category/");
            return data.map((category: any) => ({
                value: category.id.toString(),
                label: category.name
            }));
        },
        {
            enabled: is_requested === "product",
            initialData: category_details?.id ? [{

                value: category_details.id.toString(),
                label: category_details.name
            }] : []
        }
    );
    console.log("flattend categories",categoryNested)
    console.log("category_details", editData?.service?.category, category_details);
    console.log("productCategoryOptions", productCategoryOptions);
    console.log("generalCategoryOptions", generalCategoryOptions);
    const categoryOptions = is_requested === "product" ? productCategoryOptions :flattenCategoriesForSelect(categoryNested) ;
    const [categoryFilter, setCategoryFilter] = useState<string | null>(
        service?.category?.id ? service?.category?.id.toString() :
            category_details?.id ? category_details.id.toString() : null
    );

    const {mutate: mutateProduct, isLoading: isLoadingProduct} = usePostProduct();

    const {
        data: serviceOptions = [
            {
                id: service?.id,
                label: service?.title,
                value: service?.id?.toString(),
                commission: service?.commission,
            },
        ],
    } = useServiceOption(categoryFilter, false);


    const serviceCommisionVal = serviceOptions.filter((val) => val?.id === service?.id);
    const [serviceCommission, setServiceCommission] = useState<string>(
        serviceCommisionVal[0]?.commission
    );


    // Reduced productFormData to only fields not managed by Formik
    const [productFormData, setProductFormData] = useState<{
        SKU: string;
        product_status: string | undefined;
        product_option: optionType
        rating: number;
        images: any[];
        variants: Variant[];
        shop?: string;
        key_feature?:string[] ;
    }>({
        SKU: SKU || "",
        product_status: product_status || undefined,
        product_option: optionType.none,
        rating: rating || 1,
        images: images || [],
        key_feature:key_feature,
        variants: editData?.variant_details?.map((v: Variant) => ({
            id: v.id ?? undefined,
            SKU: v.SKU || generateSKU(editData?.name),
            size: v.size || null,
            color: v.color || null,
            label: v.label || `${editData?.name || ""} - ${v.color || "No Color"} / ${v.size || "No Size"}`,
            price: v.price ? parseFloat(v.price) : null,
            stock_quantity: v.stock_quantity ?? 0,
            qr_code: v.qr_code || `QR-${v.SKU || generateSKU(editData?.name)}`,
            images: v.images || [],
        })) || [],
        shop: editData?.shop?.id || undefined
    });
    console.log( "productFormData", productFormData);

    const handleProductChange = (
        name: keyof typeof productFormData | "size" | "color" | "variantImages" | "addVariant" | "deleteVariant" | "key_feature",
        value: any,
        variantIndex?: number,
        formikValues?: any
    ) => {
        setProductFormData((prev) => {
            const variants = prev.variants || [];
              if (name === "images") {
            // Also update Formik if available
            if (formikValues?.setFieldValue) {
                formikValues.setFieldValue("images", value);
                formikValues.setFieldValue("imagePreviewUrl", value);
            }
            return {
                ...prev,
                images: value,
            };
        }

            if (name === "product_option") {
                if (value !== optionType.none && variants.length === 0) {
                    const newVariant: Variant = {
                        id: undefined,
                        SKU: generateSKU(formikValues?.title),
                        size: null,
                        color: null,
                        label: `${formikValues?.title || "Product"} - No Color / No Size`,
                        price: null,
                        stock_quantity: 0,
                        qr_code: `QR-${generateSKU(formikValues?.title)}`,
                        images: [],
                    };
                    return {
                        ...prev,
                        product_option: value,
                        variants: [newVariant],
                    };
                }
                return {
                    ...prev,
                    product_option: value,
                    variants: value === optionType.none ? [] : variants,
                };
            } else if (name === "addVariant") {
                const newVariant: Variant = {
                    id: undefined,
                    SKU: generateSKU(formikValues?.title),
                    size: null,
                    color: null,
                    label: `${formikValues?.title || "Product"} - No Color / No Size`,
                    price: null,
                    stock_quantity: 0,
                    qr_code: `QR-${generateSKU(formikValues?.title)}`,
                    images: [],
                };
                return {
                    ...prev,
                    variants: [...variants, newVariant],
                };
            } else if (name === "deleteVariant" && variantIndex !== undefined) {
                const variant = variants[variantIndex];
                if (variant?.id) {
                    axiosClient
                        .delete(`/product/varient/${variant.id}`)
                        .catch((error) => {
                            // console.error("Failed to delete variant:", error);
                            toast.error("Failed to delete variant");
                        });
                }
                const updatedVariants = variants.filter((_, index) => index !== variantIndex);
                return {
                    ...prev,
                    variants: updatedVariants,
                    product_option: updatedVariants.length === 0 ? optionType.none : prev.product_option,
                };
            } else if (name === "size" || name === "color" || name === "variantImages") {
                if (variantIndex === undefined) return prev;
                const updatedVariants = [...variants];
                const currentVariant = updatedVariants[variantIndex] || {
                    id: undefined,
                    SKU: generateSKU(),
                    size: null,
                    color: null,
                    label: null,
                    price: null,
                    stock_quantity: 0,
                    qr_code: "",
                    images: [],
                };

                if (name === "variantImages") {
                    updatedVariants[variantIndex] = {
                        ...currentVariant,
                        images: value,
                    };
                } else {
                    // Handle empty string as null
                    const newValue = value.trim() === "" ? null : value;
                    updatedVariants[variantIndex] = {
                        ...currentVariant,
                        [name]: newValue,
                        label: `${formikValues?.title || "Product"} - ${name === "size" ? newValue || "No Size" : currentVariant.size || "No Size"} / ${name === "color" ? newValue || "No Color" : currentVariant.color || "No Color"}`,
                    };
                }
                return {
                    ...prev,
                    variants: updatedVariants,
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };
    // console.log("first",title)

    const productStatusOptions = Object.values(ProductStatus).map(status => ({
        value: status,
        label: status
    }));
    const productOptions = Object.values(optionType).map(status => ({
        value: status,
        label: status.toLowerCase().replace('_', ' and  ')
    }));
    const productSize = Object.values(Size).map(status => ({
        value: status,
        label: status.toLowerCase().replace('_', ' and  ')
    }));
    const productColor = Object.values(Color).map(status => ({
        value: status,
        label: status.toLowerCase().replace('_', ' and  ')
    }));

// Status options for tasks and services
const statusOptions = Object.values(Status).map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1)
}));

const showUnsavedChangesModal = (onConfirm: () => void) => {
    modals.openConfirmModal({
        title: "Unsaved Changes",
        children: (
            <div>
                <p>You have unsaved changes that will be lost if you decide to continue.</p>
                <p style={{ color: theme.colors.brand[4] }}>
                    Are you sure you want to leave this page?
                </p>
            </div>
        ),
        labels: { confirm: "Leave this page", cancel: "Stay on this page" },
        confirmProps: { color: theme.colors.red[6] },
        onCancel: () => {
            // Reset navigation state when user cancels
            setShouldNavigate(false);
            pendingNavigationRef.current = null;
            console.log("User cancelled navigation");
        },
        onConfirm: () => {
            console.log("User confirmed navigation");
            onConfirm();
        },
        closeOnClickOutside: false, // Prevent closing by clicking outside
        closeOnEscape: false, // Prevent closing with Escape key
    });
};

    useEffect(() => {
        const interval = setInterval(() => {
            if (formikRef.current) {
                dirtyRef.current = formikRef.current.dirty;
            }
        });
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        console.log("Attaching navigation listeners");
        // Store the current URL to restore if navigation is cancelled
        const currentPath = router.asPath;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            console.log("beforeunload triggered, dirtyRef.current:", dirtyRef.current, "shouldNavigate:", shouldNavigate);
            if (dirtyRef.current && !shouldNavigate) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

     const handleRouteChangeStart = (url: string) => {
        console.log("routeChangeStart triggered, url:", url, "dirtyRef.current:", dirtyRef.current, "shouldNavigate:", shouldNavigate);
        if (dirtyRef.current && !shouldNavigate) {
            NProgress.done(); // Clear any existing progress bar
            pendingNavigationRef.current = url; // Store the target URL
            
            showUnsavedChangesModal(() => {
                console.log("Modal confirmed, navigating to:", url);
                setShouldNavigate(true);
                // Use setTimeout to ensure state is updated before navigation
                setTimeout(() => {
                    router.push(url);
                }, 0);
            });
            
            // Throw error to prevent navigation
            router.events.emit('routeChangeError');
            throw new Error(NavigationCancelled);
        }
        NProgress.start();
    };
   const handleRouteChangeComplete = () => {
            console.log("Route change complete, resetting shouldNavigate");
            setShouldNavigate(false);
            pendingNavigationRef.current = null;
            NProgress.done();
        };

     const handleRouteChangeError = (err: any, url: string) => {
    console.log("Route change error, url:", url, "error:", err.message);
    if (err.message === NavigationCancelled || err.cancelled) {
        NProgress.done();
        // Restore the current URL
        if (window.location.pathname !== currentPath) {
            window.history.pushState(null, "", currentPath);
        }
    } else {
        setShouldNavigate(false);
        pendingNavigationRef.current = null;
        NProgress.done();
    }
};

        const handlePopState = (e: PopStateEvent) => {
            console.log("popstate triggered, dirtyRef.current:", dirtyRef.current, "shouldNavigate:", shouldNavigate);
            if (dirtyRef.current && !shouldNavigate) {
                // Prevent navigation by pushing the current state back
                window.history.pushState(null, "", currentPath);
                showUnsavedChangesModal(() => {
                    console.log("Modal confirmed, navigating back");
                    setShouldNavigate(true);
                    pendingNavigationRef.current = null;
                    NProgress.start();
                    router.back();
                });
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);
        router.events.on("routeChangeStart", handleRouteChangeStart);
        router.events.on("routeChangeComplete", handleRouteChangeComplete);
        router.events.on("routeChangeError", handleRouteChangeError);

        return () => {
            console.log("Cleaning up navigation listeners");
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
            router.events.off("routeChangeStart", handleRouteChangeStart);
            router.events.off("routeChangeComplete", handleRouteChangeComplete);
            router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [router, shouldNavigate, showUnsavedChangesModal]);

    useEffect(() => {
        if (formikRef.current) {
            console.log("Updating dirtyRef, Formik dirty:", formikRef.current.dirty);
            dirtyRef.current = formikRef.current.dirty;
        }
    }, [formikRef.current?.dirty]);

    useEffect(() => {
        setServiceCommission(serviceOptions[0]?.commission);
    }, [serviceCommisionVal]);

 useEffect(() => {
    if (is_requested === "product" && editData) {
        const mappedImages = editData.images?.map((img: any) => {
            if (typeof img === 'string') {
                return {
                    id: null,
                    src: img,
                    file: { name: img.split('/').pop(), size: 0, type: 'image/*' }
                };
            }
            return img;
        }) || [];

        const mappedVariants = editData.variant_details?.map((v: Variant) => ({
            id: v.id ?? undefined,
            SKU: v.SKU || generateSKU(editData.name),
            size: v.size || null,
            color: v.color || null,
            label: v.label || `${editData.name || ""} - ${v.color || "No Color"} / ${v.size || "No Size"}`,
            price: v.price ? parseFloat(v.price) : null,
            stock_quantity: v.stock_quantity ?? 0,
            qr_code: v.qr_code || `QR-${v.SKU || generateSKU(editData.name)}`,
            images: v.images || [],
        })) || [];

        setProductFormData({
            SKU: editData.SKU || generateSKU(editData.name),
            product_status: editData.product_status || undefined,
            product_option: editData.option_type || optionType.none,
            rating: editData.rating || 1,
            images: mappedImages,
            shop: editData.shop?.id || undefined,
            key_feature: editData.key_feature,
            variants: mappedVariants,
        });

        // Also update Formik values for images
        if (formikRef.current) {
            formikRef.current.setFieldValue("images", mappedImages);
            formikRef.current.setFieldValue("imagePreviewUrl", mappedImages);
            formikRef.current.setFieldValue("key_feature", Array.isArray(editData.key_feature) ? editData.key_feature : (editData.key_feature ? [editData.key_feature] : []));
        }
    }
}, [editData, is_requested]);
        // console.log("productFormData.key_feature after set:", Array.isArray(editData.key_feature) ? editData.key_feature : editData.key_feature ? [editData.key_feature] : []);key_feature: key_feature || [],

    const {data: currencyOption = []} = useCurrencyOption();
    const {mutateAsync: uploadFileMutation, isLoading: uploadFileLoading} = useFileStore();
    const {mutate, isLoading} = usePostEntityService(is_requested === true);

// ...existing code...
    const handleSaveDraft = async () => {
      const form = formikRef.current;
      if (!form) {
        toast.error("Form not ready");
        return;
      }

      const values = form.values as any;

      // Validate title only
      if (!values?.title || !values.title.trim()) {
        form.setTouched({ title: true });
        scrollToElement("title", "smooth");
        toast.error("Please enter a title before saving as draft");
        return;
      }

      try {
        NProgress.start();
        form.setSubmitting(true);

        // upload images if any new ones exist (re-using uploadFileMutation from component scope)
            let newUploadImageID: number[] = [];
        if (values.images?.some((val: any) => val?.path)) {
          newUploadImageID = await uploadFileMutation({
            files: values.images.filter((val: any) => val?.path),
            media_type: "image",
          });
        }

        let newUploadVideoID: number[] = [];
        if (values.videos?.some((val: any) => val?.path)) {
          newUploadVideoID = await uploadFileMutation({
            files: values.videos.filter((val: any) => val?.path),
            media_type: "video",
          });
        }

        const imageIds = (values.images || []).filter((val: any) => !val?.path).map((v: any) => v.id) || [];
        const videoIds = (values.videos || []).filter((val: any) => !val?.path).map((v: any) => v.id) || [];
        const imagesIds = [...imageIds, ...newUploadImageID];
        const videosIds = [...videoIds, ...newUploadVideoID];

        const postTaskPayload = {
          ...values,
          images: imagesIds,
          videos: videosIds,
          city: values.city ? parseInt(values.city) : undefined,
          is_online: values.is_online === "false" ? false : true,
          budget_from: values.budget_choose === "variable" ? values.budget_from : null,
          is_range: values.budget_choose === "variable" ? true : false,
          start_date: values.start_date ? format(new Date(String(values.start_date)), "yyyy-MM-dd") : null,
          end_date: values.end_date ? format(new Date(String(values.end_date)), "yyyy-MM-dd") : null,
          status_choice: Status.Draft,
          extra_data: values.extra_data ?? [],
        };

        // remove helper-only fields
        delete (postTaskPayload as any).imagePreviewUrl;
        delete (postTaskPayload as any).videoPreviewUrl;
        delete (postTaskPayload as any).is_terms_condition;
        delete (postTaskPayload as any).budget_choose;

        // Use same mutate as publish flow, handle callbacks as needed
        mutate(
          { id, data: postTaskPayload },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries([is_requested ? "entity-listing" : "service-listing"]);
              setShouldNavigate(true);
              dirtyRef.current = false;
            //   router.push("/myList?status_choice=draft");
              toast.success("Saved as draft!");
              form.resetForm();
            },
            onError: (e: any) => {
              console.error("Draft save error:", e);
              toast.error("Failed to save draft");
            },
          }
        );
      } catch (e) {
        console.error("Draft save failed:", e);
        toast.error("Failed to save draft");
      } finally {
        NProgress.done();
        if (formikRef.current) formikRef.current.setSubmitting(false);
      }
    };
// ...existing code...

    const cityEditInitial = {
        id: city?.id ?? "",
        label: city?.name ?? "",
        value: city?.id.toString() ?? "",
    };
    const calculateFinalPrice = (price: number, discountPer: number | undefined): number => {
        if (!price) return 0;
        if (!discountPer || discountPer === 0) return price;

        const discountAmount = price * (discountPer / 100);
        return Number((price - discountAmount).toFixed(2));
    };

    const [searchCity, setSearchCity] = useState("");
    const {data: cityOptions = [cityEditInitial]} = useCityOption(searchCity);


    const renderType = () => {
        switch (is_requested) {
            case true:
                return {
                    value: "Task",
                    detail: "Task Details",
                    desc: "Task Description Here",
                    list_title: "What are the requirements for your task?"
                };
            case false:
                return {
                    value: "Service",
                    detail: "Service Details",
                    desc: "Service Description Here",
                    list_title: "What are your service highlights?"
                };
            case "product":
                return {
                    value: "Product",
                    detail: "Product Details",
                    desc: "Product Description Here",
                    list_title: "Key Specification of Product"
                };
            default:
                return {value: "Add", detail: "Details", list_title: "What are your highlights?*"};
        }
    };

    const getServiceImages = images?.map((val: any) => {
        const fileName = _.split(val?.name, "/");
        return {
            id: val?.id,
            src: val?.media,
            file: {name: _.last(fileName), size: val?.size, type: val?.media_type},
        };
    });


    const generateSKU = (title?: string) => {
        // Use first two characters of title if provided, otherwise use default "PR"
        const prefix = title && title.length >= 2
            ? title.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, '') // Take first 2 letters and ensure they're uppercase alphabets
            : "PR";
        const paddedPrefix = (prefix + "XX").substring(0, 2);

        const timestamp = Date.now().toString().slice(-4);
        // Generate random number (4 digits)
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        return `${paddedPrefix}-${timestamp}-${random}`;
    };


    useEffect(() => {
        if (is_requested === "product" && !productFormData.SKU) {
            setProductFormData(prev => ({
                ...prev,
                SKU: generateSKU()
            }));
        }
    }, [is_requested]);

    const getServiceVideos =
        videos &&
        videos.map((val: any) => {
            const fileName = _.split(val?.name, "/");
            return {
                id: val?.id,
                src: val?.media,
                file: {
                    name: _.last(fileName),
                    size: val?.size,
                    type: val?.media_type,
                },
            };
        });

    const reftest = useRef<any>(null);

    const handleCircleRadius = () => {
        return reftest.current && (reftest?.current.state?.circle?.radius as number);
    };
// console.log("option_type",optionType)
//
//     const validationSchema = Yup.object().shape({
//         title: Yup.string().required("Title is required"),
//         description: Yup.string().required("Description is required"),
//         category: Yup.string().required("Category is required"),
//         service: Yup.string().when("is_requested", {
//             is: (val: boolean | string) => val !== "product",
//             then: Yup.string().required("Service is required"),
//             otherwise: Yup.string().notRequired(),
//         }),
//         city: Yup.string().when("is_online", {
//             is: "false",
//             then: Yup.string().required("City is required"),
//             otherwise: Yup.string().notRequired(),
//         }),
//         budget_to: Yup.number()
//             .required("Budget is required")
//             .min(1, "Budget must be at least 1"),
//         // budget_from: Yup.number().when("budget_choose", {
//         //     is: "variable",
//         //     then: Yup.number()
//         //         .required("Minimum budget is required")
//         //         .min(1, "Minimum budget must be at least 1"),
//         //     otherwise: Yup.number().notRequired(),
//         // }),
//         start_date: Yup.date()
//             .nullable()
//             .when("is_requested", {
//                 is: true,
//                 then: Yup.date()
//                     .required("Start date is required")
//                     .min(new Date(), "Start date cannot be in the past"),
//                 otherwise: Yup.date().notRequired(),
//             }),
//         end_date: Yup.date()
//             .nullable()
//             .when("is_requested", {
//                 is: true,
//                 then: Yup.date()
//                     .required("End date is required")
//                     .min(Yup.ref("start_date"), "End date cannot be before start date"),
//                 otherwise: Yup.date().notRequired(),
//             }),
//         start_time: Yup.string().when("is_requested", {
//             is: true,
//             then: Yup.string().required("Start time is required"),
//             otherwise: Yup.string().notRequired(),
//         }),
//         // end_time: Yup.string().when("is_requested", {
//         //     is: true,
//         //     then: Yup.string().required("End time is required"),
//         //     otherwise: Yup.string().notRequired(),
//         // }),
//         currency: Yup.string().required("Currency is required"),
//         is_terms_condition: Yup.boolean().oneOf(
//             [true],
//             "You must accept the terms and conditions"
//         ),
//         // images: Yup.array().when("is_requested", {
//         //     is: (val: boolean | string) => val !== "product",
//         //     then: Yup.array().min(1, "At least one image is required"),
//         //     otherwise: Yup.array().notRequired(),
//         // }),
//     });
    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .required("Title is required")
            .min(3, "Title must be at least 3 characters long"),
        description: Yup.string().required("Description is required"),
        category: Yup.string().required("Category is required"),
        service: Yup.string().when("is_requested", {
            is: (val: boolean | string) => {
                if (typeof val === "string") return val !== "product";
                return val === true;
            },
            then: Yup.string().required("Service is required"),
            otherwise: Yup.string().notRequired(),
        }),
    extra_data: Yup.array().when(["is_online", "is_requested"], {
        is: (is_online: string, is_requested: boolean | string) => {
            console.log("extra_data validation check:", { is_online, is_requested }); // Debug log
            const isProduct = router.query.type === "product"; // safest way
            return !isProduct && is_online === "false";
        },
        then: (schema) => schema
            .test('has-location', 'Address is required', function(value) {
                console.log("extra_data test value:", value); // Debug log
                if (!value || value.length === 0) {
                    console.log("No extra_data array"); // Debug log
                    return false;
                }
                const locationData = value[0];
                const isValid = !!(locationData?.selectedValue || (locationData?.latitude && locationData?.longitude));
                console.log("Location validation result:", { locationData, isValid }); // Debug log
                return isValid;
            })
            .required("Location is required for on-premise services"),
        otherwise: (schema) => schema.nullable(),
    }),
        city: Yup.string().when(["is_online", "is_requested"], {
            is: (is_online: string, is_requested: boolean | string) => {
                if (typeof is_requested === "string") return is_online === "false" && is_requested !== "product";
                return is_online === "false" && is_requested === true;
            },
            then: Yup.string().required("City is required"),
            otherwise: Yup.string().notRequired(),
        }),
        
        budget_to: Yup.number().when(["budget_choose", "is_requested"], {
            is: (is_online: string, is_requested: boolean | string) => { // Changed is_online to budget_choose
                if (typeof is_requested === "string") return is_online === "false" && is_requested !== "product";
                return is_online === "false" && is_requested === true;
            },
            then: Yup.number()
                .required("Budget is required")
                .min(1, "Budget must be at least 1")
                .when("budget_choose", {
                    is: "variable",
                    then: Yup.number().when("budget_from", (budget_from, schema) =>
                        budget_from
                            ? schema.min(budget_from, "Maximum budget must be greater than or equal to minimum budget")
                            : schema
                    ),
                    otherwise: Yup.number(),
                }),
            otherwise: Yup.number().notRequired(),
        }),
        budget_from: Yup.number().when("budget_choose", {
            is: "variable",
            then: (schema) => schema
                .required("Minimum budget is required")
                .min(1, "Minimum budget must be at least 1"),
            otherwise: (schema) => schema.nullable(),
        }),
        budget_type: Yup.string().when("is_requested", {
            is: (val: boolean | string) => {
                if (typeof val === "string") return val !== "product";
                return val === true;
            },
            then: Yup.string().required("Budget type is required"),
            otherwise: Yup.string().notRequired(),
        }),
        start_date: Yup.date()
            .nullable()
            .when("is_requested", {
                is: true,
                then: (schema) => schema
                    .required("Start date is required")
                    .min(new Date(), "Start date cannot be in the past"),
                otherwise: (schema) => schema.nullable(),
            }),
        end_date: Yup.date()
            .nullable()
            .when("is_requested", {
                is: true,
                then: (schema) => schema
                    .required("End date is required")
                    .min(Yup.ref("start_date"), "End date cannot be before start date"),
                otherwise: (schema) => schema.nullable(),
            }),
        start_time: Yup.string()
            .nullable()
            .when("is_requested", {
                is: true,
                then: (schema) => schema.required("Start time is required"),
                otherwise: (schema) => schema.nullable(),
            }),
        end_time: Yup.string()
            .nullable()
            .when("is_requested", {
                is: true,
                then: (schema) => schema.required("End time is required"),
                otherwise: (schema) => schema.nullable(),
            }),
        currency: Yup.string().required("Currency is required"),
        is_terms_condition: Yup.boolean().oneOf(
            [true],
            "You must accept the terms and conditions"
        ),
        is_online: Yup.string().oneOf(["true", "false"], "Service type must be either remote or on premise"),
        is_active: Yup.boolean(),
        share_location: Yup.boolean(),
        status_choice: Yup.string().oneOf(["published", "draft"], "Status must be either published or draft"),
        highlights: Yup.array().when("is_requested", {
            is: (val: boolean | string) => {
                if (typeof val === "string") return val !== "product";
                return val === true;
            },
            then: Yup.array()
                .of(Yup.string().required(`${is_requested?"Key Feature":"Highlight"} cannot be empty`))
                .min(1, `At least one ${is_requested?"Key Feature":"Highlight"} is required`)
                .required(`${is_requested?"Key Feature":"Highlight"} are required`),
            otherwise: Yup.array().notRequired(),
        }),
       images: Yup.array().test({
        name: 'product-images-required',
        message: 'At least one image is required',
        test: function (value) {
            // Only run this validation if it's a product
              const isProduct = router.query.type === "product";
            if (!isProduct) return true; // Skip for tasks/services

            // For products: require at least 1 image
            return Array.isArray(value) && value.length > 0;
        }
    }),
        imagePreviewUrl: Yup.array().notRequired(),
        videos: Yup.array().notRequired(),
        videoPreviewUrl: Yup.array().notRequired(),
    });



    if ( (is_requested === "product" && id && !key_feature)) {
        return (
            <Layout currentTitle="post">
                <Box style={{
                    display:"flex",
                    justifyContent:"center",
                    height:"100vh",

                    alignItems:"center"
                }} >
                    <HomaaleLoader/>
                </Box>
            </Layout>
        );
    }
    console.log("category from entity",  service?.category?.id)
    return (
        <Layout currentTitle="post">
            <LoadingOverlay
                loader={<HomaaleLoader/>}
                visible={isLoading || uploadFileLoading || (id ? editLoading : false) || (is_requested === "product" && (productCategoryLoading || shopOptionsLoading))}
                sx={{position: "fixed", inset: 0}}
            />

            <div>
                <Box p={{
                    base: "10px 15px",
                    sm: "15px 30px",
                    md: "20px 40px",
                    lg: "30px 50px",
                    xl: "40px 60px"
                } as unknown as MantineNumberSize} h={"100%"}>
                   
                    <Formik
                        innerRef={formikRef}
                        initialValues={{
                            title: is_requested === "product" ? name ?? "" : title ?? "",
                            description: description ?? "",
                            highlights: highlights ?? [],
                            city: city?.id ? city?.id.toString() : "",
                            location: data ?? '',
                            budget_type: budget_type ?? "Project",
                            budget_from: is_range ? (is_requested ? payable_from ? parseFloat(payable_from) : null : budget_from ? parseFloat(budget_from) : null) : null,
                            budget_to: is_requested ? payable_to ? parseFloat(payable_to) : "" : budget_to ? parseFloat(budget_to) : "",
                            category: is_requested === "product" ? (category_details?.id ? category_details.id.toString() : queryCategory) : (service?.category?.id ? service?.category?.id.toString() : ""),
                            service: service?.id ?? "",
                            is_negotiable: is_negotiable ?? false,
                            start_date: start_date ? parseISO(start_date) as unknown as string :null,
                            end_date: end_date ? parseISO(end_date) as unknown as string :null,
                            start_time: start_time ?? null,
                            end_time: end_time ?? null,
                            currency: is_requested === "product" ? (local_currency_details?.code ?? "NPR") : (currency?.code ?? "NPR"),
                            images: is_requested === "product" ? (images || []) : (images ?? []),
                            imagePreviewUrl: is_requested === "product" ? (images || []) : (getServiceImages ?? []),
                            videos: videos ?? [],
                            videoPreviewUrl: getServiceVideos ?? [],
                            is_online: is_online ? "true" : "false",
                            is_active: true,
                            is_terms_condition: true,
                            share_location: true,
                            is_requested: is_requested,
                            status_choice: status_choice ?? Status.Published,
                            extra_data: [{
                                selectedValue: maplocation.selected ?? '',
                                latitude: maplocation.lat ?? null,
                                longitude: maplocation.lng ?? null,
                            }],
                            // facilities: [],
                            budget_choose: is_range ? "variable" : "fixed",
                            ...(is_requested === "product" && {
                                cost_price: cost_price ? parseFloat(cost_price) : undefined,
                                discount_per: discount_per ? parseFloat(discount_per) : undefined,
                                price: price ? parseFloat(price) : undefined,
                                stock_quantity: stock_quantity ?? undefined,
                                local_currency: local_currency_details?.code ?? "NPR",
                                is_active_product: is_active_product ?? true,
                                allow_multiple_variants: allow_multiple_variants ?? true,
                                key_feature: Array.isArray(key_feature) ? key_feature : key_feature ? [key_feature] : [],
                                // key_feature: editData?.key_feature ? (Array.isArray(editData.key_feature) ? editData.key_feature : [editData.key_feature]) : [],
                                // // key_feature: productFormData.key_feature || [],
                                shop: editData?.shop?.id || queryShopName,
                                ...productFormData.variants?.reduce((acc, variant, index) => ({
                                    ...acc,
                                    [`variantImages-${index}`]: variant.images || [],
                                }), {}),
                            }),
                        }}
                        enableReinitialize={!!id}
                        validationSchema={ validationSchema}
                        onSubmit={async (values: PostTaskPayloadProps & {
                            cost_price?: number;
                            discount_per?: number;
                            price?: number;
                            stock_quantity?: number;
                            local_currency?: string;
                            is_active_product?: boolean;
                            allow_multiple_variants?: boolean;
                            key_feature?: string[];
                            shop?: string;
                            images:any[];
                            status_choice?: string; // Added status to form values
                            // facilities?: string[];
                            [key: `variantImages-${number}`]: File[] | any[];
                        }, actions) => {
                           

                            let newUploadImageID: number[] = [];
                            const imagesForPayload: { image: string }[] = [];
                            const fileToBase64 = (file: File): Promise<string> => {
                                return new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        if (typeof reader.result === 'string') {
                                            resolve(reader.result);
                                        } else {
                                            reject(new Error('Failed to convert file to Base64'));
                                        }
                                    };
                                    reader.onerror = () => reject(new Error('Error reading file'));
                                    reader.readAsDataURL(file);
                                });
                            };
                            // ...existing code...
  
// ...existing code...
                            // if (is_requested === "product") {
                            //     try {
                            //         for (const img of values.images) {
                            //             console.log('Debug: Processing image:', img); // Log each image
                            //             if (img instanceof File) {
                            //                 // New image: convert to Base64
                            //                 const base64String = await fileToBase64(img);
                            //                 imagesForPayload.push({ image: base64String });
                            //                 console.log('Debug: Converted to Base64:', base64String);
                            //             } else if (typeof img === 'object' && (img.src || img.media || img.id)) {
                            //                 // Existing image: use URL
                            //                 const imageUrl = img.src || img.media || `http://192.168.0.199:8001/api/v1/product/images/${img.id}`;
                            //                 imagesForPayload.push({ image: imageUrl });
                            //                 console.log('Debug: Using existing image URL:', imageUrl);
                            //             } else {
                            //                 console.warn('Debug: Skipping invalid image format:', img);
                            //                 toast.error('Invalid image format detected. Please upload valid images.');
                            //                 return;
                            //             }
                            //         }
                            //     } catch (error) {
                            //         console.error('Debug: Error converting images to Base64:', error);
                            //         toast.error('Failed to process images. Please try again.');
                            //         return;
                            //     }
                            // } else {
                            //     // Non-product image uploads
                            //     if (values.images.some((val) => val?.path)) {
                            //         try {
                            //             const uploadedImageIds = await uploadFileMutation({
                            //                 files: values.images.filter((val) => val?.path) as unknown as string,
                            //                 media_type: "image",
                            //             });
                            //             newUploadImageID = uploadedImageIds;
                            //             console.log('Debug: Uploaded image IDs:', newUploadImageID);
                            //         } catch (error) {
                            //             console.error('Debug: Error uploading images:', error);
                            //             toast.error('Failed to upload images.');
                            //             return;
                            //         }
                            //     }
                            // }


                      if (values.images.some((val) => val?.path)) {
                                const uploadedImageIds = await uploadFileMutation({
                                    files: values?.images.filter((val) => val?.path) as unknown as string,
                                    media_type: "image",
                                });
                                newUploadImageID = uploadedImageIds;
                            }

                            let newUploadVideoID: number[] = [];
                            if (values.videos.some((val) => val?.path)) {
                                const uploadedVideosIds = await uploadFileMutation({
                                    files: values?.videos.filter((val) => val?.path) as unknown as string,
                                    media_type: "video",
                                });
                                newUploadVideoID = uploadedVideosIds;
                            }

                            // Process variant images
                            const variantImageData: { image: any }[][] = [];
                            for (let i = 0; i < productFormData.variants?.length; i++) {
                                const variantImages = values[`variantImages-${i}`] || [];
                                let uploadedVariantImageData: { image: string }[] = [];

                                if (variantImages.some((val: any) => val instanceof File)) {
                                    // Assuming uploadFileMutation returns file paths or IDs that can be mapped to paths
                                    const uploadedData = await uploadFileMutation({
                                        files: variantImages.filter((val: any) => val instanceof File),
                                        media_type: "image",
                                    });
                                    // Transform uploaded data into { image: filePath } format
                                    uploadedVariantImageData = uploadedData.map((item: any) => ({
                                        image: typeof item === 'string' ? item : item.path || item.url || `/product/images/${item.id}`,
                                    }));
                                }
   
                                // Handle existing images
                                const existingVariantImageData = variantImages
                                    .filter((val: any) => !(val instanceof File))
                                    .map((val: any) => ({
                                        image: val.src || val.media || `http://192.168.0.199:8001/api/v1/product/images/${val.id}`, // Use existing path or fallback
                                    }));

                                variantImageData[i] = [...existingVariantImageData, ...uploadedVariantImageData];
                            }

                            const imagesOnly = values.images.map((img: any) =>
                                img?.file instanceof File ? img.file.type : img
                            );
                            const imageIds = values?.images.filter((val) => !val?.path).map((val) => val.id);
                            const videoIds = values?.videos.filter((val) => !val?.path).map((val) => val.id);
                            const imagesIds = [...imageIds, ...newUploadImageID];
                            const videosIds = [...videoIds, ...newUploadVideoID];

                            if (is_requested === "product") {
                                const productPayload: ProductData = {
                                    product: id,
                                    is_active: values?.is_active_product ?? true,
                                    SKU: productFormData.SKU || generateSKU(),
                                    name: values.title || "",
                                    key_feature: values.key_feature || [],
                                    product_status: productFormData.product_status || ProductStatus.General,
                                    category: values.category || undefined,
                                    shop: values.shop || null,
                                    description: values.description || "",
                                    price: values.price ? String(values.price) : undefined,
                                    stock_quantity: values.stock_quantity || undefined,
                                    cost_price: values.cost_price ? String(values.cost_price) : undefined,
                                    local_currency: values.currency || "NPR",
                                    discount_per: values.discount_per ? String(values.discount_per) : undefined,
                                    rating: productFormData.rating ?? null,
                                    images: imagesOnly,
                                    option_type: productFormData.product_option || optionType.none,
                                    allow_multiple_variants: true,
                                    variants: productFormData.variants.map((variant, index) => {
                                        const baseLabel = `${values.title || "Product"} - ${variant.color || "No Color"} / ${variant.size || "No Size"}`;
                                        return {
                                            id: variant.id ?? undefined,
                                            images: [], // No images since FileInput is commented out
                                            SKU: variant.SKU || generateSKU(values.title),
                                            size: variant.size ?? null,
                                            color: variant.color ?? null,
                                            label: variant.label || baseLabel,
                                            qr_code: variant.qr_code || ``,
                                            price: variant.price ? String(variant.price) : null,
                                            stock_quantity: variant.stock_quantity ?? 0,
                                        };
                                    }),
                                };

                                // console.log("Submitting productPayload:", JSON.stringify(productPayload, null, 2));

                                mutateProduct(
                                  { id, data: productPayload },
                                  {
                                    onSuccess: (data) => {
                                      queryClient.invalidateQueries(["product-listing"]);
                                      setShouldNavigate(true);
                                      dirtyRef.current = false;
                                      router.push(`/products/${data?.id}`);
                                      actions.resetForm();
                                      setProductFormData({
                                        SKU: generateSKU(),
                                        product_status: undefined,
                                        product_option: optionType.none,
                                        rating: 1,
                                        images: [],
                                        key_feature: [],
                                        variants: [],
                                      });
                                      // toast.success("Product updated successfully");
                                    },
                                    onError: (error: any) => {
                                      console.error("Product mutation error:", error.response?.data || error.message);
                                      const errors = error.response?.data;
                                      Object.keys(errors || {}).forEach((key) => {
                                        actions.setFieldError(key, errors[key][0]);
                                      });
                                      // toast.error("Failed to update product");
                                    },
                                  }
                                );
                                return;
                            }

                            const postTaskPayload = {
                                ...values,
                                highlights: values.highlights,
                                images: imagesIds,
                                videos: videosIds,
                                city: parseInt(values.city),
                                is_online: values.is_online === "false" ? false : true,
                                budget_from: values.budget_choose === "variable" ? values.budget_from : null,
                                is_range: values.budget_choose === "variable" ? true : false,
                                start_date: values.start_date ? format(new Date(String(values.start_date)), "yyyy-MM-dd") : null,
                                end_date: values.end_date ? format(new Date(String(values.end_date)), "yyyy-MM-dd") : null,
                                status_choice: values.status_choice,
                                location: values.location,
                                extra_data: [{
                                    selectedValue: maplocation.selected ?? '',
                                    latitude: maplocation.lat ?? null,
                                    longitude: maplocation.lng ?? null,
                                }],

                            };

                            delete postTaskPayload.imagePreviewUrl;
                            delete postTaskPayload.category;
                            delete postTaskPayload.videoPreviewUrl;
                            delete postTaskPayload.is_terms_condition;
                            delete postTaskPayload.budget_choose;

                            mutate(
                                {id, data: postTaskPayload},
                                {
                                    // onSuccess: (data) => {
                                    //     if (is_requested) {
                                    //         queryClient.invalidateQueries(["entity-listing"]);
                                    //         router.push(`/tasks/${data?.id}`);
                                    //         toast.success(`${id ? "Edit" : "Post"} ${renderType().value} Successful`);
                                    //     } else {
                                    //         queryClient.invalidateQueries(["service-listing"]);
                                    //         router.push(`/services/${data?.id}`);
                                    //         toast.success(`${id ? "Edit" : "Post"} ${renderType().value} Successful`);
                                    //     }
                                    //     actions.resetForm();
                                    // },
                                    onSuccess: (data) => {
                                            const isEdit = !!id;
                                            const type = is_requested ? "Task" : "Service";
                                            const redirectTo = is_requested ? `/tasks/${data?.id}` : `/services/${data?.id}`;
                                            const isPublished = values.status_choice === "published";
                                            
                                            // IMPORTANT: Set these before navigation
                                            setShouldNavigate(true);
                                            dirtyRef.current = false;
                                            
                                            // Invalidate query based on type
                                            queryClient.invalidateQueries([is_requested ? "entity-listing" : "service-listing"]);

                                            // Redirect logic with setTimeout to ensure state updates
                                            setTimeout(() => {
                                                if (isPublished) {
                                                    router.push(redirectTo);
                                                }
                                                //  else {
                                                //     router.push("/myList?status_choice=draft");
                                                // }
                                            }, 0);
                                            
                                            // Toast message
                                          if (isEdit) {
                                        toast.success(`${type} edited successfully`);
                                    } else {
                                        const statusMsg = isPublished ? 'published' : 'saved as draft';
                                        toast.success(`${type} ${statusMsg} successfully!`);
                                    }
                                            actions.resetForm();
                                        },
                                    onError: (e: any) => {
                                        toast.error("fill the required");
                                        const {
                                            title,
                                            end_date,
                                            city,
                                            service,
                                            budget_to,
                                            start_date,
                                            description,
                                            status_choice
                                        } = e.response.data;
                                        actions.setFieldError("title", title && title[0]);
                                        actions.setFieldError("end_date", end_date && end_date[0]);
                                        actions.setFieldError("city", city && city[0]);
                                        actions.setFieldError("service", service && service[0]);
                                        actions.setFieldError("budget_to", budget_to && budget_to[0]);
                                        actions.setFieldError("start_date", start_date && start_date[0]);
                                        actions.setFieldError("description", description && description[0]);
                                        actions.setFieldError("status", status_choice && status_choice[0]);
                                    },
                                }
                            );

                        }}
                    >
                        {({errors, touched, setFieldValue, values, dirty,setTouched}) => { 

                           const typedErrors = errors as typeof errors & {
                                        extra_data?: string;
                                        location?: string;
                                    };
                                    
                                    const typedTouched = touched as typeof touched & {
                                        extra_data?: boolean;
                                        location?: boolean;
                                    };

                    
                            console.log("Formik dirty state:", dirty, "Values:", values);
                            const fieldDisplayNames: Record<string, string> = {
                                'title': 'Title',
                                'description': 'Description',
                                'category': 'Category',
                                'service': 'Service',
                                'city': 'City',
                                'budget_to': ' Budget',
                                'budget_from': 'Minimum Budget',
                                'budget_type': 'Budget Type',
                                'start_date': 'Start Date',
                                'end_date': 'End Date',
                                'start_time': 'Start Time',
                                'end_time': 'End Time',
                                'currency': 'Currency',
                                'is_terms_condition': 'Terms and Conditions',
                                'is_online': 'Service Type',
                                'highlights': 'Highlights',
                                'key_feature': 'Key Features',
                                'images': 'Images',
                                'extra_data': 'Location',
                                'status_choice': 'Status',
                                'share_location': 'Share Location',
                                'is_active': 'Active Status',
                                'price': 'Price',
                                'cost_price': 'Cost Price',
                                'stock_quantity': 'Stock Quantity',
                            };
                            return (
                            <Form id="post-task-form" noValidate>
           <Flex
  sx={{
    position: "sticky",
    top: 65,
    zIndex: 100,
    background: "white",
    padding: "15px",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: isMobile ? 10 : 0
  }}
>

                                     <Flex>
                        <Title order={3} size={20} weight={600}>
                            {id ? "Edit" : "Add"} {renderType().value}
                        </Title>
                     {id && (
  <Badge
    variant="outline"
    color="blue"
    radius="md"
    size="md"
    sx={{
        marginLeft:20
    }}
  >
    Status: {status_choice}
  </Badge>
)}


                    </Flex>
                    <Flex justify="right" gap={20} >
                                      <Button
                                            variant="outline"
                                            sx={{
                                                color: theme.colors.secondary[2],
                                                border: `1px solid ${theme.colors.secondary[2]}`
                                            }}
                                            onClick={() => {
                                                if (formikRef.current?.dirty || dirtyRef.current) {
                                                    showUnsavedChangesModal(() => {
                                                        console.log("Cancel button - Modal confirmed, going back");
                                                        setShouldNavigate(true);
                                                        dirtyRef.current = false; // Reset dirty state
                                                        // Use setTimeout to ensure state updates before navigation
                                                        setTimeout(() => {
                                                            router.back();
                                                        }, 0);
                                                    });
                                                } else {
                                                    router.back();
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        {status_choice !== Status.Published && is_requested !== "product" && (
                                            // <Box mt={15}>
                                            //     <Flex>
                                            // <Text size="sm" fw={500} mb={5}>
                                            //     Status
                                            // </Text>
                                            <div>

                                            {/*<Switch*/}
                                            {/*    id="status_choice"*/}
                                            {/*    name="status_choice"*/}
                                            {/*    // label="Status"*/}
                                            {/*    checked={values.status_choice === Status.Published}*/}
                                            {/*    onChange={(e) => setFieldValue("status_choice", e.currentTarget.checked ? Status.Published : Status.Draft)}*/}
                                            {/*    onLabel={<span style={{ fontSize: '14px'}}>Published</span>}*/}
                                            {/*    offLabel={<span style={{ fontSize: '14px'}}>Draft</span>}*/}
                                            {/*    mt={15}*/}
                                            {/*    error={touched.status_choice}*/}
                                            {/*/>*/}
                                      {/*      <Button*/}
                                      {/*      id="status_choice"*/}
                                      {/*      name="status_choice"*/}
                                      {/*      // label="Status"*/}
                                      {/*      // checked={values.status_choice === Status.Published}*/}
                                      {/*  onChange={(e) => setFieldValue("status_choice",  Status.Draft)}*/}

                                      {/*>*/}
                                      {/*          Save Draft*/}
                                      {/*          </Button>*/}
                                        <Button
                                            variant="outline"
                                            sx={{
                                            color: theme.colors.gray[6],
                                            border: `1px solid ${theme.colors.gray[6]}`,
                                            }}
                                            onClick={() => {
                                            // 1. Only require title
                                            if (!values.title?.trim()) {
                                                setTouched({ title: true });
                                                scrollToElement("title", "smooth");
                                                toast.error("Please enter a title before saving as draft");
                                                return;
                                            }

                                            // 2. Set status to Draft
                                            setFieldValue("status_choice", Status.Draft);

                                            // 3. Confirm modal
                                            handleSaveDraft();
                                            // modals.openConfirmModal({
                                            //     title: "Save as Draft",
                                            //     children: (
                                            //     <Text size="sm" weight={500}>
                                            //         Your {renderType().value.toLowerCase()} will be saved as a draft and appear in MyList.
                                            //     </Text>
                                            //     ),
                                            //     labels: { confirm: "Save Draft", cancel: "Cancel" },
                                            //     confirmProps: { color: theme.colors.brand[4] },
                                            //     onConfirm: () => {
                                            //             // THIS IS THE CORRECT & TYPE-SAFE WAY
                                            //             handleSaveDraft();
                                            //             },
                                            // });
                                            }}
                                            // disabled={!values.is_terms_condition}
                                        >
                                            {id ? "Update" : "Save"} Draft
                                        </Button>


                                            </div>

                                            //     </Flex>
                                            // </Box>
                                        )}
                                        <FormButton
                                            name={`${id ? "Update" : "Post"} ${renderType().value}`}
                                            id="post-task-btn"
                                            type="button"
                                        handleClick={async () => {
                                            console.log("Form button clicked");
                                            setPostClicked(true)
                                            
                                            // Manually trigger validation
                                            const validationErrors = await formikRef.current?.validateForm();
                                            console.log("Validation errors:", validationErrors);
                                            
                                            const requiredFieldsByType = {
                                                product: ['title', 'description', 'category', 'price', 'cost_price', 'stock_quantity', 'currency', 'key_feature', 'images'],
                                                service: values.is_online === "false" 
                                                    ? ['title', 'description', 'category', 'service', 'budget_to', 'budget_type', 'highlights', 'currency', 'start_date', 'end_date', 'start_time', 'end_time', 'city', 'extra_data']
                                                    : ['title', 'description', 'category', 'service', 'budget_to', 'budget_type', 'highlights', 'currency', 'start_date', 'end_date', 'start_time', 'end_time']
                                            };
                                            
                                            const relevantFieldsForType = is_requested === "product" 
                                                ? requiredFieldsByType.product 
                                                : is_requested === true || is_requested === false
                                                ? requiredFieldsByType.service
                                                : [];
                                            
                                            console.log("Relevant fields:", relevantFieldsForType);
                                            
                                            const relevantErrors = Object.keys(validationErrors || {}).filter(field => 
                                                relevantFieldsForType.includes(field) && (validationErrors as Record<string, any>)?.[field]
                                            ).reduce((acc, field) => {
                                                acc[field] = (validationErrors as Record<string, any>)[field];
                                                return acc;
                                            }, {} as Record<string, any>);

                                            console.log("Relevant errors:", relevantErrors);

                                            if (Object.keys(relevantErrors).length > 0) {
                                                const touchedFields: Record<string, any> = {};
                                                Object.keys(relevantErrors).forEach(field => {
                                                    touchedFields[field] = true;
                                                });
                                                setTouched(touchedFields as any);

                                                const firstErrorField = Object.keys(relevantErrors)[0];
                                                console.log("Scrolling to field:", firstErrorField);
                                                scrollToElement(firstErrorField, "smooth");
                                                const fieldDisplayName = fieldDisplayNames[firstErrorField] || firstErrorField;
                                                toast.error(`Please fill the required ${fieldDisplayName} field`);
                                                return; // Stop here, don't show modal
                                            }
                                            
                                            // If validation passes, set status and show modal
                                            setFieldValue("status_choice", Status.Published);

                                            if (is_requested !== "product") {
                                                modals.openConfirmModal({
                                                    title: `${id ? "Update" : "Post"} ${renderType().value} Confirmation`,
                                                    children: (
                                                        <div>
                                                            <p>
                                                                {`Are you sure you want to ${id ? "update" : "post"} this ${renderType().value.toLowerCase()}?`}
                                                            </p>
                                                            <p style={{ color: theme.colors.brand[4] }}>
                                                                {`Your ${renderType().value.toLowerCase()} will be published.`}
                                                            </p>
                                                        </div>
                                                    ),
                                                    labels: { confirm: id ? "Update" : "Post", cancel: "Cancel" },
                                                    confirmProps: { color: theme.colors.brand[4] },
                                                    onConfirm: () => {
                                                        setFieldValue("status_choice", Status.Published);
                                                        const form = document.getElementById("post-task-form") as HTMLFormElement;
                                                        if (form) {
                                                            console.log("Submitting form with status:", values.status_choice);
                                                            if (form.requestSubmit) {
                                                                form.requestSubmit();
                                                            } else {
                                                                form.submit();
                                                            }
                                                        } else {
                                                            console.error("Form element not found");
                                                            toast.error("Form not found. Please try again.");
                                                        }
                                                    },
                                                });
                                            } else {
                                                const form = document.getElementById("post-task-form") as HTMLFormElement;
                                                if (form) {
                                                    console.log("Submitting product form");
                                                    if (form.requestSubmit) {
                                                        form.requestSubmit();
                                                    } else {
                                                        form.submit();
                                                    }
                                                } else {
                                                    console.error("Form element not found");
                                                    toast.error("Form not found. Please try again.");
                                                }
                                            }
                                        }}
                                            loading={isLoading || isLoadingProduct}
                                            // disabled={!values.is_terms_condition}
                                        />
                                    </Flex>
                                </Flex>
                                  
                                <FocusTrap active={true}>
                                    <Grid gutter={30} mt={32}>
                                        <Grid.Col md={6}>
                                            <Box p={24} style={{boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)"}}>
                                                <Title order={5}
                                                       color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]}
                                                       weight={500} mb={24}>
                                                    {renderType().detail}
                                                </Title>
                                                <InputField
                                                    id="title"
                                                    name="title"
                                                    label={is_requested === "product" ? "Product Name" : "Title"}
                                                    placeholder={is_requested === "product" ? "Enter product name" : "Name"}
                                                    touch={touched.title}
                                                    error={errors.title}
                                                    value={values.title}
                                                    onChange={(e) => setFieldValue('title', e.target.value)}
                                                    data-autofocus
                                                    required
                                                    withAsterisk
                                                />
                                                {is_requested === "product" && (
                                                    <>
                                                        <TextInput
                                                            label="SKU"
                                                            value={productFormData.SKU}
                                                            readOnly
                                                            sx={{marginBottom: '1rem'}}
                                                        />
                                                        <NumberField
                                                            id="stock_quantity"
                                                            name="stock_quantity"
                                                            label="Stock Quantity"
                                                            value={values.stock_quantity}
                                                            onChange={(value) => setFieldValue('stock_quantity', value)}
                                                            placeholder="Enter stock quantity"
                                                                                                                withAsterisk={postClicked}

                                                            
                                                        />
                                                    </>
                                                )}
                                                 {is_requested==="product"?( <SelectField
                                                   id="category"
                                                   name="category"
                                                   label="Category"
                                                   handleChange={(data) => {
                                                       // Find the selected category's label from categoryOptions
                                                       const selectedOption = categoryOptions.find((option: SelectOption) => option.value === data);
                                                       const cleanedLabel = selectedOption ? selectedOption.label.replace(/->/g, ' ').trim() : data;


                                                       // Use the id for categoryFilter and Formik field
                                                       setCategoryFilter(data); // Store the id for filtering services
                                                       setFieldValue("category", data); // Store the id in Formik
                                                       console.log("Selected category ID:", data, "Cleaned label:", cleanedLabel);
                                                   }}
                                                   searchable
                                                   placeholder="Select a category"




                                                   data={categoryOptions
                                                   }
                                                   value={values.category && values.category.replace(/->/," ").trim()}
                                                   touch={touched.category}
                                                    error={errors.category}
                                                   // withAsterisk
                                                   // required
                                                   disabled={is_requested === "product" && !!id}
                                                   clearable
                                                   hierarchical={true}
                                                   // withAsterisk={status_choice !== "draft" }
                                                   withAsterisk={postClicked}
                                               />):(
                                                   <NestedCategorySelect
                                                   categories={categoryNested}
                                                   value={values.category}
                                                   onChange={(id) => {
                                                       setFieldValue("category", id)
                                                       setCategoryFilter(id)
                                                   }}
                                                   error={errors.category}
                                                   touched={touched.category}
                                                   withAsterisk={postClicked}
                                                  
                                               />)}
                                                
                                                {id && !values.category && (
                                                <Text size="xs" c="red"   mt={-15}  
>
                                                    Please choose a category before submitting
                                                </Text>
                                                )}

                                                {is_requested === "product" && id && (
                                                    <Alert color="blue" icon={<IconAlertCircle size="1rem"/>} mt="xs"
                                                           mb="xs">
                                                        Note: Product category cannot be changed after creation.
                                                    </Alert>
                                                )}
                                                {is_requested !== "product" && (
                                                <>
                                                    <SelectField
                                                        id="service"
                                                        name="service"
                                                        label="Service"
                                                        placeholder="Select a service"
                                                        disabled={!categoryFilter}
                                                        data={serviceOptions}
                                                        error={errors.service}
                                                        touch={touched.service}
                                                    withAsterisk={postClicked}

                                                        required
                                                        handleChange={(value) => {
                                                            setFieldValue("service", value);
                                                            const val = serviceOptions.filter((val) => val?.id === value);
                                                            setServiceCommission(val[0]?.commission);
                                                        }}
                                                    />
                                                    {/*{ id && status_choice !== Status.Published && (*/}
                                                    {/*<SelectField*/}
                                                    {/*    id="status_choice"*/}
                                                    {/*    name="status_choice"*/}
                                                    {/*    label="Status"*/}
                                                    {/*    placeholder="Select status"*/}
                                                    {/*    data={statusOptions}*/}
                                                    {/*    value={values.status_choice || ""}*/}
                                                    {/*    handleChange={(value) => setFieldValue("status_choice", value)}*/}
                                                    {/*    error={errors.status_choice}*/}
                                                    {/*    touch={touched.status_choice}*/}
                                                    {/*    withAsterisk*/}
                                                    {/*    required*/}
                                                    {/*/>*/}
                                                    {/*)}*/}
                                                </>
                                                )}
                                                {is_requested === "product" && (
                                                    <SelectField
                                                        id="product_status"
                                                        name="product_status"
                                                        label="Product Status"
                                                        placeholder="Select product status"
                                                        value={productFormData.product_status}
                                                        data={productStatusOptions}
                                                        searchable
                                                        handleChange={(value) => handleProductChange("product_status", value as string)}
                                                                                                            withAsterisk={postClicked}

                                                        
                                                    />
                                                )}
                                                        {is_requested === "product" && (
                                                         <ListField
                                                            key={`key_feature-${key_feature?.length || 0}`}  // Add key
                                                            id="key_feature"
                                                            name="key_feature"
                                                            initialLists={editData?.key_feature || []}  // Make sure it's always an array
                                                            onListChange={(lists) => {
                                                                setFieldValue("key_feature", lists);
                                                                handleProductChange("key_feature", lists);
                                                            }}
                                                            error={errors.key_feature as string}
                                                            labelName={renderType().list_title}
                                                            withAsterisk 
                                                            
                                                        />
                                                )}
                                                {is_requested === "product" && (
                                                    <SelectField
                                                        id="product_option"
                                                        name="product_option"
                                                        label="Product Option"
                                                        placeholder="Select product options"
                                                        value={productFormData.product_option}
                                                        data={productOptions}
                                                        searchable
                                                        handleChange={(value) => handleProductChange("product_option", value as string)}
                                                                                                           withAsterisk={postClicked}

                                                    />


                                                )}
                                                {/* {is_requested === "product" && productFormData.product_option !== optionType.none && (
                                                <Box mt={24}>
                                                    <Title order={5} mb={16}>Variants</Title>
                                                    {productFormData.variants?.map((variant, index) => (
                                                    <Box key={index} p={16} mb={16} style={{ border: `1px solid ${theme.colors.gray[3]}`, borderRadius: theme.radius.md }}>
                                                        <Flex justify="space-between" align="center" mb={16}>
                                                        <Text weight={500}>Variant {index + 1}</Text>
                                                        {productFormData.variants.length > 1 && (
                                                            <Button
                                                            color="red"
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() => handleProductChange("deleteVariant", null, index)}
                                                            >
                                                            Delete Variant
                                                            </Button>
                                                        )}
                                                        </Flex>
                                                        <TextInput
                                                            label="variants- SKU"
                                                            value={productFormData.variants[0].SKU}
                                                            readOnly
                                                            sx={{marginBottom: '1rem'}}
                                                        />
                                                        <FileInput
                                                        id={`variantImages-${index}`}
                                                        name={`variantImages-${index}`}
                                                        label="Upload Variant Images"
                                                        placeholder="Choose images for this variant"
                                                        description={`Upload up to 3 images. Supported: .jpeg, .jpg, .png. Max size: 4MB.`}
                                                        multiple
                                                        accept="image/jpeg,image/jpg,image/png"
                                                        value={variant.images}
                                                        onChange={(files) => {
                                                            handleProductChange("variantImages", files, index);
                                                            setFieldValue(`variantImages-${index}`, files);
                                                        }}
                                                        error={errors[`variantImages-${index}`] as string}
                                                        withAsterisk
                                                        clearable
                                                        />
                                                        <SelectField
                                                        id={`size-${index}`}
                                                        name={`size-${index}`}
                                                        label="Size"
                                                        placeholder="Select product size"
                                                        value={variant.size || ''}
                                                        data={productSize}
                                                        searchable
                                                        handleChange={(value) => handleProductChange('size', value, index)}
                                                        withAsterisk
                                                        />
                                                        <SelectField
                                                        id={`color-${index}`}
                                                        name={`color-${index}`}
                                                        label="Color"
                                                        placeholder="Select product color"
                                                        value={variant.color || ''}
                                                        data={productColor}
                                                        searchable
                                                        handleChange={(value) => handleProductChange('color', value, index)}
                                                        withAsterisk
                                                        />
                                                    </Box>
                                                    ))}
                                                    <Button
                                                    mt={16}
                                                    onClick={() => handleProductChange("addVariant", null)}
                                                    leftIcon={<IconPlus size={16} />}
                                                    >
                                                    Add Variant
                                                    </Button>
                                                </Box>
                                                )}  */}
                                                {is_requested !== "product" && (
                                                 <ListField
                                                    key={`highlights-${highlights?.length || 0}`}  // Add key to force re-render
                                                    id="highlights"
                                                    name="highlights"
                                                    initialLists={highlights || []}  // Use || instead of just passing highlights
                                                    onListChange={(lists) => setFieldValue("highlights", lists)}
                                                    error={errors.highlights as string}
                                                    labelName={renderType().list_title}
                                                    withAsterisk
                                                />
                                                )}
                                                {is_requested !== "product" && (
                                                    <Radio.Group
                                                        id="is_online"
                                                        name="is_online"
                                                        label="Service Type"
                                                        value={values.is_online}
                                                        mb={24}
                                                        onChange={(is_online) => setFieldValue("is_online", is_online)}
                                                        sx={{
                                                            ["& .mantine-RadioGroup-label"]: {
                                                                color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[8],
                                                                fontWeight: 400,
                                                                marginBottom: 4
                                                            }
                                                        }}
                                                    withAsterisk={postClicked}

                                                    >
                                                        <Flex justify={"flex-start"} gap={15}>
                                                            <Radio value="true" label="Remote" size="xs"/>
                                                            <Radio value="false" label="On premise" size="xs"/>
                                                        </Flex>
                                                    </Radio.Group>
                                                )}
                                                {is_requested === "product" && (
                                                    <SelectField
                                                        id="shop"
                                                        name="shop"
                                                        label="Shop Name"
                                                        placeholder="Select your shop"
                                                        data={shopOptions}
                                                        onChange={(value) => setFieldValue('shop', value)}
                                                        searchable
                                                        disabled={!!editData?.shop}
                                                        clearable
                                                        touch={touched.shop}
                                                        error={errors.shop}
                                                        value={values.shop}
                                                    />
                                                )}
                                                {is_requested !== "product" && (
                                                    <>
                                                        <SelectField
                                                            id="city"
                                                            name="city"
                                                            label="City"
                                                            placeholder="Search and select your city"
                                                            data={cityOptions}
                                                            onSearchChange={debounce((value) => setSearchCity(value), 500)}
                                                            searchable
                                                            touch={touched.city}
                                                            error={errors.city}
                                                    withAsterisk={postClicked}


                                                        />

                                                    </>
                                                )}
                                                {values.is_online === "false" && is_requested !== "product" && (
                                                    <>
                                                        {/*<InputField*/}
                                                        {/*    id="location"*/}
                                                        {/*    name="location"*/}
                                                        {/*    label="Address Information"*/}
                                                        {/*    placeholder="Enter your address detail"*/}
                                                        {/*    touch={touched.location}*/}
                                                        {/*    error={errors.location}*/}
                                                        {/*    withAsterisk*/}
                                                        {/*/>*/}
                                                        <div id="extra_data" className="mb-4">


                                                        <PlacesAutocomplete                                                                 
                                                            postClicked={postClicked}
                                                            error={!!(typedTouched.extra_data && typedErrors.extra_data)}
                                                            setCurrentLocation={setMapLocation}
                                                            onInputChange={(val) => {
                                                            const currentExtraData = values.extra_data || [];
                                                            const updatedExtraData = [{ ...currentExtraData[0], selectedValue: val }];
                                                            setFieldValue('extra_data', updatedExtraData, true); // Third arg: true for immediate validation
                                                            // setTouched({ ...touched, extra_data: true });
                                                            // formikRef.current?.validateField('extra_data'); // Mark as touched to show/hide errors dynamically
                                                            }}
                                                            initialvalue={initialvalue}
                                                            setOpenMap={setOpenMap} 
                                                            openMap={openMap}
                                                        />
                                                              {typedTouched.extra_data && typedErrors.extra_data && (
                                                                <Text color="red"  size="12px" mt={0}>
                                                                    {typedErrors.extra_data}
                                                                </Text>
                                                            )}    

                                                                </div>
                                                        {openMap && (
                                                            <Map is_fullScreen location={{
                                                                id: "1",
                                                                lat: maplocation.lat,
                                                                lng: maplocation.lng,
                                                            }}
                                                                 onClick={(e) => {

                                                                     setMapLocation({
                                                                         lat: e.latLng?.lat() ?? null,
                                                                         lng: e.latLng?.lng() ?? null,
                                                                     });
                                                                 }}
                                                            >

                                                                {maplocation?.lat !== null && maplocation?.lng !== null && (
                                                                    <MarkerF
                                                                        icon={"/svgs/pin.svg"}
                                                                        draggable
                                                                        onDragEnd={(e) => {
                                                                            setChangeLocation(true)
                                                                            setMapLocation({
                                                                                lat: e.latLng?.lat() ?? 1,
                                                                                lng: e.latLng?.lng() ?? 1,
                                                                            });
                                                                        }}
                                                                        position={{
                                                                            lat: maplocation?.lat,
                                                                            lng: maplocation?.lng,
                                                                        }}
                                                                    />
                                                                )}


                                                            </Map>)}

                                                    </>
                                                )}
                                                <DescriptionField
                                                    id="description"
                                                    name="description"
                                                    label="Description"
                                                    placeholder={renderType().desc}
                                                    touch={touched.description}
                                                    error={errors.description}
                                                    value={values.description}
                                                    onChange={(e) => setFieldValue('description', e.target.value)}
postClicked={postClicked} 

                                                    
                                                />

                                                {is_requested && is_requested !== "product" && (
                                                    <>
                                                        <Title order={5}
                                                               color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]}
                                                               weight={500} mb={24} mt={50}>
                                                            When do you want the task to be completed?
                                                        </Title>
                                                        <Grid gutter={22}>
                                                            <Grid.Col md={6}>
                                                                <DateField
                                                                    id="start_date"
                                                                    name="start_date"
                                                                    label="Select Start Date"
                                                                                                                                                                                                                                       withAsterisk={postClicked}


                                                                    placeholder="MM/DD/YYYY"
                                                                    error={errors.start_date}
                                                                    touch={touched.start_date}
                                                                    icon={<IconCalendarEvent size={20}/>}
                                                                    minDate={new Date()}
                                                                    onChange={(value) => setFieldValue("start_date", value)}
                                                                />
                                                                <SelectField
                                                                    icon={<IconClock size={15}/>}
                                                                    radius="md"
                                                                    size="md"
                                                                    error={errors.start_time}
                                                                    touch={touched.start_time}
                                                                    placeholder="Select start time"
                                                                    searchable
                                                                    handleChange={(value) => setFieldValue("start_time", value)}
                                                                    label="Select Start Time"
                                                                    name="start_time"
                                                                    data={TIME_INTERVAL}
                                                                />
                                                            </Grid.Col>
                                                            <Grid.Col md={6}>
                                                                <DateField
                                                                    id="end_date"
                                                                    name="end_date"
                                                                    label="Select End Date"
                                                                    placeholder="MM/DD/YYYY"
                                                                    error={errors.end_date}
                                                                    touch={touched.end_date}
                                                                                                                                                                                                                                      withAsterisk={postClicked}


                                                                    icon={<IconCalendarEvent size={20}/>}
                                                                    minDate={new Date()}
                                                                    onChange={(value) => setFieldValue("end_date", value)}
                                                                />
                                                                <SelectField
                                                                    icon={<IconClock size={15}/>}
                                                                    radius="md"
                                                                    size="md"
                                                                    error={errors.end_time}
                                                                    touch={touched.end_time}
                                                                    placeholder="Select end time"
                                                                    searchable
                                                                    handleChange={(value) => setFieldValue("end_time", value)}
                                                                    label="Select End Time"
                                                                    name="end_time"
                                                                    data={TIME_INTERVAL}
                                                                />
                                                            </Grid.Col>
                                                        </Grid>
                                                    </>
                                                )}
                                            </Box>
                                            
                                        </Grid.Col>
                                        <Grid.Col md={6}>
                                            <Box p={24} mt={24} style={{boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)"}}>
                                                <Title order={5}
                                                       color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]}
                                                       weight={500} mb={24}>
                                                    Budget
                                                </Title>
                                                {is_requested === "product" ? (
                                                    <div>
                                                        <SelectField
                                                            id="currency"
                                                            name="currency"
                                                            label="Currency"
                                                            searchable
                                                            placeholder="Select a currency"
                                                            data={currencyOption}
                                                            touch={touched.currency}
                                                            error={errors.currency}
                                                            value={values.currency}
                                                                                                                withAsterisk={postClicked}

                                                            handleChange={(value) => setFieldValue('currency', value)}
                                                        />
                                                        <NumberField
                                                            id="cost_price"
                                                            name="cost_price"
                                                            label="Cost Price"
                                                            value={values.cost_price}
                                                            type="number"
                                                            onChange={(value) => setFieldValue("cost_price", value)}
                                                            placeholder="Enter cost price"
                                                                                                                withAsterisk={postClicked}

                                                            
                                                        />
                                                        <NumberField
                                                            id="price"
                                                            name="price"                                                                      type="number"
                                                            label="Selling Price"
                                                            value={values.price}
                                                            onChange={(value) => setFieldValue('price', value)}
                                                            placeholder="Enter selling price"
                                                                                                                withAsterisk={postClicked}

                                                        />
                                                        <NumberField
                                                            id="discount_per"
                                                            name="discount_per"
                                                            label="Discount %"
                                                            type="number"
                                                            value={values.discount_per}
                                                            onChange={(value) => setFieldValue('discount_per', value)}
                                                            placeholder="Enter discount percentage"
                                                        />
                                                        {values.price && (
                                                            <Alert color="blue" icon={<IconAlertCircle size="1rem"/>}
                                                                   mb={16}>
                                                                Your product will be posted for{' '}
                                                                <Text component="span" weight={600}>
                                                                    {values.currency} {calculateFinalPrice(values.price, values.discount_per)}
                                                                </Text>
                                                            </Alert>
                                                        )}
                                                        <Checkbox
                                                            label="Is Active"
                                                            checked={values.is_active_product}
                                                            onChange={(e) => setFieldValue('is_active_product', e.currentTarget.checked)}
                                                            required
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <SelectField
                                                            id="currency"
                                                            name="currency"
                                                            label="Currency"
                                                            searchable
                                                            placeholder="Select a currency"
                                                            data={currencyOption}
                                                            touch={touched.currency}
                                                            error={errors.currency}
                                                    withAsterisk={postClicked}

                                                        />
                                                        <Radio.Group
                                                            id="budget_choose"
                                                            name="budget_choose"
                                                            label="Best Price"
                                                            value={values.budget_choose}
                                                            mb={24}
                                                            onChange={(budget) => {
                                                                setFieldValue("budget_from", null);
                                                                setFieldValue("budget_choose", budget);
                                                            }}
                                                            sx={{
                                                                ["& .mantine-RadioGroup-label"]: {
                                                                    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[8],
                                                                    fontWeight: 400,
                                                                    marginBottom: 4
                                                                }
                                                            }}
                                                    withAsterisk={postClicked}

                                                        >
                                                            <Flex justify={"flex-start"} gap={15}>
                                                                <Radio value="fixed" label="Fixed" size="xs"/>
                                                                <Radio value="variable" label="Variable" size="xs"/>
                                                            </Flex>
                                                        </Radio.Group>
                                                        <Grid>
                                                            {values.budget_choose === "variable" && (
                                                                <>
                                                                    <Grid.Col md={4}>
                                                                        <NumberField
                                                                            id="budget_from"
                                                                            name="budget_from"
                                                                            placeholder="Enter Price"
                                                                            touch={touched.budget_from}
                                                                            error={errors.budget_from}
                                                                            minimum={1}
                                                                            disabled={!values.service}
                                                                    type="number"
                                                                            withAsterisk
                                                                        />
                                                                    </Grid.Col>
                                                                    <Text mt={mediumScreen ? -20 : 20}
                                                                          ml={mediumScreen ? 16 : 0}>To</Text>
                                                                </>
                                                            )}
                                                            <Grid.Col md={4}>
                                                                <NumberField
                                                                   type="number"
                                                                    id="budget_to"
                                                                    name="budget_to"
                                                                    placeholder="Enter Price"
                                                                    touch={touched.budget_to}
                                                                    error={errors.budget_to}
                                                                    minimum={1}
                                                                    disabled={!values.service}
                                                                    withAsterisk
                                                                    required
                                                                />
                                                            </Grid.Col>
                                                            <Grid.Col lg={2}>
                                                                <SelectField
                                                                    // w={140}
                                                                    // size="lg"
                                                                    // maxLength={50}
                                                                    w={mediumScreen1 ? 100 : 140}
                                                                    id="budget_type"
                                                                    name="budget_type"
                                                                    placeholder="Budget type"
                                                                    data={budgetType}
                                                                    touch={touched.budget_type}
                                                                    error={errors.budget_type}
                                                                    withAsterisk
                                                                    mt={mediumScreen ? -24 : 0}
                                                                />
                                                            </Grid.Col>
                                                        </Grid>
                                                        {values.budget_to && values.service && (
                                                            <Alert color="blue" icon={<IconAlertCircle size="1rem"/>}
                                                                   mb={16}>
                                                                Your {renderType().value?.toLowerCase()} will be posted
                                                                for the price approximately about{" "}
                                                                {values.budget_from && (
                                                                    <span>
                                                                      {is_requested ? getReceivableAmount(values.budget_from as string, serviceCommission).toFixed(2) : getPayableAmount(values.budget_from as string, serviceCommission).toFixed(2)}{" "} to{" "}
                                                                    </span>
                                                                )}
                                                                <span>
                                                                    {is_requested ? getReceivableAmount(values.budget_to as string, serviceCommission).toFixed(2) : getPayableAmount(values.budget_to as string, serviceCommission).toFixed(2)}
                                                                </span>
                                                            </Alert>
                                                        )}
                                                        <Checkbox
                                                            checked={values.is_negotiable}
                                                            onChange={(event) => setFieldValue("is_negotiable", event.target.checked)}
                                                            label="Do you want to negotiate the price?"
                                                        />
                                                    </>
                                                )}
                                            </Box>
                                            <Box p={24} mt={24} style={{boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)"}}>
                                                <Title order={5}
                                                       color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]}
                                                       weight={500} mb={24}>
                                                    Media
                                                </Title>
                                                <MultiFileDropzone
                                                    name="images"
                                                    labelName="Upload your images"
                                                    textMuted={`More than ${MaxImages} images cannot be uploaded. File supported: .jpeg, .jpg, .png. Maximum size 4MB.`}
                                                    error={(errors.imagePreviewUrl as string) || (errors.images as string)}
                                                    touch={touched.images as unknown as boolean}
                                                    imagePreview={"imagePreviewUrl"}
                                                    maxFiles={MaxImages}
                                                    maxSize={4}
                                                    multiple
                                                    showFileDetail
                                                    {...(is_requested === "product" && {
                                                    onDrop: (files: File[]) => {
                                                        setFieldValue("images", files);
                                                        setFieldValue("imagePreviewUrl", files);
                                                        handleProductChange("images", files, undefined, { setFieldValue });
                                                    }
                                                })}
                                                />
                                                {is_requested !== "product" && (
                                                    <MultiFileDropzone
                                                        name="videos"
                                                        labelName="Upload your Video"
                                                        textMuted={`More than ${MaxVideos} videos cannot be uploaded. Maximum size 10MB.`}
                                                        error={(errors.videoPreviewUrl as string) || (errors.videos as string)}
                                                        touch={touched.videos as unknown as boolean}
                                                        imagePreview="videoPreviewUrl"
                                                        accept={["video/mp4"]}
                                                        maxFiles={MaxVideos}
                                                        maxSize={10}
                                                        multiple
                                                        showFileDetail
                                                    />
                                                )}
                                            </Box>

                                            {/*{is_requested === false && (() => {*/}
                                            {/*    const selectedCategory = categoryOptions.find((cat: { value: string | undefined; }) => cat.value === values.category);*/}
                                            {/*    return selectedCategory?.label?.toLowerCase() === "stays";*/}
                                            {/*})() && (*/}
                                            {/*    <Box p={24} mt={24} style={{ boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)" }}>*/}
                                            {/*        <Title order={5} color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]} weight={500} mb={24}>*/}
                                            {/*            Add your Stays Facilities*/}
                                            {/*        </Title>*/}
                                            {/*        <MultiSelect*/}
                                            {/*            id="facilities"*/}
                                            {/*            name="facilities"*/}
                                            {/*            // label="Facilities"*/}
                                            {/*            placeholder="Select facilities"*/}
                                            {/*            data={facilitiesOptions}*/}
                                            {/*            value={values.facilities}*/}
                                            {/*            onChange={(value) => setFieldValue("facilities", value)}*/}
                                            {/*            searchable*/}
                                            {/*            size={"md"}*/}
                                            {/*            radius={"md"}*/}
                                            {/*            mb={24}*/}
                                            {/*        />*/}
                                            {/*    </Box>*/}
                                            {/*)}*/}

                                            {/* <Box p={24} mt={24} style={{boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)"}}>
                                                <Title order={5}
                                                       color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]}
                                                       weight={500} mb={24}>
                                                    Terms & Conditions
                                                </Title>
                                                <Checkbox
                                                    label={<>I have read the <Link href="/homaale-terms-conditions"
                                                                                   target="_blank">terms and
                                                        conditions</Link></>}
                                                    mb={10}
                                                    checked={values.is_terms_condition}
                                                    onChange={(event) => setFieldValue("is_terms_condition", event.target.checked)}
                                                    error={touched.is_terms_condition && errors.is_terms_condition ? errors?.is_terms_condition : null}
                                                />
                                            </Box> */}
                                        </Grid.Col>
                                    </Grid>

                                    {is_requested === "product" && productFormData.product_option !== optionType.none && (
                                        <Flex mt={24} direction="column">
                                            <Title order={5} mb={16}>Variants</Title>
                                            {productFormData.variants?.length > 0 ? (
                                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                                    <thead>
                                                    <tr>
                                                        <th style={{padding: '8px'}}>SKU</th>
                                                        <th style={{padding: '8px'}}>Label</th>
                                                        {productFormData.product_option === optionType.size && (
                                                            <th style={{padding: '8px'}}>Size</th>
                                                        )}
                                                        {productFormData.product_option === optionType.color && (
                                                            <th style={{padding: '8px'}}>Color</th>
                                                        )}
                                                        {productFormData.product_option === optionType.colorSize && (
                                                            <>
                                                                <th style={{padding: '8px'}}>Size</th>
                                                                <th style={{padding: '8px'}}>Color</th>
                                                            </>
                                                        )}
                                                        <th style={{padding: '8px'}}></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {productFormData.variants.map((variant, index) => (
                                                        <tr key={index}>
                                                            <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                <TextInput
                                                                    label=""
                                                                    value={variant.SKU}
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                <TextInput
                                                                    label=""
                                                                    value={variant.label || `${values.title || ''} - ${variant.color || 'No Color'} / ${variant.size || 'No Size'}`}
                                                                    readOnly
                                                                />
                                                            </td>
                                                            {productFormData.product_option === optionType.size && (
                                                                <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                    <TextInput
                                                                        id={`size-${index}`}
                                                                        name={`size-${index}`}
                                                                        label=""
                                                                        placeholder="Enter product size"
                                                                        value={variant.size || ""}
                                                                        onChange={(e) => handleProductChange("size", e.currentTarget.value, index)}
                                                                        withAsterisk
                                                                    />
                                                                </td>
                                                            )}
                                                            {productFormData.product_option === optionType.color && (
                                                                <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                    <TextInput
                                                                        id={`color-${index}`}
                                                                        name={`color-${index}`}
                                                                        label=""
                                                                        placeholder="Enter product color"
                                                                        value={variant.color || ""}
                                                                        onChange={(e) => handleProductChange("color", e.currentTarget.value, index)}
                                                                        withAsterisk
                                                                    />
                                                                </td>
                                                            )}
                                                            {productFormData.product_option === optionType.colorSize && (
                                                                <>
                                                                    <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                        <TextInput
                                                                            id={`size-${index}`}
                                                                            name={`size-${index}`}
                                                                            label=""
                                                                            placeholder="Enter product size"
                                                                            value={variant.size || ""}
                                                                            onChange={(e) => handleProductChange("size", e.currentTarget.value, index)}
                                                                            withAsterisk
                                                                        />
                                                                    </td>
                                                                    <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                        <TextInput
                                                                            id={`color-${index}`}
                                                                            name={`color-${index}`}
                                                                            label=""
                                                                            placeholder="Enter product color"
                                                                            value={variant.color || ""}
                                                                            onChange={(e) => handleProductChange("color", e.currentTarget.value, index)}
                                                                            withAsterisk
                                                                        />
                                                                    </td>
                                                                </>
                                                            )}
                                                            <td style={{padding: '8px', verticalAlign: 'top'}}>
                                                                {productFormData.variants.length > 0 && (
                                                                    <Button
                                                                        color="red"
                                                                        variant="outline"
                                                                        size="xs"
                                                                        onClick={() => handleProductChange("deleteVariant", null, index)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <Text>No variants available. Click &quot;Add Variant&quot; to create
                                                    one.</Text>
                                            )}
                                            <Button
                                                mt={16}
                                                onClick={() => handleProductChange("addVariant", null, undefined, values)}
                                                leftIcon={<IconPlus size={16}/>}
                                            >
                                                Add Variant
                                            </Button>
                                        </Flex>
                                    )}

                                    {/* <Box p={24} mt={24} style={{boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)"}}>
                                            <Title order={5}
                                                   color={theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.homaaleSlate[9]}
                                                   weight={500} mb={24}>
                                                Terms & Conditions
                                            </Title>
                                                <Checkbox
                                                    label={<>I have read the <Link href="/homaale-terms-conditions"
                                                                                   target="_blank">terms and
                                                        conditions</Link></>}
                                                    mb={10}
                                                    checked={values.is_terms_condition}
                                                    onChange={(event) => setFieldValue("is_terms_condition", event.target.checked)}
                                                    error={touched.is_terms_condition && errors.is_terms_condition ? errors?.is_terms_condition : null}
                                                /> */}

                                        {/*{status_choice !== Status.Published && is_requested !== "product" && (*/}
                                        {/*    // <Box mt={15}>*/}
                                        {/*    //     <Flex>*/}
                                        {/*    // <Text size="sm" fw={500} mb={5}>*/}
                                        {/*    //     Status*/}
                                        {/*    // </Text>*/}
                                        {/*    // <Switch*/}
                                        {/*    //     id="status_choice"*/}
                                        {/*    //     name="status_choice"*/}
                                        {/*    //     // label="Status"*/}
                                        {/*    //     checked={values.status_choice === Status.Published}*/}
                                        {/*    //     onChange={(e) => setFieldValue("status_choice", e.currentTarget.checked ? Status.Published : Status.Draft)}*/}
                                        {/*    //     onLabel={<span style={{ fontSize: '14px'}}>Published</span>}*/}
                                        {/*    //     offLabel={<span style={{ fontSize: '14px'}}>Draft</span>}*/}
                                        {/*    //     mt={15}*/}
                                        {/*    //     error={touched.status_choice}*/}
                                        {/*    // />*/}
                                        {/*    //     </Flex>*/}
                                        {/*    // </Box>*/}
                                        {/*)}*/}
                                    {/* </Box> */}

                                  
                                </FocusTrap>
                            </Form>
                            )}}
                    </Formik>
                </Box>
            </div>
        </Layout>
    );
};
export default Entity;
