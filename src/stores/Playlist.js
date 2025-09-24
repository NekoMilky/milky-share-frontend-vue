import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { isSuccessWithToast, checkEmptyField } from "/src/utils/Utility";
import { getAllByUser, create } from "/src/api/Playlist";
import { useDialog } from "/src/stores/Dialog";
import { useUser } from "/src/stores/User";
import { useSongList } from "/src/stores/SongList";

export const usePlaylist = defineStore("Playlist", () => {
    const dialogStore = useDialog();
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
        if (!isSuccessWithToast(response, true)) {
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
    const viewPlaylist = (playlistId) => {
        if (!checkEmptyField(playlistId, "歌单id")) {
            return;
        }
        viewingPlaylistId.value = playlistId;
        // 更新歌单的歌曲列表
        songListStore.updateViewingSongList(viewingPlaylistId.value);
    };

    // 创建歌单
    const playlistCreate = () => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法创建歌单", success: false });
            return;
        }
        dialogStore.loadDialog([
            { key: "title", type: "text", text: "创建新歌单" },
            { key: "playlistName", type: "input", input: { required: true, type: "text", label: "歌单名", value: "", placeholder: "请输入歌单名" } }
        ], confirmPlaylistCreate, [
            { key: "userId", value: userStore.user.id }
        ]);
    };
    const confirmPlaylistCreate = async (values) => {
        const response = await create(values.userId, values.playlistName);
        if (!isSuccessWithToast(response)) {
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
