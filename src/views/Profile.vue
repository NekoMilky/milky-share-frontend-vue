<script setup>
import { useUser } from "/src/stores/User";
import MusicPlayer from "/src/components/MusicPlayer.vue";
import UserProfile from "/src/components/UserProfile.vue";
import UserLogin from "/src/components/UserLogin.vue";

const userStore = useUser();
</script>

<template>
    <div class="page">
        <MusicPlayer />
        <UserProfile v-if="userStore.isLogged" />
        <UserLogin v-else />
    </div>
</template>

<style scoped>
</style>
