<script setup lang="ts">
import { ref } from "vue";

import { isSuccessWithToast, compressImage } from "@/utils";

const props = withDefaults(defineProps<{
    imageSrc: string,
    editable: boolean,
    onSelected: (image: File | null) => void
}>(), {
    imageSrc: "",
    editable: false,
    onSelected: () => {}
});

// 处理图像选择
const imageInput = ref<HTMLInputElement | null>(null);
const selectFiles = async (files: FileList | null | undefined): Promise<void> => {
    if (!files) {
        isSuccessWithToast({ message: "请选择文件", success: false });
        return;
    }
    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
        isSuccessWithToast({ message: "请选择图像文件", success: false });
        return;
    }
    const image = imageFiles[0];
    if (image) props.onSelected(await compressImage(image));
};
const checkInputEvent = (event: InputEvent): void => {
    selectFiles((event.target as HTMLInputElement).files);
};
</script>

<template>
    <div 
        class="image-container" 
        :class="{ 'image-editable': props.editable }" 
        @click="props.editable && imageInput?.click()"
    >
        <img 
            class="image" 
            :src="props.imageSrc" 
        />
        <input 
            type="file" 
            ref="imageInput" 
            accept="image/*" 
            style="display: none;"
            @change="checkInputEvent($event as InputEvent)" 
        />
    </div>
</template>

<style scoped>
.image-container {
    position: relative;
    aspect-ratio: 1;
    border-radius: 50%;
}

.image {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    display: block;
}

.image-editable::after {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    cursor: pointer;
    content: "";
    border-radius: 50%; 
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.image-editable:hover::after {
    background-color: rgba(64, 64, 64, 0.5);
    transform: translateZ(0);
}
</style>
