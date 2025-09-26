import { sendPost } from "/src/api/Index";

export const create = async (userId, name) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", name);
    const response = await sendPost("playlist/create", formData, {});
    return response;
};

export const addSong = async (playlistId, songId) => {
    const formData = new FormData();
    formData.append("playlistId", playlistId);
    formData.append("songId", songId);
    const response = await sendPost("playlist/add_song", formData, {});
    return response;
};

export const getAllByUser = async (userId) => {
    const formData = new FormData();
    formData.append("userId", userId);
    const response = await sendPost("playlist/get_all_by_user", formData, {});
    return response;
};

export const saveInfo = async (coverFile, playlistInfo) => {
    const formData = new FormData();
    formData.append("cover", coverFile);
    formData.append("playlistId", playlistInfo.id);
    formData.append("name", playlistInfo.name);
    const response = await sendPost("playlist/save_info", formData, {});
    return response;
};
