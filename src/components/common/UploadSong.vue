<script setup lang="ts">
import type { Song } from "@/types"

import { ref, computed } from "vue";
import { parseBlob } from "music-metadata";

import { compressImage, toURI, timeFormat, isSuccessWithToast, checkEmptyFields } from "@/utils";

import { useSong } from "@/stores";

import CustomInput from "@/components/common/CustomInput.vue";

import DefaultCoverImage from "@/assets/images/default/cover.png";

const fileInput = ref<HTMLInputElement | null>(null);

const songStore = useSong();

// 处理文件选择
const selectedFile = ref<File | null>(null);
const selectFiles = (files: FileList | null | undefined): void => {
    if (!files) {
        isSuccessWithToast({ message: "请选择文件", success: false });
        return;
    }
    const audioFiles = Array.from(files).filter(file => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) {
        isSuccessWithToast({ message: "请选择音频文件", success: false });
        return;
    }
    selectedFile.value = audioFiles[0] ?? null;
    updateSongInfo();
};
const checkInputEvent = (event: InputEvent): void => {
    selectFiles((event.target as HTMLInputElement).files);
};
const onDrop = (event: DragEvent): void => {
    selectFiles(event.dataTransfer?.files);
};
const clearSelectedFile = (): void => {
    selectedFile.value = null;
    isUploading.value = false;
};

// 显示信息
const emptySongInfo = (): Song => ({
    id: "",
    title: "",
    artist: "",
    album: "",
    duration: 0,
    cover: null
});
const songInfo = ref<Song>(emptySongInfo());
const durationDisplay = computed<string>(() => {
    return timeFormat(songInfo.value.duration);
});
const updateSongInfo = async (): Promise<void> => {
    if (!selectedFile.value) {
        isSuccessWithToast({ message: "没有上传音频文件", success: false });
        return;
    }
    songInfo.value = emptySongInfo();

    // 解析基础信息
    try {
        const metadata = await parseBlob(selectedFile.value, { duration: true });
        const { title, artist, album, picture } = metadata.common;
        const duration = metadata.format.duration;
        songInfo.value = {
            id: "",
            title: title ?? "",
            artist: artist ?? "",
            album: album ?? "",
            duration: duration ?? 0,
            cover: picture?.[0] ? await compressImage(picture[0]) : null,
            coverDisplay: picture?.[0] ? toURI(picture[0]) : null
        };
    }
    catch (error) {
        isSuccessWithToast({ message: "解析音频元数据时出错", success: false });
    }
};

// 处理文件上传
const isUploading = ref<boolean>(false);
const uploadFile = async (): Promise<void> => {
    if (!selectedFile.value) {
        isSuccessWithToast({ message: "没有上传音频文件", success: false });
        return;
    }
    const { title, artist, album } = songInfo.value;
    if (!checkEmptyFields({ title, artist, album }, { title: "标题", artist: "艺术家", album: "专辑" })) return;

    // 开始上传
    isUploading.value = true;
    await songStore.uploadSong(selectedFile.value, songInfo.value);

    // 上传结束
    clearSelectedFile();
};
</script>

<template>
    <div class="container">
        <div 
            v-if="!selectedFile" 
            class="upload-area" 
            @drop.prevent="onDrop" 
            @dragover.prevent="" 
            @click="fileInput?.click()"
        >
            <input 
                type="file" 
                ref="fileInput" 
                accept="audio/*" 
                style="display: none;"
                @change="checkInputEvent($event as InputEvent)" 
            />
            点击选择音频文件，或拖拽文件到这里
        </div>
        <div v-else-if="!isUploading" class="song-selected">
            <div class="song-info">
                <img class="song-cover" :src="songInfo.coverDisplay || DefaultCoverImage" />
                <div class="info-items">
                    <div class="info">
                        <div class="info-text">标题</div>
                        <CustomInput 
                            class="info-input"
                            v-model="songInfo.title"
                            :placeHolder="'请输入标题'"
                        />
                    </div>
                    <div class="info">
                        <div class="info-text">艺术家</div>
                        <CustomInput 
                            class="info-input"
                            v-model="songInfo.artist"
                            :placeHolder="'请输入艺术家'"
                        />
                    </div>
                    <div class="info">
                        <div class="info-text">专辑</div>
                        <CustomInput 
                            class="info-input"
                            v-model="songInfo.album"
                            :placeHolder="'请输入专辑'"
                        />
                    </div>
                    <div class="info">
                        <div class="info-text">时长</div>
                        <CustomInput 
                            class="info-input"
                            v-model="durationDisplay"
                            :editable="false"
                        />
                    </div>
                </div>
            </div>
            <div class="button-list">
                <img class="button" src="@/assets/images/icon/return.png" @click="clearSelectedFile()" />
                <img class="button" src="@/assets/images/icon/upload.png" @click="uploadFile()" />
            </div>
        </div>
        <div v-else class="song-uploading">文件上传中，请稍候</div>
    </div>
</template>

<style scoped>
.upload-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.upload-area:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.song-selected {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.song-uploading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.song-info {
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.song-cover {
    width: 15%;
    aspect-ratio: 1;
    border-radius: 50%;
}

.info-items {
    width: 65%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
}

.info {
    width: 100%;
    height: 2em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    gap: 0.5em;
}

.info-text {
    width: 15%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.info-input {
    flex: 1;
    min-width: 0;
    height: auto;
}

.button-list {
    width: 50%;
    height: 15%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.button {
    height: 1.2em;
    aspect-ratio: 1;
    padding: 0.5em;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}
</style>
