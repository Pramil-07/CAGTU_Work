import { createStyles } from '@mantine/core';

export const useTextEditorStyles = createStyles(() => ({
    richTextEditor: {
        '.ql-editor ': {
            overflowY: 'auto',
            height: '500px',
        },
    },
}));
