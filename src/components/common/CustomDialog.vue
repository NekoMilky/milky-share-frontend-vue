<script setup>
import { useDialog } from "/src/stores/Dialog";

const dialogStore = useDialog();
</script>

<template>
    <Teleport to="body">
        <div class="dialog" v-if="dialogStore.isOpened">
            <div class="dialog-box">
                <div class="dialog-content scrollbar-column">
                    <div
                        class="row"
                        v-for="row in dialogStore.rows"
                        :key="row.key"
                        :class="{ 'danger': row.danger }"
                    >
                        <template v-if="row.type === 'text'">{{ row.text }}</template>
                        <template v-if="row.type === 'input'">
                            <template v-if="row.input.type === 'text'">
                                <div class="input-label text-input-label">{{ row.input.label }}</div>
                                <input 
                                    v-model="dialogStore.values[row.key]" 
                                    type="text"
                                    class="input-frame" 
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
                                <div class="input-label checkbox-input-label">{{ row.input.label }}</div>
                            </template>
                        </template>
                    </div>
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
    font-size: 1.2rem;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.dialog-content {
    width: 95%;
    height: auto;
    flex: 1;
    overflow-y: auto;
    margin: 0.5em;
}

.row {
    width: 100%;
    height: 2em;
    margin: 0.25em 0;
    border-radius: 1.5em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.input-label {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.text-input-label {
    width: 20%;
    justify-content: flex-end;
}

.checkbox-input-label {
    width: 75%;
    justify-content: flex-start;
}

.checkbox-input {
    position: relative;
    height: 50%;
    aspect-ratio: 1;
    appearance: none;
    border: 1px groove white;
    outline: none;
    border-radius: 0.5em;
}

.checkbox-input::before, .checkbox-input::after {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 0.5em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.checkbox-input:hover::before {
    width: 100%;
    height: 100%;
    background-color: var(--hovered-background-color);
}

.checkbox-input::after {
    width: 75%;
    height: 75%;
}

.checkbox-input:checked::after {
    background-color: white;
}

.input-frame {
    width: 75%;
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

.danger {
    color: var(--danger-color);
}
</style>
