<script setup lang="ts">
import { useSong } from "@/stores";

import CustomBackground from "@/components/common/CustomBackground.vue";
import SongList from "@/components/common/SongList.vue";
import UploadSong from "@/components/common/UploadSong.vue";

import BackgroundImage from "@/assets/images/background.png";

const songStore = useSong();
</script>

<template>
    <div class="page">
        <CustomBackground :backgroundSrc="BackgroundImage" />
        <div class="subpage">
            <div class="section secondary-color">
                <div class="label-text">发现歌曲</div>
                <SongList 
                    style="height: 75dvh;"
                    :list="songStore.songList" 
                />
            </div>
            <div class="section secondary-color">
                <div class="label-text">上传歌曲</div>
                <UploadSong style="height: 50dvh;" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.page::before {
    content: "";
    height: 10dvh;
}

.page::after {
    content: "";
    height: 10dvh;
}

.section {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5em;
    gap: 0.5em;
    box-sizing: border-box;
    border-radius: 0.5em;
}

.label-text {
    font-size: 1.4em;
    font-weight: bold;
}
</style>
