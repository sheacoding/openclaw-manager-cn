# 飞书自动化配置方案

## 问题

用户配置飞书后无法接收消息，根本原因：
- `dmPolicy` 需要设置为 `"open"`
- `allowFrom` 必须是数组格式 `["*"]`，不能是字符串

## 解决方案

### 1. 后端自动修复 (config.rs)

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

### 2. 前端 UI 增强 (Channels/index.tsx)

添加 `dmPolicy` 字段到飞书配置表单：

```typescript
{ key: 'dmPolicy', label: '私聊策略', type: 'select', options: [
  { value: 'open', label: '开放模式 (推荐)' },
  { value: 'pairing', label: '配对模式' },
  { value: 'allowlist', label: '白名单模式' },
  { value: 'disabled', label: '禁用' },
]},
```

### 3. 自动安装插件 (Channels/index.tsx)

保存飞书配置后自动检查并安装官方插件：

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

## 用户体验

**Before**：
1. 配置飞书 → 2. 消息无反应 → 3. 手动修改配置文件 → 4. 重启服务

**After**：
1. 配置飞书 → 2. 点击保存 → 3. ✨ 自动修复 + 自动安装插件 → 4. 立即可用

## 技术细节

### 配置格式

正确的飞书配置格式：

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxx",
      "appSecret": "xxx",
      "connectionMode": "websocket",
      "domain": "feishu",
      "dmPolicy": "open",
      "allowFrom": ["*"],
      "requireMention": false
    }
  }
}
```

### 关键点

1. **dmPolicy**: 必须是 `"open"` 才能接收所有消息
2. **allowFrom**: 必须是数组 `["*"]`，不能是字符串 `"*"`
3. **插件**: 使用官方插件 `@larksuite/openclaw-lark-tools`

## 测试验证

```bash
# 前端编译
npm run build
✓ built in 1.19s

# 后端编译
cargo check
✓ Finished in 1.61s

# 完整构建
npm run tauri:build
```

## 相关文件

- `src-tauri/src/commands/config.rs` (lines 968-997) - 自动修复逻辑
- `src/components/Channels/index.tsx` (lines 110-132, 461-475) - UI + 自动安装
- `CLAUDE.md` - 文档更新
- `CHANGELOG_CN_OPTIMIZATION.md` - 详细变更日志
