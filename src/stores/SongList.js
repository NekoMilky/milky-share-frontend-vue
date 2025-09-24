import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { getAll, getAllByPlaylist, upload, remove } from "/src/api/Song";
import { useToast } from "/src/stores/Toast";
import { useDialog } from "/src/stores/Dialog";
import { useUser } from "/src/stores/User";

export const useSongList = defineStore("SongList", () => {
    const toastStore = useToast();
    const dialogStore = useDialog();
    const userStore = useUser();

    // 总列表
    const songList = ref([]);
    const updateSongList = async () => {
        const response = await getAll();
        if (!response.success) {
            toastStore.addMessage(response);
            console.error(response.message);
            songList.value = [];
            return;
        }
        songList.value = response.data.songs;
        console.log("已更新歌曲列表");
    };

    // 当前查看歌单的歌曲列表
    const viewingSongList = ref([]);
    const updateViewingSongList = async (playlistId) => {
        if (!playlistId || playlistId === "") {
            return;
        }
        const response = await getAllByPlaylist(playlistId);
        if (!response.success) {
            toastStore.addMessage(response);
            console.error(response.message);
            viewingSongList.value = [];
            return;
        }
        viewingSongList.value = response.data.songs;
        console.log("已更新歌单的歌曲列表");
    };

    // 上传歌曲
    const uploadSong = async (file, info) => {
        if (!userStore.isLogged || !file || !info) {
            return;
        }
        const response = await upload(file, info, userStore.user.id);
        toastStore.addMessage(response);
        if (!response.success) {
            console.error(response.message);
        }
        updateSongList();
    };

    // 删除歌曲
    const removeSong = (songId, songTitle) => {
        if (!userStore.isLogged || !songId || songId === "") {
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
        toastStore.addMessage(response);
        if (!response.success) {
            console.error(response.message);
            return;
        }
        updateSongList();
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
        removeSong
    };
});
