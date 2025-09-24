import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getAllByUser, create } from "/src/api/Playlist";
import { useUser } from "/src/stores/User";
import { useSongList } from "/src/stores/SongList";

export const usePlaylist = defineStore("Playlist", () => {
    const userStore = useUser();
    const songListStore = useSongList();

    // 当前用户歌单总列表
    const createPlaylist = ref([]);
    const starPlaylist = ref([]);
    const updatePlaylistList = async (viewLastCreated = false) => {
        if (!userStore.isLogged) {
            createPlaylist.value = [];
            starPlaylist.value = [];
            return;
        }
        const response = await getAllByUser(userStore.user.id);
        if (!response.success) {
            console.error(response.message);
            createPlaylist.value = [];
            starPlaylist.value = [];
            return;
        }
        createPlaylist.value = response.data.createPlaylists;
        starPlaylist.value = response.data.starPlaylists;
        console.log("已更新用户的歌单列表");
        // 切换正在查看的歌单
        const createLen = createPlaylist.value.length;
        const starLen = starPlaylist.value.length;
        viewingPlaylistId.value = "";
        if (viewLastCreated) {
            if (createLen > 0) {
                viewPlaylist(createPlaylist.value[createLen - 1].id);
            }
        }
        else if (createLen > 0) {
            viewPlaylist(createPlaylist.value[0].id);
        }
        else if (starLen > 0) {
            viewPlaylist(starPlaylist.value[0].id);
        }
    }

    // 当前查看的歌单
    const viewingPlaylistId = ref("");
    const viewingPlaylist = computed(() => {
        if (viewingPlaylistId.value === "") {
            return {};
        }
        const createLen = createPlaylist.value.length;
        const starLen = starPlaylist.value.length;
        let result = null;
        if (createLen > 0) {
            result = createPlaylist.value.find((playlist) => playlist.id === viewingPlaylistId.value);
            if (result) {
                return result;
            }
        }
        if (starLen > 0) {
            result = starPlaylist.value.find((playlist) => playlist.id === viewingPlaylistId.value);
        }
        return result || {};
    });
    const viewPlaylist = (id) => {
        if (!id || id === "") {
            return;
        }
        viewingPlaylistId.value = id;
        // 更新歌单的歌曲列表
        songListStore.updateViewingSongList(viewingPlaylistId.value);
    };

    // 创建歌单
    const playlistCreate = async (name) => {
        if (!userStore.isLogged) {
            return;
        }
        const response = await create(userStore.user.id, name);
        toastStore.addMessage(response);
        if (!response.success) {
            console.error(response.message);
            return;
        }
        updatePlaylistList(true);
    };

    return {
        createPlaylist,
        starPlaylist,
        viewingPlaylist,
        updatePlaylistList,
        viewPlaylist,
        playlistCreate
    };
});
