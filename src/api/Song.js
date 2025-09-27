import { sendPost, sendGet } from "/src/api/Index";

export const upload = async (songFile, songInfo, userId) => {
    const formData = new FormData();
    formData.append("song", songFile);
    formData.append("cover", songInfo.cover);
    formData.append("title", songInfo.title);
    formData.append("artist", songInfo.artist);
    formData.append("album", songInfo.album);
    formData.append("duration", songInfo.duration);
    formData.append("userId", userId);
    const response = await sendPost("song/upload", formData, {});
    return response;
};

export const get = async (songId) => {
    const formData = new FormData();
    formData.append("songId", songId);
    const response = await sendPost("song/get", formData, {});
    return response;
};

export const getAll = async () => {
    const response = await sendGet("song/get_all");
    return response;
};

export const getAllByPlaylist = async (playlistId) => {
    const formData = new FormData();
    formData.append("playlistId", playlistId);
    const response = await sendPost("song/get_all_by_playlist", formData, {});
    return response;
};

export const getPlaylistBySong = async (userId, songId) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("songId", songId);
    const response = await sendPost("song/get_playlist_by_song", formData, {});
    return response;
};

export const applyStarSong = async (userId, songId, starInfo) => {
    const data = {
        userId: userId,
        songId: songId,
        starInfo: starInfo
    };
    const response = await sendPost("song/apply_star_song", data, { 'Content-Type': 'application/json' });
    return response;
};

export const remove = async (userId, songId) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("songId", songId);
    const response = await sendPost("song/remove", formData, {});
    return response;
};
