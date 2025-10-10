import type { ApiResponse, User } from "@/types";

import router from "@/router";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { isSuccessWithToast, checkEmptyField, hasObjectChanges } from "@/utils";
import { login, register, get, saveProfile } from "@/api/user";

import { useCustomDialog } from "@/stores/customDialog";
import { usePlaylist } from "@/stores/playlist";

export const useUser = defineStore("user", () => {
    const customDialogStore = useCustomDialog();
    const playlistStore = usePlaylist();

    // 当前登录用户
    const emptyUser = (): User => ({
        id: "",
        nickname: "",
        avatar: null
    });
    const user = ref<User>(emptyUser());
    const isLogged = computed<boolean>(() => {
        return user.value.id ? true : false;
    });
    const updateProfile = async (): Promise<void> => {
        if (!isLogged.value) {
            user.value = emptyUser();
            return;
        }
        const response = await get(user.value.id);
        if (!isSuccessWithToast(response, true)) {
            user.value = emptyUser();
            return;
        }
        user.value = response.data?.user as User;
        console.log("已更新个人档案");
        // 更新歌单列表
        playlistStore.updatePlaylistList("default");
    };

    // 注册、登录与退出登录
    const handleResponse = async (response: ApiResponse): Promise<void> => {
        if (!isSuccessWithToast(response)) {
            return;
        }
        user.value.id = (response.data?.user as User).id;
        await updateProfile(); 
        router.push(`/profile/${user.value.nickname}`);
    };
    const userRegister = async (nickname: string, password: string): Promise<void> => {
        handleResponse(await register(nickname, password));
    };
    const userLogin = async (nickname: string, password: string): Promise<void> => {
        handleResponse(await login(nickname, password));
    };
    const userLogout = (): void => {
        customDialogStore.loadDialog([
            { key: "title", type: "text", text: "退出登录确认" }
        ], confirmUserLogout);
    };
    const confirmUserLogout = async (): Promise<void> => {
        user.value = emptyUser();
        await updateProfile();
        router.push("/login");
    };

    // 保存档案，包含状态锁
    const isSavingProfile = ref<boolean>(false);
    const userSaveProfile = async (userInfo: User): Promise<void> => {
        if (isSavingProfile.value) {
            return;
        }
        if (!checkEmptyField(userInfo.id, "用户id")) {
            return;
        }
        const originInfo = { nickname: user.value.nickname };
        const newInfo = { nickname: userInfo.nickname };
        if (!userInfo.avatarFile && !hasObjectChanges(originInfo, newInfo)) {
            return;
        }
        // 开始保存
        isSavingProfile.value = true;
        const response = await saveProfile(user.value.id, userInfo);
        isSavingProfile.value = false;
        isSuccessWithToast(response);
        // 更新档案
        updateProfile();
    };

    // 初始化
    const init = (): void => {
        updateProfile();
    };

    return {
        user,
        isLogged,
        
        init,
        emptyUser,
        userRegister,
        userLogin,
        userLogout,
        updateProfile,
        userSaveProfile
    };
}, {
    // 只缓存当前用户
    persist: {
        key: "User",
        storage: localStorage,
        serializer: {
            serialize(value) {
                return JSON.stringify({
                    user: value.user
                });
            },
            deserialize(value) {
                return JSON.parse(value);
            }
        }
    }
});
