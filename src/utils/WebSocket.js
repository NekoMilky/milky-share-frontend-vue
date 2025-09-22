const config = await fetch("/config.json").then(response => response.json());
const WEBSOCKET_URL = config.WEBSOCKET_URL;

export const ws = new WebSocket(WEBSOCKET_URL);

// 错误处理
ws.onerror = (error) => {
    console.error("WebSocket错误：", error);
};
