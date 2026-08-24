import {
    Box,
    Button,
    Checkbox,
    Flex,
    FocusTrap,
    Grid,
    LoadingOverlay,
    Radio,
    Title,
    useMantineTheme,
} from "@mantine/core";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Form, Formik} from "formik";
import _ from "lodash";
import {debounce} from "lodash";
import Link from "next/link";
import type {Dispatch, SetStateAction} from "react";
import {useState} from "react";
import React from "react";

import urls from "@/constants/urls";
import {useCityOption} from "@/hooks/useCityOptions";
import {useFileStore} from "@/hooks/useFileStore";
import {useBookingModalStyles} from "@/styles/components/BookingModalStyles";
import type {BookingDataProps} from "@/types/booking/BookingDataProps";
import type {
    BookingExtendedPayload,
    BookingPayload,
} from "@/types/booking/BookingPayload";
import {axiosClient} from "@/utils/axiosClient";
import {scrollToElement} from "@/utils/helpers";
import {bookingFormVariableSchema} from "@/utils/validation/BookingValidation";

import DescriptionField from "../common/form/DescriptionField";
import FormButton from "../common/form/FormButton";
import InputField from "../common/form/InputField";
import {ListField} from "../common/form/ListField";
import MultiFileDropzone from "../common/form/MultiFileDropzone";
import NumberField from "../common/form/NumberField";
import SelectField from "../common/form/SelectField";
import HomaaleLoader from "../common/HomaaleLoader";
import {toast} from "../common/Toast";
import {useRouter} from "next/router";
import {PlacesAutocomplete} from "@/components/common/form/PlacesAutoComplete";
import Map from "@/components/common/Map";
import {MarkerF} from "@react-google-maps/api";
import type {LocationProps} from "@/types/LocationProps";
import {useGeocoding} from "@/hooks/useGeocoding";

export const BookingForm = ({
                                bookingData,
                                prevStep,
                                selectedDateTime,
                                setOpened,
                                is_editing,
                            }: {
    is_editing?: boolean;
    selectedDateTime: { date: string; start: string; end: string };
    prevStep: () => void;
    setOpened: Dispatch<SetStateAction<boolean>>;
    bookingData: BookingDataProps;
}) => {
    const theme = useMantineTheme();
    const {classes} = useBookingModalStyles();

    const queryClient = useQueryClient();
    const [onChangeLocation, setChangeLocation] = useState(false);
    const [openMap, setOpenMap] = useState(false);

    const [maplocation, setMapLocation] = useState<{
        selected?: string,
        lat: LocationProps["data"]["latitude"];
        lng: LocationProps["data"]["longitude"];
    }>({
        selected: '',
        lat: null,
        lng: null,
    });


    const {
        service,
        title,
        budget_to,
        budget_from,
        budget_type,
        currency,
        location,
        is_negotiable,
        images,
        videos,
        entity_service,
        id,
        description,
        highlights,
        is_range,
        payable_from,
        payable_to,
        is_requested,
        is_online,
        city,
    } = bookingData;
    // console.log('booking data', bookingData)

    const {data} = useGeocoding(
        `${maplocation.lat},${maplocation.lng}`
    );
    const initialvalue = onChangeLocation ? data : location;

    // console.log('map initial', initialvalue)
    // console.log('map selected ', data)
    // console.log('latitude:', maplocation.lat, "longitued", maplocation.lng, data)


    //To assign max file number of Images and videos
    const MaxImages = 5;
    const MaxVideos = 1;

    //For Filestore API
    const {mutateAsync: uploadFileMutation, isLoading: uploadFileLoading} =
        useFileStore();

    const {mutate, isLoading} = useMutation<any, Error, BookingPayload>(
        async (payload) => {
            if (id) {
                await axiosClient.patch<BookingPayload>(
                    `${urls.entity.booking}${id}/`,
                    payload
                );
            } else
                await axiosClient.post<BookingPayload>(
                    urls.entity.booking,
                    payload
                );
        }
    );

    const getServiceImages =
        images &&
        images.map((val) => {
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

    const getServiceVideos =
        videos &&
        videos.map((val) => {
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

    //Destructing city according to mantine SelectItem[]
    const cityEditInitial = {
        id: city?.id ?? "",
        label: city?.name ?? "",
        value: city?.id.toString() ?? "",
    };
    const router = useRouter()

    // To fetch data from api only when user enters more than 2 characters in the select field
    const [searchCity, setSearchCity] = useState("");
    const {data: cityOptions = [cityEditInitial]} = useCityOption(searchCity);

    function convertTo12Hour(start_time: string, end_time: string) {
        const to12Hour = (time: string) => {
            try {
                const [hours, minutes] = time.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) {
                    throw new Error('Invalid time format');
                }
                const period = hours >= 12 ? 'PM' : 'AM';
                const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
                return minutes === 0 ? `${adjustedHours}${period}` : `${adjustedHours}:${minutes.toString().padStart(2, '0')}${period}`;
            } catch (error) {
                console.error(`Error converting time: ${time}`, error);
                return time; // Fallback to original time if conversion fails
            }
        };

        const start = to12Hour(start_time);
        const end = to12Hour(end_time);
        return `${start} - ${end}`;
    }

    function formatNumberWithCondition(number: number, symbol: string | undefined): string {
        if (symbol === "रु") {
            // Custom format for Nepali style
            return number.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        } else {
            // Default English format
            return number.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        }
    }

    return (
        <>
            <LoadingOverlay
                loader={<HomaaleLoader/>}
                visible={isLoading || uploadFileLoading}
                sx={{position: "fixed", height: "120vh"}}
            />
            <Formik
                validationSchema={bookingFormVariableSchema(
                    +parseFloat(payable_from),
                    +parseFloat(payable_to),
                    is_range,
                    MaxImages,
                    MaxVideos
                )}
                initialValues={{
                    price: parseInt(payable_to),
                    end_date: selectedDateTime?.date,
                    requirements: highlights ?? [],
                    description: description ?? "",
                    location: id ? location : "",
                    offer: [],
                    budget_from: null,
                    start_date: selectedDateTime?.date,
                    start_time: selectedDateTime?.start,
                    end_time: selectedDateTime?.end,
                    extra_data: [],
                    booking_merchant: "",
                    entity_service:
                        (is_editing
                            ? bookingData?.entity_service
                            : entity_service) ?? "",
                    city: is_editing ? city?.id.toString() : "",
                    images: images ?? [],
                    videos: videos ?? [],
                    //Extra fields
                    is_online: !location ? "true" : "false",
                    is_terms_condition: false,
                    imagePreviewUrl: getServiceImages ?? [],
                    videoPreviewUrl: getServiceVideos ?? [],
                    latitude: maplocation.lat,
                    longitude: maplocation.lng,
                    customer_location: maplocation.selected,
                }}
                onSubmit={async (values: BookingExtendedPayload) => {
                    let newUploadImageID: number[] = [];
                    if (values.images.some((val) => val?.path)) {
                        const uploadedImageIds = await uploadFileMutation({
                            files: values?.images.filter(
                                (val) => val?.path
                            ) as unknown as string,
                            media_type: "image",
                        });
                        newUploadImageID = uploadedImageIds;
                    }

                    let newUploadVideoID: number[] = [];
                    if (values.videos.some((val) => val?.path)) {
                        const uploadedVideosIds = await uploadFileMutation({
                            files: values?.videos.filter(
                                (val) => val?.path
                            ) as unknown as string,
                            media_type: "video",
                        });
                        newUploadVideoID = uploadedVideosIds;
                    }

                    const imageIds = values?.images
                        .filter((val) => !val?.path)
                        .map((val) => val.id);
                    const videoIds = values?.videos
                        .filter((val) => !val?.path)
                        .map((val) => val.id);

                    const imagesIds = [...imageIds, ...newUploadImageID];
                    const videosIds = [...videoIds, ...newUploadVideoID];

                    const payload = {
                        ...values,
                        location: maplocation.selected,
                        latitude: maplocation.lat,
                        longitude: maplocation.lng,
                        customer_location: maplocation.selected,
                        images: imagesIds,
                        videos: videosIds,
                    };
                    // console.log("payload", payload)
                    //To remove unneccessary fields
                    delete payload.imagePreviewUrl;
                    delete payload.videoPreviewUrl;
                    delete payload.is_online;

                    mutate(payload, {
                        onSuccess: async () => {
                            if (id) {
                                toast.success("Booking Edited");
                                queryClient.invalidateQueries([
                                    "booking-detail",
                                    id,
                                ]);
                                queryClient.invalidateQueries([
                                    "unapproved-booking-list",
                                ]);
                            } else {
                                queryClient.invalidateQueries(["task-detail"]);
                                queryClient.invalidateQueries([
                                    "service-detail",
                                ]);
                                toast.success("Booking Successfull");
                                setTimeout(() => {
                                    router.push(`/services/${bookingData.entity_service}`);
                                }, 1000)
                            }
                            setOpened(false);
                        },
                        onError: (err: any) => {
                            // toast.error("Booking error");
                            const {non_field_errors, price} =
                                err.response.data;
                            non_field_errors && toast.error(non_field_errors);
                            price && toast.error(price);
                        },
                    });
                }}
            >
                {({
                      errors,
                      touched,
                      setFieldValue,
                      values,
                      setFieldTouched,
                  }) => (
                    <Form>
                        <FocusTrap active={true}>
                            <Grid gutter={30} mt={32}>
                                <Grid.Col md={6}>
                                    <Box
                                        p={24}
                                        style={{
                                            borderRadius: "4px",
                                            background:
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[6]
                                                    : "inherit",
                                            boxShadow:
                                                theme.colorScheme === "dark"
                                                    ? "none"
                                                    : "6px 0px 18px rgba(163, 171, 185, 0.2)",
                                        }}
                                    >
                                        <Title
                                            order={5}
                                            color={
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[0]
                                                    : theme.colors
                                                        .homaaleSlate[9]
                                            }
                                            weight={500}
                                            mb={24}
                                        >
                                            Booking Details
                                        </Title>
                                        <ul className={classes.root}>
                                            <li>
                                                <span>Category :</span>
                                                {service?.title}
                                            </li>
                                            <li>
                                                <span>Title :</span>
                                                {title}
                                            </li>
                                            <li>
                                                <span>Pricing :</span>
                                                {is_range
                                                    ? `${
                                                        currency?.symbol
                                                    } ${formatNumberWithCondition(Number(is_requested ? budget_from : payable_from), currency.symbol)} -`
                                                    : ""}{" "}
                                                {currency?.symbol}{" "}
                                                {
                                                    formatNumberWithCondition(Number(is_requested ? budget_to : payable_to), currency.symbol)

                                                }
                                                /{budget_type}
                                            </li>

                                            <li>
                                                <span>Address :</span>
                                                {is_online
                                                    ? "Remote"
                                                    : location}
                                            </li>
                                            <li>
                                                <span>Booking Date :</span>
                                                {selectedDateTime.date}
                                            </li>
                                            <li>
                                                <span> Time :</span>
                                                {convertTo12Hour(selectedDateTime.start, selectedDateTime.end)}
                                            </li>

                                        </ul>
                                        <NumberField
                                            id="price"
                                            name={"price"}
                                            placeholder="Enter Price"
                                            label={`Your Budget ${
                                                is_negotiable
                                                    ? `(negotiable)`
                                                    : `(Non negotiable)`
                                            } `}
                                            touch={touched.price}
                                            error={errors.price}
                                            disabled={
                                                !is_negotiable && !is_range
                                            }
                                            withAsterisk
                                        />
                                        <ListField
                                            id="requirements"
                                            name={"requirements"}
                                            initialLists={highlights ?? []}
                                            onListChange={(lists) =>
                                                setFieldValue(
                                                    "requirements",
                                                    lists
                                                )
                                            }
                                            onBlur={() =>
                                                setFieldTouched(
                                                    "requirements",
                                                    true
                                                )
                                            }
                                            touch={
                                                touched.requirements as unknown as boolean
                                            }
                                            error={
                                                errors.requirements as string
                                            }
                                            labelName={"Requirements"}
                                            withAsterisk
                                        />
                                        <DescriptionField
                                            id="description"
                                            name={"description"}
                                            label={"Description"}
                                            placeholder={
                                                "Service Description Here"
                                            }
                                            touch={touched.description}
                                            error={errors.description}
                                            withAsterisk
                                        />
                                        <SelectField
                                            id="city"
                                            name={"city"}
                                            label={"City"}
                                            placeholder="Search and select your city"
                                            data={cityOptions}
                                            onSearchChange={debounce(
                                                (value) => setSearchCity(value),
                                                500
                                            )}
                                            searchable
                                            touch={touched.city}
                                            error={errors.city}
                                            withAsterisk
                                        />
                                        <Radio.Group
                                            id="is_online"
                                            name="is_online"
                                            label="Service Type"
                                            value={values.is_online}
                                            mb={24}
                                            onChange={(is_online) => {
                                                setFieldValue(
                                                    "is_online",
                                                    is_online
                                                );
                                                setFieldValue("location", "");
                                            }}
                                            sx={{
                                                ["& .mantine-RadioGroup-label"]:
                                                    {
                                                        color:
                                                            theme.colorScheme ===
                                                            "dark"
                                                                ? theme.colors
                                                                    .dark[0]
                                                                : theme.colors
                                                                    .gray[8],
                                                        fontWeight: 400,
                                                        marginBottom: 4,
                                                    },
                                            }}
                                            withAsterisk
                                        >
                                            <Flex
                                                justify={"flex-start"}
                                                gap={10}
                                            >
                                                {" "}
                                                <Radio
                                                    value="true"
                                                    label="Remote"
                                                    size="xs"
                                                />
                                                <Radio
                                                    value="false"
                                                    label="On premise"
                                                    size="xs"
                                                />
                                            </Flex>
                                        </Radio.Group>
                                        {values.is_online === "false" && (
                                            <>
                                                <PlacesAutocomplete
                                                    setCurrentLocation={setMapLocation}
                                                    initialvalue={initialvalue}
                                                    setOpenMap={setOpenMap}
                                                    openMap={openMap}
                                                />

                                                {openMap && (
                                                    <Map
                                                        is_fullScreen
                                                        location={{
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
                                                                icon="/svgs/pin.svg"
                                                                draggable
                                                                onDragEnd={(e) => {
                                                                    setChangeLocation(true);
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
                                                    </Map>
                                                )}
                                            </>
                                        )}

                                    </Box>
                                </Grid.Col>
                                <Grid.Col md={6}>
                                    <Box
                                        p={24}
                                        style={{
                                            borderRadius: "4px",
                                            background:
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[6]
                                                    : "inherit",
                                            boxShadow:
                                                theme.colorScheme === "dark"
                                                    ? "none"
                                                    : "6px 0px 18px rgba(163, 171, 185, 0.2)",
                                        }}
                                    >
                                        <Title
                                            order={5}
                                            color={
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[0]
                                                    : theme.colors
                                                        .homaaleSlate[9]
                                            }
                                            weight={500}
                                            mb={24}
                                        >
                                            Media
                                        </Title>
                                        <MultiFileDropzone
                                            name="images"
                                            labelName="Upload your images"
                                            textMuted={`More than ${MaxImages} images cannot be uploaded. File supported: .jpeg, .jpg, .png. Maximum size 4MB.`}
                                            error={
                                                (errors.imagePreviewUrl as string) ||
                                                (errors.images as string)
                                            }
                                            touch={
                                                touched.images as unknown as boolean
                                            }
                                            imagePreview="imagePreviewUrl"
                                            maxFiles={MaxImages}
                                            maxSize={4}
                                            multiple
                                            showFileDetail
                                        />
                                        <MultiFileDropzone
                                            name="videos"
                                            labelName="Upload your Video"
                                            textMuted={`More than ${MaxVideos} videos cannot be uploaded. Maximum size 10MB.`}
                                            error={
                                                (errors.videoPreviewUrl as string) ||
                                                (errors.videos as string)
                                            }
                                            touch={
                                                touched.videos as unknown as boolean
                                            }
                                            imagePreview="videoPreviewUrl"
                                            accept={["video/mp4"]}
                                            maxFiles={MaxVideos}
                                            maxSize={10}
                                            multiple
                                            showFileDetail
                                        />
                                    </Box>
                                    <Box
                                        p={24}
                                        mt={24}
                                        style={{
                                            borderRadius: "4px",
                                            background:
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[6]
                                                    : "inherit",
                                            boxShadow:
                                                theme.colorScheme === "dark"
                                                    ? "none"
                                                    : "6px 0px 18px rgba(163, 171, 185, 0.2)",
                                        }}
                                    >
                                        <Title
                                            order={5}
                                            color={
                                                theme.colorScheme === "dark"
                                                    ? theme.colors.dark[0]
                                                    : theme.colors
                                                        .homaaleSlate[9]
                                            }
                                            weight={500}
                                            mb={24}
                                        >
                                            Terms & Conditions
                                        </Title>
                                        <Checkbox
                                            label={
                                                <>
                                                    I have read the{" "}
                                                    <Link
                                                        href={
                                                            "/homaale-terms-conditions"
                                                        }
                                                    >
                                                        terms and conditions
                                                    </Link>
                                                </>
                                            }
                                            mb={10}
                                            checked={values.is_terms_condition}
                                            onChange={(event) =>
                                                setFieldValue(
                                                    "is_terms_condition",
                                                    event.target.checked
                                                )
                                            }
                                            error={
                                                touched.is_terms_condition &&
                                                errors.is_terms_condition
                                                    ? errors?.is_terms_condition
                                                    : null
                                            }
                                        />
                                    </Box>
                                </Grid.Col>
                            </Grid>
                            <Flex justify="center" gap={20} wrap="wrap" mt={40} sx={{
                                marginBottom: "60px",
                            }}>
                                <Button
                                    variant="outline"
                                    sx={{
                                        color: theme.colors.secondary[2],
                                        border: `1px solid ${theme.colors.secondary[2]}`,
                                    }}
                                    onClick={prevStep}
                                >
                                    Back
                                </Button>
                                <FormButton
                                    name={id ? "Edit" : "Book"}
                                    id="post-task-btn"
                                    type="submit"
                                    handleClick={() => {
                                        if (errors) {
                                            scrollToElement(Object.keys(errors)[0], "smooth");
                                        } else
                                            router.push(`/services/${bookingData.entity_service}`)
                                    }}
                                />
                            </Flex>

                        </FocusTrap>
                    </Form>
                )}
            </Formik>
        </>
    );
};
