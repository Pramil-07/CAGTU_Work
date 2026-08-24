import {ActionIcon, Box, Group, Text, useMantineTheme} from "@mantine/core";
import type {DropzoneProps} from "@mantine/dropzone";
import {Dropzone} from "@mantine/dropzone";
import {
    IconArrowUpCircle,
    IconScaleOutline,
    IconUpload,
    IconX,
} from "@tabler/icons-react";
import type {FieldProps} from "formik";
import {Field} from "formik";
import * as _ from "lodash";

import type {MultiFileDropzoneProps} from "@/types/FileDropzoneProps";
import {FileTypeGrid} from "@/utils/fileType";
import {formatBytes} from "@/utils/formatBytes";

const MultiFileDropzone = ({
                               name,
                               labelName,
                               textMuted,
                               accept = ["image/png", "image/jpeg", "image/jpg"],
                               multiple = false,
                               maxSize = 1,
                               imagePreview,
                               error,
                               touch,
                               style,
                               maxFiles,
                               displayView = "grid",
                               showFileDetail = false,
                               withCloseButton = true,
                               ...restProps
                           }: MultiFileDropzoneProps & Partial<DropzoneProps>) => {
    const theme = useMantineTheme();

    return (
        <Field name={name}>
            {({form}: FieldProps) => {
                const imageFile =
                    imagePreview &&
                    form.values[imagePreview]?.map((val: any) => {
                        return {
                            name: showFileDetail && val?.file?.name,
                            size:
                                showFileDetail && formatBytes(val?.file?.size),
                            src: val?.src,
                            type: _.last(val?.file?.type?.split("/")),
                        };
                    });
                const isPreviewImage =
                    imagePreview && form.values[imagePreview]?.length;

                return (
                    <>
                        {labelName && (
                            <Text
                                component="label"
                                sx={{fontWeight: 500}}
                                mb={10}
                            >
                                {labelName}
                            </Text>
                        )}
                        {textMuted && (
                            <Text
                                size="xs"
                                component="div"
                                mb={10}
                                color={`#868E96`}
                            >
                                {textMuted}
                            </Text>
                        )}
                        <Box style={{marginBottom: 20, ...style}}>
                            {isPreviewImage > 0 && displayView === "grid" && (
                                <Group position="left" spacing={13} mb={20}>
                                    {imageFile?.map(
                                        (val: any, index: number) => {
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        position: "relative",
                                                    }}
                                                >
                                                    <FileTypeGrid
                                                        type={val?.type}
                                                        filePath={val?.src}
                                                        fileSize={val?.size}
                                                        showFileDetail={
                                                            showFileDetail
                                                        }
                                                        fileName={val?.name}
                                                    />
                                                    {withCloseButton && (
                                                        <ActionIcon
                                                            variant="light"
                                                            color="dark"
                                                            radius="xl"
                                                            size="xs"
                                                            sx={{
                                                                position:
                                                                    "absolute",
                                                                top: -7,
                                                                right: -6,
                                                                zIndex: 1,
                                                            }}
                                                            onClick={() => {
                                                                form.setFieldValue(
                                                                    name,
                                                                    form.values[
                                                                        name
                                                                        ]?.filter(
                                                                        (
                                                                            _: any,
                                                                            key: number
                                                                        ) =>
                                                                            key !==
                                                                            Number(
                                                                                index
                                                                            )
                                                                    )
                                                                );
                                                                imagePreview &&
                                                                form.setFieldValue(
                                                                    imagePreview,
                                                                    form.values[
                                                                        imagePreview
                                                                        ]?.filter(
                                                                        (
                                                                            _: any,
                                                                            key: number
                                                                        ) =>
                                                                            key !==
                                                                            Number(
                                                                                index
                                                                            )
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <IconX/>
                                                        </ActionIcon>
                                                    )}
                                                </Box>
                                            );
                                        }
                                    )}
                                </Group>
                            )}

                            <Dropzone
                                {...restProps}
                                py={5}
                                styles={{
                                    root: {
                                        borderColor: `${
                                            !error ? "#D8D8D8" : "#FE5050"
                                        }`,
                                    },
                                }}
                                onDrop={(files) => {
                                    form.setFieldTouched(name);
                                    const multipleFiles = files.map(
                                        (file, index) => {
                                            const src =
                                                window.URL.createObjectURL(
                                                    file
                                                );
                                            return {
                                                file,
                                                id: index,
                                                src,
                                            };
                                        }
                                    );
                                    form.setFieldValue(name, [
                                        ...form.values[name],
                                        ...files,
                                    ]);
                                    imagePreview &&
                                    form.setFieldValue(imagePreview, [
                                        ...form.values[imagePreview],
                                        ...multipleFiles,
                                    ]);
                                }}
                                onReject={(files) => {
                                    const erroMessage = files
                                        .map((file) =>
                                            file.errors.map(
                                                (val) => val.message
                                            )
                                        )[0]
                                        .toString();
                                    form.setFieldError(name, erroMessage);
                                }}
                                accept={accept}
                                maxSize={maxSize && 1024 * 1024 * maxSize}
                                maxFiles={maxFiles}
                                multiple={multiple}
                            >
                                <Group
                                    position="center"
                                    spacing="xl"
                                    style={{
                                        minHeight: 40,
                                        pointerEvents: "none",
                                    }}
                                >
                                    <Dropzone.Accept>
                                        <Group
                                            position="center"
                                            spacing={10}
                                            style={{
                                                minHeight: 40,
                                                pointerEvents: "none",
                                            }}
                                        >
                                            <IconArrowUpCircle
                                                // color={"#3EAEFF"}
                                            />
                                            <Text>
                                                Drop files or click here to
                                                upload
                                            </Text>
                                        </Group>
                                    </Dropzone.Accept>
                                    <Dropzone.Reject>
                                        <Group
                                            position="center"
                                            spacing={10}
                                            style={{
                                                minHeight: 40,
                                                pointerEvents: "none",
                                            }}
                                        >
                                            <IconScaleOutline/>
                                            <Text>Unsupported file format</Text>
                                        </Group>
                                    </Dropzone.Reject>
                                    <Dropzone.Idle>
                                        <Group
                                            position="center"
                                            spacing={10}
                                            style={{
                                                minHeight: 40,
                                                pointerEvents: "none",
                                            }}
                                        >
                                            <IconUpload
                                                style={{
                                                    color: "#3EAEFF",
                                                    fontSize: 20,
                                                }}
                                            />
                                            <Text
                                                color={
                                                    theme.colorScheme === "dark"
                                                        ? theme.colors.dark[0]
                                                        : "#343A40"
                                                }
                                            >
                                                Drop files or click here to
                                                upload
                                            </Text>
                                        </Group>
                                    </Dropzone.Idle>
                                </Group>
                            </Dropzone>
                            {error && (
                                <Text
                                    size="sm"
                                    component="div"
                                    weight={500}
                                    mt={4}
                                    color="red"
                                    sx={{fontSize: 13}}
                                >
                                    {error}
                                </Text>
                            )}
                        </Box>
                    </>
                );
            }}
        </Field>
    );
};

export default MultiFileDropzone;
