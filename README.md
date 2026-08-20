# OpenChat

一个供小团队试用的“数字分身 + Codex + A2A”聊天界面。第一版不依赖飞书：成员在浏览器里聊天、在群里 `@` 分身或 Codex，并可切到内嵌终端查看本机执行过程。

## 立即试用

需要 Node.js 20+。

```bash
cd app
npm install
npm start
```

打开 <http://127.0.0.1:4319>。另开一个终端生成 POP、若超、浩楠的演示身份和 `A2A 试验室` 群：

```bash
cd app
npm run sim:twins
```

同一 Tailscale 网络的其他电脑，可通过运行 OpenChat 的电脑地址访问。第一阶段仅用于可信内网；当前还是一个团队监护人、多 Agent 的试用模型，不等同于完整的多人账号系统。

## 项目来源

本项目的应用底座来自 [Beacon](https://github.com/ZiAn-Su/beacon)，保留在 `app/` 目录中并继续遵守其 MIT License。OpenChat 自己的新增内容按仓库根目录的 Apache-2.0 License 发布。详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
