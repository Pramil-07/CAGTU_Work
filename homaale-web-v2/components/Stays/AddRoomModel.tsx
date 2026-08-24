// components/rooms/AddRoomFormModal.tsx
import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Group,
    Text,
    Select,
    NumberInput,
    TextInput,
    Switch,
    MultiSelect,
    Box,
    Title,
} from "@mantine/core";
import { Bed, Users, MoveDiagonal, Cigarette, Check, X } from "lucide-react";
import { useMantineTheme } from "@mantine/core";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { axiosClient } from "@/utils/axiosClient";
import MultiFileDropzone from "@/components/common/form/MultiFileDropzone";
import { useFileStore } from "@/hooks/useFileStore";

interface AddRoomFormModalProps {
    opened: boolean;
    onClose: () => void;
    hotelId: number;
    hotelSlug: string;
    onSuccess?: () => void;
}

/* ---------- ENUMS ---------- */
const BED_TYPES = [
    { value: "KING", label: "King Bed" },
    { value: "QUEEN", label: "Queen Bed" },
    { value: "TWIN", label: "Twin Bed" },
    { value: "DOUBLE", label: "Double Bed" },
    { value: "SINGLE", label: "Single Bed" },
    { value: "SOFA", label: "Sofa Bed" },
];

const VIEW_TYPES = [
    { value: "sea", label: "Sea View" },
    { value: "mountain", label: "Mountain View" },
    { value: "ocean", label: "Ocean View" },
    { value: "garden", label: "Garden View" },
    { value: "city", label: "City View" },
    { value: "pool", label: "Pool View" },
    { value: "lake", label: "Lake View" },
];

const BED_COUNTS = [
    { value: "1", label: "1 Bed" },
    { value: "2", label: "2 Beds" },
    { value: "3", label: "3 Beds" },
];

/* ---------- VALIDATION ---------- */
const schema = Yup.object().shape({
    name: Yup.string().required("Room name is required"),
    bed_type: Yup.string().required("Select a bed type"),
    bed_count: Yup.string().required("Select number of beds"),
    capacity: Yup.number().min(1).max(20).required("Capacity is required"),
    price: Yup.number().min(0).required("Price is required"),
    view_type: Yup.string().nullable(),
    room_area: Yup.string().nullable(),
    smoking_allowed: Yup.boolean(),
    is_featured: Yup.boolean(),
    amenities: Yup.array().of(Yup.number()),
    images: Yup.array().min(1, "At least one image is required"),
});

export default function AddRoomFormModal({
                                             opened,
                                             onClose,
                                             hotelId,
                                             hotelSlug,
                                             onSuccess,
                                         }: AddRoomFormModalProps) {
    const theme = useMantineTheme();
    const { mutateAsync: uploadFileMutation, isLoading: uploadLoading } = useFileStore();

    const [amenityOptions, setAmenityOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [amenitiesLoading, setAmenitiesLoading] = useState(true);

    /* ---------- Load amenities ---------- */
    useEffect(() => {
        if (!opened) return;
        const load = async () => {
            try {
                setAmenitiesLoading(true);
                const { data } = await axiosClient.get("/hotel/amenities/list/?type=Room/");
                setAmenityOptions(
                    data.map((a: any) => ({
                        value: String(a.id),
                        label: a.name ?? `Amenity ${a.id}`,
                    }))
                );
            } catch (e) {
                console.error(e);
            } finally {
                setAmenitiesLoading(false);
            }
        };
        load();
    }, [opened]);

    const handleSubmit = async (
        values: any,
        { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
    ) => {
        try {
            // 1. Upload new images
            let uploadedImageIds: number[] = [];
            const newImages = values.images.filter((img: any) => img?.path);
            if (newImages.length > 0) {
                uploadedImageIds = await uploadFileMutation({
                    files: newImages,
                    media_type: "image",
                });
            }

            // 2. Combine old (if any) + new image IDs
            const imageIds = uploadedImageIds;

            // 3. Build final payload
            const payload = {
                ...values,
                hotel: hotelId,
                bed_count: Number(values.bed_count),
                capacity: Number(values.capacity),
                price: Number(values.price),
                amenities: values.amenities.map((id: string) => ({ id: Number(id) })),
                room_images: imageIds,
            };

            await axiosClient.post(`/hotel/room/create/`, payload);

            onSuccess?.();
            resetForm();
            onClose();
        } catch (err: any) {
            // alert(err.response?.data?.message || "Failed to add room");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            radius="lg"
            title={<Text fw={600} size="xl">Add New Room</Text>}
            closeOnClickOutside={false}
            trapFocus
        >
            <Formik
                initialValues={{
                    name: "",
                    bed_type: "",
                    bed_count: "",
                    capacity: 1,
                    price: 0,
                    view_type: "",
                    room_area: "",
                    smoking_allowed: false,
                    is_featured: false,
                    amenities: [],
                    images: [],
                    imagePreviewUrl: [],
                }}
                validationSchema={schema}
                onSubmit={handleSubmit}
            >
                {({
                      values,
                      errors,
                      touched,
                      setFieldValue,
                      isSubmitting,
                      dirty,
                      isValid,
                  }) => (
                    <Form className="space-y-6">
                        {/* === ROOM DETAILS === */}
                        <Box>
                            <Title order={5} weight={500} mb={16}>
                                Room Details
                            </Title>
                            {/* === IMAGE UPLOAD === */}
                            <Box mt={24}>
                                <MultiFileDropzone
                                    name="images"
                                    labelName="Upload Room Images"
                                    textMuted="Max 10 images. Supported: .jpeg, .jpg, .png. Max size 4MB."
                                    maxFiles={10}
                                    maxSize={5}
                                    multiple
                                    showFileDetail
                                    imagePreview="imagePreviewUrl"
                                    error={errors.images as string}
                                    onChange={(files) => setFieldValue("images", files)}
                                />
                            </Box>
                            <TextInput
                                label="Room Name"
                                placeholder="e.g. Deluxe Suite"
                                required
                                name="name"
                                value={values.name}
                                onChange={(e) => setFieldValue("name", e.target.value)}
                                error={touched.name && errors.name}
                            />

                            <Group grow mt={16}>
                                <Select
                                    label="Bed Type"
                                    placeholder="Select bed type"
                                    data={BED_TYPES}
                                    value={values.bed_type}
                                    onChange={(v) => setFieldValue("bed_type", v || "")}
                                    required
                                    error={touched.bed_type && errors.bed_type}
                                />
                                <Select
                                    label="Number of Beds"
                                    placeholder="Select count"
                                    data={BED_COUNTS}
                                    value={values.bed_count}
                                    onChange={(v) => setFieldValue("bed_count", v || "")}
                                    required
                                    error={touched.bed_count && errors.bed_count}
                                />
                            </Group>

                            <Group grow mt={16}>
                                <NumberInput
                                    label="Guest Capacity"
                                    min={1}
                                    max={20}
                                    value={values.capacity}
                                    onChange={(v) => setFieldValue("capacity", Number(v))}
                                    required
                                    // leftSection={<Users className="w-4 h-4 text-gray-500" />}
                                    error={touched.capacity && errors.capacity}
                                />
                                <NumberInput
                                    label="Price per Night ($)"
                                    min={0}
                                    step={0.01}
                                    value={values.price}
                                    onChange={(v) => setFieldValue("price", Number(v))}
                                    required
                                    // leftSection="$"
                                    error={touched.price && errors.price}
                                />
                            </Group>

                            <Select
                                label="View Type"
                                placeholder="Select view (optional)"
                                data={VIEW_TYPES}
                                value={values.view_type}
                                onChange={(v) => setFieldValue("view_type", v || "")}
                                mt={16}
                            />

                            <TextInput
                                label="Room Area (sq ft)"
                                placeholder="e.g. 350"
                                value={values.room_area}
                                onChange={(e) => setFieldValue("room_area", e.target.value)}
                                mt={16}
                                // leftSection={<MoveDiagonal className="w-4 h-4 text-gray-500" />}
                            />

                            <Group grow mt={16}>
                                <Switch
                                    label="Smoking Allowed"
                                    checked={values.smoking_allowed}
                                    onChange={(e) =>
                                        setFieldValue("smoking_allowed", e.currentTarget.checked)
                                    }
                                    thumbIcon={
                                        values.smoking_allowed ? (
                                            <Cigarette className="w-3 h-3 text-white" />
                                        ) : (
                                            <X className="w-3 h-3 text-gray-600" />
                                        )
                                    }
                                />
                                <Switch
                                    label="Featured Room"
                                    checked={values.is_featured}
                                    onChange={(e) =>
                                        setFieldValue("is_featured", e.currentTarget.checked)
                                    }
                                />
                            </Group>

                            <MultiSelect
                                label="Amenities"
                                placeholder={amenitiesLoading ? "Loading…" : "Select amenities"}
                                data={amenityOptions}
                                value={values.amenities.map(String)}
                                onChange={(v) => setFieldValue("amenities", v.map(Number))}
                                searchable
                                clearable
                                mt={16}
                                disabled={amenitiesLoading}
                                nothingFound={amenitiesLoading ? "Loading…" : "No amenities"}
                                error={touched.amenities && errors.amenities}
                            />
                        </Box>



                        {/* === SUBMIT === */}
                        <Group mt={32}>
                            <Button
                                variant="light"
                                color="gray"
                                onClick={onClose}
                                disabled={isSubmitting || uploadLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isSubmitting || uploadLoading}
                                disabled={!dirty || !isValid || uploadLoading}
                                style={{ background: theme.colors.brand[6] }}
                                // leftSection={isSubmitting || uploadLoading ? null : <Check className="w-4 h-4" />}
                            >
                                {isSubmitting || uploadLoading ? "Saving..." : "Add Room"}
                            </Button>
                        </Group>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
