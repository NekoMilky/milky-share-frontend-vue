<script setup lang="ts">
import { ref, watch } from "vue";

import InvisibleImage from "@/assets/images/buttons/invisible.png";
import VisibleImage from "@/assets/images/buttons/visible.png";

const props = withDefaults(defineProps<{
    modelValue: string,
    editable?: boolean,
    isPassword?: boolean,
    iconSrc?: string,
    placeHolder?: string,
    onBlur?: () => void | Promise<void>
}>(), {
    editable: true,
    isPassword: false,
    placeHolder: "",
    onBlur: () => {}
});

// 处理输入
const inputValue = ref<string>(props.modelValue);
watch(() => props.modelValue, value => {
    inputValue.value = value;
});
const emit = defineEmits<{
    (event: "update:modelValue", value: string): void
}>();
const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    inputValue.value = value;
    emit("update:modelValue", value);
};

// 密码可见性
const isPasswordVisible = ref<boolean>(false);
const togglePasswordVisibility = (): void => {
    isPasswordVisible.value = !isPasswordVisible.value;
};
</script>

<template>
    <div class="input-container">
        <input 
            class="input-frame"
            :type="props.isPassword && !isPasswordVisible ? 'password' : 'text'"
            :class="{ 'content-with-icon': props.iconSrc }"
            :style="{ backgroundImage: props.iconSrc ? `url(${props.iconSrc})` : 'none' }"
            :disabled="!props.editable"
            :value="inputValue"
            @input="handleInput($event)"
            @blur="props.onBlur()"
            :placeholder="props.placeHolder"
        />
        <img 
            class="switch-visibility"
            v-show="props.isPassword"
            :src="isPasswordVisible ? VisibleImage : InvisibleImage"
            @click="togglePasswordVisibility()"
        >
    </div>
</template>

<style scoped>
.input-container {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.25em;
}

.input-frame {
    flex: 1;
    min-width: 0;
    height: auto;
    padding: 0.5em 1em;
    box-sizing: border-box;
    border: none;
    outline: none;
    border-radius: 1em;
    background-color: transparent;
    color: white;
    font-family: "Aa小迷糊少女";
    font-size: 1em;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.input-frame:not(.input-frame:focus):not(.input-frame:disabled):hover {
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.input-frame:focus {
    background-color: var(--selected-background-color);
    transform: translateZ(0);
}

.input-frame::placeholder {
    color: rgb(192, 192, 192);
}

.content-with-icon {
    padding-left: 2em;
}

.switch-visibility {
    height: 1.2em;
    aspect-ratio: 1;
    padding: 0.5em;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.switch-visibility:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}
</style>
