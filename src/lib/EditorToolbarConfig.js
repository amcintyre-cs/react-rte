export const INLINE_STYLE_BUTTONS = [
  {id: 'bold', label: 'Bold', style: 'BOLD'},
  {id: 'italic', label: 'Italic', style: 'ITALIC'},
  {id: 'strike', label: 'Strikethrough', style: 'STRIKETHROUGH'},
  {id: 'mono', label: 'Monospace', style: 'CODE'},
];

export const BLOCK_TYPE_DROPDOWN = [
  {id: 'normal', label: 'Normal', style: 'unstyled'},
  {id: 'large', label: 'Heading Large', style: 'header-one'},
  {id: 'medium', label: 'Heading Medium', style: 'header-two'},
  {id: 'small', label: 'Heading Small', style: 'header-three'},
  {id: 'code', label: 'Code Block', style: 'code-block'},
];
export const BLOCK_TYPE_BUTTONS = [
  {id: 'ul', label: 'UL', style: 'unordered-list-item'},
  {id: 'ol', label: 'OL', style: 'ordered-list-item'},
  {id: 'block', label: 'Blockquote', style: 'blockquote'},
];

export type ToolbarOption = {
    id: string,
    label: string,
    style: string
};

export default {
  INLINE_STYLE_BUTTONS,
  BLOCK_TYPE_DROPDOWN,
  BLOCK_TYPE_BUTTONS,
};
