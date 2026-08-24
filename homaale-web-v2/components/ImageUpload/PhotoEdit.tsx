import { Box, Button, Group, Modal, Slider, Tabs } from "@mantine/core";
import { createStyles } from "@mantine/core";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import React, { useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop/types";

import { useProfile } from "@/hooks/useProfile";
import type { AvatarProps } from "@/types/AvatarProps";

import AvatarForm from "./AvatarForm";
import { getCroppedImg } from "./Cropper";

interface editProfileProps {
    opened: boolean;
    handleClose?: () => void;
    setShowEditForm: Dispatch<SetStateAction<boolean>>;
    setIsEditButtonClicked: Dispatch<SetStateAction<boolean>>;
    userId?: string;
    photo?: any;
    handleSubmit?: () => void;
    haveImage: boolean;
    isEditButtonClicked?: boolean;
    onPhotoEdit: (url: RequestInfo | URL, file: File) => void;
    onAvatarEdit: (avatar: AvatarProps[0]) => void;
    setFieldValue: (key: string, data: number | File | undefined) => void;
    setPreviewImage: any;
}

const PhotoEdit = ({
    opened,
    setIsEditButtonClicked,
    setShowEditForm,
    userId,
    photo,
    onAvatarEdit,
    isEditButtonClicked,
    onPhotoEdit,
    haveImage,
    setFieldValue,
    setPreviewImage,
}: editProfileProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<
        Area | undefined
    >();

    // const [toEditImage, setToEditImage] = useState<Blob | null | string>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [clickedUpload, setClickedUpload] = useState(false);

    const { classes } = useStyles();
    let previewImage: any;

    const reactImage = useMemo(() => {
        try {
            photo ? (previewImage = URL.createObjectURL(photo)) : "";
        } catch {
            ("");
        }
        return previewImage;
    }, [photo]);

    const { data: profile } = useProfile();

    const profileImage = profile?.profile_image;

    const onCropComplete = useCallback(
        (croppedArea: any, croppedAreaPixels: any) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );
    const uploadPreview = useMemo(() => {
        uploadedFile ? (previewImage = URL.createObjectURL(uploadedFile)) : "";
        return previewImage;
    }, [uploadedFile]);

    const toBeCroppedImage = clickedUpload
        ? uploadPreview
        : reactImage
        ? reactImage
        : "";

    const showCroppedImage = useCallback(
        async (blobToBeCropped: string) => {
            try {
                const croppedImage = (await getCroppedImg(
                    toBeCroppedImage ? toBeCroppedImage : blobToBeCropped,
                    croppedAreaPixels,
                    rotation
                )) as Blob;

                return croppedImage;
            } catch (e) {
                console.error(e);
            }
        },
        [croppedAreaPixels, rotation, toBeCroppedImage]
    );

    const profileName = profileImage
        ? profileImage.substring(profileImage.indexOf("profile/") + 8)
        : "";

    const fileName = clickedUpload
        ? uploadedFile?.name
        : profileImage && profileImage
        ? profileName
        : "";

    const onEditProfile = async (imageBlob: string) => {
        const data = (await showCroppedImage(imageBlob)) as unknown as
            | RequestInfo
            | URL;
        if (!data) return;

        const response = await fetch(data);

        const blob = await response.blob();

        const file = new File([blob], "profile.jpeg", {
            type: "image/jpeg",
        });

        if (!profile) {
            onPhotoEdit(data, file);

            setShowEditForm(false);
            return;
        }

        // formData.append("profile_image", file);
        if (isEditButtonClicked) {
            setFieldValue("profile_image", file);
            setPreviewImage(uploadPreview);
            setShowEditForm(false);
            onPhotoEdit(data, file);
            // setIsEditButtonClicked(false);
        }
    };

    const onImageEdit = async () => {
        const response = await fetch(`${profileImage}`, { mode: "no-cors" });

        const blob = await response.blob();

        const file = new File([blob], fileName ?? "", {
            type: blob.type,
        });
        const secondBlob = URL.createObjectURL(file);
        return secondBlob;
    };
    const submit = async () => {
        const blob = profileImage ? await onImageEdit() : null;
        onEditProfile(blob ? blob : toBeCroppedImage);
        // window.location.reload();
    };

    return (
        <>
            {/* Modal component */}
            <Modal
                title="Edit Profile Image"
                opened={opened}
                withCloseButton
                onClose={() => {
                    setShowEditForm(false);
                    setClickedUpload(false);
                    setUploadedFile(null);
                }}
                closeOnClickOutside={false}
                size={"lg"}
                scrollAreaComponent={Modal.NativeScrollArea}
            >
                <div>
                    <Tabs defaultValue="upload">
                        <Tabs.List>
                            <Tabs.Tab value="upload">Upload</Tabs.Tab>
                            <Tabs.Tab value="avatar">Avatar</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="upload" pt="xs">
                            <div className={classes.imageUploadPanel}>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        setClickedUpload(true);
                                        const files = e.target.files;
                                        setUploadedFile(files && files[0]);
                                    }}
                                    // className={classes.input}
                                />
                                {uploadedFile && (
                                    <>
                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: "100%",
                                                height: 300,
                                                display: "flex",
                                                margin: 0,
                                            }}
                                        >
                                            <Cropper
                                                zoomWithScroll
                                                image={
                                                    clickedUpload
                                                        ? uploadPreview
                                                        : reactImage
                                                        ? reactImage
                                                        : profile?.profile_image
                                                        ? profileImage
                                                        : photo
                                                        ? toBeCroppedImage
                                                        : ""
                                                }
                                                    objectFit="horizontal-cover"
                                                rotation={rotation}
                                                crop={crop}
                                                zoom={zoom}
                                                cropShape="round"
                                                aspect={1}
                                                onCropChange={setCrop}
                                                onCropComplete={onCropComplete}
                                                onZoomChange={setZoom}
                                                onRotationChange={setRotation}
                                            />
                                        </Box>
                                        <Box mb={24}>
                                            <h4>Zoom</h4>
                                            <Slider
                                                value={zoom}
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                aria-labelledby="Zoom"
                                                onChange={setZoom}
                                                size="sm"
                                            />
                                            <br />
                                            <h4>Rotate</h4>
                                            <Slider
                                                value={rotation}
                                                min={0}
                                                max={360}
                                                step={1}
                                                aria-labelledby="Rotation"
                                                onChange={setRotation}
                                                size="sm"
                                            />
                                        </Box>
                                    </>
                                )}

                                <Group grow>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowEditForm(false);
                                            setClickedUpload(false);
                                            setUploadedFile(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="btn close-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            isEditButtonClicked || haveImage
                                                ? submit()
                                                : submit();
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </Group>
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel value="avatar" pt="xs">
                            <AvatarForm
                                userId={userId}
                                setShowEditForm={setShowEditForm}
                                onAvatarEdit={onAvatarEdit}
                                setFieldValue={setFieldValue}
                            />
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </Modal>
        </>
    );
};

const useStyles = createStyles((theme) => ({
    imageUploadPanel: {
        "& input[type=file]": {
            marginBottom: 8,
            "&::file-selector-button": {
                background: theme.colors.brand[4],
                border: "none",
                borderRadius: 4,
                color: "#fff",
                padding: "6px 12px",
                fontWeight: 600,
            },
        },
    },
}));
export default PhotoEdit;
