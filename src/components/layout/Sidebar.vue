<script setup lang="ts">
import type { Page } from "@/types";

import { computed } from "vue";
import { useRoute } from "vue-router";

import { usePage } from "@/stores";

const route = useRoute();
const pageStore = usePage();

const tags = computed<Array<Page>>(() => 
    pageStore.pages.filter(page => page.showInSidebar && pageStore.hasPermissionOfPage(page))
);
</script>

<template>
    <div class="container">
        <RouterLink 
            v-for="tag in tags"
            :key="tag.name"
            :to="tag.pathWithParameter" 
            class="row" 
            :class="{ 'row-selected': route.path === tag.pathWithParameter }"
        >
            <img class="button" :class="{ 'circle': tag.isIconCircle }" :src="tag.iconSrc" />
            <span>{{ tag.label }}</span>
        </RouterLink>
    </div>
</template>

<style scoped>
.container {
    padding: 0.5em;
    justify-content: center;
    border-radius: 0;
    gap: 0.5em;
    backdrop-filter: blur(3px);
    transition: var(--transition-duration);
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

.circle {
    border-radius: 50%;
}

.row {
    width: 100%;
    height: 2.4em;
    padding: 0.5em;
    box-sizing: border-box;
    border-radius: 1.5em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    text-decoration: none;
    color: white;
}

.row:not(.row-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.row-selected {
    background-color: var(--selected-background-color);
    transform: translateZ(0);
}
</style>
