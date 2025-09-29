import type { JSONObject, ApiResponse } from "@/types";
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

const config = await fetch("/config.json").then(response => response.json());
const BACKEND_URL = config.BACKEND_URL;

interface ErrorResponseData {
    message?: string;
    [key: string]: unknown;
};

// 处理请求结果
const successResponse = (response: AxiosResponse): ApiResponse => {
    return {
        success: true,
        data: response.data,
        message: response.data.message ?? "请求成功"
    };
};
const errorResponse = (error: AxiosError<ErrorResponseData>): ApiResponse => {
    // 后端返回错误
    if (error.response) {
        return {
            success: false,
            message: error.response.data.message ?? "请求失败"
        };
    }
    // 没有收到响应
    else if (error.request) {
        return {
            success: false,
            message: "无法连接到服务器"
        };
    }
    // 其他错误
    else {
        return {
            success: false,
            message: "请求错误"
        };
    }
};

export const sendPost = async (
    api: string, 
    data: JSONObject | FormData, 
    options: AxiosRequestConfig = {}
): Promise<ApiResponse> => {
    try {
        const url = new URL(api, BACKEND_URL).toString();
        const response = await axios.post(url, data, options);
        return successResponse(response);
    }
    catch (error: unknown) {
        if (axios.isAxiosError<ErrorResponseData>(error)) {
            return errorResponse(error);
        }
        return {
            success: false,
            message: "未知错误"
        };
    }
};
export const sendGet = async (api: string): Promise<ApiResponse> => {
    try {
        const url = new URL(api, BACKEND_URL).toString();
        const response = await axios.get(url);
        return successResponse(response);
    } catch (error: unknown) {
        if (axios.isAxiosError<ErrorResponseData>(error)) {
            return errorResponse(error);
        }
        return {
            success: false,
            message: "未知错误"
        };
    }
};
