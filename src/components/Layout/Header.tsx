import { useState } from 'react';
import { PageType } from '../../App';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';

interface HeaderProps {
  currentPage: PageType;
}

const pageTitles: Record<PageType, { title: string; description: string }> = {
  dashboard: { title: '概览', description: '服务状态、日志与快捷操作' },
  ai: { title: 'AI 模型配置', description: '配置 AI 提供商和模型' },
  channels: { title: '消息渠道', description: '配置 Telegram、Discord、飞书等' },
  testing: { title: '测试诊断', description: '系统诊断与问题排查' },
  logs: { title: '应用日志', description: '查看 Manager 应用的控制台日志' },
  settings: { title: '设置', description: '身份配置与高级选项' },
};

export function Header({ currentPage }: HeaderProps) {
  const { title, description } = pageTitles[currentPage];
  const [opening, setOpening] = useState(false);

  const handleOpenDashboard = async () => {
    setOpening(true);

    try {
      // 步骤 1: 获取带 token 的 Dashboard URL
      console.log('[Dashboard] 正在获取 Dashboard URL...');
      const url = await invoke<string>('get_dashboard_url');
      console.log('[Dashboard] ✓ 获取成功:', url.substring(0, 60) + '...');

      // 步骤 2: 尝试使用 Tauri open API 打开
      try {
        await open(url);
        console.log('[Dashboard] ✓ 使用 Tauri open() 打开成功');
      } catch (openError) {
        // 如果 Tauri open 失败，使用 window.open（仍然带 token）
        console.warn('[Dashboard] Tauri open() 失败，使用 window.open:', openError);
        window.open(url, '_blank');
        console.log('[Dashboard] ✓ 使用 window.open() 打开成功');
      }
    } catch (e) {
      // 如果获取 URL 失败，尝试手动构建 URL
      console.error('[Dashboard] ✗ 获取 URL 失败:', e);

      try {
        // 尝试从配置文件读取 token
        console.log('[Dashboard] 尝试手动构建 URL...');
        const token = await invoke<string>('get_or_create_gateway_token');
        const manualUrl = `http://localhost:18789?token=${token}`;
        console.log('[Dashboard] ✓ 手动构建成功:', manualUrl.substring(0, 60) + '...');
        window.open(manualUrl, '_blank');
      } catch (tokenError) {
        // 最后的降级方案：打开不带 token 的 URL，让用户手动输入
        console.error('[Dashboard] ✗ 所有方案失败，使用最终降级方案:', tokenError);
        const fallbackUrl = 'http://localhost:18789';
        window.open(fallbackUrl, '_blank');
        alert('无法自动获取 Token，请在 Dashboard 页面手动输入 Token。\n\n可以在设置页面查看 Token。');
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <header className="h-14 bg-dark-800/50 border-b border-dark-600 flex items-center justify-between px-6 titlebar-drag backdrop-blur-sm">
      {/* 左侧：页面标题 */}
      <div className="titlebar-no-drag">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        <button
          onClick={() => window.location.reload()}
          className="icon-button text-gray-400 hover:text-white"
          title="刷新"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={handleOpenDashboard}
          disabled={opening}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          title="打开 Web Dashboard"
        >
          {opening ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
          <span>Dashboard</span>
        </button>
      </div>
    </header>
  );
}
