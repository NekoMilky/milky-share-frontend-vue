<script setup>
import { useUser } from "/src/stores/User";
import MusicPlayer from "/src/components/common/MusicPlayer.vue";
import Profile from "/src/components/page/profile/Profile.vue";
import Login from "/src/components/page/profile/Login.vue";

const userStore = useUser();
</script>

<template>
    <div class="page">
        <MusicPlayer />
        <Profile v-if="userStore.isLogged" />
        <Login v-else />
    </div>
</template>

<style scoped>
</style>
