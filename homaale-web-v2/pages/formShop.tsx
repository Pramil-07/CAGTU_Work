import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    TextInput,
    NumberInput,
    Textarea,
    Checkbox,
    Title,
    Paper,
    Group,
    Text,
    Box,
    useMantineTheme,
    Flex,
    Select,
    MantineNumberSize, Alert,
} from '@mantine/core';
import {IconUser, IconPencil, IconAlertCircle} from '@tabler/icons-react';
import Layout from "@/components/Layout/Layout";
import {useDark} from "@/utils/helpers";
import {axiosClient} from "@/utils/axiosClient";
import {useRouter} from "next/router";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import {Editor} from 'primereact/editor';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import {PlacesAutocomplete} from "@/components/common/form/PlacesAutoComplete";
import Map from "@/components/common/Map";
import {Circle, MarkerF} from "@react-google-maps/api";
import {toast} from "@/components/common/Toast";
import type {LocationProps} from "@/types/LocationProps";
import {useAppSelector} from "@/hooks";
import {useGeocoding} from "@/hooks/useGeocoding";

interface FormData {
    name: string;
    category: number | "" | undefined;
    latitude: number | null;
    longitude: number | null;
    about: string;
    images: File [] | null;
    is_active: boolean;
    address: string;
}

interface Category {
    id: string;
    name: string;
}

interface Shop {
    id: string;
    name: string;
    about: string;
    category: number;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    location: string;
    owner: string;
    images: Array<{
        id: number;
        image: string;
        uploaded_at: string;
    }>;
    created_at: string;
    updated_at: string;
}

type ExistingImage = {
    id: number;
    image: string;
    uploaded_at: string;
};

type ShopImage = File | ExistingImage;

const ShopForm = () => {
    const router = useRouter();
    const {id} = router.query;
    const [formData, setFormData] = useState<FormData>({
        name: '',
        category: '',
        latitude: null,
        longitude: null,
        about: '',
        images: null as File[] | null,
        is_active: true,
        address: ''
    });
    const [category, setCategory] = useState<Category[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const theme = useMantineTheme();
    const dark = useDark();
    const [imageError, setImageError] = useState<string | null>(null);
    const [openMap, setOpenMap] = useState(false);
    const [onChangeLocation, setChangeLocation] = useState(false);
    // console.log('onchangelocation', onChangeLocation)

    const {data: locations, radius} = useAppSelector(
        (state) => state.locationReducer
    );
    const [maplocation, setMapLocation] = useState<{
        selected?: string,
        lat: LocationProps["data"]["latitude"];
        lng: LocationProps["data"]["longitude"];
    }>({
        selected: '',
        lat: null,
        lng: null,
    });

    const {data} = useGeocoding(
        `${maplocation.lat},${maplocation.lng}`
    );


    // Fetch categories and shop data
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosClient.get("/product/list-category/");
                setCategory(response.data);
            } catch {
                console.log("Error fetching category list");
            }
        };

        const fetchShopData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const response = await axiosClient.get(`/product/shops/${id}/`);
                    const shopData = response.data;
                    // console.log("shop data", shopData)
                    setFormData({
                        name: shopData.name || '',
                        category: shopData.category || '',
                        latitude: shopData.latitude || '',
                        longitude: shopData.longitude || '',
                        about: shopData.about || '',
                        images: shopData.images ?? [],
                        is_active: shopData.is_active || true,
                        address: shopData.address || '',
                    });
                    if (shopData.images && shopData.images.length > 0) {
                        setPreviewUrl(shopData.images[0].image);
                    }
                } catch (error) {
                    console.error("Error fetching shop data:", error);
                } finally {
                    setLoading(false);
                    setOpenMap(!openMap);
                }
            }
        };
        fetchCategories();
        fetchShopData();
    }, [id]);
    // console.log("shop lat lng", maplocation.lng, maplocation.lat)
    //shop lat lng 93.33585487530804 27.67189472334288
    useEffect(() => {
        if (formData) {
            const {latitude, longitude, address} = formData;

            setMapLocation(prev => ({
                ...prev,
                selected: formData.address,
                lat: formData.latitude,
                lng: formData.longitude,
            }));
        }
    }, [formData]);
    const initialvalue = onChangeLocation ? data : formData.address;
    // console.log("onchange initial value", initialvalue);

    const handleInputChange = (name: keyof FormData) => (value: string | number | "" | undefined) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditorChange = (e: { htmlValue: string | null }) => {
        setFormData(prevState => ({
            ...prevState,
            about: e.htmlValue || ''
        }));
    };

    // const handleFileInputChange = (file: File | null) => {
    //     if (file) {
    //         const fileSizeInMB = file.size / (1024 * 1024);
    //         if (fileSizeInMB > 1) {
    //             setImageError("Image size should be less than 1 MB");
    //             setFormData(prevState => ({
    //                 ...prevState,
    //                 images: null
    //             }));
    //             setPreviewUrl(null);
    //             return;
    //         } else {
    //             setImageError(null);
    //         }
    //
    //         setFormData(prevState => ({
    //             ...prevState,
    //             images: file
    //         }));
    //
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setPreviewUrl(reader.result as string);
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         setImageError(null);
    //         setPreviewUrl(null);
    //     }
    // };

    const handleFileInputChange = (files: File[]) => {
        const MAX_TOTAL_SIZE_MB = 2;
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = totalSize / (1024 * 1024);
        // console.log("totalSize", totalSizeMB);

        if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
            setImageError(`Total image size must be under ${MAX_TOTAL_SIZE_MB} MB`);
            setFormData(prev => ({...prev, images: null}));
            setPreviewUrl(['']);
            return;
        }

        setImageError(null);
        setFormData(prev => ({...prev, images: files}));

        const readers = files.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(results => {
            setPreviewUrl(results);
        });
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevState => ({
            ...prevState,
            is_active: event.currentTarget.checked
        }));
    };

    // console.log('fom address', formData.address)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errorMessages: string[] = [];


        const submitData = new FormData();
        if (formData.name) submitData.append('name', formData.name);
        if (formData.category !== '' && formData.category !== undefined) {
            submitData.append('category', formData.category.toString());
        }
        if (maplocation.lat !== null) {
            submitData.append('latitude', maplocation?.lat.toString());
        }
        if (maplocation.lng !== null) {
            submitData.append('longitude', maplocation.lng.toString());
        }
        if (formData.about) submitData.append('about', formData.about);

        if (formData.images && formData.images.length > 0) {
            formData.images.forEach((imgFile) => {
                submitData.append('images', imgFile);
            });
        }
        if (maplocation.selected) submitData.append('address', maplocation.selected?.toString());

        submitData.append('is_active', formData.is_active.toString());

        try {
            if (id) {
                const response = await axiosClient.patch(`/product/shops/${id}/`, submitData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });
                // console.log('Shop updated successfully:', response.data);
                router.push(`/shops/${id}/`);
            } else {
                const response = await axiosClient.post('/product/shops/', submitData, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });
                // console.log('Shop created successfully:', response.data);
                setFormData({
                    name: '',
                    category: '',
                    latitude: null,
                    longitude: null,
                    about: '',
                    images: null,
                    is_active: true,
                    address: '',
                });
                setPreviewUrl(['']);
                router.push(`/shops/${response.data.id}/`);
            }
        } catch (error: any) {
            // Handle network or unexpected errors
            // toast.error(error.message );
            //     console.log("error", error.request.response);
            // }
            if (error.response) {
                const data = error.response.data;
                console.error("Server error response:", data);

                if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
                    data.non_field_errors.forEach((item: string) => {
                        // Try to extract the nested message
                        const match = item.match(/'__all__': \['(.+?)'\]/);
                        if (match && match[1]) {
                            toast.error(match[1]);  // Show: "Cannot create shop. Basic merchants are limited to 2 shops."
                        } else {
                            toast.error(item); // Fallback if pattern doesn't match
                        }
                    });
                } else {
                    Object.entries(data).forEach(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            messages.forEach(msg => toast.error(`${field}: ${msg}`));
                        } else {
                            toast.error(`${field}: ${messages}`);
                        }
                    });
                }
            } else if (error.request) {
                toast.error("No response from the server.");
            } else {
                toast.error("Request error: " + error.message);
            }

            // Show each error as a toast
            // if (errorMessages.length > 0) {
            //     errorMessages.forEach((msg) => toast.error(msg));
        }
    };

    useEffect(() => {
        const files = formData?.images as ShopImage[];

        if (files && files.length) {
            const fileUrls: string[] = files.map((file) =>
                file instanceof File ? '' : file.image
            );
            setPreviewUrl(fileUrls);
        }
    }, [formData?.images]);


    if (loading) {
        return (
            <Layout currentTitle="Edit Shop">
                <div className="flex justify-center items-center h-screen">
                    <HomaaleLoader/>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentTitle={id ? "Edit Shop" : "Post"}>
            <Box
                p={{
                    base: "10px 15px",
                    sm: "15px 30px",
                    md: "20px 40px",
                    lg: "30px 50px",
                    xl: "40px 60px"
                } as unknown as MantineNumberSize}
                style={{
                    width: "95%",
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Title order={3} size={20} weight={600}>
                    {id ? "Edit Your Shop" : "Create Your Shop"}
                </Title>
                <form onSubmit={handleSubmit} className="mt-10">
                    <Paper shadow="xs" p="lg" className="align-middle">
                        {/* Image Upload Section */}
                        <div className="mb-8">
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Text component="label" size="sm" weight={500} mb={5} mr={50} style={{display: 'flex'}}>
                                    Upload Image
                                </Text>
                                <div
                                    style={{
                                        width: '110px',
                                        height: '110px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f5f5f5',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        border: '1px solid #e0e0e0',
                                    }}
                                >
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px dashed #ccc',
                                        borderRadius: '8px'
                                    }}>
                                        <IconUser size={40} stroke={1.5} color="#a0a0a0"/>
                                    </div>
                                    <label
                                        htmlFor="image-upload"
                                        style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            right: '8px',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '50%',
                                            width: '2rem',
                                            height: '2rem',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        <IconPencil size={12} color="#5c5c5c"/>
                                    </label>
                                </div>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = e.target.files ? Array.from(e.target.files) : [];
                                        handleFileInputChange(files); // Updated to pass multiple files
                                    }}
                                    style={{display: 'none'}}
                                />
                            </div>
                            {imageError && (
                                <Alert color="blue" icon={<IconAlertCircle size="1rem"/>} mb={16}>
                                    <Text component="span" weight={600}>
                                        {imageError}
                                    </Text>
                                </Alert>
                            )}
                        </div>


                        {previewUrl && Array.isArray(previewUrl) && previewUrl.length > 0 && (
                            <div
                                style={{
                                    marginTop: '1.5rem',
                                    marginBottom: "1.5rem",
                                    padding: '1rem',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '2rem',
                                    border: '1px solid gray-100',
                                    borderRadius: '12px',
                                    backgroundColor: '#fff8f1',
                                    boxShadow: '0 2px 8px rgba(255, 165, 0, 0.08)',
                                }}
                            >
                                {previewUrl.map((url, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: '90px',
                                            height: '90px',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            border: '1px solid #f8cba0',
                                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                                            backgroundColor: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'transform 0.2s ease-in-out',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.5)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <img
                                            src={url}
                                            alt={`Preview ${index}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}


                        <TextInput
                            label="Shop Name"
                            placeholder="Enter shop name"
                            value={formData.name}
                            onChange={(event) => handleInputChange('name')(event.currentTarget.value)}
                            required
                            mb="md"
                        />

                        <Select
                            label="Category"
                            placeholder="Select a category"
                            data={category.map(cat => ({
                                value: cat.id.toString(),
                                label: cat.name,
                            }))}
                            value={formData.category?.toString() || null}
                            onChange={(value) => handleInputChange('category')(value ? parseInt(value) : '')}
                            required
                            mb="md"
                            searchable
                        />

                        <div className="mb-4">
                            <Text size="sm" weight={500} mb={5}>
                                About
                            </Text>
                            <Editor
                                value={formData.about}
                                onTextChange={handleEditorChange}
                                style={{height: '150px'}}
                                placeholder="Describe your shop"
                                required
                            />
                        </div>


                        <PlacesAutocomplete setCurrentLocation={setMapLocation} initialvalue={initialvalue}
                                            setOpenMap={setOpenMap} openMap={openMap}/>


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

                        <Checkbox
                            label="Is Active"
                            checked={formData.is_active}
                            onChange={handleCheckboxChange}
                            mb="lg"
                        />
                    </Paper>
                    <div>
                        <Flex justify={"center"} gap={30} mt={20}>
                            <Button
                                variant="outline"
                                sx={{
                                    color: theme.colors.secondary[2],
                                    marginTop: 2,
                                    border: `1px solid ${theme.colors.secondary[2]}`
                                }}
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" color="orange">
                                {id ? "Update Shop" : "Submit Shop"}
                            </Button>
                        </Flex>
                    </div>
                </form>
            </Box>
        </Layout>
    );
};

export default ShopForm;
