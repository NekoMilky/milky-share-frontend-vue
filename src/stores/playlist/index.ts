import type { JSONObject, Playlist } from "@/types";

import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { isSuccessWithToast, checkEmptyField, hasObjectChanges } from "@/utils";
import { getAllByUser, create, saveInfo } from "@/api/playlist";

import { useCustomDialog, useUser, useSong } from "@/stores";

export const usePlaylist = defineStore("playlist", () => {
    const customDialogStore = useCustomDialog();
    const userStore = useUser();
    const songStore = useSong();

    // 当前用户歌单总列表
    const createPlaylist = ref<Array<Playlist>>([]);
    const starPlaylist = ref<Array<Playlist>>([]);
    const hasPlaylist = computed<boolean>(() => createPlaylist.value.length + starPlaylist.value.length > 0);
    const updatePlaylistList = async (viewId: string | null = null): Promise<void> => {
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
        createPlaylist.value = response.data?.createPlaylists as Array<Playlist>;
        starPlaylist.value = response.data?.starPlaylists as Array<Playlist>;
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
            viewPlaylist((createPlaylist.value[0] as Playlist).id);
            return;
        }
        if (starLen > 0) viewPlaylist((starPlaylist.value[0] as Playlist).id);
    };

    // 当前查看的歌单
    const emptyPlaylist = (): Playlist => ({
        id: "",
        name: "",
        cover: null,
        createTime: "",
        createUser: {
            id: "",
            nickname: "",
            avatar: null
        }
    });
    const viewingPlaylist = ref<Playlist>(emptyPlaylist());
    const updateViewingPlaylist = (playlistId: string): void => {
        let result = createPlaylist.value.find(playlist => playlist.id === playlistId);
        if (!result) result = starPlaylist.value.find(playlist => playlist.id === playlistId);
        viewingPlaylist.value = result || emptyPlaylist();
    };
    const isViewingPlaylistEditable = computed<boolean>(() => viewingPlaylist.value.createUser?.id === userStore.user.id);
    const viewPlaylist = (playlistId: string): void => {
        if (!checkEmptyField(playlistId, "歌单id")) return;
        updateViewingPlaylist(playlistId);
        songStore.updateViewingSongList(playlistId);
    };

    // 创建歌单
    const playlistCreate = (): void => {
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法创建歌单", success: false });
            return;
        }
        customDialogStore.loadDialog([
            { key: "title", type: "text", text: "创建新歌单" },
            { key: "playlistName", type: "input", input: { required: true, type: "text", label: "歌单名", value: "", placeholder: "请输入歌单名" } }
        ], confirmPlaylistCreate, [
            { key: "userId", value: userStore.user.id }
        ]);
    };
    const confirmPlaylistCreate = async (values: JSONObject): Promise<void> => {
        const response = await create(values.userId as string, values.playlistName as string);
        if (!isSuccessWithToast(response)) return;
        updatePlaylistList((response.data?.playlist as Playlist).id);
    };

    // 保存当前查看歌单的信息，包含状态锁 
    const isSavingInfo = ref<boolean>(false);
    const saveViewingPlaylistInfo = async (playlistInfo: Playlist): Promise<void> => {
        // 检查状态锁
        if (isSavingInfo.value) return;

        // 检查登录状态
        if (!userStore.isLogged) {
            isSuccessWithToast({ message: "游客无法修改歌单信息", success: false });
            return;
        }

        // 检查空值
        if (!checkEmptyField(viewingPlaylist.value.id, "正在查看的歌单id")) return;

        // 检查更改状态
        const originInfo = { name: viewingPlaylist.value.name };
        const newInfo = { name: playlistInfo.name };
        if (!playlistInfo.coverFile && !hasObjectChanges(originInfo, newInfo)) return;

        // 开始保存
        isSavingInfo.value = true;
        const response = await saveInfo(userStore.user.id, playlistInfo);
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
        
        emptyPlaylist,
        updatePlaylistList,
        viewPlaylist,
        playlistCreate,
        saveViewingPlaylistInfo
    };
});
