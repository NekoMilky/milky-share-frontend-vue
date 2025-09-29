import type { ApiResponse, Song } from "@/types";
import { sendPost, sendGet } from "./index";

export const upload = async (
    songFile: File, 
    songInfo: Song, 
    userId: string
): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("song", songFile);
    formData.append("title", songInfo.title);
    formData.append("artist", songInfo.artist);
    formData.append("album", songInfo.album);
    formData.append("duration", songInfo.duration.toString());
    formData.append("userId", userId);
    if (songInfo.cover) {
        formData.append("cover", songInfo.cover);
    }
    const response = await sendPost("song/upload", formData);
    return response;
};

export const get = async (songId: string): Promise<ApiResponse> => {
    const data = {
        songId: songId
    };
    const response = await sendPost("song/get", data);
    return response;
};

export const getAll = async (): Promise<ApiResponse> => {
    const response = await sendGet("song/get_all");
    return response;
};

export const getAllByPlaylist = async (playlistId: string): Promise<ApiResponse> => {
    const data = {
        playlistId: playlistId
    };
    const response = await sendPost("song/get_all_by_playlist", data);
    return response;
};

export const getPlaylistBySong = async (
    userId: string, 
    songId: string
): Promise<ApiResponse> => {
    const data = {
        userId: userId,
        songId: songId
    };
    const response = await sendPost("song/get_playlist_by_song", data);
    return response;
};

export const applyStarSong = async (
    userId: string, 
    songId: string, 
    starInfo: any
): Promise<ApiResponse> => {
    const data = {
        userId: userId,
        songId: songId,
        starInfo: starInfo
    };
    const response = await sendPost("song/apply_star_song", data);
    return response;
};

export const remove = async (
    userId: string, 
    songId: string
): Promise<ApiResponse> => {
    const data = {
        userId: userId,
        songId: songId
    };
    const response = await sendPost("song/remove", data);
    return response;
};
