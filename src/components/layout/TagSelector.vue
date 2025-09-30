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
        <div class="row-list">
            <RouterLink 
                v-for="tag in props.tags"
                :to="tag.path" 
                class="row" 
                :class="{ 'row-selected': route.path === tag.path }"
            >
                <img class="button" :class="{ 'avatar': tag.isIconCircle }" :src="tag.iconSrc" />
                <span>{{ tag.label }}</span>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: auto;
    height: 100%;
    margin: 0;
    border-radius: 0;
    flex-direction: column;
    transition: var(--transition-duration);
}

.row-list {
    width: auto;
    height: auto;
    display: inline-block;
}

.button {
    margin-left: 0.5em;
    margin-right: 0.5em;
    height: 100%;
    aspect-ratio: 1;
    transition: var(--transition-duration);
}

span {
    opacity: 0;
    font-size: 0;
    transition: var(--transition-duration);
}

.container:hover span {
    opacity: 1;
    font-size: 1em;
    margin-right: 0.5em;
}

.avatar {
    border-radius: 50%;
}

.row {
    width: 100%;
    height: 2.4em;
    margin: 0.25em 0;
    padding: 0.5em;
    box-sizing: border-box;
    border-radius: 1.5em;
    background-color: transparent;
    transition: var(--transition-duration);
    color: white;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    text-decoration: none;
}

.row:not(.row-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.row-selected {
    background-color: var(--selected-background-color);
}
</style>
