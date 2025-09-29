import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import type { JSONObject, DialogRow, Playlist, Song } from "@/types";
import { isSuccessWithToast, checkEmptyField, checkEmptyFields } from "@/utils";
import { getAll, getAllByPlaylist, getPlaylistBySong, applyStarSong, upload, remove } from "@/api/song";
import { useDialog } from "./dialog";
import { useUser } from "./user";
import { useMusicPlayer } from "./musicPlayer";
import { usePlaylist } from "./playlist";

export const useSongList = defineStore("songList", () => {
    const dialogStore = useDialog();
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

    // 上传歌曲
    const uploadSong = async (
        file: File, 
        info: Song
    ): Promise<void> => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法使用上传功能", success: false });
            return;
        }
        if (!checkEmptyFields({ file, info }, { file: "音频文件", info: "歌曲元信息" })) {
            return;
        }
        const response = await upload(file, info, userStore.user.id);
        if (!isSuccessWithToast(response)) {
            return;
        }
        updateSongList();
    };

    // 删除歌曲
    const removeSong = (songId: string, songTitle: string): void => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法删除歌曲", success: false });
            return;
        }
        if (!checkEmptyField(songId, "歌曲id")) {
            return;
        }
        dialogStore.loadDialog([
            { key: "title", type: "text", text: "删除歌曲确认" },
            { key: "confirm", type: "text", text: `你确定要删除歌曲“${songTitle}”吗？` },
            { key: "mayCauseIssue", type: "text", text: "此操作无法恢复！", danger: true }
        ], confirmRemoveSong, [
            { key: "userId", value: userStore.user.id },
            { key: "songId", value: songId }
        ]);
    };
    const confirmRemoveSong = async (values: JSONObject): Promise<void> => {
        const response = await remove(values.userId as string, values.songId as string);
        if (!isSuccessWithToast(response)) {
            return;
        }
        if (values.songId === musicPlayerStore.playingSong.id) {
            musicPlayerStore.clearSong();
        }
        updateSongList();
        updateViewingSongList(playlistStore.viewingPlaylist.id);
    };

    // 收藏歌曲
    const starSong = async (songId: string): Promise<void> => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法收藏歌曲", success: false });
            return;
        }
        if (!checkEmptyField(songId, "歌曲id")) {
            return;
        }
        const response = await getPlaylistBySong(userStore.user.id, songId);
        if (!isSuccessWithToast(response, true)) {
            return;
        }
        let rows: Array<DialogRow> = [{ key: "title", type: "text", text: "收藏歌曲" }];
        (response.data?.playlists as Array<Playlist>).forEach((playlist: Playlist) => {
            rows.push({ 
                key: playlist.id, 
                type: "input", 
                input: { 
                    required: true, 
                    type: "checkbox", 
                    label: playlist.name, 
                    value: playlist.hasStared as boolean
                }
            });
        });
        dialogStore.loadDialog(rows, confirmStarSong, [
            { key: "userId", value: userStore.user.id },
            { key: "songId", value: songId }
        ]);
    };
    const confirmStarSong = async (values: JSONObject): Promise<void> => {
        const { userId, songId, ...starInfo } = values;
        const response = await applyStarSong(userId as string, songId as string, starInfo);
        if (!isSuccessWithToast(response)) {
            return;
        }
        updateViewingSongList(playlistStore.viewingPlaylist.id);
    };

    // 初始化
    onMounted(() => {
        updateSongList();
    });

    return {
        songList,
        viewingSongList,
        updateViewingSongList,
        uploadSong,
        removeSong,
        starSong
    };
});
