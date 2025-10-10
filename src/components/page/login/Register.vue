<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { checkNickname } from "@/api/user";
import { isSuccessWithToast, debouncedRef } from "@/utils";

import { useUser } from "@/stores";

import CustomInput from "@/components/common/CustomInput.vue";

import UserImage from "@/assets/images/buttons/user.png";
import PasswordImage from "@/assets/images/buttons/password.png";
import ConfirmImage from "@/assets/images/buttons/confirm.png";

const userStore = useUser();

// 接收输入
const nickname = debouncedRef<string>("");
const password = debouncedRef<string>("");
const confirmPassword = debouncedRef<string>("");

// 密码强度
const hasSuitableLen = computed<boolean>(() => password.value.length >= 8 && password.value.length <= 24);
const hasNumber = computed<boolean>(() => /\d/.test(password.value));
const hasLetter = computed<boolean>(() => /[a-zA-Z]/.test(password.value));
const hasSpecialChar = computed<boolean>(() => /[!@#$%^&*(),.?":{}|<>]/.test(password.value));

// 问题实时反馈
const isNicknameUsable = ref<boolean>(true);
watch(() => nickname.value, async value => {
    if (value) {
        const response = await checkNickname(value);
        isNicknameUsable.value = response.data?.usable as boolean;
    }
});
const issue = computed<string | null>(() => {
    if (!nickname.value) return "昵称不可为空";
    if (!isNicknameUsable.value) return "昵称不可用";
    if (!password.value) return "密码不可为空";
    if (!hasSuitableLen.value) return "密码长度应介于8~24位之间";
    if (!hasNumber.value) return "密码应包含数字";
    if (!hasLetter.value) return "密码应包含字母";
    if (!hasSpecialChar.value) return "密码应包含特殊字符";
    if (confirmPassword.value !== password.value) return "两次输入的密码不一致";
    return null;
});

// 注册
const register = (): void => {
    if (issue.value) {
        isSuccessWithToast({ message: issue.value, success: false });
        return;
    }
    userStore.userRegister(nickname.value, password.value);
}
</script>

<template>
    <div class="container">
        <div class="welcome">成为MilkyShare的一员</div>
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
        <CustomInput
            class="input"
            v-model="confirmPassword"
            :isPassword="true"
            :iconSrc="ConfirmImage"
            :placeHolder="'确认密码'" 
        />
        <div class="button" @click="register">注册</div>
        <div class="danger" v-show="issue">{{ issue }}</div>
    </div>
</template>

<style scoped>
</style>
