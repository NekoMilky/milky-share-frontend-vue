export type PageRole = "public" | "onlyUser" | "onlyGuest";

export interface PageConfig {
    name: string,
    requireRole: PageRole,
    showInSidebar: boolean,
    iconSrc?: string,
    isIconCircle?: boolean,    
    label?: string
}

export interface Page extends PageConfig {
    path: string,
    pathWithParameter: string,
    iconSrc: string,
    label: string
    parameter?: string
};
