import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// 设置静态文件目录为dist
app.use(express.static(path.join(__dirname, '../dist')));

// 处理单页应用路由问题
app.use((request, response) => {
    response.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`服务启动于：${HOST}:${PORT}\n`);
});
