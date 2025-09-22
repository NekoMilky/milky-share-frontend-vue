import { sendPost, sendGet } from "/src/api/Index";

export const uploadMusic = async (musicFile, musicInfo) => {
    const formData = new FormData();
    formData.append("file", musicFile);
    formData.append("cover", musicInfo.cover);
    formData.append("title", musicInfo.title);
    formData.append("artist", musicInfo.artist);
    formData.append("album", musicInfo.album);
    formData.append("duration", musicInfo.duration);
    const response = await sendPost("music/upload", formData, {});
    return response;
};

export const getMusic = async (songId) => {
    const formData = new FormData();
    formData.append("id", songId);
    const response = await sendPost("music/get", formData, {});
    return response;
};

export const getMusicAll = async () => {
    const response = await sendGet("music/get_all", null, {});
    return response;
};

export const starMusic = async (userId, songId) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("songId", songId);
    const response = await sendPost("music/star", formData, {});
    return response;
};

export const getStaredMusicAll = async (userId) => {
    const formData = new FormData();
    formData.append("userId", userId);
    const response = await sendPost("music/get_all_stared", formData, {});
    return response;
};
