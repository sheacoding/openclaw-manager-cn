# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# OpenClaw Manager - 跨平台 AI 助手管理工具

Tauri 2.0 + React 18 + TypeScript + Rust + Zustand + TailwindCSS + Framer Motion

## 开发命令

```bash
# 开发模式（热重载，同时启动前端和 Tauri）
npm run tauri:dev

# 仅前端开发（不启动 Tauri）
npm run dev

# 构建前端
npm run build

# 构建完整应用（生成 .dmg/.msi/.deb）
npm run tauri:build

# Rust 代码检查
cd src-tauri && cargo check

# Rust 测试
cd src-tauri && cargo test

# Rust 格式化
cd src-tauri && cargo fmt

# Rust Clippy 检查
cd src-tauri && cargo clippy
```

## 架构概览

### 双层架构

**前端层 (React)**
- 用户界面渲染
- 状态管理 (Zustand)
- 通过 `@tauri-apps/api` 调用后端命令

**后端层 (Rust)**
- 系统级操作（进程管理、文件读写、Shell 执行）
- 通过 Tauri Commands 暴露接口给前端
- 配置文件管理（`~/.openclaw/` 目录）

### Tauri Commands 分类

所有命令定义在 `src-tauri/src/commands/` 下，按职责分为 5 个模块：

1. **service.rs** - 服务生命周期管理
   - `get_service_status` - 获取服务状态（端口、PID、内存、运行时间）
   - `start_service` / `stop_service` / `restart_service` - 服务控制
   - `get_logs` - 读取服务日志

2. **process.rs** - 进程与环境检查
   - `check_openclaw_installed` - 检查 OpenClaw 是否安装
   - `get_openclaw_version` - 获取版本号
   - `check_port_in_use` - 端口占用检测

3. **config.rs** - 配置文件 CRUD
   - `get_config` / `save_config` - 主配置文件操作
   - `get_env_value` / `save_env_value` - 环境变量管理
   - `get_ai_providers` / `save_provider` / `delete_provider` - AI 提供商配置
   - `get_channels_config` / `save_channel_config` - 消息渠道配置
   - `get_or_create_gateway_token` - Gateway Token 生成
   - **飞书特殊处理**：自动设置 `dmPolicy: "open"` 和 `allowFrom: ["*"]` 确保消息接收正常

4. **diagnostics.rs** - 诊断与测试
   - `run_doctor` - 系统环境全面检查
   - `test_ai_connection` - AI 提供商连通性测试
   - `test_channel` - 消息渠道测试
   - `get_system_info` - 系统信息（OS、CPU、内存）

5. **installer.rs** - 安装与更新
   - `check_environment` - 检查 Node.js 环境
   - `install_nodejs` / `install_openclaw` - 自动安装
   - `check_openclaw_update` / `update_openclaw` - 版本更新
   - `uninstall_openclaw` - 卸载

### 前端组件结构

```
src/components/
├── Layout/          # 应用框架（Header + Sidebar + 内容区）
├── Dashboard/       # 仪表盘（服务状态、快捷操作、系统信息）
├── AIConfig/        # AI 提供商配置（14+ 提供商，自定义 API）
├── Channels/        # 消息渠道配置（Telegram、飞书、Discord 等）
├── Service/         # 服务管理（启动/停止/重启/日志）
├── Testing/         # 诊断测试（系统检查、AI 测试、渠道测试）
├── Logs/            # 日志查看器
├── Settings/        # 应用设置
└── Setup/           # 初始化向导
```

### 状态管理 (Zustand)

单一全局 Store：`src/stores/appStore.ts`

```typescript
{
  serviceStatus: ServiceStatus | null,    // 服务状态
  systemInfo: SystemInfo | null,          // 系统信息
  loading: boolean,                       // 全局加载状态
  notifications: Notification[],          // 通知队列
}
```

**关键模式**：
- 组件通过 `useAppStore()` 访问状态
- 后端数据通过 `setServiceStatus` / `setSystemInfo` 更新
- 通知系统通过 `addNotification` / `removeNotification` 管理

### 配置文件位置

所有配置存储在 `~/.openclaw/` 目录：

```
~/.openclaw/
├── config.json          # 主配置文件
├── env                  # 环境变量（AI API Keys、渠道 Tokens）
├── gateway_token        # Gateway Token
└── logs/                # 服务日志
```

## 关键设计模式

### 1. Tauri Command 调用模式

前端通过 `invoke` 调用后端命令：

```typescript
import { invoke } from '@tauri-apps/api/core';

const status = await invoke<ServiceStatus>('get_service_status');
```

### 2. 错误处理

后端使用 `thiserror` 定义错误类型，前端通过 `try-catch` 捕获：

```typescript
try {
  await invoke('start_service');
} catch (error) {
  console.error('启动失败:', error);
}
```

### 3. 平台特定代码

macOS 特定功能使用条件编译：

```rust
#[cfg(target_os = "macos")]
use cocoa::...;
```

### 4. Shell 命令执行

通过 `tauri-plugin-shell` 执行系统命令：

```rust
use tauri_plugin_shell::ShellExt;

let output = app.shell()
    .command("openclaw")
    .args(["--version"])
    .output()
    .await?;
```

## 构建与发布

### 发布配置

- **Release Profile** (`Cargo.toml`):
  - `lto = true` - 链接时优化
  - `opt-level = "s"` - 优化体积
  - `strip = true` - 移除调试符号
  - `codegen-units = 1` - 单编译单元（更好优化）

### 构建产物

运行 `npm run tauri:build` 后生成：

- **macOS**: `src-tauri/target/release/bundle/dmg/` 和 `.app`
- **Windows**: `src-tauri/target/release/bundle/msi/` 和 `.exe`
- **Linux**: `src-tauri/target/release/bundle/deb/` 和 `.AppImage`

### macOS 签名与公证

当前未配置代码签名，用户需要执行：

```bash
xattr -cr /Applications/OpenClaw\ Manager.app
```

## 开发注意事项

### Tauri 安全限制

- **Shell 命令白名单**: 在 `tauri.conf.json` 的 `plugins.shell.scope` 中配置允许的命令
- **文件系统访问**: 在 `plugins.fs.scope` 中配置允许的路径

### 跨平台兼容性

- 使用 `dirs` crate 获取跨平台路径（`home_dir()`, `config_dir()`）
- Shell 命令需要考虑 Windows/Unix 差异（如路径分隔符）
- 进程管理在不同平台有不同实现（`ps` vs `tasklist`）

### 性能优化

- 避免频繁调用 Tauri Commands（每次调用有序列化开销）
- 大量数据传输考虑使用文件中转而非直接返回
- 日志读取使用流式处理而非一次性加载

### 调试技巧

- 前端：浏览器 DevTools（`npm run tauri:dev` 自动打开）
- 后端：通过 `log::info!()` / `log::error!()` 输出到控制台
- 环境变量 `RUST_LOG=debug` 可启用详细日志

## 常见问题

### 1. 服务启动失败

检查：
- OpenClaw 是否已安装（`which openclaw`）
- 端口是否被占用（默认 18789）
- 环境变量是否正确配置（`~/.openclaw/env`）

### 2. 配置文件损坏

删除 `~/.openclaw/config.json` 后重启应用会自动重建。

### 3. 飞书消息无法接收

**症状**：飞书 APP 给机器人发消息无反应

**根本原因**：`dmPolicy` 配置错误或 `allowFrom` 格式不正确

**自动修复**：v0.0.7+ 版本已自动处理
- 保存飞书配置时自动设置 `dmPolicy: "open"`
- 自动将 `allowFrom` 转换为数组格式 `["*"]`
- 自动安装飞书官方插件

**手动修复**（旧版本）：
```bash
# 编辑配置文件
vim ~/.openclaw/openclaw.json

# 修改飞书配置
{
  "channels": {
    "feishu": {
      "enabled": true,
      "dmPolicy": "open",        # 改为 "open"
      "allowFrom": ["*"],        # 改为数组格式
      ...
    }
  }
}
```

### 4. macOS 权限问题

需要授予 "完全磁盘访问权限"（系统偏好设置 > 隐私与安全性）。

### 5. Rust 编译错误

需要授予 "完全磁盘访问权限"（系统偏好设置 > 隐私与安全性）。

### 4. Rust 编译错误

确保 Rust 版本 >= 1.70：

```bash
rustup update stable
```

## 相关资源

- [Tauri 2.0 文档](https://v2.tauri.app/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [OpenClaw 项目](https://github.com/miaoxworld/openclaw-manager)
