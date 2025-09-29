<script setup lang="ts">
import { ref } from "vue";
import { dateFormat, isSuccessWithToast, compressImage } from "@/utils";
import { usePlaylist } from "@/stores/playlist";

import defaultCoverImg from "@/assets/images/default/cover.png";
import defaultAvatarImg from "@/assets/images/default/avatar.png";

const playlistStore = usePlaylist();

// 处理封面选择
const coverInput = ref<HTMLInputElement | null>(null);
const selectFiles = async (files: FileList | null | undefined): Promise<void> => {
    if (!files) {
        isSuccessWithToast({ message: "请选择文件", success: false });
        return;
    }
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
        isSuccessWithToast({ message: "请选择图像文件", success: false });
        return;
    }
    const cover = imageFiles[0];
    if (cover) {
        playlistStore.saveViewingPlaylistInfo(await compressImage(cover));
    }
};
const checkInputEvent = (event: InputEvent): void => {
    selectFiles((event.target as HTMLInputElement).files);
};
</script>

<template>
    <div class="container">
        <div class="playlist-cover">
            <!--创建者可修改封面-->
            <template v-if="playlistStore.isViewingPlaylistEditable">
                <img 
                    class="cover cover-modify" 
                    :src="playlistStore.viewingPlaylist.cover ?? defaultCoverImg" 
                    @click="coverInput?.click()"
                />
                <input 
                    type="file" 
                    ref="coverInput" 
                    accept="image/*" 
                    style="display: none;"
                    @change="checkInputEvent($event as InputEvent)" 
                />
            </template>
            <template v-else>
                <img class="cover" :src="playlistStore.viewingPlaylist.cover ?? defaultCoverImg" />
            </template>
        </div>
        <div class="playlist-info">
            <!--创建者可修改名称-->
            <template v-if="playlistStore.isViewingPlaylistEditable">
                <input 
                    v-model="playlistStore.viewingPlaylist.name"
                    class="input-frame playlist-name"
                    type="text" 
                    placeholder="请输入歌单名" 
                    v-on:blur="playlistStore.saveViewingPlaylistInfo(null)"
                />
            </template>
            <template v-else>
                <div class="playlist-name">{{ playlistStore.viewingPlaylist.name }}</div>
            </template>
            <div class="playlist-create">
                <div class="cell">
                    <img class="avatar" :src="playlistStore.viewingPlaylist.createUser?.avatar ?? defaultAvatarImg" />
                    {{ playlistStore.viewingPlaylist.createUser?.nickname }}
                </div>
                <div class="cell">
                    {{ `${dateFormat(playlistStore.viewingPlaylist.createTime ?? '')}创建` }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    flex-direction: row;
}

.playlist-cover {
    width: 20%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.cover {
    height: 90%;
    aspect-ratio: 1;
    border-radius: 50%;
}

.cover-modify {
    filter: brightness(1);
    transform: var(--transition-duration);
}

.cover-modify:hover {
    cursor: pointer;
    filter: brightness(0.8);
}

.input-frame {
    width: 90%;
}

.playlist-info {
    width: 75%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.playlist-name {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 1.2em;
    font-weight: bold;
}

.playlist-create {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.cell {
    margin: 0 0.5em;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.avatar {
    height: 1.5em;
    margin-right: 0.5em;
    aspect-ratio: 1;
    border-radius: 50%;
}
</style>
