import type { ApiResponse, User } from "@/types";
import { sendPost } from "./index";

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

export const get = async (userId: string): Promise<ApiResponse> => {
    const data = {
        userId: userId
    };
    const response = await sendPost("user/get", data, {});
    return response;
};

export const saveProfile = async (
    avatarFile: File | null, 
    userInfo: User
): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("userId", userInfo.id);
    formData.append("nickname", userInfo.nickname);
    if (avatarFile) {
        formData.append("avatar", avatarFile);
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
