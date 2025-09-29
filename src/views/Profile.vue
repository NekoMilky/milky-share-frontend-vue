<script setup lang="ts">
import { useUser } from "@/stores/user";
import MusicPlayer from "@/components/common/MusicPlayer.vue";
import Profile from "@/components/page/profile/Profile.vue";
import Login from "@/components/page/profile/Login.vue";

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
