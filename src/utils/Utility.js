import { useToast } from "/src/stores/Toast";

// 时间格式化
export const timeFormat = (seconds) => {
    const minute = Math.floor(seconds / 60).toString().padStart(2, "0");
    const second = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minute}:${second}`;
};

// 日期格式化
export const dateFormat = (d) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// 操作反馈
export const isSuccessWithToast = (response, hideSuccessToast = false) => {
    if (!hideSuccessToast || !response.success) {
        useToast().addMessage(response);
    }
    if (!response.success) {
        console.error(response.message, response.error);
    }
    return response.success;
};

// 检查空值
export const checkEmptyField = (value, label) => {
    const isEmpty = value === undefined
        || value === null
        || (typeof value === "string" && value.trim() === "")
        || (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
        isSuccessWithToast({ message: `${label}不能为空值`, success: false })
        return false;
    }
    return true;
};
export const checkEmptyFields = (fields, labels = null) => {
    for (const [key, value] of Object.entries(fields)) {
        const label = labels[key] || key;
        if (!checkEmptyField(value, label)) {
            return false;
        }
    }
    return true;
};

// 判断目标对象在原对象上相应的值是否发生改变
export const hasObjectChanges = (origin, target, ignoreKeys = {}) => {
    return Object.keys(origin).some((key) => {
        if (ignoreKeys[key]) {
            return false;
        }
        return origin[key] !== target[key];
    });
};
