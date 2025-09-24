<script setup>
import { useDialog } from "/src/stores/Dialog";

const dialogStore = useDialog();
</script>

<template>
    <Teleport to="body">
        <div class="dialog" v-if="dialogStore.isOpened">
            <div class="dialog-box">
                <div
                    class="row"
                    v-for="row in dialogStore.rows"
                    :key="row.key"
                >
                    <template v-if="row.type === 'text'">{{ row.text }}</template>
                    <template v-if="row.type === 'input'">
                        <template v-if="row.input.type === 'text'">
                            <div class="text-input-label">{{ row.input.label }}</div>
                            <input 
                                v-model="dialogStore.values[row.key]" 
                                type="text"
                                class="text-input" 
                                :placeholder="row.input.placeholder"
                            />
                        </template>
                        <template v-else-if="row.input.type === 'checkbox'">
                            <input 
                                v-model="dialogStore.values[row.key]" 
                                type="checkbox"
                                class="checkbox-input" 
                                :placeholder="row.input.placeholder"
                            />
                            <div class="checkbox-input-label">{{ row.input.label }}</div>
                        </template>
                    </template>
                </div>
                <div class="row button" v-if="dialogStore.confirmAction" @click="dialogStore.submitDialog">
                    <img class="button-icon" src="/src/assets/images/buttons/confirm.png" />
                    确认
                </div>
                <div class="row button" @click="dialogStore.close">
                    <img class="button-icon" src="/src/assets/images/buttons/cancel.png" />
                    取消
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.dialog {
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: transparent;
    backdrop-filter: blur(1px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog-box {
    width: 30%;
    height: auto;
    max-height: 75%;
    overflow-x: hidden;
    overflow-y: auto;
    border-radius: 1.5em;
    padding: 0.5em;
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(3px);
    font-family: "Aa小迷糊少女";
    font-size: 1.2rem;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.row {
    width: 90%;
    height: 2em;
    margin: 0.25em;
    border-radius: 1.5em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.text-input-label {
    width: 20%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.text-input {
    width: 75%;
    height: 100%;
    padding: 0 1em;
    box-sizing: border-box;
    border: none;
    outline: none;
    border-radius: 1em;
    background-color: transparent;
    color: white;
    font-family: "Aa小迷糊少女";
    font-size: 1em;
    transition: var(--transition-duration);
}

.text-input:not(.text-input:focus):hover {
    background-color: var(--hovered-background-color);
}

.text-input:focus {
    background-color: var(--selected-background-color);
}

.text-input::placeholder {
    color: rgb(192, 192, 192);
}

.button {
    justify-content: center;
    background-color: transparent;
    transition: var(--transition-duration);
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.button-icon {
    height: 60%;
    aspect-ratio: 1;
    margin-right: 0.5em;
}
</style>
