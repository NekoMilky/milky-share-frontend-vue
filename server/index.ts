import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT ?? "8080");
const HOST = process.env.HOST ?? "0.0.0.0";

// 设置静态文件目录为dist
app.use(express.static(path.join(DIRNAME, "../dist")));

// 处理单页应用路由问题
app.use((request, response) => {
    response.sendFile(path.join(DIRNAME, "../dist/index.html"));
});

app.listen(PORT, HOST, () => {
    console.log(`服务启动于：${HOST}:${PORT}\n`);
});
