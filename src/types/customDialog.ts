// 输入类型
interface BaseInput {
    label: string,
    required?: boolean
};
interface TextInput extends BaseInput {
    type: "text",
    value: string,
    placeholder?: string
};
interface CheckboxInput extends BaseInput {
    type: "checkbox",
    value: boolean
};
type RowInput = TextInput | CheckboxInput;

// 行类型
interface BaseRow {
    key: string,
    isDanger?: boolean
};
interface TextRow extends BaseRow {
    type: "text",
    text: string
};
interface InputRow extends BaseRow {
    type: "input",
    input: RowInput
};

export type DialogRow = TextRow | InputRow;
