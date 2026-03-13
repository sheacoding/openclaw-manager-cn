# 中国本土化优化变更日志

## v0.0.7 - 飞书配置自动化 (2026-03-13)

### 🎯 核心改进

#### 1. 飞书配置自动修复
**问题**：用户配置飞书后无法接收消息，需要手动修改配置文件

**解决方案**：
- 在 `save_channel_config` 中添加飞书特殊处理逻辑
- 自动设置 `dmPolicy: "open"` （如果未设置）
- 自动将 `allowFrom` 转换为数组格式 `["*"]`
- 当 `dmPolicy` 为 "open" 时，强制设置 `allowFrom: ["*"]`

**代码位置**：
- `src-tauri/src/commands/config.rs` (lines 968-997)

**技术细节**：
```rust
// 飞书特殊处理：确保 allowFrom 是数组格式，dmPolicy 有默认值
if channel.id == "feishu" {
    // 默认 dmPolicy 为 "open"
    if channel_obj.get("dmPolicy").is_none() {
        channel_obj["dmPolicy"] = json!("open");
    }

    // 确保 allowFrom 是数组格式
    let allow_from_value = channel_obj.get("allowFrom").cloned();
    if let Some(allow_from) = allow_from_value {
        if allow_from.is_string() {
            let allow_str = allow_from.as_str().unwrap_or("*");
            channel_obj["allowFrom"] = json!([allow_str]);
        }
    } else {
        channel_obj["allowFrom"] = json!(["*"]);
    }

    // open 模式强制使用 ["*"]
    if channel_obj.get("dmPolicy").and_then(|v| v.as_str()) == Some("open") {
        channel_obj["allowFrom"] = json!(["*"]);
    }
}
```

#### 2. 飞书 UI 配置增强
**改进**：添加 `dmPolicy` 字段到飞书配置表单

**新增字段**：
- `dmPolicy` - 私聊策略选择器
  - 开放模式 (推荐) - 接收所有消息
  - 配对模式 - 需要配对
  - 白名单模式 - 仅白名单用户
  - 禁用 - 禁用私聊

**代码位置**：
- `src/components/Channels/index.tsx` (lines 110-132)

**用户体验**：
- 默认推荐"开放模式"
- 更新 helpText 说明推荐使用开放模式

#### 3. 飞书插件自动安装
**功能**：保存飞书配置后自动检查并安装官方插件

**实现逻辑**：
```typescript
// 如果是飞书渠道，自动检查并安装插件
if (channel.id === 'feishu') {
  const status = await invoke<FeishuPluginStatus>('check_feishu_plugin');
  if (!status.installed) {
    await invoke<string>('install_feishu_plugin');
    await checkFeishuPlugin();
  }
}
```

**代码位置**：
- `src/components/Channels/index.tsx` (lines 461-475)

**错误处理**：
- 插件安装失败不阻断配置保存
- 提示用户手动安装命令：`npx -y @larksuite/openclaw-lark-tools update`

### 📝 文档更新

#### 1. CLAUDE.md
- 添加飞书特殊处理说明
- 新增"飞书消息无法接收"常见问题
- 提供自动修复和手动修复方案

#### 2. 飞书配置指南
- 已存在完整的飞书配置文档：`src-tauri/docs/feishu-setup.md`
- 前端组件：`src/components/Channels/FeishuGuide.tsx`

### 🔧 技术债务

#### 已解决
- ✅ Rust 借用检查器错误 (E0502) - 使用 `.cloned()` 避免可变借用冲突
- ✅ 前端编译警告 - 无错误
- ✅ 后端编译警告 - 仅剩未使用函数警告（不影响功能）

#### 待优化
- [ ] 考虑将 `allowFrom` 字段也添加到 UI（当前自动处理）
- [ ] 添加飞书配置验证逻辑（检查 appId/appSecret 格式）
- [ ] 支持更多 dmPolicy 模式的详细说明

### 🎨 设计哲学

**现象层**：用户配置飞书后无法接收消息
**本质层**：OpenClaw 配置格式要求 `allowFrom` 必须是数组，`dmPolicy` 需要正确设置
**哲学层**：配置即约定，自动修复优于手动干预，让正确的事情自然发生

**Good Taste 原则**：
- 消除特殊情况：不需要用户理解 `allowFrom` 数组格式
- 自动化优于文档：代码自动修复配置，而非让用户阅读文档手动修改
- 渐进增强：旧版本用户可手动修复，新版本自动处理

### 🚀 用户影响

**Before**：
1. 用户配置飞书
2. 发现消息无法接收
3. 查看日志/文档
4. 手动编辑 `~/.openclaw/openclaw.json`
5. 修改 `dmPolicy` 和 `allowFrom`
6. 重启服务

**After**：
1. 用户配置飞书
2. 点击保存
3. ✨ 自动修复配置
4. ✨ 自动安装插件
5. 立即可用

### 📊 测试验证

**测试场景**：
1. ✅ 新用户首次配置飞书 - 自动设置正确配置
2. ✅ 用户选择不同 dmPolicy - 正确处理 allowFrom
3. ✅ 插件未安装 - 自动安装
4. ✅ 插件已安装 - 跳过安装
5. ✅ 插件安装失败 - 不阻断保存，提示手动安装

**编译验证**：
```bash
# 前端编译
npm run build
✓ built in 1.19s

# 后端编译
cargo check
Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.61s
```

### 🔗 相关文件

**修改的文件**：
- `src-tauri/src/commands/config.rs` - 飞书配置自动修复逻辑
- `src/components/Channels/index.tsx` - UI 增强 + 自动安装插件
- `CLAUDE.md` - 文档更新

**新增的文件**：
- `CHANGELOG_CN_OPTIMIZATION.md` - 本变更日志

**相关文档**：
- `src-tauri/docs/feishu-setup.md` - 飞书配置指南（已存在）
- `src/components/Channels/FeishuGuide.tsx` - 飞书文档渲染组件（已存在）

### 🎯 下一步计划

#### Phase 2: npm 镜像优化（已完成）
- ✅ 修改 `installer.rs` 使用淘宝镜像
- ✅ 修改飞书插件安装使用淘宝镜像

#### Phase 3: AI 端点验证（待确认）
- ⚠️ MiniMax 端点验证 - 需要确认官方文档

#### Phase 4: 其他渠道优化（可选）
- [ ] Telegram 配置优化
- [ ] Discord 配置优化
- [ ] 微信/钉钉配置指南

---

**变更作者**：Claude Code (Sonnet 4.6)
**变更日期**：2026-03-13
**版本号**：v0.0.7
