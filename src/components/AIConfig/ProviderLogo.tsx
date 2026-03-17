/**
 * [INPUT]: 依赖 src/assets/providers/*.svg 图标资源
 * [OUTPUT]: 对外提供 ProviderLogo 组件
 * [POS]: AIConfig 的 Provider Logo 渲染器，替代 emoji 图标
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import claudeLogo from '../../assets/providers/claude-color.svg';
import openaiLogo from '../../assets/providers/openai.svg';
import moonshotLogo from '../../assets/providers/moonshot.svg';
import qwenLogo from '../../assets/providers/qwen-color.svg';
import deepseekLogo from '../../assets/providers/deepseek-color.svg';
import zhipuLogo from '../../assets/providers/zhipu-color.svg';
import minimaxLogo from '../../assets/providers/minimax-color.svg';
import openrouterLogo from '../../assets/providers/openrouter.svg';
import ollamaLogo from '../../assets/providers/ollama.svg';

// ============ Provider ID -> Logo 映射 ============

const PROVIDER_LOGOS: Record<string, string> = {
  anthropic: claudeLogo,
  openai: openaiLogo,
  moonshot: moonshotLogo,
  qwen: qwenLogo,
  deepseek: deepseekLogo,
  glm: zhipuLogo,
  minimax: minimaxLogo,
  openrouter: openrouterLogo,
  ollama: ollamaLogo,
};

// ============ 兜底背景色 ============

const FALLBACK_COLORS: Record<string, string> = {
  venice: '#1B2838',
};

interface ProviderLogoProps {
  providerId: string;
  size?: number;
  className?: string;
}

export function ProviderLogo({ providerId, size = 24, className = '' }: ProviderLogoProps) {
  const logo = PROVIDER_LOGOS[providerId];

  if (logo) {
    return (
      <img
        src={logo}
        alt={providerId}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // 无 logo 时用首字母兜底
  const bg = FALLBACK_COLORS[providerId] || '#374151';
  return (
    <div
      className={`flex items-center justify-center rounded-md text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: size * 0.45,
      }}
    >
      {providerId.charAt(0).toUpperCase()}
    </div>
  );
}
