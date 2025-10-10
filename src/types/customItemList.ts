export interface CustomItemListColumn {
    key: string,
    label: string,
    width: number,
    itemAlign: "center" | "flex-start" | "flex-end";
    widthAdjustable?: boolean,
    sortable?: boolean
};
