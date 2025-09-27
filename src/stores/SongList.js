import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { isSuccessWithToast, checkEmptyField, checkEmptyFields } from "/src/utils/Utility";
import { getAll, getAllByPlaylist, getPlaylistBySong, applyStarSong, upload, remove } from "/src/api/Song";
import { useDialog } from "/src/stores/Dialog";
import { useUser } from "/src/stores/User";
import { useMusicPlayer } from "/src/stores/MusicPlayer";
import { usePlaylist } from "/src/stores/Playlist";

export const useSongList = defineStore("SongList", () => {
    const dialogStore = useDialog();
    const userStore = useUser();
    const musicPlayerStore = useMusicPlayer();
    const playlistStore = usePlaylist();

    // 总列表
    const songList = ref([]);
    const updateSongList = async () => {
        const response = await getAll();
        if (!isSuccessWithToast(response, true)) {
            songList.value = [];
            return;
        }
        songList.value = response.data.songs;
        console.log("已更新歌曲列表");
    };

    // 当前查看歌单的歌曲列表
    const viewingSongList = ref([]);
    const updateViewingSongList = async (playlistId) => {
        if (!playlistId) {
            return;
        }
        const response = await getAllByPlaylist(playlistId);
        if (!isSuccessWithToast(response, true)) {
            viewingSongList.value = [];
            return;
        }
        viewingSongList.value = response.data.songs;
        console.log("已更新歌单的歌曲列表");
    };

    // 上传歌曲
    const uploadSong = async (file, info) => {
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
    const removeSong = (songId, songTitle) => {
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
    const confirmRemoveSong = async (values) => {
        const response = await remove(values.userId, values.songId);
        if (!isSuccessWithToast(response)) {
            return;
        }
        if (values.songId === musicPlayerStore.playingSong.id) {
            musicPlayerStore.clearSong();
        }
        updateSongList();
    };

    // 收藏歌曲
    const starSong = async (songId) => {
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
        let rows = [{ key: "title", type: "text", text: "收藏歌曲" }];
        response.data.playlists.forEach((playlist) => {
            rows.push({ 
                key: playlist.id, 
                type: "input", 
                input: { 
                    required: true, 
                    type: "checkbox", 
                    label: playlist.name, 
                    value: playlist.hasStared
                }
            });
        });
        dialogStore.loadDialog(rows, confirmStarSong, [
            { key: "userId", value: userStore.user.id },
            { key: "songId", value: songId }
        ]);
    };
    const confirmStarSong = async (values) => {
        const { userId, songId, ...starInfo } = values;
        const response = await applyStarSong(userId, songId, starInfo);
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
