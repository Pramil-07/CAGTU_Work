import { TextEditorProps, useDark } from '@cagtu-cms/util-formatter';
import { Text, useMantineTheme } from '@mantine/core';
import RichTextEditor, { RichTextEditorProps } from '@mantine/rte';
import { Field } from 'formik';

const TextEditor = ({
    name,
    error,
    touch,
    height = 500,
    labelName,
    sticky = false,
    withAsterisk,
    ...restProps
}: TextEditorProps & RichTextEditorProps) => {
    const theme = useMantineTheme();
    const [dark] = useDark();

    const errTouch = error && touch ? error : null;

    return (
        <>
            {labelName && (
                <Text size="sm" component="label" weight={500} mb={4} sx={{ display: 'inline-block' }}>
                    {labelName}{' '}
                    {withAsterisk && (
                        <Text component="span" color="red">
                            *
                        </Text>
                    )}
                </Text>
            )}
            <Field name={name}>
                {() => (
                    <RichTextEditor
                        {...restProps}
                        styles={{
                            root: {
                                '.ql-editor': {
                                    overflowY: 'auto',
                                    height: `${height}px`,
                                },
                                borderColor: `${!errTouch ? (dark ? theme.colors['dark'][5] : theme.colors['gray'][4]) : theme.colors['red'][7]}`,
                            },
                        }}
                        sticky={sticky}
                    />
                )}
            </Field>
            {errTouch && (
                <Text size="sm" component="label" weight={500} mt={4} color="red" sx={{ display: 'inline-block', fontSize: 13 }}>
                    {error}
                </Text>
            )}
        </>
    );
};

export default TextEditor;
