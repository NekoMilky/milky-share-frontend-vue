<script setup lang="ts">
import type { PageTag } from "@/types";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
    tags: {
        type: Array<PageTag>,
        default: []
    }
});
</script>

<template>
    <div class="container">
        <RouterLink 
            v-for="tag in props.tags"
            :to="tag.path" 
            class="row" 
            :class="{ 'row-selected': route.path === tag.path }"
        >
            <img class="button" :class="{ 'avatar': tag.isAvatar }" :src="tag.iconSrc" />
            <span>{{ tag.label }}</span>
        </RouterLink>
    </div>
</template>

<style scoped>
.container {
    width: 25%;
    height: auto;
    transition: var(--transition-duration);
}

.container:hover {
    width: 50%;
}

.container .button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); 
    height: 60%;
    aspect-ratio: 1;
    transition: var(--transition-duration);
}

.container:hover .button {
    left: 15%;
    transform: translate(0, -50%);
}

.container span {
    position: absolute;
    top: 50%;
    right: 15%;
    transform: translate(0, -50%);
    opacity: 0;
    font-size: 0.1em;
    transition: var(--transition-duration);
}

.container:hover span {
    opacity: 1;
    font-size: 1em;
}

.avatar {
    border-radius: 50%;
}

.row {
    position: relative;
    width: 100%;
    height: 2em;
    margin: 0.25em;
    border-radius: 1.5em;
    background-color: transparent;
    transition: var(--transition-duration);
    color: white;
}

.row:not(.row-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.row-selected {
    background-color: var(--selected-background-color);
}
</style>
