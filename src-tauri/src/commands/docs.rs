/**
 * [INPUT]: 依赖 tauri::command 用于命令导出
 * [OUTPUT]: 对外提供 get_feishu_setup_doc 命令，返回飞书配置文档内容
 * [POS]: commands 模块的文档子模块，负责嵌入和提供静态文档内容
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

use tauri::command;

// ============================================================================
// 嵌入静态文档
// ============================================================================

/// 飞书配置指南文档（Markdown 格式）
const FEISHU_SETUP_DOC: &str = include_str!("../../docs/feishu-setup.md");

// ============================================================================
// Tauri Commands
// ============================================================================

/// 获取飞书配置指南文档
///
/// # Returns
/// - `Ok(String)` - 文档内容（Markdown 格式）
/// - `Err(String)` - 错误信息（理论上不会失败，因为文档是编译时嵌入的）
#[command]
pub async fn get_feishu_setup_doc() -> Result<String, String> {
    Ok(FEISHU_SETUP_DOC.to_string())
}
