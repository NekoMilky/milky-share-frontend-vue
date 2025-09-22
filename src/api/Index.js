import axios from "axios";

const config = await fetch("/config.json").then(response => response.json());
const BACKEND_URL = config.BACKEND_URL;

const successResponse = (response) => {
    return {
        success: true,
        data: response.data,
        message: response.data?.message || "请求成功"
    };
};
const errorResponse = (error) => {
    // 后端返回错误状态
    if (error.response) {
        return {
            success: false,
            error: error.response.data,
            message: error.response.data?.message || "请求失败"
        };
    }
    // 没有收到响应
    else if (error.request) {
        return {
            success: false,
            error: null,
            message: "无法连接到服务器"
        };
    }
    // 其他错误
    else {
        return {
            success: false,
            error: error.message,
            message: "请求错误"
        };
    }
};

export const sendPost = async (method, data, options = {}) => {
    try {
        const url = new URL(method, BACKEND_URL).toString();
        const response = await axios.post(url, data, options);
        return successResponse(response);
    }
    catch (error) {
        return errorResponse(error);
    }
};
export const sendGet = async (method) => {
    try {
        const url = new URL(method, BACKEND_URL).toString();
        const response = await axios.get(url);
        return successResponse(response);
    } catch (error) {
        return errorResponse(error);
    }
};
