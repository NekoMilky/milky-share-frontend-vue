<script setup>
import { computed, ref } from "vue";
import { useUser } from "/src/stores/User";

const userStore = useUser();

// 标签选择
const tag = ref("login");
const selectTag = (value) => {
    if (isTag(value)) {
        return;
    }
    tag.value = value;
    clearInput();
}
const isTag = (value) => {
    return tag.value === value;
}

// 接收输入
const nickname = ref("");
const password = ref("");
const confirmPassword = ref("");
const clearInput = () => {
    nickname.value = "";
    password.value = "";
    confirmPassword.value = "";
    response.value = {};
}

// 密码强度
const hasSuitableLen = computed(() => {
    return password.value.length >= 8 && password.value.length <= 24;
});
const hasNumber = computed(() => {
    return /\d/.test(password.value);
});
const hasLetter = computed(() => {
    return /[a-zA-Z]/.test(password.value);
});
const hasSpecialChar = computed(() => {
    return /[!@#$%^&*(),.?":{}|<>]/.test(password.value);
});

// 问题实时反馈
const issue = computed(() => {
    if (nickname.value === "" || password.value === "") {
        return "昵称或密码不可为空";
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
const response = ref({});
const login = async () => {
    response.value = {};
    if (issue.value) {
        return;
    }
    response.value = await userStore.login(nickname.value, password.value);
}
const register = async () => {
    response.value = {};
    if (issue.value) {
        return;
    }
    response.value = await userStore.register(nickname.value, password.value);
}
</script>

<template>
    <div class="box login-box">
        <div class="input-area">
            <input 
                v-model="nickname"
                class="info-input nick-input" 
                type="text" 
                placeholder="昵称" 
            />
            <input 
                v-model="password"
                class="info-input password-input" 
                type="password" 
                placeholder="密码" 
            />
            <input 
                v-model="confirmPassword"
                v-if="isTag('register')" 
                class="info-input confirm-input" 
                type="password" 
                placeholder="确认密码" 
            />
            <div class="issue" v-if="issue">{{ issue }}</div>
            <div class="issue" v-if="response.message">{{ response.message }}</div>
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
.login-box {
    height: 50%;
    flex-direction: column;
}

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

.info-input {
    color: white;
    font-family: "Aa小迷糊少女";
    font-size: 1em;
    width: 50%;
    margin: 0.2em;
    padding: 0.5em 0.5em 0.5em 2em;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 1em;
    border: none;
    outline: none;
    background-size: 1em;
    background-position: 0.6em center;
    background-repeat: no-repeat;
    transition: var(--transition-duration);
}

.info-input:focus, .info-input:hover {
    background-color: var(--hovered-background-color);
}

.info-input::placeholder {
    color: rgb(192, 192, 192);
}

.nick-input {
    background-image: url("/src/assets/images/buttons/user.png");
}

.password-input {
    background-image: url("/src/assets/images/buttons/password.png");
}

.confirm-input {
    background-image: url("/src/assets/images/buttons/confirm.png");
}

.issue {
    color: var(--error-color);
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
    background-color: rgba(255, 255, 255, 0.2);
}
</style>
