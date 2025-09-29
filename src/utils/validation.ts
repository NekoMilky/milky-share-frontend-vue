import type { JSONObject, ApiResponse } from "@/types";
import { useToast } from "@/stores/toast";

// 操作反馈
export const isSuccessWithToast = (response: ApiResponse, hideSuccessToast: boolean = false): boolean => {
    if (!hideSuccessToast || !response.success) {
        useToast().addMessage(response);
    }
    if (!response.success) {
        console.error(response.message);
    }
    return response.success;
};

// 检查空值
export const checkEmptyField = (value: unknown, label: string): boolean => {
    const isEmpty = value === undefined
        || value === null
        || (typeof value === "string" && !value.trim())
        || (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
        isSuccessWithToast({ message: `${label}不能为空值`, success: false })
        return false;
    }
    return true;
};
export const checkEmptyFields = <T extends JSONObject>(
    fields: T, 
    labels: Partial<Record<keyof T, string>>
): boolean => {
    for (const [key, value] of Object.entries(fields)) {
        const label = labels[key] ?? key;
        if (!checkEmptyField(value, label)) {
            return false;
        }
    }
    return true;
};

// 判断目标对象在原对象上相应的值是否发生改变
export const hasObjectChanges = <T extends JSONObject>(
    origin: Partial<T>, 
    target: T
): boolean => {
    return (Object.keys(origin) as Array<keyof T>).some((key) => {
        return origin[key] !== target[key];
    });
};
