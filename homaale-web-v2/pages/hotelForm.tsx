import { Box, Button, Checkbox, Flex, Grid, Title, useMantineTheme } from "@mantine/core";
import { LoadingOverlay } from "@mantine/core";
import { FocusTrap } from "@mantine/core";
import { MultiSelect } from "@mantine/core";
import { Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { debounce } from "lodash";
import Link from "next/link";

import InputField from "@/components/common/form/InputField";
import DescriptionField from "@/components/common/form/DescriptionField";
import MultiFileDropzone from "@/components/common/form/MultiFileDropzone";
import { PlacesAutocomplete } from "@/components/common/form/PlacesAutoComplete";
import Map from "@/components/common/Map";
import { MarkerF } from "@react-google-maps/api";
import Layout from "@/components/Layout/Layout";
import { toast } from "@/components/common/Toast";
import { useFileStore } from "@/hooks/useFileStore";
import { axiosClient } from "@/utils/axiosClient";
import HomaaleLoader from "@/components/common/HomaaleLoader";
import SelectField from "@/components/common/form/SelectField";
import { useCityOption } from "@/hooks/useCityOptions";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useCategoryOptions } from "@/hooks/useCategoryOptions";
import { useServiceOption } from "@/hooks/useServiceOptions";
import {NestedCategoryProps} from "@/types/NestedCategoryProps";
import {useStaysServices} from "@/hooks/useStaysServices";
import {useRouter} from "next/router";

interface Amenity {
    id: number;
    name: string;
    label?: string;
}

const hotelTypeOptions = [
    { value: "hotel", label: "Hotel" },
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "resort", label: "Resort" },
];

const validationSchema = Yup.object().shape({
    // hotel_type: Yup.string().required("Hotel type is required"),
    // name: Yup.string().required("Hotel name is required").min(3, "Name too short"),
    // description: Yup.string().required("Description is required"),
    // city: Yup.string().required("City is required"),
    // latitude: Yup.number()
    //     .required("Latitude is required")
    //     .typeError("Must be a number")
    //     .test('decimal-places', 'Latitude can have max 5 decimal places', (value) => {
    //         if (!value) return true;
    //         const decimalPart = value.toString().split('.')[1];
    //         return !decimalPart || decimalPart.length <= 5;
    //     }),
    // longitude: Yup.number()
    //     .required("Longitude is required")
    //     .typeError("Must be a number")
    //     .test('decimal-places', 'Longitude can have max 5 decimal places', (value) => {
    //         if (!value) return true;
    //         const decimalPart = value.toString().split('.')[1];
    //         return !decimalPart || decimalPart.length <= 5;
    //     }),
    // amenities: Yup.array().min(1, "Select at least one amenity"),
    // images: Yup.array().min(1, "At least one image is required"),
    // is_terms_condition: Yup.boolean().oneOf([true], "You must accept the terms and conditions"),
});

const HotelCreate = () => {
    const router = useRouter();
    const theme = useMantineTheme();
    const formikRef = useRef<any>(null);
    const [openMap, setOpenMap] = useState(false);
    const [onChangeLocation, setChangeLocation] = useState(false);
    const [location, setLocation] = useState<{
        lat: number | null;
        lng: number | null;
        address: string;
        selected?: string;
    }>({
        lat: null,
        lng: null,
        address: "",
        selected: "",
    });

    const { mutateAsync: uploadFileMutation, isLoading: uploadLoading } = useFileStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [amenityOptions, setAmenityOptions] = useState<{ value: string; label: string }[]>([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(true);

    const [searchCity, setSearchCity] = useState("");
    const { data: cityOptions = [] } = useCityOption(searchCity);

    // Get geocoding data when location changes
    const { data: geocodingData } = useGeocoding(
        onChangeLocation ? `${location.lat},${location.lng}` : null
    );

    const { data: staysServices = [], isLoading: serviceLoading } =
        useStaysServices();

    const serviceOptions = staysServices.map((s: any) => ({
        value: s.id,
        label: s.title,
    }));
    const STAYS_CATEGORY_ID = "132";
    // Update location address when geocoding data changes
    useEffect(() => {
        if (onChangeLocation && geocodingData) {
            setLocation(prev => ({
                ...prev,
                address: geocodingData,
                selected: geocodingData
            }));
            if (formikRef.current) {
                formikRef.current.setFieldValue("address", geocodingData);
            }
        }
    }, [geocodingData, onChangeLocation]);

    useEffect(() => {
        const loadAmenities = async () => {
            try {
                setAmenitiesLoading(true);
                const { data } = await axiosClient.get<Amenity[]>("/hotel/amenities/list/?type=Hotel/");
                const options = data.map((a) => ({
                    value: String(a.id),
                    label: a.label ?? a.name ?? `Amenity ${a.id}`,
                }));
                setAmenityOptions(options);
            } catch (err) {
                // toast.error("Failed to load amenities");
                console.error(err);
            } finally {
                setAmenitiesLoading(false);
            }
        };

        loadAmenities();
    }, []);

    return (
        <Layout currentTitle="Add Hotel">
            <LoadingOverlay visible={isSubmitting || uploadLoading} loader={<HomaaleLoader />} />

            <Box p={{ base: 15, sm: 30, md: 40, lg: 50 }} h="100%">
                <Title order={3} size={20} weight={600} mb={22}>
                    Add New Hotel
                </Title>

                <Formik
                    enableReinitialize={true}
                    innerRef={formikRef}
                    initialValues={{
                        hotel_type: "",
                        name: "",
                        description: "",
                        address: "",
                        city: "",
                        latitude: null,
                        longitude: null,
                        amenities: [],
                        images: [],
                        imagePreviewUrl: [],
                        is_terms_condition: false,
                        category: STAYS_CATEGORY_ID,
                        service: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        setIsSubmitting(true);
                        const formData = new FormData();

                        // Append all text fields
                        formData.append("hotel_type", values.hotel_type);
                        formData.append("name", values.name);
                        formData.append("description", values.description);
                        formData.append("address", values.address);
                        formData.append("country", "NP");
                        formData.append("city", values.city);
                        formData.append("latitude", String(values.latitude ?? ""));
                        formData.append("longitude", String(values.longitude ?? ""));
                        formData.append("service", values.service);

                        // Append amenities
                        values.amenities.forEach((id) => formData.append("amenities", id));

                        // Append images (only File objects)
                        if (values.images?.length > 0) {
                            values.images.forEach((img: File) => {
                                if (img instanceof File) {
                                    formData.append('hotel_images', img);
                                }
                            });
                        }

                        try {
                            console.log("Sending FormData with files...");
                            await axiosClient.post("/hotel/create/", formData,);

                            resetForm();
                            setLocation({ lat: null, lng: null, address: "", selected: "" });
                            toast.success("Hotel created successfully!");
                            router.push("/merchant/profile");
                        } catch (error: any) {
                            const err = error.response?.data;
                        } finally {
                            setIsSubmitting(false);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, touched, setFieldValue, values, isValid, dirty }) => (
                        <Form>
                            <FocusTrap active>
                                <Grid gutter={30}>
                                    {/* Left Column */}
                                    <Grid.Col md={6}>
                                        <Box p={24} sx={{ boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)" }}>
                                            <Title order={5} weight={500} mb={24}>
                                                Hotel Details
                                            </Title>

                                            <InputField
                                                name="name"
                                                label="Hotel Name"
                                                placeholder="Enter hotel name"
                                                required
                                                // error={touched.name && errors.name}
                                                withAsterisk
                                            />

                                            <DescriptionField
                                                name="description"
                                                label="Description"
                                                placeholder="Describe your hotel..."
                                                required
                                                // error={touched.description && errors.description}
                                                withAsterisk
                                            />

                                            <SelectField
                                                id="category"
                                                name="category"
                                                label="Category"
                                                placeholder="Stays"
                                                data={[{ value: STAYS_CATEGORY_ID, label: "Stays" }]}
                                                value={values.category}
                                                disabled
                                                readOnly
                                                withAsterisk
                                            />

                                            {/* ---- SERVICE (child services of Stays) ---- */}
                                            <SelectField
                                                id="service"
                                                name="service"
                                                label="Service"
                                                placeholder={
                                                    serviceLoading ? "Loading services…" : "Select a service"
                                                }
                                                data={serviceOptions}
                                                value={values.service}
                                                onChange={(v) => setFieldValue("service", v)}
                                                searchable
                                                clearable
                                                disabled={serviceLoading}
                                                // error={touched.service && errors.service}
                                                touch={touched.service}
                                                withAsterisk
                                                required
                                            />
                                            <Grid mt={16}>
                                                <Grid.Col span={6}>
                                                    <SelectField
                                                        id="city"
                                                        name="city"
                                                        label="City"
                                                        placeholder="Search and select city"
                                                        data={cityOptions}
                                                        onSearchChange={debounce((value) => setSearchCity(value), 500)}
                                                        searchable
                                                        touch={touched.city}
                                                        error={errors.city}
                                                        handleChange={(value) => setFieldValue("city", value)}
                                                        withAsterisk
                                                    />
                                                </Grid.Col>
                                                <Grid.Col span={6}>
                                                    <SelectField
                                                        id="hotel_type"
                                                        name="hotel_type"
                                                        label="Hotel Type"
                                                        placeholder="Select hotel type"
                                                        data={hotelTypeOptions}
                                                        searchable
                                                        touch={touched.hotel_type}
                                                        error={errors.hotel_type}
                                                        handleChange={(value) => setFieldValue("hotel_type", value)}
                                                        withAsterisk
                                                    />
                                                </Grid.Col>
                                            </Grid>

                                            <Box mt={16}>
                                                <PlacesAutocomplete
                                                    setCurrentLocation={(loc: any) => {
                                                        setChangeLocation(false);
                                                        setLocation({
                                                            lat: loc.lat,
                                                            lng: loc.lng,
                                                            address: loc.address,
                                                            selected: loc.address
                                                        });
                                                        setFieldValue("address", loc.address);
                                                        setFieldValue("latitude", loc.lat);
                                                        setFieldValue("longitude", loc.lng);

                                                        // Find and set city ID if it matches
                                                        if (loc.city) {
                                                            setSearchCity(loc.city);
                                                            setTimeout(() => {
                                                                const matchingCity = cityOptions.find((city) => {
                                                                    // Safely check if label exists and compare
                                                                    return city.label?.toLowerCase() === loc.city?.toLowerCase();
                                                                });

                                                                if (matchingCity?.value) {
                                                                    setFieldValue("city", matchingCity.value);
                                                                }
                                                            }, 500);
                                                        }
                                                    }}
                                                    initialvalue={location.selected || location.address}
                                                    setOpenMap={setOpenMap}
                                                    openMap={openMap}
                                                />
                                            </Box>

                                            {openMap && (
                                                <Box mt={16} h={410} pos="relative">
                                                    <Map
                                                        location={{id: "1", lat: location.lat!, lng: location.lng! }}
                                                        onClick={(e) => {
                                                            const lat = e.latLng?.lat();
                                                            const lng = e.latLng?.lng();
                                                            if (lat && lng) {
                                                                setChangeLocation(true);
                                                                setLocation(prev => ({ ...prev, lat, lng }));
                                                                setFieldValue("latitude", lat);
                                                                setFieldValue("longitude", lng);
                                                            }
                                                        }}
                                                    >
                                                        {location.lat && location.lng && (
                                                            <MarkerF
                                                                position={{ lat: location.lat, lng: location.lng }}
                                                                draggable
                                                                onDragEnd={(e) => {
                                                                    const lat = e.latLng?.lat();
                                                                    const lng = e.latLng?.lng();
                                                                    if (lat && lng) {
                                                                        setChangeLocation(true);
                                                                        setLocation(prev => ({ ...prev, lat, lng }));
                                                                        setFieldValue("latitude", lat);
                                                                        setFieldValue("longitude", lng);
                                                                    }
                                                                }}
                                                                icon={"/svgs/pin.svg"}
                                                            />
                                                        )}
                                                    </Map>
                                                </Box>
                                            )}

                                            <MultiSelect
                                                label="Amenities"
                                                placeholder={amenitiesLoading ? "Loading…" : "Select amenities"}
                                                data={amenityOptions}
                                                value={values.amenities}
                                                onChange={(val) => setFieldValue("amenities", val)}
                                                searchable
                                                clearable
                                                mt="md"
                                                disabled={amenitiesLoading}
                                                // loading={amenitiesLoading}
                                                error={touched.amenities && errors.amenities}
                                                withAsterisk
                                            />
                                        </Box>
                                    </Grid.Col>

                                    {/* Right Column - Images */}
                                    <Grid.Col md={6}>
                                        <Box p={24} sx={{ boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)" }}>
                                            <Title order={5} weight={500} mb={24}>
                                                Hotel Images
                                            </Title>

                                            <MultiFileDropzone
                                                name="images"
                                                labelName="Upload Hotel Images"
                                                textMuted="Max 50 images. Supported: .jpeg, .jpg, .png. Max size 4MB."
                                                maxFiles={50}
                                                maxSize={4}
                                                multiple
                                                showFileDetail
                                                imagePreview="imagePreviewUrl"
                                                error={errors.images as string}
                                            />
                                        </Box>

                                        {/* Terms & Conditions */}
                                        <Box p={24} mt={24} sx={{ boxShadow: "6px 0px 18px rgba(163, 171, 185, 0.2)" }}>
                                            <Title order={5} weight={500} mb={24}>
                                                Terms & Conditions
                                            </Title>
                                            <Checkbox
                                                label={
                                                    <>
                                                        I have read the{" "}
                                                        <Link href="/homaale-terms-conditions" target="_blank">
                                                            terms and conditions
                                                        </Link>
                                                    </>
                                                }
                                                mb={10}
                                                checked={values.is_terms_condition}
                                                onChange={(event) =>
                                                    setFieldValue("is_terms_condition", event.target.checked)
                                                }
                                                error={
                                                    touched.is_terms_condition && errors.is_terms_condition
                                                        ? errors.is_terms_condition
                                                        : null
                                                }
                                            />
                                        </Box>
                                    </Grid.Col>
                                </Grid>

                                {/* Submit Buttons */}
                                <Flex justify="center" gap={20} mt={40}>
                                    <Button
                                        variant="outline"
                                        color="gray"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={!dirty || !isValid || isSubmitting || !values.is_terms_condition}
                                        loading={isSubmitting}
                                        sx={{
                                            backgroundColor: theme.colors.brand[4],
                                            "&:hover": { backgroundColor: theme.colors.brand[5] },
                                        }}
                                    >
                                        Create Hotel
                                    </Button>
                                </Flex>
                            </FocusTrap>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Layout>
    );
};

export default HotelCreate;
