import { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { useSettingsStore } from '../settingsStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { deepseekApiKey, setDeepseekApiKey } = useSettingsStore();
  const [apiKey, setApiKey] = useState(deepseekApiKey);

  useEffect(() => {
    setApiKey(deepseekApiKey);
  }, [deepseekApiKey]);

  const handleSave = () => {
    setDeepseekApiKey(apiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Key size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">API Key 设置</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DeepSeek API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入你的 DeepSeek API Key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">如何获取 API Key？</h3>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>访问 <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="underline">platform.deepseek.com</a></li>
              <li>注册/登录你的账号</li>
              <li>进入 API Keys 页面创建新的 API Key</li>
              <li>复制 API Key 并粘贴到上方输入框</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
