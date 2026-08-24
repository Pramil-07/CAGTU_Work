import { FileDropzoneProps, useDark } from '@cagtu-cms/util-formatter';
import { Group, Text, useMantineTheme, Box, BackgroundImage, ActionIcon } from '@mantine/core';
import { Dropzone, DropzoneProps } from '@mantine/dropzone';
import { IconCloudUpload, IconPhoto, IconTrash, IconX } from '@tabler/icons';
import { Field, FieldProps } from 'formik';

const FileDropzone = ({
    name,
    accept,
    multiple = false,
    maxSize,
    imagePreview,
    error,
    touch,
    style,
    ...restProps
}: FileDropzoneProps & Partial<DropzoneProps>) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ form }: FieldProps) => {
                const imageSrc = imagePreview && form.values[imagePreview]?.map((val: any) => val?.src);
                const isPreviewImage = imagePreview && form.values[imagePreview]?.length;

                return isPreviewImage ? (
                    <Box
                        sx={{
                            border: `2px dashed ${dark ? theme.colors.dark[3] : theme.colors.gray[4]}`,
                            borderRadius: theme.radius.sm,
                            marginBottom: `${isPreviewImage ? 20 : null}px`,
                        }}>
                        {imageSrc?.map((val: any, index: number) => (
                            <BackgroundImage key={index} src={val} radius="sm">
                                <Group position="right" p="md" style={{ minHeight: 196 }}>
                                    <ActionIcon
                                        variant="filled"
                                        color="red"
                                        radius="xl"
                                        size="lg"
                                        onClick={() => {
                                            form.setFieldValue(name, []);
                                            imagePreview && form.setFieldValue(imagePreview, []);
                                        }}>
                                        <IconTrash size={20} stroke={1.75} />
                                    </ActionIcon>
                                </Group>
                            </BackgroundImage>
                        ))}
                    </Box>
                ) : (
                    <Box style={style}>
                        <Dropzone
                            {...restProps}
                            styles={{
                                root: { borderColor: `${!errTouch ? (dark ? theme.colors.dark[3] : theme.colors.gray[4]) : theme.colors.red[7]}` },
                            }}
                            onDrop={(files) => {
                                const multipleFiles = files.map((file, index) => {
                                    const src = window.URL.createObjectURL(file);
                                    return {
                                        file,
                                        id: index,
                                        src,
                                    };
                                });
                                form.setFieldValue(name, files);
                                imagePreview && form.setFieldValue(imagePreview, multipleFiles);
                            }}
                            onReject={(files) => {
                                const erroMessage = files.map((file) => file.errors.map((val) => val.message))[0].toString();
                                form.setFieldError(name, erroMessage);
                            }}
                            maxSize={maxSize}
                            accept={accept}
                            multiple={multiple}>
                            <Group position="center" spacing="xl" style={{ minHeight: 160, pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <Group position="center" spacing={10} style={{ minHeight: 160, pointerEvents: 'none' }}>
                                        <IconCloudUpload size={24} color={theme.colors.blue['6']} stroke={1.75} />
                                        <div>
                                            <Text size="sm" inline>
                                                Drop files or click here to upload
                                            </Text>
                                            <Text size="xs" color="dimmed" inline mt={7}>
                                                Max file size: 2MB
                                            </Text>
                                        </div>
                                    </Group>
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <Group position="center" spacing={10} style={{ minHeight: 160, pointerEvents: 'none' }}>
                                        <IconX size={24} color={theme.colors.red['6']} stroke={1.75} />
                                        <Text size="sm" inline>
                                            Unsupported file format
                                        </Text>
                                    </Group>
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <Group position="center" spacing={10} style={{ minHeight: 160, pointerEvents: 'none' }}>
                                        <IconPhoto size={24} color={theme.colors.blue['6']} stroke={1.75} />
                                        <div>
                                            <Text size="sm" inline color={dark ? theme.colors.gray[0] : theme.colors.dark[9]}>
                                                Drop files or click here to upload
                                            </Text>
                                            <Text size="xs" color="dimmed" inline mt={5}>
                                                Max file size: 2MB
                                            </Text>
                                        </div>
                                    </Group>
                                </Dropzone.Idle>
                            </Group>
                        </Dropzone>
                        {errTouch && (
                            <Text size="sm" component="div" weight={500} mt={4} color="red" sx={{ fontSize: 13 }}>
                                {error}
                            </Text>
                        )}
                    </Box>
                );
            }}
        </Field>
    );
};

export default FileDropzone;
