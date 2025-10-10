export * from "./customDialog";
export * from "./customItemList";
export * from "./entity";
export * from "./page";
export * from "./rightClickMenu";

export type JSONObject<T = unknown> = Record<string, T>;

export interface ApiResponse {
    success: boolean,
    message: string,
    data?: JSONObject,
};
