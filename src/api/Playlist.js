import { sendPost } from "/src/api/Index";

export const create = async (userId, name) => {
    const data = {
        userId: userId,
        name: name
    };
    const response = await sendPost("playlist/create", data, {});
    return response;
};

export const getAllByUser = async (userId) => {
    const data = {
        userId: userId
    };
    const response = await sendPost("playlist/get_all_by_user", data, {});
    return response;
};

export const saveInfo = async (coverFile, userId, playlistInfo) => {
    const formData = new FormData();
    formData.append("cover", coverFile);
    formData.append("userId", userId);
    formData.append("playlistId", playlistInfo.id);
    formData.append("name", playlistInfo.name);
    const response = await sendPost("playlist/save_info", formData, {});
    return response;
};
