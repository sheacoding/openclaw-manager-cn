# 🦞 OpenClaw Manager 中国版

> 专为中国用户优化的 AI 助手管理工具 —— 国产大模型开箱即用，飞书一键配置，告别命令行。

基于 [OpenClaw Manager](https://github.com/miaoxworld/openclaw-manager) 深度定制，**Tauri 2.0 + React 18 + Rust** 驱动。

![Platform](https://img.shields.io/badge/平台-macOS%20|%20Windows%20|%20Linux-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.0-orange)
![Version](https://img.shields.io/badge/版本-0.0.7-green)

## 中国版有什么不同？

| 特性 | 上游版本 | 中国版 |
|------|---------|--------|
| AI 服务商 | Anthropic、OpenAI 为主 | **深度集成国产大模型**：DeepSeek、通义千问、Kimi、智谱 GLM、MiniMax |
| 飞书 | 基础配置 | **一键配置**：自动设置 dmPolicy、allowFrom、安装官方插件 |
| API 地址 | 海外默认 | **国内 API 端点**：MiniMax 等默认使用国内地址 |
| 服务商 Logo | Emoji 图标 | **官方品牌 Logo**（SVG 矢量图标） |
| 模型列表 | 可能过时 | **实时更新**：GPT-5.4、Claude 4.6、Kimi K2.5、Qwen 3.5、DeepSeek V3.2 |
| 界面语言 | 中英混合 | **全中文 UI** |

## 界面预览

### 仪表盘

实时监控服务状态，一键管理 AI 助手。

![仪表盘](pic/dashboard.png)

### AI 服务商配置

14+ AI 服务商，官方 Logo，最新模型预设。

![AI 配置](pic/ai.png)

### 消息渠道

<table>
  <tr>
    <td width="50%">
      <img src="pic/telegram.png" alt="Telegram 配置">
      <p align="center"><b>Telegram Bot</b></p>
    </td>
    <td width="50%">
      <img src="pic/feishu.png" alt="飞书配置">
      <p align="center"><b>飞书机器人</b></p>
    </td>
  </tr>
</table>

## 功能一览

**AI 服务商**
- 14+ 预设服务商：Anthropic、OpenAI、DeepSeek、通义千问、Kimi、智谱 GLM、MiniMax、Venice、OpenRouter、Ollama
- 自定义服务商：兼容 OpenAI / Anthropic API 格式
- 官方 SVG Logo、最新模型 ID 预设、一键设为主模型

**消息渠道**
- 飞书（一键配置 + 自动安装插件）、Telegram、Discord、Slack、WhatsApp、iMessage、微信、钉钉
- 飞书自动修复：dmPolicy 和 allowFrom 配置自动纠正

**服务管理**
- 启动 / 停止 / 重启 OpenClaw Gateway
- 实时日志查看、自动刷新
- Dashboard 一键打开 + Token 自动复制到剪贴板

**系统诊断**
- 环境检查：Node.js、OpenClaw 安装状态、AI 配置检测
- 智能检测：同时检查 env 文件和 openclaw.json 中的模型配置
- 运行 `openclaw doctor` 全面诊断

**版本更新**
- 启动时自动检查新版本
- 一键更新 + 版本号自动刷新
- 更新完成后横幅自动消失

## 快速开始

### 下载安装

前往 [Releases](https://github.com/sheacoding/openclaw-manager-cn/releases) 下载对应平台的安装包：

| 平台 | 格式 |
|------|------|
| macOS (Intel + Apple Silicon) | `.dmg` |
| Windows | `.msi` / `.exe` |
| Linux | `.deb` / `.AppImage` |

### macOS 首次运行

macOS Gatekeeper 会阻止未签名应用，执行以下命令解除限制：

```bash
xattr -cr /Applications/OpenClaw\ Manager.app
```

或打开 **系统设置 > 隐私与安全性**，找到被阻止的应用，点击 **仍要打开**。

### 配置 AI 服务商

1. 打开应用，进入 **AI 模型配置** 页面
2. 点击 **添加 AI 服务商**
3. 选择预设服务商或添加自定义服务商
4. 填入 API Key，选择模型
5. 设为主模型

### 配置飞书

1. 进入 **消息渠道** > **飞书**
2. 填入 App ID 和 App Secret（[飞书配置指南](src-tauri/docs/feishu-setup.md)）
3. 保存 —— 应用会自动设置 dmPolicy、allowFrom、安装飞书插件

## 从源码构建

### 环境要求

- **Node.js** >= 22
- **Rust** >= 1.70
- **npm**

### 平台依赖

```bash
# macOS
xcode-select --install

# Ubuntu / Debian
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev \
  libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev patchelf
```

Windows 需安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 和 [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)。

### 开发与构建

```bash
# 克隆项目
git clone https://github.com/sheacoding/openclaw-manager-cn.git
cd openclaw-manager-cn

# 安装依赖
npm install

# 开发模式（热重载）
npm run tauri:dev

# 构建发布版本
npm run tauri:build
```

## 项目结构

```
openclaw-manager-cn/
├── src/                          # React 前端
│   ├── App.tsx                   # 入口 + 更新检查
│   ├── assets/providers/         # AI 服务商官方 Logo (SVG)
│   ├── components/
│   │   ├── Layout/               # 布局 (Header + Sidebar)
│   │   ├── Dashboard/            # 仪表盘 + 快捷操作
│   │   ├── AIConfig/             # AI 服务商配置 + ProviderLogo
│   │   ├── Channels/             # 消息渠道配置
│   │   ├── Testing/              # 系统诊断
│   │   ├── Logs/                 # 日志查看器
│   │   ├── Settings/             # 设置 (身份配置)
│   │   └── Setup/                # 初始化向导
│   ├── stores/appStore.ts        # Zustand 全局状态
│   └── lib/logger.ts             # 前端日志
│
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── main.rs               # Tauri 入口 + 插件注册
│   │   ├── commands/
│   │   │   ├── config.rs         # 配置管理 + AI 服务商预设
│   │   │   ├── service.rs        # 服务生命周期管理
│   │   │   ├── process.rs        # 进程与环境检查
│   │   │   ├── diagnostics.rs    # 系统诊断
│   │   │   └── installer.rs      # 安装 / 更新 / 版本检查
│   │   ├── models/               # 数据模型
│   │   └── utils/                # 工具 (平台检测、Shell、文件)
│   ├── docs/feishu-setup.md      # 飞书配置指南
│   └── tauri.conf.json           # Tauri 配置
│
├── .github/workflows/build.yml   # CI/CD 三平台自动构建
└── package.json
```

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 桌面框架 | Tauri 2.0 | 跨平台原生应用 |
| 前端 | React 18 + TypeScript | 用户界面 |
| 状态管理 | Zustand | 轻量全局状态 |
| 样式 | TailwindCSS | 原子化 CSS |
| 动画 | Framer Motion | 界面动效 |
| 图标 | Lucide React | UI 图标 |
| 后端 | Rust | 系统调用、进程管理、配置读写 |
| CI/CD | GitHub Actions | 三平台自动构建与发布 |

## 配置文件

所有运行时配置存储在 `~/.openclaw/` 目录：

```
~/.openclaw/
├── openclaw.json       # 主配置（models、channels、agents、plugins）
├── env                 # 环境变量（可选，API Keys 也可直接写在 openclaw.json）
├── gateway_token       # Gateway 认证 Token
├── workspace/
│   ├── USER.md         # 用户身份配置（名字、称呼、时区）
│   └── IDENTITY.md     # AI 助手身份配置
└── logs/               # 服务日志
```

## 贡献

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'feat: your feature'`)
4. 推送分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

## 相关链接

- [OpenClaw Manager 上游](https://github.com/miaoxworld/openclaw-manager) - 原版项目
- [OpenClaw Installer](https://github.com/miaoxworld/OpenClawInstaller) - 命令行安装工具
- [飞书配置指南](src-tauri/docs/feishu-setup.md) - 飞书机器人详细配置步骤
- [Tauri 2.0 文档](https://v2.tauri.app/)

## 许可证

MIT License - 详见 [LICENSE](LICENSE)
