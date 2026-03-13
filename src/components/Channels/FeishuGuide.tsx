/**
 * [INPUT]: 依赖 @tauri-apps/api/core 的 invoke，依赖 react 的 useState/useEffect
 * [OUTPUT]: 对外提供 FeishuGuide 组件，渲染飞书配置指南文档
 * [POS]: components/Channels 的子组件，负责展示飞书配置文档
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Loader2 } from 'lucide-react';

// ============================================================================
// 组件定义
// ============================================================================

export function FeishuGuide() {
  const [doc, setDoc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await invoke<string>('get_feishu_setup_doc');
      setDoc(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/30">
        <p className="text-red-400">加载文档失败: {error}</p>
        <button
          onClick={loadDocument}
          className="mt-4 btn-secondary text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <div className="flex items-center gap-2 mb-6 text-blue-400">
        <BookOpen size={24} />
        <h2 className="text-xl font-semibold m-0">飞书机器人配置指南</h2>
      </div>
      <ReactMarkdown
        components={{
          // 自定义样式
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-gray-700 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-200 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300">
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-dark-600 rounded text-blue-400 text-sm">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-4 bg-dark-600 rounded-lg text-gray-300 text-sm overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-500/10 rounded-r text-gray-300 mb-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-dark-600">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-dark-600/50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-gray-200 font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-300">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="border-gray-700 my-6" />
          ),
        }}
      >
        {doc}
      </ReactMarkdown>
    </div>
  );
}
