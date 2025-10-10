import type { ApiResponse, User } from "@/types";
import { sendPost } from "@/api";

export const login = async (
    nickname: string, 
    password: string
): Promise<ApiResponse> => {
    const data = {
        nickname: nickname,
        password: password
    };
    const response = await sendPost("user/login", data, {});
    return response;
};

export const register = async (
    nickname: string, 
    password: string
): Promise<ApiResponse> => {
    const data = {
        nickname: nickname,
        password: password
    };
    const response = await sendPost("user/register", data, {});
    return response;
};

export const get = async (userId?: string, nickname?: string): Promise<ApiResponse> => {
    const data = {
        userId: userId,
        nickname: nickname
    };
    const response = await sendPost("user/get", data, {});
    return response;
};

export const saveProfile = async (
    operatorUserId: string,
    userInfo: User
): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("operatorUserId", operatorUserId);
    formData.append("userId", userInfo.id);
    formData.append("nickname", userInfo.nickname);
    if (userInfo.avatarFile) {
        formData.append("avatar", userInfo.avatarFile);
    }
    const response = await sendPost("user/save_profile", formData, {});
    return response;
};

export const checkNickname = async (nickname: string): Promise<ApiResponse> => {
    const data = {
        nickname: nickname
    };
    const response = await sendPost("user/check_nickname", data, {});
    return response;
};
