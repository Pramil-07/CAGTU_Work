import { formatBytes, MultiFileDropzoneProps, useDark } from '@cagtu-cms/util-formatter';
import { ActionIcon, Box, Group, Text, useMantineTheme } from '@mantine/core';
import { Dropzone, DropzoneProps } from '@mantine/dropzone';
import { IconArrowUpCircle, IconTrash, IconX } from '@tabler/icons';
import { Field, FieldProps } from 'formik';
import * as _ from 'lodash';
import { FileTypeGrid, FileTypeList } from '../file-type/FileType';

const MultiFileDropzone = ({
    name,
    labelName,
    textMuted,
    accept = ['image/png', 'image/jpeg', 'image/jpg'],
    multiple = false,
    maxSize = 1,
    imagePreview,
    error,
    touch,
    style,
    maxFiles,
    displayView = 'grid',
    showFileDetail = false,
    withCloseButton = true,
    ...restProps
}: MultiFileDropzoneProps & Partial<DropzoneProps>) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    const errTouch = error && touch ? error : null;

    return (
        <Field name={name}>
            {({ form }: FieldProps) => {
                const imageFile =
                    imagePreview &&
                    form.values[imagePreview]?.map((val: any) => {
                        return {
                            name: showFileDetail && val?.file?.name,
                            size: showFileDetail && formatBytes(val?.file?.size),
                            src: val?.src,
                            type: _.last(val?.file?.type.split('/')),
                        };
                    });
                const isPreviewImage = imagePreview && form.values[imagePreview]?.length;

                return (
                    <>
                        {labelName && (
                            <Text component="label" sx={{ fontWeight: 500 }} mb={10}>
                                {labelName}
                            </Text>
                        )}
                        {textMuted && (
                            <Text size="xs" component="div" mb={10} color={`${dark ? theme.colors['dark'][2] : theme.colors['gray'][6]}`}>
                                {textMuted}
                            </Text>
                        )}
                        <Box style={{ marginBottom: 20, ...style }}>
                            <Dropzone
                                {...restProps}
                                py={5}
                                styles={{
                                    root: {
                                        borderColor: `${
                                            !error ? (dark ? theme.colors['dark'][3] : theme.colors['gray'][4]) : theme.colors['red'][7]
                                        }`,
                                    },
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
                                    form.setFieldValue(name, [...form.values[name], ...files]);
                                    imagePreview && form.setFieldValue(imagePreview, [...form.values[imagePreview], ...multipleFiles]);
                                }}
                                onReject={(files) => {
                                    const erroMessage = files.map((file) => file.errors.map((val) => val.message))[0].toString();
                                    form.setFieldError(name, erroMessage);
                                }}
                                accept={accept}
                                maxSize={maxSize && 1024 * 1024 * maxSize}
                                maxFiles={maxFiles}
                                multiple={multiple}>
                                <Group
                                    position="center"
                                    spacing="xl"
                                    style={{
                                        minHeight: 40,
                                        pointerEvents: 'none',
                                    }}>
                                    <Dropzone.Accept>
                                        <Group
                                            position="center"
                                            spacing={10}
                                            style={{
                                                minHeight: 40,
                                                pointerEvents: 'none',
                                            }}>
                                            <IconArrowUpCircle size={22} color={theme.colors['blue'][6]} stroke={1.75} />
                                            <Text>Drop files or click here to upload</Text>
                                        </Group>
                                    </Dropzone.Accept>
                                    <Dropzone.Reject>
                                        <Group position="center" spacing={10} style={{ minHeight: 40, pointerEvents: 'none' }}>
                                            <IconX size={22} color={theme.colors['red'][6]} stroke={1.75} />
                                            <Text>Unsupported file format</Text>
                                        </Group>
                                    </Dropzone.Reject>
                                    <Dropzone.Idle>
                                        <Group position="center" spacing={10} style={{ minHeight: 40, pointerEvents: 'none' }}>
                                            <IconArrowUpCircle size={22} color={theme.colors['blue'][6]} stroke={1.75} />
                                            <Text color={dark ? theme.colors['gray'][0] : theme.colors['dark'][9]}>
                                                Drop files or click here to upload
                                            </Text>
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
                        {isPreviewImage > 0 && multiple && displayView === 'grid' && (
                            <Group position="left" spacing={13} mb={20}>
                                {imageFile?.map((val: any, index: number) => {
                                    return (
                                        <Box key={index} sx={{ position: 'relative' }}>
                                            <FileTypeGrid
                                                type={val?.type}
                                                filePath={val?.src}
                                                fileSize={val?.size}
                                                showFileDetail={showFileDetail}
                                                fileName={val?.name}
                                            />
                                            {withCloseButton && (
                                                <ActionIcon
                                                    variant="light"
                                                    color={dark ? 'gray.5' : 'dark'}
                                                    radius="xl"
                                                    size="xs"
                                                    sx={{ position: 'absolute', top: -7, right: -6, zIndex: 1 }}
                                                    onClick={() => {
                                                        form.setFieldValue(
                                                            name,
                                                            form.values[name]?.filter((_: any, key: number) => key !== Number(index))
                                                        );
                                                        imagePreview &&
                                                            form.setFieldValue(
                                                                imagePreview,
                                                                form.values[imagePreview]?.filter((_: any, key: number) => key !== Number(index))
                                                            );
                                                    }}>
                                                    <IconX size={14} />
                                                </ActionIcon>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Group>
                        )}
                        {isPreviewImage > 0 && multiple && displayView === 'list' && (
                            <Box mb={20}>
                                {imageFile?.map((val: any, index: number) => {
                                    return (
                                        <Group key={index} position="apart" spacing={10} mb={10}>
                                            <Group position="left">
                                                <FileTypeList type={val?.type} filePath={val?.src} fileSize={val?.size} />
                                                {showFileDetail && (val?.name || val?.size !== 'NaN undefined') && (
                                                    <Box>
                                                        <Text
                                                            size={12}
                                                            weight={500}
                                                            mb={2}
                                                            sx={{ color: !dark ? theme.colors['dark'][6] : theme.colors['gray'][0] }}>
                                                            {val?.name}
                                                        </Text>
                                                        <Text size={11} weight={500} color="dimmed">
                                                            {val?.size}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Group>
                                            {withCloseButton && (
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    radius="xl"
                                                    size="md"
                                                    onClick={() => {
                                                        form.setFieldValue(
                                                            name,
                                                            form.values[name]?.filter((_: any, key: number) => key !== Number(index))
                                                        );
                                                        imagePreview &&
                                                            form.setFieldValue(
                                                                imagePreview,
                                                                form.values[imagePreview]?.filter((_: any, key: number) => key !== Number(index))
                                                            );
                                                    }}>
                                                    <IconTrash size={18} color={theme.colors['red'][6]} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                    );
                                })}
                            </Box>
                        )}
                    </>
                );
            }}
        </Field>
    );
};

export default MultiFileDropzone;
