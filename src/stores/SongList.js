import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { getAll, getAllByPlaylist } from "/src/api/Song";
import { useToast } from "/src/stores/Toast";

export const useSongList = defineStore("SongList", () => {
    const toastStore = useToast();

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

    // 初始化
    onMounted(() => {
        updateSongList();
    });

    return {
        songList,
        viewingSongList,
        updateViewingSongList
    };
});
