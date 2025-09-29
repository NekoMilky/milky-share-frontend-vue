<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { checkNickname } from "@/api/user";
import { useUser } from "@/stores/user";
import { isSuccessWithToast, debouncedRef } from "@/utils";

const userStore = useUser();

// 标签选择
const tag = ref<string>("login");
const selectTag = (value: string): void => {
    if (isTag(value)) {
        return;
    }
    tag.value = value;
    clearInput();
}
const isTag = (value: string): boolean => {
    return tag.value === value;
}

// 接收输入
const nickname = debouncedRef<string>("");
const password = debouncedRef<string>("");
const confirmPassword = debouncedRef<string>("");
const clearInput = (): void => {
    nickname.value = "";
    password.value = "";
    confirmPassword.value = "";
}

// 密码强度
const hasSuitableLen = computed<boolean>(() => {
    return password.value.length >= 8 && password.value.length <= 24;
});
const hasNumber = computed<boolean>(() => {
    return /\d/.test(password.value);
});
const hasLetter = computed<boolean>(() => {
    return /[a-zA-Z]/.test(password.value);
});
const hasSpecialChar = computed<boolean>(() => {
    return /[!@#$%^&*(),.?":{}|<>]/.test(password.value);
});

// 问题实时反馈
const isNicknameUsable = ref<boolean>(true);
watch(() => nickname.value, async (value) => {
    if (isTag("register") && value) {
        const response = await checkNickname(value);
        isNicknameUsable.value = response.data?.usable as boolean;
    }
});
const issue = computed<string | null>(() => {
    if (!nickname.value) {
        return "昵称不可为空";
    }
    if (isTag("register") && !isNicknameUsable.value) {
        return "昵称不可用";
    }
    if (!password.value) {
        return "密码不可为空";
    }
    if (isTag("register")) {
        if (!hasSuitableLen.value) {
            return "密码长度应介于8~24位之间";
        }
        if (!hasNumber.value) {
            return "密码应包含数字";
        }
        if (!hasLetter.value) {
            return "密码应包含字母";
        }
        if (!hasSpecialChar.value) {
            return "密码应包含特殊字符";
        } 
        if (confirmPassword.value !== password.value) {
            return "两次输入的密码不一致";
        }
    }
    return null;
});

// 注册与登录
const checkIssue = (): boolean => {
    if (issue.value) {
        isSuccessWithToast({ message: issue.value, success: false });
    }
    return !issue.value;
};
const login = (): void => {
    if (!checkIssue()) {
        return;
    }
    userStore.userLogin(nickname.value, password.value);
}
const register = (): void => {
    if (!checkIssue()) {
        return;
    }
    userStore.userRegister(nickname.value, password.value);
}
</script>

<template>
    <div class="container">
        <div class="input-area">
            <input 
                v-model="nickname"
                class="input-frame with-icon nick-input" 
                type="text" 
                placeholder="昵称" 
            />
            <input 
                v-model="password"
                class="input-frame with-icon password-input" 
                type="password" 
                placeholder="密码" 
            />
            <input 
                v-model="confirmPassword"
                v-if="isTag('register')" 
                class="input-frame with-icon confirm-input" 
                type="password" 
                placeholder="确认密码" 
            />
            <div class="danger" v-if="issue">{{ issue }}</div>
            <div v-if="isTag('login')" class="button" @click="login">登录</div>
            <div v-if="isTag('register')" class="button" @click="register">注册</div>
        </div>
        <div class="tag-list">
            <div 
                class="tag" 
                :class="{ 'tag-selected': isTag('login') }"
                @click="selectTag('login')"
            >登录</div>
            <div 
                class="tag" 
                :class="{ 'tag-selected': isTag('register') }"
                @click="selectTag('register')"
            >注册</div>
        </div>
    </div>
</template>

<style scoped>
.input-area {
    width: 100%;
    height: 75%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.tag-list {
    width: 50%;
    height: 15%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.button {
    width: 50%;
    margin: 0.2em;
    padding: 0.5em;
    box-sizing: border-box;
    border-radius: 1em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    transition: var(--transition-duration);
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.input-frame {
    width: 50%;
    margin: 0.2em;
}

.nick-input {
    background-image: url("@/assets/images/buttons/user.png");
}

.password-input {
    background-image: url("@/assets/images/buttons/password.png");
}

.confirm-input {
    background-image: url("@/assets/images/buttons/confirm.png");
}

.danger {
    color: var(--danger-color);
    font-size: 0.8em;
}

.tag {
    padding: 0.5em;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 1em;
    transition: var(--transition-duration);
}

.tag:not(.tag-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.tag-selected {
    background-color: var(--selected-background-color);
}
</style>
