<script setup lang="ts">
import type { Playlist } from "@/types";

import { ref, watch } from "vue";

import { dateFormat } from "@/utils";

import CustomInput from "@/components/common/CustomInput.vue";
import ImageChooser from "@/components/common/ImageChooser.vue";

import DefaultCoverImage from "@/assets/images/default/cover.png";
import DefaultAvatarImage from "@/assets/images/default/avatar.png";

const props = withDefaults(defineProps<{
    modelValue: Playlist,
    isOwner: boolean,
    onSave: (cover?: File) => void
}>(), {
    isOwner: false,
    onSave: () => {}
});

// 处理歌单信息
const playlistInfo = ref<Playlist>(props.modelValue);
watch(() => props.modelValue, value => {
    playlistInfo.value = value;
});
const emit = defineEmits<{
    (event: "update:modelValue", value: Playlist): void
}>();
watch(() => playlistInfo.value, value => {
    emit("update:modelValue", value);
});

// 处理封面上传
const selectCoverFile = (cover: File | null): void => {
    if (cover) props.onSave(cover);
};
</script>

<template>
    <div class="container">
        <!--歌单封面-->
        <ImageChooser 
            class="cover"
            :imageSrc="playlistInfo.cover ?? DefaultCoverImage" 
            :editable="props.isOwner"
            :onSelected="selectCoverFile"
        />
        <div class="playlist-info">
            <!--歌单名称-->
            <CustomInput
                class="playlist-name"
                v-model="playlistInfo.name"
                :editable="props.isOwner"
                :placeHolder="'请输入歌单名'"
                :onBlur="props.onSave"
            />
            <!--其他信息-->
            <div class="playlist-create">
                <div class="cell">
                    <img class="avatar" :src="playlistInfo.createUser?.avatar ?? DefaultAvatarImage" />
                    {{ playlistInfo.createUser?.nickname }}
                </div>
                <div class="cell create-time content-with-icon">
                    {{ `${dateFormat(playlistInfo.createTime ?? '')}创建` }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    flex-direction: row;
    padding: 0.5em;
    gap: 1em;
}

.cover {
    height: 6em;
    aspect-ratio: 1;
    border-radius: 50%;
}

.playlist-info {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.25em;
}

.playlist-name {
    width: 100%;
    height: auto;
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
    gap: 2em;
}

.cell {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0;
}

.avatar {
    height: 1.4em;
    margin-right: 0.5em;
    aspect-ratio: 1;
    border-radius: 50%;
}

.create-time {
    background-image: url("@/assets/images/buttons/time.png"); 
}
</style>
