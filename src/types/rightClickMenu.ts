export interface RightClickMenu {
    key: string,
    label: string,
    iconSrc: string,
    onClick: () => void,
    danger?: boolean
};
