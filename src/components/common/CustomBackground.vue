<script setup lang="ts">
const props = withDefaults(defineProps<{
    height?: number,
    backgroundSrc?: string,
}>(), {
    height: 100,
    backgroundSrc: "",
});
</script>

<template>
    <Teleport to="body">
        <div class="background-container" :style="{ height: `${props.height}dvh` }">
            <img class="background-image" :src="props.backgroundSrc" />
        </div>
    </Teleport>
</template>

<style scoped>
.background-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100dvh;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 0;
}

.background-image {
    width: 100%;
    height: 100%;
}
</style>
