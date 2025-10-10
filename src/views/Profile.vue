<script setup lang="ts">
import type { User, Song, CustomItemListColumn } from "@/types";

import { ref, watch, computed } from "vue";

import { get } from "@/api/user";
import { isSuccessWithToast } from "@/utils";

import { useUser, useSong } from "@/stores";

import CustomBackground from "@/components/common/CustomBackground.vue";
import BaseInformation from "@/components/page/profile/BaseInformation.vue";
import TabSelector from "@/components/common/TabSelector.vue";
import SongList from "@/components/common/SongList.vue";
import AccountSettings from "@/components/page/profile/AccountSettings.vue";

import BackgroundImage from "@/assets/images/background.png";

const userStore = useUser();
const songStore = useSong();

const props = withDefaults(defineProps<{
    parameter: string
}>(), {
    parameter: ""
});

// 用户基本信息
const isOwner = ref<boolean>(false);
const userInfo = ref<User>(userStore.emptyUser());
const updateUserInfo = async (nickname: string): Promise<void> => {
    isOwner.value = false;
    if (nickname === userStore.user.nickname) {
        isOwner.value = true;
        userInfo.value = { ...userStore.user };
        return;
    }
    const response = await get(void 0, nickname);
    if (!isSuccessWithToast(response, true)) {
        userInfo.value = userStore.emptyUser();
        return;
    }
    userInfo.value = response.data?.user as User;
};
watch(() => props.parameter, nickname => {
    updateUserInfo(nickname);
}, { immediate: true });
watch(() => userStore.user, user => {
    if (isOwner.value) {
        userInfo.value = { ...user };
    }
}, { deep: true });

// 上传的歌曲列表
const uploadedSongList = computed<Array<Song>>(() => {
    return songStore.songList.filter(song => song.uploader?.id === userInfo.value.id);
});
const uploadedSongColumn: Array<CustomItemListColumn> = [
    { key: "index", label: "#", sortable: false, width: 10, widthAdjustable: false, itemAlign: "center" },
    { key: "title", label: "标题", sortable: true, width: 45, widthAdjustable: true, itemAlign: "flex-start" },
    { key: "album", label: "专辑", sortable: true, width: 20, widthAdjustable: true, itemAlign: "center" },
    { key: "duration", label: "时长", sortable: true, width: 15, widthAdjustable: true, itemAlign: "center" },
    { key: "delete", label: "删除", sortable: false, width: 10, widthAdjustable: false, itemAlign: "center" }
];
const uploadedSongColumnVisitor: Array<CustomItemListColumn> = [
    { key: "index", label: "#", sortable: false, width: 10, widthAdjustable: false, itemAlign: "center" },
    { key: "title", label: "标题", sortable: true, width: 55, widthAdjustable: true, itemAlign: "flex-start" },
    { key: "album", label: "专辑", sortable: true, width: 20, widthAdjustable: true, itemAlign: "center" },
    { key: "duration", label: "时长", sortable: true, width: 15, widthAdjustable: true, itemAlign: "center" }
];

// 保存档案
const saveProfile = (avatar?: File): void => {
    if (!isOwner.value) return;
    if (avatar) userInfo.value.avatarFile = avatar;
    userStore.userSaveProfile(userInfo.value);
};
</script>

<template>
    <div class="page">
        <CustomBackground :backgroundSrc="BackgroundImage" />
        <div class="subpage">
            <div class="container profile"> 
                <BaseInformation 
                    class="responsive"
                    v-model="userInfo"
                    :isOwner="isOwner" 
                    :onSave="saveProfile"
                />
                <TabSelector 
                    class="responsive secondary-color"
                    :tabs="[
                        { id: 'uploads', label: '上传的音乐' },
                        { id: 'settings', label: '账户设置' }
                    ]"
                >
                    <template #uploads>
                        <SongList 
                            style="height: 75dvh;" 
                            :list="uploadedSongList" 
                            :rightClickMenuPreset="isOwner ? ['play', 'download', 'delete'] : ['play', 'download']"
                            :columns="isOwner ? uploadedSongColumn : uploadedSongColumnVisitor"
                        />
                    </template>
                    <template #settings>
                        <AccountSettings style="height: auto;" />
                    </template>
                </TabSelector>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page::before {
    content: "";
    height: 15dvh;
}

.page::after {
    content: "";
    height: 15dvh;
}

.profile {
    width: 100%;
    height: auto;
    gap: 1em;
    padding: 1em;
}

.responsive {
    width: 100%;
    height: auto;
}
</style>
