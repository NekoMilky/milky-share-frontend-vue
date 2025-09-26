import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { isSuccessWithToast, checkEmptyField, hasObjectChanges } from "/src/utils/Utility";
import { getAllByUser, create, saveInfo } from "/src/api/Playlist";
import { useDialog } from "/src/stores/Dialog";
import { useUser } from "/src/stores/User";
import { useSongList } from "./SongList";

export const usePlaylist = defineStore("Playlist", () => {
    const dialogStore = useDialog();
    const userStore = useUser();
    const songListStore = useSongList();

    // 当前用户歌单总列表
    const createPlaylist = ref([]);
    const starPlaylist = ref([]);
    const hasPlaylist = computed(() => {
        return createPlaylist.value.length + starPlaylist.value.length > 0;
    });
    const updatePlaylistList = async (viewId = null) => {
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
        // 切换查看的歌单
        let view = viewId || viewingPlaylist.value.id;
        if (view && view !== "default") {
            viewPlaylist(view);
            return;
        }
        const createLen = createPlaylist.value.length;
        const starLen = starPlaylist.value.length;
        if (createLen > 0) {
            viewPlaylist(createPlaylist.value[0].id);
            return;
        }
        if (starLen > 0) {
            viewPlaylist(starPlaylist.value[0].id);
        }
    };

    // 当前查看的歌单
    const emptyPlaylist = () => ({
        id: "",
        name: "",
        cover: null,
        create_time: "",
        create_user: {
            id: "",
            nickname: "",
            avatar: null
        }
    });
    const viewingPlaylistOrigin = ref({});
    const viewingPlaylist = ref(emptyPlaylist());
    const updateViewingPlaylist = (playlistId) => {
        let result = createPlaylist.value.find((playlist) => playlist.id === playlistId);
        if (!result) {
            result = starPlaylist.value.find((playlist) => playlist.id === playlistId);
        }
        viewingPlaylist.value = result || emptyPlaylist();
        viewingPlaylistOrigin.value = { name: viewingPlaylist.value.name };
    };
    const isViewingPlaylistEditable = computed(() => {
        return viewingPlaylist.value.create_user.id === userStore.user.id;
    });
    const viewPlaylist = (playlistId) => {
        if (!checkEmptyField(playlistId, "歌单id")) {
            return;
        }
        updateViewingPlaylist(playlistId);
        // 更新歌单的歌曲列表
        songListStore.updateViewingSongList(playlistId);
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
        updatePlaylistList(response.data.playlist.id);
    };

    // 保存当前查看歌单的信息，包含状态锁 
    const isSavingInfo = ref(false);
    const saveViewingPlaylistInfo = async (coverFile = null) => {
        if (isSavingInfo.value) {
            return;
        }
        if (!checkEmptyField(viewingPlaylist.value.id, "正在查看的歌单id")) {
            return;
        }
        if (!coverFile && !hasObjectChanges(viewingPlaylistOrigin.value, viewingPlaylist.value)) {
            return;
        }
        // 开始保存
        isSavingInfo.value = true;
        const response = await saveInfo(coverFile, viewingPlaylist.value);
        isSavingInfo.value = false;
        isSuccessWithToast(response);
        updatePlaylistList();
    };

    return {
        hasPlaylist,
        createPlaylist,
        starPlaylist,
        viewingPlaylist,
        isViewingPlaylistEditable,
        updatePlaylistList,
        viewPlaylist,
        playlistCreate,
        saveViewingPlaylistInfo
    };
});
