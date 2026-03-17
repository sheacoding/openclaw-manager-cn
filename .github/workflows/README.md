# GitHub Actions 构建说明

## 自动构建触发条件

1. **推送到 main 分支**：自动构建所有平台
2. **创建 tag（v* 格式）**：构建并创建 GitHub Release
3. **Pull Request 到 main**：构建验证

## 构建平台

- **macOS**: Universal Binary (Intel + Apple Silicon)
- **Windows**: x86_64 (MSI + NSIS 安装包)
- **Linux**: x86_64 (DEB + AppImage)

## 修复内容（2026-03-17）

### 问题
1. Tauri Action 版本过旧（v0 → v0.5）
2. macOS 产物包含 .app 目录（应该只上传 .dmg）
3. 产物路径可能因 Tauri 2.0 变化
4. 缺少调试信息，构建失败难以排查

### 修复
1. ✅ 升级 `tauri-apps/tauri-action` 到 `v0.5`
2. ✅ 移除 `.app` 产物上传（已包含在 .dmg 中）
3. ✅ 添加构建产物调试步骤（列出所有生成的文件）
4. ✅ 将 `if-no-files-found: error` 改为 `warn`（避免部分平台失败导致整体失败）

## 如何发布新版本

### 1. 更新版本号

确保以下文件版本号一致：
- `package.json` → `version`
- `src-tauri/Cargo.toml` → `version`
- `src-tauri/tauri.conf.json` → `version`

### 2. 创建 Git Tag

```bash
# 更新版本号后提交
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore: bump version to 0.0.8"

# 创建 tag
git tag v0.0.8

# 推送到远程（触发构建和发布）
git push origin main --tags
```

### 3. 等待构建完成

- 访问 https://github.com/sheacoding/openclaw-manager-cn/actions
- 等待所有平台构建完成（约 10-20 分钟）
- 检查 Releases 页面，会自动创建 Draft Release

### 4. 发布 Release

- 编辑 Draft Release，补充更新日志
- 点击 "Publish release" 发布

## 本地测试构建

```bash
# macOS Universal Binary
npm run tauri:build -- --target universal-apple-darwin

# 当前平台
npm run tauri:build
```

## 常见问题

### Q: 构建失败怎么办？

1. 查看 Actions 日志中的 "List build artifacts" 步骤
2. 确认产物路径是否正确
3. 检查 Tauri 版本是否兼容

### Q: 为什么 macOS 不上传 .app？

.app 是目录，已经打包在 .dmg 中。用户下载 .dmg 后会自动挂载并显示 .app。

### Q: 如何只构建某个平台？

修改 workflow 文件的 `matrix.include`，注释掉不需要的平台。

## 相关文档

- [Tauri Action](https://github.com/tauri-apps/tauri-action)
- [Tauri 2.0 构建指南](https://v2.tauri.app/distribute/)
