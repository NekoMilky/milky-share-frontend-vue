import type { ApiResponse, Playlist } from "@/types";
import { sendPost } from "@/api";

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
    operatorUserId: string,
    playlistInfo: Playlist
): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("operatorUserId", operatorUserId);
    formData.append("playlistId", playlistInfo.id);
    formData.append("name", playlistInfo.name);
    if (playlistInfo.coverFile) {
        formData.append("cover", playlistInfo.coverFile);
    }
    const response = await sendPost("playlist/save_info", formData);
    return response;
};
