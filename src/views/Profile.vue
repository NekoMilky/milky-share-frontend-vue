<script setup>
import { useUser } from "/src/stores/User";
import MusicPlayer from "/src/components/common/MusicPlayer.vue";
import Profile from "/src/components/page/profile/Profile.vue";
import Login from "/src/components/page/profile/Login.vue";

const userStore = useUser();
</script>

<template>
    <div class="page">
        <MusicPlayer class="box" style="height: 20%;" />
        <Profile v-if="userStore.isLogged" class="box" style="height: 50%;" />
        <Login v-else class="box" style="height: 50%;" />
    </div>
</template>

<style scoped>
</style>
