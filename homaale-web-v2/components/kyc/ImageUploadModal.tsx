import {Alert, Button, createStyles, Flex, Group, Modal, Tabs, Text} from "@mantine/core";
import Image from "next/image";
import type {Dispatch, SetStateAction} from "react";
import {useMemo, useState} from "react";
import React from "react";
import {IconAlertCircle} from "@tabler/icons-react";

export interface ImageUploadModalProps {
    opened: boolean;
    setOpened: Dispatch<SetStateAction<boolean>>;
    setFieldValue: (key: string, data: File | null) => void;
    setPreviewImage: Dispatch<SetStateAction<any>>;
}

const MAX_FILE_SIZE = 1.2 * 1024 * 1024;

const ImageUploadModal = ({
                              opened,
                              setOpened,
                              setFieldValue,
                              setPreviewImage,
                          }: ImageUploadModalProps) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {classes} = useStyles();

    let previewImage: any;

    const uploadPreview = useMemo(() => {
        uploadedFile ? (previewImage = URL.createObjectURL(uploadedFile)) : "";
        return previewImage;
    }, [uploadedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setError("This Image Exceed Limit of 1.2 MB");
            setUploadedFile(null);
            return;
        }

        setUploadedFile(file);
        setError(null);
    };
    return (
        <Modal
            opened={opened}
            onClose={() => setOpened(false)}
            withCloseButton
            title="Upload Image"
            closeOnClickOutside={false}
            overlayProps={{
                opacity: 0.55,
                blur: 3,
            }}
            size="md"
            padding={24}
        >
            <Tabs defaultValue="upload">
                <Tabs.List>
                    <Tabs.Tab value="upload">Upload</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="upload" pt="xs">
                    <div className={classes.imageUploadPanel}>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                        <Flex
                            align={"center"}
                            justify={"center"}
                            sx={{
                                position: "relative",
                                width: "100%",
                                height: 300,
                                margin: 0,
                            }}
                        >
                            <Image
                                src={
                                    uploadPreview ??
                                    "/images/placeholder/personPlaceholder.jpg"
                                }
                                alt="img"
                                height={240}
                                width={240}
                                style={{
                                    objectFit: "contain",
                                    borderRadius: 12,
                                }}
                            />
                        </Flex>
                        <Alert color="blue" icon={<IconAlertCircle size="1rem"/>} mb={16}>
                            <Text component="span" weight={600}>
                                {error
                                    ? error
                                    : "Image size should be Less than 1.2 MB"}
                            </Text>
                        </Alert>
                        <Group grow>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setUploadedFile(null);
                                    setOpened(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="btn close-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setFieldValue("logo", uploadedFile);
                                    setOpened(false);
                                    setPreviewImage(uploadPreview);
                                }}
                            >
                                Apply
                            </Button>
                        </Group>
                    </div>
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
};

export default ImageUploadModal;

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
