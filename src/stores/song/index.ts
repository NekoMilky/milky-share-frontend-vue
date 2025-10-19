import type { JSONObject, Playlist, Song, DialogRow } from "@/types";

import { defineStore } from "pinia";
import { ref } from "vue";

import { isSuccessWithToast, checkEmptyField, checkEmptyFields } from "@/utils";
import { get, getAll, getAllByPlaylist, getPlaylistBySong, applyStarSong, upload, remove } from "@/api/song";

import { useCustomDialog } from "@/stores/customDialog";
import { useUser } from "@/stores/user";
import { useMusicPlayer } from "@/stores/musicPlayer";
import { usePlaylist } from "@/stores/playlist";

export const useSong = defineStore("song", () => {
    const customDialogStore = useCustomDialog();
    const userStore = useUser();
    const musicPlayerStore = useMusicPlayer();
    const playlistStore = usePlaylist();

    // 总列表
    const songList = ref<Array<Song>>([]);
    const updateSongList = async (): Promise<void> => {
        const response = await getAll();
        if (!isSuccessWithToast(response, true)) {
            songList.value = [];
            return;
        }
        songList.value = response.data?.songs as Array<Song>;
        console.log("已更新歌曲列表");
    };

    // 当前查看歌单的歌曲列表
    const viewingSongList = ref<Array<Song>>([]);
    const updateViewingSongList = async (playlistId: string): Promise<void> => {
        if (!playlistId) {
            return;
        }
        const response = await getAllByPlaylist(playlistId);
        if (!isSuccessWithToast(response, true)) {
            viewingSongList.value = [];
            return;
        }
        viewingSongList.value = response.data?.songs as Array<Song>;
        console.log("已更新歌单的歌曲列表");
    };

    // 上传歌曲，包含状态锁
    const isUploading = ref<boolean>(false);
    const uploadSong = async (
        file: File, 
        info: Song
    ): Promise<void> => {
        if (isUploading.value) return;
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法使用上传功能", success: false });
            return;
        }
        if (!checkEmptyFields({ file, info }, { file: "音频文件", info: "歌曲元信息" })) return;
        isUploading.value = true;
        const response = await upload(file, info, userStore.user.id);
        isUploading.value = false;
        if (!isSuccessWithToast(response)) return;
        updateSongList();
    };

    // 删除歌曲
    const removeSong = (songId: string, songTitle: string): void => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法删除歌曲", success: false });
            return;
        }
        if (!checkEmptyField(songId, "歌曲id")) return;
        customDialogStore.loadDialog([
            { key: "title", type: "text", text: "删除歌曲" },
            { key: "confirm", type: "text", text: `你确定要删除歌曲“${songTitle}”吗？` },
            { key: "mayCauseIssue", type: "text", text: "此操作无法恢复！", isDanger: true }
        ], confirmRemoveSong, [
            { key: "userId", value: userStore.user.id },
            { key: "songId", value: songId }
        ]);
    };
    const confirmRemoveSong = async (values: JSONObject): Promise<void> => {
        const response = await remove(values.userId as string, values.songId as string);
        if (!isSuccessWithToast(response)) return;
        if (values.songId === musicPlayerStore.playingSong.id) musicPlayerStore.clearSong();
        updateSongList();
        updateViewingSongList(playlistStore.viewingPlaylist.id);
    };

    // 收藏歌曲
    const starSong = async (songId: string, songTitle: string): Promise<void> => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法收藏歌曲", success: false });
            return;
        }
        if (!checkEmptyField(songId, "歌曲id")) return;
        const response = await getPlaylistBySong(userStore.user.id, songId);
        if (!isSuccessWithToast(response, true)) return;
        let rows: Array<DialogRow> = [
            { key: "title", type: "text", text: "收藏歌曲" },
            { key: "confirm", type: "text", text: `请选择歌曲“${songTitle}”将要加入的歌单。` }
        ];
        const playlists = response.data?.playlists as Array<Playlist>;
        playlists.forEach(playlist => rows.push({ 
            key: playlist.id, 
            type: "input", 
            input: { 
                required: true, 
                type: "checkbox", 
                label: playlist.name, 
                value: playlist.hasStared as boolean
            }
        }));
        customDialogStore.loadDialog(rows, confirmStarSong, [
            { key: "userId", value: userStore.user.id },
            { key: "songId", value: songId }
        ]);
    };
    const confirmStarSong = async (values: JSONObject): Promise<void> => {
        const { userId, songId, ...starInfo } = values;
        const response = await applyStarSong(userId as string, songId as string, starInfo);
        if (!isSuccessWithToast(response)) return;
        updateViewingSongList(playlistStore.viewingPlaylist.id);
    };

    // 下载歌曲
    const downloadSong = async (songId: string): Promise<void> => {
        const response = await get(songId);
        if (!isSuccessWithToast(response, true)) return;
        const url = (response.data?.song as Song).url as string;
        const link = document.createElement("a");
        link.href = url;
        link.click();
    };

    // 初始化
    const init = (): void => {
        updateSongList();
    };
    init();

    return {
        songList,
        viewingSongList,
        isUploading,
        
        updateViewingSongList,
        uploadSong,
        removeSong,
        starSong,
        downloadSong
    };
});
