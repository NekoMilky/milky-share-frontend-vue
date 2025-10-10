<script setup lang="ts">
import { computed } from "vue";

import { isSuccessWithToast, debouncedRef } from "@/utils";

import { useUser } from "@/stores";

import CustomInput from "@/components/common/CustomInput.vue";

import UserImage from "@/assets/images/icon/user.png";
import PasswordImage from "@/assets/images/icon/password.png";

const userStore = useUser();

// 接收输入
const nickname = debouncedRef<string>("");
const password = debouncedRef<string>("");

// 问题实时反馈
const issue = computed<string | null>(() => {
    if (!nickname.value) return "昵称不可为空";
    if (!password.value) return "密码不可为空";
    return null;
});

// 登录
const login = (): void => {
    if (issue.value) {
        isSuccessWithToast({ message: issue.value, success: false });
        return;
    }
    userStore.userLogin(nickname.value, password.value);
}
</script>

<template>
    <div class="container">
        <div class="welcome">回到MilkyShare</div>
        <CustomInput
            class="input"
            v-model="nickname"
            :iconSrc="UserImage"
            :placeHolder="'昵称'" 
        />
        <CustomInput
            class="input"
            v-model="password"
            :isPassword="true"
            :iconSrc="PasswordImage"
            :placeHolder="'密码'" 
        />
        <div class="button" @click="login">登录</div>
        <div class="danger" v-show="issue">{{ issue }}</div>
    </div>
</template>

<style scoped>
</style>
