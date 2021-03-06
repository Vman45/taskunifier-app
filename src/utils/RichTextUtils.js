import RichTextEditor from 'react-rte';

export function createValueFromString(value) {
    const text = value || '';

    if (text && !text.match(/<([a-z]+)\s*\/?>/)) {
        return RichTextEditor.createValueFromString(text, 'markdown');
    }

    return RichTextEditor.createValueFromString(text, 'html');
}

export function convertToPlainText(value) {
    return createValueFromString(value).getEditorState().getCurrentContent().getPlainText();
}