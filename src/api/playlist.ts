import type { ApiResponse } from "@/types";
import { sendPost } from "./index";

export const create = async (
    userId: string, 
    name: string
): Promise<ApiResponse> => {
    const data = {
        userId: userId,
        name: name
    };
    const response = await sendPost("playlist/create", data);
    return response;
};

export const getAllByUser = async (userId: string): Promise<ApiResponse> => {
    const data = {
        userId: userId
    };
    const response = await sendPost("playlist/get_all_by_user", data);
    return response;
};

export const saveInfo = async (
    coverFile: File | null, 
    userId: string, 
    playlistInfo: any
): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("playlistId", playlistInfo.id);
    formData.append("name", playlistInfo.name);
    if (coverFile) {
        formData.append("cover", coverFile);
    }
    const response = await sendPost("playlist/save_info", formData);
    return response;
};
