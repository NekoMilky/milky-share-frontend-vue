export type JSONObject<T = unknown> = Record<string, T>;

export interface ApiResponse {
    success: boolean,
    message: string,
    data?: JSONObject,
};

export interface PageTag {
    path: string,
    iconSrc: string,
    isIconCircle: boolean,
    label: string
};

export interface RightClickMenu {
    key: string,
    label: string,
    iconSrc: string,
    onClick: Function,
    danger?: boolean
};

export interface DialogRow {
    key: string,
    type: "text" | "input",
    text?: string,
    danger?: boolean,
    input? : {
        required?: boolean,
        type: "text",
        value: string,
        label: string,
        placeholder?: string
    } | {
        required?: boolean,
        type: "checkbox",
        value: boolean,
        label: string
    }
};

export interface SongListColumn {
    key: string,
    label: string,
    sortable: boolean,
    width: number
};
