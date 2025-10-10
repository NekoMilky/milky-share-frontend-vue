<script setup lang="ts">
import { useCustomDialog } from "@/stores";

import CustomInput from "@/components/common/CustomInput.vue";

const customDialogStore = useCustomDialog();
</script>

<template>
    <div class="dialog" v-show="customDialogStore.isOpened">
        <div class="dialog-box">
            <div class="dialog-content scrollbar-column">
                <div
                    class="row"
                    v-for="row in customDialogStore.rows"
                    :key="row.key"
                    :class="{ 'danger': row.isDanger }"
                >
                    <template v-if="row.type === 'text'">{{ row.text }}</template>
                    <template v-if="row.type === 'input'">
                        <template v-if="row.input?.type === 'text'">
                            <div class="input-label text-input-label">{{ row.input.label }}</div>
                            <CustomInput 
                                class="text-input" 
                                v-model="(customDialogStore.values[row.key] as string)" 
                                :placeHolder="row.input.placeholder"
                            />
                        </template>
                        <template v-else-if="row.input?.type === 'checkbox'">
                            <input 
                                v-model="customDialogStore.values[row.key]" 
                                type="checkbox"
                                class="checkbox-input"
                            />
                            <div class="input-label checkbox-input-label">{{ row.input.label }}</div>
                        </template>
                    </template>
                </div>
            </div>
            <div class="row button" v-show="customDialogStore.confirmAction" @click="customDialogStore.submitDialog">
                <img class="button-icon" src="@/assets/images/icon/confirm.png" />确认
            </div>
            <div class="row button" @click="customDialogStore.close">
                <img class="button-icon" src="@/assets/images/icon/cancel.png" />取消
            </div>
        </div>
    </div>
</template>

<style scoped>
.dialog {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100dvh;
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(1px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-box {
    width: 30%;
    max-height: 75%;
    border-radius: 1.5em;
    padding: 0.5em;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    font-family: "Aa小迷糊少女";
    color: white;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}

.dialog-content {
    width: 100%;
    height: auto;
    padding: 0.5em;
    box-sizing: border-box;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}

.row {
    width: 100%;
    height: 2em;
    border-radius: 1.5em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
}

.input-label {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.text-input-label {
    width: 20%;
    justify-content: flex-end;
}

.checkbox-input-label {
    flex: 1;
    min-width: 0;
    max-width: 75%;
    justify-content: flex-start;
}

.checkbox-input {
    position: relative;
    height: 50%;
    aspect-ratio: 1;
    appearance: none;
    border: 1px groove white;
    outline: none;
}

.checkbox-input::before, .checkbox-input::after {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.checkbox-input:hover::before {
    width: 100%;
    height: 100%;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.checkbox-input::after {
    width: 75%;
    height: 75%;
}

.checkbox-input:checked::after {
    background-color: white;
}

.text-input {
    flex: 1;
    min-width: 0;
    height: auto;
}

.button {
    justify-content: center;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.button-icon {
    height: 60%;
    aspect-ratio: 1;
}

.danger {
    color: var(--danger-color);
}
</style>
