<script setup lang="ts">
import type { User } from "@/types";

import { ref, watch } from "vue";

import { dateFormat } from "@/utils";

import CustomInput from "@/components/common/CustomInput.vue";
import ImageChooser from "@/components/common/ImageChooser.vue";

import DefaultAvatarImage from "@/assets/images/default/avatar.png";

const props = withDefaults(defineProps<{
    modelValue: User,
    isOwner: boolean,
    onSave: (avatar?: File) => void
}>(), {
    isOwner: false,
    onSave: () => {}
});

// 处理用户信息
const userInfo = ref<User>(props.modelValue);
watch(() => props.modelValue, value => {
    userInfo.value = value;
});
const emit = defineEmits<{
    (event: "update:modelValue", value: User): void
}>();
watch(() => userInfo.value, value => {
    emit("update:modelValue", value);
});

// 处理头像上传
const selectAvatarFile = (avatar: File | null): void => {
    if (avatar) props.onSave(avatar);
};
</script>

<template>
    <div class="user-base-info">
        <ImageChooser 
            class="avatar"
            :imageSrc="userInfo.avatar ?? DefaultAvatarImage" 
            :editable="props.isOwner"
            :onSelected="selectAvatarFile"
        />
        <div class="column-info">
            <CustomInput 
                class="nickname" 
                v-model="userInfo.nickname"
                :editable="props.isOwner"
                :placeHolder="'请输入昵称'"
                :onBlur="props.onSave"
            />
            <div class="join-time content-with-icon">{{ `${dateFormat(userInfo.joinTime ?? '')}加入` }}</div>
        </div>
    </div>
</template>

<style scoped>
.user-base-info {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: last baseline;
    gap: 1em;
}

.avatar {
    max-width: 50%;
    max-height: 20dvh;
}

.column-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}

.nickname {
    width: 100%;
    height: auto;
    font-size: 1.2em;
    font-weight: bold;
}

.join-time {
    width: 100%;
    height: auto;
    background-image: url("@/assets/images/buttons/time.png");
}
</style>
